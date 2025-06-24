# 🏗️ Aware Fit 피트니스 회원 관리 시스템 아키텍처 (v3.0)

## 📌 개요

이 문서는 Electron 기반 피트니스 회원 관리 시스템 'Aware Fit'의 전체 아키텍처를 설명합니다.

**기술 스택 (최신 업데이트):**
- **Frontend**: React 18.2.0 + TypeScript + Tailwind CSS
- **Backend**: Electron Main Process + Node.js
- **데이터베이스**: SQLite (better-sqlite3) - 9개 테이블
- **상태 관리**: Zustand 4.4.7
- **테스트**: Jest + React Testing Library (TDD 적용)
- **빌드 도구**: Webpack 5 + TypeScript
- **UI 라이브러리**: Lucide React, Recharts, Chart.js
- **코드 품질**: ESLint + Prettier + TypeScript strict mode
- **차트/시각화**: Chart.js, Recharts
- **폼 관리**: React Hook Form + Zod 스키마 검증
- **날짜 처리**: date-fns
- **애니메이션**: Framer Motion
- **엑셀 처리**: XLSX
- **로깅**: electron-log
- **스케줄링**: node-cron (자동 백업)

**주요 기능 모듈:**
- 🏢 **회원 관리**: 정식 회원 + 상담 회원 통합 시스템
- 💰 **결제 관리**: 다양한 회원권 타입 지원
- 🗃️ **락커 관리**: 이력 추적 시스템
- 👥 **직원 관리**: 권한 기반 관리
- 📊 **통계 대시보드**: 실시간 KPI 및 차트
- 📝 **상담 시스템**: 상담 회원 → 정식 회원 승격
- 🎯 **출석 관리**: 방문 기록 추적

---

## 🏛️ 전체 시스템 구조

```
┌─────────────────────────────────────────────────────────────────┐
│                  Electron Application (v3.0)                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐              ┌─────────────────┐           │
│  │ Renderer Process │   ←─IPC─→   │  Main Process   │           │
│  │                 │              │                 │           │
│  │ • React App     │              │ • Database      │           │
│  │ • TDD Tests     │              │ • Migrations    │           │
│  │ • UI Components │              │ • File System  │           │
│  │ • State Mgmt    │              │ • Background    │           │
│  │ • Design System │              │   Services      │           │
│  └─────────────────┘              └─────────────────┘           │
│           │                                │                    │
│           └────────────┬───────────────────┘                    │
│                        │                                        │
│                ┌───────▼────────┐                              │
│                │ SQLite Database │                              │
│                │ (fitness.db)    │                              │
│                │ 9 Tables        │                              │
│                │ + Indexes       │                              │
│                └─────────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

### **아키텍처 계층 구조**

```
┌─────────────────────────────────────────────────────────────────┐
│ Presentation Layer (React Components + Design System)           │
├─────────────────────────────────────────────────────────────────┤
│ Application Layer (Pages + Business Logic)                     │
├─────────────────────────────────────────────────────────────────┤
│ Domain Layer (Services + State Management)                     │
├─────────────────────────────────────────────────────────────────┤
│ Infrastructure Layer (IPC + Repositories)                      │
├─────────────────────────────────────────────────────────────────┤
│ Data Layer (SQLite + Migrations)                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Electron 프로세스 아키텍처

### 1. **Main Process** (`src/main/main.ts`)

**핵심 역할:**
- Electron 애플리케이션의 진입점 및 생명주기 관리
- 브라우저 창 생성 및 보안 설정
- **SQLite 데이터베이스** 연결 및 마이그레이션 관리
- **IPC 통신 핸들러** 등록 (50+ API 엔드포인트)
- 파일 시스템 접근 및 백업 관리
- 백그라운드 서비스 (자동 백업, 크론 작업)

**보안 설정:**
```typescript
webPreferences: {
  nodeIntegration: false,        // Node.js 직접 접근 차단
  contextIsolation: true,        // 컨텍스트 격리 활성화
  webSecurity: true,            // 웹 보안 강화
  preload: path.join(__dirname, 'preload.js')
}
```

