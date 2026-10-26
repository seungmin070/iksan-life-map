import React, { useState } from 'react';
import {
  Navigation,
  ArrowRightLeft,
  MapPin,
  Footprints,
  Clock,
  Car,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Crosshair,
  Sparkles,
  Info,
  X
} from 'lucide-react';
import {
  calculateDistanceMeters,
  estimateWalkingInfo,
  calculateAccessibilityScore
} from '../data/mockData';

export default function RoutePlannerWidget({
  campusNodes = [],
  places = [],
  selectedOriginNodeId,
  onSelectOriginNode,
  userGpsLocation,
  onRequestGps,
  selectedDestinationPlace,
  onSelectDestinationPlace,
  onClose
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  // 현재 유효한 출발지 좌표 및 명칭 구하기
  let originLat = 35.9685;
  let originLng = 126.9582;
  let originName = '원광대학교병원';

  if (selectedOriginNodeId === 'gps' && userGpsLocation) {
    originLat = userGpsLocation.lat;
    originLng = userGpsLocation.lng;
    originName = '📍 내 현재 위치 (GPS)';
  } else {
    const node = campusNodes.find((n) => n.id === Number(selectedOriginNodeId));
    if (node) {
      originLat = node.lat;
      originLng = node.lng;
      originName = node.node_name.split(' ')[0];
    }
  }

  // 목적지 (점포)
  const destination = selectedDestinationPlace || places[0];

  // 거리 및 도보 계산
  let distMeters = 0;
  let walkingInfo = { actualWalkMeters: 0, walkMinutes: 1, walkSteps: 0, taxiFare: 4000 };
  let accessScore = 5.0;

  if (destination) {
    distMeters = calculateDistanceMeters(originLat, originLng, destination.lat, destination.lng);
    walkingInfo = estimateWalkingInfo(distMeters);
    accessScore = calculateAccessibilityScore(distMeters / 1000);
  }

  // 카카오 지도 도보 길찾기 외부 링크
  const kakaoRouteUrl = destination
    ? `https://map.kakao.com/?sName=${encodeURIComponent(originName)}&eName=${encodeURIComponent(destination.name)}`
    : '#';

  return (
    <div className={`route-planner-widget ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {/* 위젯 헤더 바 */}
      <div className="planner-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="planner-header-title">
          <Navigation size={16} className="planner-nav-icon" />
          <span>맞춤형 도보 거리 & 경로 계산기</span>
          <span className="naver-style-badge">네이버 지도 스타일</span>
        </div>
        <div className="planner-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            className="planner-toggle-btn"
            aria-label={isExpanded ? '접기' : '펼치기'}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
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
            {/* 출발지 선택 */}
            <div className="planner-input-group">
              <span className="route-point-marker origin-marker">출발</span>
              <select
                className="planner-select"
                value={selectedOriginNodeId}
                onChange={(e) => onSelectOriginNode(e.target.value)}
              >
                {userGpsLocation && (
                  <option value="gps">📍 내 현재 위치 (GPS 실시간)</option>
                )}
                {campusNodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.node_name}
                  </option>
                ))}
              </select>

              {/* GPS 즉시 감지 버튼 */}
              <button
                className="btn-gps-locate"
                onClick={onRequestGps}
                title="내 현재 GPS 위치 감지하여 출발지로 설정"
              >
                <Crosshair size={14} />
              </button>
            </div>

            {/* 스왑 버튼 ⇄ */}
            <div className="planner-swap-btn-wrap">
              <button
                className="planner-swap-btn"
                title="출발지와 도착지 전환 (왕복/복귀 시간 계산)"
                onClick={() => {
                  // 간단한 스왑 토글 안내
                  if (destination) {
                    alert(`'${destination.name}'에서 자취방/거점 복귀 경로로 거리를 산출합니다.`);
                  }
                }}
              >
                <ArrowRightLeft size={14} />
              </button>
            </div>

            {/* 도착지 선택 */}
            <div className="planner-input-group">
              <span className="route-point-marker dest-marker">도착</span>
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
              <div className="result-main-row">
                <div className="result-time-box">
                  <span className="result-time-label">실제 도보 소요시간</span>
                  <div className="result-time-val">
                    <span className="val-minutes">{walkingInfo.walkMinutes}</span>
                    <span className="val-unit">분</span>
                    <span className="val-distance">
                      (실보행 약 {walkingInfo.actualWalkMeters.toLocaleString()}m)
                    </span>
                  </div>
                </div>

                <div className="result-score-box">
                  <span className="result-score-label">1인가구 접근성</span>
                  <div className="result-score-val">
                    ★ {accessScore.toFixed(1)}점
                  </div>
                </div>
              </div>

              {/* 서브 지표: 걸음수, 택시비, 다로움 혜택 */}
              <div className="result-chips-row">
                <div className="result-chip">
                  <Footprints size={13} color="#0d9488" />
                  <span>약 {walkingInfo.walkSteps.toLocaleString()}보</span>
                </div>
                <div className="result-chip">
                  <Car size={13} color="#6366f1" />
                  <span>택시 약 {walkingInfo.taxiFare.toLocaleString()}원</span>
                </div>
                <div className="result-chip">
                  <Sparkles size={13} color="#ea580c" />
                  <span>
                    {destination.is_daroum_accepted ? '다로움 10% 환급 가맹점' : '다로움 사용 불가'}
                  </span>
                </div>
              </div>

              {/* 카카오맵 공식 길찾기 바로가기 */}
              <div className="result-footer-row">
                <span className="result-hint-text">
                  <Info size={13} />
                  <span>익산 시내 골목길 및 횡단보도 대기 시간이 반영된 보정 도보 수치입니다.</span>
                </span>
                <a
                  href={kakaoRouteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-open-kakaomap"
                >
                  <span>카카오맵 정밀 길찾기</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
