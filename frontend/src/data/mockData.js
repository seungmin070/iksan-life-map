/**
 * Embedded Mock Dataset for Iksan Local Life Map
 * Ensures 100% offline and Vercel cloud deployment support without requiring localhost backend.
 * Uses exact real-world GPS coordinates and realistic student reviews.
 */

export const INITIAL_CAMPUS_NODES = [
  {
    id: 1,
    node_name: '원광대학교병원 (Wonkwang Univ. Hospital)',
    node_type: 'HOSPITAL',
    lat: 35.9685,
    lng: 126.9582,
    description: '기본 기준 거점 (원광대학교병원 본관/정문 앞)'
  },
  {
    id: 2,
    node_name: '원광대 북문 (원룸촌)',
    node_type: 'GATE',
    lat: 35.9715,
    lng: 126.9568,
    description: '학생 자취 원룸 밀집 구역'
  },
  {
    id: 3,
    node_name: '신동 대학로 로데오거리',
    node_type: 'HUB',
    lat: 35.9686,
    lng: 126.9588,
    description: '식당/주점/무인인쇄 상권 메인 스트리트'
  },
  {
    id: 4,
    node_name: '원광대 정문 (남문)',
    node_type: 'GATE',
    lat: 35.9650,
    lng: 126.9550,
    description: '정문 및 대운동장 방면'
  }
];

export const INITIAL_CATEGORIES = [
  { id: 1, slug: 'daiso', name: '다이소 / 생활용품', icon_name: 'Sparkles' },
  { id: 2, slug: 'mart', name: '대형마트 / 식료품', icon_name: 'ShoppingBag' },
  { id: 3, slug: 'market', name: '전통시장 / 장터', icon_name: 'Store' },
  { id: 4, slug: 'laundry', name: '24시 코인빨래방', icon_name: 'Waves' },
  { id: 5, slug: 'print', name: '24시 무인 프린트·복사', icon_name: 'Printer' },
  { id: 6, slug: 'pharmacy', name: '심야·주말 당번약국', icon_name: 'HeartPulse' }
];

export const INITIAL_TAGS = [
  { slug: 'access_5pt', display_name: '#접근성_5점(<=1.3km)', dimension: 'ACCESSIBILITY', polarity: 'POSITIVE', icon: 'MapPin' },
  { slug: 'access_4pt', display_name: '#접근성_4점(1.4~1.8km)', dimension: 'ACCESSIBILITY', polarity: 'POSITIVE', icon: 'MapPin' },
  { slug: 'access_3pt', display_name: '#접근성_3점(1.9~2.3km)', dimension: 'ACCESSIBILITY', polarity: 'POSITIVE', icon: 'MapPin' },
  { slug: 'access_2pt', display_name: '#접근성_2점(2.4~2.8km)', dimension: 'ACCESSIBILITY', polarity: 'POSITIVE', icon: 'MapPin' },
  { slug: 'access_1pt', display_name: '#원거리_주의(>=2.9km)', dimension: 'ACCESSIBILITY', polarity: 'CAUTION', icon: 'AlertTriangle' },
  { slug: 'time_5pt', display_name: '#심야쇼핑_충분(23시/24H)', dimension: 'OPERATING_HOURS', polarity: 'POSITIVE', icon: 'Clock' },
  { slug: 'time_4pt', display_name: '#야간이용가능(22시)', dimension: 'OPERATING_HOURS', polarity: 'POSITIVE', icon: 'Moon' },
  { slug: 'time_caution', display_name: '#조기마감_주의(18시)', dimension: 'OPERATING_HOURS', polarity: 'CAUTION', icon: 'AlertCircle' },
  { slug: 'stability_high', display_name: '#연중무휴_안정영업', dimension: 'OPERATING_HOURS', polarity: 'POSITIVE', icon: 'ShieldCheck' },
  { slug: 'stability_mart_holiday', display_name: '#의무휴업일_체크(2/4주일)', dimension: 'OPERATING_HOURS', polarity: 'CAUTION', icon: 'Calendar' },
  { slug: 'daroum_accepted', display_name: '#익산다로움_10%환급', dimension: 'CONVENIENCE', polarity: 'POSITIVE', icon: 'CreditCard' },
  { slug: 'open_24_hours', display_name: '#24시간_영업', dimension: 'OPERATING_HOURS', polarity: 'POSITIVE', icon: 'Clock' },
  { slug: 'solo_1person_friendly', display_name: '#1인분_포장가능', dimension: 'SOLO_SUITABILITY', polarity: 'POSITIVE', icon: 'PackageCheck' },
  { slug: 'delivery_available', display_name: '#자취배달_원룸촌직송', dimension: 'CONVENIENCE', polarity: 'POSITIVE', icon: 'Bike' }
];

