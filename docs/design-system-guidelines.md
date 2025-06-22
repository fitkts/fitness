# 🎨 피트니스 회원 관리 시스템 디자인 가이드라인

## 📌 문서 목적
이 문서는 **Members.tsx 페이지를 기준**으로 한 디자인 시스템 가이드라인입니다.  
모든 페이지가 일관된 UI/UX를 제공할 수 있도록 표준화된 스타일과 레이아웃을 정의합니다.

---

## 🔄 필터 일관성 관리 시스템 (2024.12 업데이트)

### **🎯 필터 디자인 통일 완료 현황**
- [x] **회원관리**: 6컬럼 그리드, 엑셀 기능, 성별/이용권 필터 ✅
- [x] **직원관리**: 4컬럼 그리드, 직책별 필터, 생년월일 필드 ✅  
- [x] **락커관리**: 4컬럼 그리드, 정렬/표시방식 필터, 락커 상태 ✅
- [x] **상담일지**: 4컬럼 그리드, 상담 상태/담당자/성별 필터, 날짜 범위 ✅
- [x] **통계관리**: 4컬럼 그리드, 차트 표시 단위, 결제 상태, 빠른 날짜 선택 ✅

### **🛠️ 필터 수정 시 일관성 유지 방법**

#### **방법 1: 공통 설정 파일 사용 (권장)**
```typescript
// 1. 공통 설정 임포트
import { 
  COMMON_ACTION_BUTTON_CONFIG,
  COMMON_FILTER_LAYOUT,
  createFilterConfig 
} from '../config/commonFilterConfig';

// 2. 페이지별 설정 생성
const MEMBER_FILTER_CONFIG = createFilterConfig({
  gridColumns: 6, // 회원관리는 6컬럼
  actionButtons: {
    add: { text: '회원 추가' },
    excel: { import: true, export: true, info: true }
  }
});

// 3. 컴포넌트에서 사용
<div className={MEMBER_FILTER_CONFIG.CONTAINER.className}>
  <div className={MEMBER_FILTER_CONFIG.HEADER.wrapper}>
    {/* 헤더 내용 */}
  </div>
  <div className={MEMBER_FILTER_CONFIG.CONTENT.wrapper}>
    <div className={`${MEMBER_FILTER_CONFIG.CONTENT.grid} ${MEMBER_FILTER_CONFIG.CONTENT.gridColumns}`}>
      {/* 필터 필드들 */}
    </div>
  </div>
</div>
```

#### **방법 2: BaseFilter 컴포넌트 사용 (더 권장)**
```typescript
import BaseFilter from '../components/common/BaseFilter';
import FilterField from '../components/common/FilterField';

const MemberSearchFilter = ({ filter, onFilterChange, onReset }) => {
  return (
    <BaseFilter
      title="회원 검색 및 필터"
      filter={filter}
      onReset={onReset}
      gridColumns={6}
      actionButtons={
        <div className="flex items-center gap-2">
          <button>회원 추가</button>
          <button>엑셀 내보내기</button>
        </div>
      }
    >
      <FilterField
        label="회원 이름"
        value={filter.search}
        onChange={(value) => onFilterChange({ ...filter, search: value })}
        placeholder="회원 이름으로 검색..."
      />
      
      <FilterField
        label="성별"
        type="select"
        value={filter.gender}
        onChange={(value) => onFilterChange({ ...filter, gender: value })}
        options={[
          { value: 'all', label: '전체 성별' },
          { value: '남성', label: '남성' },
          { value: '여성', label: '여성' }
        ]}
      />
    </BaseFilter>
  );
};
```

#### **방법 3: 기존 방식 + 공통 클래스 사용**
```typescript
// 기존 컴포넌트를 유지하면서 공통 클래스만 적용
import { COMMON_FILTER_LAYOUT } from '../config/commonFilterConfig';

// 컨테이너 클래스를 하드코딩에서 공통 설정으로 변경
<div className={COMMON_FILTER_LAYOUT.CONTAINER.className}>
  {/* 기존 내용 유지 */}
</div>
```

### **🚨 필터 수정 시 주의사항**

