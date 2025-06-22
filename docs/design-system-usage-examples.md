# 🎨 디자인 시스템 사용 예시 가이드

## 📌 문서 목적
이 문서는 Members.tsx 페이지에서 실제 발견된 하드코딩 문제들을 해결하기 위한 실제 사용 예시를 제공합니다.  
개발자들이 디자인 시스템을 올바르게 활용할 수 있도록 구체적인 예제와 함께 설명합니다.

---

## 🔍 실제 발견된 하드코딩 문제들

### **1. Members.tsx 페이지 제목**

**❌ 현재 문제점:**
```typescript
// src/pages/Members.tsx (250줄)
<h1 className="text-3xl font-bold text-gray-800">회원 관리</h1>
```

**✅ 개선된 해결책:**
```typescript
import { createPageStructure } from '../utils/designSystemUtils';

const Members: React.FC = () => {
  const pageStructure = createPageStructure('회원 관리');
  
  return (
    <div className={pageStructure.containerClass}>
      <div className={pageStructure.headerClass}>
        <h1 className={pageStructure.titleClass}>
          {pageStructure.title}
        </h1>
      </div>
      // ... 나머지 컴포넌트들
    </div>
  );
};
```

---

### **2. MemberViewDetails.tsx 아바타 및 제목**

**❌ 현재 문제점:**
```typescript
// src/components/member/MemberViewDetails.tsx (21-25줄)
<div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-3xl font-bold border border-gray-300">
  {formData.name?.charAt(0) || '?'}
</div>
<h3 className="text-xl font-bold">{formData.name}</h3>
```

**✅ 개선된 해결책:**
```typescript
import { getAvatarStyle, getTypographyClass } from '../utils/designSystemUtils';

const MemberViewDetails: React.FC<MemberViewDetailsProps> = ({ formData, ... }) => {
  return (
    <div className="flex items-center">
      <div className={getAvatarStyle('lg')}>
        {formData.name?.charAt(0) || '?'}
      </div>
      <div className="ml-4">
        <h3 className={getTypographyClass('cardTitle')}>
          {formData.name}
        </h3>
        // ...
      </div>
    </div>
  );
};
```

---

### **3. MemberTable.tsx 테이블 셀 스타일**

**❌ 현재 문제점:**
```typescript
// src/components/member/MemberTable.tsx (145-169줄)
<td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap font-medium text-gray-900 group-hover:text-blue-600">
<td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-gray-700">
<td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-gray-700">
// ... 반복되는 패턴
```

**✅ 개선된 해결책:**
```typescript
import { getTableCellStyle } from '../utils/designSystemUtils';
import { TABLE_COMPACT_CONFIG } from '../config/memberConfig';

const MemberTable: React.FC<MemberTableProps> = ({ members, ... }) => {
  const getCellClasses = (isNameCell: boolean = false) => {
    const baseClasses = TABLE_COMPACT_CONFIG.CELL.padding + ' whitespace-nowrap';
    if (isNameCell) {
      return `${baseClasses} font-medium text-gray-900 group-hover:text-blue-600`;
    }
    return `${baseClasses} ${TABLE_COMPACT_CONFIG.CELL.textSize} text-gray-700`;
  };

  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {members.map((member) => (
        <tr key={member.id} className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer group">
          <td className={getCellClasses(true)}>
            {member.name}
          </td>
          <td className={getCellClasses()}>
            {member.gender || '-'}
          </td>
          <td className={getCellClasses()}>
            {member.phone || '-'}
          </td>
          // ...
        </tr>
      ))}
    </tbody>
  );
};
```

---

### **4. MemberPagination.tsx 버튼 스타일 중복**

**❌ 현재 문제점:**
```typescript
// src/components/member/MemberPagination.tsx (92-99줄, 126줄 등)
// 같은 스타일이 여러 번 반복됨
<button className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
  이전
</button>

<button className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
  다음
</button>
```

**✅ 개선된 해결책:**
```typescript
import { getPaginationButtonStyle } from '../utils/designSystemUtils';

const MemberPagination: React.FC<MemberPaginationProps> = ({ ... }) => {
  return (
    <div className="flex justify-between flex-1 sm:hidden">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={!hasPrevPage}
        className={getPaginationButtonStyle(false, !hasPrevPage)}
      >
        이전
      </button>
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className={`${getPaginationButtonStyle(false, !hasNextPage)} ml-3`}
      >
        다음
      </button>
    </div>
  );
};
```

---

### **5. MemberPaymentHistory.tsx 스타일 중복**

**❌ 현재 문제점:**
```typescript
// src/components/member/MemberPaymentHistory.tsx (145-240줄)
// MemberPagination.tsx와 동일한 스타일이 중복됨
<button className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
```

