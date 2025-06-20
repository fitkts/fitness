# 🏗️ 모듈화된 깨끗한 코딩 지시사항 가이드 (v2.0)

## 📌 기본 원칙 (업데이트됨)

### 1. TDD(테스트 주도 개발) 우선 원칙 🧪
- **테스트 코드를 먼저 작성**하고 실제 코드를 구현
- **Red → Green → Refactor** 사이클 엄격히 준수
- **각 기능마다 최소 3가지 테스트 케이스** 작성 (정상/경계/예외)
- **통합 테스트와 단위 테스트** 병행 작성

### 2. 단일 책임 원칙 (강화됨)
- **각 파일은 하나의 명확한 역할만** 담당
- **200줄 이상 넘지 않도록** 제한 (엄격히 준수)
- **하나의 파일에 모든 기능을 넣지 않기**
- **Repository, Service, Utils 계층 명확히 분리**

### 3. 모듈 분리 우선순위 (실제 적용 구조)
1. **타입 정의** → `src/types/` (interface, type, enum만)
2. **설정 및 상수** → `src/config/` (하드코딩 방지)
3. **유틸리티 함수** → `src/utils/` (순수 함수만)
4. **테스트 코드** → `src/__tests__/` (TDD 필수)
5. **데이터 계층** → `src/database/` (Repository 패턴)
6. **비즈니스 로직** → `src/services/` (Service 패턴)
7. **UI 컴포넌트** → `src/components/` (도메인별 분리)
8. **페이지 컴포넌트** → `src/pages/` (메인 조합 로직)

---

## 🧪 TDD 실제 적용 가이드

### **TDD 개발 순서 (실제 프로젝트 적용)**

#### 1️⃣ 테스트 코드 먼저 작성
```typescript
// src/__tests__/utils/memberUtils.test.ts
describe('회원 유틸리티 함수', () => {
  it('회원 상태가 활성인지 확인해야 한다', () => {
    const member = { membershipEnd: '2025-12-31' };
    expect(isActiveMember(member)).toBe(true);
  });

  it('만료된 회원은 비활성으로 판단해야 한다', () => {
    const member = { membershipEnd: '2023-12-31' };
    expect(isActiveMember(member)).toBe(false);
  });

  it('회원권 종료일이 없으면 활성으로 판단해야 한다', () => {
    const member = { membershipEnd: null };
    expect(isActiveMember(member)).toBe(true);
  });
});
```

#### 2️⃣ 실제 코드 구현 (테스트 통과 목적)
```typescript
// src/utils/memberUtils.ts
export function isActiveMember(member: { membershipEnd?: string | null }): boolean {
  if (!member.membershipEnd) return true;
  return new Date(member.membershipEnd) > new Date();
}
```

#### 3️⃣ 리팩토링 (테스트 유지하며 개선)
```typescript
// 개선된 버전
export function isActiveMember(member: Pick<Member, 'membershipEnd'>): boolean {
  return !member.membershipEnd || new Date(member.membershipEnd) > new Date();
}
```

### **통합 테스트 예시 (실제 적용 사례)**
```typescript
// src/__tests__/integration/consultation-promotion-flow.test.tsx
describe('상담 회원 승격 플로우', () => {
  it('상담 완료 후 정식 회원으로 승격해야 한다', async () => {
    // Given: 상담 완료된 회원
    const consultationMember = await createTestConsultationMember({
      consultationStatus: 'completed'
    });

    // When: 승격 처리
    const result = await UnifiedMemberRepository.promoteConsultationMember(
      consultationMember.id,
      promotionData
    );

    // Then: 정식 회원으로 변환
    expect(result.success).toBe(true);
    expect(result.newMemberId).toBeDefined();
  });
});
```

---

## 🎯 실제 프로젝트 적용 템플릿

### **신규 기능 개발 템플릿 (TDD 기반)**
```
[기능명] 기능을 TDD 방식으로 개발해주세요.

**TDD 요구사항:**
1. 다음 순서로 개발해주세요:
   ① 테스트 코드 작성 (실패하는 테스트)
   ② 최소 구현으로 테스트 통과
   ③ 리팩토링으로 코드 품질 개선

2. 파일 구조:
   - 테스트: `src/__tests__/[도메인]/[기능명].test.ts`
   - 타입: `src/types/[기능명].ts`
   - 설정: `src/config/[기능명]Config.ts`
   - 유틸: `src/utils/[기능명]Utils.ts`
   - 저장소: `src/database/[기능명]Repository.ts`
   - 서비스: `src/services/[기능명]Service.ts`
   - 컴포넌트: `src/components/[도메인]/[기능명].tsx`

3. 테스트 케이스:
   - 정상 동작 케이스 (Happy Path)
   - 경계값 테스트 케이스 (Edge Case)
   - 예외 상황 케이스 (Error Case)
   - 통합 테스트 케이스 (Integration)

4. 코딩 원칙:
   - 200줄 이하 파일 크기 준수
   - 순수 함수 우선 작성
   - 의존성 주입으로 테스트 용이성 확보
```

