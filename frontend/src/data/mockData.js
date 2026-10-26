/**
 * Embedded Mock Dataset for Iksan Local Life Map
 * Ensures 100% offline and Vercel cloud deployment support without requiring localhost backend.
 * Uses exact real-world GPS coordinates, food marts, drugstores, and realistic student reviews.
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
  },
  {
    id: 5,
    node_name: '모현동 자취 원룸촌 (배산지구)',
    node_type: 'RESIDENCE',
    lat: 35.9520,
    lng: 126.9430,
    description: '모현동 신시가지 원룸 및 오피스텔 밀집 구역'
  },
  {
    id: 6,
    node_name: '영등동 먹자골목·학원가',
    node_type: 'HUB',
    lat: 35.9580,
    lng: 126.9720,
    description: '영등동 중심 상권 및 학원가'
  },
  {
    id: 7,
    node_name: '익산역 (KTX/SRT)',
    node_type: 'STATION',
    lat: 35.9400,
    lng: 126.9460,
    description: '익산역 광장 및 시외 이동 관문'
  }
];

export const INITIAL_CATEGORIES = [
  { id: 1, slug: 'daiso', name: '다이소 / 균일가', icon_name: 'Sparkles', color: '#ec4899', emoji: '✨' },
  { id: 2, slug: 'food_mart', name: '식자재마트 / 대용량', icon_name: 'Carrot', color: '#16a34a', emoji: '🥦' },
  { id: 3, slug: 'mart', name: '대형마트 / 식료품', icon_name: 'ShoppingBag', color: '#0284c7', emoji: '🛒' },
  { id: 4, slug: 'essentials', name: '올리브영 / 생활잡화', icon_name: 'Heart', color: '#8b5cf6', emoji: '💄' },
  { id: 5, slug: 'market', name: '전통시장 / 장터', icon_name: 'Store', color: '#ea580c', emoji: '🏪' },
  { id: 6, slug: 'laundry', name: '24시 코인빨래방', icon_name: 'Waves', color: '#6366f1', emoji: '🧺' },
  { id: 7, slug: 'print', name: '24시 무인 프린트·복사', icon_name: 'Printer', color: '#2563eb', emoji: '🖨️' },
  { id: 8, slug: 'pharmacy', name: '심야·주말 당번약국', icon_name: 'HeartPulse', color: '#059669', emoji: '💊' }
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
  { slug: 'daroum_not_accepted', display_name: '#다로움불가_연매출제한', dimension: 'CONVENIENCE', polarity: 'CAUTION', icon: 'AlertTriangle' },
  { slug: 'open_24_hours', display_name: '#24시간_영업', dimension: 'OPERATING_HOURS', polarity: 'POSITIVE', icon: 'Clock' },
  { slug: 'solo_1person_friendly', display_name: '#1인분_포장가능', dimension: 'SOLO_SUITABILITY', polarity: 'POSITIVE', icon: 'PackageCheck' },
  { slug: 'delivery_available', display_name: '#자취배달_원룸촌직송', dimension: 'CONVENIENCE', polarity: 'POSITIVE', icon: 'Bike' }
];

export const VIRTUAL_STUDIO_ROOMS = [
  {
    id: 'studio-daehakro',
    name: '🏠 대학로 1길 원룸타운 (신동 로데오)',
    shortName: '대학로 원룸타운',
    zone: '신동 대학로',
    lat: 35.9692,
    lng: 126.9575,
    address: '익산시 대학로1길 (신동 789번지대)',
    desc: '원광대 학생식당 및 대학로 상권 초근접, 자취생 밀집 구역'
  },
  {
    id: 'studio-sindong-center',
    name: '🏠 신동 주민센터 뒤편 원룸촌 (익산대로 68길)',
    shortName: '신동 주민센터 뒤',
    zone: '신동 주민센터 부근',
    lat: 35.9728,
    lng: 126.9558,
    address: '익산시 익산대로68길 (신동 행정복지센터 인근)',
    desc: '원광대 북문 도보 3분, 조용한 주택가 신축 원룸 밀집 구역'
  },
  {
    id: 'studio-northgate-rodeo',
    name: '🏠 원광대 북문 로데오 원룸촌 (CU/북문 앞)',
    shortName: '원대 북문 원룸촌',
    zone: '북문 원룸타운',
    lat: 35.9735,
    lng: 126.9578,
    address: '익산시 익산대로70길 (원광대 기숙사·북문 방면)',
    desc: '의대/치대/약대/간호대생 및 자연계열 자취생 선호도 1위 구역'
  },
  {
    id: 'studio-seodong-ro',
    name: '🏠 서동로 인근 자취촌 (신동 현대·서동로4길)',
    shortName: '서동로 자취지역',
    zone: '신동 서동로',
    lat: 35.9658,
    lng: 126.9615,
    address: '익산시 서동로4길 (신동 현대아파트 인근)',
    desc: '대학로와 영등동 상권 중간 지점, 가성비 월세 자취 빌라 구역'
  },
  {
    id: 'studio-main-gate',
    name: '🏠 원광대 정문(남문) 맞은편 원룸가 (신동 130번지대)',
    shortName: '정문(남문) 원룸가',
    zone: '신동 정문',
    lat: 35.9638,
    lng: 126.9535,
    address: '익산시 익산대로52길 (원광대 남문 앞)',
    desc: '사범대·인문대·경상대 강의동 도보 5분 통학권'
  },
  {
    id: 'studio-namjung-sports',
    name: '🏠 남중동 국민생활관 뒤편 빌라촌',
    shortName: '남중동 빌라촌',
    zone: '남중동',
    lat: 35.9585,
    lng: 126.9515,
    address: '익산시 선화로 391 (국민생활관 뒤)',
    desc: '원광보건대 및 시청 방면 조용하고 주차가 편리한 원룸가'
  },
  {
    id: 'studio-mohyeon-baesan',
    name: '🏠 모현동 배산에코르·신시가지 원룸촌',
    shortName: '모현동 배산원룸촌',
    zone: '모현동',
    lat: 35.9515,
    lng: 126.9425,
    address: '익산시 배산로 (모현동2가)',
    desc: '모현 시립도서관 및 롯데시네마 상권 인근 쾌적한 오피스텔'
  },
  {
    id: 'studio-yeongdeung',
    name: '🏠 영등동 원룸·오피스텔 단지 (영등2동)',
    shortName: '영등동 원룸단지',
    zone: '영등동',
    lat: 35.9592,
    lng: 126.9685,
    address: '익산시 하나로11길 (영등동 학원가 뒤)',
    desc: '롯데마트 및 영등동 핵심 먹자골목 인접'
  }
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

export function estimateWalkingInfo(straightMeters) {
  // 실제 골목길/신호등 보행 보정 계수 (1.25x)
  const actualWalkMeters = Math.round(straightMeters * 1.25);
  // 성인 보행 속도 4km/h (분당 약 67m)
  const walkMinutes = Math.max(1, Math.round(actualWalkMeters / 67));
  const walkSteps = Math.round(actualWalkMeters * 1.35);
  // 예상 소모 칼로리 (분당 약 4.2 kcal)
  const caloriesKcal = Math.round(walkMinutes * 4.2);
  // 택시 예상 요금: 기본 4,000원 + 거리비례요금 (130m당 100원)
  const taxiFare =
    actualWalkMeters <= 1500
      ? 4000
      : Math.round((4000 + ((actualWalkMeters - 1500) / 130) * 100) / 100) * 100;

  return {
    actualWalkMeters,
    walkMinutes,
    walkSteps,
    caloriesKcal,
    taxiFare
  };
}

export function calculateAccessibilityScore(distanceKm) {
  if (distanceKm <= 1.3) return 5.0;
  if (distanceKm <= 1.8) return 4.0;
  if (distanceKm <= 2.3) return 3.0;
  if (distanceKm <= 2.8) return 2.0;
  return 1.0;
}

export const RAW_PLACES_DATA = [
  // 1. 다이소 / 생활용품
  {
    id: 'daiso-baesan',
    category_id: 1,
    category_slug: 'daiso',
    category_name: '다이소 / 균일가',
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
    id: 'daiso-yeongdeung',
    category_id: 1,
    category_slug: 'daiso',
    category_name: '다이소 / 균일가',
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
    id: 'daiso-mohyeon',
    category_id: 1,
    category_slug: 'daiso',
    category_name: '다이소 / 균일가',
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

  // 2. [신규 카테고리] 식자재마트 / 대용량 식료품
  {
    id: 'foodmart-hanaro-namjung',
    category_id: 2,
    category_slug: 'food_mart',
    category_name: '식자재마트 / 대용량',
    name: '농협하나로마트 익산농협본점 (로컬푸드 직매장)',
    road_address: '전북특별자치도 익산시 인북로 261 (남중동)',
    dong: '남중동',
    lat: 35.9615,
    lng: 126.9538,
    phone: '063-850-2500',
    is_daroum_accepted: 1,
    daroum_cashback_rate: 0.10,
    has_solo_seats: 1,
    is_single_order_allowed: 1,
    takeout_available: 1,
    single_portion_takeout: 1,
    takeout_discount_text: '익산다로움 10% 캐시백 결제 환급 100% 가능',
    delivery_available: 1,
    min_delivery_amount: 30000,
    delivery_fee: 2500,
    delivery_info_text: '원광대/신동 원룸촌 근거리 당일 직배송 지원',
    solo_spec_summary: '1인 가구 쌈채소·파·양파 1,000원대 소포장 로컬푸드 코너, 신선 한돈 1인분 정육 완비',
    business_hours_text: '매일 08:30 ~ 21:00 (연중무휴, 대형마트 의무휴업 없음)',
    today_status: '영업 중 · 21:00 마감 (의무휴업 없음)',
    time_score: 4.0,
    stability_score: 5.0,
    reviews: [
      {
        id: 'rev-foodmart-hanaro',
        nickname: '원대의대자취러',
        verification_tier: 'WONKWANG_STUDENT',
        overall_rating: 4.8,
        content: '원대병원 남문에서 걸어서 10분 거리라 식재료 살 때 최고입니다! 로컬푸드 코너에서 상추나 찌개용 채소 1,000원에 소포장되어 나와 썩혀 버릴 일 없고 다로움 10% 환급도 됩니다.',
        created_at: '2026-10-18'
      }
    ],
    badges: [
      { tag_slug: 'local_food_single', display_name: '#로컬푸드1000원소포장', polarity: 'POSITIVE' },
      { tag_slug: 'daroum_accepted', display_name: '#다로움10%환급', polarity: 'POSITIVE' },
      { tag_slug: 'stability_high', display_name: '#의무휴업없음', polarity: 'POSITIVE' }
    ]
  },
  {
    id: 'foodmart-sambo',
    category_id: 2,
    category_slug: 'food_mart',
    category_name: '식자재마트 / 대용량',
    name: '삼보식자재할인마트 남중점 (Sambo Food Mart)',
    road_address: '전북특별자치도 익산시 선화로 420 (남중동)',
    dong: '남중동',
    lat: 35.9575,
    lng: 126.9595,
    phone: '063-841-8880',
    is_daroum_accepted: 1,
    daroum_cashback_rate: 0.10,
    has_solo_seats: 1,
    is_single_order_allowed: 1,
    takeout_available: 1,
    single_portion_takeout: 1,
    takeout_discount_text: '익산다로움 결제 시 10% 캐시백 적용',
    delivery_available: 1,
    min_delivery_amount: 30000,
    delivery_fee: 3000,
    delivery_info_text: '식자재 대용량 및 냉동식품 전화주문 배송',
    solo_spec_summary: '계란 30구(한판 초특가), 냉동만두/볶음밥/치킨너겟 업소용 대용량 가성비 끝판왕',
    business_hours_text: '매일 06:00 ~ 23:00 (새벽 6시 오픈, 심야 23시 마감 연중무휴)',
    today_status: '영업 중 · 23:00 마감 (새벽~심야 장보기 가능)',
    time_score: 5.0,
    stability_score: 5.0,
    reviews: [
      {
        id: 'rev-foodmart-sambo',
        nickname: '원대간호자취생',
        verification_tier: 'WONKWANG_STUDENT',
        overall_rating: 4.7,
        content: '아침 일찍부터 밤 11시까지 열려있어서 실습 끝나고 가기 너무 좋아요. 계란이랑 냉동식품 가격이 마트 반값 수준이고 다로움도 잘 됩니다.',
        created_at: '2026-10-15'
      }
    ],
    badges: [
      { tag_slug: 'time_5pt', display_name: '#새벽오픈_심야23시', polarity: 'POSITIVE' },
      { tag_slug: 'food_mart_bulk', display_name: '#계란한판초특가', polarity: 'POSITIVE' },
      { tag_slug: 'daroum_accepted', display_name: '#다로움10%환급', polarity: 'POSITIVE' }
    ]
  },
  {
    id: 'foodmart-mohyeon',
    category_id: 2,
    category_slug: 'food_mart',
    category_name: '식자재마트 / 대용량',
    name: '모현식자재마트 (Mohyeon Food Mart)',
    road_address: '전북특별자치도 익산시 선화로 108 (모현동1가)',
    dong: '모현동',
    lat: 35.9525,
    lng: 126.9385,
    phone: '063-858-5544',
    is_daroum_accepted: 1,
    daroum_cashback_rate: 0.10,
    has_solo_seats: 1,
    is_single_order_allowed: 1,
    takeout_available: 1,
    single_portion_takeout: 1,
    takeout_discount_text: '익산다로움 결제 지원 (10% 환급)',
    delivery_available: 1,
    min_delivery_amount: 30000,
    delivery_fee: 2000,
    delivery_info_text: '모현동 원룸촌 근거리 당일 배달 (3만원 이상 무료)',
    solo_spec_summary: '모현동 자취촌 중심 대형 식자재, 1인용 소포장 밀키트·신선야채·정육 코너 완비',
    business_hours_text: '매일 07:00 ~ 23:00 (연중무휴)',
    today_status: '영업 중 · 23:00 마감 (심야 이용 가능)',
    time_score: 5.0,
    stability_score: 5.0,
    reviews: [
      {
        id: 'rev-foodmart-mohyeon',
        nickname: '모현동자취러',
        verification_tier: 'IKSAN_RESIDENT',
        overall_rating: 4.6,
        content: '모현동 원룸 사는 자취생들에겐 생명줄입니다. 대형마트 의무휴업일에도 정상 영업하고 다로움 10% 캐시백까지 환급돼서 생활비 많이 아껴요.',
        created_at: '2026-10-12'
      }
    ],
    badges: [
      { tag_slug: 'daroum_accepted', display_name: '#모현자취생필수', polarity: 'POSITIVE' },
      { tag_slug: 'time_5pt', display_name: '#심야23시마감', polarity: 'POSITIVE' },
      { tag_slug: 'delivery_available', display_name: '#근거리무료배달', polarity: 'POSITIVE' }
    ]
  },
  {
    id: 'foodmart-yeongdeung-woori',
    category_id: 2,
    category_slug: 'food_mart',
    category_name: '식자재마트 / 대용량',
    name: '우리식자재할인마트 영등점 (24시 식자재마트)',
    road_address: '전북특별자치도 익산시 하나로 422 (영등동)',
    dong: '영등동',
    lat: 35.9630,
    lng: 126.9755,
    phone: '063-833-2288',
    is_daroum_accepted: 1,
    daroum_cashback_rate: 0.10,
    has_solo_seats: 1,
    is_single_order_allowed: 1,
    takeout_available: 1,
    single_portion_takeout: 1,
    takeout_discount_text: '익산다로움 결제 10% 캐시백',
    delivery_available: 1,
    min_delivery_amount: 40000,
    delivery_fee: 3000,
    delivery_info_text: '익산 시내 전역 당일 배송',
    solo_spec_summary: '24시간 연중무휴 상시 영업, 대용량 냉동 가공육·찌개거리·햇반 박스 단위 최저가',
    business_hours_text: '연중무휴 24시간 상시 운영',
    today_status: '영업 중 · 24시간 연중무휴 (심야 쇼핑 가능)',
    time_score: 5.0,
    stability_score: 5.0,
    reviews: [
      {
        id: 'rev-foodmart-yeongdeung',
        nickname: '원대공대생',
        verification_tier: 'WONKWANG_STUDENT',
        overall_rating: 4.8,
        content: '24시간 운영하는 식자재마트라 시험기간 밤샘하고 새벽 3시에 장보러 갈 수 있는 게 진짜 큰 장점입니다. 다로움 카드 쓰면 10% 페이백돼서 체감가 엄청 저렴해요.',
        created_at: '2026-10-14'
      }
    ],
    badges: [
      { tag_slug: 'open_24_hours', display_name: '#24시간식자재마트', polarity: 'POSITIVE' },
      { tag_slug: 'daroum_accepted', display_name: '#다로움10%환급', polarity: 'POSITIVE' },
      { tag_slug: 'food_mart_bulk', display_name: '#대용량박스특가', polarity: 'POSITIVE' }
    ]
  },

  // 3. [신규 카테고리] 올리브영 / 생활뷰티 & 기타 생필품
  {
    id: 'essentials-oliveyoung-wku',
    category_id: 4,
    category_slug: 'essentials',
    category_name: '올리브영 / 생활잡화',
    name: '올리브영 익산원광대점 (Olive Young)',
    road_address: '전북특별자치도 익산시 익산대로54길 38 (신동 대학로)',
    dong: '신동',
    lat: 35.9688,
    lng: 126.9585,
    phone: '063-854-5290',
    is_daroum_accepted: 1,
    daroum_cashback_rate: 0.10,
    has_solo_seats: 1,
    is_single_order_allowed: 1,
    takeout_available: 1,
    single_portion_takeout: 1,
    takeout_discount_text: '익산다로움 지역화폐 결제 10% 캐시백 적용 매장',
    delivery_available: 1,
    min_delivery_amount: 20000,
    delivery_fee: 2500,
    delivery_info_text: '올리브영 오늘드림 3시간 이내 원룸 직송 & 매장 픽업 가능',
    solo_spec_summary: '자취생 샴푸·바디워시·클렌징폼 1+1 기획세트, 1인용 영양제, 다이어트 간식 완비',
    business_hours_text: '매일 10:30 ~ 22:30 (연중무휴)',
    today_status: '영업 중 · 22:30 마감 (대학로 위치)',
    time_score: 4.0,
    stability_score: 5.0,
    reviews: [
      {
        id: 'rev-olive-wku',
        nickname: '원대병원실습생',
        verification_tier: 'WONKWANG_STUDENT',
        overall_rating: 4.9,
        content: '원대병원 바로 앞 대학로 입구에 있어서 퇴근길에 세면도구나 화장품 사기 최고입니다. 올리브영 오늘드림 픽업도 엄청 빠르고 다로움 10% 캐시백 결제도 돼서 깜짝 놀랐어요!',
        created_at: '2026-10-17'
      }
    ],
    badges: [
      { tag_slug: 'access_5pt', display_name: '#원대병원도보2분', polarity: 'POSITIVE' },
      { tag_slug: 'oliveyoung_pickup', display_name: '#오늘드림픽업', polarity: 'POSITIVE' },
      { tag_slug: 'daroum_accepted', display_name: '#다로움10%환급', polarity: 'POSITIVE' }
    ]
  },
  {
    id: 'essentials-oliveyoung-yeongdeung',
    category_id: 4,
    category_slug: 'essentials',
    category_name: '올리브영 / 생활잡화',
    name: '올리브영 익산영등점 (대형 플래그십)',
    road_address: '전북특별자치도 익산시 무왕로 1062 (영등동)',
    dong: '영등동',
    lat: 35.9585,
    lng: 126.9730,
    phone: '063-831-5290',
    is_daroum_accepted: 1,
    daroum_cashback_rate: 0.10,
    has_solo_seats: 1,
    is_single_order_allowed: 1,
    takeout_available: 1,
    single_portion_takeout: 1,
    takeout_discount_text: '익산다로움 카드 결제 환급 지원',
    delivery_available: 1,
    min_delivery_amount: 20000,
    delivery_fee: 2500,
    delivery_info_text: '올리브영 오늘드림 퀵배송 가능',
    solo_spec_summary: '익산 최대 규모 올리브영, 대용량 스킨케어·헤어케어 생필품 기획전 상시 진행',
    business_hours_text: '매일 10:00 ~ 22:30 (연중무휴)',
    today_status: '영업 중 · 22:30 마감 (영등동 상권)',
    time_score: 4.0,
    stability_score: 5.0,
    reviews: [
      {
        id: 'rev-olive-yd',
        nickname: '영등동자취생',
        verification_tier: 'IKSAN_RESIDENT',
        overall_rating: 4.6,
        content: '영등동 상권 중심에 있어서 식사 후 들르기 좋고 매장이 커서 올영세일 때 원대점 품절 상품도 여긴 거의 다 있어요.',
        created_at: '2026-10-11'
      }
    ],
    badges: [
      { tag_slug: 'hub_location', display_name: '#영등동중심상권', polarity: 'POSITIVE' },
      { tag_slug: 'spacious_store', display_name: '#익산최대규모', polarity: 'POSITIVE' },
      { tag_slug: 'daroum_accepted', display_name: '#다로움환급매장', polarity: 'POSITIVE' }
    ]
  },
  {
    id: 'essentials-alpha-wku',
    category_id: 4,
    category_slug: 'essentials',
    category_name: '올리브영 / 생활잡화',
    name: '알파문구 익산원광대점 (문구·생활잡화)',
    road_address: '전북특별자치도 익산시 익산대로 460 (신동 원광대 북문 앞)',
    dong: '신동',
    lat: 35.9710,
    lng: 126.9568,
    phone: '063-855-3344',
    is_daroum_accepted: 1,
    daroum_cashback_rate: 0.10,
    has_solo_seats: 1,
    is_single_order_allowed: 1,
    takeout_available: 1,
    single_portion_takeout: 1,
    takeout_discount_text: '익산다로움 결제 10% 캐시백 적용',
    delivery_available: 0,
    min_delivery_amount: 0,
    delivery_fee: 0,
    delivery_info_text: '원광대 북문 앞 현장 구매 전용',
    solo_spec_summary: '과제 제출용 바인더, 전공서적 제본용품, 자취방 멀티탭·충전케이블·원룸 소형 문구잡화 구비',
    business_hours_text: '평일 08:30 ~ 21:00 / 토 09:00 ~ 19:00 (일요일 휴무)',
    today_status: '영업 중 · 21:00 마감 (원대 북문 바로 앞)',
    time_score: 3.5,
    stability_score: 4.0,
    reviews: [
      {
        id: 'rev-alpha-wku',
        nickname: '원대간호자취러',
        verification_tier: 'WONKWANG_STUDENT',
        overall_rating: 4.5,
        content: '북문 원룸촌 바로 앞이라 리포트 바인더나 멀티탭, 건전지 급하게 필요할 때 뛰어가기 좋습니다. 다로움 결제도 친절하게 잘 받아주세요.',
        created_at: '2026-10-13'
      }
    ],
    badges: [
      { tag_slug: 'access_5pt', display_name: '#북문도보1분', polarity: 'POSITIVE' },
      { tag_slug: 'solo_1person_friendly', display_name: '#자취생활잡화', polarity: 'POSITIVE' },
      { tag_slug: 'daroum_accepted', display_name: '#다로움10%환급', polarity: 'POSITIVE' }
    ]
  },

  // 4. 대형마트 / 식료품
  {
    id: 'lotte-mart-iksan',
    category_id: 3,
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
    today_status: '영업 중 · 23:00 마감 (대형마트 의무휴업 주의)',
    time_score: 5.0,
    stability_score: 3.0,
    reviews: [
      {
        id: 'rev-lotte-mart',
        nickname: '원대간호자취러',
        verification_tier: 'WONKWANG_STUDENT',
        overall_rating: 4.0,
        content: '주말에 마감 세일 때 가면 밀키트나 신선식품 가성비 최고예요. 단 대기업 마트라 다로움 사용은 불가하고 둘째/넷째 일요일 휴무 꼭 확인하세요.',
        created_at: '2026-10-09'
      }
    ],
    badges: [
      { tag_slug: 'clearance_sale', display_name: '#마감세일', polarity: 'POSITIVE' },
      { tag_slug: 'mealkit_value', display_name: '#밀키트가성비', polarity: 'POSITIVE' },
      { tag_slug: 'daroum_not_accepted', display_name: '#다로움불가(대기업)', polarity: 'CAUTION' },
      { tag_slug: 'stability_mart_holiday', display_name: '#일요일휴무', polarity: 'CAUTION' }
    ]
  },
  {
    id: 'emart-iksan',
    category_id: 3,
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
        content: '원대병원에선 거리가 좀 있어서 뚜벅이는 가기 힘들지만 노브랜드 가성비 쟁여놓을 땐 쓱배송이나 차 타고 가기 좋아요. 다로움은 사용 불가합니다.',
        created_at: '2026-10-09'
      }
    ],
    badges: [
      { tag_slug: 'nobrand_value', display_name: '#노브랜드', polarity: 'POSITIVE' },
      { tag_slug: 'daroum_not_accepted', display_name: '#다로움불가(대기업)', polarity: 'CAUTION' },
      { tag_slug: 'stability_mart_holiday', display_name: '#일요일휴무', polarity: 'CAUTION' }
    ]
  },

  // 5. 전통시장 / 장터
  {
    id: 'seodong-market',
    category_id: 5,
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
        content: '저녁 일찍 닫아서 아쉽지만 주말 낮에 분식이나 반찬 사러 가기 좋습니다. 다로움 10% 환영해주심!',
        created_at: '2026-10-09'
      }
    ],
    badges: [
      { tag_slug: 'market_snack', display_name: '#시장분식', polarity: 'POSITIVE' },
      { tag_slug: 'sidedish_good', display_name: '#반찬맛집', polarity: 'POSITIVE' },
      { tag_slug: 'daroum_accepted', display_name: '#다로움환급', polarity: 'POSITIVE' },
      { tag_slug: 'early_closing_caution', display_name: '#조기마감주의', polarity: 'CAUTION' }
    ]
  },
  {
    id: 'iksan-jungang-market',
    category_id: 5,
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
        content: '익산역 부근이라 기차 타기 전에 분식 먹기 좋아요. 영업시간 변동이 있으니 낮 시간에 방문하세요.',
        created_at: '2026-10-09'
      }
    ],
    badges: [
      { tag_slug: 'market_snack', display_name: '#시장분식', polarity: 'POSITIVE' },
      { tag_slug: 'daroum_accepted', display_name: '#다로움환급', polarity: 'POSITIVE' },
      { tag_slug: 'early_closing_caution', display_name: '#조기마감주의', polarity: 'CAUTION' }
    ]
  },

  // 6. 24시 코인빨래방
  {
    id: 'laundry-washenjoy',
    category_id: 6,
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

  // 7. 24시 무인 프린트·복사
  {
    id: 'print-cafe-wku',
    category_id: 7,
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

  // 8. 심야·주말 당번약국
  {
    id: 'pharmacy-daehak-onnuri',
    category_id: 8,
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
  }
];

/**
 * Filter, score, and sort mock places based on selected reference node (or custom GPS location) and filters
 */
