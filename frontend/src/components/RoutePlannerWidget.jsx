import React, { useState } from 'react';
import {
  Navigation,
  ArrowRightLeft,
  MapPin,
  Footprints,
  Clock,
  Car,
  Flame,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Crosshair,
  Sparkles,
  Info,
  X,
  Compass,
  Home
} from 'lucide-react';
import {
  VIRTUAL_STUDIO_ROOMS,
  calculateDistanceMeters,
  estimateWalkingInfo,
  calculateAccessibilityScore
} from '../data/mockData';

export default function RoutePlannerWidget({
  studioRooms = VIRTUAL_STUDIO_ROOMS,
  campusNodes = [],
  places = [],
  selectedOriginId = 'studio-daehakro',
  onSelectOrigin,
  userGpsLocation,
  onRequestGps,
  selectedDestinationPlace,
  onSelectDestinationPlace,
  onFitRouteBounds,
  onClose
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  // 1. 현재 출발지 좌표 및 명칭 구하기
  let originLat = 35.9692;
  let originLng = 126.9575;
  let originName = '대학로 1길 원룸타운';
  let originDesc = '원광대 학생식당 및 대학로 상권 초근접';

  if (selectedOriginId === 'gps' && userGpsLocation) {
    originLat = userGpsLocation.lat;
    originLng = userGpsLocation.lng;
    originName = '📍 내 현재 위치 (GPS 실시간)';
    originDesc = '브라우저 실시간 GPS 위치';
  } else {
    // 1순위: 자취방 프리셋에서 검색
    const studio = studioRooms.find((s) => s.id === selectedOriginId);
    if (studio) {
      originLat = studio.lat;
      originLng = studio.lng;
      originName = studio.name;
      originDesc = studio.desc;
    } else {
      // 2순위: 캠퍼스 거점 노드에서 검색
      const node = campusNodes.find((n) => n.id === Number(selectedOriginId));
      if (node) {
        originLat = node.lat;
        originLng = node.lng;
        originName = node.node_name;
        originDesc = node.description;
      }
    }
  }

  // 2. 목적지 점포
  const destination = selectedDestinationPlace || places[0];

  // 3. 실제 도보 거리, 시간, 걸음수, 칼로리 계산
  let distMeters = 0;
  let walkingInfo = { actualWalkMeters: 0, walkMinutes: 1, walkSteps: 0, caloriesKcal: 5, taxiFare: 4000 };
  let accessScore = 5.0;

  if (destination) {
    distMeters = calculateDistanceMeters(originLat, originLng, destination.lat, destination.lng);
    walkingInfo = estimateWalkingInfo(distMeters);
    accessScore = calculateAccessibilityScore(distMeters / 1000);
  }

  // 카카오맵 및 네이버 지도 길찾기 외부 링크
  const kakaoRouteUrl = destination
    ? `https://map.kakao.com/?sName=${encodeURIComponent(originName)}&eName=${encodeURIComponent(destination.name)}`
    : '#';
  const naverRouteUrl = destination
    ? `https://map.naver.com/v5/directions/${originLng},${originLat},${encodeURIComponent(originName)}/${destination.lng},${destination.lat},${encodeURIComponent(destination.name)}/-/walk`
    : '#';

  return (
    <div className={`route-planner-widget ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {/* 위젯 헤더 바 */}
      <div className="planner-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="planner-header-title">
          <Navigation size={16} className="planner-nav-icon" />
          <span>네이버 지도 스타일 도보 경로 계산기</span>
          <span className="naver-style-badge">실시간 보행로</span>
        </div>
        <div className="planner-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            className="planner-toggle-btn"
            aria-label={isExpanded ? '접기' : '펼치기'}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            title={isExpanded ? '위젯 접기' : '위젯 펼치기'}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {onClose && (
            <button
              className="planner-close-btn"
              aria-label="닫기"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              title="계산기 닫기"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="planner-body animate-fade-in">
          {/* 출발지 - 도착지 입력 컨트롤 행 */}
          <div className="planner-inputs-container">
            {/* 출발지: 가상 자취방 선택 */}
            <div className="planner-input-group">
              <span className="route-point-marker origin-marker">출발 (자취방)</span>
              <select
                className="planner-select"
                value={selectedOriginId}
                onChange={(e) => onSelectOrigin(e.target.value)}
              >
                {userGpsLocation && (
                  <option value="gps">📍 내 현재 위치 (GPS 실시간 감지)</option>
                )}
                <optgroup label="🏠 원광대 인근 가상 자취방 포인트 (원룸촌)">
                  {studioRooms.map((studio) => (
                    <option key={studio.id} value={studio.id}>
                      {studio.name} ({studio.zone})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🏥 대학/병원 주요 거점">
                  {campusNodes.map((node) => (
                    <option key={`node-${node.id}`} value={node.id}>
                      📍 {node.node_name}
                    </option>
                  ))}
                </optgroup>
              </select>

              {/* GPS 즉시 감지 버튼 */}
              <button
                className="btn-gps-locate"
                onClick={onRequestGps}
                title="내 스마트폰/노트북 현재 GPS 감지"
              >
                <Crosshair size={14} />
              </button>
            </div>

            {/* 출발지 보조 설명 */}
            <div className="origin-sub-desc">
              <Home size={12} style={{ color: '#0284c7' }} />
              <span>{originDesc}</span>
            </div>

            {/* 스왑 버튼 ⇄ */}
            <div className="planner-swap-btn-wrap">
              <button
                className="planner-swap-btn"
                title="출발지와 도착지 맞바꾸기"
                onClick={() => {
                  if (destination) {
                    alert(`출발지[${destination.name}] ↔ 도착지[${originName}] 복귀 도보를 계산합니다.`);
                  }
                }}
              >
                <ArrowRightLeft size={14} />
              </button>
            </div>

            {/* 도착지: 편의 시설/점포 선택 */}
            <div className="planner-input-group">
              <span className="route-point-marker dest-marker">도착 (편의시설)</span>
              <select
                className="planner-select"
                value={destination ? destination.id : ''}
                onChange={(e) => {
                  const found = places.find((p) => p.id === e.target.value);
                  if (found) onSelectDestinationPlace(found);
                }}
              >
                {places.map((place) => (
                  <option key={place.id} value={place.id}>
                    [{place.category_name.split('/')[0].trim()}] {place.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 실시간 계산 결과 카드 (네이버 지도 스타일) */}
          {destination && (
            <div className="planner-result-card">
              {/* 3대 핵심 이동 지표: 도보 시간, 차량 시간, 실측 거리 */}
              <div className="planner-stats-grid">
                <div className="result-stat-box walk-box">
                  <span className="result-stat-label">
                    <Footprints size={13} color="var(--primary)" />
                    <span>도보 이동 시</span>
                  </span>
                  <div className="result-time-val">
                    <span>도보 약 {walkingInfo.walkMinutes}</span>
                    <span className="unit">분</span>
                  </div>
                  <span className="result-sub-metric">약 {walkingInfo.walkSteps.toLocaleString()}보 · {walkingInfo.caloriesKcal || 20}kcal</span>
                </div>

                <div className="result-stat-box drive-box">
                  <span className="result-stat-label">
                    <Car size={13} color="#6366f1" />
                    <span>차량 이동 시</span>
                  </span>
                  <div className="result-time-val" style={{ color: '#6366f1' }}>
                    <span>차로 약 {walkingInfo.driveMinutes || 3}</span>
                    <span className="unit">분</span>
                  </div>
                  <span className="result-sub-metric">택시 약 {walkingInfo.taxiFare.toLocaleString()}원</span>
                </div>

                <div className="result-stat-box dist-box">
                  <span className="result-stat-label">
                    <MapPin size={13} color="#059669" />
                    <span>정확한 이동 거리</span>
                  </span>
                  <div className="result-dist-val" style={{ color: '#059669' }}>
                    {walkingInfo.actualWalkMeters >= 1000
                      ? `${(walkingInfo.actualWalkMeters / 1000).toFixed(1)} km`
                      : `${walkingInfo.actualWalkMeters} m`}
                  </div>
                  <span className="result-sub-metric">실제 도로망 기준</span>
                </div>
              </div>

              {/* 익산다이로움 10% 환급 혜택 구체적 시뮬레이션 배너 */}
              <div className={`daroum-benefit-calc-box ${destination.is_daroum_accepted ? 'accepted' : 'excluded'}`}>
                {destination.is_daroum_accepted ? (
                  <>
                    <div className="daroum-calc-header">
                      <Sparkles size={14} color="#ea580c" />
                      <strong>익산다이로움 10% 즉시 환급 가맹점</strong>
                      <span className="calc-badge-live">10% 캐시백 적용</span>
                    </div>
                    <p className="daroum-calc-desc">
                      💰 <strong>1만원 결제 시 1,000원</strong> 즉시 캐시백 / <strong>5만원 장보기 시 5,000원</strong> 환급!
                      <br />
                      <span className="daroum-calc-sub">
                        (월 충전한도 30만원 결제 시 <strong>매월 최대 30,000원 자취비 즉시 세이브</strong>)
                      </span>
                    </p>
                  </>
                ) : (
                  <>
                    <div className="daroum-calc-header">
                      <Info size={14} color="#dc2626" />
                      <strong>익산다이로움 10% 제외 매장 안내</strong>
                      <span className="calc-badge-excluded">다이로움 미적용</span>
                    </div>
                    <p className="daroum-calc-desc">
                      🚫 대기업 직영 및 연매출 30억원 초과 대형마트 매장으로 <strong>다이로움 10% 캐시백이 제외</strong>됩니다. 자체 멤버십 적립을 이용하세요.
                    </p>
                  </>
                )}
              </div>

              {/* 하단: 한눈에 보기 & 외부 길찾기 버튼들 */}
              <div className="result-footer-row">
                {onFitRouteBounds && (
                  <button
                    className="btn-fit-route"
                    onClick={() => onFitRouteBounds(originLat, originLng, destination.lat, destination.lng)}
                    title="출발지와 도착지 경로를 지도 화면에 딱 맞게 확대"
                  >
                    <Compass size={13} />
                    <span>경로 한눈에 보기</span>
                  </button>
                )}

                <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
                  <a
                    href={naverRouteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-open-navermap"
                    title="네이버 지도 공식 도보 길찾기"
                  >
                    <span>네이버 지도</span>
                    <ExternalLink size={12} />
                  </a>
                  <a
                    href={kakaoRouteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-open-kakaomap"
                    title="카카오맵 공식 도보 길찾기"
                  >
                    <span>카카오맵</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