### **기존 코드 리팩토링 템플릿**
```
[기존 파일명]을 TDD 기반으로 리팩토링해주세요.

**리팩토링 단계:**
1. 기존 동작 보장 테스트 작성
2. 모듈 분리 계획 수립
3. 단계별 안전한 분리 진행
4. 각 단계마다 테스트 실행으로 검증
5. 최종 코드 품질 개선

**목표:**
- 파일 크기 50% 이상 감소
- 테스트 커버리지 90% 이상
- 순환 의존성 제거
- 재사용성 90% 이상 향상
```

---

## 📂 실제 적용된 모듈 구조

### **검증된 폴더 구조 (현재 프로젝트)**
```
src/
├── __tests__/              # 🧪 TDD 테스트 코드
│   ├── components/         # 컴포넌트 단위 테스트
│   ├── integration/        # 통합 테스트
│   ├── utils/              # 유틸리티 테스트
│   └── database/           # 데이터베이스 테스트
├── types/                  # 📋 TypeScript 인터페이스
│   ├── common.ts           # 공통 타입
│   ├── unifiedMember.ts    # 통합 회원 타입
│   ├── consultation.ts     # 상담 회원 타입
│   └── [domain].ts         # 도메인별 타입
├── config/                 # ⚙️ 설정값, 상수, 옵션
│   ├── memberConfig.ts
│   ├── consultationConfig.ts
│   └── unifiedMemberConfig.ts
├── utils/                  # 🔧 순수 함수, 포맷팅, 계산
│   ├── dateUtils.ts
│   ├── memberUtils.ts
│   ├── unifiedMemberUtils.ts
│   └── validation.ts
├── database/               # 🗄️ 데이터 접근 계층
│   ├── setup.ts            # DB 초기화
│   ├── memberRepository.ts
│   ├── consultationRepository.ts
│   └── unifiedMemberRepository.ts
├── services/               # 🏢 비즈니스 로직 계층
│   └── memberConversionService.ts
├── components/             # 🎨 재사용 가능한 UI 컴포넌트
│   ├── common/             # 공통 컴포넌트
│   ├── member/             # 회원 관련
│   ├── consultation/       # 상담 관련
│   └── [domain]/           # 도메인별
└── pages/                  # 📄 메인 페이지 컴포넌트
    ├── Members.tsx
    ├── ConsultationDashboard.tsx
    └── UnifiedMemberManagement.tsx
```

### **실제 적용 사례: Unified Member 시스템**

#### 1. 타입 정의 (types/unifiedMember.ts)
```typescript
// 단일 책임: 통합 회원 관련 타입만 정의
export interface UnifiedMember {
  memberType: 'regular' | 'consultation';
  // ... 기타 공통 필드
}

export interface UnifiedMemberFilter {
  memberType?: 'all' | 'regular' | 'consultation';
  // ... 기타 필터 옵션
}
```

#### 2. 설정 파일 (config/unifiedMemberConfig.ts)
```typescript
// 단일 책임: 설정값과 상수만 관리
export const MEMBER_TYPES = {
  ALL: 'all',
  REGULAR: 'regular', 
  CONSULTATION: 'consultation'
} as const;

export const TABLE_COLUMNS = {
  regular: [/* 정식 회원 컬럼 */],
  consultation: [/* 상담 회원 컬럼 */]
} as const;
```

#### 3. 유틸리티 함수 (utils/unifiedMemberUtils.ts)
```typescript
// 단일 책임: 데이터 변환과 계산만
export function canPromoteMember(member: UnifiedMember): boolean {
  return member.memberType === 'consultation' && 
         member.consultationStatus === 'completed' && 
         !member.isPromoted;
}
```

#### 4. 데이터 계층 (database/unifiedMemberRepository.ts)
```typescript
// 단일 책임: 데이터 접근 로직만
export class UnifiedMemberRepository {
  static async getAllMembers(filter?: UnifiedMemberFilter): Promise<UnifiedMember[]> {
    // 데이터 조회 로직만
  }
}
```

