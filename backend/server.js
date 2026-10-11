/**
 * Express REST API Server
 * Iksan Local Life & Convenience Map API
 */

const express = require('express');
const cors = require('cors');
const db = require('./db');
const { extractInsightsFromReview } = require('./nlpExtractor');

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors());
app.use(express.json());

// 데이터베이스 초기화
db.initDatabase();

// ----------------------------------------------------------------------------
// API 라우트
// ----------------------------------------------------------------------------

// 1. 원광대 캠퍼스 주요 거점 목록 (북문, 대학로, 정문, 병원 등)
app.get('/api/campus-nodes', (req, res) => {
  try {
    const nodes = db.getCampusNodes();
    res.json({ success: true, data: nodes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. 카테고리 목록
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.getCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. 태그 마스터 목록
app.get('/api/tags', (req, res) => {
  try {
    const tags = db.getTags();
    res.json({ success: true, data: tags });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. 장소 목록 조회 (다양한 필터 및 원광대 거점 거리 계산)
app.get('/api/places', (req, res) => {
  try {
    const { category, daroum, soloOnly, openLate, quickFilter, gateNodeId, search, sortBy } = req.query;
    const places = db.getPlaces({ category, daroum, soloOnly, openLate, quickFilter, gateNodeId, search, sortBy });
    res.json({ success: true, count: places.length, data: places });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. 장소 상세 조회 (4축 세부 평가, 배지, 리뷰 전체 목록)
app.get('/api/places/:id', (req, res) => {
  try {
    const { gateNodeId } = req.query;
    const place = db.getPlaceById(req.params.id, gateNodeId);
    if (!place) {
      return res.status(404).json({ success: false, message: '장소를 찾을 수 없습니다.' });
    }
    res.json({ success: true, data: place });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. 실시간 NLP 태그 및 감성 추출 미리보기 (리뷰 작성 시 실시간 피드백)
app.post('/api/nlp/preview', (req, res) => {
  try {
    const { text } = req.body;
    const insights = extractInsightsFromReview(text);
    res.json({ success: true, data: insights });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. 카카오 지도 실시간 장소 연동 및 동기화 (클릭/검색 시 로컬 평가 DB 연결)
app.post('/api/places/sync-kakao', (req, res) => {
  try {
    const { kakaoPlace, gateNodeId } = req.body;
    if (!kakaoPlace || !kakaoPlace.id) {
      return res.status(400).json({ success: false, message: '유효한 카카오 장소 데이터가 필요합니다.' });
    }

    const synced = db.syncKakaoPlace(kakaoPlace, gateNodeId);
    res.json({ success: true, data: synced });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. 카카오 로컬 키워드 검색 백엔드 프록시 (REST API Key 지원)
app.get('/api/kakao/search', async (req, res) => {
  try {
    const { query, x, y, radius, category_group_code, page, apiKey } = req.query;
    const restKey = apiKey || process.env.KAKAO_REST_API_KEY;

    if (!restKey) {
      return res.status(400).json({
        success: false,
        needKey: true,
        message: '카카오 REST API 키가 등록되지 않았습니다. .env에 KAKAO_REST_API_KEY를 등록하거나 프론트엔드 JS SDK를 이용하세요.'
      });
    }

    const kakaoUrl = new URL('https://dapi.kakao.com/v2/local/search/keyword.json');
    kakaoUrl.searchParams.append('query', query || '원광대 맛집');
    if (x) kakaoUrl.searchParams.append('x', x);
    if (y) kakaoUrl.searchParams.append('y', y);
    if (radius) kakaoUrl.searchParams.append('radius', radius || '2000');
    if (category_group_code) kakaoUrl.searchParams.append('category_group_code', category_group_code);
    if (page) kakaoUrl.searchParams.append('page', page);

    const kakaoRes = await fetch(kakaoUrl.toString(), {
      headers: {
        Authorization: `KakaoAK ${restKey}`
      }
    });

    if (!kakaoRes.ok) {
      const errText = await kakaoRes.text();
      return res.status(kakaoRes.status).json({ success: false, error: errText });
    }

    const data = await kakaoRes.json();
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. API 설정 상태 확인
app.get('/api/config', (req, res) => {
  res.json({
    success: true,
    data: {
      hasKakaoRestKey: !!process.env.KAKAO_REST_API_KEY,
      defaultCenter: { lat: 35.9705, lng: 126.9575 } // 원광대학교 신동 중심
    }
  });
});

// 7. 리뷰 등록 (다차원 평가, 텍스트 감성 분석, 배지 자동 승격)
app.post('/api/places/:id/reviews', (req, res) => {
  try {
    const placeId = req.params.id;
    const {
      nickname,
      verificationTier,
      isSoloVisit,
      costSpent,
      overallRating,
      content,
      accessScore,
      timeScore,
      stabilityScore,
      soloScore,
      costScore,
      convScore,
      selectedTags
    } = req.body;

    if (!content || !overallRating) {
      return res.status(400).json({ success: false, message: '리뷰 내용과 종합 평점은 필수입니다.' });
    }

    const result = db.createReview({
      placeId,
      nickname,
      verificationTier,
      isSoloVisit,
      costSpent,
      overallRating,
      content,
      accessScore: accessScore || overallRating,
      timeScore: timeScore || soloScore || overallRating,
      stabilityScore: stabilityScore || costScore || overallRating,
      selectedTags
    });

    // 갱신된 장소 정보 반환
    const updatedPlace = db.getPlaceById(placeId);

    res.json({
      success: true,
      message: '리뷰가 등록되었습니다. AI 태그 추출 및 평점 통계가 재산출되었습니다.',
      data: {
        reviewResult: result,
        updatedPlace
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 헬스 체크
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Iksan Life Map API is running smoothly' });
});

// 프로덕션 정적 파일 서빙 (frontend/dist 빌드물이 존재할 경우)
const path = require('path');
const fs = require('fs');
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Iksan Life Map API Server running on port ${PORT}`);
  console.log(`   API 주소 : http://localhost:${PORT}/api/places`);
  console.log(`   웹 UI    : http://localhost:${PORT}`);
  console.log(`====================================================`);
});

