import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function MapView({
  places = [],
  campusNodes = [],
  selectedGateId,
  selectedPlace,
  onSelectPlace
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  // 1. 지도 인스턴스 초기화 (원광대학교병원 및 대학로 중심 좌표: 35.9685, 126.9582)
  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstance.current) {
      const map = L.map(mapRef.current, {
        center: [35.9685, 126.9582],
        zoom: 14,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      mapInstance.current = map;
    }
  }, []);

  // 2. 캠퍼스 기준 노드 및 장소 마커 렌더링
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // 이전 마커 제거
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // A. 기준 거점 (원광대병원 등) 마커 오버레이
    campusNodes.forEach((node) => {
      const isSelectedGate = node.id === selectedGateId;
      const isHosp = node.node_type === 'HOSPITAL';

      const gateIcon = L.divIcon({
        className: 'campus-gate-marker-wrapper',
        html: `
          <div class="campus-gate-pin ${isSelectedGate ? 'selected' : ''}">
            <div class="status-ring hospital-ring"></div>
            <div class="pin-inner">
              <span>${isHosp ? '🏥' : '📍'}</span>
              <span class="pin-title">${node.node_name.split(' ')[0]}</span>
            </div>
          </div>
        `,
        iconSize: [130, 36],
        iconAnchor: [65, 18]
      });

      const gateMarker = L.marker([node.lat, node.lng], { icon: gateIcon })
        .addTo(map)
        .bindPopup(`<b>${node.node_name}</b><br>${node.description || '도보 측정 기준 거점'}`);

      markersRef.current.push(gateMarker);
    });

    // B. 카테고리별 테마 비주얼 매핑
    const getCatTheme = (slug) => {
      switch (slug) {
        case 'daiso':
          return { bg: '#ec4899', ring: 'rgba(236, 72, 153, 0.45)', emoji: '✨' };
        case 'mart':
          return { bg: '#0284c7', ring: 'rgba(2, 132, 199, 0.45)', emoji: '🛒' };
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

    // C. 장소 마커 렌더링 (커스텀 핀 & 바이브런트 상태 링)
    places.forEach((place) => {
      const isSelected = selectedPlace && selectedPlace.id === place.id;
      const isCaution = place.caution_flags_count > 0;
      const theme = getCatTheme(place.category_slug);
      const markerColor = isCaution ? '#e11d48' : theme.bg;

      const placeIcon = L.divIcon({
        className: 'place-marker-wrapper',
        html: `
          <div class="custom-place-pin ${isSelected ? 'active-pulse' : ''}" style="
            background: ${markerColor};
            box-shadow: ${isSelected ? `0 0 20px #facc15, 0 4px 14px rgba(0,0,0,0.3)` : `0 3px 10px rgba(0,0,0,0.2)`};
            border: ${isSelected ? '3px solid #facc15' : '2px solid #ffffff'};
          ">
            <div class="status-ring" style="border-color: ${theme.ring};"></div>
            <span class="pin-emoji">${theme.emoji}</span>
            <span class="pin-name">${place.name.split('(')[0].trim()}</span>
            <span class="pin-score">★ ${(place.composite_score || 0).toFixed(1)}</span>
            ${place.single_portion_takeout ? '<span class="pin-solo-badge">1인</span>' : ''}
          </div>
        `,
        iconSize: [160, 34],
        iconAnchor: [80, 17]
      });

      const marker = L.marker([place.lat, place.lng], { icon: placeIcon })
        .addTo(map)
        .on('click', () => {
          onSelectPlace(place);
        });

      markersRef.current.push(marker);
    });

    // 선택된 장소가 있으면 지도를 해당 위치로 부드럽게 줌/중심 이동 (Smooth zoom/center transition)
    if (selectedPlace) {
      map.flyTo([selectedPlace.lat, selectedPlace.lng], 16, {
        duration: 0.8,
        easeLinearity: 0.25
      });
    }
  }, [places, campusNodes, selectedGateId, selectedPlace]);

  return (
    <div className="map-container">
      <div ref={mapRef} id="map" />
    </div>
  );
}