export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
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

export function calculateAccessibilityScore(distanceKm) {
  if (distanceKm <= 1.3) return 5.0;
  if (distanceKm <= 1.8) return 4.0;
  if (distanceKm <= 2.3) return 3.0;
  if (distanceKm <= 2.8) return 2.0;
  return 1.0;
}

export const RAW_PLACES_DATA = [
  {
    id: 'daiso-baesan',
    category_id: 1,
    category_slug: 'daiso',
    category_name: '다이소 / 생활용품',
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
    time_score: 4.0,
    stability_score: 5.0,
    reviews: [
      {
        id: 'rev-daiso-baesan',
        nickname: '원대병원실습생',
        verification_tier: 'WONKWANG_STUDENT',
        overall_rating: 4.5,
        content: '원대병원 기준 도보로 가기 편하고 매장이 엄청 커서 자취 필수품 다 있어요. 다로움 결제도 잘 됩니다!',
        created_at: '2026-10-09'
      }
    ],
    badges: [
      { tag_slug: 'solo_1person_friendly', display_name: '#자취필수품', polarity: 'POSITIVE' },
      { tag_slug: 'spacious_store', display_name: '#매장넓음', polarity: 'POSITIVE' },
      { tag_slug: 'daroum_accepted', display_name: '#다로움결제가능', polarity: 'POSITIVE' }
    ]
  },
  {
    id: 'lotte-mart-iksan',
    category_id: 2,
    category_slug: 'mart',
    category_name: '대형마트 / 식료품',
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
    time_score: 5.0,
    stability_score: 3.0,
    reviews: [
      {
        id: 'rev-lotte-mart',
        nickname: '원대간호자취러',
        verification_tier: 'WONKWANG_STUDENT',
        overall_rating: 4.0,
        content: '주말에 마감 세일 때 가면 밀키트나 신선식품 가성비 최고예요. 둘째/넷째 일요일 휴무 꼭 확인하세요.',
        created_at: '2026-10-09'
      }
    ],
    badges: [
      { tag_slug: 'clearance_sale', display_name: '#마감세일', polarity: 'POSITIVE' },
      { tag_slug: 'mealkit_value', display_name: '#밀키트가성비', polarity: 'POSITIVE' },
      { tag_slug: 'stability_mart_holiday', display_name: '#일요일휴무', polarity: 'CAUTION' }
    ]
  },
  {
    id: 'daiso-yeongdeung',
    category_id: 1,
    category_slug: 'daiso',
    category_name: '다이소 / 생활용품',
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
    time_score: 4.0,
    stability_score: 5.0,
    reviews: [
      {
        id: 'rev-daiso-yeongdeung',
        nickname: '영등동자취생',
        verification_tier: 'IKSAN_RESIDENT',
        overall_rating: 4.3,
        content: '영등동 상권 중심이라 식사하고 들르기 좋아요. 물건 종류가 익산에서 제일 많은 느낌입니다.',
        created_at: '2026-10-09'
      }
    ],
    badges: [
      { tag_slug: 'hub_location', display_name: '#상권중심', polarity: 'POSITIVE' },
      { tag_slug: 'variety_items', display_name: '#종류다양', polarity: 'POSITIVE' },
      { tag_slug: 'parking_easy', display_name: '#주차편의', polarity: 'POSITIVE' }
    ]
  },
  {
    id: 'pharmacy-daehak-onnuri',
    category_id: 6,
    category_slug: 'pharmacy',
    category_name: '심야·주말 당번약국',
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
    time_score: 5.0,
    stability_score: 5.0,
    reviews: [
      {
        id: 'rev-pharmacy-daehak',
        nickname: '원대간호자취러',
        verification_tier: 'WONKWANG_STUDENT',
        overall_rating: 5.0,
        content: '원대 북문 바로 앞이라 야간이나 주말에 갑자기 아플 때 바로 약 살 수 있어서 자취생 생명줄이에요.',
        created_at: '2026-10-09'
      }
    ],
    badges: [
      { tag_slug: 'north_gate_front', display_name: '#북문바로앞', polarity: 'POSITIVE' },
      { tag_slug: 'night_weekend_open', display_name: '#야간주말운영', polarity: 'POSITIVE' },
      { tag_slug: 'friendly_service', display_name: '#친절함', polarity: 'POSITIVE' }
    ]
  },
  {
    id: 'laundry-washenjoy',
    category_id: 4,
    category_slug: 'laundry',
    category_name: '24시 코인빨래방',
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
    time_score: 5.0,
    stability_score: 5.0,
    reviews: [
      {
        id: 'rev-laundry-washenjoy',
        nickname: '원대병원실습생',
        verification_tier: 'WONKWANG_STUDENT',
        overall_rating: 5.0,
        content: '원룸 세탁기로 이불빨래 불가능할 때 필수! 건조기 성능 좋아서 빨래 바짝 말라 냄새 안 나요.',
        created_at: '2026-10-09'
      }
    ],
    badges: [
      { tag_slug: 'open_24_hours', display_name: '#24시운영', polarity: 'POSITIVE' },
      { tag_slug: 'laundry_bedding_best', display_name: '#이불빨래최적', polarity: 'POSITIVE' },
      { tag_slug: 'hot_dryer', display_name: '#실내건조', polarity: 'POSITIVE' }
    ]
  },
  {
    id: 'print-cafe-wku',
    category_id: 5,
    category_slug: 'print',
    category_name: '24시 무인 프린트·복사',
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
    time_score: 5.0,
    stability_score: 5.0,
    reviews: [
      {
        id: 'rev-print-cafe-wku',
        nickname: '원대공대생',
        verification_tier: 'WONKWANG_STUDENT',
        overall_rating: 5.0,
        content: '원대 메인 대학로 바로 앞이라 시험기간이나 과제 출력할 때 24시간 1장 70원 카드결제돼서 최고입니다!',
        created_at: '2026-10-09'
      }
    ],
    badges: [
      { tag_slug: 'open_24_hours', display_name: '#24시운영', polarity: 'POSITIVE' },
      { tag_slug: 'single_print_ok', display_name: '#1장출력가능', polarity: 'POSITIVE' },
      { tag_slug: 'hub_location', display_name: '#원대대학로', polarity: 'POSITIVE' }
    ]
  },
  {
    id: 'daiso-mohyeon',
    category_id: 1,
    category_slug: 'daiso',
    category_name: '다이소 / 생활용품',
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
    time_score: 4.0,
    stability_score: 5.0,
    reviews: [
      {
        id: 'rev-daiso-mohyeon',
        nickname: '모현동주민',
        verification_tier: 'IKSAN_RESIDENT',
        overall_rating: 4.0,
        content: '모현동 상권 중심에 있어서 생활용품 사기 편해요. 1인 가구 소형 식기랑 수납함 종류가 많아서 자취 시작할 때 필수 코스입니다.',
        created_at: '2026-10-09'
      }
    ],
    badges: [
      { tag_slug: 'solo_1person_friendly', display_name: '#자취필수품', polarity: 'POSITIVE' },
      { tag_slug: 'hub_location', display_name: '#상권중심', polarity: 'POSITIVE' },
      { tag_slug: 'daroum_accepted', display_name: '#다로움결제가능', polarity: 'POSITIVE' }
    ]
  },
  {
    id: 'seodong-market',
    category_id: 3,
    category_slug: 'market',
    category_name: '전통시장 / 장터',
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
    time_score: 2.0,
    stability_score: 1.0,
    reviews: [
      {
        id: 'rev-seodong-market',
        nickname: '원대병원실습생',
        verification_tier: 'WONKWANG_STUDENT',
        overall_rating: 3.5,
        content: '저녁 일찍 닫아서 아쉽지만 주말 낮에 분식이나 반찬 사러 가기 좋습니다. 다로움 환영해주심!',
        created_at: '2026-10-09'
      }
    ],
    badges: [
      { tag_slug: 'market_snack', display_name: '#시장분식', polarity: 'POSITIVE' },
      { tag_slug: 'sidedish_good', display_name: '#반찬맛집', polarity: 'POSITIVE' },
      { tag_slug: 'early_closing_caution', display_name: '#조기마감주의', polarity: 'CAUTION' }
    ]
  },
  {
    id: 'iksan-jungang-market',
    category_id: 3,
    category_slug: 'market',
    category_name: '전통시장 / 장터',
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
    time_score: 2.0,
    stability_score: 1.0,
    reviews: [
      {
        id: 'rev-jungang-market',
        nickname: '익산시민자취러',
        verification_tier: 'IKSAN_RESIDENT',
        overall_rating: 3.5,
        content: '저녁 일찍 닫아서 아쉽지만 주말 낮에 분식이나 반찬 사러 가기 좋습니다. 다로움 환영해주심!',
        created_at: '2026-10-09'
      }
    ],
    badges: [
      { tag_slug: 'market_snack', display_name: '#시장분식', polarity: 'POSITIVE' },
      { tag_slug: 'sidedish_good', display_name: '#반찬맛집', polarity: 'POSITIVE' },
      { tag_slug: 'early_closing_caution', display_name: '#조기마감주의', polarity: 'CAUTION' }
    ]
  },
  {
    id: 'emart-iksan',
    category_id: 2,
    category_slug: 'mart',
    category_name: '대형마트 / 식료품',
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
    time_score: 4.0,
    stability_score: 3.0,
    reviews: [
      {
        id: 'rev-emart-iksan',
        nickname: '원대병원실습생',
        verification_tier: 'WONKWANG_STUDENT',
        overall_rating: 3.0,
        content: '원대병원에선 거리가 좀 있어서 뚜벅이는 가기 힘들지만 노브랜드 가성비 쟁여놓을 땐 쓱배송이나 차 타고 가기 좋아요.',
        created_at: '2026-10-09'
      }
    ],
    badges: [
      { tag_slug: 'nobrand_value', display_name: '#노브랜드', polarity: 'POSITIVE' },
      { tag_slug: 'mealkit_value', display_name: '#밀키트가성비', polarity: 'POSITIVE' },
      { tag_slug: 'stability_mart_holiday', display_name: '#일요일휴무', polarity: 'CAUTION' }
    ]
  }
];

