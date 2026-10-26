import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { VIRTUAL_STUDIO_ROOMS } from '../data/mockData';

export default function MapView({
  places = [],
  campusNodes = [],
  studioRooms = VIRTUAL_STUDIO_ROOMS,
  selectedOriginId = 'studio-daehakro',
  onSelectOrigin,
  selectedPlace,
  destinationPlace,
  userGpsLocation,
  onSelectPlace,
  routeBoundsTarget
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const routeLineRef = useRef(null);

  // 1. 지도 인스턴스 초기화 (원광대학교 대학로 중심 좌표: 35.9692, 126.9575)
  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstance.current) {
      const map = L.map(mapRef.current, {
        center: [35.9692, 126.9575],
        zoom: 14,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      // 빈 지도 클릭 시 선택된 팝업 카드 닫기
      map.on('click', () => {
        if (onSelectPlace) {
          onSelectPlace(null);
        }
      });

      mapInstance.current = map;
    }
  }, []);

  // 2. 가상 자취방, 기준 거점, 점포 마커 및 도보 경로 라인 렌더링
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // 이전 마커 및 경로선 제거
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    // A. 현재 선택된 출발지 좌표 확인
    let currentOriginLat = 35.9692;
    let currentOriginLng = 126.9575;

    if (selectedOriginId === 'gps' && userGpsLocation) {
      currentOriginLat = userGpsLocation.lat;
      currentOriginLng = userGpsLocation.lng;

      // 실시간 GPS 마커
      const gpsIcon = L.divIcon({
        className: 'gps-marker-wrapper',
        html: `
          <div class="campus-gate-pin selected" style="background:#0284c7;border-color:#38bdf8;">
            <div class="status-ring" style="border-color:rgba(56,189,248,0.7);animation:pulse-ring 1.5s infinite;"></div>
            <div class="pin-inner">
              <span>📍</span>
              <span class="pin-title">내 GPS 위치</span>
            </div>
          </div>
        `,
        iconSize: [120, 34],
        iconAnchor: [60, 17]
      });

      const gpsMarker = L.marker([userGpsLocation.lat, userGpsLocation.lng], { icon: gpsIcon })
        .addTo(map)
        .on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          if (onSelectOrigin) onSelectOrigin('gps');
        });
      markersRef.current.push(gpsMarker);
    }

    // B. 가상의 자취방 포인트 마커들 렌더링 (익산 원광대 인근 대학생 실제 자취촌)
    studioRooms.forEach((studio) => {
      const isSelectedStudio = selectedOriginId === studio.id;
      if (isSelectedStudio) {
        currentOriginLat = studio.lat;
        currentOriginLng = studio.lng;
      }

      const studioIcon = L.divIcon({
        className: 'studio-marker-wrapper',
        html: `
          <div class="custom-studio-pin ${isSelectedStudio ? 'active-origin' : ''}" style="
            background: ${isSelectedStudio ? '#0284c7' : '#334155'};
            border: ${isSelectedStudio ? '3px solid #38bdf8' : '2px solid #ffffff'};
            box-shadow: ${isSelectedStudio ? '0 0 16px rgba(56,189,248,0.8), 0 4px 10px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.25)'};
          ">
            <span class="studio-emoji">🏠</span>
            <span class="studio-title">${isSelectedStudio ? `[내 자취방] ${studio.shortName}` : studio.shortName}</span>
          </div>
        `,
        iconSize: [isSelectedStudio ? 170 : 130, 32],
        iconAnchor: [isSelectedStudio ? 85 : 65, 16]
      });

      const studioMarker = L.marker([studio.lat, studio.lng], { icon: studioIcon })
        .addTo(map)
        .on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          if (onSelectOrigin) {
            onSelectOrigin(studio.id);
          }
        });

      markersRef.current.push(studioMarker);
    });

    // C. 편의 시설 점포 마커 렌더링
    const getCatTheme = (slug) => {
      switch (slug) {
        case 'daiso':
          return { bg: '#ec4899', ring: 'rgba(236, 72, 153, 0.45)', emoji: '✨' };
        case 'food_mart':
          return { bg: '#16a34a', ring: 'rgba(22, 163, 74, 0.45)', emoji: '🥦' };
        case 'mart':
          return { bg: '#0284c7', ring: 'rgba(2, 132, 199, 0.45)', emoji: '🛒' };
        case 'essentials':
          return { bg: '#8b5cf6', ring: 'rgba(139, 92, 246, 0.45)', emoji: '💄' };
        case 'market':
          return { bg: '#ea580c', ring: 'rgba(234, 88, 12, 0.45)', emoji: '🏪' };
        case 'laundry':
          return { bg: '#6366f1', ring: 'rgba(99, 102, 241, 0.45)', emoji: '🧺' };
        case 'print':
          return { bg: '#2563eb', ring: 'rgba(37, 99, 235, 0.45)', emoji: '🖨️' };
        case 'pharmacy':
          return { bg: '#059669', ring: 'rgba(5, 150, 105, 0.45)', emoji: '💊' };
        default:
          return { bg: '#0d9488', ring: 'rgba(13, 148, 136, 0.45)', emoji: '📍' };
      }
    };

    places.forEach((place) => {
      const isSelected = selectedPlace && selectedPlace.id === place.id;
      const isDestination = destinationPlace && destinationPlace.id === place.id;
      const isCaution = place.caution_flags_count > 0;
      const theme = getCatTheme(place.category_slug);
      const markerColor = isCaution ? '#e11d48' : theme.bg;

      const placeIcon = L.divIcon({
        className: 'place-marker-wrapper',
        html: `
          <div class="custom-place-pin ${isSelected ? 'active-pulse' : ''} ${isDestination ? 'active-destination' : ''}" style="
            background: ${markerColor};
            box-shadow: ${isSelected ? `0 0 20px #facc15, 0 4px 14px rgba(0,0,0,0.3)` : `0 3px 10px rgba(0,0,0,0.2)`};
            border: ${isSelected ? '3px solid #facc15' : isDestination ? '3px solid #38bdf8' : '2px solid #ffffff'};
          ">
            <div class="status-ring" style="border-color: ${theme.ring};"></div>
            <span class="pin-emoji">${theme.emoji}</span>
            <span class="pin-name">${place.name.split('(')[0].trim()}</span>
            <span class="pin-score">★ ${(place.composite_score || 0).toFixed(1)}</span>
            ${place.single_portion_takeout ? '<span class="pin-solo-badge">1인</span>' : ''}
            ${place.is_daroum_accepted ? '<span class="pin-daroum-badge">10%</span>' : ''}
          </div>
        `,
        iconSize: [165, 34],
        iconAnchor: [82, 17]
      });

      const marker = L.marker([place.lat, place.lng], { icon: placeIcon })
        .addTo(map)
        .on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          onSelectPlace(place);
        });

      markersRef.current.push(marker);
    });

    // D. 출발지(자취방) - 도착지(목적지) 도보 경로선 그리기 (네이버 지도 스타일)
    const targetDest = destinationPlace || selectedPlace;
    if (targetDest && currentOriginLat && currentOriginLng) {
      const routeLine = L.polyline(
        [
          [currentOriginLat, currentOriginLng],
          [targetDest.lat, targetDest.lng]
        ],
        {
          color: '#0d9488',
          weight: 4,
          dashArray: '8, 8',
          opacity: 0.85
        }
      ).addTo(map);

      routeLineRef.current = routeLine;
    }

    // 선택된 장소가 있고 경로 줌 요청이 없을 때 중심 이동
    if (selectedPlace && !routeBoundsTarget) {
      map.flyTo([selectedPlace.lat, selectedPlace.lng], 16, {
        duration: 0.7,
        easeLinearity: 0.25
      });
    }
  }, [places, studioRooms, campusNodes, selectedOriginId, selectedPlace, destinationPlace, userGpsLocation]);

  // E. 경로 한눈에 보기 바운드 맞춤
  useEffect(() => {
    if (!routeBoundsTarget || !mapInstance.current) return;
    const { originLat, originLng, destLat, destLng } = routeBoundsTarget;
    const bounds = L.latLngBounds([
      [originLat, originLng],
      [destLat, destLng]
    ]);
    mapInstance.current.fitBounds(bounds, {
      padding: [80, 80],
      maxZoom: 16,
      animate: true
    });
  }, [routeBoundsTarget]);

  return (
    <div className="map-container">
      <div ref={mapRef} id="map" />
    </div>
  );
}
