import React from 'react';
import { 
  X, Star, MapPin, Clock, CreditCard, AlertTriangle, ShieldCheck, Info,
  PackageCheck, Bike, Sparkles, Waves, Printer, HeartPulse, ShoppingBag, Store, Phone, CheckCircle2
} from 'lucide-react';

export default function PlaceDetailModal({
  place,
  onClose,
  onOpenReviewForm
}) {
  if (!place) return null;

  const {
    id,
    name,
    category_slug,
    category_name,
    road_address,
    phone,
    today_status,
    business_hours_text,
    distanceKm,
    distanceMeters,
    walkMinutes,
    referenceGateName,
    is_daroum_accepted,
    daroum_cashback_rate,
    composite_score,
    access_score,
    time_score,
    stability_score,
    total_reviews,
    takeout_available,
    single_portion_takeout,
    takeout_discount_text,
    delivery_available,
    min_delivery_amount,
    delivery_fee,
    delivery_info_text,
    solo_spec_summary,
    badges = [],
    reviews = []
  } = place;

  const displayDistanceKm = distanceKm ? Number(distanceKm).toFixed(1) : ((distanceMeters || 0) / 1000).toFixed(1);

  // 카테고리 테마 색상 및 아이콘
  const getCategoryMeta = (slug) => {
    switch (slug) {
      case 'daiso':
        return { color: '#ec4899', bg: '#fdf2f8', border: '#fbcfe8', icon: <Sparkles size={13} /> };
      case 'mart':
        return { color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd', icon: <ShoppingBag size={13} /> };
      case 'market':
        return { color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', icon: <Store size={13} /> };
      case 'laundry':
        return { color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe', icon: <Waves size={13} /> };
      case 'print':
        return { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: <Printer size={13} /> };
      case 'pharmacy':
        return { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', icon: <HeartPulse size={13} /> };
      default:
        return { color: '#0d9488', bg: '#f0fdfa', border: '#99f6e4', icon: <MapPin size={13} /> };
    }
  };

  const catMeta = getCategoryMeta(category_slug);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* 모달 상단 헤더 */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
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
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: access_score >= 4 ? '#0d9488' : access_score === 3 ? '#b45309' : '#dc2626',
                  background: access_score >= 4 ? '#f0fdfa' : access_score === 3 ? '#fefce8' : '#fef2f2',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  border: `1px solid ${access_score >= 4 ? '#99f6e4' : access_score === 3 ? '#fde047' : '#fecaca'}`
                }}
              >
                접근성 {access_score.toFixed(1)}점
              </span>
            </div>
            <h2>{name}</h2>
          </div>
          <button onClick={onClose} style={{ color: '#64748b', cursor: 'pointer', padding: '4px' }}>
            <X size={22} />
          </button>
        </div>

        <div className="modal-body">
          {/* 1. 기본 위치 및 운영 시간 정보 */}
          <div className="modal-info-box">
            <div className="modal-info-item">
              <MapPin size={15} color="#0d9488" style={{ flexShrink: 0 }} />
              <span>{road_address}</span>
            </div>
            <div className="modal-info-item" style={{ color: '#0d9488', fontWeight: 600 }}>
              <MapPin size={15} color="#0d9488" style={{ flexShrink: 0 }} />
              <span>
                {referenceGateName} 기준 거리: <strong>{displayDistanceKm} km</strong> (도보 약 {walkMinutes}분 소요)
              </span>
            </div>
            {phone && (
              <div className="modal-info-item">
                <Phone size={15} color="#64748b" style={{ flexShrink: 0 }} />
                <span>연락처: <strong>{phone}</strong></span>
              </div>
            )}
            <div className="modal-info-item">
              <Clock size={15} color="#64748b" style={{ flexShrink: 0 }} />
              <span>{business_hours_text || today_status}</span>
            </div>
          </div>

          {/* 2. ★ 1인 가구 배달 & 포장 스펙 (Solo Living Specs) 전용 하이라이트 섹션 */}
          <div className="solo-specs-card">
            <div className="solo-specs-title">
              <span style={{ fontSize: '1.05rem' }}>🛵</span>
              <h4>1인 가구 배달 & 포장 스펙 (Solo Living Specs)</h4>
            </div>

            <div className="solo-specs-grid">
              {/* A. 포장 (Takeout) 스펙 */}
              <div className="spec-card">
                <div className="spec-card-header">
                  <PackageCheck size={16} color="#0d9488" />
                  <strong>포장 (Takeout) 옵션</strong>
                </div>
                <div style={{ marginTop: '0.4rem' }}>
                  {single_portion_takeout === 1 ? (
                    <span className="spec-badge-pill green">
                      <CheckCircle2 size={12} /> 1인분 포장 가능
                    </span>
                  ) : (
                    <span className="spec-badge-pill red">
                      <AlertTriangle size={12} /> 2인분 이상 포장 필수 (주의)
                    </span>
                  )}
                </div>
                <p className="spec-desc">
                  {takeout_discount_text || '방문 포장 및 현장 수령 가능'}
                </p>
              </div>

              {/* B. 배달 (Delivery) 스펙 */}
              <div className="spec-card">
                <div className="spec-card-header">
                  <Bike size={16} color="#0284c7" />
                  <strong>배달 (Delivery) 조건</strong>
                </div>
                <div style={{ marginTop: '0.4rem' }}>
                  {delivery_available === 1 ? (
                    <span className="spec-badge-pill blue">
                      <Bike size={12} /> 배달 주문 가능
                    </span>
                  ) : (
                    <span className="spec-badge-pill gray">
                      📍 방문·셀프 전용 (배달 불가)
                    </span>
                  )}
                </div>
                <div className="spec-desc">
                  {delivery_available === 1 ? (
                    <>
                      <div>• 최소주문: <strong>{(min_delivery_amount || 0).toLocaleString()}원</strong></div>
                      <div>• 예상 배달팁: <strong>{(delivery_fee || 0).toLocaleString()}원</strong></div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>{delivery_info_text}</div>
                    </>
                  ) : (
                    <div>{delivery_info_text || '매장 직접 방문 및 셀프 픽업 이용'}</div>
                  )}
                </div>
              </div>
            </div>

            {/* C. 1인 가구 맞춤 편의 요약 */}
            {solo_spec_summary && (
              <div className="solo-spec-footer-tip">
                <strong>💡 자취생 편의 포인트:</strong> {solo_spec_summary}
              </div>
            )}
          </div>

          {/* 3. 3대 평가 기준 점수 상세 박스 */}
          <div className="card-score-box" style={{ padding: '1rem' }}>
            <div className="overall-score-col" style={{ minWidth: '95px' }}>
              <div className="score-star-num" style={{ fontSize: '1.75rem' }}>
                <Star size={22} fill="#f59e0b" color="#f59e0b" />
                <span>{(composite_score || 0).toFixed(2)}</span>
              </div>
              <span className="score-reviews-count">평균 점수 (3대 축)</span>
            </div>

            <div className="axis-bars-col">
              {/* 접근성 */}
              <div className="metric-bar-row">
                <span className="metric-bar-label">🚶 접근성</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${((access_score || 0) / 5) * 100}%`,
                      background: access_score >= 4 ? '#0d9488' : access_score === 3 ? '#eab308' : '#ef4444'
                    }}
                  />
                </div>
                <span className="metric-bar-val">{(access_score || 0).toFixed(1)}</span>
              </div>

              {/* 시간 충분성 */}
              <div className="metric-bar-row">
                <span className="metric-bar-label">⏰ 시간충분</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${((time_score || 0) / 5) * 100}%`,
                      background: time_score >= 4 ? '#0284c7' : '#f97316'
                    }}
                  />
                </div>
                <span className="metric-bar-val">{(time_score || 0).toFixed(1)}</span>
              </div>

              {/* 운영 안정성 */}
              <div className="metric-bar-row">
                <span className="metric-bar-label">🏢 운영안정</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${((stability_score || 0) / 5) * 100}%`,
                      background: stability_score >= 4 ? '#4f46e5' : '#e11d48'
                    }}
                  />
                </div>
                <span className="metric-bar-val">{(stability_score || 0).toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* 4. 접근성 거리 평가 기준 가이드 카드 */}
          <div className="criteria-guide-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#0f766e', fontWeight: 700, marginBottom: '0.35rem' }}>
              <Info size={14} />
              <span>원광대학교병원 기준 접근성(거리) 평가 공식</span>
            </div>
            <div className="criteria-grid">
              <div className={`criteria-cell ${access_score === 5 ? 'active-5' : ''}`}>
                <strong>5점</strong><br />≤1.3km
              </div>
              <div className={`criteria-cell ${access_score === 4 ? 'active-4' : ''}`}>
                <strong>4점</strong><br />1.4~1.8km
              </div>
              <div className={`criteria-cell ${access_score === 3 ? 'active-3' : ''}`}>
                <strong>3점</strong><br />1.9~2.3km
              </div>
              <div className={`criteria-cell ${access_score === 2 ? 'active-2' : ''}`}>
                <strong>2점</strong><br />2.4~2.8km
              </div>
              <div className={`criteria-cell ${access_score === 1 ? 'active-1' : ''}`}>
                <strong>1점</strong><br />≥2.9km
              </div>
            </div>
          </div>

          {/* 5. 승격된 대표 배지 목록 */}
          <div>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#1e293b' }}>
              🏷️ 편의 및 운영 특성 배지
            </h4>
            <div className="card-badges-row">
              {is_daroum_accepted === 1 && (
                <span className="badge-tag daroum">
                  💳 익산다로움 ({Math.round((daroum_cashback_rate || 0.1) * 100)}% 캐시백 가맹)
                </span>
              )}
              {badges.map((b, i) => (
                <span
                  key={i}
                  className={`badge-tag ${
                    b.polarity === 'CAUTION'
                      ? 'caution'
                      : b.tag_slug?.includes('daroum')
                      ? 'daroum'
                      : 'positive'
                  }`}
                >
                  {b.polarity === 'CAUTION' && <AlertTriangle size={12} style={{ marginRight: 3 }} />}
                  {b.display_name}
                </span>
              ))}
            </div>
          </div>

          {/* 6. 리뷰 목록 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '0.95rem', color: '#1e293b' }}>
                💬 원대병원 실습생 & 자취생 솔직 리뷰 ({reviews.length})
              </h4>
              <button
                className="btn-small btn-primary"
                onClick={() => {
                  onClose();
                  onOpenReviewForm(place);
                }}
              >
                ✍️ 나도 리뷰 쓰기
              </button>
            </div>

            {reviews.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>아직 등록된 리뷰가 없습니다. 첫 리뷰를 남겨보세요!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {reviews.map((rev) => (
                  <div key={rev.id} className="review-item-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{rev.nickname}</span>
                        {rev.verification_tier === 'WONKWANG_STUDENT' && (
                          <span className="tier-tag student">
                            <ShieldCheck size={11} /> 원대병원/학생 인증
                          </span>
                        )}
                        {rev.verification_tier === 'IKSAN_RESIDENT' && (
                          <span className="tier-tag resident">
                            🏠 익산시민 인증
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#d97706', fontWeight: 800 }}>
                        <Star size={14} fill="#d97706" />
                        <span style={{ fontSize: '0.85rem' }}>{(rev.overall_rating || 0).toFixed(1)}</span>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5, marginBottom: '0.4rem' }}>
                      {rev.content}
                    </p>

                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                      <span>{rev.created_at?.slice(0, 10)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-small btn-outline" onClick={onClose}>
            닫기
          </button>
          <button
            className="btn-small btn-primary"
            onClick={() => {
              onClose();
              onOpenReviewForm(place);
            }}
          >
            리뷰 작성하기
          </button>
        </div>
      </div>
    </div>
  );
}