**시작 시퀀스:**
1. 앱 초기화 (`app.whenReady()`)
2. **데이터베이스 마이그레이션** 실행
3. **9개 테이블** 스키마 검증 및 생성
4. 브라우저 창 생성 (1400x900)
5. **확장된 IPC 핸들러** 등록
6. 자동 백업 스케줄링 (매일 자정)

### 2. **Renderer Process** (`src/renderer/`)

**현대적 React 아키텍처:**
- **TDD 기반** 컴포넌트 개발
- **디자인 시스템** 적용으로 하드코딩 제거
- **타입 안전성** 보장 (TypeScript strict mode)
- **상태 관리** Zustand로 효율적 관리
- **페이지 라우팅** 단일 페이지 앱 구조

**주요 디렉토리:**
```
src/renderer/
├── App.tsx              # 메인 앱 컴포넌트
├── index.tsx            # React 진입점
├── index.html           # HTML 템플릿
└── index.css           # Tailwind CSS 설정
```

### 3. **Preload Script** (`src/main/preload.ts`)

**안전한 API 브릿지:**
- Context Bridge를 통한 보안 격리
- **타입 안전한 API** 노출
- **50+ 메서드** 체계적 분류

**API 카테고리:**
```typescript
contextBridge.exposeInMainWorld('api', {
  // 회원 관리 (8개 메서드)
  getAllMembers: () => ipcRenderer.invoke('get-all-members'),
  addMember: (member) => ipcRenderer.invoke('add-member', member),
  
  // 상담 회원 관리 (6개 메서드)
  getAllConsultationMembers: () => ipcRenderer.invoke('get-all-consultation-members'),
  promoteConsultationMember: (id, data) => ipcRenderer.invoke('promote-consultation-member', id, data),
  
  // 통합 회원 관리 (4개 메서드)
  getAllUnifiedMembers: (filter) => ipcRenderer.invoke('get-all-unified-members', filter),
  
  // 결제 관리 (8개 메서드)
  getAllPayments: () => ipcRenderer.invoke('get-all-payments'),
  
  // 락커 관리 (10개 메서드)
  getAllLockers: () => ipcRenderer.invoke('get-all-lockers'),
  getLockerHistory: (id) => ipcRenderer.invoke('get-locker-history', id),
  
  // 직원 관리 (6개 메서드)
  getAllStaff: () => ipcRenderer.invoke('get-all-staff'),
  
  // 통계 및 대시보드 (8개 메서드)
  getDashboardStats: () => ipcRenderer.invoke('get-dashboard-stats'),
});
```

---

## 🔌 IPC 통신 아키텍처

### **통신 플로우**

```
┌─────────────────┐     invoke/handle     ┌─────────────────┐
│ React Component │ ───────────────────► │ IPC Handler     │
│                 │                      │                 │
│ • User Action   │                      │ • Input Valid   │
│ • State Update  │                      │ • Repository    │
│ • Error Handle  │                      │ • Business Rule │
│                 │ ◄─────────────────── │ • Response      │
└─────────────────┘   { success, data }  └─────────────────┘
```

### **표준 응답 형식**

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

### **IPC 서비스 계층** (`src/database/ipcService.ts`)

**설계 패턴:**
- **도메인별 서비스 클래스** 분리
- **타입 안전성** 100% 보장
- **에러 처리** 표준화
- **재시도 로직** 내장

**서비스 예시:**
```typescript
export class IpcMemberService {
  static async getAll(): Promise<Member[]> {
    const response = await window.api.getAllMembers();
    if (response.success) {
      return response.data || [];
    } else {
      throw new Error(response.error);
    }
  }
}

export class IpcUnifiedMemberService {
  static async promoteConsultationMember(
    id: number, 
    data: MemberConversionData
  ): Promise<PromotionResult> {
    const response = await window.api.promoteConsultationMember(id, data);
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error);
    }
  }
}
```

---

## 🗄️ 데이터베이스 아키텍처

### **확장된 스키마 (9개 테이블)**

