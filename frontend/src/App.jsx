import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import FilterBar from './components/FilterBar';
import PlaceCard from './components/PlaceCard';
import MapView from './components/MapView';
import KakaoMapView from './components/KakaoMapView';
import PlaceDetailModal from './components/PlaceDetailModal';
import ReviewFormModal from './components/ReviewFormModal';
import ApiKeyModal from './components/ApiKeyModal';

export default function App() {
  const [campusNodes, setCampusNodes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tagsMaster, setTagsMaster] = useState([]);

  // 다크/라이트 모드 테마 관리
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme_mode') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme_mode', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme_mode', 'light');
    }
  }, [isDarkMode]);

  // 카카오 지도 API 키 관리 (로컬스토리지 및 환경변수 지원)
  const [kakaoKey, setKakaoKey] = useState(() => {
    return localStorage.getItem('kakao_js_key') || import.meta.env.VITE_KAKAO_JS_KEY || '';
  });
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // 필터 상태
  const [selectedGateId, setSelectedGateId] = useState(1); // 기본: 원광대학교병원 (id: 1)
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [daroumOnly, setDaroumOnly] = useState(false);
  const [soloOnly, setSoloOnly] = useState(false);
  const [openLateOnly, setOpenLateOnly] = useState(false);
  const [essentialOnly, setEssentialOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('score');

  // 데이터 상태
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // 모달 상태
  const [detailModalPlace, setDetailModalPlace] = useState(null);
  const [reviewModalPlace, setReviewModalPlace] = useState(null);

  // 1. 초기 마스터 데이터 로드
  useEffect(() => {
    async function loadMasterData() {
      try {
        const [nodesRes, catsRes, tagsRes] = await Promise.all([
          fetch('/api/campus-nodes'),
          fetch('/api/categories'),
          fetch('/api/tags')
        ]);
        const [nodesData, catsData, tagsData] = await Promise.all([
          nodesRes.json(),
          catsRes.json(),
          tagsRes.json()
        ]);

        if (nodesData.success) setCampusNodes(nodesData.data);
        if (catsData.success) setCategories(catsData.data);
        if (tagsData.success) setTagsMaster(tagsData.data);
      } catch (err) {
        console.error('Master data load failed', err);
      }
    }
    loadMasterData();
  }, []);

  // 2. 장소 목록 조회 (필터 반영)
  const fetchPlaces = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (daroumOnly) params.append('daroum', 'true');
      if (soloOnly) params.append('soloOnly', 'true');
      if (openLateOnly) params.append('openLate', 'true');
      if (essentialOnly) params.append('quickFilter', 'essential');
      if (selectedGateId) params.append('gateNodeId', selectedGateId);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (sortBy) params.append('sortBy', sortBy);

      const res = await fetch(`/api/places?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setPlaces(data.data);
        if (data.data.length > 0 && !selectedPlace) {
          setSelectedPlace(data.data[0]);
        }
      }
    } catch (err) {
      console.error('Places fetch failed', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, daroumOnly, soloOnly, openLateOnly, essentialOnly, selectedGateId, searchQuery, sortBy, selectedPlace]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  // 3. API 키 저장 핸들러
  const handleSaveKakaoKey = (newKey) => {
    if (newKey) {
      localStorage.setItem('kakao_js_key', newKey);
      setKakaoKey(newKey);
    } else {
      localStorage.removeItem('kakao_js_key');
      setKakaoKey('');
    }
  };

  // 4. 상세 모달 열기 핸들러 (전체 리뷰 포함 데이터 fetch)
  const handleOpenDetail = async (place) => {
    try {
      const res = await fetch(`/api/places/${place.id}?gateNodeId=${selectedGateId}`);
      const data = await res.json();
      if (data.success) {
        setDetailModalPlace(data.data);
      } else {
        setDetailModalPlace(place);
      }
    } catch (err) {
      setDetailModalPlace(place);
    }
  };

  // 5. 카카오 실시간 검색 결과 장소 클릭 시 로컬 평가 DB와 연동
  const handleSelectKakaoPlace = async (kakaoItem) => {
    try {
      const res = await fetch('/api/places/sync-kakao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kakaoPlace: kakaoItem,
          gateNodeId: selectedGateId
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        const syncedPlace = data.data;
        setSelectedPlace(syncedPlace);
        setDetailModalPlace(syncedPlace);
        fetchPlaces();
      }
    } catch (err) {
      console.error('Kakao place sync error', err);
    }
  };

  return (
    <div className={`app-container ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* 글로벌 네비게이션 헤더 */}
      <Navbar
        campusNodes={campusNodes}
        selectedGateId={selectedGateId}
        onSelectGate={(id) => setSelectedGateId(id)}
        hasKakaoKey={!!kakaoKey}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        daroumOnly={daroumOnly}
        onToggleDaroum={() => setDaroumOnly(!daroumOnly)}
        soloOnly={soloOnly}
        onToggleSolo={() => setSoloOnly(!soloOnly)}
        openLateOnly={openLateOnly}
        onToggleOpenLate={() => setOpenLateOnly(!openLateOnly)}
        essentialOnly={essentialOnly}
        onToggleEssential={() => setEssentialOnly(!essentialOnly)}
      />

      {/* 메인 뷰: 좌측 장소 리스트 + 우측 인터랙티브 지도 */}
      <main className="main-content">
        <aside className="sidebar">
          {/* 필터 & 검색 바 */}
          <FilterBar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
            searchQuery={searchQuery}
            onSearchChange={(q) => setSearchQuery(q)}
            sortBy={sortBy}
            onSortChange={(s) => setSortBy(s)}
            totalCount={places.length}
            soloOnly={soloOnly}
            onToggleSolo={() => setSoloOnly(!soloOnly)}
            daroumOnly={daroumOnly}
            onToggleDaroum={() => setDaroumOnly(!daroumOnly)}
            openLateOnly={openLateOnly}
            onToggleOpenLate={() => setOpenLateOnly(!openLateOnly)}
            essentialOnly={essentialOnly}
            onToggleEssential={() => setEssentialOnly(!essentialOnly)}
          />

          {/* 장소 카드 목록 스크롤 뷰 */}
          <div className="places-list">
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <p>원광대 주변 맞춤 편의 정보를 불러오는 중...</p>
              </div>
            ) : places.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <p>선택하신 조건에 맞는 장소가 없습니다.</p>
                <button
                  className="btn-small btn-outline"
                  style={{ marginTop: '0.75rem', display: 'inline-flex' }}
                  onClick={() => {
                    setSelectedCategory('all');
                    setDaroumOnly(false);
                    setSoloOnly(false);
                    setOpenLateOnly(false);
                    setEssentialOnly(false);
                    setSearchQuery('');
                  }}
                >
                  필터 초기화
                </button>
              </div>
            ) : (
              places.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  isSelected={selectedPlace && selectedPlace.id === place.id}
                  onSelect={(p) => setSelectedPlace(p)}
                  onOpenDetail={handleOpenDetail}
                  onOpenReviewForm={(p) => setReviewModalPlace(p)}
                />
              ))
            )}
          </div>
        </aside>

        {/* 인터랙티브 지도 영역 (카카오 키가 있으면 카카오 지도, 없으면 내장 Leaflet 지도) */}
        {kakaoKey ? (
          <KakaoMapView
            kakaoKey={kakaoKey}
            places={places}
            campusNodes={campusNodes}
            selectedGateId={selectedGateId}
            selectedPlace={selectedPlace}
            onSelectPlace={(place) => setSelectedPlace(place)}
            onSelectKakaoPlace={handleSelectKakaoPlace}
            searchQuery={searchQuery}
            onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          />
        ) : (
          <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <MapView
              places={places}
              campusNodes={campusNodes}
              selectedGateId={selectedGateId}
              selectedPlace={selectedPlace}
              onSelectPlace={(place) => setSelectedPlace(place)}
            />
            {/* 카카오 지도 활성화 플로팅 칩 */}
            <div className="kakao-floating-chip">
              <span style={{ fontSize: '1rem' }}>🗺️</span>
              <div>
                <strong>실제 카카오 지도 연동 가능</strong>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  카카오 JavaScript API 키를 등록하면 익산 전체 실시간 POI 검색 및 고해상도 로드뷰를 이용할 수 있습니다.
                </p>
              </div>
              <button
                className="btn-small btn-primary"
                style={{ marginLeft: 'auto', flexShrink: 0 }}
                onClick={() => setIsApiKeyModalOpen(true)}
              >
                키 등록
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 상세 모달 */}
      {detailModalPlace && (
        <PlaceDetailModal
          place={detailModalPlace}
          onClose={() => setDetailModalPlace(null)}
          onOpenReviewForm={(p) => setReviewModalPlace(p)}
        />
      )}

      {/* 리뷰 작성 모달 */}
      {reviewModalPlace && (
        <ReviewFormModal
          place={reviewModalPlace}
          tagsMaster={tagsMaster}
          onClose={() => setReviewModalPlace(null)}
          onSubmitSuccess={() => {
            fetchPlaces();
            if (detailModalPlace && detailModalPlace.id === reviewModalPlace.id) {
              handleOpenDetail(reviewModalPlace);
            }
          }}
        />
      )}

      {/* 카카오 API 키 관리 모달 */}
      {isApiKeyModalOpen && (
        <ApiKeyModal
          currentKey={kakaoKey}
          onSave={handleSaveKakaoKey}
          onClose={() => setIsApiKeyModalOpen(false)}
        />
      )}
    </div>
  );
}