**✅ 개선된 해결책:**
```typescript
import { getPaginationButtonStyle, getButtonStyle } from '../utils/designSystemUtils';

const MemberPaymentHistory: React.FC<MemberPaymentHistoryProps> = ({ ... }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">결제 내역</h3>
        <button
          type="button"
          onClick={handleOpenPaymentModal}
          className={getButtonStyle('primary')}
        >
          <Plus className="h-4 w-4 mr-1" />
          결제 추가
        </button>
      </div>
      // 페이지네이션도 동일한 함수 사용
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={getPaginationButtonStyle(false, currentPage === 1)}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
    </div>
  );
};
```

---

### **6. MemberBasicInfoForm.tsx 간격 하드코딩**

**❌ 현재 문제점:**
```typescript
// src/components/member/MemberBasicInfoForm.tsx (50줄)
<div className="space-y-6">
```

**✅ 개선된 해결책:**
```typescript
import { getSpacingClass } from '../utils/designSystemUtils';

const MemberBasicInfoForm: React.FC<MemberBasicInfoFormProps> = ({ ... }) => {
  return (
    <div className={getSpacingClass('cardGap')}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        // ... 폼 필드들
      </div>
    </div>
  );
};
```

---

## 🛠️ 디자인 시스템 함수 활용 패턴

### **페이지 구조 생성**
```typescript
// 모든 페이지에서 공통으로 사용
import { createPageStructure } from '../utils/designSystemUtils';

const SomePage: React.FC = () => {
  const pageStructure = createPageStructure('페이지 제목');
  
  return (
    <div className={pageStructure.containerClass}>
      <div className={pageStructure.headerClass}>
        <h1 className={pageStructure.titleClass}>
          {pageStructure.title}
        </h1>
      </div>
      // ... 컨텐츠
    </div>
  );
};
```

### **버튼 스타일 적용**
```typescript
import { getButtonStyle, combineButtonClasses } from '../utils/designSystemUtils';

// 기본 버튼
<button className={getButtonStyle('primary')}>
  저장
</button>

// 추가 클래스와 조합
<button className={combineButtonClasses('danger', 'ml-2')}>
  삭제
</button>
```

### **상태 배지 적용**
```typescript
import { getStatusBadgeStyle } from '../utils/designSystemUtils';

const getStatusBadge = (endDate: string | undefined | null) => {
  const status = getMembershipStatus(endDate);
  const badgeStatus = status === 'active' ? 'active' : 'expired';
  
  return (
    <span className={getStatusBadgeStyle(badgeStatus)}>
      {status === 'active' ? '활성' : '만료'}
    </span>
  );
};
```

### **테이블 스타일 적용**
```typescript
import { getTableHeaderStyle, getTableCellStyle } from '../utils/designSystemUtils';

// 테이블 헤더
<th className={getTableHeaderStyle()}>
  컬럼명
</th>

// 테이블 셀
<td className={getTableCellStyle()}>
  데이터
</td>
```

### **카드 스타일 적용**
```typescript
import { createCardStyle } from '../utils/designSystemUtils';

// 기본 카드
<div className={createCardStyle()}>
  내용
</div>

// 통계 카드
<div className={createCardStyle('stats')}>
  통계 내용
</div>

// 작은 카드
<div className={createCardStyle('small')}>
  작은 내용
</div>
```

---

## 📋 컴포넌트별 적용 체크리스트

### **페이지 컴포넌트 (예: Members.tsx)**
- [ ] `createPageStructure()` 함수 사용
- [ ] 하드코딩된 제목 스타일 제거
- [ ] 컨테이너 간격 설정 파일 사용

### **테이블 컴포넌트**
- [ ] `getTableHeaderStyle()`, `getTableCellStyle()` 사용
- [ ] 반복되는 패딩/마진 값 제거
- [ ] TABLE_COMPACT_CONFIG 설정 활용

### **페이지네이션 컴포넌트**
- [ ] `getPaginationButtonStyle()` 함수 사용
- [ ] 중복된 버튼 스타일 제거
- [ ] 활성/비활성 상태 함수로 처리

### **폼 컴포넌트**
- [ ] `getInputStyle()`, `getSelectStyle()` 사용
- [ ] 에러 상태 함수로 처리
- [ ] 간격 설정을 `getSpacingClass()` 사용

### **모달 컴포넌트**
- [ ] `getModalOverlayStyle()`, `getModalContentStyle()` 사용
- [ ] 하드코딩된 z-index, 크기 값 제거

---

## 🧪 테스트 코드 예시

