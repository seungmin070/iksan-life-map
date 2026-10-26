import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from './components/Navbar';
import FilterBar from './components/FilterBar';
import PlaceCard from './components/PlaceCard';
import MapView from './components/MapView';
import KakaoMapView from './components/KakaoMapView';
import PlaceDetailModal from './components/PlaceDetailModal';
import ReviewFormModal from './components/ReviewFormModal';
import ApiKeyModal from './components/ApiKeyModal';
import LandingScreen from './components/LandingScreen';
import FloatingMapCard from './components/FloatingMapCard';
import RoutePlannerWidget from './components/RoutePlannerWidget';
import {
  INITIAL_CAMPUS_NODES,
  INITIAL_CATEGORIES,
  INITIAL_TAGS,
  filterAndSortMockPlaces
} from './data/mockData';

export default function App() {
  // 1. 초기 마스터 데이터: embedded mock dataset으로 초기화 (Vercel 배포 시 즉시 렌더링)
  const [campusNodes, setCampusNodes] = useState(INITIAL_CAMPUS_NODES);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [tagsMaster, setTagsMaster] = useState(INITIAL_TAGS);

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

  // 메인 지도 진입 여부 (랜딩 페이지 덮개 상태)
  const [showMap, setShowMap] = useState(false);

  // 필터 상태
  const [selectedGateId, setSelectedGateId] = useState(1); // 기본: 원광대학교병원 (id: 1)
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [daroumOnly, setDaroumOnly] = useState(false);
  const [soloOnly, setSoloOnly] = useState(false);
  const [openLateOnly, setOpenLateOnly] = useState(false);
  const [essentialOnly, setEssentialOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('score');

  const handleEnterMap = useCallback((options = {}) => {
    if (options.category) setSelectedCategory(options.category);
    if (options.gateNodeId) setSelectedGateId(options.gateNodeId);
    if (options.daroumOnly) setDaroumOnly(true);
    if (options.soloOnly) setSoloOnly(true);
    if (options.openLateOnly) setOpenLateOnly(true);
    if (options.essentialOnly) setEssentialOnly(true);
    if (options.sortBy) setSortBy(options.sortBy);
    setShowMap(true);
  }, []);

  // 데이터 상태: 초기 렌더링 시 embedded mock data를 즉시 계산하여 빈 화면(0 facilities) 방지
  const initialPlacesList = useMemo(() => {
    return filterAndSortMockPlaces({
      category: 'all',
      gateNodeId: 1,
      sortBy: 'score'
    });
  }, []);

  const [places, setPlaces] = useState(initialPlacesList);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(initialPlacesList[0] || null);

  // 사이드바 목록 접기/펼치기 (지도 100% 와이드 뷰 토글)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 실시간 도보 길찾기 계산기 모달/위젯 상태
  const [isRoutePlannerOpen, setIsRoutePlannerOpen] = useState(false);

  // GPS 사용자 현재 위치
  const [userGpsLocation, setUserGpsLocation] = useState(null);

  // 길찾기 대상 목적지 점포
  const [destinationPlace, setDestinationPlace] = useState(null);

  // GPS 실시간 내 위치 감지 핸들러
  const handleRequestGps = useCallback(() => {
    if (!navigator.geolocation) {
      alert('사용하시는 브라우저가 위치 정보(GPS) 서비스를 지원하지 않습니다.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const coords = { lat: latitude, lng: longitude, name: '내 현재 위치' };
        setUserGpsLocation(coords);
      },
      (err) => {
        console.warn('Geolocation access failed:', err);
        alert('현재 GPS 위치 정보를 가져오지 못했습니다. 브라우저 위치 권한을 확인해주세요.');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  }, []);

  // 모달 상태
  const [detailModalPlace, setDetailModalPlace] = useState(null);
  const [reviewModalPlace, setReviewModalPlace] = useState(null);

  // 1. 초기 마스터 데이터 로드 (백엔드 API가 있으면 연동, 없으면 embedded mock 유지)
  useEffect(() => {
    async function loadMasterData() {
      try {
        const [nodesRes, catsRes, tagsRes] = await Promise.all([
          fetch('/api/campus-nodes').catch(() => null),
          fetch('/api/categories').catch(() => null),
          fetch('/api/tags').catch(() => null)
        ]);

        if (nodesRes && nodesRes.ok) {
          const nodesData = await nodesRes.json();
          if (nodesData.success && nodesData.data?.length > 0) setCampusNodes(nodesData.data);
        }
        if (catsRes && catsRes.ok) {
          const catsData = await catsRes.json();
          if (catsData.success && catsData.data?.length > 0) setCategories(catsData.data);
        }
        if (tagsRes && tagsRes.ok) {
          const tagsData = await tagsRes.json();
          if (tagsData.success && tagsData.data?.length > 0) setTagsMaster(tagsData.data);
        }
      } catch (err) {
        // Vercel 정적 배포 환경에서는 초기 embedded mock 데이터 그대로 사용
        console.info('[Offline/Vercel Mode] Using embedded master dataset');
      }
    }
    loadMasterData();
  }, []);

  // 2. 장소 목록 조회 (백엔드 API 호출 시도 -> 실패 또는 0건 반환 시 즉시 embedded mock dataset 필터링으로 Fallback)
  const fetchPlaces = useCallback(async () => {
    setIsLoading(true);
    let apiSuccess = false;

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
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setPlaces(data.data);
          if (!selectedPlace || !data.data.some((p) => p.id === selectedPlace.id)) {
            setSelectedPlace(data.data[0]);
          }
          apiSuccess = true;
        }
      }
    } catch (err) {
      // Vercel 클라우드 환경에서는 Express API가 로컬호스트에 없으므로 의도된 fallback 실행
    }

    // 백엔드 API 미구동 상태(Vercel 등)이거나 오류 시 embedded mock dataset 즉시 로드
    if (!apiSuccess) {
      const mockResult = filterAndSortMockPlaces({
        category: selectedCategory,
        daroumOnly,
        soloOnly,
        openLateOnly,
        essentialOnly,
        gateNodeId: selectedGateId,
        searchQuery,
        sortBy,
        campusNodes,
        customOrigin: userGpsLocation
      });

      setPlaces(mockResult);
      if (mockResult.length > 0) {
        if (!selectedPlace || !mockResult.some((p) => p.id === selectedPlace.id)) {
          setSelectedPlace(mockResult[0]);
        }
      }
    }

    setIsLoading(false);
  }, [selectedCategory, daroumOnly, soloOnly, openLateOnly, essentialOnly, selectedGateId, searchQuery, sortBy, selectedPlace, campusNodes, userGpsLocation]);

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

  // 4. 상세 모달 열기 핸들러 (API 호출 실패 시 현재 place 객체 직접 사용)
  const handleOpenDetail = async (place) => {
    try {
      const res = await fetch(`/api/places/${place.id}?gateNodeId=${selectedGateId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setDetailModalPlace(data.data);
          return;
        }
      }
    } catch (err) {
      // Offline fallback
    }
    // API가 없거나 실패하더라도 내장 mock 데이터에 모든 리뷰와 상세 스펙이 포함되어 있으므로 즉시 모달 표시
    setDetailModalPlace(place);
  };

  // 5. 카카오 실시간 검색 결과 장소 클릭 시 연동
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

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          const syncedPlace = data.data;
          setSelectedPlace(syncedPlace);
          setDetailModalPlace(syncedPlace);
          fetchPlaces();
          return;
        }
      }
    } catch (err) {
      console.warn('Kakao place sync error', err);
    }

    // 오프라인 fallback: 기본 장소 객체 생성
    const fallbackPlace = {
      id: 'kakao-' + kakaoItem.id,
      name: kakaoItem.place_name,
      category_name: '생활편의',
      category_slug: 'convenience',
      road_address: kakaoItem.road_address_name || kakaoItem.address_name,
      lat: parseFloat(kakaoItem.y),
      lng: parseFloat(kakaoItem.x),
      phone: kakaoItem.phone,
      distanceKm: 1.5,
      walkMinutes: 20,
      access_score: 4.0,
      time_score: 4.0,
      stability_score: 4.0,
      composite_score: 4.00,
      single_portion_takeout: 1,
      is_daroum_accepted: 1,
      today_status: '영업 중',
      reviews: []
    };
    setSelectedPlace(fallbackPlace);
    setDetailModalPlace(fallbackPlace);
  };

  if (!showMap) {
    return (
      <LandingScreen
        onEnterMap={handleEnterMap}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />
    );
  }

  return (
    <div className={`app-container ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* 글로벌 네비게이션 헤더 */}
      <Navbar
        campusNodes={campusNodes}
        selectedGateId={selectedGateId}
        onSelectGate={(id) => {
          setUserGpsLocation(null);
          setSelectedGateId(id);
        }}
        userGpsLocation={userGpsLocation}
        onRequestGps={handleRequestGps}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isRoutePlannerOpen={isRoutePlannerOpen}
        onToggleRoutePlanner={() => setIsRoutePlannerOpen((prev) => !prev)}
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
        onOpenLanding={() => setShowMap(false)}
      />

      {/* 메인 뷰: 좌측 장소 리스트 + 우측 인터랙티브 지도 */}
      <main className="main-content">
        <aside className={`sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}>
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
                <p>원광대 & 익산 1인가구 맞춤 편의 정보를 불러오는 중...</p>
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
                  onSetAsDestination={(p) => {
                    setDestinationPlace(p);
                    setIsRoutePlannerOpen(true);
                  }}
                />
              ))
            )}
          </div>
        </aside>

        {/* 인터랙티브 지도 영역 래퍼 */}
        <div className="map-view-wrapper">
          {/* 맞춤형 도보 길찾기 계산기 (네이버 지도 스타일) */}
          {isRoutePlannerOpen && (
            <RoutePlannerWidget
              campusNodes={campusNodes}
              places={places}
              selectedOriginNodeId={userGpsLocation ? 'gps' : selectedGateId}
              onSelectOriginNode={(val) => {
                if (val === 'gps') {
                  handleRequestGps();
                } else {
                  setUserGpsLocation(null);
                  setSelectedGateId(Number(val));
                }
              }}
              userGpsLocation={userGpsLocation}
              onRequestGps={handleRequestGps}
              selectedDestinationPlace={destinationPlace || selectedPlace}
              onSelectDestinationPlace={(p) => setDestinationPlace(p)}
              onClose={() => setIsRoutePlannerOpen(false)}
            />
          )}

          {/* 마커 클릭 시 지도 위에 즉각 표시되는 플로팅 인포 카드 */}
          {selectedPlace && (
            <FloatingMapCard
              place={selectedPlace}
              originName={userGpsLocation ? '내 현재 위치' : (campusNodes.find((n) => n.id === selectedGateId)?.node_name?.split(' ')[0] || '원광대병원')}
              onClose={() => setSelectedPlace(null)}
              onOpenDetail={handleOpenDetail}
              onSetAsDestination={(p) => {
                setDestinationPlace(p);
                setIsRoutePlannerOpen(true);
              }}
            />
          )}

          {/* 지도 렌더링 (카카오 키가 있으면 카카오 지도, 없으면 내장 Leaflet 지도) */}
          {kakaoKey ? (
            <KakaoMapView
              kakaoKey={kakaoKey}
              places={places}
              campusNodes={campusNodes}
              selectedGateId={selectedGateId}
              selectedPlace={selectedPlace}
              userGpsLocation={userGpsLocation}
              onSelectPlace={(place) => setSelectedPlace(place)}
              onSelectKakaoPlace={handleSelectKakaoPlace}
              searchQuery={searchQuery}
              onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
            />
          ) : (
            <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
              <MapView
                places={places}
                campusNodes={campusNodes}
                selectedGateId={selectedGateId}
                selectedPlace={selectedPlace}
                userGpsLocation={userGpsLocation}
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
        </div>
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
          onSubmitSuccess={(newReview) => {
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
