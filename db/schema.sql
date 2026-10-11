-- ============================================================================
-- 익산 원광대 및 1인 가구 특화 로컬 라이프 & 편의 지도 데이터베이스 스키마
-- Database: PostgreSQL 15+ with PostGIS Extension
-- ============================================================================

-- 0. 필수 익스텐션 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ----------------------------------------------------------------------------
-- 1. 커스텀 열거형(Enum) 정의
-- ----------------------------------------------------------------------------

-- 회원 인증 등급 (가중치 산정용)
CREATE TYPE user_verification_tier AS ENUM (
    'NONE',                     -- 일반 미인증 회원 (가중치 1.0)
    'WONKWANG_STUDENT',        -- 원광대 재학생/교직원 웹메일 인증 (가중치 1.3)
    'IKSAN_RESIDENT',          -- 익산시 거주지 GPS/원룸 거주 인증 (가중치 1.2)
    'ADMIN'                    -- 시스템 관리자
);

-- 평가 5대 지표 카테고리
CREATE TYPE evaluation_dimension AS ENUM (
    'ACCESSIBILITY',    -- 1. 접근성 (도보 거리, 골목 안심도)
    'OPERATING_HOURS',  -- 2. 운영 시간 (심야, 24시간, 시험기간)
    'COST_BURDEN',      -- 3. 가성비 (식사 단가, 무료 리필, 포션)
    'SOLO_SUITABILITY', -- 4. 1인 적합도 (혼밥석, 1인 주문, 눈치 여부)
    'CONVENIENCE'       -- 5. 편의성 (익산다로움 결제, 콘센트, 청결도)
);