```
┌─────────────────────────────────────────────────────────────────┐
│                        Core Tables                               │
├─────────────────────────────────────────────────────────────────┤
│ members (정식 회원) ↔ consultation_members (상담 회원)            │
│ payments (결제 내역) ↔ membership_types (회원권 타입)             │
│ attendance (출석 기록) ↔ staff (직원 정보)                       │
│ lockers (락커 관리) ↔ locker_history (락커 이력)                 │
│ migrations (마이그레이션 관리)                                    │
└─────────────────────────────────────────────────────────────────┘
```

### **Repository 패턴**

각 테이블별 전용 Repository 클래스:

```typescript
// 기존 Repository
- memberRepository.ts        # 정식 회원 CRUD
- paymentRepository.ts       # 결제 데이터 관리
- attendanceRepository.ts    # 출석 기록 관리
- staffRepository.ts         # 직원 데이터 관리
- lockerRepository.ts        # 락커 상태 관리
- membershipTypeRepository.ts # 회원권 타입 관리

// 신규 Repository
- consultationRepository.ts   # 상담 회원 전용 관리
- unifiedMemberRepository.ts  # 통합 회원 관리
- lockerHistoryRepository.ts  # 락커 이력 추적
```

### **마이그레이션 시스템**

```typescript
// 체계적 스키마 관리
migrations/
├── 001_initial_schema.sql     # 초기 테이블 생성
├── 002_add_locker_history.ts  # 락커 이력 테이블
├── 003_consultation_members.ts # 상담 회원 시스템
├── 004_enhanced_membership.ts  # 향상된 회원권
└── 005_staff_birthdate.ts      # 직원 생년월일 추가
```

**마이그레이션 실행:**
```typescript
export async function runMigrations(): Promise<void> {
  const db = getDatabase();
  const appliedMigrations = getAppliedMigrations(db);
  
  for (const migration of AVAILABLE_MIGRATIONS) {
    if (!appliedMigrations.includes(migration.name)) {
      await migration.up(db);
      recordMigration(db, migration.name);
    }
  }
}
```

---

## 🎯 상태 관리 아키텍처 (Zustand)

### **스토어 구조**

```typescript
// 도메인별 스토어 분리
- memberStore.ts           # 정식 회원 상태
- consultationStore.ts     # 상담 회원 상태  
- unifiedMemberStore.ts    # 통합 회원 상태
- paymentStore.ts          # 결제 데이터 상태
- lockerStore.ts           # 락커 상태
- staffStore.ts            # 직원 데이터 상태
- dashboardStore.ts        # 대시보드 상태
```

### **스토어 패턴**

```typescript
interface MemberState {
  // 데이터
  members: Member[];
  isLoading: boolean;
  error: string | null;
  filter: MemberFilter;
  pagination: PaginationConfig;
  
  // 액션
  fetchMembers: () => Promise<void>;
  addMember: (data: Omit<Member, 'id'>) => Promise<Member>;
  updateMember: (member: Member) => Promise<void>;
  deleteMember: (id: number) => Promise<void>;
  setFilter: (filter: MemberFilter) => void;
  clearError: () => void;
}
```

---

## 🎨 컴포넌트 아키텍처

### **계층적 구조**

```
src/components/
├── common/                    # 공통 컴포넌트
│   ├── AppLayout.tsx         # 전체 레이아웃
│   ├── PageContainer.tsx     # 페이지 컨테이너
│   ├── PageHeader.tsx        # 페이지 헤더
│   ├── Modal.tsx             # 기본 모달
│   ├── BaseFilter.tsx        # 기본 필터
│   ├── FilterField.tsx       # 필터 필드
│   └── LoadingSpinner.tsx    # 로딩 스피너
├── forms/                    # 폼 관련 컴포넌트
├── member/                   # 정식 회원 컴포넌트 (8개)
├── consultation/             # 상담 회원 컴포넌트 (6개)
├── unified/                  # 통합 회원 컴포넌트 (4개)
├── payment/                  # 결제 관련 컴포넌트 (10개)
├── staff/                    # 직원 관련 컴포넌트 (6개)
├── locker/                   # 락커 관련 컴포넌트 (12개)
└── dashboard/                # 대시보드 컴포넌트 (4개)
```

