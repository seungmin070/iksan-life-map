import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, MapPin, Search, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { VIRTUAL_STUDIO_ROOMS } from '../data/mockData';

export default function KakaoMapView({
  kakaoKey,
  places = [],
  campusNodes = [],
  studioRooms = VIRTUAL_STUDIO_ROOMS,
  selectedOriginId = 'studio-daehakro',
  onSelectOrigin,
  selectedPlace,
  destinationPlace,
  userGpsLocation,
  onSelectPlace,
  onSelectKakaoPlace,
  searchQuery,
  onOpenApiKeyModal,
  routeBoundsTarget
}) {
  const mapContainerRef = useRef(null);
  const kakaoMapInstance = useRef(null);
  const overlaysRef = useRef([]);
  const kakaoSearchMarkersRef = useRef([]);
  const routePolylineRef = useRef(null);

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
      setSdkError('카카오 지도 SDK를 불러오지 못했습니다. 카카오 개발자 콘솔에서 Web 플랫폼 사이트 도메인 등록 여부를 확인해주세요.');
    };

    document.head.appendChild(script);
  }, [kakaoKey]);

  // 2. 카카오 지도 인스턴스 초기화
  useEffect(() => {
    if (!isSdkLoaded || !mapContainerRef.current || !window.kakao?.maps) return;

    if (!kakaoMapInstance.current) {
      const container = mapContainerRef.current;
      const options = {
        center: new window.kakao.maps.LatLng(35.9692, 126.9575), // 원광대학교 신동 대학로 중심
        level: 4
      };

      const map = new window.kakao.maps.Map(container, options);

      const mapTypeControl = new window.kakao.maps.MapTypeControl();
      map.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);

      const zoomControl = new window.kakao.maps.ZoomControl();
      map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

      // 지도 빈 영역 클릭 시 오버레이 카드 닫기
      window.kakao.maps.event.addListener(map, 'click', () => {
        if (onSelectPlace) {
          onSelectPlace(null);
        }
      });

      kakaoMapInstance.current = map;
    }
  }, [isSdkLoaded]);

  // 3. 자취방, 기준 거점, 점포 오버레이 및 경로선 렌더링
  useEffect(() => {
    const map = kakaoMapInstance.current;
    if (!map || !window.kakao?.maps) return;

    // 기존 오버레이 정리
    overlaysRef.current.forEach((item) => {
      if (item.setMap) item.setMap(null);
    });
    overlaysRef.current = [];

    if (routePolylineRef.current) {
      routePolylineRef.current.setMap(null);
      routePolylineRef.current = null;
    }

    let currentOriginLat = 35.9692;
    let currentOriginLng = 126.9575;

    // A-1. 사용자 GPS 현재 위치 오버레이
    if (selectedOriginId === 'gps' && userGpsLocation) {
      currentOriginLat = userGpsLocation.lat;
      currentOriginLng = userGpsLocation.lng;

      const gpsPos = new window.kakao.maps.LatLng(userGpsLocation.lat, userGpsLocation.lng);
      const gpsEl = document.createElement('div');
      gpsEl.style.cssText = `
        background: #0284c7;
        color: #ffffff;
        font-size: 11px;
        font-weight: 800;
        padding: 5px 12px;
        border-radius: 20px;
        border: 2px solid #38bdf8;
        box-shadow: 0 0 16px rgba(56, 189, 248, 0.8), 0 3px 8px rgba(0,0,0,0.35);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 5px;
        white-space: nowrap;
      `;
      gpsEl.innerHTML = `<span>📍 내 GPS 위치</span>`;
      gpsEl.onclick = (e) => {
        e.stopPropagation();
        if (onSelectOrigin) onSelectOrigin('gps');
      };

      const gpsOverlay = new window.kakao.maps.CustomOverlay({
        position: gpsPos,
        content: gpsEl,
        yAnchor: 1.3
      });
      gpsOverlay.setMap(map);
      overlaysRef.current.push(gpsOverlay);
    }

    // A-2. 가상 자취방 포인트들 렌더링 (원광대 대학로, 신동, 북문 등)
    studioRooms.forEach((studio) => {
      const isSelectedStudio = selectedOriginId === studio.id;
      if (isSelectedStudio) {
        currentOriginLat = studio.lat;
        currentOriginLng = studio.lng;
      }

      const studioPos = new window.kakao.maps.LatLng(studio.lat, studio.lng);
      const studioEl = document.createElement('div');
      studioEl.style.cssText = `
        background: ${isSelectedStudio ? '#0284c7' : '#334155'};
        color: #ffffff;
        font-size: 11px;
        font-weight: 800;
        padding: 5px 10px;
        border-radius: 18px;
        border: ${isSelectedStudio ? '3px solid #38bdf8' : '2px solid #ffffff'};
        box-shadow: ${isSelectedStudio ? '0 0 16px rgba(56,189,248,0.8), 0 4px 10px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.25)'};
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
        transform: ${isSelectedStudio ? 'scale(1.1)' : 'scale(1.0)'};
        transition: transform 0.2s ease;
      `;
      studioEl.innerHTML = `
        <span>🏠</span>
        <span>${isSelectedStudio ? `[내 자취방] ${studio.shortName}` : studio.shortName}</span>
      `;

      studioEl.onclick = (e) => {
        e.stopPropagation();
        if (onSelectOrigin) onSelectOrigin(studio.id);
      };

      const studioOverlay = new window.kakao.maps.CustomOverlay({
        position: studioPos,
        content: studioEl,
        yAnchor: 1.3
      });
      studioOverlay.setMap(map);
      overlaysRef.current.push(studioOverlay);
    });

    // B. 평가 점포 마커 렌더링
    places.forEach((place) => {
      const isSelected = selectedPlace && selectedPlace.id === place.id;
      const isDestination = destinationPlace && destinationPlace.id === place.id;
      const position = new window.kakao.maps.LatLng(place.lat, place.lng);

      let bgColor = '#0d9488';
      let emoji = '📍';
      switch (place.category_slug) {
        case 'daiso': bgColor = '#ec4899'; emoji = '✨'; break;
        case 'food_mart': bgColor = '#16a34a'; emoji = '🥦'; break;
        case 'mart': bgColor = '#0284c7'; emoji = '🛒'; break;
        case 'essentials': bgColor = '#8b5cf6'; emoji = '💄'; break;
        case 'market': bgColor = '#ea580c'; emoji = '🏪'; break;
        case 'laundry': bgColor = '#6366f1'; emoji = '🧺'; break;
        case 'print': bgColor = '#2563eb'; emoji = '🖨️'; break;
        case 'pharmacy': bgColor = '#059669'; emoji = '💊'; break;
        default: break;
      }

      if (place.caution_flags_count > 0) bgColor = '#e11d48';

      const content = document.createElement('div');
      content.style.cssText = `
        background: ${bgColor};
        color: #ffffff;
        font-size: 11px;
        font-weight: 700;
        padding: 5px 10px;
        border-radius: 12px;
        border: ${isSelected ? '3px solid #facc15' : isDestination ? '3px solid #38bdf8' : '2px solid #ffffff'};
        box-shadow: ${isSelected ? '0 0 16px rgba(250, 204, 21, 0.8), 0 4px 12px rgba(0,0,0,0.35)' : '0 4px 12px rgba(0,0,0,0.25)'};
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 5px;
        white-space: nowrap;
        transform: ${isSelected ? 'scale(1.15)' : 'scale(1.0)'};
        transition: transform 0.2s ease;
      `;
      content.innerHTML = `
        <span>${emoji}</span>
        <span>${place.name.split('(')[0].trim()}</span>
        <span style="background:rgba(0,0,0,0.25);padding:1px 5px;border-radius:6px;color:#fde047;font-weight:800;">★ ${(place.composite_score || 0).toFixed(1)}</span>
        ${place.single_portion_takeout ? '<span style="background:#10b981;color:#fff;border-radius:4px;padding:1px 4px;font-size:9px;">1인</span>' : ''}
        ${place.is_daroum_accepted ? '<span style="background:#ea580c;color:#fff;border-radius:4px;padding:1px 4px;font-size:9px;">10%</span>' : ''}
      `;

      content.onclick = (e) => {
        e.stopPropagation();
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

    // C. 출발지(자취방) - 도착지(점포) 도보 경로선 렌더링
    const targetDest = destinationPlace || selectedPlace;
    if (targetDest && currentOriginLat && currentOriginLng) {
      const linePath = [
        new window.kakao.maps.LatLng(currentOriginLat, currentOriginLng),
        new window.kakao.maps.LatLng(targetDest.lat, targetDest.lng)
      ];

      const polyline = new window.kakao.maps.Polyline({
        path: linePath,
        strokeWeight: 5,
        strokeColor: '#0d9488',
        strokeOpacity: 0.85,
        strokeStyle: 'dashed'
      });

      polyline.setMap(map);
      routePolylineRef.current = polyline;
    }

    if (selectedPlace && !routeBoundsTarget) {
      const moveLatLon = new window.kakao.maps.LatLng(selectedPlace.lat, selectedPlace.lng);
      map.panTo(moveLatLon);
    }
  }, [isSdkLoaded, places, studioRooms, campusNodes, selectedOriginId, selectedPlace, destinationPlace, userGpsLocation]);

  // D. 경로 한눈에 보기 바운드 조정
  useEffect(() => {
    if (!routeBoundsTarget || !kakaoMapInstance.current || !window.kakao?.maps) return;
    const { originLat, originLng, destLat, destLng } = routeBoundsTarget;
    const bounds = new window.kakao.maps.LatLngBounds();
    bounds.extend(new window.kakao.maps.LatLng(originLat, originLng));
    bounds.extend(new window.kakao.maps.LatLng(destLat, destLng));
    kakaoMapInstance.current.setBounds(bounds, 80, 80, 80, 80);
  }, [routeBoundsTarget]);

  // E. 카카오 실시간 로컬 검색
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

    const searchOptions = {
      location: new window.kakao.maps.LatLng(35.9692, 126.9575),
      radius: 5000,
      size: 5
    };

    ps.keywordSearch(
      `익산 ${searchQuery}`,
      (data, status) => {
        setIsSearchingKakao(false);
        if (status === window.kakao.maps.services.Status.OK) {
          setKakaoSearchResults(data);

          kakaoSearchMarkersRef.current.forEach((m) => m.setMap(null));
          kakaoSearchMarkersRef.current = [];

          data.forEach((item) => {
            const markerPos = new window.kakao.maps.LatLng(item.y, item.x);
            const marker = new window.kakao.maps.Marker({
              position: markerPos,
              map
            });

            window.kakao.maps.event.addListener(marker, 'click', () => {
              if (onSelectKakaoPlace) onSelectKakaoPlace(item);
            });

            kakaoSearchMarkersRef.current.push(marker);
          });
        } else {
          setKakaoSearchResults([]);
        }
      },
      searchOptions
    );
  }, [searchQuery]);

  return (
    <div className="kakao-map-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* SDK 에러 안내 */}
      {sdkError && (
        <div className="kakao-error-banner">
          <AlertCircle size={16} />
          <span>{sdkError}</span>
          <button className="btn-small btn-primary" onClick={onOpenApiKeyModal}>
            API 키 확인
          </button>
        </div>
      )}

      {/* 카카오 실시간 검색 결과 플로팅 바 */}
      {kakaoSearchResults.length > 0 && (
        <div className="kakao-search-results-overlay">
          <div className="kakao-search-header">
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#facc15' }}>
              카카오 실시간 익산 POI ({kakaoSearchResults.length}건)
            </span>
          </div>
          <div className="kakao-results-list">
            {kakaoSearchResults.map((item) => (
              <div
                key={item.id}
                className="kakao-result-item"
                onClick={() => onSelectKakaoPlace && onSelectKakaoPlace(item)}
              >
                <div>
                  <strong>{item.place_name}</strong>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8' }}>
                    {item.road_address_name || item.address_name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
