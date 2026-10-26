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
  Heart,
  Home,
  Car
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
  originName = '대학로 1길 자취방',
  onClose,
  onOpenDetail,
  onSetAsDestination
}) {
  if (!place) return null;

  const CategoryIcon = CATEGORY_ICONS[place.category_slug] || MapPin;
  const isDaroum = place.is_daroum_accepted === 1;
  const kakaoDirectionsUrl = `https://map.kakao.com/link/to/${encodeURIComponent(place.name)},${place.lat},${place.lng}`;

  return (
    <div
      className="floating-map-card animate-slide-up"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. 상단 바: 카테고리 뱃지 & 'X' 닫기 버튼 */}
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

        {/* 필수 요구사항: 명확한 'X' 닫기 버튼 */}
        <button
          className="floating-close-btn"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="닫기"
          title="오버레이 닫기"
        >
          <X size={16} />
        </button>
      </div>

      {/* 2. 장소 타이틀 & 평점 */}
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

      {/* 3. 자취방 기준 실시간 도보/차량 시간 및 정확한 거리 */}
      <div className="floating-distance-box">
        <div className="dist-origin-row">
          <Home size={12} color="#0284c7" />
          <span className="dist-label">출발지: {originName}</span>
        </div>
        <div className="dist-metrics-row">
          <div className="dist-time-item walk">
            <span className="dist-walk-highlight">
              🚶 도보 약 {place.walkMinutes || 1}분
            </span>
            <span className="dist-meters-sub">
              ({place.actualWalkMeters ? (place.actualWalkMeters >= 1000 ? `${(place.actualWalkMeters / 1000).toFixed(1)}km` : `${place.actualWalkMeters}m`) : `${place.distanceKm || 0.1}km`})
            </span>
          </div>
          <div className="dist-time-item drive">
            <span className="dist-drive-highlight">
              🚗 차로 약 {place.driveMinutes || 3}분
            </span>
          </div>
          {place.walkSteps && (
            <span className="dist-steps-badge">
              <Footprints size={11} /> 약 {place.walkSteps.toLocaleString()}보
            </span>
          )}
        </div>
      </div>

      {/* 4. 익산다로움 10% 캐시백 상세 안내 배너 */}
      <div className={`daroum-banner ${isDaroum ? 'daroum-active' : 'daroum-inactive'}`}>
        <CreditCard size={14} />
        <div className="daroum-banner-text">
          <strong>
            {isDaroum
              ? '익산다이로움 10% 즉시 캐시백 가맹점'
              : '대기업 직영 대형마트 (다이로움 10% 제외 매장)'}
          </strong>
          <span className="daroum-banner-sub">
            {isDaroum
              ? '1만원 결제 시 1,000원 환급 · 5만원 장보기 시 5,000원 즉시 캐시백 (월 최대 3만원 세이브)'
              : '연매출 30억원 초과 대형마트 매장으로 다이로움 캐시백 미적용 대상입니다.'}
          </span>
        </div>
      </div>

      {/* 5. 3개 축 지표 미니 바 */}
      <div className="floating-scores-compact">
        <div className="compact-score-row">
          <span className="score-name">접근성</span>
          <div className="score-bar-mini">
            <div
              className="score-bar-mini-fill"
              style={{ width: `${((place.access_score || 1) / 5) * 100}%`, background: 'var(--primary)' }}
            />
          </div>
          <span className="score-val">{(place.access_score || 1).toFixed(1)}</span>
        </div>

        <div className="compact-score-row">
          <span className="score-name">시간여유</span>
          <div className="score-bar-mini">
            <div
              className="score-bar-mini-fill"
              style={{ width: `${((place.time_score || 1) / 5) * 100}%`, background: '#6366f1' }}
            />
          </div>
          <span className="score-val">{(place.time_score || 1).toFixed(1)}</span>
        </div>

        <div className="compact-score-row">
          <span className="score-name">운영안정</span>
          <div className="score-bar-mini">
            <div
              className="score-bar-mini-fill"
              style={{ width: `${((place.stability_score || 1) / 5) * 100}%`, background: '#10b981' }}
            />
          </div>
          <span className="score-val">{(place.stability_score || 1).toFixed(1)}</span>
        </div>
      </div>

      {/* 6. 자취생 솔직 한줄평 */}
      {place.best_quote && (
        <div className="floating-quote-box">
          <Quote size={12} className="quote-icon" />
          <p className="floating-quote-text">"{place.best_quote}"</p>
        </div>
      )}

      {/* 7. 액션 버튼: 길찾기 & 상세 후기 */}
      <div className="floating-actions-row">
        <button
          className="btn-floating-action route"
          onClick={() => onSetAsDestination && onSetAsDestination(place)}
          title="이곳을 목적지로 도보 경로 계산"
        >
          <Navigation size={13} />
          <span>도착지 길찾기</span>
        </button>

        <button
          className="btn-floating-action detail"
          onClick={() => onOpenDetail && onOpenDetail(place)}
          title="상세 후기 및 1인가구 스펙 모달 열기"
        >
          <span>상세 후기</span>
        </button>

        <a
          href={kakaoDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-floating-action kakao"
          title="카카오맵 공식 길찾기로 열기"
        >
          <ExternalLink size={13} />
          <span>카카오맵</span>
        </a>
      </div>
    </div>
  );
}
