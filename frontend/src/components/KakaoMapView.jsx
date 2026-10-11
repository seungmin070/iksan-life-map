import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, MapPin, Search, AlertCircle, Info, ExternalLink } from 'lucide-react';

export default function KakaoMapView({
  kakaoKey,
  places,
  campusNodes,
  selectedGateId,
  selectedPlace,
  onSelectPlace,
  onSelectKakaoPlace,
  searchQuery,
  onOpenApiKeyModal
}) {
  const mapContainerRef = useRef(null);
  const kakaoMapInstance = useRef(null);
  const overlaysRef = useRef([]);
  const kakaoSearchMarkersRef = useRef([]);

  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const [sdkError, setSdkError] = useState('');
  const [kakaoSearchResults, setKakaoSearchResults] = useState([]);
  const [isSearchingKakao, setIsSearchingKakao] = useState(false);

  // 1. 카카오 지도 SDK 동적 로드
  useEffect(() => {
    if (!kakaoKey) {
      setIsSdkLoaded(false);
      return;
    }

    setSdkError('');
    const scriptId = 'kakao-maps-sdk-script';
    let script = document.getElementById(scriptId);

    const initializeMap = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          setIsSdkLoaded(true);
        });
      }
    };

    if (script) {
      // 기존 스크립트가 다른 키로 로드되어 있다면 교체
      if (script.getAttribute('data-appkey') !== kakaoKey) {
        script.remove();
        script = null;
      } else {
        initializeMap();
        return;
      }
    }

    script = document.createElement('script');
    script.id = scriptId;
    script.setAttribute('data-appkey', kakaoKey);
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&libraries=services,clusterer&autoload=false`;
    script.async = true;

    script.onload = () => {
      initializeMap();
    };

    script.onerror = () => {
      setSdkError('카카오 지도 SDK를 불러오지 못했습니다. 카카오 개발자 콘솔에서 Web 플랫폼 사이트 도메인(http://localhost:5173) 등록 여부를 확인해주세요.');
    };

    document.head.appendChild(script);
  }, [kakaoKey]);

  // 2. 카카오 지도 인스턴스 초기화
  useEffect(() => {
    if (!isSdkLoaded || !mapContainerRef.current || !window.kakao?.maps) return;

    if (!kakaoMapInstance.current) {
      const container = mapContainerRef.current;
      const options = {
        center: new window.kakao.maps.LatLng(35.9705, 126.9575), // 원광대학교 신동 중심
        level: 3
      };

      const map = new window.kakao.maps.Map(container, options);

      // 일반 지도와 스카이뷰 전환 컨트롤 추가
      const mapTypeControl = new window.kakao.maps.MapTypeControl();
      map.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);

      // 줌 컨트롤 추가
      const zoomControl = new window.kakao.maps.ZoomControl();
      map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

      kakaoMapInstance.current = map;
    }
  }, [isSdkLoaded]);

  // 3. 캠퍼스 거점 및 기존 평가 장소 오버레이 렌더링
  useEffect(() => {
    const map = kakaoMapInstance.current;
    if (!map || !window.kakao?.maps) return;

    // 기존 오버레이 정리
    overlaysRef.current.forEach((item) => {
      if (item.setMap) item.setMap(null);
    });
    overlaysRef.current = [];

    // A. 원광대 주요 거점 마커 오버레이
    campusNodes.forEach((node) => {
      const isSelectedGate = node.id === selectedGateId;
      const position = new window.kakao.maps.LatLng(node.lat, node.lng);

      const content = document.createElement('div');
      content.style.cssText = `
        background: ${isSelectedGate ? '#0d9488' : '#1e293b'};
        color: #ffffff;
        font-size: 11px;
        font-weight: 800;
        padding: 4px 10px;
        border-radius: 20px;
        border: 2px solid #ffffff;
        box-shadow: 0 3px 8px rgba(0,0,0,0.35);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
      `;
      content.innerHTML = `<span>🏫 ${node.node_name}</span>`;

      const overlay = new window.kakao.maps.CustomOverlay({
        position,
        content,
        yAnchor: 1.3
      });

      overlay.setMap(map);
      overlaysRef.current.push(overlay);
    });

    // B. 로컬 평가 시스템에 등록된 장소 오버레이
    places.forEach((place) => {
      const isSelected = selectedPlace && selectedPlace.id === place.id;
      const isCaution = place.caution_flags_count > 0;

      let bgColor = '#0d9488';
      let emoji = '📍';
      if (place.category_slug === 'daiso') { bgColor = '#ec4899'; emoji = '✨'; }
      else if (place.category_slug === 'mart') { bgColor = '#0284c7'; emoji = '🛒'; }
      else if (place.category_slug === 'market') { bgColor = '#ea580c'; emoji = '🏪'; }
      else if (place.category_slug === 'laundry') { bgColor = '#6366f1'; emoji = '🧺'; }
      else if (place.category_slug === 'print') { bgColor = '#2563eb'; emoji = '🖨️'; }
      else if (place.category_slug === 'pharmacy') { bgColor = '#059669'; emoji = '💊'; }

      if (isCaution) bgColor = '#e11d48';

      const position = new window.kakao.maps.LatLng(place.lat, place.lng);

      const content = document.createElement('div');
      content.style.cssText = `
        background: ${bgColor};
        color: #ffffff;
        font-size: 11px;
        font-weight: 700;
        padding: 5px 10px;
        border-radius: 12px;
        border: ${isSelected ? '3px solid #facc15' : '2px solid #ffffff'};
        box-shadow: ${isSelected ? '0 0 16px rgba(250, 204, 21, 0.8), 0 4px 12px rgba(0,0,0,0.35)' : '0 4px 12px rgba(0,0,0,0.25)'};
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 5px;
        white-space: nowrap;
        transform: ${isSelected ? 'scale(1.18)' : 'scale(1.0)'};
        transition: transform 0.2s ease;
      `;
      content.innerHTML = `
        <span>${emoji}</span>
        <span>${place.name}</span>
        <span style="background:rgba(0,0,0,0.25);padding:1px 5px;border-radius:6px;color:#fde047;font-weight:800;">★ ${(place.composite_score || 0).toFixed(1)}</span>
        ${place.single_portion_takeout ? '<span style="background:#10b981;color:#fff;border-radius:4px;padding:1px 4px;font-size:9px;">1인</span>' : ''}
        ${place.is_daroum_accepted ? '<span style="background:#ea580c;color:#fff;border-radius:4px;padding:1px 4px;font-size:9px;">다로움</span>' : ''}
      `;

      content.onclick = () => {
        onSelectPlace(place);
      };

      const overlay = new window.kakao.maps.CustomOverlay({
        position,
        content,
        yAnchor: 1.4
      });

      overlay.setMap(map);
      overlaysRef.current.push(overlay);
    });

    // 선택된 장소로 지도 부드럽게 이동
    if (selectedPlace) {
      const moveLatLon = new window.kakao.maps.LatLng(selectedPlace.lat, selectedPlace.lng);
      map.panTo(moveLatLon);
    }
  }, [isSdkLoaded, places, campusNodes, selectedGateId, selectedPlace]);

  // 4. 카카오 실시간 로컬 키워드 검색 (실제 익산 상권 POI 검색)
  useEffect(() => {
    const map = kakaoMapInstance.current;
    if (!map || !window.kakao?.maps?.services || !searchQuery?.trim()) {
      setKakaoSearchResults([]);
      kakaoSearchMarkersRef.current.forEach((m) => m.setMap(null));
      kakaoSearchMarkersRef.current = [];
      return;
    }

    setIsSearchingKakao(true);
    const ps = new window.kakao.maps.services.Places();

    // 원광대 중심 반경 3km 검색 옵션
    const searchOptions = {
      location: new window.kakao.maps.LatLng(35.9705, 126.9575),
      radius: 3000,
      sort: window.kakao.maps.services.SortBy.ACCURACY
    };

    // 검색 질의 (익산 접두어 보강)
    const fullQuery = searchQuery.includes('익산') || searchQuery.includes('원광대')
      ? searchQuery
      : `익산 신동 ${searchQuery}`;

    ps.keywordSearch(
      fullQuery,
      (data, status) => {
        setIsSearchingKakao(false);

        // 기존 카카오 검색 마커 정리
        kakaoSearchMarkersRef.current.forEach((m) => m.setMap(null));
        kakaoSearchMarkersRef.current = [];

        if (status === window.kakao.maps.services.Status.OK) {
          setKakaoSearchResults(data);

          // 지도에 실제 카카오 검색 결과 마커 핀포인트
          data.slice(0, 15).forEach((item) => {
            const position = new window.kakao.maps.LatLng(item.y, item.x);

            const content = document.createElement('div');
            content.style.cssText = `
              background: #f59e0b;
              color: #ffffff;
              font-size: 10px;
              font-weight: 700;
              padding: 3px 7px;
              border-radius: 6px;
              border: 1.5px solid #ffffff;
              box-shadow: 0 3px 8px rgba(0,0,0,0.3);
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 3px;
              white-space: nowrap;
            `;
            content.innerHTML = `<span>📍 ${item.place_name}</span>`;

            content.onclick = () => {
              onSelectKakaoPlace(item);
            };

            const overlay = new window.kakao.maps.CustomOverlay({
              position,
              content,
              yAnchor: 1.2
            });

            overlay.setMap(map);
            kakaoSearchMarkersRef.current.push(overlay);
          });
        } else {
          setKakaoSearchResults([]);
        }
      },
      searchOptions
    );
  }, [searchQuery, isSdkLoaded]);

  return (
    <div className="map-container" style={{ position: 'relative' }}>
      {/* 카카오 지도 캔버스 */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* 카카오 SDK 미설정 상태 안내 배너 */}
      {!kakaoKey && (
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            padding: '0.85rem 1.25rem',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            maxWidth: '90%',
            fontSize: '0.85rem'
          }}
        >
          <Sparkles size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, marginBottom: '2px' }}>
              실제 카카오 지도로 익산시 전체 상권을 불러오시겠습니까?
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
              카카오 무료 JavaScript 키를 등록하면 익산 지역의 모든 음식점, 카페, 코인빨래방을 실시간 검색하고 평가할 수 있습니다.
            </div>
          </div>
          <button
            onClick={onOpenApiKeyModal}
            className="btn-small"
            style={{
              background: '#ea580c',
              color: '#ffffff',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
          >
            카카오 키 등록하기
          </button>
        </div>
      )}

      {/* 에러 발생 시 안내 배너 */}
      {sdkError && (
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '0.75rem 1.25rem',
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            zIndex: 1000,
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}
        >
          <AlertCircle size={18} color="#dc2626" />
          <span>{sdkError}</span>
          <button
            onClick={onOpenApiKeyModal}
            style={{ color: '#0284c7', textDecoration: 'underline', fontWeight: 700, marginLeft: '0.5rem' }}
          >
            키 재설정
          </button>
        </div>
      )}

      {/* 실시간 카카오 검색 결과 알림 칩 */}
      {kakaoSearchResults.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#ffffff',
            border: '1.5px solid #f59e0b',
            padding: '0.5rem 1rem',
            borderRadius: '25px',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)',
            zIndex: 1000,
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#b45309',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <MapPin size={14} color="#ea580c" />
          <span>카카오 실시간 검색 결과 {kakaoSearchResults.length}곳 발견! (마커를 클릭하면 1인 가구 평가가 가능합니다)</span>
        </div>
      )}
    </div>
  );
}
