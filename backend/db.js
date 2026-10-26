/**
 * Database module for Iksan Wonkwang Local Life & Convenience Map
 * Updated with EXACT Kakao Maps Real-World Geolocation Coordinates,
 * Solo Household Specifications, and Dynamic 3-Axis Scoring Engine.
 */

const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');
const { extractInsightsFromReview } = require('./nlpExtractor');

const dbPath = path.join(__dirname, 'data', 'iksan_life_map.db');
const dataDir = path.join(__dirname, 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new DatabaseSync(dbPath);

// ----------------------------------------------------------------------------
// 1. 접근성 거리 점수 산출 로직 (원광대학교병원 기준)
// ----------------------------------------------------------------------------
/**
 * Distance Scoring Criteria (Base Location: Wonkwang University Hospital):
 * - 5 pts: <= 1.3 km
 * - 4 pts: 1.4 km ~ 1.8 km
 * - 3 pts: 1.9 km ~ 2.3 km
 * - 2 pts: 2.4 km ~ 2.8 km
 * - 1 pt : >= 2.9 km
 */
function calculateAccessibilityScore(distanceKm) {
  if (distanceKm <= 1.3) return 5.0;
  if (distanceKm <= 1.8) return 4.0;
  if (distanceKm <= 2.3) return 3.0;
  if (distanceKm <= 2.8) return 2.0;
  return 1.0;
}

// 거리 계산 헬퍼 (Haversine Formula - meters)
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// 테이블 초기화
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS campus_reference_nodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      node_name TEXT NOT NULL,
      node_type TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS place_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      icon_name TEXT
    );

    CREATE TABLE IF NOT EXISTS places (
      id TEXT PRIMARY KEY,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      road_address TEXT NOT NULL,
      dong TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      phone TEXT,
      is_daroum_accepted INTEGER DEFAULT 1,
      daroum_cashback_rate REAL DEFAULT 0.10,
      has_solo_seats INTEGER DEFAULT 1,
      is_single_order_allowed INTEGER DEFAULT 1,
      takeout_available INTEGER DEFAULT 1,
      single_portion_takeout INTEGER DEFAULT 1,
      takeout_discount_text TEXT,
      delivery_available INTEGER DEFAULT 0,
      min_delivery_amount INTEGER DEFAULT 0,
      delivery_fee INTEGER DEFAULT 0,
      delivery_info_text TEXT,
      solo_spec_summary TEXT,
      business_hours_text TEXT,
      today_status TEXT,
      photo_url TEXT,
      kakao_id TEXT UNIQUE,
      kakao_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      dimension TEXT NOT NULL,
      polarity TEXT NOT NULL,
      icon TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      nickname TEXT NOT NULL,
      verification_tier TEXT DEFAULT 'NONE',
      wku_verified INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      place_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      is_solo_visit INTEGER DEFAULT 1,
      cost_spent INTEGER,
      overall_rating REAL NOT NULL,
      content TEXT NOT NULL,
      reviewer_tier TEXT NOT NULL,
      weight_multiplier REAL DEFAULT 1.0,
      sentiment_score REAL DEFAULT 0.5,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS review_dimension_ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      review_id TEXT NOT NULL,
      dimension TEXT NOT NULL,
      score REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS review_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      review_id TEXT NOT NULL,
      tag_slug TEXT NOT NULL,
      source_type TEXT NOT NULL,
      confidence REAL DEFAULT 1.0
    );

    CREATE TABLE IF NOT EXISTS place_metrics_summary (
      place_id TEXT PRIMARY KEY,
      total_reviews INTEGER DEFAULT 0,
      composite_score REAL DEFAULT 0.0,
      access_score REAL DEFAULT 0.0,
      time_score REAL DEFAULT 0.0,
      stability_score REAL DEFAULT 0.0,
      distance_km REAL DEFAULT 0.0,
      solo_score REAL DEFAULT 0.0,
      cost_score REAL DEFAULT 0.0,
      convenience_score REAL DEFAULT 0.0,
      positive_ratio REAL DEFAULT 0.0,
      caution_flags_count INTEGER DEFAULT 0,
      best_quote TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS place_tag_aggregates (
      place_id TEXT NOT NULL,
      tag_slug TEXT NOT NULL,
      display_name TEXT NOT NULL,
      polarity TEXT NOT NULL,
      count INTEGER DEFAULT 1,
      is_official_badge INTEGER DEFAULT 0,
      PRIMARY KEY (place_id, tag_slug)
    );
  `);

  // 컬럼 마이그레이션 확인
  try { db.exec(`ALTER TABLE place_metrics_summary ADD COLUMN time_score REAL DEFAULT 0.0;`); } catch (e) {}
  try { db.exec(`ALTER TABLE place_metrics_summary ADD COLUMN stability_score REAL DEFAULT 0.0;`); } catch (e) {}
  try { db.exec(`ALTER TABLE place_metrics_summary ADD COLUMN distance_km REAL DEFAULT 0.0;`); } catch (e) {}
  try { db.exec(`ALTER TABLE places ADD COLUMN kakao_id TEXT;`); } catch (e) {}
  try { db.exec(`ALTER TABLE places ADD COLUMN kakao_url TEXT;`); } catch (e) {}
  try { db.exec(`ALTER TABLE places ADD COLUMN takeout_available INTEGER DEFAULT 1;`); } catch (e) {}
  try { db.exec(`ALTER TABLE places ADD COLUMN single_portion_takeout INTEGER DEFAULT 1;`); } catch (e) {}
  try { db.exec(`ALTER TABLE places ADD COLUMN takeout_discount_text TEXT;`); } catch (e) {}
  try { db.exec(`ALTER TABLE places ADD COLUMN delivery_available INTEGER DEFAULT 0;`); } catch (e) {}
  try { db.exec(`ALTER TABLE places ADD COLUMN min_delivery_amount INTEGER DEFAULT 0;`); } catch (e) {}
  try { db.exec(`ALTER TABLE places ADD COLUMN delivery_fee INTEGER DEFAULT 0;`); } catch (e) {}
  try { db.exec(`ALTER TABLE places ADD COLUMN delivery_info_text TEXT;`); } catch (e) {}
  try { db.exec(`ALTER TABLE places ADD COLUMN solo_spec_summary TEXT;`); } catch (e) {}

  // 신규 식자재마트 및 생필품 점포 존재 여부 확인 후 자동 재시딩
  const checkNewStore = db.prepare('SELECT id FROM places WHERE id = ?').get('food-sambo');
  if (!checkNewStore) {
    seedDatabase(true);
  }
}

// ----------------------------------------------------------------------------
// 2. 신규 데이터셋 시딩 (EXACT Kakao Maps Real-World Geolocation Coordinates)
// ----------------------------------------------------------------------------
function seedDatabase(forceClean = false) {
  console.log('[DB] Seeding updated dataset with EXACT Kakao Maps GPS Coordinates, Food Marts & Solo Specs...');

  if (forceClean) {
    db.exec(`
      DELETE FROM reviews;
      DELETE FROM review_dimension_ratings;
      DELETE FROM review_tags;
      DELETE FROM place_tag_aggregates;
      DELETE FROM place_metrics_summary;
      DELETE FROM places;
      DELETE FROM place_categories;
      DELETE FROM campus_reference_nodes;
      DELETE FROM tags;
      DELETE FROM users;
    `);
  }

  // 1. 캠퍼스 기준 거점 (7개 주요 지점)
  const insertNode = db.prepare(`
    INSERT INTO campus_reference_nodes (id, node_name, node_type, lat, lng, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertNode.run(1, '원광대학교병원 (Wonkwang Univ. Hospital)', 'HOSPITAL', 35.9685, 126.9582, '기본 기준 거점 (원광대학교병원 본관/정문 앞)');
  insertNode.run(2, '원광대 북문 (원룸촌)', 'GATE', 35.9723, 126.9568, '학생 자취 원룸 밀집 구역');
  insertNode.run(3, '신동 대학로 로데오거리', 'HUB', 35.9686, 126.9588, '식당/주점/무인인쇄 상권 메인 스트리트');
  insertNode.run(4, '원광대 정문 (남문)', 'GATE', 35.9650, 126.9550, '정문 및 대운동장 방면');
  insertNode.run(5, '모현동 원룸촌 (배산지구)', 'GATE', 35.9520, 126.9460, '모현동 신시가지 자취 원룸 밀집 구역');
  insertNode.run(6, '영등동 상권 중심 (영등2동)', 'HUB', 35.9580, 126.9720, '롯데마트 및 영등동 핵심 상권');
  insertNode.run(7, '익산역 KTX 광장', 'HUB', 35.9405, 126.9465, '익산역 서부광장 및 통학 셔틀 버스 승강장');

  // 2. 카테고리 (8개 핵심 1인가구 편의시설 분류)
  const insertCat = db.prepare(`INSERT INTO place_categories (id, slug, name, icon_name) VALUES (?, ?, ?, ?)`);
  insertCat.run(1, 'daiso', '다이소 / 생활용품', 'Sparkles');
  insertCat.run(2, 'mart', '대형마트 / 식료품', 'ShoppingBag');
  insertCat.run(3, 'market', '전통시장 / 장터', 'Store');
  insertCat.run(4, 'laundry', '24시 코인빨래방', 'Waves');
  insertCat.run(5, 'print', '24시 무인 프린트·복사', 'Printer');
  insertCat.run(6, 'pharmacy', '심야·주말 당번약국', 'HeartPulse');
  insertCat.run(7, 'food_mart', '식자재마트 / 대용량', 'Carrot');
  insertCat.run(8, 'essentials', '올리브영 / 생활잡화', 'Heart');

  // 3. 태그 마스터 (사용자 요청 명칭 정확 매칭 포함)
  const insertTag = db.prepare(`
    INSERT INTO tags (slug, display_name, dimension, polarity, icon)
    VALUES (?, ?, ?, ?, ?)
  `);
  const tagsData = [
    ['access_5pt', '#접근성_5점(<=1.3km)', 'ACCESSIBILITY', 'POSITIVE', 'MapPin'],
    ['access_4pt', '#접근성_4점(1.4~1.8km)', 'ACCESSIBILITY', 'POSITIVE', 'MapPin'],
    ['access_3pt', '#접근성_3점(1.9~2.3km)', 'ACCESSIBILITY', 'POSITIVE', 'MapPin'],
    ['access_2pt', '#접근성_2점(2.4~2.8km)', 'ACCESSIBILITY', 'POSITIVE', 'MapPin'],
    ['access_1pt', '#원거리_주의(>=2.9km)', 'ACCESSIBILITY', 'CAUTION', 'AlertTriangle'],
    ['time_5pt', '#심야쇼핑_충분(23시/24H)', 'OPERATING_HOURS', 'POSITIVE', 'Clock'],
    ['time_4pt', '#야간이용가능(22시)', 'OPERATING_HOURS', 'POSITIVE', 'Moon'],
    ['time_caution', '#조기마감_주의(18시)', 'OPERATING_HOURS', 'CAUTION', 'AlertCircle'],
    ['stability_high', '#연중무휴_안정영업', 'OPERATING_HOURS', 'POSITIVE', 'ShieldCheck'],
    ['stability_mart_holiday', '#일요일휴무', 'OPERATING_HOURS', 'CAUTION', 'Calendar'],
    ['stability_market_erratic', '#영업시간_변동심함(Caution)', 'OPERATING_HOURS', 'CAUTION', 'XCircle'],
    ['daroum_accepted', '#다로움결제가능', 'CONVENIENCE', 'POSITIVE', 'CreditCard'],
    ['open_24_hours', '#24시운영', 'OPERATING_HOURS', 'POSITIVE', 'Clock'],
    ['solo_1person_friendly', '#자취필수품', 'SOLO_SUITABILITY', 'POSITIVE', 'PackageCheck'],
    ['spacious_store', '#매장넓음', 'CONVENIENCE', 'POSITIVE', 'Maximize'],
    ['clearance_sale', '#마감세일', 'COST_BURDEN', 'POSITIVE', 'Tag'],
    ['mealkit_value', '#밀키트가성비', 'SOLO_SUITABILITY', 'POSITIVE', 'Utensils'],
    ['hub_location', '#상권중심', 'ACCESSIBILITY', 'POSITIVE', 'Compass'],
    ['variety_items', '#종류다양', 'CONVENIENCE', 'POSITIVE', 'Layers'],
    ['parking_easy', '#주차편의', 'CONVENIENCE', 'POSITIVE', 'Car'],
    ['north_gate_front', '#북문바로앞', 'ACCESSIBILITY', 'POSITIVE', 'MapPin'],
    ['night_weekend_open', '#야간주말운영', 'OPERATING_HOURS', 'POSITIVE', 'Moon'],
    ['friendly_service', '#친절함', 'SERVICE', 'POSITIVE', 'Smile'],
    ['laundry_bedding_best', '#이불빨래최적', 'CONVENIENCE', 'POSITIVE', 'Waves'],
    ['hot_dryer', '#실내건조', 'CONVENIENCE', 'POSITIVE', 'Wind'],
    ['single_print_ok', '#1장출력가능', 'SOLO_SUITABILITY', 'POSITIVE', 'FileText'],
    ['market_snack', '#시장분식', 'SOLO_SUITABILITY', 'POSITIVE', 'Coffee'],
    ['sidedish_good', '#반찬맛집', 'SOLO_SUITABILITY', 'POSITIVE', 'Utensils'],
    ['early_closing_caution', '#조기마감주의', 'OPERATING_HOURS', 'CAUTION', 'AlertCircle'],
    ['nobrand_value', '#노브랜드', 'COST_BURDEN', 'POSITIVE', 'ShoppingBag'],
    ['caution_min_two_orders', '#2인분이상_주문필수(주의)', 'SOLO_SUITABILITY', 'CAUTION', 'AlertTriangle'],
    ['delivery_available', '#자취배달_원룸촌직송', 'CONVENIENCE', 'POSITIVE', 'Bike'],
    ['traditional_market_voucher', '#온누리상품권_사용', 'CONVENIENCE', 'POSITIVE', 'Tag'],
    ['great_value_essentials', '#자취생필품_갓성비', 'COST_BURDEN', 'POSITIVE', 'PiggyBank'],
    ['laundry_bedding', '#대형이불_세탁열풍건조', 'CONVENIENCE', 'POSITIVE', 'Waves'],
    ['print_24h', '#24H_과제족보_1장출력', 'CONVENIENCE', 'POSITIVE', 'Printer'],
    ['night_pharmacy', '#365심야상비약_당번', 'CONVENIENCE', 'POSITIVE', 'HeartPulse']
  ];
  for (const t of tagsData) {
    insertTag.run(...t);
  }

  // 4. 장소 마스터 (EXACT Real-World Kakao Maps GPS Coordinates)
  const insertPlace = db.prepare(`
    INSERT INTO places (
      id, category_id, name, road_address, dong, lat, lng, phone,
      is_daroum_accepted, daroum_cashback_rate, has_solo_seats, is_single_order_allowed,
      takeout_available, single_portion_takeout, takeout_discount_text,
      delivery_available, min_delivery_amount, delivery_fee, delivery_info_text,
      solo_spec_summary, business_hours_text, today_status, photo_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const places = [
    {
      id: 'daiso-baesan',
      category_id: 1,
      name: '다이소 익산배산점 (Daiso Iksan Baesan)',
      road_address: '전북특별자치도 익산시 배산로 164 (모현동1가)',
      dong: '모현동',
      lat: 35.9482,
      lng: 126.9392,
      phone: '063-858-6016',
      is_daroum_accepted: 1,
      daroum_cashback_rate: 0.10,
      has_solo_seats: 1,
      is_single_order_allowed: 1,
      takeout_available: 1,
      single_portion_takeout: 1,
      takeout_discount_text: '익산다로움 결제 시 10% 캐시백 환급',
      delivery_available: 1,
      min_delivery_amount: 10000,
      delivery_fee: 3000,
      delivery_info_text: '다이소몰 택배배송 (원룸촌 배달팁 3,000원 / 3만원 이상 무료)',
      solo_spec_summary: '1인 가구 1,000원 균일가 소포장 식기·수납·욕실용품 완비 (자취생 필수)',
      business_hours_text: '매일 10:00 ~ 22:00 (연중무휴)',
      today_status: '영업 중 · 22:00 마감 (연중무휴)',
      photo_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop&q=80',
      scores: { access: 5.0, time: 4.0, stability: 5.0, avg: 4.67, dist: 1.3 }
    },
    {
      id: 'lotte-mart-iksan',
      category_id: 2,
      name: '롯데마트 익산점 (Lotte Mart Iksan)',
      road_address: '전북특별자치도 익산시 무왕로 1053 (영등동)',
      dong: '영등동',
      lat: 35.9565,
      lng: 126.9708,
      phone: '063-839-2500',
      is_daroum_accepted: 0,
      daroum_cashback_rate: 0.00,
      has_solo_seats: 1,
      is_single_order_allowed: 1,
      takeout_available: 1,
      single_portion_takeout: 1,
      takeout_discount_text: '롯데마트 매장 스마트픽 무료 픽업',
      delivery_available: 1,
      min_delivery_amount: 20000,
      delivery_fee: 3000,
      delivery_info_text: '롯데마트 오늘당일배송 (원룸촌 배달팁 3,000원 / 4만원 이상 무료배달)',
      solo_spec_summary: '1인용 소포장 밀키트·신선식품 코너 특화 (심야 23시까지 쇼핑 가능)',
      business_hours_text: '매일 10:00 ~ 23:00 (매월 둘째, 넷째 일요일 정기 휴무)',
      today_status: '영업 중 · 23:00 마감 (심야 장보기 가능)',
      photo_url: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=600&auto=format&fit=crop&q=80',
      scores: { access: 4.0, time: 5.0, stability: 3.0, avg: 4.00, dist: 1.7 }
    },
    {
      id: 'daiso-mohyeon',
      category_id: 1,
      name: '다이소 익산모현점 (Daiso Iksan Mohyeon)',
      road_address: '전북특별자치도 익산시 고현로 41 (모현동1가)',
      dong: '모현동',
      lat: 35.9515,
      lng: 126.9465,
      phone: '063-851-6016',
      is_daroum_accepted: 1,
      daroum_cashback_rate: 0.10,
      has_solo_seats: 1,
      is_single_order_allowed: 1,
      takeout_available: 1,
      single_portion_takeout: 1,
      takeout_discount_text: '익산다로움 10% 캐시백 적용',
      delivery_available: 0,
      min_delivery_amount: 0,
      delivery_fee: 0,
      delivery_info_text: '모현 중심상권 직접 방문 및 셀프 픽업 전용',
      solo_spec_summary: '자취방 원룸 소형 주방도구·욕실 정리함 1인 소량 구매 최적화',
      business_hours_text: '매일 10:00 ~ 22:00 (연중무휴)',
      today_status: '영업 중 · 22:00 마감 (연중무휴)',
      photo_url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
      scores: { access: 3.0, time: 4.0, stability: 5.0, avg: 4.00, dist: 2.0 }
    },
    {
      id: 'daiso-yeongdeung',
      category_id: 1,
      name: '다이소 익산영등점 (Daiso Iksan Yeongdeung)',
      road_address: '전북특별자치도 익산시 무왕로 1052 (영등동)',
      dong: '영등동',
      lat: 35.9578,
      lng: 126.9723,
      phone: '063-832-6016',
      is_daroum_accepted: 1,
      daroum_cashback_rate: 0.10,
      has_solo_seats: 1,
      is_single_order_allowed: 1,
      takeout_available: 1,
      single_portion_takeout: 1,
      takeout_discount_text: '익산다로움 충전금 10% 캐시백',
      delivery_available: 0,
      min_delivery_amount: 0,
      delivery_fee: 0,
      delivery_info_text: '영등동 대형 2개층 매장 현장 구매 전용',
      solo_spec_summary: '2층 대형 매장 규모로 자취방 수납박스·원룸 인테리어 재고 대량 보유',
      business_hours_text: '매일 10:00 ~ 22:00 (연중무휴)',
      today_status: '영업 중 · 22:00 마감 (연중무휴)',
      photo_url: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=600&auto=format&fit=crop&q=80',
      scores: { access: 4.0, time: 4.0, stability: 5.0, avg: 4.33, dist: 1.7 }
    },
    {
      id: 'emart-iksan',
      category_id: 2,
      name: '이마트 익산점 (Emart Iksan)',
      road_address: '전북특별자치도 익산시 평동로 705 (평화동)',
      dong: '평화동',
      lat: 35.9355,
      lng: 126.9625,
      phone: '063-839-1234',
      is_daroum_accepted: 0,
      daroum_cashback_rate: 0.00,
      has_solo_seats: 1,
      is_single_order_allowed: 1,
      takeout_available: 1,
      single_portion_takeout: 1,
      takeout_discount_text: '이마트 매장 픽업 고객센터 수령 가능',
      delivery_available: 1,
      min_delivery_amount: 30000,
      delivery_fee: 3000,
      delivery_info_text: 'SSG 쓱배송 지원 (원룸촌 배달팁 3,000원 / 4만원 이상 무료)',
      solo_spec_summary: '노브랜드(No Brand) 가성비 대용량 냉동식품 및 1인용 밀키트',
      business_hours_text: '매일 10:00 ~ 22:00 (매월 둘째, 넷째 일요일 정기 휴무)',
      today_status: '영업 중 · 22:00 마감 (대형마트 의무휴업 체크)',
      photo_url: 'https://images.unsplash.com/photo-1580913428708-c752711a5b28?w=600&auto=format&fit=crop&q=80',
      scores: { access: 1.0, time: 4.0, stability: 3.0, avg: 2.67, dist: 3.4 }
    },
    {
      id: 'seodong-market',
      category_id: 3,
      name: '서동시장 (Seodong Market)',
      road_address: '전북특별자치도 익산시 중앙로3길 38 (창인동1가)',
      dong: '창인동',
      lat: 35.9432,
      lng: 126.9538,
      phone: '063-855-8855',
      is_daroum_accepted: 1,
      daroum_cashback_rate: 0.10,
      has_solo_seats: 0,
      is_single_order_allowed: 1,
      takeout_available: 1,
      single_portion_takeout: 1,
      takeout_discount_text: '온누리상품권·익산다로움 결제 시 10% 실질 할인',
      delivery_available: 0,
      min_delivery_amount: 0,
      delivery_fee: 0,
      delivery_info_text: '전통시장 현장 장보기 전용 (배달 불가)',
      solo_spec_summary: '반찬가게 1팩 3,000원 / 4팩 10,000원 자취생 밑반찬 가성비 최상 (조기마감 주의)',
      business_hours_text: '매일 08:00 ~ 18:00 (점포별 상이, 저녁 조기 마감 주의)',
      today_status: '영업 마감 주의 · 18:00 전후 조기마감',
      photo_url: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=600&auto=format&fit=crop&q=80',
      scores: { access: 2.0, time: 2.0, stability: 1.0, avg: 1.67, dist: 2.6 }
    },
    {
      id: 'iksan-jungang-market',
      category_id: 3,
      name: '익산 중앙시장 (Iksan Jungang Market)',
      road_address: '전북특별자치도 익산시 중앙로 36 (창인동1가, 익산역 부근)',
      dong: '창인동',
      lat: 35.9425,
      lng: 126.9542,
      phone: '063-852-2580',
      is_daroum_accepted: 1,
      daroum_cashback_rate: 0.10,
      has_solo_seats: 0,
      is_single_order_allowed: 1,
      takeout_available: 1,
      single_portion_takeout: 1,
      takeout_discount_text: '온누리상품권 10% 할인 구매 사용 가능',
      delivery_available: 0,
      min_delivery_amount: 0,
      delivery_fee: 0,
      delivery_info_text: '전통시장 현장 장보기 전용 (배달 불가)',
      solo_spec_summary: '중앙시장 청년몰 및 1인 분식 소량 포장 (점포별 영업시간 변동 심함)',
      business_hours_text: '매일 08:30 ~ 18:30 (점포별 상이, 영업시간 변동 심함)',
      today_status: '영업시간 변동주의 · 18:30 전후 조기마감',
      photo_url: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?w=600&auto=format&fit=crop&q=80',
      scores: { access: 2.0, time: 2.0, stability: 1.0, avg: 1.67, dist: 2.8 }
    },
    {
      id: 'laundry-washenjoy',
      category_id: 4,
      name: '워시엔조이 24시 셀프빨래방 익산신동점 (WashEnjoy 24H)',
      road_address: '전북특별자치도 익산시 익산대로68길 35 (신동, 원광대 북문 원룸촌)',
      dong: '신동',
      lat: 35.9718,
      lng: 126.9572,
      phone: '063-853-2400',
      is_daroum_accepted: 1,
      daroum_cashback_rate: 0.10,
      has_solo_seats: 1,
      is_single_order_allowed: 1,
      takeout_available: 1,
      single_portion_takeout: 1,
      takeout_discount_text: 'VIP 멤버십 카드 충전 시 10% 추가 포인트 적립',
      delivery_available: 0,
      min_delivery_amount: 0,
      delivery_fee: 0,
      delivery_info_text: '24시간 무인 셀프빨래방 (원룸촌 도보 2분 셀프 픽업)',
      solo_spec_summary: '원룸 자취생 대형 이불빨래(20kg) 세탁+열풍건조 50분 완성, 운동화 전용 세탁기 완비',
      business_hours_text: '연중무휴 24시간 상시 운영 (무인 셀프)',
      today_status: '영업 중 · 24시간 연중무휴 (심야 이용 가능)',
      photo_url: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&auto=format&fit=crop&q=80',
      scores: { access: 5.0, time: 5.0, stability: 5.0, avg: 5.00, dist: 0.2 }
    },
    {
      id: 'print-cafe-wku',
      category_id: 5,
      name: '프린트카페 익산원광대점 (Print Cafe 24H)',
      road_address: '전북특별자치도 익산시 익산대로54길 44 (신동 대학로)',
      dong: '신동',
      lat: 35.9686,
      lng: 126.9588,
      phone: '070-4242-2424',
      is_daroum_accepted: 1,
      daroum_cashback_rate: 0.10,
      has_solo_seats: 1,
      is_single_order_allowed: 1,
      takeout_available: 1,
      single_portion_takeout: 1,
      takeout_discount_text: '신용/체크카드·삼성페이 1장(70원)부터 결제 가능',
      delivery_available: 0,
      min_delivery_amount: 0,
      delivery_fee: 0,
      delivery_info_text: '대학로 무인 프린트 (1장 70원 현장 즉시 셀프 출력)',
      solo_spec_summary: '흑백 70원 / 컬러 250원, 과제·기출 족보·포트폴리오 스프링 제본기 및 스테이플러 구비',
      business_hours_text: '연중무휴 24시간 상시 운영 (무인 인쇄)',
      today_status: '영업 중 · 24시간 연중무휴 (시험기간 야간 인쇄)',
      photo_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80',
      scores: { access: 5.0, time: 5.0, stability: 5.0, avg: 5.00, dist: 0.1 }
    },
    {
      id: 'pharmacy-daehak-onnuri',
      category_id: 6,
      name: '대학온누리약국 (Daehak Onnuri Pharmacy)',
      road_address: '전북특별자치도 익산시 익산대로 460 (신동, 원광대 북문 앞)',
      dong: '신동',
      lat: 35.9712,
      lng: 126.9565,
      phone: '063-855-5800',
      is_daroum_accepted: 1,
      daroum_cashback_rate: 0.10,
      has_solo_seats: 1,
      is_single_order_allowed: 1,
      takeout_available: 1,
      single_portion_takeout: 1,
      takeout_discount_text: '익산다로움 지역화폐 결제 10% 캐시백 환급',
      delivery_available: 0,
      min_delivery_amount: 0,
      delivery_fee: 0,
      delivery_info_text: '약사 복약지도 필수 (원대 북문 앞 방문 수령)',
      solo_spec_summary: '1인 자취생 필수 상비약(진통제, 종합감기약, 소화제, 파스) 소포장 완비, 심야 23시까지 운영',
      business_hours_text: '매일 08:30 ~ 23:00 (연중무휴 365일 심야·주말 당번약국)',
      today_status: '영업 중 · 23:00 마감 (365일 심야 당번약국)',
      photo_url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80',
      scores: { access: 5.0, time: 5.0, stability: 5.0, avg: 5.00, dist: 0.1 }
    },
    {
      id: 'hanaro-namjung',
      category_id: 2,
      name: '하나로마트 익산농협 남중점 (Hanaro Mart Namjung)',
      road_address: '전북특별자치도 익산시 선화로 387 (남중동)',
      dong: '남중동',
      lat: 35.9558,
      lng: 126.9532,
      phone: '063-855-3301',
      is_daroum_accepted: 1,
      daroum_cashback_rate: 0.10,
      has_solo_seats: 1,
      is_single_order_allowed: 1,
      takeout_available: 1,
      single_portion_takeout: 1,
      takeout_discount_text: '익산다로움 결제 시 10% 캐시백 즉시 환급',
      delivery_available: 1,
      min_delivery_amount: 30000,
      delivery_fee: 3000,
      delivery_info_text: '지역 당일배송 (3만원 이상 3,000원)',
      solo_spec_summary: '로컬푸드 1인용 소포장 채소 1,000원 균일가 코너, 익산다로움 10% 적립',
      business_hours_text: '매일 08:30 ~ 22:00 (연중무휴)',
      today_status: '영업 중 · 22:00 마감 (다로움 10% 환급)',
      photo_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
      scores: { access: 4.0, time: 4.0, stability: 5.0, avg: 4.33, dist: 1.5 }
    },
    {
      id: 'food-sambo',
      category_id: 7,
      name: '삼보식자재마트 신동점 (Sambo Food Mart)',
      road_address: '전북특별자치도 익산시 익산대로 422 (신동)',
      dong: '신동',
      lat: 35.9648,
      lng: 126.9525,
      phone: '063-854-3388',
      is_daroum_accepted: 1,
      daroum_cashback_rate: 0.10,
      has_solo_seats: 1,
      is_single_order_allowed: 1,
      takeout_available: 1,
      single_portion_takeout: 1,
      takeout_discount_text: '익산다로움 10% 환급 + 대용량 박스할인',
      delivery_available: 1,
      min_delivery_amount: 40000,
      delivery_fee: 3000,
      delivery_info_text: '자취방 대량구매 묶음배달 가능',
      solo_spec_summary: '원룸 룸메이트와 쟁여두는 대용량 냉동식품, 즉석식품, 음료수 최저가',
      business_hours_text: '매일 06:00 ~ 23:00 (연중무휴 아침일찍 오픈)',
      today_status: '영업 중 · 23:00 마감 (아침 6시 오픈)',
      photo_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop&q=80',
      scores: { access: 5.0, time: 5.0, stability: 5.0, avg: 5.00, dist: 0.7 }
    },
    {
      id: 'food-mohyeon',
      category_id: 7,
      name: '모현농민식자재마트 (Mohyeon Food Mart)',
      road_address: '전북특별자치도 익산시 선화로 95 (모현동2가)',
      dong: '모현동',
      lat: 35.9452,
      lng: 126.9365,
      phone: '063-858-9900',
      is_daroum_accepted: 1,
      daroum_cashback_rate: 0.10,
      has_solo_seats: 1,
      is_single_order_allowed: 1,
      takeout_available: 1,
      single_portion_takeout: 1,
      takeout_discount_text: '익산다로움 결제 10% 캐시백 적용',
      delivery_available: 1,
      min_delivery_amount: 50000,
      delivery_fee: 3000,
      delivery_info_text: '모현동 일대 트럭 배송',
      solo_spec_summary: '신선 정육·수산·계란 1판 초특가, 자취생 대용량 장보기 최적',
      business_hours_text: '매일 07:00 ~ 22:30 (연중무휴)',
      today_status: '영업 중 · 22:30 마감 (다로움 10% 환급)',
      photo_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
      scores: { access: 2.0, time: 4.0, stability: 5.0, avg: 3.67, dist: 2.7 }
    },
    {
      id: 'food-woori',
      category_id: 7,
      name: '우리식자재마트 영등점 (Woori 24H Food Mart)',
      road_address: '전북특별자치도 익산시 고봉로 319 (영등동)',
      dong: '영등동',
      lat: 35.9625,
      lng: 126.9755,
      phone: '063-831-7788',
      is_daroum_accepted: 1,
      daroum_cashback_rate: 0.10,
      has_solo_seats: 1,
      is_single_order_allowed: 1,
      takeout_available: 1,
      single_portion_takeout: 1,
      takeout_discount_text: '익산다로움 10% 환급',
      delivery_available: 1,
      min_delivery_amount: 30000,
      delivery_fee: 3000,
      delivery_info_text: '영등동 상권 묶음 직배송',
      solo_spec_summary: '24시간 심야 운영 대형 식자재 마트, 밤늦게 급한 식재료 및 간식 구매',
      business_hours_text: '24시간 연중무휴',
      today_status: '영업 중 · 24시간 연중무휴 (심야 장보기)',
      photo_url: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=600&auto=format&fit=crop&q=80',
      scores: { access: 3.0, time: 5.0, stability: 5.0, avg: 4.33, dist: 2.1 }
    },
    {
      id: 'oliveyoung-wonkwang',
      category_id: 8,
      name: '올리브영 원광대점 (Olive Young Wonkwang Univ.)',
      road_address: '전북특별자치도 익산시 익산대로54길 38 (신동 대학로)',
      dong: '신동',
      lat: 35.9689,
      lng: 126.9585,
      phone: '063-843-5290',
      is_daroum_accepted: 1,
      daroum_cashback_rate: 0.10,
      has_solo_seats: 1,
      is_single_order_allowed: 1,
      takeout_available: 1,
      single_portion_takeout: 1,
      takeout_discount_text: '올영세일 + 익산다로움 결제 시 10% 추가 환급',
      delivery_available: 1,
      min_delivery_amount: 20000,
      delivery_fee: 2500,
      delivery_info_text: '오늘드림 3시간 즉시배송 (3만원 이상 무료)',
      solo_spec_summary: '스킨케어, 샴푸·바디워시, 면도기, 비타민 영양제, 올리브영 오늘드림 3시간 즉시배달',
      business_hours_text: '매일 10:00 ~ 22:30 (연중무휴)',
      today_status: '영업 중 · 22:30 마감 (오늘드림 즉시배송)',
      photo_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
      scores: { access: 5.0, time: 4.0, stability: 5.0, avg: 4.67, dist: 0.1 }
    },
    {
      id: 'oliveyoung-yeongdeung',
      category_id: 8,
      name: '올리브영 익산영등점 (Olive Young Yeongdeung)',
      road_address: '전북특별자치도 익산시 무왕로 1062 (영등동)',
      dong: '영등동',
      lat: 35.9572,
      lng: 126.9712,
      phone: '063-832-5290',
      is_daroum_accepted: 1,
      daroum_cashback_rate: 0.10,
      has_solo_seats: 1,
      is_single_order_allowed: 1,
      takeout_available: 1,
      single_portion_takeout: 1,
      takeout_discount_text: '익산다로움 10% 캐시백 적용',
      delivery_available: 1,
      min_delivery_amount: 20000,
      delivery_fee: 2500,
      delivery_info_text: '올리브영 오늘드림 지원',
      solo_spec_summary: '영등동 최대 규모 뷰티·헬스·위생용품 라인업 구비',
      business_hours_text: '매일 10:00 ~ 22:30 (연중무휴)',
      today_status: '영업 중 · 22:30 마감 (영등동 중심)',
      photo_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
      scores: { access: 4.0, time: 4.0, stability: 5.0, avg: 4.33, dist: 1.7 }
    },
    {
      id: 'alpha-stationery',
      category_id: 8,
      name: '알파문구 익산신동점 (Alpha Stationery)',
      road_address: '전북특별자치도 익산시 익산대로 452 (신동)',
      dong: '신동',
      lat: 35.9702,
      lng: 126.9571,
      phone: '063-851-0982',
      is_daroum_accepted: 1,
      daroum_cashback_rate: 0.10,
      has_solo_seats: 1,
      is_single_order_allowed: 1,
      takeout_available: 1,
      single_portion_takeout: 1,
      takeout_discount_text: '익산다로움 10% 환급 + 현금 영수증',
      delivery_available: 0,
      min_delivery_amount: 0,
      delivery_fee: 0,
      delivery_info_text: '매장 직접 방문 구매',
      solo_spec_summary: '강의 노트, 필기도구, A4 용지 낱권, 테이프, 건전지, 생활공구 낱개 판매',
      business_hours_text: '평일 09:00 ~ 20:30, 토 10:00 ~ 18:00 (일요일 휴무)',
      today_status: '영업 중 · 20:30 마감 (일요일 휴무)',
      photo_url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80',
      scores: { access: 5.0, time: 3.0, stability: 4.0, avg: 4.00, dist: 0.2 }
    }
  ];

  for (const p of places) {
    insertPlace.run(
      p.id,
      p.category_id,
      p.name,
      p.road_address,
      p.dong,
      p.lat,
      p.lng,
      p.phone,
      p.is_daroum_accepted,
      p.daroum_cashback_rate,
      p.has_solo_seats,
      p.is_single_order_allowed,
      p.takeout_available,
      p.single_portion_takeout,
      p.takeout_discount_text,
      p.delivery_available,
      p.min_delivery_amount,
      p.delivery_fee,
      p.delivery_info_text,
      p.solo_spec_summary,
      p.business_hours_text,
      p.today_status,
      p.photo_url
    );
  }

  // 5. 사용자 시드
  const insertUser = db.prepare(`
    INSERT INTO users (id, nickname, verification_tier, wku_verified)
    VALUES (?, ?, ?, ?)
  `);
  insertUser.run('user-wku-hosp-01', '원대병원실습생', 'WONKWANG_STUDENT', 1);
  insertUser.run('user-wku-nurse-02', '원대간호자취러', 'WONKWANG_STUDENT', 1);
  insertUser.run('user-resident-03', '모현동주민', 'IKSAN_RESIDENT', 1);
  insertUser.run('user-wku-eng-04', '원대공대생', 'WONKWANG_STUDENT', 1);
  insertUser.run('user-yd-05', '영등동자취생', 'IKSAN_RESIDENT', 1);
  insertUser.run('user-is-06', '익산시민자취러', 'IKSAN_RESIDENT', 1);

  // 6. 새로운 리뷰 주입 (학생 생생 후기 & 3대 축 반영)
  const reviewsSeed = [
    {
      id: 'rev-daiso-baesan',
      place_id: 'daiso-baesan',
      user_id: 'user-wku-hosp-01',
      overall_rating: 4.5,
      content: '원대병원 기준 도보로 가기 편하고 매장이 엄청 커서 자취 필수품 다 있어요. 다로움 결제도 잘 됩니다!',
      reviewer_tier: 'WONKWANG_STUDENT',
      weight_multiplier: 1.3,
      ratings: { access: 5.0, time: 4.0, stability: 5.0 },
      tags: ['solo_1person_friendly', 'spacious_store', 'daroum_accepted']
    },
    {
      id: 'rev-lotte-mart',
      place_id: 'lotte-mart-iksan',
      user_id: 'user-wku-nurse-02',
      overall_rating: 4.0,
      content: '주말에 마감 세일 때 가면 밀키트나 신선식품 가성비 최고예요. 둘째/넷째 일요일 휴무 꼭 확인하세요.',
      reviewer_tier: 'WONKWANG_STUDENT',
      weight_multiplier: 1.3,
      ratings: { access: 4.0, time: 5.0, stability: 3.0 },
      tags: ['clearance_sale', 'mealkit_value', 'stability_mart_holiday']
    },
    {
      id: 'rev-daiso-mohyeon',
      place_id: 'daiso-mohyeon',
      user_id: 'user-resident-03',
      overall_rating: 4.0,
      content: '모현동 상권 중심에 있어서 생활용품 사기 편해요. 1인 가구 소형 식기랑 수납함 종류가 많아서 자취 시작할 때 필수 코스입니다.',
      reviewer_tier: 'IKSAN_RESIDENT',
      weight_multiplier: 1.2,
      ratings: { access: 3.0, time: 4.0, stability: 5.0 },
      tags: ['solo_1person_friendly', 'hub_location', 'daroum_accepted']
    },
    {
      id: 'rev-daiso-yeongdeung',
      place_id: 'daiso-yeongdeung',
      user_id: 'user-yd-05',
      overall_rating: 4.3,
      content: '영등동 상권 중심이라 식사하고 들르기 좋아요. 물건 종류가 익산에서 제일 많은 느낌입니다.',
      reviewer_tier: 'IKSAN_RESIDENT',
      weight_multiplier: 1.2,
      ratings: { access: 4.0, time: 4.0, stability: 5.0 },
      tags: ['hub_location', 'variety_items', 'parking_easy']
    },
    {
      id: 'rev-emart-iksan',
      place_id: 'emart-iksan',
      user_id: 'user-wku-hosp-01',
      overall_rating: 3.0,
      content: '원대병원에선 거리가 좀 있어서 뚜벅이는 가기 힘들지만 노브랜드 가성비 쟁여놓을 땐 쓱배송이나 차 타고 가기 좋아요.',
      reviewer_tier: 'WONKWANG_STUDENT',
      weight_multiplier: 1.3,
      ratings: { access: 1.0, time: 4.0, stability: 3.0 },
      tags: ['nobrand_value', 'mealkit_value', 'stability_mart_holiday']
    },
    {
      id: 'rev-seodong-market',
      place_id: 'seodong-market',
      user_id: 'user-wku-nurse-02',
      overall_rating: 3.5,
      content: '저녁 일찍 닫아서 아쉽지만 주말 낮에 분식이나 반찬 사러 가기 좋습니다. 다로움 환영해주심!',
      reviewer_tier: 'WONKWANG_STUDENT',
      weight_multiplier: 1.3,
      ratings: { access: 2.0, time: 2.0, stability: 1.0 },
      tags: ['market_snack', 'sidedish_good', 'early_closing_caution']
    },
    {
      id: 'rev-jungang-market',
      place_id: 'iksan-jungang-market',
      user_id: 'user-is-06',
      overall_rating: 3.5,
      content: '저녁 일찍 닫아서 아쉽지만 주말 낮에 분식이나 반찬 사러 가기 좋습니다. 다로움 환영해주심!',
      reviewer_tier: 'IKSAN_RESIDENT',
      weight_multiplier: 1.2,
      ratings: { access: 2.0, time: 2.0, stability: 1.0 },
      tags: ['market_snack', 'sidedish_good', 'early_closing_caution']
    },
    {
      id: 'rev-laundry-washenjoy',
      place_id: 'laundry-washenjoy',
      user_id: 'user-wku-hosp-01',
      overall_rating: 5.0,
      content: '원룸 세탁기로 이불빨래 불가능할 때 필수! 건조기 성능 좋아서 빨래 바짝 말라 냄새 안 나요.',
      reviewer_tier: 'WONKWANG_STUDENT',
      weight_multiplier: 1.3,
      ratings: { access: 5.0, time: 5.0, stability: 5.0 },
      tags: ['open_24_hours', 'laundry_bedding_best', 'hot_dryer']
    },
    {
      id: 'rev-print-cafe-wku',
      place_id: 'print-cafe-wku',
      user_id: 'user-wku-eng-04',
      overall_rating: 5.0,
      content: '원대 메인 대학로 바로 앞이라 시험기간이나 과제 출력할 때 24시간 1장 70원 카드결제돼서 최고입니다!',
      reviewer_tier: 'WONKWANG_STUDENT',
      weight_multiplier: 1.3,
      ratings: { access: 5.0, time: 5.0, stability: 5.0 },
      tags: ['open_24_hours', 'single_print_ok', 'hub_location']
    },
    {
      id: 'rev-pharmacy-daehak',
      place_id: 'pharmacy-daehak-onnuri',
      user_id: 'user-wku-nurse-02',
      overall_rating: 5.0,
      content: '원대 북문 바로 앞이라 야간이나 주말에 갑자기 아플 때 바로 약 살 수 있어서 자취생 생명줄이에요.',
      reviewer_tier: 'WONKWANG_STUDENT',
      weight_multiplier: 1.3,
      ratings: { access: 5.0, time: 5.0, stability: 5.0 },
      tags: ['north_gate_front', 'night_weekend_open', 'friendly_service']
    }
  ];

  const insertRev = db.prepare(`
    INSERT INTO reviews (id, place_id, user_id, is_solo_visit, cost_spent, overall_rating, content, reviewer_tier, weight_multiplier, sentiment_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertDim = db.prepare(`
    INSERT INTO review_dimension_ratings (review_id, dimension, score)
    VALUES (?, ?, ?)
  `);
  const insertRevTag = db.prepare(`
    INSERT INTO review_tags (review_id, tag_slug, source_type, confidence)
    VALUES (?, ?, ?, ?)
  `);

  for (const r of reviewsSeed) {
    const sentiment = r.overall_rating >= 3.5 ? 0.9 : -0.8;
    insertRev.run(
      r.id,
      r.place_id,
      r.user_id,
      1,
      null,
      r.overall_rating,
      r.content,
      r.reviewer_tier,
      r.weight_multiplier,
      sentiment
    );

    insertDim.run(r.id, 'ACCESSIBILITY', r.ratings.access);
    insertDim.run(r.id, 'TIME_SUFFICIENCY', r.ratings.time);
    insertDim.run(r.id, 'OPERATING_STABILITY', r.ratings.stability);

    for (const t of r.tags) {
      insertRevTag.run(r.id, t, 'USER_SELECTED', 1.0);
    }
  }

  // 7. 장소별 통계 및 배지 동기화
  for (const p of places) {
    recalculatePlaceMetrics(p.id, p.scores);
  }

  console.log('[DB] Seeding updated dataset with EXACT Kakao GPS completed successfully!');
}

// 장소 통계 요약 재계산 함수
function recalculatePlaceMetrics(placeId, precalculatedScores = null) {
  const reviews = db.prepare('SELECT * FROM reviews WHERE place_id = ?').all(placeId);

  // 1. 태그 집계
  const tagCounts = db.prepare(`
    SELECT rt.tag_slug, t.display_name, t.polarity, COUNT(*) as tag_count
    FROM review_tags rt
    JOIN tags t ON rt.tag_slug = t.slug
    JOIN reviews r ON rt.review_id = r.id
    WHERE r.place_id = ?
    GROUP BY rt.tag_slug, t.display_name, t.polarity
  `).all(placeId);

  let cautionCount = 0;
  db.prepare('DELETE FROM place_tag_aggregates WHERE place_id = ?').run(placeId);
  const insertAgg = db.prepare(`
    INSERT INTO place_tag_aggregates (place_id, tag_slug, display_name, polarity, count, is_official_badge)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const tc of tagCounts) {
    if (tc.polarity === 'CAUTION') cautionCount += tc.tag_count;
    insertAgg.run(placeId, tc.tag_slug, tc.display_name, tc.polarity, tc.tag_count, 1);
  }

  // 2. 점수 산출
  let accessScore = 3.0;
  let timeScore = 4.0;
  let stabilityScore = 4.0;
  let compositeScore = 3.67;
  let distanceKm = 2.0;
  let bestQuote = '';

  if (precalculatedScores) {
    accessScore = precalculatedScores.access;
    timeScore = precalculatedScores.time;
    stabilityScore = precalculatedScores.stability;
    compositeScore = precalculatedScores.avg;
    distanceKm = precalculatedScores.dist;
  } else {
    // 리뷰로부터 계산
    const dims = db.prepare(`
      SELECT rdr.dimension, AVG(rdr.score) as avg_score
      FROM review_dimension_ratings rdr
      JOIN reviews r ON rdr.review_id = r.id
      WHERE r.place_id = ?
      GROUP BY rdr.dimension
    `).all(placeId);

    for (const d of dims) {
      if (d.dimension === 'ACCESSIBILITY') accessScore = parseFloat(d.avg_score.toFixed(1));
      if (d.dimension === 'TIME_SUFFICIENCY') timeScore = parseFloat(d.avg_score.toFixed(1));
      if (d.dimension === 'OPERATING_STABILITY') stabilityScore = parseFloat(d.avg_score.toFixed(1));
    }
    compositeScore = parseFloat(((accessScore + timeScore + stabilityScore) / 3).toFixed(2));
  }

  if (reviews.length > 0) {
    bestQuote = reviews[0].content.slice(0, 115) + (reviews[0].content.length > 115 ? '...' : '');
  }

  const positiveReviewsCount = reviews.filter(r => r.overall_rating >= 3.5).length;
  const positiveRatio = reviews.length > 0 ? Math.round((positiveReviewsCount / reviews.length) * 100) : 100;

  db.prepare(`
    INSERT OR REPLACE INTO place_metrics_summary 
    (place_id, total_reviews, composite_score, access_score, time_score, stability_score, distance_km, solo_score, cost_score, convenience_score, positive_ratio, caution_flags_count, best_quote, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(
    placeId,
    reviews.length,
    compositeScore,
    accessScore,
    timeScore,
    stabilityScore,
    distanceKm,
    accessScore,
    timeScore,
    stabilityScore,
    positiveRatio,
    cautionCount,
    bestQuote
  );
}

// ----------------------------------------------------------------------------
// 3. Public API Functions
// ----------------------------------------------------------------------------

function getCampusNodes() {
  return db.prepare('SELECT * FROM campus_reference_nodes ORDER BY id ASC').all();
}

function getTags() {
  return db.prepare('SELECT * FROM tags ORDER BY dimension, polarity, id').all();
}

function getCategories() {
  return db.prepare('SELECT * FROM place_categories ORDER BY id ASC').all();
}

function getPlaces({ category, daroum, soloOnly, openLate, quickFilter, gateNodeId, search, sortBy }) {
  let query = `
    SELECT 
      p.*,
      c.name as category_name,
      c.slug as category_slug,
      c.icon_name as category_icon,
      pms.total_reviews,
      pms.composite_score,
      pms.access_score,
      pms.time_score,
      pms.stability_score,
      pms.distance_km,
      pms.positive_ratio,
      pms.caution_flags_count,
      pms.best_quote
    FROM places p
    JOIN place_categories c ON p.category_id = c.id
    LEFT JOIN place_metrics_summary pms ON p.id = pms.place_id
    WHERE 1=1
  `;
  const params = [];

  if (category && category !== 'all') {
    query += ' AND c.slug = ?';
    params.push(category);
  }

  if (daroum === 'true' || daroum === true) {
    query += ' AND p.is_daroum_accepted = 1';
  }

  if (soloOnly === 'true' || soloOnly === true) {
    query += ' AND (p.single_portion_takeout = 1 OR p.is_single_order_allowed = 1)';
  }

  if (openLate === 'true' || openLate === true) {
    query += " AND (p.business_hours_text LIKE '%24%' OR p.business_hours_text LIKE '%23:00%' OR p.today_status LIKE '%24%' OR p.today_status LIKE '%심야%')";
  }

  if (quickFilter === 'essential') {
    query += " AND c.slug IN ('laundry', 'pharmacy', 'print')";
  }

  if (search) {
    query += ' AND (p.name LIKE ? OR p.road_address LIKE ? OR p.solo_spec_summary LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  let places = db.prepare(query).all(...params);

  // 기본 거점: 원광대학교병원 (id: 1, Lat 35.9685, Lng 126.9582)
  let refNode = null;
  if (gateNodeId) {
    refNode = db.prepare('SELECT * FROM campus_reference_nodes WHERE id = ?').get(gateNodeId);
  } else {
    refNode = db.prepare('SELECT * FROM campus_reference_nodes WHERE id = 1').get();
  }

  places = places.map(p => {
    let distanceMeters = null;
    let distanceKm = p.distance_km || 2.0;
    let walkMinutes = null;

    if (refNode) {
      distanceMeters = calculateDistanceMeters(refNode.lat, refNode.lng, p.lat, p.lng);
      distanceKm = parseFloat((distanceMeters / 1000).toFixed(1));
      walkMinutes = Math.max(1, Math.round(distanceMeters / 67)); // 분당 67m 보행
    }

    // 선택 거점 기준 실시간 접근성 점수 산출
    let accessScore = p.access_score;
    if (refNode) {
      accessScore = calculateAccessibilityScore(distanceKm);
    }

    // 3개 축 평균 산출: (접근성 + 시간충분성 + 운영안정성) / 3
    const timeScore = p.time_score || 4.0;
    const stabilityScore = p.stability_score || 4.0;
    const compositeScore = parseFloat(((accessScore + timeScore + stabilityScore) / 3).toFixed(2));

    // 공식 배지 조회
    const badges = db.prepare(`
      SELECT tag_slug, display_name, polarity, count 
      FROM place_tag_aggregates 
      WHERE place_id = ? AND is_official_badge = 1
      ORDER BY polarity ASC, count DESC
    `).all(p.id);

    return {
      ...p,
      distanceMeters,
      distanceKm,
      walkMinutes,
      access_score: accessScore,
      time_score: timeScore,
      stability_score: stabilityScore,
      composite_score: compositeScore,
      referenceGateName: refNode ? refNode.node_name : '원광대학교병원',
      badges
    };
  });

  // 정렬
  if (sortBy === 'distance') {
    places.sort((a, b) => (a.distanceKm || 99) - (b.distanceKm || 99));
  } else if (sortBy === 'access') {
    places.sort((a, b) => (b.access_score || 0) - (a.access_score || 0));
  } else if (sortBy === 'time') {
    places.sort((a, b) => (b.time_score || 0) - (a.time_score || 0));
  } else if (sortBy === 'stability') {
    places.sort((a, b) => (b.stability_score || 0) - (a.stability_score || 0));
  } else {
    // 기본: 종합 평균 점수순
    places.sort((a, b) => (b.composite_score || 0) - (a.composite_score || 0));
  }

  return places;
}

function getPlaceById(id, gateNodeId) {
  const place = db.prepare(`
    SELECT 
      p.*,
      c.name as category_name,
      c.slug as category_slug,
      c.icon_name as category_icon,
      pms.total_reviews,
      pms.composite_score,
      pms.access_score,
      pms.time_score,
      pms.stability_score,
      pms.distance_km,
      pms.positive_ratio,
      pms.caution_flags_count,
      pms.best_quote
    FROM places p
    JOIN place_categories c ON p.category_id = c.id
    LEFT JOIN place_metrics_summary pms ON p.id = pms.place_id
    WHERE p.id = ?
  `).get(id);

  if (!place) return null;

  // 기본 거점 (원광대학교병원)
  const refNode = gateNodeId 
    ? db.prepare('SELECT * FROM campus_reference_nodes WHERE id = ?').get(gateNodeId)
    : db.prepare('SELECT * FROM campus_reference_nodes WHERE id = 1').get();

  const distanceMeters = refNode ? calculateDistanceMeters(refNode.lat, refNode.lng, place.lat, place.lng) : null;
  const distanceKm = distanceMeters ? parseFloat((distanceMeters / 1000).toFixed(1)) : (place.distance_km || 2.0);
  const walkMinutes = distanceMeters ? Math.max(1, Math.round(distanceMeters / 67)) : null;

  let accessScore = place.access_score;
  if (refNode) {
    accessScore = calculateAccessibilityScore(distanceKm);
  }
  const timeScore = place.time_score || 4.0;
  const stabilityScore = place.stability_score || 4.0;
  const compositeScore = parseFloat(((accessScore + timeScore + stabilityScore) / 3).toFixed(2));

  // 배지 조회
  const badges = db.prepare(`
    SELECT tag_slug, display_name, polarity, count 
    FROM place_tag_aggregates 
    WHERE place_id = ? AND is_official_badge = 1
    ORDER BY polarity ASC, count DESC
  `).all(id);

  // 리뷰 및 세부 평점 조회
  const reviews = db.prepare(`
    SELECT r.*, u.nickname, u.verification_tier, u.wku_verified
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.place_id = ?
    ORDER BY r.created_at DESC
  `).all(id);

  const reviewsWithDetails = reviews.map(rev => {
    const dimRatings = db.prepare('SELECT dimension, score FROM review_dimension_ratings WHERE review_id = ?').all(rev.id);
    const revTags = db.prepare('SELECT tag_slug, source_type FROM review_tags WHERE review_id = ?').all(rev.id);
    return {
      ...rev,
      dimensionRatings: dimRatings,
      tags: revTags
    };
  });

  return {
    ...place,
    distanceMeters,
    distanceKm,
    walkMinutes,
    access_score: accessScore,
    time_score: timeScore,
    stability_score: stabilityScore,
    composite_score: compositeScore,
    referenceGateName: refNode ? refNode.node_name : '원광대학교병원',
    badges,
    reviews: reviewsWithDetails
  };
}

function createReview({
  placeId,
  nickname,
  verificationTier,
  isSoloVisit,
  costSpent,
  overallRating,
  content,
  accessScore,
  timeScore,
  stabilityScore,
  selectedTags
}) {
  const userId = 'user-' + Date.now();
  const reviewId = 'rev-' + Date.now();

  const isWku = verificationTier === 'WONKWANG_STUDENT' ? 1 : 0;
  db.prepare(`
    INSERT INTO users (id, nickname, verification_tier, wku_verified)
    VALUES (?, ?, ?, ?)
  `).run(userId, nickname || '원광대생', verificationTier || 'WONKWANG_STUDENT', isWku);

  let weight = 1.0;
  if (verificationTier === 'WONKWANG_STUDENT') weight = 1.3;
  else if (verificationTier === 'IKSAN_RESIDENT') weight = 1.2;

  const nlpResult = extractInsightsFromReview(content);

  db.prepare(`
    INSERT INTO reviews (id, place_id, user_id, is_solo_visit, cost_spent, overall_rating, content, reviewer_tier, weight_multiplier, sentiment_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    reviewId,
    placeId,
    userId,
    isSoloVisit ? 1 : 0,
    costSpent ? parseInt(costSpent, 10) : null,
    parseFloat(overallRating),
    content,
    verificationTier || 'WONKWANG_STUDENT',
    weight,
    nlpResult.sentimentScore
  );

  // 3대 축 세부 평점 등록
  const insertDim = db.prepare(`
    INSERT INTO review_dimension_ratings (review_id, dimension, score)
    VALUES (?, ?, ?)
  `);
  insertDim.run(reviewId, 'ACCESSIBILITY', parseFloat(accessScore || overallRating));
  insertDim.run(reviewId, 'TIME_SUFFICIENCY', parseFloat(timeScore || overallRating));
  insertDim.run(reviewId, 'OPERATING_STABILITY', parseFloat(stabilityScore || overallRating));

  // 태그 등록
  const insertRevTag = db.prepare(`
    INSERT INTO review_tags (review_id, tag_slug, source_type, confidence)
    VALUES (?, ?, ?, ?)
  `);

  const tagSet = new Set(selectedTags || []);
  for (const tagSlug of tagSet) {
    insertRevTag.run(reviewId, tagSlug, 'USER_SELECTED', 1.0);
  }

  for (const aiTag of nlpResult.extractedTags) {
    if (!tagSet.has(aiTag.slug)) {
      insertRevTag.run(reviewId, aiTag.slug, 'AI_EXTRACTED', aiTag.confidence);
    }
  }

  recalculatePlaceMetrics(placeId);

  return {
    success: true,
    reviewId,
    nlpResult
  };
}

function syncKakaoPlace(kakaoItem, gateNodeId) {
  if (!kakaoItem || !kakaoItem.id) return null;

  let existing = db.prepare('SELECT id FROM places WHERE kakao_id = ?').get(String(kakaoItem.id));
  if (!existing && kakaoItem.place_name) {
    const addr = kakaoItem.road_address_name || kakaoItem.address_name || '';
    existing = db.prepare('SELECT id FROM places WHERE name = ? AND (road_address = ? OR phone = ?)').get(
      kakaoItem.place_name,
      addr,
      kakaoItem.phone || ''
    );
  }

  let placeId;
  if (existing) {
    placeId = existing.id;
    db.prepare('UPDATE places SET kakao_id = ?, kakao_url = ? WHERE id = ?').run(
      String(kakaoItem.id),
      kakaoItem.place_url || '',
      placeId
    );
  } else {
    placeId = 'kakao-' + kakaoItem.id;
    let categoryId = 1;
    const catName = kakaoItem.category_name || '';
    if (catName.includes('마트')) categoryId = 2;
    else if (catName.includes('시장')) categoryId = 3;
    else if (catName.includes('세탁') || catName.includes('빨래')) categoryId = 4;
    else if (catName.includes('인쇄') || catName.includes('출력') || catName.includes('복사')) categoryId = 5;
    else if (catName.includes('약국')) categoryId = 6;

    let dong = '신동';
    const fullAddr = kakaoItem.road_address_name || kakaoItem.address_name || '';
    const dongMatch = fullAddr.match(/([가-힣]+[동|읍|면])/);
    if (dongMatch) dong = dongMatch[1];

    db.prepare(`
      INSERT INTO places (
        id, category_id, name, road_address, dong, lat, lng, phone, 
        is_daroum_accepted, daroum_cashback_rate, has_solo_seats, is_single_order_allowed,
        takeout_available, single_portion_takeout, takeout_discount_text,
        delivery_available, min_delivery_amount, delivery_fee, delivery_info_text,
        solo_spec_summary, business_hours_text, today_status, photo_url, kakao_id, kakao_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      placeId,
      categoryId,
      kakaoItem.place_name,
      fullAddr,
      dong,
      parseFloat(kakaoItem.y),
      parseFloat(kakaoItem.x),
      kakaoItem.phone || null,
      1,
      0.10,
      1,
      1,
      1,
      1,
      '방문 포장 및 다로움 10% 캐시백',
      0,
      0,
      0,
      '원룸촌/대학로 직접 방문 및 카카오 장소 정보 참조',
      '1인 가구 방문 및 소량 구매 가능',
      '카카오맵 실시간 연동 정보',
      '영업 정보 확인 중',
      null,
      String(kakaoItem.id),
      kakaoItem.place_url || ''
    );

    recalculatePlaceMetrics(placeId);
  }

  return getPlaceById(placeId, gateNodeId);
}

module.exports = {
  initDatabase,
  seedDatabase,
  getCampusNodes,
  getTags,
  getCategories,
  getPlaces,
  getPlaceById,
  syncKakaoPlace,
  createReview,
  calculateAccessibilityScore,
  calculateDistanceMeters
};