/**
 * Filter, score, and sort mock places based on selected reference node and filters
 */
export function filterAndSortMockPlaces({
  category = 'all',
  daroumOnly = false,
  soloOnly = false,
  openLateOnly = false,
  essentialOnly = false,
  gateNodeId = 1,
  searchQuery = '',
  sortBy = 'score',
  campusNodes = INITIAL_CAMPUS_NODES
}) {
  const refNode = campusNodes.find((n) => n.id === Number(gateNodeId)) || campusNodes[0];

  let filtered = RAW_PLACES_DATA.map((p) => {
    const distMeters = calculateDistanceMeters(refNode.lat, refNode.lng, p.lat, p.lng);
    const distanceKm = parseFloat((distMeters / 1000).toFixed(1));
    const walkMinutes = Math.max(1, Math.round(distMeters / 67));
    const accessScore = calculateAccessibilityScore(distanceKm);
    const compositeScore = parseFloat(((accessScore + p.time_score + p.stability_score) / 3).toFixed(2));
    const bestQuote = p.reviews && p.reviews.length > 0 ? p.reviews[0].content : '';

    return {
      ...p,
      distanceMeters: distMeters,
      distanceKm,
      walkMinutes,
      access_score: accessScore,
      composite_score: compositeScore,
      referenceGateName: refNode.node_name.split(' ')[0],
      total_reviews: p.reviews ? p.reviews.length : 1,
      best_quote: bestQuote
    };
  });

  // 카테고리 필터
  if (category && category !== 'all') {
    filtered = filtered.filter((p) => p.category_slug === category);
  }

  // 익산다로움 필터
  if (daroumOnly) {
    filtered = filtered.filter((p) => p.is_daroum_accepted === 1);
  }

  // 1인분 주문 가능 필터
  if (soloOnly) {
    filtered = filtered.filter((p) => p.single_portion_takeout === 1 || p.is_single_order_allowed === 1);
  }

  // 심야·24시 필터
  if (openLateOnly) {
    filtered = filtered.filter((p) =>
      p.business_hours_text.includes('24') ||
      p.business_hours_text.includes('23:00') ||
      p.today_status.includes('24') ||
      p.today_status.includes('심야')
    );
  }

  // 빨래방·약국·인쇄 인프라 필터
  if (essentialOnly) {
    filtered = filtered.filter((p) =>
      ['laundry', 'pharmacy', 'print'].includes(p.category_slug)
    );
  }

  // 검색어 필터
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.road_address.toLowerCase().includes(q) ||
        (p.solo_spec_summary && p.solo_spec_summary.toLowerCase().includes(q)) ||
        (p.best_quote && p.best_quote.toLowerCase().includes(q))
    );
  }

  // 정렬
  if (sortBy === 'distance') {
    filtered.sort((a, b) => a.distanceKm - b.distanceKm);
  } else if (sortBy === 'access') {
    filtered.sort((a, b) => b.access_score - a.access_score);
  } else if (sortBy === 'time') {
    filtered.sort((a, b) => b.time_score - a.time_score);
  } else if (sortBy === 'stability') {
    filtered.sort((a, b) => b.stability_score - a.stability_score);
  } else {
    // 종합 점수순
    filtered.sort((a, b) => b.composite_score - a.composite_score);
  }

  return filtered;
}
