# 상담일지 테이블 컬럼 업데이트

## 📋 요청사항
사용자가 상담일지 페이지의 회원 리스트 테이블에서 다음과 같은 수정을 요청했습니다:

1. **아이콘 제거**: 이름과 전화번호 앞에 있는 아이콘 제거
2. **회원권 컬럼 제거**: 테이블에서 회원권 컬럼 삭제
3. **생년월일 컬럼 추가**: 새로운 생년월일 컬럼 추가
4. **가입일 컬럼 제거**: 가입일 컬럼 삭제
5. **최초 방문일 컬럼 추가**: 새로운 최초 방문일 컬럼 추가

## 🔧 수정 내용

### 1. 테이블 컬럼 설정 업데이트
**파일:** `src/config/consultationConfig.tsx`

```typescript
// 테이블 컬럼 설정
export const CONSULTATION_TABLE_COLUMNS = [
  { key: 'name', label: '회원명', sortable: true, width: '120px' },
  { key: 'phone', label: '연락처', sortable: false, width: '120px' },
  { key: 'gender', label: '성별', sortable: false, width: '60px' },
  { key: 'birth_date', label: '생년월일', sortable: true, width: '110px' }, // ✅ 추가
  { key: 'consultation_status', label: '상담 상태', sortable: true, width: '100px' },
  { key: 'staff_name', label: '담당자', sortable: false, width: '80px' },
  { key: 'first_visit', label: '최초 방문일', sortable: true, width: '110px' }, // ✅ 추가
  { key: 'last_visit', label: '최근 방문', sortable: true, width: '100px' },
  { key: 'actions', label: '작업', sortable: false, width: '120px' }
];
```

**변경사항:**
- ❌ `membership_type` (회원권) 컬럼 제거
- ❌ `join_date` (가입일) 컬럼 제거
- ✅ `birth_date` (생년월일) 컬럼 추가
- ✅ `first_visit` (최초 방문일) 컬럼 추가

### 2. 타입 정의 업데이트
**파일:** `src/types/consultation.ts`

#### ConsultationMember 인터페이스 수정
```typescript
export interface ConsultationMember {
  // ... 기존 필드들
  first_visit?: number; // ✅ Unix timestamp 필드 추가
  // ... 나머지 필드들
}
```

#### ConsultationTableSort 타입 수정
```typescript
export interface ConsultationTableSort {
  field: 'name' | 'birth_date' | 'first_visit' | 'last_visit' | 'consultation_status'; // ✅ 새 필드들 추가
  direction: 'asc' | 'desc';
}
```

### 3. 테이블 렌더링 로직 수정
**파일:** `src/components/consultation/ConsultationTable.tsx`

#### 아이콘 제거 및 컬럼 데이터 수정
```typescript
// 회원명 - 아이콘 제거 (아바타는 유지)
<td className="px-6 py-4 whitespace-nowrap">
  <div className="flex items-center">
    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
      <span className="text-sm font-medium text-blue-600">
        {member.name.charAt(0)}
      </span>
    </div>
    <div className="ml-3">
      <div className="text-sm font-medium text-gray-900">
        {member.name}
      </div>
    </div>
  </div>
</td>

// 연락처 - 전화 아이콘 제거
<td className="px-6 py-4 whitespace-nowrap">
  <div className="text-sm text-gray-900">
    {formatPhoneNumber(member.phone)}
  </div>
</td>

// 생년월일 컬럼 추가
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
  {member.birth_date ? formatDate(member.birth_date) : '-'}
</td>

// 최초 방문일 컬럼 추가 (달력 아이콘 제거)
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
  {member.first_visit ? formatDate(member.first_visit) : '-'}
</td>

// 최근 방문 - 시계 아이콘 제거
<td className="px-6 py-4 whitespace-nowrap">
  {renderLastVisit(member.last_visit)}
</td>
```

### 4. 정렬 함수 업데이트
**파일:** `src/utils/consultationUtils.ts`

```typescript
export const sortMembers = (
  members: ConsultationMember[],
  sort: ConsultationTableSort
): ConsultationMember[] => {
  const sortedMembers = [...members];
  
  sortedMembers.sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sort.field) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'birth_date': // ✅ 추가
        aValue = a.birth_date || 0;
        bValue = b.birth_date || 0;
        break;
      case 'first_visit': // ✅ 추가
        aValue = a.first_visit || 0;
        bValue = b.first_visit || 0;
        break;
      case 'last_visit':
        aValue = a.last_visit || 0;
        bValue = b.last_visit || 0;
        break;
      case 'consultation_status':
        aValue = a.consultation_status || '';
        bValue = b.consultation_status || '';
        break;
      default:
        return 0;
    }
    // ... 정렬 로직
  });
  
  return sortedMembers;
};
```

### 5. 더미 데이터 업데이트
**파일:** `src/pages/ConsultationDashboard.tsx`

- 모든 더미 회원 데이터에 `first_visit` 필드 추가
- 초기 정렬 기준을 `last_visit`으로 변경

```typescript
const [sort, setSort] = useState<ConsultationTableSort>({
  field: 'last_visit', // ✅ join_date에서 last_visit으로 변경
  direction: 'desc'
});

// 더미 데이터에 first_visit 필드 추가
const dummyMembers: ConsultationMember[] = [
  {
    // ... 기존 필드들
    first_visit: Math.floor(new Date('2024-01-16').getTime() / 1000), // ✅ 추가
    // ... 나머지 필드들
  },
  // ... 다른 회원 데이터들
];
```

## 🎯 결과

### Before (수정 전)
| 회원명 📱 | 연락처 📞 | 성별 | 회원권 | 상담상태 | 담당자 | 가입일 📅 | 최근방문 🕐 | 작업 |

### After (수정 후)
| 회원명 | 연락처 | 성별 | 생년월일 | 상담상태 | 담당자 | 최초방문일 | 최근방문 | 작업 |

## ✅ 체크리스트

- [x] 회원명/전화번호 앞 아이콘 제거
- [x] 회원권 컬럼 제거
- [x] 생년월일 컬럼 추가
- [x] 가입일 컬럼 제거  
- [x] 최초 방문일 컬럼 추가
- [x] 타입 정의 업데이트
- [x] 정렬 함수 업데이트
- [x] 더미 데이터 업데이트
- [x] 테이블 렌더링 로직 수정

## 🐛 해결된 이슈

### 타입 오류 해결
**문제:** `Property 'first_visit' does not exist on type 'ConsultationMember'`

**해결방법:**
1. `ConsultationMember` 타입에 `first_visit?: number` 필드 추가
2. `ConsultationTableSort` 타입에 새로운 정렬 필드들 추가
3. 정렬 함수에 새로운 케이스 추가

## 📝 추가 고려사항

1. **데이터 마이그레이션**: 실제 데이터베이스에 `first_visit` 컬럼 추가 필요
2. **API 업데이트**: 백엔드 API에서 새로운 필드 지원 필요
3. **포맷팅**: 생년월일과 최초 방문일의 날짜 포맷은 기존 `formatDate` 함수 활용
4. **정렬 기본값**: 최근 방문일 기준 내림차순으로 변경

## 🔄 향후 개선 사항

- 최초 방문일 자동 계산 로직 추가
- 생년월일 기반 나이 표시 옵션 검토
- 테이블 컬럼 커스터마이징 기능 추가 검토 