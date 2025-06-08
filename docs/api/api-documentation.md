# 🔌 피트니스 회원 관리 시스템 API 문서

## 📌 개요

이 문서는 피트니스 회원 관리 시스템의 **IPC 통신 API**와 **Database Service API**의 완전한 명세서입니다.

**📋 포함 내용:**
- IPC API 사양서 (Main ↔ Renderer 통신)
- Database Service API 명세
- 에러 핸들링 가이드라인
- 비동기 처리 패턴
- 실제 사용 예시와 응답 형식

---

## 🏗️ API 아키텍처 개요

### **통신 계층 구조**

```
┌─────────────────────────────────────────────────────────────┐
│                 Renderer Process (React)                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            IPC Service Layer                        │   │
│  │  • IpcMemberService                                 │   │
│  │  • IpcPaymentService                                │   │
│  │  • IpcStaffService                                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │ window.api (Context Bridge)
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                  Main Process (Electron)                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              IPC Handlers                           │   │
│  │  • ipcMain.handle('get-all-members')                │   │
│  │  • ipcMain.handle('add-member')                     │   │
│  │  • Error Handling & Validation                     │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Repository Layer                         │   │
│  │  • memberRepository.ts                              │   │
│  │  • paymentRepository.ts                             │   │
│  │  • Database Transactions                            │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              SQLite Database                        │   │
│  │  • better-sqlite3                                   │   │
│  │  • Transaction Support                              │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📡 IPC API 사양서

### **🔄 표준 응답 형식**

모든 IPC API는 다음과 같은 표준 응답 형식을 사용합니다:

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string; // 선택적 메시지 (중복 처리 등)
}
```

**성공 응답 예시:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "홍길동",
    "email": "hong@example.com"
  }
}
```

**에러 응답 예시:**
```json
{
  "success": false,
  "error": "회원 이름은 필수 입력 항목입니다."
}
```

---

## 👥 회원 관리 API

### **📋 1. 모든 회원 조회**

**IPC 채널:** `get-all-members`

```typescript
// Renderer에서 호출
const response = await window.api.getAllMembers();

// 응답 타입
interface GetAllMembersResponse {
  success: boolean;
  data?: Member[];
  error?: string;
}
```

**Member 타입:**
```typescript
interface Member {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  gender?: '남성' | '여성' | '기타';
  birthDate?: string; // YYYY-MM-DD 형식
  joinDate: string;   // YYYY-MM-DD 형식
  membershipType?: string;
  membershipStart?: string; // YYYY-MM-DD 형식
  membershipEnd?: string;   // YYYY-MM-DD 형식
  lastVisit?: string;       // YYYY-MM-DD 형식
  notes?: string;
  staffId?: number;
  staffName?: string;
  createdAt: string;        // YYYY-MM-DD 형식
  updatedAt: string;        // YYYY-MM-DD 형식
}
```

**사용 예시:**
```typescript
try {
  const response = await window.api.getAllMembers();
  if (response.success) {
    console.log('회원 수:', response.data.length);
    response.data.forEach(member => {
      console.log(`${member.name} (ID: ${member.id})`);
    });
  } else {
    console.error('에러:', response.error);
  }
} catch (error) {
  console.error('통신 실패:', error);
}
```

### **➕ 2. 회원 추가**

**IPC 채널:** `add-member`

```typescript
// 요청 타입
type AddMemberRequest = Omit<Member, 'id' | 'createdAt' | 'updatedAt'>;

// 응답 타입
interface AddMemberResponse {
  success: boolean;
  id?: number;  // 생성된 회원 ID
  error?: string;
}
```

**필수 필드:**
- `name`: 회원 이름 (필수)
- `joinDate`: 가입일 (필수, YYYY-MM-DD 형식)

**사용 예시:**
```typescript
const newMember = {
  name: "김철수",
  phone: "010-1234-5678",
  email: "kim@example.com",
  gender: "남성" as const,
  joinDate: "2024-12-01",
  membershipType: "1개월 이용권"
};

try {
  const response = await window.api.addMember(newMember);
  if (response.success) {
    console.log('새 회원 ID:', response.id);
  } else {
    console.error('회원 추가 실패:', response.error);
  }
} catch (error) {
  console.error('통신 실패:', error);
}
```

### **✏️ 3. 회원 정보 수정**

**IPC 채널:** `update-member`

```typescript
// 요청 타입
interface UpdateMemberRequest extends Partial<Member> {
  id: number; // 필수
}