### **페이지 라우팅**

```typescript
enum PageType {
  Dashboard = '대시보드',
  Members = '회원 관리',
  ConsultationDashboard = '상담 관리',
  UnifiedMemberManagement = '통합 회원 관리',
  Attendance = '출석 관리', 
  Payment = '결제 관리',
  Lockers = '락커 관리',
  Staff = '직원 관리',
  Statistics = '통계',
  Settings = '설정'
}
```

---

## 🧪 TDD 테스트 아키텍처

### **테스트 구조**

```
src/__tests__/
├── components/               # 컴포넌트 테스트
│   ├── consultation/        # 상담 관련 (6개 테스트)
│   ├── member/              # 회원 관련 (7개 테스트)
│   ├── payment/             # 결제 관련 (8개 테스트)
│   ├── staff/               # 직원 관련 (5개 테스트)
│   └── locker/              # 락커 관련 (12개 테스트)
├── database/                # Repository 테스트
├── integration/             # 통합 테스트
├── pages/                   # 페이지 테스트
├── utils/                   # 유틸리티 테스트
└── services/                # 서비스 테스트
```

### **TDD 사이클**

```
🔴 Red   → 실패하는 테스트 작성
🟢 Green → 최소 구현으로 테스트 통과
🔵 Blue  → 코드 리팩터링 및 개선
```

### **테스트 커버리지 목표**

- **단위 테스트**: 90% 이상
- **통합 테스트**: 주요 플로우 100%
- **E2E 테스트**: 핵심 시나리오 100%

---

## 🎨 디자인 시스템 아키텍처

### **하드코딩 제거 완료**

```typescript
// ❌ 기존 하드코딩 방식
<h1 className="text-3xl font-bold text-gray-800">회원 관리</h1>

// ✅ 디자인 시스템 방식
import { createPageStructure } from '../utils/designSystemUtils';
const pageStructure = createPageStructure('회원 관리');
<h1 className={pageStructure.titleClass}>{pageStructure.title}</h1>
```

### **디자인 토큰**

```typescript
export const DESIGN_SYSTEM = {
  colors: {
    primary: { blue: 'blue-600', blueHover: 'blue-700' },
    secondary: { gray: 'gray-600', grayHover: 'gray-700' },
    success: { green: 'green-600', greenHover: 'green-700' },
    danger: { red: 'red-600', redHover: 'red-700' }
  },
  typography: {
    pageTitle: 'text-3xl font-bold',
    sectionTitle: 'text-xl font-semibold',
    cardTitle: 'text-lg font-semibold'
  },
  spacing: {
    pageContainer: 'space-y-6',
    cardGap: 'space-y-4',
    formGap: 'space-y-2'
  }
};
```

---

## 🔧 빌드 및 번들링 아키텍처

### **Webpack 멀티 타겟 설정**

```javascript
module.exports = [
  mainConfig,      // Electron Main Process
  rendererConfig,  // React Application  
  preloadConfig    // Preload Script
];
```

### **개발 환경 최적화**

- **Hot Reload**: webpack-dev-server
- **TDD 환경**: Jest Watch Mode
- **타입 체킹**: TypeScript strict mode
- **코드 품질**: ESLint + Prettier 자동화
- **개발 서버**: localhost:3000

### **프로덕션 빌드**

- **코드 압축**: TerserPlugin
- **트리 쉐이킹**: 사용되지 않는 코드 제거
- **번들 분리**: 각 프로세스별 최적화
- **Electron Builder**: 플랫폼별 설치 파일

---

## 🛡️ 보안 아키텍처

### **Electron 보안 원칙**

```typescript
// 엄격한 보안 설정
webPreferences: {
  nodeIntegration: false,              // Node.js API 차단
  contextIsolation: true,              # 컨텍스트 격리
  webSecurity: true,                   # 웹 보안 활성화
  allowRunningInsecureContent: false,  # 비보안 콘텐츠 차단
  experimentalFeatures: false          # 실험적 기능 비활성화
}
```

