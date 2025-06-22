import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaymentSearchFilter from '../../../components/payment/PaymentSearchFilter';
import { PaymentFilter } from '../../../utils/paymentUtils';

const mockFilter: PaymentFilter = {
  search: '',
  status: 'all',
  membershipType: 'all',
  paymentMethod: 'all',
  staffName: 'all',
  startDate: '',
  endDate: '',
  minAmount: null,
  maxAmount: null,
};

const mockOnFilterChange = jest.fn();
const mockOnReset = jest.fn();
const mockOnAddPayment = jest.fn();
const mockOnAddMembershipType = jest.fn();

const mockMembershipTypes = ['1개월권', '3개월권', '6개월권'];
const mockStaffList = [
  { id: 1, name: '김트레이너', position: '트레이너' },
  { id: 2, name: '이매니저', position: '매니저' },
];

// 컴팩트 레이아웃 테스트용 props
const mockCompactProps = {
  filter: mockFilter,
  onFilterChange: mockOnFilterChange,
  onReset: mockOnReset,
  membershipTypes: ['월 이용권', '년 이용권'],
  staffList: [
    { id: 1, name: '김코치', position: '트레이너' },
    { id: 2, name: '이매니저', position: '매니저' },
  ],
};

// 액션 버튼 테스트용 props
const mockActionProps = {
  ...mockCompactProps,
  showActionButtons: true,
  onAddPayment: mockOnAddPayment,
  onAddMembershipType: mockOnAddMembershipType,
  showToast: jest.fn(),
  payments: [],
  onImportSuccess: jest.fn(),
};