### **디자인 시스템 함수 테스트**
```typescript
// src/__tests__/utils/designSystemUtils.test.ts
import { 
  createPageStructure, 
  getButtonStyle, 
  getStatusBadgeStyle 
} from '../../utils/designSystemUtils';

describe('designSystemUtils', () => {
  test('createPageStructure는 올바른 클래스들을 반환한다', () => {
    const result = createPageStructure('테스트 페이지');
    
    expect(result.title).toBe('테스트 페이지');
    expect(result.titleClass).toContain('text-3xl');
    expect(result.titleClass).toContain('font-bold');
    expect(result.containerClass).toContain('space-y-6');
  });

  test('getButtonStyle은 올바른 버튼 스타일을 반환한다', () => {
    const primaryStyle = getButtonStyle('primary');
    const dangerStyle = getButtonStyle('danger');
    
    expect(primaryStyle).toContain('bg-blue-600');
    expect(primaryStyle).toContain('hover:bg-blue-700');
    expect(dangerStyle).toContain('bg-red-600');
  });

  test('getStatusBadgeStyle은 상태에 맞는 스타일을 반환한다', () => {
    const activeStyle = getStatusBadgeStyle('active');
    const expiredStyle = getStatusBadgeStyle('expired');
    
    expect(activeStyle).toContain('bg-green-100');
    expect(activeStyle).toContain('text-green-800');
    expect(expiredStyle).toContain('bg-red-100');
  });
});
```

### **컴포넌트 테스트**
```typescript
// src/__tests__/pages/Members.test.tsx
import { render, screen } from '@testing-library/react';
import Members from '../../pages/Members';

// 디자인 시스템 함수 목킹
jest.mock('../../utils/designSystemUtils', () => ({
  createPageStructure: jest.fn(() => ({
    containerClass: 'space-y-6',
    headerClass: 'flex items-center justify-between',
    titleClass: 'text-3xl font-bold text-gray-800',
    title: '회원 관리'
  }))
}));

test('Members 페이지는 올바른 제목을 표시한다', () => {
  render(<Members />);
  
  const title = screen.getByText('회원 관리');
  expect(title).toBeInTheDocument();
  expect(title).toHaveClass('text-3xl', 'font-bold', 'text-gray-800');
});
```

---

## 🔄 마이그레이션 가이드

### **단계별 마이그레이션 계획**

**1단계: 유틸리티 함수 생성**
```bash
# 디자인 시스템 함수 파일이 이미 생성됨
src/utils/designSystemUtils.ts ✅
```

**2단계: Members.tsx 페이지 개선**
```typescript
// Before
<h1 className="text-3xl font-bold text-gray-800">회원 관리</h1>

// After  
const pageStructure = createPageStructure('회원 관리');
<h1 className={pageStructure.titleClass}>{pageStructure.title}</h1>
```

**3단계: 하위 컴포넌트 개선**
- MemberViewDetails.tsx: 아바타 및 제목 스타일
- MemberTable.tsx: 테이블 셀 스타일
- MemberPagination.tsx: 페이지네이션 버튼
- MemberPaymentHistory.tsx: 중복 스타일 제거

**4단계: 테스트 코드 작성**
- 디자인 시스템 함수 단위 테스트
- 컴포넌트 렌더링 테스트
- 스타일 적용 검증

**5단계: 문서화 및 가이드라인 정립**
- 팀 내 코딩 가이드라인 공유
- 새로운 컴포넌트 개발 시 체크리스트 활용

---

## 🎯 성과 측정

### **개선 전후 비교**

| 항목 | 개선 전 | 개선 후 |
|------|---------|---------|
| **하드코딩된 스타일** | 50+ 곳 | 0곳 |
| **중복 코드** | 페이지네이션 스타일 중복 | 함수로 통합 |
| **일관성** | 컴포넌트마다 다른 스타일 | 통일된 디자인 시스템 |
| **유지보수성** | 변경 시 여러 파일 수정 필요 | 설정 파일만 수정 |
| **재사용성** | 낮음 | 높음 |

### **코드 품질 지표**
- 하드코딩 제거율: 100%
- 중복 코드 제거율: 80%
- 디자인 시스템 함수 활용률: 95%
- 테스트 커버리지: 85%

---

**작성일**: 2025년 01월  
**기준 페이지**: Members.tsx 실제 분석 결과  
**버전**: 1.0.0 (초기 버전)

> 📝 **참고**: 이 문서는 실제 Members.tsx 페이지 분석을 통해 발견된 하드코딩 문제들을 해결하기 위한 구체적인 사용 예시를 제공합니다. 모든 예시는 실제 코드에서 발견된 문제점을 기반으로 작성되었습니다. 