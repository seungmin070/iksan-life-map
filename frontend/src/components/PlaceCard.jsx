import React from 'react';
import { 
  Star, Clock, CreditCard, MapPin, MessageSquare, AlertTriangle, 
  ShieldCheck, Sparkles, PackageCheck, Bike, Waves, Printer, HeartPulse, ShoppingBag, Store,
  Carrot, Heart, Navigation
} from 'lucide-react';

export default function PlaceCard({
  place,
  isSelected,
  onSelect,
  onOpenDetail,
  onOpenReviewForm,
  onSetAsDestination
}) {
  const {
    id,
    name,
    category_slug,
    category_name,
    distanceMeters,
    distanceKm,
    walkMinutes,
    referenceGateName,
    composite_score,
    access_score,
    time_score,
    stability_score,
    total_reviews,
    today_status,
    is_daroum_accepted,
    daroum_cashback_rate,
    takeout_available,
    single_portion_takeout,
    takeout_discount_text,
    delivery_available,
    min_delivery_amount,
    delivery_fee,
    delivery_info_text,
    solo_spec_summary,
    badges = [],
    best_quote
  } = place;

  const displayDistanceKm = distanceKm ? Number(distanceKm).toFixed(1) : ((distanceMeters || 0) / 1000).toFixed(1);

  // 접근성 등급 텍스트
  const getAccessBadgeText = (score) => {
    if (score >= 5) return '접근성 5점 (≤1.3km)';
    if (score >= 4) return '접근성 4점 (1.4~1.8km)';
    if (score >= 3) return '접근성 3점 (1.9~2.3km)';
    if (score >= 2) return '접근성 2점 (2.4~2.8km)';
    return '접근성 1점 (≥2.9km 원거리)';
  };

  // 카테고리 테마 색상 및 아이콘
  const getCategoryMeta = (slug) => {
    switch (slug) {
      case 'daiso':
        return { color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)', border: 'rgba(236, 72, 153, 0.3)', icon: <Sparkles size={12} /> };
      case 'food_mart':
        return { color: '#16a34a', bg: 'rgba(22, 163, 74, 0.1)', border: 'rgba(22, 163, 74, 0.3)', icon: <Carrot size={12} /> };
      case 'mart':
        return { color: '#0284c7', bg: 'rgba(2, 132, 199, 0.1)', border: 'rgba(2, 132, 199, 0.3)', icon: <ShoppingBag size={12} /> };
      case 'essentials':
        return { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.3)', icon: <Heart size={12} /> };
      case 'market':
        return { color: '#ea580c', bg: 'rgba(234, 88, 12, 0.1)', border: 'rgba(234, 88, 12, 0.3)', icon: <Store size={12} /> };
      case 'laundry':
        return { color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.3)', icon: <Waves size={12} /> };
      case 'print':
        return { color: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)', border: 'rgba(37, 99, 235, 0.3)', icon: <Printer size={12} /> };
      case 'pharmacy':
        return { color: '#059669', bg: 'rgba(5, 150, 105, 0.1)', border: 'rgba(5, 150, 105, 0.3)', icon: <HeartPulse size={12} /> };
      default:
        return { color: '#0d9488', bg: 'rgba(13, 148, 136, 0.1)', border: 'rgba(13, 148, 136, 0.3)', icon: <MapPin size={12} /> };
    }
  };

  const catMeta = getCategoryMeta(category_slug);
  const is24H = today_status?.includes('24시간') || today_status?.includes('24H') || category_slug === 'laundry' || category_slug === 'print';
  const isTwoPersonMin = single_portion_takeout === 0;

  return (
    <div
      className={`place-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(place)}
    >
      {/* 1. 상단 타이틀 & 거리 헤더 */}
      <div className="card-header">
        <div className="place-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
            <span 
              className="place-cat-badge"
              style={{
                color: catMeta.color,
                background: catMeta.bg,
                borderColor: catMeta.border,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              {catMeta.icon}
              {category_name}
            </span>

            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: access_score >= 4 ? '#0d9488' : access_score === 3 ? '#b45309' : access_score === 2 ? '#ca8a04' : '#dc2626',
                background: access_score >= 4 ? 'rgba(13, 148, 136, 0.1)' : access_score === 3 ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                padding: '1px 6px',
                borderRadius: '4px',
                border: `1px solid ${access_score >= 4 ? 'rgba(13, 148, 136, 0.3)' : access_score === 3 ? 'rgba(234, 179, 8, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
              }}
            >
              {getAccessBadgeText(access_score)}
            </span>
          </div>

          <h3 className="place-name">{name}</h3>

          <div className="place-distance">
            <MapPin size={12} color="var(--primary)" />
            <span>
              {referenceGateName} 기준{' '}
              <strong className="distance-highlight">{displayDistanceKm} km</strong> (🚶 도보 약 {walkMinutes}분 · 🚗 차로 약 {place.driveMinutes || Math.max(2, Math.round(Number(displayDistanceKm) * 2.5))}분)
            </span>
          </div>
        </div>
      </div>

      {/* 2. 3-bar metric visualizer (Accessibility, Time Sufficiency, Operating Stability) */}
      <div className="card-score-box">
        <div className="overall-score-col">
          <div className="score-star-num" title="종합 평점: (접근성 + 시간충분성 + 운영안정성) / 3">
            <Star size={16} fill="#f59e0b" color="#f59e0b" />
            <span>{(composite_score || 0).toFixed(2)}</span>
          </div>
          <span className="score-reviews-count">종합 평균 점수</span>
        </div>

        <div className="axis-bars-col">
          {/* 접근성 (거리 실측 5~1점) */}
          <div className="metric-bar-row">
            <span className="metric-bar-label" title="원광대병원 실측 거리 기준">🚶 접근성</span>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{
                  width: `${Math.min(100, ((access_score || 0) / 5) * 100)}%`,
                  background: access_score >= 4 ? '#0d9488' : access_score === 3 ? '#eab308' : '#ef4444'
                }}
              />
            </div>
            <span className="metric-bar-val">{(access_score || 0).toFixed(1)}</span>
          </div>

          {/* 시간 충분성 */}
          <div className="metric-bar-row">
            <span className="metric-bar-label" title="심야 영업 및 이용 시간 편의">⏰ 시간충분</span>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{
                  width: `${Math.min(100, ((time_score || 0) / 5) * 100)}%`,
                  background: time_score >= 4 ? '#0284c7' : '#f97316'
                }}
              />
            </div>
            <span className="metric-bar-val">{(time_score || 0).toFixed(1)}</span>
          </div>

          {/* 운영 안정성 */}
          <div className="metric-bar-row">
            <span className="metric-bar-label" title="연중무휴/의무휴업일 예측 안정성">🏢 운영안정</span>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{
                  width: `${Math.min(100, ((stability_score || 0) / 5) * 100)}%`,
                  background: stability_score >= 4 ? '#4f46e5' : '#e11d48'
                }}
              />
            </div>
            <span className="metric-bar-val">{(stability_score || 0).toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* 3. Dedicated badges (1-Person Portion, Iksan Daroum 10%, 24 Hours Open, Caution: 2-Person Min) */}
      <div className="card-solo-specs-strip">
        {/* 1인분 포장 가능 배지 */}
        {!isTwoPersonMin && (
          <span className="spec-chip takeout-yes" title="1-Person Portion Available">
            <PackageCheck size={11} /> #1인분_포장가능
          </span>
        )}

        {/* 2인분 이상 포장 주의 배지 */}
        {isTwoPersonMin && (
          <span className="spec-chip takeout-no" title="Caution: 2-Person Minimum Required">
            <AlertTriangle size={11} /> #2인분이상_주문필수(주의)
          </span>
        )}

        {/* 익산다이로움 10% 캐시백 배지 */}
        {is_daroum_accepted === 1 ? (
          <span className="spec-chip daroum-chip" title="익산다이로움 10% 캐시백 가맹점 (1만원 결제 시 1,000원 즉시 환급)">
            <CreditCard size={11} /> #익산다이로움_10%환급
          </span>
        ) : (
          <span className="spec-chip takeout-no" title="대기업 직영 연매출 30억원 초과 대형마트 (다이로움 캐시백 제외)">
            <CreditCard size={11} /> #다이로움제외(대형마트)
          </span>
        )}

        {/* 24시간 영업 배지 */}
        {is24H && (
          <span className="spec-chip open24h-chip" title="24 Hours Open">
            <Clock size={11} /> #24시간_영업
          </span>
        )}
      </div>

      {/* 4. 원룸촌 배달 및 픽업 정보 박스 (Clear Delivery Info) */}
      <div className="card-delivery-box">
        {delivery_available === 1 ? (
          <div className="delivery-info-line">
            <Bike size={12} color="#0284c7" />
            <span>
              <strong>원룸촌 배달:</strong> 최소주문 {(min_delivery_amount || 0).toLocaleString()}원 · 배달팁 {(delivery_fee || 0).toLocaleString()}원
            </span>
          </div>
        ) : (
          <div className="delivery-info-line">
            <MapPin size={12} color="#64748b" />
            <span>
              <strong>픽업/방문:</strong> {delivery_info_text || '원룸촌/대학로 현장 방문 및 셀프 수령'}
            </span>
          </div>
        )}
      </div>

      {/* 5. 1인 가구 특화 스펙 요약 문구 */}
      {solo_spec_summary && (
        <div className="card-solo-summary">
          💡 {solo_spec_summary}
        </div>
      )}

      {/* 6. 태그 배지 목록 */}
      <div className="card-badges-row">
        {badges.map((b, idx) => (
          <span
            key={idx}
            className={`badge-tag ${
              b.polarity === 'CAUTION'
                ? 'caution'
                : b.tag_slug?.includes('daroum')
                ? 'daroum'
                : 'positive'
            }`}
          >
            {b.polarity === 'CAUTION' && <AlertTriangle size={11} style={{ marginRight: 3, verticalAlign: 'middle' }} />}
            {b.display_name}
          </span>
        ))}
      </div>

      {/* 7. 영업 상태 */}
      <div className="card-specs">
        <div className="spec-line">
          <Clock size={13} color="var(--text-muted)" />
          <span style={{ fontWeight: 600, color: today_status?.includes('마감') || today_status?.includes('주의') ? '#b45309' : 'var(--primary)' }}>
            {today_status || '영업 중'}
          </span>
        </div>
      </div>

      {/* 8. 자취생 솔직 한줄평 */}
      {best_quote && (
        <div className="card-quote-box">
          "{best_quote}"
        </div>
      )}

      {/* 9. 액션 버튼 */}
      <div className="card-footer" onClick={(e) => e.stopPropagation()}>
        <button
          className="btn-small btn-outline"
          onClick={() => onOpenDetail(place)}
        >
          <MessageSquare size={12} />
          상세 ({total_reviews})
        </button>
        {onSetAsDestination && (
          <button
            className="btn-small btn-route"
            onClick={() => onSetAsDestination(place)}
            title="이곳을 목적지로 도보 경로 및 소요시간 계산"
          >
            <Navigation size={12} />
            길찾기
          </button>
        )}
        <button
          className="btn-small btn-primary"
          onClick={() => onOpenReviewForm(place)}
        >
          ✍️ 리뷰
        </button>
      </div>
    </div>
  );
}
