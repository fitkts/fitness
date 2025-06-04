# 🏗️ 피트니스 회원 관리 시스템 아키텍처

## 📌 개요

이 문서는 Electron 기반 피트니스 회원 관리 시스템의 전체 아키텍처를 설명합니다.

**기술 스택:**
- **Frontend**: React 18.2.0 + TypeScript + Tailwind CSS
- **Backend**: Electron Main Process + Node.js
- **데이터베이스**: SQLite (better-sqlite3)
- **상태 관리**: Zustand 4.4.7
- **빌드 도구**: Webpack 5 + TypeScript
- **UI 라이브러리**: Lucide React, Recharts, Chart.js

---

## 🏛️ 전체 시스템 구조

```
┌─────────────────────────────────────────────────────────────────┐
│                     Electron Application                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐              ┌─────────────────┐           │
│  │ Renderer Process │   ←─IPC─→   │  Main Process   │           │
│  │                 │              │                 │           │
│  │ • React App     │              │ • Database      │           │
│  │ • UI Components │              │ • File System  │           │
│  │ • State Mgmt    │              │ • Background    │           │
│  │ • Business Logic│              │   Services      │           │
│  └─────────────────┘              └─────────────────┘           │
│           │                                │                    │
│           └────────────┬───────────────────┘                    │
│                        │                                        │
│                ┌───────▼────────┐                              │
│                │ SQLite Database │                              │
│                │ (fitness.db)    │                              │
│                └─────────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Electron 프로세스 아키텍처

### 1. **Main Process** (`src/main/main.ts`)

**역할:**
- Electron 애플리케이션의 진입점
- 브라우저 창 생성 및 관리
- 데이터베이스 연결 및 관리
- IPC 통신 핸들러 등록
- 파일 시스템 접근
- 백그라운드 작업 (자동 백업, 크론 작업)

**주요 기능:**
```typescript
// 창 생성 및 설정
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,        // 보안을 위해 비활성화
      contextIsolation: true,        // 컨텍스트 격리 활성화
      webSecurity: false,           // 개발 환경을 위해 비활성화
      preload: path.join(__dirname, 'preload.js')
    }
  });
}
```

**라이프사이클:**
1. 앱 초기화 (`app.whenReady()`)
2. 데이터베이스 설정 (`setupDatabase()`)
3. 브라우저 창 생성
4. IPC 핸들러 등록
5. 자동 백업 스케줄링

### 2. **Renderer Process** (`src/renderer/`)

**역할:**
- React 애플리케이션 실행
- 사용자 인터페이스 렌더링
- 사용자 상호작용 처리
- Main Process와 IPC 통신

**주요 구조:**
```
src/renderer/
├── App.tsx           # 메인 앱 컴포넌트
├── index.tsx         # React 앱 진입점
├── index.html        # HTML 템플릿
└── index.css         # 기본 스타일
```

### 3. **Preload Script** (`src/main/preload.ts`)

**역할:**
- Renderer와 Main Process 간의 안전한 통신 브릿지
- Context Bridge를 통한 API 노출
- 보안 격리 유지

**구조:**
```typescript
contextBridge.exposeInMainWorld('api', {
  // 회원 관리
  getAllMembers: () => ipcRenderer.invoke('get-all-members'),
  addMember: (member: any) => ipcRenderer.invoke('add-member', member),
  updateMember: (member: any) => ipcRenderer.invoke('update-member', member),
  deleteMember: (id: number) => ipcRenderer.invoke('delete-member', id),
  
  // 결제 관리
  getAllPayments: () => ipcRenderer.invoke('get-all-payments'),
  addPayment: (data: any) => ipcRenderer.invoke('add-payment', data),
  
  // 기타 기능들...
});
```

---

## 🔌 IPC 통신 아키텍처

### **통신 플로우**

```
┌─────────────────┐     invoke/handle     ┌─────────────────┐
│ Renderer Process│ ───────────────────► │  Main Process   │
│                 │                      │                 │
│ • UI Components │                      │ • IPC Handlers  │
│ • Event Handlers│                      │ • Database Ops  │
│                 │ ◄─────────────────── │ • File System   │
└─────────────────┘      response        └─────────────────┘
```

### **IPC 서비스 계층** (`src/database/ipcService.ts`)

**설계 패턴:**
- **서비스 클래스 패턴**: 도메인별로 서비스 클래스 분리
- **통일된 응답 형식**: `{ success: boolean, data?: T, error?: string }`
- **타입 안전성**: TypeScript 인터페이스로 데이터 타입 보장

**예시:**
```typescript
// Renderer에서 호출
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
```

---

## 🗄️ 데이터베이스 아키텍처

### **계층 구조**

```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                    │
├─────────────────────────────────────────────────────────┤
│ React Components → IPC Service → Repository → Database │
└─────────────────────────────────────────────────────────┘
```

### **Repository 패턴**

각 도메인별로 Repository 클래스 분리:
- `memberRepository.ts` - 회원 데이터 관리
- `paymentRepository.ts` - 결제 데이터 관리
- `attendanceRepository.ts` - 출석 데이터 관리
- `staffRepository.ts` - 직원 데이터 관리
- `lockerRepository.ts` - 락커 데이터 관리
- `membershipTypeRepository.ts` - 회원권 타입 관리

**기본 구조:**
```typescript
export class MemberRepository {
  private db: Database;
  