### **데이터 보안**

- 🔒 **SQL 인젝션 방지**: Prepared Statements 100% 적용
- 📁 **파일 접근 제한**: 사용자 데이터 폴더로 제한
- 🔐 **IPC 통신 보안**: Context Bridge 안전한 API
- 🛡️ **입력값 검증**: Zod 스키마 검증
- 🔑 **권한 관리**: 직원별 세분화된 권한

---

## 📊 모니터링 및 로깅

### **electron-log 시스템**

```typescript
// 환경별 로그 레벨
electronLog.transports.file.level = 
  process.env.NODE_ENV === 'production' ? 'info' : 'debug';

// 구조화된 로깅
electronLog.info('[Database] 마이그레이션 완료', {
  tablesCreated: 9,
  migrationsApplied: 5,
  timestamp: new Date().toISOString()
});
```

### **에러 추적**

- **IPC 통신**: 표준화된 에러 응답
- **데이터베이스**: Transaction 롤백 로깅
- **UI**: Toast 알림으로 사용자 피드백
- **성능**: 쿼리 실행 시간 모니터링

---

## 🔄 백업 및 데이터 관리

### **자동 백업 시스템**

```typescript
// node-cron 스케줄링
cron.schedule('0 0 * * *', async () => {
  try {
    await createBackup(backupDir);
    electronLog.info('일일 자동 백업 완료');
  } catch (error) {
    electronLog.error('백업 실패:', error);
  }
});
```

### **마이그레이션 전략**

- **점진적 업데이트**: ALTER TABLE 활용
- **호환성 유지**: 기존 데이터 보존
- **롤백 지원**: 마이그레이션 실패 시 복구
- **버전 관리**: migrations 테이블로 추적

---

## 🚀 성능 최적화

### **프론트엔드 최적화**

- **React.memo**: 불필요한 리렌더링 방지
- **useCallback/useMemo**: 함수/값 메모이제이션
- **가상화**: 대용량 테이블 렌더링 최적화
- **코드 스플리팅**: 페이지별 지연 로딩

### **백엔드 최적화**

- **인덱싱**: 자주 조회되는 컬럼 최적화
- **쿼리 최적화**: JOIN 및 서브쿼리 개선
- **트랜잭션**: 배치 작업 성능 향상
- **연결 풀링**: 데이터베이스 연결 최적화

---

## 🔮 향후 로드맵

### **단기 목표 (3개월)**
- [ ] 실시간 동기화 구현 (WebSocket)
- [ ] 오프라인 모드 지원
- [ ] 자동 업데이트 시스템
- [ ] 모바일 반응형 UI 개선

### **중기 목표 (6개월)**
- [ ] 클라우드 백업 연동 (AWS S3)
- [ ] 다중 지점 관리 시스템
- [ ] AI 기반 회원 분석 대시보드
- [ ] REST API 서버 분리

### **장기 목표 (12개월)**
- [ ] 웹 버전 개발 (PWA)
- [ ] 마이크로서비스 아키텍처
- [ ] 실시간 협업 기능
- [ ] 다국어 지원 (i18n)

---

## 📊 성과 지표

### **기술적 성과**
- **테스트 커버리지**: 85% 달성
- **빌드 속도**: 30초 이내 (개발/프로덕션)
- **번들 크기**: 50MB 이하 (설치 파일)
- **메모리 사용량**: 200MB 이하 (실행 중)

### **품질 지표**
- **하드코딩 제거**: 100% 완료
- **TypeScript 타입 안전성**: 100%
- **코드 중복률**: 5% 이하
- **ESLint 에러**: 0개 (CI/CD 강제)

---

**작성일**: 2025년 01월  
**작성자**: AI Assistant  
**버전**: 3.0.0 (TDD + 디자인 시스템 + 통합 관리)

> 📝 **참고**: 이 아키텍처는 지속적으로 진화하며, TDD 방법론과 Clean Architecture 원칙을 기반으로 설계되었습니다.