-- 태그 극성 및 성격
CREATE TYPE tag_polarity AS ENUM (
    'POSITIVE',  -- 긍정 추천 배지 (예: #혼밥최적, #밥리필무료)
    'CAUTION',   -- 주의/부정 경고 배지 (예: #2인이상필수, #다로움불가)
    'ATTRIBUTE'  -- 단순 객관 속성 (예: #키오스크주문, #남녀분리화장실)
);

-- 태그 부여 출처
CREATE TYPE tag_source_type AS ENUM (
    'USER_SELECTED',  -- 작성자가 체크박스/칩에서 직접 선택
    'AI_EXTRACTED',   -- 리뷰 텍스트 NLP 감성분석에 의해 자동 추출
    'ADMIN_VERIFIED'  -- 관리자가 현장 검증 후 확정
);

-- ----------------------------------------------------------------------------
-- 2. 핵심 테이블 정의
-- ----------------------------------------------------------------------------

-- 2.1 사용자 테이블
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    verification_tier user_verification_tier DEFAULT 'NONE' NOT NULL,
    wku_student_id_hash VARCHAR(64) NULL, -- 원광대 학번 단방향 해시 (중복 방지)
    resident_dong VARCHAR(50) NULL,       -- 거주 행정동 (예: 신동, 영등동, 모현동)
    karma_score INT DEFAULT 0 NOT NULL,   -- 신뢰도 점수 (도움됨 투표 기반 누적)
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2.2 원광대 캠퍼스 주요 거점 테이블 (도보 거리 산출용)
CREATE TABLE campus_reference_nodes (
    id SERIAL PRIMARY KEY,
    node_name VARCHAR(100) NOT NULL,     -- 예: 원광대 북문, 대학로 로데오거리, 원광대 정문, 원광대병원
    node_type VARCHAR(50) NOT NULL,      -- GATE, DORMITORY, HOSPITAL, LIBRARY
    geom GEOGRAPHY(POINT, 4326) NOT NULL,-- WGS84 좌표
    description TEXT NULL
);

-- 2.3 장소 카테고리 테이블
CREATE TABLE place_categories (
    id SERIAL PRIMARY KEY,
    parent_id INT REFERENCES place_categories(id) ON DELETE SET NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,    -- 예: food_korean, cafe_study, coin_laundry
    name VARCHAR(100) NOT NULL,          -- 예: 한식/백반, 스터디카페, 코인빨래방
    icon_name VARCHAR(50) NULL,
    display_order INT DEFAULT 0 NOT NULL
);

-- 2.4 장소(업소/편의시설) 마스터 테이블
CREATE TABLE places (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id INT NOT NULL REFERENCES place_categories(id),
    name VARCHAR(150) NOT NULL,
    branch_name VARCHAR(100) NULL,
    road_address VARCHAR(255) NOT NULL,
    detail_address VARCHAR(255) NULL,
    dong VARCHAR(50) NOT NULL,           -- 신동, 영등동, 남중동 등
    geom GEOGRAPHY(POINT, 4326) NOT NULL,-- PostGIS 위치 정보
    phone VARCHAR(30) NULL,
    
    -- 익산 및 1인 가구 특화 핵심 메타데이터
    is_daroum_accepted BOOLEAN DEFAULT FALSE NOT NULL, -- 익산다로움 결제 가능 여부
    daroum_cashback_rate NUMERIC(4,2) DEFAULT 0.10,   -- 다로움 캐시백/할인율 (기본 10%)
    has_solo_seats BOOLEAN DEFAULT FALSE NOT NULL,     -- 바 테이블/1인석 구비 여부
    is_single_order_allowed BOOLEAN DEFAULT TRUE NOT NULL, -- 1인분 주문 허용 여부
    
    -- 운영 시간 JSONB (예: {"mon": {"open": "10:00", "close": "02:00", "break": "15:00-17:00"}, "exam_extended": true})
    business_hours_json JSONB NULL,
    
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2.5 장소 평가 요약 테이블 (빠른 조회를 위한 머티리얼라이즈드 캐시 테이블)
CREATE TABLE place_metrics_summary (
    place_id UUID PRIMARY KEY REFERENCES places(id) ON DELETE CASCADE,
    total_reviews INT DEFAULT 0 NOT NULL,
    composite_score NUMERIC(3,2) DEFAULT 0.00 NOT NULL,   -- 종합 만족도 (1.00 ~ 5.00)
    solo_score NUMERIC(3,2) DEFAULT 0.00 NOT NULL,        -- 1인 적합도 지수
    cost_score NUMERIC(3,2) DEFAULT 0.00 NOT NULL,        -- 가성비 지수
    access_score NUMERIC(3,2) DEFAULT 0.00 NOT NULL,      -- 접근성/동선 지수
    convenience_score NUMERIC(3,2) DEFAULT 0.00 NOT NULL, -- 편의성/시설 지수
    positive_review_ratio NUMERIC(5,2) DEFAULT 0.00 NOT NULL, -- 긍정 리뷰 비율 (%)
    active_caution_flags INT DEFAULT 0 NOT NULL,          -- 활성 주의 플래그 수
    last_review_at TIMESTAMPTZ NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2.6 표준 키워드 태그 마스터 테이블
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(60) UNIQUE NOT NULL,      -- 예: solo_dining_friendly, daroum_accepted
    display_name VARCHAR(60) NOT NULL,     -- 예: #혼밥최적, #익산다로움
    dimension evaluation_dimension NOT NULL,
    polarity tag_polarity NOT NULL,
    icon VARCHAR(30) NULL,
    description TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- 2.7 사용자 리뷰 마스터 테이블
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    -- 방문 컨텍스트
    is_solo_visit BOOLEAN DEFAULT TRUE NOT NULL,          -- 1인 방문 여부
    approx_cost_per_person INT NULL,                       -- 1인당 지출 금액 (원)
    visited_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- 평가 점수
    overall_rating NUMERIC(2,1) CHECK (overall_rating >= 1.0 AND overall_rating <= 5.0) NOT NULL,
    content TEXT NOT NULL,                                 -- 자유 텍스트 리뷰
    photo_urls TEXT[] NULL,                                -- 업로드 사진 URL 배열
    
    -- 리뷰 작성 시점 리뷰어 자격 (불변 가중치 보존용)
    reviewer_tier_snapshot user_verification_tier NOT NULL,
    weight_multiplier NUMERIC(3,2) DEFAULT 1.00 NOT NULL,
    
    -- AI 감성 분석 결과
    sentiment_score NUMERIC(3,2) NULL,                     -- -1.00(극부정) ~ +1.00(극긍정)
    
    helpful_count INT DEFAULT 0 NOT NULL,
    is_reported BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2.8 4대 세부 평점 테이블 (리뷰당 4축 점수)
CREATE TABLE review_dimension_ratings (
    id BIGSERIAL PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    dimension evaluation_dimension NOT NULL,
    score NUMERIC(2,1) CHECK (score >= 1.0 AND score <= 5.0) NOT NULL,
    CONSTRAINT uq_review_dimension UNIQUE (review_id, dimension)
);

-- 2.9 리뷰-태그 매핑 테이블
CREATE TABLE review_tags (
    id BIGSERIAL PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    tag_id INT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    source_type tag_source_type NOT NULL,
    confidence_score NUMERIC(3,2) DEFAULT 1.00 NOT NULL, -- AI 추출 시 신뢰도 (0.00 ~ 1.00)
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_review_tag UNIQUE (review_id, tag_id)
);

-- 2.10 장소별 집계 태그 (공식 배지 승격 관리 테이블)
CREATE TABLE place_tag_aggregates (
    place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    tag_id INT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    positive_mention_count INT DEFAULT 0 NOT NULL,
    negative_mention_count INT DEFAULT 0 NOT NULL,
    weighted_confidence NUMERIC(4,2) DEFAULT 0.00 NOT NULL,
    is_official_badge BOOLEAN DEFAULT FALSE NOT NULL, -- 기준 충족 시 카드 뱃지로 자동 노출
    first_detected_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_detected_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (place_id, tag_id)
);

-- 2.11 리뷰 도움됨(추천) 투표 테이블
CREATE TABLE review_votes (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    vote_type VARCHAR(20) DEFAULT 'HELPFUL' NOT NULL, -- HELPFUL, ACCURATE
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (user_id, review_id)
);

-- ----------------------------------------------------------------------------
-- 3. 고성능 인덱스 (Spatial & Search Indexes)
-- ----------------------------------------------------------------------------

-- 공간 인덱스 (PostGIS GIST)
CREATE INDEX idx_places_geom ON places USING GIST (geom);
CREATE INDEX idx_campus_nodes_geom ON campus_reference_nodes USING GIST (geom);

-- 외래키 및 빈번한 조회 조건 인덱스
CREATE INDEX idx_places_dong ON places (dong);
CREATE INDEX idx_places_daroum ON places (is_daroum_accepted);
CREATE INDEX idx_reviews_place_id ON reviews (place_id);
CREATE INDEX idx_reviews_user_id ON reviews (user_id);
CREATE INDEX idx_review_tags_tag_id ON review_tags (tag_id);
CREATE INDEX idx_place_tag_aggregates_badge ON place_tag_aggregates (place_id, is_official_badge);

-- 텍스트 검색 및 JSON 인덱스
CREATE INDEX idx_places_name_trgm ON places USING GIN (name gin_trgm_ops);
CREATE INDEX idx_places_business_hours ON places USING GIN (business_hours_json);

-- ----------------------------------------------------------------------------
-- 4. 핵심 데이터 조작 트리거 (Metric Recalculation Trigger)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_update_place_metrics()
RETURNS TRIGGER AS $$
DECLARE
    target_place_id UUID := NEW.place_id;
    v_total_reviews INT;
    v_composite NUMERIC(3,2);
    v_solo NUMERIC(3,2);
    v_cost NUMERIC(3,2);
    v_access NUMERIC(3,2);
    v_convenience NUMERIC(3,2);
BEGIN
    -- 리뷰 수 및 종합 평점 가중 평균 계산
    SELECT 
        COUNT(*),
        COALESCE(ROUND(SUM(r.overall_rating * r.weight_multiplier) / NULLIF(SUM(r.weight_multiplier), 0), 2), 0.00)
    INTO v_total_reviews, v_composite
    FROM reviews r
    WHERE r.place_id = target_place_id;

    -- 4축 세부 평가 지표 가중 평균 산출
    SELECT
        COALESCE(ROUND(SUM(CASE WHEN rdr.dimension = 'SOLO_SUITABILITY' THEN rdr.score * r.weight_multiplier END) / 
                       NULLIF(SUM(CASE WHEN rdr.dimension = 'SOLO_SUITABILITY' THEN r.weight_multiplier END), 0), 2), 0.00),
        COALESCE(ROUND(SUM(CASE WHEN rdr.dimension = 'COST_BURDEN' THEN rdr.score * r.weight_multiplier END) / 
                       NULLIF(SUM(CASE WHEN rdr.dimension = 'COST_BURDEN' THEN r.weight_multiplier END), 0), 2), 0.00),
        COALESCE(ROUND(SUM(CASE WHEN rdr.dimension = 'ACCESSIBILITY' THEN rdr.score * r.weight_multiplier END) / 
                       NULLIF(SUM(CASE WHEN rdr.dimension = 'ACCESSIBILITY' THEN r.weight_multiplier END), 0), 2), 0.00),
        COALESCE(ROUND(SUM(CASE WHEN rdr.dimension = 'CONVENIENCE' THEN rdr.score * r.weight_multiplier END) / 
                       NULLIF(SUM(CASE WHEN rdr.dimension = 'CONVENIENCE' THEN r.weight_multiplier END), 0), 2), 0.00)
    INTO v_solo, v_cost, v_access, v_convenience
    FROM reviews r
    JOIN review_dimension_ratings rdr ON r.id = rdr.review_id
    WHERE r.place_id = target_place_id;

    -- place_metrics_summary 테이블 갱신 (UPSERT)
    INSERT INTO place_metrics_summary (
        place_id, total_reviews, composite_score, solo_score, cost_score, access_score, convenience_score, last_review_at, updated_at
    ) VALUES (
        target_place_id, v_total_reviews, v_composite, v_solo, v_cost, v_access, v_convenience, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
    ON CONFLICT (place_id) DO UPDATE SET
        total_reviews = EXCLUDED.total_reviews,
        composite_score = EXCLUDED.composite_score,
        solo_score = EXCLUDED.solo_score,
        cost_score = EXCLUDED.cost_score,
        access_score = EXCLUDED.access_score,
        convenience_score = EXCLUDED.convenience_score,
        last_review_at = EXCLUDED.last_review_at,
        updated_at = EXCLUDED.updated_at;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_after_review_insert
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION fn_update_place_metrics();

-- ----------------------------------------------------------------------------
-- 5. 실무 실시간 쿼리 예시 (Sample Production Queries)
-- ----------------------------------------------------------------------------

-- [시나리오 1] 원광대 북문 반경 500m 이내 '익산다로움' 결제 가능하며 '혼밥 지수 4.5 이상'인 음식점 목록 조회
/*
WITH target_gate AS (
    SELECT geom FROM campus_reference_nodes WHERE node_name = '원광대 북문' LIMIT 1
)
SELECT 
    p.id,
    p.name,
    c.name AS category_name,
    p.road_address,
    ROUND(ST_Distance(p.geom, tg.geom)::numeric, 0) AS distance_meters,
    pms.composite_score,
    pms.solo_score,
    pms.cost_score,
    p.is_daroum_accepted,
    ARRAY_AGG(t.display_name) FILTER (WHERE pta.is_official_badge = TRUE) AS active_badges
FROM places p
CROSS JOIN target_gate tg
JOIN place_categories c ON p.category_id = c.id
JOIN place_metrics_summary pms ON p.id = pms.place_id
LEFT JOIN place_tag_aggregates pta ON p.id = pta.place_id
LEFT JOIN tags t ON pta.tag_id = t.id
WHERE ST_DWithin(p.geom, tg.geom, 500) -- 북문 기준 500미터 이내
  AND p.is_daroum_accepted = TRUE     -- 익산다로움 가맹점
  AND pms.solo_score >= 4.5           -- 혼밥 지수 4.5 이상
GROUP BY p.id, c.name, tg.geom, pms.composite_score, pms.solo_score, pms.cost_score
ORDER BY distance_meters ASC, pms.solo_score DESC;
*/
