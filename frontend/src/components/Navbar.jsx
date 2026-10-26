import React from 'react';
import { 
  MapPin, CreditCard, Sparkles, Moon, Sun, PackageCheck, Clock, Waves,
  Crosshair, Navigation, PanelLeftClose, PanelLeftOpen, Home
} from 'lucide-react';
import { VIRTUAL_STUDIO_ROOMS } from '../data/mockData';

export default function Navbar({
  studioRooms = VIRTUAL_STUDIO_ROOMS,
  campusNodes = [],
  selectedOriginId = 'studio-daehakro',
  onSelectOrigin,
  userGpsLocation,
  onRequestGps,
  isSidebarOpen,
  onToggleSidebar,
  isRoutePlannerOpen,
  onToggleRoutePlanner,
  hasKakaoKey,
  onOpenApiKeyModal,
  isDarkMode,
  onToggleDarkMode,
  daroumOnly,
  onToggleDaroum,
  soloOnly,
  onToggleSolo,
  openLateOnly,
  onToggleOpenLate,
  essentialOnly,
  onToggleEssential,
  onOpenLanding
}) {
  return (
    <header className="header sticky-header">
      {/* 1. 로고 영역 */}
      <div className="logo-area">
        <div className="logo-badge">익산 자취 MAP</div>
        <div>
          <h1 className="logo-title">익산 자취생 편의 지도</h1>
          <p className="logo-subtitle">
            내 자취방 기준 실시간 도보 거리 · 24시 심야 인프라 · 익산다로움 10% 가이드
          </p>
        </div>
      </div>

      {/* 2. 네비게이션 퀵 필터 칩 */}
      <div className="navbar-chips-row">
        {/* 익산다로움 */}
        <button
          className={`nav-chip-btn ${daroumOnly ? 'active daroum' : ''}`}
          onClick={onToggleDaroum}
          title="익산시 지역화폐 다로움 카드 10% 캐시백 환급 가맹점"
        >
          <CreditCard size={13} />
          <span>다로움 10%</span>
        </button>

        {/* 1인분 포장/소량구매 */}
        <button
          className={`nav-chip-btn ${soloOnly ? 'active solo' : ''}`}
          onClick={onToggleSolo}
          title="1인분 소량 포장 및 1인 가구 방문 적합 시설"
        >
          <PackageCheck size={13} />
          <span>1인분 주문</span>
        </button>

        {/* 심야 / 24시 영업 */}
        <button
          className={`nav-chip-btn ${openLateOnly ? 'active late' : ''}`}
          onClick={onToggleOpenLate}
          title="24시간 상시 운영 또는 심야 22시~23시 마감 시설"
        >
          <Clock size={13} />
          <span>심야·24시</span>
        </button>

        {/* 빨래방 & 약국 & 인쇄 */}
        <button
          className={`nav-chip-btn ${essentialOnly ? 'active essential' : ''}`}
          onClick={onToggleEssential}
          title="빨래방, 무인 프린트, 당번약국 1인가구 필수 인프라만 모아보기"
        >
          <Waves size={13} />
          <span>필수인프라</span>
        </button>
      </div>

      {/* 3. 우측 컨트롤 (내 자취방 선택 + GPS + 도보 길찾기 + 사이드바 토글) */}
      <div className="header-controls">
        {/* GPS 실시간 내 위치 버튼 */}
        <button
          className={`nav-gps-btn ${userGpsLocation ? 'active' : ''}`}
          onClick={onRequestGps}
          title="스마트폰/노트북 현재 GPS 감지하여 출발지로 설정"
        >
          <Crosshair size={14} />
          <span>{userGpsLocation ? 'GPS ON' : '내 위치'}</span>
        </button>

        {/* 내 자취방 (출발지) 선택기 */}
        <div className="gate-selector-wrap" title="내 자취방 선택 (실제 도보 시간 및 거리 계산 기준)">
          <Home size={14} color="#0284c7" />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>자취방:</span>
          <select
            className="gate-select"
            value={userGpsLocation ? 'gps' : selectedOriginId}
            onChange={(e) => {
              if (e.target.value === 'gps') {
                onRequestGps();
              } else {
                onSelectOrigin(e.target.value);
              }
            }}
          >
            {userGpsLocation && <option value="gps">📍 내 현재 위치 (GPS)</option>}
            <optgroup label="🏠 원광대 인근 가상 자취방">
              {studioRooms.map((studio) => (
                <option key={studio.id} value={studio.id}>
                  {studio.shortName}
                </option>
              ))}
            </optgroup>
            <optgroup label="🏥 대학/병원 주요 거점">
              {campusNodes.map((node) => (
                <option key={`node-${node.id}`} value={node.id}>
                  📍 {node.node_name.split(' ')[0]}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* 맞춤형 도보 길찾기 계산기 토글 버튼 */}
        <button
          className={`nav-planner-btn ${isRoutePlannerOpen ? 'active' : ''}`}
          onClick={onToggleRoutePlanner}
          title="네이버 지도 스타일 도보 경로/시간 계산기 열기/닫기"
        >
          <Navigation size={14} />
          <span>길찾기</span>
        </button>

        {/* 사이드바 목록 접기/펼치기 토글 버튼 */}
        <button
          className={`nav-sidebar-toggle-btn ${isSidebarOpen ? 'active' : ''}`}
          onClick={onToggleSidebar}
          title={isSidebarOpen ? '목록 접고 지도 넓게 보기' : '장소 목록 열기'}
        >
          {isSidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
          <span>{isSidebarOpen ? '목록 닫기' : '목록 보기'}</span>
        </button>

        {/* 소개 / 가이드 덮개 열기 */}
        <button
          className="nav-landing-toggle-btn"
          onClick={onOpenLanding}
          title="처음 소개 화면(메인 덮개) 열기"
        >
          <span>가이드</span>
        </button>

        {/* 다크/라이트 모드 토글러 */}
        <button
          className="theme-toggle-btn"
          onClick={onToggleDarkMode}
          title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} color="#6366f1" />}
        </button>
      </div>
    </header>
  );
}
