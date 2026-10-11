/**
 * NLP & Aspect-Based Sentiment Analysis (ABSA) Rule-Based Extractor
 * 익산 및 원광대학교 1인 가구/자취생 도메인 특화 태그 자동 추출기
 */

const TAG_EXTRACTION_RULES = [
  // 1. 1인 적합도 & 혼밥
  {
    tagSlug: 'solo_dining_friendly',
    displayName: '#혼밥최적',
    dimension: 'SOLO_SUITABILITY',
    polarity: 'POSITIVE',
    keywords: ['혼밥', '혼자', '혼자가도', '혼자 가도', '혼자 먹기', '눈치 안', '눈치안', '편하게 혼자', '1인 손님 환영'],
    negativeKeywords: ['혼밥 눈치', '혼자 가면 싫어', '혼자 안됨']
  },
  {
    tagSlug: 'solo_seats_available',
    displayName: '#1인석_바테이블',
    dimension: 'SOLO_SUITABILITY',
    polarity: 'POSITIVE',
    keywords: ['바테이블', '바 테이블', '1인석', '칸막이', '1인 테이블', '다찌', '창가석'],
    negativeKeywords: []
  },
  {
    tagSlug: 'single_portion_meat',
    displayName: '#1인구이가능',
    dimension: 'SOLO_SUITABILITY',
    polarity: 'POSITIVE',
    keywords: ['1인 삼겹', '1인 고기', '삼겹살 혼자', '1인 구이', '구워져 나', '1인 반상', '혼자 고기'],
    negativeKeywords: []
  },
  {
    tagSlug: 'caution_min_two_orders',
    displayName: '#2인이상_주문필수',
    dimension: 'SOLO_SUITABILITY',
    polarity: 'CAUTION',
    keywords: ['2인 이상', '2인이상', '2인분부터', '2인분 이상', '2인분이상', '혼자 못 시킴', '혼자는 안 판', '1인분 안 됨', '1인분 거절'],
    negativeKeywords: []
  },
  {
    tagSlug: 'caution_solo_uncomfortable',
    displayName: '#혼밥_눈치주의',
    dimension: 'SOLO_SUITABILITY',
    polarity: 'CAUTION',
    keywords: ['눈치 보', '눈치보', '눈치 줌', '자리 비키라', '혼자 왔다고 꼽', '혼밥 비추'],
    negativeKeywords: []
  },

  // 2. 가성비 & 혜택
  {
    tagSlug: 'rice_refill_free',
    displayName: '#공깃밥_무한리필',
    dimension: 'COST_BURDEN',
    polarity: 'POSITIVE',
    keywords: ['밥 리필', '공깃밥 무료', '밥 무한', '반찬 리필', '밥 셀프', '밥 공짜', '무한리필'],
    negativeKeywords: []
  },
  {
    tagSlug: 'great_value_money',
    displayName: '#갓성비_학생추천',
    dimension: 'COST_BURDEN',
    polarity: 'POSITIVE',
    keywords: ['가성비', '갓성비', '착한 가격', '학생 지갑', '양 엄청', '양 많', '푸짐', '배부르게'],
    negativeKeywords: ['가성비 별로', '가격 대비 양 적음', '비싸']
  },

  // 3. 편의성 & 익산 특화 (다로움)
  {
    tagSlug: 'iksan_daroum_accepted',
    displayName: '#익산다로움_환영',
    dimension: 'CONVENIENCE',
    polarity: 'POSITIVE',
    keywords: ['다로움', '익산다로움', '캐시백', '페이백', '지역화폐'],
    negativeKeywords: ['다로움 안 됨', '다로움 안됨', '다로움 거절', '다로움 불가', '다로움 결제 불가', '다로움 안 받']
  },
  {
    tagSlug: 'caution_daroum_rejected',
    displayName: '#다로움_결제불가',
    dimension: 'CONVENIENCE',
    polarity: 'CAUTION',
    keywords: ['다로움 불가', '다로움 결제 불가', '다로움 안 받', '다로움 안받', '다로움 거부', '다로움 카드 안 됨', '다로움 안 됨', '다로움 안됨'],
    negativeKeywords: []
  },
  {
    tagSlug: 'power_sockets_plentiful',
    displayName: '#콘센트_자리마다',
    dimension: 'CONVENIENCE',
    polarity: 'POSITIVE',
    keywords: ['콘센트', '충전', '플러그', '자리마다 콘센트', '노트북 충전'],
    negativeKeywords: ['콘센트 없음', '콘센트 막아']
  },

  // 4. 운영시간 & 심야
  {
    tagSlug: 'open_late_night',
    displayName: '#야식_새벽영업',
    dimension: 'OPERATING_HOURS',
    polarity: 'POSITIVE',
    keywords: ['새벽', '심야', '야식', '늦게까지', '02시', '01시', '밤늦게'],
    negativeKeywords: []
  },
  {
    tagSlug: 'open_24_hours',
    displayName: '#24시간_영업',
    dimension: 'OPERATING_HOURS',
    polarity: 'POSITIVE',
    keywords: ['24시', '24시간', '연중무휴', '밤샘'],
    negativeKeywords: []
  },
  {
    tagSlug: 'exam_period_extended',
    displayName: '#시험기간_밤샘가능',
    dimension: 'OPERATING_HOURS',
    polarity: 'POSITIVE',
    keywords: ['시험기간', '시험 기간', '밤샘 가능', '밤샘 스터디', '연장 운영'],
    negativeKeywords: []
  },

  // 5. 위치/접근성
  {
    tagSlug: 'wonkwang_north_gate',
    displayName: '#원광대_북문3분',
    dimension: 'ACCESSIBILITY',
    polarity: 'POSITIVE',
    keywords: ['북문', '북문 바로', '원룸촌', '북문 앞'],
    negativeKeywords: []
  },
  {
    tagSlug: 'wonkwang_daehakro',
    displayName: '#대학로_중심가',
    dimension: 'ACCESSIBILITY',
    polarity: 'POSITIVE',
    keywords: ['대학로', '메인거리', '신동사거리', '로데오'],
    negativeKeywords: []
  },
  {
    tagSlug: 'caution_dark_alley',
    displayName: '#골목길_어두움',
    dimension: 'ACCESSIBILITY',
    polarity: 'CAUTION',
    keywords: ['골목 어두', '가로등 없', '밤에 무서', '골목 안쪽', '길 찾기 어렵'],
    negativeKeywords: []
  },

  // 6. 1인 가구 배달/포장 & 신규 생활편의 (빨래방, 무인프린트, 심야약국)
  {
    tagSlug: 'solo_1person_friendly',
    displayName: '#1인분_포장소량구매',
    dimension: 'SOLO_SUITABILITY',
    polarity: 'POSITIVE',
    keywords: ['1인분 포장', '1인 포장', '소포장', '소량 구매', '1인분 가능', '혼자 포장', '1인가구 맞춤', '소용량'],
    negativeKeywords: ['1인분 안 됨', '2인분부터']
  },
  {
    tagSlug: 'delivery_available',
    displayName: '#자취배달_당일도착',
    dimension: 'CONVENIENCE',
    polarity: 'POSITIVE',
    keywords: ['배달', '배민', '요기요', '쿠팡이츠', '배달팁', '배송', '당일배송', '쓱배송', '오늘배송'],
    negativeKeywords: ['배달 불가', '배달 안 됨']
  },
  {
    tagSlug: 'laundry_bedding',
    displayName: '#대형이불_세탁열풍건조',
    dimension: 'CONVENIENCE',
    polarity: 'POSITIVE',
    keywords: ['빨래방', '코인빨래', '이불빨래', '건조기', '세탁기', '대형 세탁', '열풍건조', '운동화 세탁', '셀프빨래'],
    negativeKeywords: []
  },
  {
    tagSlug: 'print_24h',
    displayName: '#24H_과제족보_1장출력',
    dimension: 'CONVENIENCE',
    polarity: 'POSITIVE',
    keywords: ['프린트', '인쇄', '복사', '출력', '족보', '과제', '제본', '1장 출력', '무인 프린트', '프린트카페'],
    negativeKeywords: []
  },
  {
    tagSlug: 'night_pharmacy',
    displayName: '#365심야상비약_당번',
    dimension: 'CONVENIENCE',
    polarity: 'POSITIVE',
    keywords: ['약국', '심야 약국', '당번약국', '상비약', '감기약', '진통제', '소화제', '타이레놀', '파스', '복약지도'],
    negativeKeywords: []
  }
];