#### **절대 하드코딩하지 말 것:**
```typescript
// ❌ 절대 금지 - 하드코딩
<div className="mb-4 bg-white rounded-lg shadow-sm border border-gray-200">

// ✅ 올바른 방법 - 공통 설정 사용
<div className={COMMON_FILTER_LAYOUT.CONTAINER.className}>
```

#### **필터 수정 체크리스트:**
- [ ] 컨테이너 클래스: `mb-4 bg-white rounded-lg shadow-sm border border-gray-200 sticky top-4 z-20`
- [ ] 헤더 패딩: `px-3 py-2`
- [ ] 컨텐츠 패딩: `p-3`
- [ ] 그리드 간격: `gap-3`
- [ ] 입력 필드 라벨: `text-xs font-medium text-gray-700`
- [ ] 입력 필드 크기: `text-sm py-1.5 px-2`
- [ ] 버튼 크기: `text-sm font-medium py-1.5 px-3`

### **🔧 새로운 필터 추가 시 절차**

1. **공통 컴포넌트 사용 (권장)**:
   ```typescript
   import BaseFilter from '../components/common/BaseFilter';
   import FilterField from '../components/common/FilterField';
   ```

2. **페이지별 설정 파일 생성**:
   ```typescript
   // config/newPageFilterConfig.ts
   import { createFilterConfig } from './commonFilterConfig';
   
   export const NEW_PAGE_FILTER_CONFIG = createFilterConfig({
     gridColumns: 4, // 또는 6
     actionButtons: {
       add: { text: '새 항목 추가' }
     }
   });
   ```

3. **테스트 파일 작성**:
   ```typescript
   // 공통 테스트 케이스 포함
   test('회원관리와 동일한 컨테이너 스타일을 가져야 한다', () => {
     render(<NewPageFilter {...props} />);
     const container = screen.getByTestId('filter-container');
     expect(container).toHaveClass('mb-4', 'bg-white', 'rounded-lg');
   });
   ```

---

## 🚀 컴포넌트별 표준화 순서

### **1차 우선순위 (Easy - 즉시 적용 가능)**
- [x] **Members.tsx** - 표준 기준 페이지 ✅
- [x] **Staff.tsx** - 비슷한 구조 ✅  
- [x] **ConsultationDashboard.tsx** - 단순 구조 ✅
- [x] **Lockers.tsx** - 복잡한 구조, 설정 파일 적용 완료 ✅

### **2차 우선순위 (Medium - 설정 추가 필요)**
- [x] **Statistics.tsx** - 통계 중심 페이지, 필터 통일 완료 ✅
- [ ] **Dashboard.tsx** - 통계 중심 페이지, 특별한 스타일 필요
- [ ] **Attendance.tsx** - 간단한 구조

### **3차 우선순위 (Hard - 대규모 리팩토링 필요)**
- [ ] **Payment.tsx** (675줄) - 가장 복잡한 페이지
- [ ] **Settings.tsx** (490줄) - 설정 페이지, 특별한 레이아웃

---

## 🏗️ 표준 페이지 구조 (Members.tsx 기준)

### **📂 필수 파일 구조**
```
pages/
  └── {Domain}.tsx              # 메인 페이지 파일
config/
  └── {domain}PageConfig.ts     # 페이지별 설정 파일
components/
  └── {domain}/
      ├── {Domain}SearchFilter.tsx
      ├── {Domain}Statistics.tsx
      └── {Domain}TableWithPagination.tsx
```

### **🎯 표준 임포트 순서**
```typescript
// 1. React 및 외부 라이브러리
import React, { useState, useEffect } from 'react';

// 2. 타입 정의
import { Member, MemberFilter } from '../models/types';
import { SortConfig, PaginationConfig } from '../types/member';

// 3. 설정 파일 (페이지별)
import { 
  MEMBERS_PAGE_STYLES,
  MEMBERS_MESSAGES,
  MEMBERS_FILTER_DEFAULTS,
  MEMBERS_TEST_IDS
} from '../config/membersPageConfig';

// 4. 유틸리티 함수
import { 
  formatDate, 
  getMembershipStatus, 
  calculateStatistics, 
  sortMembers, 
  calculatePagination 
} from '../utils/memberUtils';

// 5. 훅 및 컨텍스트
import { useMemberStore } from '../stores/memberStore';
import { useToast } from '../contexts/ToastContext';
import { useModalState } from '../hooks/useModalState';

// 6. 데이터베이스 서비스
import { getAllStaff } from '../database/ipcService';

// 7. 공통 컴포넌트
import PageContainer from '../components/common/PageContainer';
import PageHeader from '../components/common/PageHeader';

// 8. 도메인별 컴포넌트 (알파벳 순)
import MemberModal from '../components/MemberModal';
import MemberSearchFilter from '../components/member/MemberSearchFilter';
import MemberStatistics from '../components/member/MemberStatistics';
import MemberTableWithPagination from '../components/member/MemberTableWithPagination';
```