// 응답 타입
interface UpdateMemberResponse {
  success: boolean;
  updated?: boolean;
  error?: string;
}
```

**사용 예시:**
```typescript
const memberUpdate = {
  id: 1,
  phone: "010-9876-5432",
  membershipEnd: "2025-01-01"
};

const response = await window.api.updateMember(memberUpdate);
if (response.success && response.updated) {
  console.log('회원 정보가 업데이트되었습니다.');
}
```

### **🗑️ 4. 회원 삭제**

**IPC 채널:** `delete-member`

```typescript
// 요청: 회원 ID (number)
// 응답 타입
interface DeleteMemberResponse {
  success: boolean;
  deleted?: boolean;
  error?: string;
}
```

**⚠️ 주의사항:**
- 회원 삭제 시 관련된 **출석 기록**과 **결제 기록**도 함께 삭제됩니다
- 트랜잭션을 사용하여 데이터 무결성을 보장합니다

**사용 예시:**
```typescript
const memberId = 1;
const response = await window.api.deleteMember(memberId);

if (response.success && response.deleted) {
  console.log('회원과 관련 데이터가 모두 삭제되었습니다.');
} else {
  console.error('삭제 실패:', response.error);
}
```

### **🔍 5. 회원 검색**

**IPC 채널:** `search-members`

```typescript
// 요청: 검색어 (string)
// 응답 타입
interface SearchMembersResponse {
  success: boolean;
  data?: Array<{
    id: number;
    name: string;
    phone?: string;
  }>;
  error?: string;
}
```

**사용 예시:**
```typescript
const searchTerm = "김";
const response = await window.api.searchMembers(searchTerm);

if (response.success) {
  response.data.forEach(member => {
    console.log(`${member.name} (${member.phone})`);
  });
}
```

### **📄 6. 페이지네이션 회원 조회**

**IPC 채널:** `get-members-pagination`

```typescript
// 요청 타입
interface GetMembersPaginationRequest {
  page: number;      // 페이지 번호 (1부터 시작)
  pageSize: number;  // 페이지당 항목 수
  options?: {
    search?: string;
    membershipType?: string;
    status?: 'active' | 'expired' | 'all';
  };
}

// 응답 타입
interface GetMembersPaginationResponse {
  success: boolean;
  data?: {
    members: Member[];
    total: number;
  };
  error?: string;
}
```

**사용 예시:**
```typescript
const response = await window.api.getMembersWithPagination(1, 20, {
  search: "김",
  status: "active"
});

if (response.success) {
  console.log(`전체 ${response.data.total}명 중 ${response.data.members.length}명 조회`);
}
```

---

## 💰 결제 관리 API

### **📋 1. 모든 결제 내역 조회**

**IPC 채널:** `get-all-payments`

```typescript
// Payment 타입 (memberName 포함)
interface PaymentWithMemberName extends Payment {
  memberName: string; // 자동으로 추가됨
}