  async getAll(): Promise<Member[]> { /* ... */ }
  async getById(id: number): Promise<Member | null> { /* ... */ }
  async create(member: Member): Promise<number> { /* ... */ }
  async update(member: Member): Promise<boolean> { /* ... */ }
  async delete(id: number): Promise<boolean> { /* ... */ }
}
```

### **데이터베이스 스키마**
- 6개 주요 테이블: `members`, `payments`, `attendance`, `staff`, `lockers`, `membership_types`
- Unix Timestamp 기반 날짜 관리
- JSON 컬럼 활용 (권한, 설정 데이터)
- 외래 키 관계 설정

---

## 🎯 상태 관리 아키텍처 (Zustand)

### **스토어 구조**

```typescript
interface MemberState {
  // 데이터
  members: Member[];
  isLoading: boolean;
  error: string | null;
  
  // 액션
  fetchMembers: () => Promise<void>;
  addMember: (data: Omit<Member, 'id'>) => Promise<Member>;
  updateMember: (member: Member) => Promise<void>;
  deleteMember: (id: number) => Promise<void>;
}
```

### **스토어 사용 패턴**

```typescript
// 컴포넌트에서 사용
const { members, isLoading, fetchMembers } = useMemberStore();

useEffect(() => {
  fetchMembers();
}, [fetchMembers]);
```

**장점:**
- 🔄 **자동 리렌더링**: 상태 변경 시 구독 컴포넌트 자동 업데이트
- 📦 **경량**: Redux 대비 간단한 구조
- 🔒 **타입 안전**: TypeScript 완전 지원

---

## 🎨 컴포넌트 아키텍처

### **폴더 구조**

```
src/components/
├── common/                    # 공통 컴포넌트
│   ├── AppLayout.tsx         # 전체 레이아웃
│   ├── Modal.tsx             # 기본 모달
│   ├── Toast.tsx             # 알림 컴포넌트
│   ├── LoadingSpinner.tsx    # 로딩 스피너
│   └── PageTransition.tsx    # 페이지 전환 효과
├── forms/                    # 폼 관련 컴포넌트
├── member/                   # 회원 관련 컴포넌트
├── payment/                  # 결제 관련 컴포넌트
├── staff/                    # 직원 관련 컴포넌트
└── locker/                   # 락커 관련 컴포넌트
```

### **컴포넌트 계층**

```
App.tsx
├── AppLayout.tsx
│   ├── Sidebar.tsx           # 사이드바 네비게이션
│   └── PageTransition.tsx    # 페이지 전환 래퍼
│       └── [Page Components] # 각 페이지 컴포넌트
│           ├── Dashboard.tsx
│           ├── Members.tsx
│           ├── Payments.tsx
│           └── ...
```

### **페이지 라우팅**

```typescript
enum Page {
  Dashboard = '대시보드',
  Members = '회원 관리',
  Attendance = '출석 관리',
  Payment = '결제 관리',
  Lockers = '락카 관리',
  Staff = '직원 관리',
  Statistics = '통계 관리',
  Settings = '설정'
}
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

### **개발 환경**
- **Hot Reload**: webpack-dev-server + electron-reload
- **개발 도구**: Electron DevTools 자동 오픈
- **포트**: 3000 (Development Server)