### **⚡ 표준 컴포넌트 구조**
```typescript
const {Domain}: React.FC = () => {
  // 1. 스토어 및 전역 상태
  const { data, isLoading, error, actions } = useStore();
  const { showToast } = useToast();
  const { modalState, openModal, closeModal } = useModalState<Type>();

  // 2. 로컬 상태 (순서대로)
  const [filter, setFilter] = useState(FILTER_DEFAULTS);
  const [sortConfig, setSortConfig] = useState<SortConfig>({...});
  const [pagination, setPagination] = useState<PaginationConfig>({...});
  const [additionalData, setAdditionalData] = useState([]);

  // 3. 데이터 로딩 useEffect
  useEffect(() => {
    loadInitialData();
  }, []);

  // 4. 계산된 값들 (useMemo)
  const filteredData = useMemo(() => {...}, [data, filter]);
  const sortedData = useMemo(() => {...}, [filteredData, sortConfig]);
  const statistics = useMemo(() => {...}, [data]);

  // 5. 이벤트 핸들러들
  const handleAdd = () => {...};
  const handleEdit = (item) => {...};
  const handleDelete = (id) => {...};
  const handleSort = (key) => {...};
  const handleFilterChange = (newFilter) => {...};

  // 6. 렌더링
  return (
    <PageContainer testId={TEST_IDS.pageContainer}>
      <PageHeader title={MESSAGES.pageTitle} testId={TEST_IDS.pageHeader} />
      
      <{Domain}SearchFilter {...filterProps} />
      <{Domain}Statistics statistics={statistics} />
      <{Domain}TableWithPagination {...tableProps} />
      
      {modalState.isOpen && <{Domain}Modal {...modalProps} />}
    </PageContainer>
  );
};
```

---

## 📝 페이지별 설정 파일 표준

### **config/{domain}PageConfig.ts 템플릿**
```typescript
// {Domain} 페이지 전용 설정 파일

// 페이지 스타일 설정 (더 이상 사용하지 않음 - PageContainer, PageHeader 사용)
export const {DOMAIN}_PAGE_STYLES = {
  container: 'page-container space-y-6',
  header: {
    wrapper: 'page-header flex items-center justify-between',
    title: 'page-title text-3xl font-bold text-gray-800'
  }
} as const;

// 메시지 설정
export const {DOMAIN}_MESSAGES = {
  pageTitle: '{도메인} 관리',
  success: {
    itemAdded: '새 {단위}이(가) 추가되었습니다.',
    itemUpdated: '{단위} 정보가 수정되었습니다.',
    itemDeleted: '{단위}이(가) 삭제되었습니다.'
  },
  error: {
    saveFailed: '{단위} 정보 저장에 실패했습니다.',
    deleteFailed: '{단위} 삭제에 실패했습니다.',
    loadFailed: '{단위} 데이터 로딩에 실패했습니다.'
  },
  confirm: {
    deleteConfirm: '정말로 이 {단위}을(를) 삭제하시겠습니까?'
  }
} as const;

// 필터 초기값 설정
export const {DOMAIN}_FILTER_DEFAULTS = {
  search: '',
  // 도메인별 필터 필드들...
} as const;

// 테스트 데이터 식별자
export const {DOMAIN}_TEST_IDS = {
  pageContainer: '{domain}-page-container',
  pageHeader: '{domain}-page-header',
  addButton: 'add-{domain}-button',
  resetButton: 'reset-filters-button'
} as const;
```

---

## 🏗️ 페이지 레이아웃 구조

