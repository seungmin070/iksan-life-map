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
  VIRTUAL_STUDIO_ROOMS,
  filterAndSortMockPlaces
} from './data/mockData';
import { List, X, Store, Navigation } from 'lucide-react';

export default function App() {
  // 1. 초기 마스터 데이터 (자취방 목록, 캠퍼스 거점, 카테고리)
  const [studioRooms, setStudioRooms] = useState(VIRTUAL_STUDIO_ROOMS);
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

  // 카카오 지도 API 키 관리
  const [kakaoKey, setKakaoKey] = useState(() => {
    return localStorage.getItem('kakao_js_key') || import.meta.env.VITE_KAKAO_JS_KEY || '';
  });
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // 메인 지도 진입 여부
  const [showMap, setShowMap] = useState(false);

  // 2. 출발지 (내 자취방) 상태 관리: 기본값은 원광대 대학로 1길 원룸타운
  const [selectedOriginId, setSelectedOriginId] = useState('studio-daehakro');
  const [userGpsLocation, setUserGpsLocation] = useState(null);

  // 필터 상태
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [daroumOnly, setDaroumOnly] = useState(false);
  const [soloOnly, setSoloOnly] = useState(false);
  const [openLateOnly, setOpenLateOnly] = useState(false);
  const [essentialOnly, setEssentialOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('distance'); // 기본: 가까운 거리순

  // 3. UI 레이아웃 상태: 지도가 기본 전체 화면으로 쾌적하게 보이도록 사이드바는 기본 닫힘 (false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRoutePlannerOpen, setIsRoutePlannerOpen] = useState(false);

  // 4. 지도 선택 점포 상태: 마커를 클릭했을 때만 오버레이 팝업이 뜨도록 초기값 null
  const [selectedPlace, setSelectedPlace] = useState(null);

  // 길찾기 목적지 점포
  const [destinationPlace, setDestinationPlace] = useState(null);

  // 지도 경로 화면 맞춤 타깃
  const [routeBoundsTarget, setRouteBoundsTarget] = useState(null);

  // 모달 상태
  const [detailModalPlace, setDetailModalPlace] = useState(null);
  const [reviewModalPlace, setReviewModalPlace] = useState(null);

  // 데이터 상태: 초기 embedded mock dataset 로드
  const initialPlacesList = useMemo(() => {
    return filterAndSortMockPlaces({
      category: 'all',
      originStudioId: 'studio-daehakro',
      sortBy: 'distance'
    });
  }, []);

  const [places, setPlaces] = useState(initialPlacesList);
  const [isLoading, setIsLoading] = useState(false);

  // 초기 도착지 설정
  useEffect(() => {
    if (initialPlacesList.length > 0 && !destinationPlace) {
      setDestinationPlace(initialPlacesList[0]);
    }
  }, [initialPlacesList, destinationPlace]);

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

  // 출발지 선택 핸들러
  const handleSelectOrigin = useCallback((originId) => {
    if (originId === 'gps') {
      handleRequestGps();
    } else {
      setUserGpsLocation(null);
      setSelectedOriginId(originId);
    }
  }, [handleRequestGps]);

  // 경로 한눈에 보기 핸들러
  const handleFitRouteBounds = useCallback((originLat, originLng, destLat, destLng) => {
    setRouteBoundsTarget({
      originLat,
      originLng,
      destLat,
      destLng,
      timestamp: Date.now()
    });
  }, []);

  // 1. 초기 마스터 데이터 로드 (백엔드 API가 있으면 연동)
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
        console.info('[Offline/Vercel Mode] Using embedded master dataset');
      }
    }
    loadMasterData();
  }, []);

  // 2. 장소 목록 조회 및 실시간 도보 거리 계산
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
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (sortBy) params.append('sortBy', sortBy);

      const res = await fetch(`/api/places?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setPlaces(data.data);
          apiSuccess = true;
        }
      }
    } catch (err) {
      // Vercel Fallback
    }

    if (!apiSuccess) {
      const mockResult = filterAndSortMockPlaces({
        category: selectedCategory,
        daroumOnly,
        soloOnly,
        openLateOnly,
        essentialOnly,
        originStudioId: selectedOriginId,
        customOrigin: userGpsLocation,
        searchQuery,
        sortBy,
        campusNodes,
        studioRooms
      });

      setPlaces(mockResult);
    }

    setIsLoading(false);
  }, [selectedCategory, daroumOnly, soloOnly, openLateOnly, essentialOnly, selectedOriginId, userGpsLocation, searchQuery, sortBy, campusNodes, studioRooms]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  // API 키 저장 핸들러
  const handleSaveKakaoKey = (newKey) => {
    if (newKey) {
      localStorage.setItem('kakao_js_key', newKey);
      setKakaoKey(newKey);
    } else {
      localStorage.removeItem('kakao_js_key');
      setKakaoKey('');
    }
  };

  // 상세 모달 열기 핸들러
  const handleOpenDetail = async (place) => {
    try {
      const res = await fetch(`/api/places/${place.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setDetailModalPlace(data.data);
          return;
        }
      }
    } catch (err) {}
    setDetailModalPlace(place);
  };

  // 카카오 실시간 검색 결과 장소 클릭 연동
  const handleSelectKakaoPlace = async (kakaoItem) => {
    const fallbackPlace = {
      id: 'kakao-' + kakaoItem.id,
      name: kakaoItem.place_name,
      category_name: '생활편의',
      category_slug: 'convenience',
      road_address: kakaoItem.road_address_name || kakaoItem.address_name,
      lat: parseFloat(kakaoItem.y),
      lng: parseFloat(kakaoItem.x),
      phone: kakaoItem.phone,
      distanceKm: 1.2,
      walkMinutes: 15,
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
    setDestinationPlace(fallbackPlace);
  };

  const handleEnterMap = useCallback((options = {}) => {
    if (options.category) setSelectedCategory(options.category);
    if (options.originStudioId) setSelectedOriginId(options.originStudioId);
    if (options.daroumOnly) setDaroumOnly(true);
    if (options.soloOnly) setSoloOnly(true);
    if (options.openLateOnly) setOpenLateOnly(true);
    if (options.essentialOnly) setEssentialOnly(true);
    if (options.sortBy) setSortBy(options.sortBy);
    setShowMap(true);
  }, []);

  // 현재 유효한 출발지 명칭 구하기
  const currentOriginName = useMemo(() => {
    if (userGpsLocation) return '내 현재 위치 (GPS)';
    const studio = studioRooms.find((s) => s.id === selectedOriginId);
    if (studio) return studio.shortName;
    const node = campusNodes.find((n) => n.id === Number(selectedOriginId));
    if (node) return node.node_name.split(' ')[0];
    return '대학로 자취방';
  }, [selectedOriginId, userGpsLocation, studioRooms, campusNodes]);

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
      {/* 1. 상단 글로벌 네비게이션 헤더 */}
      <Navbar
        studioRooms={studioRooms}
        campusNodes={campusNodes}
        selectedOriginId={selectedOriginId}
        onSelectOrigin={handleSelectOrigin}
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

      {/* 2. 메인 화면: 지도가 100% 전체 영역을 시원하게 차지 */}
      <main className="main-content">
        {/* 접이식 사이드바 (Floating Drawer): 기본 닫힘, 필요 시 좌측에서 슬라이드 인 */}
        <aside className={`sidebar-floating-drawer ${isSidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-drawer-header">
            <div className="sidebar-drawer-title">
              <Store size={18} color="var(--primary)" />
              <span>익산 자취 편의 점포 ({places.length})</span>
            </div>
            <button
              className="sidebar-close-btn"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="목록 접기"
              title="목록 접고 지도 넓게 보기"
            >
              <X size={18} />
            </button>
          </div>

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

          {/* 장소 카드 스크롤 목록 */}
          <div className="places-list">
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <p>자취방 기준 실시간 도보 거리를 계산하는 중...</p>
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

        {/* 사이드바가 닫혀 있을 때 화면 좌측에 노출되는 원클릭 열기 플로팅 버튼 */}
        {!isSidebarOpen && (
          <button
            className="floating-sidebar-toggle-btn"
            onClick={() => setIsSidebarOpen(true)}
            title="편의 점포 목록 열기"
          >
            <List size={16} />
            <span>점포 목록 ({places.length})</span>
          </button>
        )}

        {/* 3. 지도 영역: 100% 가득 찬 인터랙티브 뷰 */}
        <div className="map-view-wrapper">
          {/* 네이버 지도 스타일 도보 경로 계산기 위젯 (상단 플로팅) */}
          {isRoutePlannerOpen && (
            <RoutePlannerWidget
              studioRooms={studioRooms}
              campusNodes={campusNodes}
              places={places}
              selectedOriginId={userGpsLocation ? 'gps' : selectedOriginId}
              onSelectOrigin={handleSelectOrigin}
              userGpsLocation={userGpsLocation}
              onRequestGps={handleRequestGps}
              selectedDestinationPlace={destinationPlace || places[0]}
              onSelectDestinationPlace={(p) => setDestinationPlace(p)}
              onFitRouteBounds={handleFitRouteBounds}
              onClose={() => setIsRoutePlannerOpen(false)}
            />
          )}

          {/* 마커 클릭 시만 뜨는 작고 깔끔한 오버레이 팝업 카드 (우측 상단 'X' 버튼 제공) */}
          {selectedPlace && (
            <FloatingMapCard
              place={selectedPlace}
              originName={currentOriginName}
              onClose={() => setSelectedPlace(null)}
              onOpenDetail={handleOpenDetail}
              onSetAsDestination={(p) => {
                setDestinationPlace(p);
                setIsRoutePlannerOpen(true);
                handleFitRouteBounds(
                  userGpsLocation?.lat || studioRooms.find(s => s.id === selectedOriginId)?.lat || 35.9692,
                  userGpsLocation?.lng || studioRooms.find(s => s.id === selectedOriginId)?.lng || 126.9575,
                  p.lat,
                  p.lng
                );
              }}
            />
          )}

          {/* 인터랙티브 지도 렌더링 */}
          {kakaoKey ? (
            <KakaoMapView
              kakaoKey={kakaoKey}
              places={places}
              studioRooms={studioRooms}
              campusNodes={campusNodes}
              selectedOriginId={selectedOriginId}
              onSelectOrigin={handleSelectOrigin}
              selectedPlace={selectedPlace}
              destinationPlace={destinationPlace}
              userGpsLocation={userGpsLocation}
              onSelectPlace={(place) => setSelectedPlace(place)}
              onSelectKakaoPlace={handleSelectKakaoPlace}
              searchQuery={searchQuery}
              onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
              routeBoundsTarget={routeBoundsTarget}
            />
          ) : (
            <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
              <MapView
                places={places}
                studioRooms={studioRooms}
                campusNodes={campusNodes}
                selectedOriginId={selectedOriginId}
                onSelectOrigin={handleSelectOrigin}
                selectedPlace={selectedPlace}
                destinationPlace={destinationPlace}
                userGpsLocation={userGpsLocation}
                onSelectPlace={(place) => setSelectedPlace(place)}
                routeBoundsTarget={routeBoundsTarget}
              />

              {/* 카카오 지도 API 키 안내 칩 */}
              <div className="kakao-floating-chip">
                <span style={{ fontSize: '1rem' }}>🗺️</span>
                <div>
                  <strong>실제 카카오 지도 연동 가능</strong>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    카카오 JavaScript API 키를 등록하면 익산 전체 실시간 로드뷰와 POI 검색을 이용할 수 있습니다.
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

      {/* 상세 후기 모달 */}
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

      {/* 카카오 API 키 모달 */}
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
