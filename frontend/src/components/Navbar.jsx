import React from 'react';
import { MapPin, CreditCard, Sparkles, Moon, Sun, PackageCheck, Clock, Waves } from 'lucide-react';

export default function Navbar({
  campusNodes = [],
  selectedGateId,
  onSelectGate,
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
  onToggleEssential
}) {
  return (
    <header className="header sticky-header">
      {/* 1. 로고 영역 */}
      <div className="logo-area">
        <div className="logo-badge">IK산 LIFE</div>
        <div>
          <h1 className="logo-title">익산 로컬 라이프 & 생활 편의 지도</h1>
          <p className="logo-subtitle">
            원광대학교병원(Lat 35.9685, Lng 126.9582) 실측 정밀 GPS 기준 3축 평가 가이드
          </p>
        </div>
      </div>

      {/* 2. 네비게이션 퀵 필터 칩 (Sticky Top Bar Quick Chips) */}
      <div className="navbar-chips-row">
        {/* 익산다로움 */}
        <button
          className={`nav-chip-btn ${daroumOnly ? 'active daroum' : ''}`}
          onClick={onToggleDaroum}
          title="익산시 지역화폐 다로움 카드 10% 캐시백 환급 가맹점"
        >
          <CreditCard size={13} />
          <span>익산다로움 10%</span>
        </button>

        {/* 1인분 포장/소량구매 */}
        <button
          className={`nav-chip-btn ${soloOnly ? 'active solo' : ''}`}
          onClick={onToggleSolo}
          title="1인분 소량 포장 및 1인 가구 방문 적합 시설"
        >
          <PackageCheck size={13} />
          <span>1인분 주문가능</span>
        </button>

        {/* 심야 / 24시 영업 */}
        <button
          className={`nav-chip-btn ${openLateOnly ? 'active late' : ''}`}
          onClick={onToggleOpenLate}
          title="24시간 상시 운영 또는 심야 22시~23시 마감 시설"
        >
          <Clock size={13} />
          <span>심야·24시 운영</span>
        </button>

        {/* 빨래방 & 약국 & 인쇄 */}
        <button
          className={`nav-chip-btn ${essentialOnly ? 'active essential' : ''}`}
          onClick={onToggleEssential}
          title="빨래방, 무인 프린트, 당번약국 1인가구 필수 인프라만 모아보기"
        >
          <Waves size={13} />
          <span>빨래방·약국·인쇄</span>
        </button>
      </div>

      {/* 3. 우측 컨트롤 (기준 거점 + 카카오 연동 + 다크/라이트 모드) */}
      <div className="header-controls">
        {/* 기준 거점 선택기 */}
        <div className="gate-selector-wrap" title="도보 거리 측정 기준 거점 (원광대병원 등)">
          <MapPin size={15} color="var(--primary)" />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>기준:</span>
          <select
            className="gate-select"
            value={selectedGateId}
            onChange={(e) => onSelectGate(Number(e.target.value))}
          >
            {campusNodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.node_name}
              </option>
            ))}
          </select>
        </div>

        {/* 카카오 지도 API 키 연동 상태 */}
        <button
          className="api-key-status-btn"
          onClick={onOpenApiKeyModal}
          title="카카오 지도 실제 상권 연동 설정"
        >
          <span>{hasKakaoKey ? '🗺️ 카카오 지도' : '🔑 API 키 설정'}</span>
        </button>

        {/* 다크/라이트 모드 원클릭 토글러 */}
        <button
          className="theme-toggle-btn"
          onClick={onToggleDarkMode}
          title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} color="#6366f1" />}
        </button>
      </div>
    </header>
  );
}