### **✅ 표준 페이지 구조 (Members.tsx 기준)**
```typescript
return (
  <PageContainer testId={TEST_IDS.pageContainer}>
    <PageHeader title={MESSAGES.pageTitle} testId={TEST_IDS.pageHeader} />
    
    <{Domain}SearchFilter
      filter={filter}
      onFilterChange={setFilter}
      onReset={handleResetFilters}
      // 도메인별 추가 props...
    />
    
    <{Domain}Statistics statistics={statistics} />
    
    <{Domain}TableWithPagination
      data={sortedData}
      sortConfig={sortConfig}
      pagination={pagination}
      isLoading={isLoading}
      onSort={handleSort}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onPaginationChange={setPagination}
    />
    
    {modalState.isOpen && (
      <{Domain}Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onSave={handleSave}
        item={modalState.selectedItem}
        isViewMode={modalState.isViewMode}
        onSwitchToEdit={switchToEditMode}
      />
    )}
  </PageContainer>
);
```

### **⚠️ 기존 하드코딩 문제점**
```typescript
// ❌ 하드코딩된 나쁜 예시 (기존 다른 페이지들)
<div className="p-6 max-w-7xl mx-auto space-y-6">
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-gray-900 mb-2">직원 관리</h1>
    <p className="text-gray-600">직원 정보를 관리합니다.</p>
  </div>
  // 내용...
</div>

// ✅ 표준화된 좋은 예시 (Members.tsx 기준)
<PageContainer testId={MEMBERS_TEST_IDS.pageContainer}>
  <PageHeader title={MEMBERS_MESSAGES.pageTitle} testId={MEMBERS_TEST_IDS.pageHeader} />
  // 내용...
</PageContainer>
```

---

## 🎨 색상 시스템

### **주요 색상 팔레트**
| 용도 | 색상 | Tailwind 클래스 | 사용 예시 |
|------|------|----------------|-----------|
| **Primary** | 파란색 | `blue-600` | 주요 버튼, 링크 |
| **Primary Hover** | 진한 파란색 | `blue-700` | 버튼 호버 상태 |
| **Secondary** | 회색 | `gray-600` | 보조 버튼 |
| **Success** | 초록색 | `green-600` | 성공 메시지, 활성 상태 |
| **Warning** | 노란색 | `yellow-600` | 경고 메시지 |
| **Error** | 빨간색 | `red-600` | 에러 메시지, 삭제 버튼 |

### **하드코딩 방지 사용법**
```typescript
// ❌ 하드코딩 (여러 컴포넌트에서 발견됨)
className="bg-blue-600 hover:bg-blue-700"

// ✅ 디자인 시스템 사용
import { DESIGN_SYSTEM } from '../config/designSystemConfig';
className={`bg-${DESIGN_SYSTEM.colors.primary.blue} hover:bg-${DESIGN_SYSTEM.colors.primary.blueHover}`}

// 또는 유틸리티 함수 사용
import { getButtonStyle } from '../utils/designSystemUtils';
className={getButtonStyle('primary')}
```

### **텍스트 색상**
```css
text-gray-800  /* 기본 텍스트 */
text-gray-600  /* 보조 텍스트 */
text-gray-500  /* 설명 텍스트 */
```

### **배경 색상**
```css
bg-white       /* 카드, 모달 배경 */
bg-gray-50     /* 페이지 배경 */
bg-gray-100    /* 비활성 상태 */
```

---

## 📝 타이포그래피

### **글자 크기와 굵기**
| 요소 | 클래스 | 사용 예시 |
|------|--------|-----------|
| **페이지 제목** | `text-3xl font-bold` | 회원 관리, 직원 관리 |
| **섹션 제목** | `text-xl font-semibold` | 검색 필터, 통계 |
| **카드 제목** | `text-lg font-semibold` | 통계 카드 |
| **본문 텍스트** | `text-sm` | 테이블 내용, 폼 라벨 |
| **설명 텍스트** | `text-xs text-gray-500` | 도움말, 캡션 |

### **⚠️ 발견된 하드코딩 문제들**
```typescript
// ❌ MemberViewDetails.tsx에서 발견된 하드코딩
className="text-3xl font-bold"

// ❌ MemberTable.tsx에서 발견된 하드코딩  
className="py-8 px-4 text-center text-gray-500"

// ✅ 개선된 방법
import { DESIGN_SYSTEM } from '../config/designSystemConfig';
className={DESIGN_SYSTEM.typography.pageTitle + ' ' + DESIGN_SYSTEM.colors.text.primary}
```