#### 5. 서비스 계층 (services/memberConversionService.ts)
```typescript
// 단일 책임: 비즈니스 로직만
export class MemberConversionService {
  static promoteConsultationMemberToRegular(
    consultationMember: ConsultationMember,
    conversionData: MemberConversionData
  ): Member {
    // 승격 비즈니스 로직만
  }
}
```

---

## 📏 파일 크기 가이드라인 (엄격한 기준)

### **파일별 최대 라인 수 (엄격히 준수)**
- **타입 파일**: 50-80줄 (단순 정의만)
- **설정 파일**: 30-60줄 (상수와 기본값만)
- **유틸리티 파일**: 80-150줄 (순수 함수들만)
- **테스트 파일**: 100-200줄 (충분한 테스트 케이스)
- **Repository**: 150-250줄 (CRUD 로직만)
- **Service**: 100-200줄 (비즈니스 로직만)
- **컴포넌트 파일**: 80-120줄 (단일 기능만)
- **페이지 파일**: 120-200줄 (조합 로직만)

### **분리 기준 (자동 적용)**
- **100줄 초과 시**: 분리 검토 필요
- **150줄 초과 시**: 반드시 분리
- **200줄 초과 시**: 긴급 리팩토링 필요

---

## 🎨 검증된 네이밍 컨벤션

### **파일명 (실제 적용 사례)**
- **타입**: `[도메인명].ts` (예: `unifiedMember.ts`)
- **설정**: `[도메인명]Config.ts` (예: `consultationConfig.ts`)
- **유틸리티**: `[도메인명]Utils.ts` (예: `memberUtils.ts`)
- **저장소**: `[도메인명]Repository.ts` (예: `memberRepository.ts`)
- **서비스**: `[도메인명]Service.ts` (예: `memberConversionService.ts`)
- **테스트**: `[대상파일명].test.ts` (예: `memberUtils.test.ts`)
- **통합테스트**: `[기능명]-[시나리오].test.ts` (예: `consultation-promotion-flow.test.ts`)

### **클래스/함수명 패턴**
```typescript
// Repository 클래스
export class UnifiedMemberRepository {
  static async getAllMembers(): Promise<UnifiedMember[]>
  static async getMemberById(id: number): Promise<UnifiedMember | null>
  static async promoteConsultationMember(): Promise<PromotionResult>
}

// Service 클래스
export class MemberConversionService {
  static convertLegacyMemberToUnified(member: LegacyMember): UnifiedMember
  static promoteConsultationMemberToRegular(): Member
}

// Utils 함수 (순수 함수)
export function canPromoteMember(member: UnifiedMember): boolean
export function filterMembersByStatus(members: UnifiedMember[]): UnifiedMember[]
export function getMemberStatusInfo(member: UnifiedMember): StatusInfo
```

---

## ✅ TDD 품질 체크리스트

### **개발 시작 전**
- [ ] 기능 요구사항을 테스트 케이스로 작성했는가?
- [ ] 정상/경계/예외 케이스를 모두 고려했는가?
- [ ] 테스트가 실패하는 것을 확인했는가?
- [ ] 모듈 분리 계획을 수립했는가?

### **개발 완료 후**
- [ ] 모든 테스트가 통과하는가?
- [ ] 각 파일이 200줄을 넘지 않는가?
- [ ] 하드코딩된 값이 없는가?
- [ ] 순수 함수로 작성되었는가?
- [ ] 의존성이 명확히 분리되었는가?
- [ ] 통합 테스트가 있는가?

### **리팩토링 완료 후**
- [ ] 기존 테스트가 모두 통과하는가?
- [ ] 새로운 구조에 맞는 테스트가 추가되었는가?
- [ ] 코드 중복이 제거되었는가?
- [ ] 성능이 개선되었는가?

---

## 🚫 피해야 할 안티패턴 (실제 사례 기반)

### ❌ 나쁜 예시 (리팩토링 전)
```typescript
// 하나의 파일에 모든 것이 섞여 있는 나쁜 예시
const MemberManagement = () => {
  // 타입 정의 (별도 파일로 분리해야 함)
  interface MemberData { /* ... */ }
  
  // 설정값들 (config 파일로 분리해야 함)
  const memberTypes = ['regular', 'consultation'];
  const statusColors = { active: 'green', expired: 'red' };
  
  // 유틸리티 함수들 (utils 파일로 분리해야 함)
  const isActiveMember = (member) => { /* ... */ };
  const formatMembershipEnd = (date) => { /* ... */ };
  
  // 데이터베이스 로직 (repository로 분리해야 함)
  const fetchMembers = async () => { /* ... */ };
  
  // 비즈니스 로직 (service로 분리해야 함)
  const promoteMember = (member) => { /* ... */ };
  
  // 컴포넌트 로직 (300줄 이상...)
  const [members, setMembers] = useState();
  // ... 복잡한 JSX
};
```