interface GetAllPaymentsResponse {
  success: boolean;
  data?: PaymentWithMemberName[];
  error?: string;
}
```

### **➕ 2. 결제 추가**

**IPC 채널:** `add-payment`

```typescript
interface AddPaymentRequest {
  memberId: number;
  membershipTypeId?: number;
  membershipType?: string;
  paymentDate: string;    // YYYY-MM-DD 형식
  amount: number;
  paymentType: '현금' | '카드' | '계좌이체' | '기타';
  paymentMethod: 'card' | 'cash' | 'transfer';
  status: '완료' | '취소' | '환불';
  staffId?: number;
  receiptNumber?: string;
  notes?: string;
  startDate?: string;     // YYYY-MM-DD 형식
  endDate?: string;       // YYYY-MM-DD 형식
}
```

### **✏️ 3. 결제 정보 수정**

**IPC 채널:** `update-payment`

```typescript
// 첫 번째 매개변수: 결제 ID (number)
// 두 번째 매개변수: 수정할 데이터
const response = await window.api.updatePayment(paymentId, updateData);
```

### **🗑️ 4. 결제 삭제**

**IPC 채널:** `delete-payment`

```typescript
const response = await window.api.deletePayment(paymentId);
```

---

## 👨‍💼 직원 관리 API

### **📋 1. 모든 직원 조회**

**IPC 채널:** `get-all-staff`

```typescript
interface Staff {
  id: number;
  name: string;
  position: string;
  phone?: string;
  email?: string;
  hireDate: string;   // YYYY-MM-DD 형식
  status: string;
  permissions: string; // JSON 문자열
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### **➕ 2. 직원 추가**

**IPC 채널:** `add-staff`

```typescript
type AddStaffRequest = Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>;
```

### **✏️ 3. 직원 정보 수정**

**IPC 채널:** `update-staff`

```typescript
// 첫 번째 매개변수: 직원 ID
// 두 번째 매개변수: 수정할 데이터
const response = await window.api.updateStaff(staffId, updateData);
```

---

## 🏠 락커 관리 API

### **📋 1. 모든 락커 조회**

**IPC 채널:** `get-all-lockers`

### **➕ 2. 락커 추가**

**IPC 채널:** `add-locker`

### **✏️ 3. 락커 정보 수정**

**IPC 채널:** `update-locker`

### **🗑️ 4. 락커 삭제**

**IPC 채널:** `delete-locker`

---

## 📊 출석 관리 API

### **📅 1. 날짜별 출석 조회**

**IPC 채널:** `get-attendance-by-date`

```typescript
// 요청: 날짜 문자열 (YYYY-MM-DD)
const response = await window.api.getAttendanceByDate("2024-12-01");
```

### **➕ 2. 출석 기록 추가**

**IPC 채널:** `add-attendance-record`

```typescript
interface AddAttendanceRequest {
  memberId: number;
  visitDate: string;    // YYYY-MM-DD 형식
  memberName?: string;  // 선택적
}

const response = await window.api.addAttendanceRecord({
  memberId: 1,
  visitDate: "2024-12-01"
});
```

### **🗑️ 3. 출석 기록 삭제**

**IPC 채널:** `delete-attendance-record`

```typescript
const response = await window.api.deleteAttendanceRecord(recordId);
```

---

## 📈 대시보드 통계 API

### **📊 대시보드 통계 조회**

**IPC 채널:** `get-dashboard-stats`

```typescript
interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  attendanceToday: number;
  membershipDistribution: Array<{ type: string; count: number }>;
  monthlyAttendance: Array<{ month: string; count: number }>;
  recentActivities: {
    recentMembers: Array<{ id: number; name: string; joinDate: string }>;
    recentAttendance: Array<{ id: number; name: string; visitDate: string }>;
  };
}

const response = await window.api.getDashboardStats();
```

---

## 🛠️ 유틸리티 API

### **📁 파일 관리**

```typescript
// 엑셀 파일 선택
const filePath = await window.api.selectExcelFile();

// 엑셀 데이터 임포트
const response = await window.api.importMembersFromExcel(excelData);

// 수동 백업 생성
const backupResponse = await window.api.manualBackup();
```

### **⚙️ 설정 관리**

```typescript
// 설정 로드
const settings = await window.api.loadSettings();

// 설정 저장
const response = await window.api.saveSettings(newSettings);

// 앱 재시작
window.api.relaunchApp();
```

---

## 🚫 에러 핸들링 가이드라인

### **1. 표준 에러 분류**

#### **📝 입력 검증 에러**
```typescript
// 필수 필드 누락
{
  "success": false,
  "error": "회원 이름은 필수 입력 항목입니다."
}

// 잘못된 형식
{
  "success": false,
  "error": "올바른 날짜 형식이 아닙니다 (YYYY-MM-DD)."
}
```

#### **🗄️ 데이터베이스 에러**
```typescript
// 데이터 없음
{
  "success": false,
  "error": "삭제할 회원 ID가 필요합니다."
}

// 제약 조건 위반
{
  "success": false,
  "error": "이미 존재하는 회원입니다."
}
```

#### **🔧 시스템 에러**
```typescript
// 데이터베이스 연결 실패
{
  "success": false,
  "error": "데이터베이스가 비활성화되어 있습니다."
}

// 알 수 없는 에러
{
  "success": false,
  "error": "알 수 없는 오류가 발생했습니다."
}
```

### **2. 에러 핸들링 패턴**

#### **🎯 Renderer에서의 에러 처리**

```typescript
// 기본 패턴
try {
  const response = await window.api.someMethod(data);
  
  if (response.success) {
    // 성공 처리
    console.log('성공:', response.data);
    return response.data;
  } else {
    // API 에러 처리
    console.error('API 에러:', response.error);
    throw new Error(response.error);
  }
} catch (error) {
  // 통신 에러 처리
  console.error('통신 실패:', error);
  throw new Error(`요청 처리 중 오류 발생: ${error.message}`);
}
```

#### **🔧 IPC Service Layer 패턴**

```typescript
// IpcMemberService 예시
export class IpcMemberService {
  static async getAll(): Promise<Member[]> {
    try {
      if (!window.api || typeof window.api.getAllMembers !== 'function') {
        throw new Error('API for getAllMembers is not available.');
      }
      
      const response = await window.api.getAllMembers();
      
      if (response.success) {
        return response.data || [];
      } else {
        const errorMessage = response.error || '회원 데이터를 불러오는데 실패했습니다.';
        console.error('회원 데이터 조회 실패:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : '알 수 없는 오류가 발생했습니다.';
      console.error('IPC 통신 오류 (getAllMembers):', errorMessage);
      throw new Error(`회원 목록 조회 중 오류 발생: ${errorMessage}`);
    }
  }
}
```

#### **🗄️ Repository Layer 패턴**

```typescript
// memberRepository 예시
export async function addMember(member: AddMemberRequest): Promise<number> {
  try {
    const db = getDatabase();
    
    // 입력 검증
    if (!member.name) {
      throw new Error('회원 이름은 필수 입력 항목입니다.');
    }
    
    if (!member.joinDate) {
      throw new Error('가입일은 필수 입력 항목입니다.');
    }
    
    // 데이터베이스 작업
    const stmt = db.prepare(`INSERT INTO members (...) VALUES (...)`);
    const result = stmt.run(...);
    
    return result.lastInsertRowid as number;
  } catch (error) {
    electronLog.error('회원 추가 오류:', error);
    
    // 에러 타입별 처리
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new Error('이미 존재하는 회원입니다.');
    }
    
    // 기존 에러 재전파
    throw error;
  }
}
```

### **3. 로깅 가이드라인**

#### **📝 로그 레벨과 사용법**

```typescript
import * as electronLog from 'electron-log';

// 정보 로그 (일반적인 작업)
electronLog.info('회원 추가 요청:', memberData);

// 경고 로그 (예상 가능한 문제)
electronLog.warn('중복 출석 처리:', { memberId, date });

// 에러 로그 (예외 상황)
electronLog.error('데이터베이스 오류:', error);

// 디버그 로그 (개발 중에만)
electronLog.debug('SQL 쿼리 실행:', query);
```

#### **🔍 로그 구조 표준화**

```typescript
// 좋은 로그 예시
electronLog.info('[IPC Handler] add-member request received', {
  memberName: member.name,
  requestId: requestId,
  timestamp: new Date().toISOString()
});

// 에러 로그 상세 정보
electronLog.error('[Repository] Member creation failed', {
  error: error.message,
  stack: error.stack,
  input: memberData,
  timestamp: new Date().toISOString()
});
```

---

## ⚡ 비동기 처리 패턴

### **1. Promise 기반 IPC 통신**

#### **🔄 기본 패턴**

```typescript
// Main Process (IPC Handler)
ipcMain.handle('get-all-members', async () => {
  try {
    const members = await memberRepository.getAllMembers();
    return { success: true, data: members };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '알 수 없는 오류' 
    };
  }
});

// Renderer Process (호출)
const response = await window.api.getAllMembers();
```

#### **🎯 병렬 처리 패턴**

```typescript
// 여러 API 동시 호출
const [membersResponse, paymentsResponse, staffResponse] = await Promise.all([
  window.api.getAllMembers(),
  window.api.getAllPayments(),
  window.api.getAllStaff()
]);

// 대시보드 통계 병렬 수집 (Repository Level)
const [
  totalMembers,
  activeMembers,
  newMembersThisMonth,
  attendanceToday
] = await Promise.all([
  memberRepository.getTotalMemberCount(),
  memberRepository.getActiveMemberCount(todayISO),
  memberRepository.getNewMemberCountSince(firstDayOfMonthISO),
  attendanceRepository.getAttendanceCountByDate(todayISO)
]);
```

### **2. 트랜잭션 처리 패턴**

#### **🔄 Database Transaction**

```typescript
// 회원 삭제 시 관련 데이터 함께 삭제
export async function deleteMember(id: number): Promise<boolean> {
  try {
    const db = getDatabase();
    
    // 트랜잭션 시작
    const deleteTransaction = db.transaction(async () => {
      // 1. 출석 기록 삭제
      await attendanceRepository.deleteAttendanceByMemberId(id);
      
      // 2. 결제 기록 삭제
      await paymentRepository.deletePaymentsByMemberId(id);
      
      // 3. 회원 삭제
      const result = db.prepare('DELETE FROM members WHERE id = ?').run(id);
      
      return result.changes > 0;
    });
    
    return deleteTransaction(); // 트랜잭션 실행
  } catch (error) {
    electronLog.error('회원 삭제 트랜잭션 실패:', error);
    throw error; // 롤백 자동 처리
  }
}
```

### **3. 스트림 처리 패턴**

#### **📊 대용량 데이터 처리**

```typescript
// 엑셀 임포트 시 배치 처리
export async function importMembersFromExcel(data: any[]): Promise<ImportResult> {
  const batchSize = 100; // 배치 크기
  const results = { successCount: 0, failedCount: 0, errors: [] };
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    
    try {
      await processBatch(batch);
      results.successCount += batch.length;
    } catch (error) {
      results.failedCount += batch.length;
      results.errors.push(`배치 ${i}-${i + batchSize} 처리 실패: ${error.message}`);
    }
  }
  
  return results;
}
```

### **4. 상태 관리와 비동기 처리**

#### **🎯 Zustand Store 패턴**

```typescript
// 비동기 액션 처리
export const useMemberStore = create<MemberState>((set, get) => ({
  members: [],
  isLoading: false,
  error: null,
  
  fetchMembers: async () => {
    // 중복 요청 방지
    if (get().isLoading) return;
    
    set({ isLoading: true, error: null });
    
    try {
      const members = await IpcMemberService.getAll();
      set({ members, isLoading: false });
    } catch (error) {
      set({ 
        error: error.message, 
        isLoading: false 
      });
    }
  },
  
  addMember: async (memberData) => {
    set({ isLoading: true, error: null });
    
    try {
      const newId = await IpcMemberService.add(memberData);
      const newMember = { ...memberData, id: newId };
      
      set((state) => ({
        members: [...state.members, newMember],
        isLoading: false
      }));
      
      return newMember;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  }
}));
```

### **5. 에러 복구 패턴**

#### **🔄 재시도 로직**

```typescript
// 지수 백오프 재시도
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// 사용 예시
const members = await retryWithBackoff(() => 
  IpcMemberService.getAll()
);
```

#### **💾 오프라인 대응 패턴**

```typescript
// 큐 기반 오프라인 처리
class OfflineQueue {
  private queue: QueueItem[] = [];
  
  async addToQueue(operation: () => Promise<any>) {
    this.queue.push({
      operation,
      timestamp: Date.now(),
      retryCount: 0
    });
    
    this.processQueue();
  }
  
  private async processQueue() {
    while (this.queue.length > 0) {
      const item = this.queue[0];
      
      try {
        await item.operation();
        this.queue.shift(); // 성공 시 제거
      } catch (error) {
        item.retryCount++;
        
        if (item.retryCount >= 3) {
          this.queue.shift(); // 최대 재시도 초과 시 제거
          electronLog.error('오프라인 작업 최종 실패:', error);
        } else {
          // 1초 후 재시도
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
  }
}
```

---

## 🧪 테스트 가이드라인

### **1. API 테스트 패턴**

#### **🔧 IPC 통신 테스트**

```typescript
// IPC 서비스 테스트
describe('IpcMemberService', () => {
  beforeEach(() => {
    // Mock window.api
    global.window = {
      api: {
        getAllMembers: jest.fn(),
        addMember: jest.fn(),
      }
    };
  });
  
  test('회원 목록 조회 성공', async () => {
    const mockMembers = [
      { id: 1, name: '홍길동', joinDate: '2024-01-01' }
    ];
    
    window.api.getAllMembers.mockResolvedValue({
      success: true,
      data: mockMembers
    });
    
    const result = await IpcMemberService.getAll();
    expect(result).toEqual(mockMembers);
  });
  
  test('회원 목록 조회 실패', async () => {
    window.api.getAllMembers.mockResolvedValue({
      success: false,
      error: '데이터베이스 연결 실패'
    });
    
    await expect(IpcMemberService.getAll()).rejects.toThrow('데이터베이스 연결 실패');
  });
});
```

#### **🗄️ Repository 테스트**

```typescript
// Repository 테스트
describe('memberRepository', () => {
  beforeEach(async () => {
    // 테스트 데이터베이스 초기화
    await setupTestDatabase();
  });
  
  afterEach(async () => {
    // 테스트 데이터 정리
    await cleanupTestDatabase();
  });
  
  test('회원 추가 성공', async () => {
    const memberData = {
      name: '테스트 회원',
      joinDate: '2024-01-01'
    };
    
    const id = await memberRepository.addMember(memberData);
    expect(typeof id).toBe('number');
    expect(id).toBeGreaterThan(0);
    
    const member = await memberRepository.getMemberById(id);
    expect(member.name).toBe('테스트 회원');
  });
});
```

### **2. 비동기 테스트 패턴**

```typescript
// Promise 기반 테스트
test('비동기 회원 추가', async () => {
  const memberData = { name: '새 회원', joinDate: '2024-01-01' };
  
  const result = await expect(
    memberRepository.addMember(memberData)
  ).resolves.toBeGreaterThan(0);
});

// 타임아웃 테스트
test('장시간 작업 타임아웃', async () => {
  const slowOperation = () => new Promise(resolve => 
    setTimeout(resolve, 5000)
  );
  
  await expect(Promise.race([
    slowOperation(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 1000)
    )
  ])).rejects.toThrow('Timeout');
});
```

---

## 📚 베스트 프랙티스

### **1. API 설계 원칙**

- ✅ **일관성**: 모든 API는 동일한 응답 형식 사용
- ✅ **명시성**: 에러 메시지는 구체적이고 이해하기 쉽게
- ✅ **안전성**: 입력 검증과 타입 안전성 보장
- ✅ **확장성**: 새로운 필드 추가가 쉬운 구조

### **2. 에러 처리 원칙**

- 🚫 **민감 정보 노출 금지**: 스택 트레이스나 시스템 경로 숨김
- 📝 **구체적 메시지**: 사용자가 해결할 수 있는 정보 제공
- 📊 **로깅 충실**: 디버깅을 위한 상세 정보 기록
- 🔄 **우아한 실패**: 시스템 중단 없이 에러 처리

### **3. 성능 최적화**

- ⚡ **병렬 처리**: 독립적인 작업은 Promise.all 사용
- 💾 **데이터 캐싱**: 자주 조회되는 데이터 메모리 캐시
- 📄 **페이지네이션**: 대용량 데이터는 분할 조회
- 🗜️ **데이터 압축**: 큰 응답 데이터는 압축 고려

---

## 🔮 마이그레이션 가이드

### **API 버전 관리**

새로운 API 버전 추가 시:

1. **IPC 채널명에 버전 포함**
   ```typescript
   // v1
   ipcMain.handle('get-all-members', handler);
   
   // v2
   ipcMain.handle('get-all-members-v2', newHandler);
   ```

2. **점진적 마이그레이션**
   ```typescript
   // 기존 API 유지하면서 새 API 추가
   contextBridge.exposeInMainWorld('api', {
     // 기존 API
     getAllMembers: () => ipcRenderer.invoke('get-all-members'),
     
     // 새 API
     getAllMembersV2: () => ipcRenderer.invoke('get-all-members-v2'),
   });
   ```

3. **데이터베이스 스키마 변경**
   ```typescript
   // 스키마 버전 관리
   const migrations = {
     1: 'ALTER TABLE members ADD COLUMN staff_id INTEGER',
     2: 'ALTER TABLE members ADD COLUMN staff_name TEXT',
   };
   ```

---

**작성일**: 2024년 12월  
**작성자**: 개발팀  
**버전**: 1.0.0

> 📝 **참고**: 이 API 문서는 실제 코드와 동기화하여 지속적으로 업데이트됩니다. 