### **타이포그래피 사용 예시**
```typescript
// 페이지 제목
<h1 className="text-3xl font-bold text-gray-800">회원 관리</h1>

// 섹션 제목
<h2 className="text-xl font-semibold text-gray-800">검색 및 필터</h2>

// 카드 제목
<h3 className="text-lg font-semibold text-gray-800">총 회원 수</h3>
```

---

## 🔘 버튼 스타일

### **버튼 변형**
```typescript
export const BUTTON_STYLES = {
  // 주요 액션 (추가, 저장, 확인)
  primary: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors',
  
  // 보조 액션 (취소, 닫기)
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors',
  
  // 성공 액션 (완료, 승인)
  success: 'bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors',
  
  // 위험 액션 (삭제, 제거)
  danger: 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors',
  
  // 외곽선 버튼 (필터 초기화, 옵션)
  outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors'
};
```

### **버튼 우선순위 및 배치 원칙**
```typescript
// ✅ 올바른 버튼 배치 (오른쪽에서 왼쪽 순서)
<div className="flex items-center gap-2">
  {/* 3순위: 조건부 보조 액션 (왼쪽) */}
  {hasSecondaryAction && (
    <button className="outline-button">보조 액션</button>
  )}
  
  {/* 2순위: 조건부 주요 보조 액션 */}
  {hasFilter && (
    <button className="secondary-button">초기화</button>
  )}
  
  {/* 1순위: 주요 액션 (오른쪽 끝 고정) */}
  <button className="primary-button">주요 액션</button>
</div>

// ❌ 잘못된 배치 - 주요 버튼이 움직임
<div className="flex items-center gap-2">
  <button className="primary-button">주요 액션</button>
  {hasFilter && <button className="secondary-button">초기화</button>}
</div>
```

### **버튼 배치 가이드라인**
1. **주요 액션 버튼**: 항상 오른쪽 끝에 고정
2. **보조 액션 버튼**: 주요 버튼 왼쪽에 조건부 배치
3. **위험 액션 버튼**: 다른 버튼들과 분리하여 배치
4. **아이콘 버튼**: 그룹으로 묶어서 배치

### **버튼 크기**
```css
/* 기본 크기 */
px-4 py-2

/* 작은 크기 */
px-3 py-1.5 text-sm

/* 큰 크기 */
px-6 py-3 text-base
```

---

## 📦 카드 및 컨테이너

### **카드 스타일**
```css
/* 기본 카드 */
.card {
  @apply bg-white rounded-lg border border-gray-200 shadow-sm p-6;
}

/* 통계 카드 */
.stats-card {
  @apply bg-white rounded-lg border border-gray-200 shadow-sm p-4;
}

/* 작은 카드 */
.card-sm {
  @apply bg-white rounded-lg border border-gray-200 shadow-sm p-4;
}
```

### **카드 사용 예시**
```typescript
// 통계 카드
<div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
  <h3 className="text-lg font-semibold text-gray-800">총 회원 수</h3>
  <p className="text-2xl font-bold text-blue-600">{statistics.total}</p>
</div>
```

---

## �� 테이블 스타일

### **⚠️ 발견된 하드코딩 문제들**
```typescript
// ❌ MemberTable.tsx, MemberPagination.tsx에서 발견된 반복 코드
className="relative inline-flex items-center px-4 py-2 text-sm font-medium"
className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"

// ✅ 표준화된 테이블 설정 사용
import { TABLE_COMPACT_CONFIG } from '../config/memberConfig';
className={TABLE_COMPACT_CONFIG.HEADER.cellPadding}
```

### **테이블 구조**
```css
/* 테이블 컨테이너 */
.table-container {
  @apply bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden;
}

/* 테이블 */
.table {
  @apply min-w-full divide-y divide-gray-200;
}

/* 테이블 헤더 */
.table-header {
  @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50;
}

/* 테이블 셀 */
.table-cell {
  @apply px-6 py-4 whitespace-nowrap text-sm text-gray-900;
}
```

---

## 🏷️ 배지 및 상태 표시

### **상태 배지**
```typescript
export const STATUS_BADGES = {
  // 활성 상태 (이용 중)
  active: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
  
  // 만료 상태
  expired: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800',
  
  // 경고 상태 (곧 만료)
  warning: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
  
  // 비활성 상태
  inactive: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'
};
```