### ✅ 좋은 예시 (TDD + 모듈화 적용)
```typescript
// 잘 분리된 좋은 예시
import { UnifiedMember, MemberFilter } from '../types/unifiedMember';
import { MEMBER_TYPES, STATUS_COLORS } from '../config/unifiedMemberConfig';
import { isActiveMember, formatMembershipEnd } from '../utils/memberUtils';
import { UnifiedMemberRepository } from '../database/unifiedMemberRepository';
import { MemberConversionService } from '../services/memberConversionService';

const UnifiedMemberManagement: React.FC = () => {
  // 상태 관리와 조합 로직만 (120줄 이하)
  const [members, setMembers] = useState<UnifiedMember[]>([]);
  
  const handlePromotion = useCallback(async (member: UnifiedMember) => {
    // 비즈니스 로직은 Service에서 처리
    const result = await MemberConversionService.promoteMember(member);
    // UI 업데이트만 여기서
    setMembers(prev => prev.map(m => m.id === member.id ? result : m));
  }, []);

  return (
    <div>
      {/* 깔끔한 JSX (재사용 가능한 컴포넌트들로 구성) */}
      <MemberFilter onFilterChange={handleFilterChange} />
      <MemberTable members={members} onPromote={handlePromotion} />
    </div>
  );
};
```

---

## 🎯 실무 적용 팁 (실제 검증됨)

### **1. TDD 점진적 적용**
```
"[기능명]을 TDD로 개발해주세요. 다음 단계를 따라주세요:

1단계: 실패하는 테스트 3개 작성
  - 정상 동작 케이스
  - 경계값 케이스  
  - 예외 상황 케이스

2단계: 테스트가 통과하는 최소 구현

3단계: 코드 품질 개선 (테스트 유지하며)

4단계: 통합 테스트 추가"
```

### **2. 대규모 리팩토링**
```
"[기존 파일명]을 안전하게 리팩토링해주세요:

사전 작업:
  - 현재 동작을 보장하는 테스트 코드 작성
  - 모듈 분리 계획 수립

실행 단계:
  1. 타입 정의 분리 (types/)
  2. 설정값 분리 (config/)
  3. 순수 함수 분리 (utils/)
  4. 데이터 로직 분리 (database/)
  5. 비즈니스 로직 분리 (services/)
  6. UI 컴포넌트 분리 (components/)

검증:
  - 각 단계마다 모든 테스트 통과 확인
  - 기능 손실 없음 보장"
```

### **3. 신규 팀원 온보딩용**
```
"TDD 기반 개발 연습을 위해 간단한 기능부터 시작해주세요:

연습 과제:
  1. 회원 상태 확인 함수 (utils)
  2. 회원 필터링 함수 (utils)  
  3. 회원 정보 포맷팅 함수 (utils)

각 과제마다:
  - 테스트 먼저 작성
  - 구현 후 리팩토링
  - 코드 리뷰 진행"
```

---

## 🏆 성과 측정 지표

### **코드 품질 KPI**
- **테스트 커버리지**: 90% 이상 목표
- **평균 파일 크기**: 150줄 이하 유지  
- **순환 의존성**: 0개 유지
- **코드 중복도**: 5% 이하 유지

### **개발 생산성 KPI**
- **버그 발생률**: 80% 감소 (TDD 적용 후)
- **기능 개발 속도**: 50% 향상 (모듈 재사용)
- **리팩토링 안전성**: 99% (테스트 커버리지)
- **신규 개발자 적응 시간**: 70% 단축

---

**핵심 요약**: **TDD + 엄격한 모듈 분리 + 실제 검증된 패턴**을 통해 유지보수 가능하고 확장 가능한 코드를 만들 수 있습니다!

---

**작성일**: 2025년 01월  
**작성자**: AI Assistant  
**버전**: 2.0.0 (TDD 강화 버전)

> 📝 **참고**: 이 가이드라인은 실제 프로젝트에서 검증된 패턴들을 바탕으로 작성되었으며, TDD와 모듈화를 통한 고품질 코드 작성을 지원합니다. 