export function filterAndSortMockPlaces({
  category = 'all',
  daroumOnly = false,
  soloOnly = false,
  openLateOnly = false,
  essentialOnly = false,
  gateNodeId = null,
  originStudioId = 'studio-daehakro',
  customOrigin = null, // { lat, lng, name }
  searchQuery = '',
  sortBy = 'score',
  campusNodes = INITIAL_CAMPUS_NODES,
  studioRooms = VIRTUAL_STUDIO_ROOMS
}) {
  let refLat = 35.9692;
  let refLng = 126.9575;
  let refName = '대학로 1길 원룸타운';

  if (customOrigin && customOrigin.lat && customOrigin.lng) {
    refLat = customOrigin.lat;
    refLng = customOrigin.lng;
    refName = customOrigin.name || '내 현재 위치';
  } else if (originStudioId) {
    const studio = studioRooms.find((s) => s.id === originStudioId);
    if (studio) {
      refLat = studio.lat;
      refLng = studio.lng;
      refName = studio.shortName;
    }
  } else if (gateNodeId) {
    const refNode = campusNodes.find((n) => n.id === Number(gateNodeId)) || campusNodes[0];
    if (refNode) {
      refLat = refNode.lat;
      refLng = refNode.lng;
      refName = refNode.node_name.split(' ')[0];
    }
  }

  let filtered = RAW_PLACES_DATA.map((p) => {
    const distMeters = calculateDistanceMeters(refLat, refLng, p.lat, p.lng);
    const distanceKm = parseFloat((distMeters / 1000).toFixed(1));
    const walkingInfo = estimateWalkingInfo(distMeters);
    const accessScore = calculateAccessibilityScore(distanceKm);
    const compositeScore = parseFloat(((accessScore + p.time_score + p.stability_score) / 3).toFixed(2));
    const bestQuote = p.reviews && p.reviews.length > 0 ? p.reviews[0].content : '';

    return {
      ...p,
      distanceMeters: distMeters,
      actualWalkMeters: walkingInfo.actualWalkMeters,
      distanceKm,
      walkMinutes: walkingInfo.walkMinutes,
      walkSteps: walkingInfo.walkSteps,
      caloriesKcal: walkingInfo.caloriesKcal,
      taxiFare: walkingInfo.taxiFare,
      access_score: accessScore,
      composite_score: compositeScore,
      referenceGateName: refName,
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
    // 실시간 위치 기준 거리순 오름차순 (가까운 곳 우선)
    filtered.sort((a, b) => a.distanceMeters - b.distanceMeters);
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