---

## 📝 폼 요소

### **입력 필드**
```css
/* 기본 입력 필드 */
.input {
  @apply border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

/* 셀렉트 박스 */
.select {
  @apply border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

/* 텍스트 영역 */
.textarea {
  @apply border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none;
}
```

### **라벨 스타일**
```css
.label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}
```

---

## 📏 간격 시스템

### **컴포넌트 간격**
```typescript
export const SPACING = {
  // 페이지 컨테이너 (주요 섹션 간)
  pageContainer: 'space-y-6',
  
  // 섹션 내부 (카드 간)
  sectionGap: 'space-y-4',
  
  // 카드 내부 (요소 간)
  cardGap: 'space-y-3',
  
  // 폼 필드 간
  formGap: 'space-y-2',
  
  // 인라인 요소 간 (버튼, 배지)
  inlineGap: 'space-x-2'
};
```

---

## 📱 반응형 디자인

### **그리드 시스템**
```css
/* 컨테이너 */
.container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

/* 2열 그리드 */
.grid-2 {
  @apply grid grid-cols-1 md:grid-cols-2 gap-6;
}

/* 3열 그리드 */
.grid-3 {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

/* 4열 그리드 */
.grid-4 {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6;
}
```

---

## 🛠️ 사용법 가이드

### **1. 디자인 시스템 import**
```typescript
import { 
  DESIGN_SYSTEM, 
  COMMON_STYLES, 
  STATUS_BADGE_STYLES 
} from '../config/designSystemConfig';

import {
  createPageStructure,
  getButtonStyle,
  createCardStyle,
  getStatusBadgeStyle
} from '../utils/designSystemUtils';
```

### **2. 페이지 구조 생성**
```typescript
const Members: React.FC = () => {
  const pageStructure = createPageStructure('회원 관리');
  
  return (
    <div className={pageStructure.containerClass}>
      <div className={pageStructure.headerClass}>
        <h1 className={pageStructure.titleClass}>
          {pageStructure.title}
        </h1>
      </div>
      
      <MemberSearchFilter />
      <MemberStatistics />
      <MemberTableWithPagination />
    </div>
  );
};
```

### **3. 버튼 스타일 적용**
```typescript
// 주요 버튼
<button className={getButtonStyle('primary')}>
  새 회원 추가
</button>

// 추가 클래스와 조합
<button className={combineButtonClasses('danger', 'ml-2')}>
  삭제
</button>
```

### **4. 상태 배지 사용**
```typescript
<span className={getStatusBadgeStyle(status)}>
  {statusText}
</span>
```

---

## 🔧 하드코딩 제거 마이그레이션 가이드

### **현재 발견된 하드코딩 문제들**
1. **Members.tsx**: 페이지 제목 스타일
2. **MemberViewDetails.tsx**: 아바타 크기, 제목 스타일
3. **MemberTable.tsx**: 테이블 셀 패딩, 텍스트 스타일
4. **MemberPagination.tsx**: 페이지네이션 버튼 스타일 중복
5. **MemberPaymentHistory.tsx**: 테이블 관련 스타일 중복

### **마이그레이션 순서**
1. 디자인 시스템 유틸리티 함수 생성
2. 하드코딩된 스타일을 설정 파일로 이동
3. 컴포넌트별로 순차적 적용
4. 테스트 및 검증

---

## ✅ 체크리스트

### **새 페이지 생성 시 확인사항**
- [ ] ~~`space-y-6` 컨테이너 사용~~ → `DESIGN_SYSTEM.spacing.pageContainer` 사용
- [ ] ~~페이지 제목: `text-3xl font-bold text-gray-800`~~ → `createPageStructure()` 함수 사용
- [ ] 표준 컴포넌트 구조 (Filter → Statistics → Table → Modal)
- [ ] ~~버튼 색상이 용도에 맞는가?~~ → `getButtonStyle()` 함수 사용
- [ ] ~~카드 스타일 일관성 유지~~ → `COMMON_STYLES.card` 사용
- [ ] ~~상태 배지 색상 표준 준수~~ → `getStatusBadgeStyle()` 함수 사용
- [ ] 반응형 디자인 적용

