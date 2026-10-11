import React from 'react';
import { 
  Search, Sparkles, ShoppingBag, Store, Waves, Printer, HeartPulse, 
  Layers, Info, PackageCheck, CreditCard, Clock
} from 'lucide-react';

export default function FilterBar({
  categories = [],
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  totalCount,
  soloOnly,
  onToggleSolo,
  daroumOnly,
  onToggleDaroum,
  openLateOnly,
  onToggleOpenLate,
  essentialOnly,
  onToggleEssential
}) {
  // 카테고리별 아이콘 매핑
  const getCategoryIcon = (slug) => {
    switch (slug) {
      case 'daiso':
        return <Sparkles size={14} />;
      case 'mart':
        return <ShoppingBag size={14} />;
      case 'market':
        return <Store size={14} />;
      case 'laundry':
        return <Waves size={14} />;
      case 'print':
        return <Printer size={14} />;
      case 'pharmacy':
        return <HeartPulse size={14} />;
      default:
        return <Layers size={14} />;
    }
  };

  return (
    <div className="filter-section">
      {/* 1. 검색창 */}
      <div className="search-input-wrap">
        <Search size={16} color="var(--primary)" />
        <input
          type="text"
          className="search-input"
          placeholder="다이소, 롯데마트, 이마트, 빨래방, 프린트, 심야약국 검색..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0 4px', cursor: 'pointer' }}
          >
            ✕
          </button>
        )}
      </div>

      {/* 2. 카테고리 탭 (모던 글래스 필터 탭) */}
      <div className="category-tabs">
        <button
          className={`category-tab ${selectedCategory === 'all' && !essentialOnly ? 'active' : ''}`}
          onClick={() => {
            if (essentialOnly) onToggleEssential();
            onSelectCategory('all');
          }}
        >
          <Layers size={13} />
          <span>전체 ({totalCount})</span>
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-tab ${selectedCategory === cat.slug ? 'active' : ''}`}
            onClick={() => {
              if (essentialOnly) onToggleEssential();
              onSelectCategory(cat.slug);
            }}
          >
            {getCategoryIcon(cat.slug)}
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* 3. 모바일/사이드바 퀵 필터 칩 */}
      <div className="quick-tags-strip">
        <button
          className={`quick-pill-btn ${soloOnly ? 'active' : ''}`}
          onClick={onToggleSolo}
          title="1인분 포장 가능 또는 1인 가구 특화 시설만 보기"
        >
          <PackageCheck size={13} />
          <span>1인분 주문가능</span>
        </button>

        <button
          className={`quick-pill-btn ${daroumOnly ? 'active' : ''}`}
          onClick={onToggleDaroum}
          title="익산다로움 결제 시 10% 캐시백 지원 가맹점만 보기"
        >
          <CreditCard size={13} />
          <span>익산다로움 10%</span>
        </button>

        <button
          className={`quick-pill-btn ${openLateOnly ? 'active' : ''}`}
          onClick={onToggleOpenLate}
          title="24시간 운영 또는 22시 이후 심야 영업점만 보기"
        >
          <Clock size={13} />
          <span>심야·24시</span>
        </button>

        <button
          className={`quick-pill-btn ${essentialOnly ? 'active' : ''}`}
          onClick={onToggleEssential}
          title="빨래방, 무인 프린트, 심야약국만 필터링"
        >
          <Waves size={13} />
          <span>빨래·약국·인쇄</span>
        </button>
      </div>

      {/* 4. 원광대학교병원 실측 접근성 거리 기준 가이드 */}
      <div className="distance-criteria-chip">
        <Info size={13} style={{ flexShrink: 0 }} />
        <span>
          <strong>원대병원 실측 기준:</strong> 5점(≤1.3km) · 4점(1.4~1.8km) · 3점(1.9~2.3km) · 2점(2.4~2.8km) · 1점(≥2.9km)
        </span>
      </div>

      {/* 5. 총 개수 & 정렬 드롭다운 */}
      <div className="quick-filter-row">
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          조회 결과 <strong style={{ color: 'var(--text-primary)' }}>{totalCount}</strong>개 편의 시설
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="sort-select"
          >
            <option value="score">종합 평균 점수순</option>
            <option value="distance">원대병원 거리순</option>
            <option value="access">접근성 점수순</option>
            <option value="time">시간 충분성순</option>
            <option value="stability">운영 안정성순</option>
          </select>
        </div>
      </div>
    </div>
  );
}
