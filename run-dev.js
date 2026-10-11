/**
 * 개발 서버 동시 실행 스크립트 (Backend + Frontend)
 * Windows 및 크로스 플랫폼 호환 러너
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('================================================================');
console.log('🚀 [익산 로컬 라이프 & 편의 지도] 개발 서버를 시작합니다...');
console.log('================================================================\n');

// 1. Backend 시작 (포트 5000)
console.log('[Runner] Express API 서버 구동 중... (http://localhost:5000)');
const backendProcess = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

// 2. Frontend 시작 (포트 5173)
console.log('[Runner] React Vite 개발 서버 구동 중... (http://localhost:5173)');
const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

const frontendProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: true
});

// 프로세스 종료 처리
function cleanup() {
  console.log('\n[Runner] 서버를 종료합니다...');
  backendProcess.kill();
  frontendProcess.kill();
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