### **하드코딩 제거 체크리스트**
- [ ] 컴포넌트에 하드코딩된 Tailwind 클래스 없음
- [ ] 디자인 시스템 설정 파일 사용
- [ ] 유틸리티 함수 활용
- [ ] 반복되는 스타일 패턴 제거

### **컴포넌트 개발 시 확인사항**
- [ ] 디자인 시스템 유틸리티 함수 사용
- [ ] 하드코딩된 스타일 없음
- [ ] TypeScript 타입 안전성 확보
- [ ] 재사용 가능한 구조

---

## 📖 예시 페이지

### **기준 페이지: Members.tsx (개선 후)**
```typescript
import React from 'react';
import { createPageStructure, getButtonStyle } from '../utils/designSystemUtils';

const Members: React.FC = () => {
  const pageStructure = createPageStructure('회원 관리');
  
  return (
    <div className={pageStructure.containerClass}>
      <div className={pageStructure.headerClass}>
        <h1 className={pageStructure.titleClass}>
          {pageStructure.title}
        </h1>
      </div>

      <MemberSearchFilter />
      <MemberStatistics />
      <MemberTableWithPagination />
      
      {modalState.isOpen && <MemberModal />}
    </div>
  );
};
```

### **다른 페이지 적용 예시**
```typescript
// Staff.tsx
const Staff: React.FC = () => {
  const pageStructure = createPageStructure('직원 관리');
  
  return (
    <div className={pageStructure.containerClass}>
      <div className={pageStructure.headerClass}>
        <h1 className={pageStructure.titleClass}>
          {pageStructure.title}
        </h1>
      </div>

      <StaffSearchFilter />
      <StaffStatistics />
      <StaffTableWithPagination />
      
      {modalState.isOpen && <StaffModal />}
    </div>
  );
};
```

---

## 🚫 피해야 할 안티패턴

### **❌ 나쁜 예시**
```typescript
// 모든 것이 한 파일에 있는 나쁜 예시
const Dashboard = () => {
  interface DashboardData { ... }
  const chartColors = ['red', 'blue'];
  const formatCurrency = (value) => { ... };
  
  // 500줄의 코드...
};

// 하드코딩된 스타일 사용
<h1 className="text-3xl font-bold text-gray-800">제목</h1>
<button className="bg-blue-600 hover:bg-blue-700 px-4 py-2">버튼</button>
```

### **✅ 좋은 예시**  
```typescript
// 잘 분리된 좋은 예시
import { DashboardData } from '../types/dashboard';
import { CHART_COLORS } from '../config/dashboardConfig';
import { formatCurrency } from '../utils/formatters';
import { createPageStructure, getButtonStyle } from '../utils/designSystemUtils';

const Dashboard = () => {
  const pageStructure = createPageStructure('대시보드');
  
  return (
    <div className={pageStructure.containerClass}>
      <h1 className={pageStructure.titleClass}>{pageStructure.title}</h1>
      <button className={getButtonStyle('primary')}>버튼</button>
    </div>
  );
};
```

---

## 🔧 개발자 도구

### **VS Code 스니펫 추천**
```json
{
  "Standard Page Structure": {
    "prefix": "page-structure",
    "body": [
      "const pageStructure = createPageStructure('$1');",
      "",
      "return (",
      "  <div className={pageStructure.containerClass}>",
      "    <div className={pageStructure.headerClass}>",
      "      <h1 className={pageStructure.titleClass}>",
      "        {pageStructure.title}",
      "      </h1>",
      "    </div>",
      "",
      "    <${2:Domain}SearchFilter />",
      "    <${2:Domain}Statistics />", 
      "    <${2:Domain}TableWithPagination />",
      "    ",
      "    {modalState.isOpen && <${2:Domain}Modal />}",
      "  </div>",
      ");"
    ]
  }
}
```

---

**작성일**: 2025년 01월  
**기준 페이지**: Members.tsx  
**버전**: 2.0.0 (하드코딩 제거 및 표준화)

> 📝 **참고**: 이 가이드라인은 Members.tsx 페이지의 디자인 패턴을 기반으로 작성되었으며, 발견된 하드코딩 문제들의 해결방안을 포함합니다. 모든 새로운 페이지는 이 표준을 따라 개발해야 합니다.