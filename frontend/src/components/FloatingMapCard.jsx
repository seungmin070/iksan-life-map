import React from 'react';
import {
  X,
  MapPin,
  Clock,
  ShieldCheck,
  CreditCard,
  PackageCheck,
  Navigation,
  ExternalLink,
  Footprints,
  Star,
  Quote,
  Sparkles,
  Carrot,
  ShoppingBag,
  Store,
  Waves,
  Printer,
  HeartPulse,
  Heart
} from 'lucide-react';

const CATEGORY_ICONS = {
  daiso: Sparkles,
  food_mart: Carrot,
  mart: ShoppingBag,
  essentials: Heart,
  market: Store,
  laundry: Waves,
  print: Printer,
  pharmacy: HeartPulse
};

export default function FloatingMapCard({
  place,
  originName = '원광대병원',
  onClose,
  onOpenDetail,
  onSetAsDestination
}) {
  if (!place) return null;

  const CategoryIcon = CATEGORY_ICONS[place.category_slug] || MapPin;

  // 익산다로움 가맹점 여부 및 혜택 안내
  const isDaroum = place.is_daroum_accepted === 1;

  // 카카오 지도 길찾기 URL
  const kakaoDirectionsUrl = `https://map.kakao.com/link/to/${encodeURIComponent(place.name)},${place.lat},${place.lng}`;

  return (
    <div className="floating-map-card animate-slide-up">
      {/* 카드 상단 헤더 */}
      <div className="floating-card-header">
        <div className="floating-card-badge-row">
          <span className={`cat-pill cat-${place.category_slug}`}>
            <CategoryIcon size={12} />
            <span>{place.category_name}</span>
          </span>
          {place.today_status && (
            <span className="status-pill-subtle">
              <span className="live-dot" />
              <span>{place.today_status}</span>
            </span>
          )}
        </div>
        <button
          className="floating-close-btn"
          onClick={onClose}
          aria-label="닫기"
          title="미리보기 닫기"
        >
          <X size={16} />
        </button>
      </div>

      {/* 장소 기본 정보 */}
      <div className="floating-card-body">
        <div className="floating-title-row">
          <h3 className="floating-place-name">{place.name}</h3>
          <div className="floating-score-badge">
            <Star size={13} fill="#f59e0b" color="#f59e0b" />
            <span>{(place.composite_score || 0).toFixed(1)}</span>
          </div>
        </div>

        <p className="floating-address">
          <MapPin size={12} className="inline-icon" />
          <span>{place.road_address}</span>
        </p>

        {/* 실시간 위치 기준 도보 거리 & 소요 시간 안내 */}
        <div className="floating-distance-box">
          <div className="dist-item">
            <span className="dist-label">기준점 ({originName})</span>
            <strong className="dist-val text-primary">
              🚶 도보 약 {place.walkMinutes || 1}분 ({place.distanceKm || 0.1} km)
            </strong>
          </div>
          {place.walkSteps && (
            <div className="dist-steps">
              <Footprints size={12} />
              <span>약 {place.walkSteps.toLocaleString()}보</span>
            </div>
          )}
        </div>

        {/* 익산다로움 혜택 배너 (실시간 강조) */}
        <div className={`daroum-banner ${isDaroum ? 'daroum-active' : 'daroum-inactive'}`}>
          <CreditCard size={15} />
          <div>
            <strong>
              {isDaroum ? '익산다로움 10% 캐시백 가맹점' : '익산다로움 결제 불가 매장'}
            </strong>
            <p>
              {isDaroum
                ? '익산시 지역화폐 다로움 카드로 결제 시 10% 실시간 환급 혜택'
                : '대기업 직영 대형마트 연매출 기준 초과로 다로움 사용이 제한됩니다.'}
            </p>
          </div>
        </div>

        {/* 3대 축 지표 요약 바 */}
        <div className="floating-metrics-grid">
          <div className="f-metric">
            <span className="f-metric-label">접근성</span>
            <div className="f-metric-bar-bg">
              <div
                className="f-metric-bar-fill fill-access"
                style={{ width: `${((place.access_score || 1) / 5) * 100}%` }}
              />
            </div>
            <span className="f-metric-val">{(place.access_score || 1).toFixed(1)}</span>
          </div>
          <div className="f-metric">
            <span className="f-metric-label">시간충분성</span>
            <div className="f-metric-bar-bg">
              <div
                className="f-metric-bar-fill fill-time"
                style={{ width: `${((place.time_score || 1) / 5) * 100}%` }}
              />
            </div>
            <span className="f-metric-val">{(place.time_score || 1).toFixed(1)}</span>
          </div>
          <div className="f-metric">
            <span className="f-metric-label">운영안정성</span>
            <div className="f-metric-bar-bg">
              <div
                className="f-metric-bar-fill fill-stability"
                style={{ width: `${((place.stability_score || 1) / 5) * 100}%` }}
              />
            </div>
            <span className="f-metric-val">{(place.stability_score || 1).toFixed(1)}</span>
          </div>
        </div>

        {/* 1인 가구 혜택 & 학생 생생 한줄 팁 */}
        {place.best_quote && (
          <div className="floating-quote-box">
            <Quote size={13} className="quote-icon" />
            <p className="floating-quote-text">{place.best_quote}</p>
          </div>
        )}
      </div>

      {/* 카드 하단 액션 버튼 그룹 */}
      <div className="floating-card-footer">
        <button
          className="f-btn f-btn-primary"
          onClick={() => onSetAsDestination && onSetAsDestination(place)}
          title="도착지로 설정하여 맞춤형 도보 경로 계산"
        >
          <Navigation size={14} />
          <span>도착지 설정 & 길찾기</span>
        </button>

        <button
          className="f-btn f-btn-secondary"
          onClick={() => onOpenDetail && onOpenDetail(place)}
          title="학생 상세 리뷰 및 편의 스펙 모달 열기"
        >
          <span>상세 후기</span>
        </button>

        <a
          href={kakaoDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="f-btn f-btn-kakao"
          title="카카오맵 공식 길찾기로 열기"
        >
          <ExternalLink size={14} />
          <span>카카오맵</span>
        </a>
      </div>
    </div>
  );
}