/**
 * 텍스트 리뷰로부터 태그 및 감성 점수를 자동 추출
 * @param {string} text 사용자 리뷰 본문
 * @returns {{ extractedTags: Array, sentimentScore: number, cautionAlerts: Array }}
 */
function extractInsightsFromReview(text) {
  if (!text || typeof text !== 'string') {
    return { extractedTags: [], sentimentScore: 0.0, cautionAlerts: [] };
  }

  const normalized = text.toLowerCase().replace(/\s+/g, ' ');
  const extractedTags = [];
  const cautionAlerts = [];
  let positiveHits = 0;
  let negativeHits = 0;

  for (const rule of TAG_EXTRACTION_RULES) {
    // 1. 부정/예외 키워드가 매칭되는지 확인
    const hasNegativeKeyword = rule.negativeKeywords.some(neg => normalized.includes(neg));
    if (hasNegativeKeyword) {
      negativeHits += 1;
      continue;
    }

    // 2. 긍정/목표 키워드 매칭
    const matchedKeyword = rule.keywords.find(kw => normalized.includes(kw));
    if (matchedKeyword) {
      if (rule.polarity === 'POSITIVE') {
        positiveHits += 1;
        extractedTags.push({
          slug: rule.tagSlug,
          displayName: rule.displayName,
          dimension: rule.dimension,
          polarity: rule.polarity,
          sourceType: 'AI_EXTRACTED',
          confidence: 0.92,
          matchedKeyword
        });
      } else if (rule.polarity === 'CAUTION') {
        negativeHits += 2; // 주의/경고는 더 강하게 패널티
        extractedTags.push({
          slug: rule.tagSlug,
          displayName: rule.displayName,
          dimension: rule.dimension,
          polarity: rule.polarity,
          sourceType: 'AI_EXTRACTED',
          confidence: 0.95,
          matchedKeyword
        });
        cautionAlerts.push(rule.displayName);
      }
    }
  }

  // 감성 점수 계산 (-1.00 ~ +1.00)
  const total = positiveHits + negativeHits;
  let sentimentScore = 0.50; // 기본 중립
  if (total > 0) {
    sentimentScore = parseFloat(((positiveHits - negativeHits) / total).toFixed(2));
  }

  return {
    extractedTags,
    sentimentScore,
    cautionAlerts
  };
}

module.exports = {
  TAG_EXTRACTION_RULES,
  extractInsightsFromReview
};
