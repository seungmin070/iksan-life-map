import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  Clock,
  PackageCheck,
  CreditCard,
  Moon,
  Sun,
  Flame,
  ArrowRight,
  ShieldCheck,
  Waves,
  HeartPulse,
  Printer,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

export default function LandingScreen({
  onEnterMap,
  isDarkMode,
  onToggleDarkMode
}) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="landing-wrapper">
      {/* 앰비언트 배경 그래디언트 블러 오브젝트 */}
      <div className="landing-ambient-blob blob-1" />
      <div className="landing-ambient-blob blob-2" />
      <div className="landing-ambient-blob blob-3" />

      {/* 상단 네비게이션 헤더 */}
      <header className="landing-header">
        <div className="landing-brand">
          <div className="brand-logo-icon">
            <Compass size={20} className="brand-icon-spin" />
          </div>
          <div>
            <span className="brand-title">IK산 LIFE</span>
            <span className="brand-badge">2026 자취생 에디션</span>
          </div>
        </div>

        <div className="landing-top-actions">
          <button
            className="theme-toggle-btn landing-theme-btn"
            onClick={onToggleDarkMode}
            title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
          </button>
          <button
            className="landing-quick-enter-btn"
            onClick={() => onEnterMap({})}
          >
            <span>지도 바로가기</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </header>

      {/* 메인 히어로 섹션 */}
      <main className="landing-content">
        {/* 1. 상단 뱃지 */}
        <div className="landing-badge-wrap">
          <div className="landing-badge">
            <span className="badge-pulse-dot" />
            <span className="badge-text">원광대 & 익산 1인 가구 전용 힙스터 가이드 📍</span>
          </div>
        </div>

        {/* 2. 히어로 타이틀 & 설명 */}
        <div className="landing-hero-text">
          <h1 className="landing-title">
            익산 자취, 아무 데나 가다 <br className="br-mobile" />
            <span className="title-gradient-highlight">피 보지 말자.</span>
          </h1>
          <p className="landing-subtitle">
            걸어서 몇 분? 24시 하나? 1인분 포장 되나? <br />
            다이소부터 심야약국까지 <strong>1초 만에 스캔 완료.</strong>
          </p>
        </div>

        {/* 3. 인터랙티브 프리뷰 카드 그리드 (3 Highlights) */}
        <div className="landing-cards-grid">
          {/* Card 1: 원대병원 기준 도보 스코어 */}
          <div
            className={`landing-preview-card card-walk ${activeTab === 0 ? 'card-focused' : ''}`}
            onMouseEnter={() => setActiveTab(0)}
            onClick={() => onEnterMap({ gateNodeId: 1, sortBy: 'access' })}
          >
            <div className="card-header">
              <div className="card-icon-wrap icon-walk">
                <MapPin size={22} />
              </div>
              <span className="card-badge badge-walk">실측 도보 스코어</span>
            </div>
            <h3 className="card-title">원대병원 기준 도보 스코어 🚶‍♂️</h3>
            <p className="card-desc">
              1.3km 이내 진짜 걸어갈 만한 곳만 쏙쏙 골라낸 자취생 맞춤 도보 측정
            </p>

            {/* 인터랙티브 마이크로 엘리먼트 */}
            <div className="card-micro-box">
              <div className="micro-row">
                <span className="micro-label">도보 5점 (초근접)</span>
                <span className="micro-val">≤ 1.3 km (도보 18분 이내)</span>
              </div>
              <div className="micro-tags">
                <span className="m-chip positive">다이소 배산점 (1.3km) 5.0★</span>
                <span className="m-chip positive">워시엔조이 (0.2km) 5.0★</span>
              </div>
              <div className="micro-hint">
                <span>클릭 시 원대병원 근접 순으로 보기</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </div>

          {/* Card 2: 새벽 2시 비상 상황 */}
          <div
            className={`landing-preview-card card-night ${activeTab === 1 ? 'card-focused' : ''}`}
            onMouseEnter={() => setActiveTab(1)}
            onClick={() => onEnterMap({ openLateOnly: true })}
          >
            <div className="card-header">
              <div className="card-icon-wrap icon-night">
                <Clock size={22} />
              </div>
              <span className="card-badge badge-night">심야 & 비상 해결</span>
            </div>
            <h3 className="card-title">새벽 2시 급성 체기/빨래 비상 🌙</h3>
            <p className="card-desc">
              갑자기 열나거나 대형 이불빨래 밀렸을 때 당황하지 않는 24시 & 심야 정밀 핀
            </p>

            {/* 인터랙티브 마이크로 엘리먼트 */}
            <div className="card-micro-box">
              <div className="micro-row">
                <span className="micro-label">상시 해결 인프라</span>
                <span className="micro-val tag-green">24H 연중무휴</span>
              </div>
              <div className="micro-tags">
                <span className="m-chip night">대학온누리약국 (밤 23시)</span>
                <span className="m-chip night">워시엔조이 (24H 이불건조)</span>
                <span className="m-chip night">프린트카페 (24H 무인출력)</span>
              </div>
              <div className="micro-hint">
                <span>클릭 시 심야/24H 운영 시설만 보기</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </div>

          {/* Card 3: 1인분 & 다로움 10% 혜택 */}
          <div
            className={`landing-preview-card card-daroum ${activeTab === 2 ? 'card-focused' : ''}`}
            onMouseEnter={() => setActiveTab(2)}
            onClick={() => onEnterMap({ daroumOnly: true, soloOnly: true })}
          >
            <div className="card-header">
              <div className="card-icon-wrap icon-daroum">
                <CreditCard size={22} />
              </div>
              <span className="card-badge badge-daroum">통장 세이프</span>
            </div>
            <h3 className="card-title">1인분 & 다로움 10% 혜택 💸</h3>
            <p className="card-desc">
              자취생 통장 지켜주는 1인 소포장 주문 가능 여부 & 익산 다로움 10% 캐시백 필터
            </p>

            {/* 인터랙티브 마이크로 엘리먼트 */}
            <div className="card-micro-box">
              <div className="micro-row">
                <span className="micro-label">익산 1인가구 혜택</span>
                <span className="micro-val tag-orange">10% 환급 + 1인 맞춤</span>
              </div>
              <div className="micro-tags">
                <span className="m-chip daroum">#익산다로움 10% 환급</span>
                <span className="m-chip solo">#1인분 포장 가능</span>
                <span className="m-chip caution">#2인분이상 강요 경고</span>
              </div>
              <div className="micro-hint">
                <span>클릭 시 다로움+1인분 필터 바로 보기</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </div>
        </div>

        {/* 4. 메인 CTA 버튼 (Pulsing / Glowing Big Button) */}
        <div className="landing-cta-container">
          <button
            className="landing-main-cta-btn"
            onClick={() => onEnterMap({})}
          >
            <span className="cta-glow-effect" />
            <span className="cta-content">
              <Flame size={22} className="cta-flame-icon" />
              <span className="cta-text">익산 로컬 라이프 지도 들어오기 🔥</span>
              <ArrowRight size={20} className="cta-arrow-icon" />
            </span>
          </button>
          <p className="cta-subtext">
            💡 별도 회원가입 없이 익산 원광대 주변 10개 핵심 편의시설 즉시 무료 조회
          </p>
        </div>

        {/* 5. 퀵 카테고리 런처 칩 */}
        <div className="landing-quick-chips-wrap">
          <span className="quick-chips-label">자주 찾는 카테고리로 바로 진입:</span>
          <div className="quick-chips-list">
            <button
              className="quick-chip-item"
              onClick={() => onEnterMap({ category: 'laundry' })}
            >
              <Waves size={14} />
              <span>24시 코인빨래방</span>
            </button>
            <button
              className="quick-chip-item"
              onClick={() => onEnterMap({ category: 'pharmacy' })}
            >
              <HeartPulse size={14} />
              <span>심야·주말 당번약국</span>
            </button>
            <button
              className="quick-chip-item"
              onClick={() => onEnterMap({ category: 'print' })}
            >
              <Printer size={14} />
              <span>24시 무인 프린트</span>
            </button>
            <button
              className="quick-chip-item"
              onClick={() => onEnterMap({ category: 'daiso' })}
            >
              <Sparkles size={14} />
              <span>다이소 생활용품</span>
            </button>
            <button
              className="quick-chip-item"
              onClick={() => onEnterMap({ category: 'mart' })}
            >
              <ShoppingBag size={14} />
              <span>대형마트 / 식료품</span>
            </button>
          </div>
        </div>

        {/* 6. 익산 자취생 팁 푸터 배너 */}
        <div className="landing-footer-banner">
          <div className="footer-banner-pill">
            <Info size={15} />
            <span>
              <strong>Tip:</strong> 원광대 북문, 신동 대학로, 모현동 상권까지 GPS 실측 데이터를 기반으로 오차 없이 안내합니다.
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
