import React, { useState } from 'react';
import { X, Key, ExternalLink, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

export default function ApiKeyModal({
  isOpen,
  onClose,
  currentKey,
  onSaveKey
}) {
  if (!isOpen) return null;

  const [inputKey, setInputKey] = useState(currentKey || '');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    const trimmed = inputKey.trim();
    if (!trimmed) {
      setErrorMsg('API 키를 입력해주세요.');
      return;
    }
    setErrorMsg('');
    onSaveKey(trimmed);
    onClose();
  };

  const handleClear = () => {
    onSaveKey('');
    setInputKey('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={20} color="#ea580c" />
            <h2 style={{ fontSize: '1.15rem' }}>카카오 지도 (Kakao Maps) API 키 설정</h2>
          </div>
          <button onClick={onClose} style={{ color: '#64748b', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body" style={{ gap: '1rem' }}>
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '0.85rem', fontSize: '0.85rem', color: '#9a3412', lineHeight: 1.5 }}>
              <p style={{ fontWeight: 700, marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={16} color="#ea580c" />
                익산 지역의 모든 실제 상권을 실시간으로 검색하고 연동할 수 있습니다!
              </p>
              카카오 개발자 센터에서 무료로 발급받은 <strong>JavaScript 키</strong>를 입력하시면, 카카오 정밀 지도와 키워드 장소 검색 기능이 즉시 활성화됩니다.
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>카카오 JavaScript 앱 키</span>
                <a
                  href="https://developers.kakao.com/console/app"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#0d9488', fontSize: '0.78rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '2px' }}
                >
                  카카오 개발자 콘솔 바로가기 <ExternalLink size={12} />
                </a>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="예: 3a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                autoFocus
              />
              {errorMsg && <p style={{ color: '#dc2626', fontSize: '0.78rem' }}>{errorMsg}</p>}
            </div>

            {/* 단계별 가이드 박스 */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem', fontSize: '0.8rem', color: '#475569' }}>
              <strong style={{ color: '#1e293b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.4rem' }}>
                <HelpCircle size={14} color="#0d9488" />
                1분 만에 무료 발급받는 방법:
              </strong>
              <ol style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', lineHeight: 1.4 }}>
                <li><a href="https://developers.kakao.com" target="_blank" rel="noreferrer" style={{ color: '#0284c7' }}>developers.kakao.com</a> 로그인 후 <strong>[내 애플리케이션 추가]</strong></li>
                <li><strong>[앱 설정] &gt; [플랫폼] &gt; [Web 플랫폼 등록]</strong>에서 사이트 도메인에 <code>http://localhost:5173</code> 등록</li>
                <li><strong>[앱 설정] &gt; [앱 키]</strong>에서 <strong>JavaScript 키</strong> 복사하여 위 칸에 붙여넣기</li>
              </ol>
            </div>
          </div>

          <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
            {currentKey ? (
              <button
                type="button"
                className="btn-small"
                style={{ color: '#dc2626', border: '1px solid #fecaca', background: '#fef2f2' }}
                onClick={handleClear}
              >
                키 초기화 (기본지도로 복귀)
              </button>
            ) : <div />}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn-small btn-outline" onClick={onClose}>
                취소
              </button>
              <button type="submit" className="btn-small btn-primary">
                저장 및 카카오 지도 연동
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