describe('PaymentSearchFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('기본 필터 요소들이 렌더링되어야 한다', () => {
      render(
        <PaymentSearchFilter
          filter={mockFilter}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          membershipTypes={mockMembershipTypes}
          staffList={mockStaffList}
        />
      );
      
      expect(screen.getByLabelText('검색')).toBeInTheDocument();
      expect(screen.getByLabelText('결제 상태')).toBeInTheDocument();
      expect(screen.getByLabelText('이용권 종류')).toBeInTheDocument();
      expect(screen.getByLabelText('결제 방법')).toBeInTheDocument();
      expect(screen.getByLabelText('담당자')).toBeInTheDocument();
    });

    it('검색 입력 시 onFilterChange가 호출되어야 한다', () => {
      render(
        <PaymentSearchFilter
          filter={mockFilter}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          membershipTypes={mockMembershipTypes}
          staffList={mockStaffList}
        />
      );
      
      const searchInput = screen.getByPlaceholderText('회원명 또는 영수증 번호로 검색...');
      fireEvent.change(searchInput, { target: { value: '홍길동' } });
      
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        ...mockFilter,
        search: '홍길동',
      });
    });

    it('필터 초기화 버튼이 정상 작동해야 한다', () => {
      render(
        <PaymentSearchFilter
          filter={mockFilter}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          membershipTypes={mockMembershipTypes}
          staffList={mockStaffList}
        />
      );
    });
  });

  describe('컴팩트 레이아웃', () => {
    it('컴팩트 레이아웃 구조가 올바르게 렌더링되어야 한다', () => {
      render(<PaymentSearchFilter {...mockCompactProps} />);
      
      expect(screen.getByText('결제 검색 및 필터')).toBeInTheDocument();
      expect(screen.getByTestId('payment-search-filter-container')).toHaveClass(
        'sticky', 'top-4', 'z-20'
      );
    });

    it('활성 필터 개수가 올바르게 표시되어야 한다', () => {
      const filterWithActive: PaymentFilter = {
        ...mockFilter,
        search: '김회원',
        status: '완료',
        startDate: '2024-01-01',
      };
      
      render(<PaymentSearchFilter {...mockCompactProps} filter={filterWithActive} />);
      
      expect(screen.getByText('3개 필터 적용됨')).toBeInTheDocument();
    });

    it('활성 필터가 있을 때 초기화 버튼이 표시되어야 한다', () => {
      const filterWithActive: PaymentFilter = {
        ...mockFilter,
        search: '검색어',
      };
      
      render(<PaymentSearchFilter {...mockCompactProps} filter={filterWithActive} />);
      
      expect(screen.getByText('초기화')).toBeInTheDocument();
    });

    it('초기화 버튼 클릭 시 onReset이 호출되어야 한다', () => {
      const filterWithActive: PaymentFilter = {
        ...mockFilter,
        search: '검색어',
      };
      
      render(<PaymentSearchFilter {...mockCompactProps} filter={filterWithActive} />);
      
      fireEvent.click(screen.getByText('초기화'));
      expect(mockCompactProps.onReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('컴팩트 그리드 레이아웃', () => {
    it('필터 필드들이 컴팩트 그리드로 배치되어야 한다', () => {
      render(<PaymentSearchFilter {...mockCompactProps} />);
      
      // 첫 번째 행: 기본 필터들
      expect(screen.getByLabelText('검색')).toBeInTheDocument();
      expect(screen.getByLabelText('결제 상태')).toBeInTheDocument();
      expect(screen.getByLabelText('이용권 종류')).toBeInTheDocument();
      expect(screen.getByLabelText('결제 방법')).toBeInTheDocument();
      
      // 두 번째 행: 날짜/금액 범위
      expect(screen.getByText('결제 날짜 범위')).toBeInTheDocument();
      expect(screen.getByText('결제 금액 범위')).toBeInTheDocument();
      
      // 세 번째 행: 담당자
      expect(screen.getByLabelText('담당자')).toBeInTheDocument();
    });

    it('검색 입력 필드가 컴팩트 스타일로 렌더링되어야 한다', () => {
      render(<PaymentSearchFilter {...mockCompactProps} />);
      
      const searchInput = screen.getByPlaceholderText('회원명 또는 영수증 번호로 검색...');
      expect(searchInput).toHaveClass('text-sm', 'py-1.5');
    });
  });

  describe('날짜/금액 범위 섹션', () => {
    it('날짜 범위 프리셋 버튼들이 컴팩트하게 표시되어야 한다', () => {
      render(<PaymentSearchFilter {...mockCompactProps} />);
      
      expect(screen.getByText('오늘')).toBeInTheDocument();
      expect(screen.getByText('이번 주')).toBeInTheDocument();
      expect(screen.getByText('이번 달')).toBeInTheDocument();
    });

    it('금액 범위 프리셋 버튼들이 컴팩트하게 표시되어야 한다', () => {
      render(<PaymentSearchFilter {...mockCompactProps} />);
      
      expect(screen.getByText('~50만원')).toBeInTheDocument();
      expect(screen.getByText('50~100만원')).toBeInTheDocument();
      expect(screen.getByText('100만원~')).toBeInTheDocument();
    });
  });

  describe('반응형 레이아웃', () => {
    it('필터 컨테이너가 반응형 그리드 클래스를 가져야 한다', () => {
      const { container } = render(<PaymentSearchFilter {...mockCompactProps} />);
      
      const gridElements = container.querySelectorAll('.grid');
      expect(gridElements.length).toBeGreaterThan(0);
      
      // 반응형 그리드 클래스 확인
      const hasResponsiveGrid = Array.from(gridElements).some(el => 
        el.className.includes('md:grid-cols') || el.className.includes('lg:grid-cols')
      );
      expect(hasResponsiveGrid).toBe(true);
    });
  });

  describe('필터 상태 관리', () => {
    it('검색 필터 변경 시 onFilterChange가 호출되어야 한다', () => {
      render(<PaymentSearchFilter {...mockCompactProps} />);
      
      const searchInput = screen.getByPlaceholderText('회원명 또는 영수증 번호로 검색...');
      fireEvent.change(searchInput, { target: { value: '김회원' } });
      
      expect(mockCompactProps.onFilterChange).toHaveBeenCalledWith({
        ...mockFilter,
        search: '김회원',
      });
    });

    it('날짜 프리셋 버튼 클릭 시 필터가 업데이트되어야 한다', () => {
      render(<PaymentSearchFilter {...mockCompactProps} />);
      
      fireEvent.click(screen.getByText('오늘'));
      
      expect(mockCompactProps.onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: expect.any(String),
          endDate: expect.any(String),
        })
      );
    });

    it('금액 프리셋 버튼 클릭 시 필터가 업데이트되어야 한다', () => {
      render(<PaymentSearchFilter {...mockCompactProps} />);
      
      fireEvent.click(screen.getByText('~50만원'));
      
      expect(mockCompactProps.onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({
          minAmount: 0,
          maxAmount: 500000,
        })
      );
    });
  });

  describe('활성 필터 계산', () => {
    it('빈 필터일 때 활성 필터 개수가 0이어야 한다', () => {
      render(<PaymentSearchFilter {...mockCompactProps} />);
      
      expect(screen.queryByText(/개 필터 적용됨/)).not.toBeInTheDocument();
    });

    it('복합 필터 적용 시 정확한 개수가 표시되어야 한다', () => {
      const complexFilter: PaymentFilter = {
        ...mockFilter,
        search: '검색어',
        status: '완료',
        membershipType: '월 이용권',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        minAmount: 100000,
      };
      
      render(<PaymentSearchFilter {...mockCompactProps} filter={complexFilter} />);
      
      expect(screen.getByText('6개 필터 적용됨')).toBeInTheDocument();
    });
  });

  describe('액션 버튼 기능', () => {
    it('showActionButtons가 true일 때 액션 버튼들이 표시되어야 한다', () => {
      render(<PaymentSearchFilter {...mockActionProps} />);
      
      expect(screen.getByText('새 결제 등록')).toBeInTheDocument();
      expect(screen.getByText('새 이용권 등록')).toBeInTheDocument();
    });

    it('showActionButtons가 false일 때 액션 버튼들이 숨겨져야 한다', () => {
      render(<PaymentSearchFilter {...mockCompactProps} showActionButtons={false} />);
      
      expect(screen.queryByText('새 결제 등록')).not.toBeInTheDocument();
      expect(screen.queryByText('새 이용권 등록')).not.toBeInTheDocument();
    });

    it('새 결제 등록 버튼 클릭 시 onAddPayment가 호출되어야 한다', () => {
      render(<PaymentSearchFilter {...mockActionProps} />);
      
      const addPaymentButton = screen.getByText('새 결제 등록');
      fireEvent.click(addPaymentButton);
      
      expect(mockOnAddPayment).toHaveBeenCalledTimes(1);
    });

    it('새 이용권 등록 버튼 클릭 시 onAddMembershipType이 호출되어야 한다', () => {
      render(<PaymentSearchFilter {...mockActionProps} />);
      
      const addMembershipButton = screen.getByText('새 이용권 등록');
      fireEvent.click(addMembershipButton);
      
      expect(mockOnAddMembershipType).toHaveBeenCalledTimes(1);
    });

    it('버튼들이 컴팩트 스타일로 렌더링되어야 한다', () => {
      render(<PaymentSearchFilter {...mockActionProps} />);
      
      const addPaymentButton = screen.getByText('새 결제 등록');
      const addMembershipButton = screen.getByText('새 이용권 등록');
      
      // 컴팩트 스타일 클래스 확인
      expect(addPaymentButton).toHaveClass('text-sm', 'py-1.5', 'px-3');
      expect(addMembershipButton).toHaveClass('text-sm', 'py-1.5', 'px-3');
    });

    it('액션 버튼들이 헤더 오른쪽에 올바르게 배치되어야 한다', () => {
      render(<PaymentSearchFilter {...mockActionProps} />);
      
      const actionContainer = screen.getByText('새 결제 등록').closest('div');
      expect(actionContainer).toHaveClass('flex', 'items-center', 'gap-2');
    });

    it('엑셀 버튼들도 함께 표시되어야 한다', () => {
      render(<PaymentSearchFilter {...mockActionProps} />);
      
      expect(screen.getByTitle('엑셀 불러오기')).toBeInTheDocument();
      expect(screen.getByTitle('엑셀 내보내기')).toBeInTheDocument();
      expect(screen.getByTitle('엑셀 형식 안내')).toBeInTheDocument();
    });
  });
}); 