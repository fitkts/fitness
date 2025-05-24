# 피트니스 회원 관리 프로그램 기술 스택

## 핵심 프레임워크

- **Node.js** - 백엔드 런타임 환경
- **Electron** - 크로스 플랫폼 데스크톱 애플리케이션 개발 프레임워크
- **React** - UI 컴포넌트 기반 라이브러리

## 개발 도구

- **TypeScript** - 정적 타입 지원으로 개발 안정성 향상
- **Webpack/Vite** - 모듈 번들러, 개발 서버
- **ESLint/Prettier** - 코드 품질 및 포맷팅

## UI/UX

- **Tailwind CSS** - 유틸리티 기반 CSS 프레임워크
- **Framer Motion** - 고급 애니메이션 라이브러리
- **Lucide Icons** - 모던한 아이콘 세트
- **React Hook Form** - 폼 관리 및 검증

## 상태 관리

- **Zustand** - 간결하고 효율적인 상태 관리 라이브러리

## 데이터 처리/저장

- **better-sqlite3** - 고성능 SQLite 인터페이스
- **xlsx.js** - 엑셀 파일 읽기/쓰기 처리
- **fs-extra** - 향상된 파일 시스템 작업
- **Zod** - 데이터 검증 및 타입 스키마

## 시각화/대시보드

- **Chart.js** - 반응형 차트 라이브러리
- **react-chartjs-2** - React 용 Chart.js 래퍼

## 백업/자동화

- **node-cron** - 작업 스케줄링 및 자동 백업
- **archiver** - 백업 압축 기능

## 에러 처리/로깅

- **winston** - 로깅 라이브러리
- **electron-log** - Electron 전용 로깅

## 빌드/배포

- **electron-builder** - 설치 프로그램 생성
- **concurrently** - 동시 작업 실행 도구
- **cross-env** - 크로스 플랫폼 환경 변수 설정

## 폴더 구조

```
/src
  /main         - Electron 메인 프로세스
  /renderer     - React UI 코드
  /models       - 데이터 모델 및 타입
  /database     - SQLite 연결 및 쿼리
  /services     - 비즈니스 로직
  /utils        - 유틸리티 함수
  /components   - 재사용 가능 UI 컴포넌트
  /pages        - 주요 화면
  /assets       - 이미지, 아이콘 등 정적 자원
  /backup       - 백업 관련 코드
```