### **프로덕션 빌드**
- **코드 압축**: TerserPlugin으로 최적화
- **번들 분리**: Main/Renderer/Preload 각각 빌드
- **Electron Builder**: 플랫폼별 설치 파일 생성

---

## 🛡️ 보안 아키텍처

### **Electron 보안 설정**

```typescript
webPreferences: {
  nodeIntegration: false,      // Node.js API 직접 접근 차단
  contextIsolation: true,      // 렌더러 컨텍스트 격리
  webSecurity: false,         // 개발 환경에서만 비활성화
  preload: path.join(__dirname, 'preload.js')
}
```

### **데이터 보안**
- 🔒 **SQL 인젝션 방지**: Prepared Statements 사용
- 📁 **파일 접근 제한**: 사용자 데이터 폴더로 제한
- 🔐 **IPC 통신 보안**: Context Bridge를 통한 안전한 API 노출

---

## 📊 모니터링 및 로깅

### **로깅 시스템** (electron-log)

```typescript
import * as electronLog from 'electron-log';

// 로그 레벨 설정
electronLog.transports.file.level = 'info';

// 주요 이벤트 로깅
electronLog.info('애플리케이션 시작');
electronLog.error('데이터베이스 연결 실패:', error);
```

### **에러 핸들링**
- **IPC 통신**: 표준화된 에러 응답 형식
- **데이터베이스**: Transaction 롤백 및 에러 로깅
- **UI**: Toast 알림으로 사용자에게 피드백

---

## 🔄 백업 및 데이터 관리

### **자동 백업 시스템**

```typescript
// 매일 자동 백업 (cron)
cron.schedule('0 0 * * *', () => {
  createBackup(backupDir)
    .then(() => electronLog.info('자동 백업 완료'))
    .catch(err => electronLog.error('백업 실패:', err));
});
```

### **데이터 마이그레이션**
- **스키마 변경**: ALTER TABLE 문을 통한 점진적 업데이트
- **호환성**: 기존 데이터 유지하면서 새 컬럼 추가
- **버전 관리**: 데이터베이스 버전 추적

---

## 🚀 성능 최적화

### **렌더링 최적화**
- **React.memo**: 불필요한 리렌더링 방지
- **useCallback/useMemo**: 함수와 값 메모이제이션
- **가상화**: 대용량 리스트 렌더링 최적화

### **데이터베이스 최적화**
- **인덱싱**: 자주 검색되는 컬럼에 인덱스 적용
- **페이지네이션**: 대용량 데이터 분할 로딩
- **트랜잭션**: 배치 작업의 성능 향상

### **메모리 관리**
- **리소스 정리**: 컴포넌트 언마운트 시 리스너 제거
- **이미지 최적화**: 적절한 크기의 이미지 사용
- **가비지 컬렉션**: 메모리 누수 방지

---

## 📋 개발 가이드라인

### **코드 구조 원칙**
1. **단일 책임 원칙**: 각 파일/함수는 하나의 역할만
2. **모듈화**: 기능별로 명확히 분리
3. **타입 안전성**: TypeScript 적극 활용
4. **일관성**: 네이밍 컨벤션과 코드 스타일 통일

### **아키텍처 규칙**
- **의존성 방향**: 상위 계층이 하위 계층을 의존
- **순환 의존성 방지**: 명확한 계층 구조 유지
- **인터페이스 우선**: 구현보다 인터페이스에 의존

### **확장 가능성**
- **플러그인 구조**: 새로운 기능 모듈 추가 용이
- **설정 분리**: 하드코딩 대신 설정 파일 활용
- **API 표준화**: 일관된 IPC 통신 패턴

---

## 🔮 향후 계획

### **단기 목표**
- [ ] 실시간 동기화 구현
- [ ] 오프라인 모드 지원
- [ ] 자동 업데이트 시스템

### **중기 목표**
- [ ] 클라우드 백업 연동
- [ ] 모바일 앱 연동
- [ ] 다중 지점 관리

### **장기 목표**
- [ ] AI 기반 분석 기능
- [ ] 웹 버전 개발
- [ ] 마이크로서비스 아키텍처 전환

---

**작성일**: 2025년 05월
**작성자**: 시스템 아키텍트  
**버전**: 1.0.0

> 📝 **참고**: 이 문서는 시스템의 발전과 함께 지속적으로 업데이트됩니다. 