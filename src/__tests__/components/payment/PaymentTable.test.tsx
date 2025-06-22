import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PaymentTable from '../../../components/payment/PaymentTable';
import { Payment, MembershipType } from '../../../models/types';

const mockPayments: Payment[] = [
  {
    id: 1,
    memberId: 1,
    memberName: '홍길동',
    amount: 100000,
    paymentDate: '2024-01-15',
    paymentType: '카드',
    membershipType: '일반회원권',
    status: '완료',
    staffName: '김직원',
    notes: '테스트 결제'
  },
  {
    id: 2,
    memberId: 2,
    memberName: '김영희',
    amount: 150000,
    paymentDate: '2024-01-20',
    paymentType: '현금',
    membershipType: '프리미엄회원권',
    status: '취소',
    staffName: '박직원',
    notes: '테스트 결제 2'
  }
];

const mockMembershipTypes: MembershipType[] = [
  {
    id: 1,
    name: '일반회원권',
    price: 100000,
    durationMonths: 1,
    isActive: true
  }
];

const mockProps = {
  payments: mockPayments,
  membershipTypes: mockMembershipTypes,
  sortConfig: { key: 'paymentDate', direction: 'descending' as const },
  requestSort: jest.fn(),
  formatDate: (date: string | undefined | null) => date || '-',
  formatCurrency: (amount: number) => amount.toLocaleString(),
  onViewPayment: jest.fn(),
  onEditPayment: jest.fn(),
  onDeletePayment: jest.fn(),
};

describe('PaymentTable - 컴팩트 레이아웃', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('컴팩트 테이블이 렌더링되어야 한다', () => {
      render(<PaymentTable {...mockProps} />);
      
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('회원명')).toBeInTheDocument();
      expect(screen.getByText('결제일')).toBeInTheDocument();
      expect(screen.getByText('이용권')).toBeInTheDocument();
      expect(screen.getByText('결제 방법')).toBeInTheDocument();
      expect(screen.getByText('금액')).toBeInTheDocument();
      expect(screen.getByText('상태')).toBeInTheDocument();
      expect(screen.getByText('담당 직원')).toBeInTheDocument();
      expect(screen.getByText('작업')).toBeInTheDocument();
    });

    it('결제 데이터가 표시되어야 한다', () => {
      render(<PaymentTable {...mockProps} />);
      
      expect(screen.getByText('홍길동')).toBeInTheDocument();
      expect(screen.getByText('김영희')).toBeInTheDocument();
      expect(screen.getByText('2024-01-15')).toBeInTheDocument();
      expect(screen.getByText('2024-01-20')).toBeInTheDocument();
      expect(screen.getByText(/100,000/)).toBeInTheDocument(); // ₩ 기호 포함된 텍스트 매칭
      expect(screen.getByText(/150,000/)).toBeInTheDocument(); // ₩ 기호 포함된 텍스트 매칭
    });

    it('빈 데이터일 때 null을 반환해야 한다', () => {
      const { container } = render(<PaymentTable {...mockProps} payments={[]} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('컴팩트 스타일 적용', () => {
    it('헤더 셀이 컴팩트 패딩을 사용해야 한다', () => {
      render(<PaymentTable {...mockProps} />);
      
      const headerCells = screen.getAllByRole('columnheader');
      headerCells.forEach(cell => {
        expect(cell).toHaveClass('px-4', 'py-2');
      });
    });

    it('데이터 셀이 컴팩트 패딩을 사용해야 한다', () => {
      render(<PaymentTable {...mockProps} />);
      
      const dataCells = screen.getAllByRole('cell');
      dataCells.forEach(cell => {
        expect(cell).toHaveClass('px-4', 'py-2');
      });
    });

    it('텍스트 크기가 sm이어야 한다', () => {
      render(<PaymentTable {...mockProps} />);
      
      const table = screen.getByRole('table');
      expect(table).toHaveClass('text-sm');
    });

    it('아이콘 크기가 14px이어야 한다', () => {
      render(<PaymentTable {...mockProps} />);
      
      // 정렬 아이콘 체크 (ChevronDown)
      const sortIcon = document.querySelector('svg');
      expect(sortIcon).toHaveAttribute('width', '14');
      expect(sortIcon).toHaveAttribute('height', '14');
    });
  });

  describe('상태 배지 스타일', () => {
    it('완료 상태가 올바른 스타일을 가져야 한다', () => {
      render(<PaymentTable {...mockProps} />);
      
      const completedBadge = screen.getByText('완료');
      expect(completedBadge).toHaveClass('bg-green-100', 'text-green-800', 'text-xs');
    });

    it('취소 상태가 올바른 스타일을 가져야 한다', () => {
      render(<PaymentTable {...mockProps} />);
      
      const cancelledBadge = screen.getByText('취소');
      expect(cancelledBadge).toHaveClass('bg-yellow-100', 'text-yellow-800', 'text-xs');
    });
  });

  describe('액션 버튼', () => {
    it('hover 시 액션 버튼이 표시되어야 한다', () => {
      render(<PaymentTable {...mockProps} />);
      
      const rows = screen.getAllByRole('row');
      const dataRow = rows[1]; // 첫 번째 데이터 행
      
      fireEvent.mouseEnter(dataRow);
      
      const actionButtons = document.querySelectorAll('[title="상세보기"], [title="수정"], [title="삭제"]');
      expect(actionButtons).toHaveLength(6); // 2행 × 3버튼
    });

    it('액션 버튼이 올바른 크기를 가져야 한다', () => {
      render(<PaymentTable {...mockProps} />);
      
      const rows = screen.getAllByRole('row');
      const dataRow = rows[1];
      
      fireEvent.mouseEnter(dataRow);
      
      const actionIcons = document.querySelectorAll('[title="상세보기"] svg, [title="수정"] svg, [title="삭제"] svg');
      actionIcons.forEach(icon => {
        expect(icon).toHaveAttribute('width', '16');
        expect(icon).toHaveAttribute('height', '16');
      });
    });
  });

  describe('정렬 기능', () => {
    it('컬럼 클릭 시 정렬 함수가 호출되어야 한다', () => {
      render(<PaymentTable {...mockProps} />);
      
      const memberNameHeader = screen.getByText('회원명').closest('th');
      fireEvent.click(memberNameHeader!);
      
      expect(mockProps.requestSort).toHaveBeenCalledWith('memberName');
    });

    it('정렬 아이콘이 올바르게 표시되어야 한다', () => {
      render(<PaymentTable {...mockProps} />);
      
      // paymentDate로 내림차순 정렬 상태
      const paymentDateHeader = screen.getByText('결제일').closest('th');
      const sortIcon = paymentDateHeader?.querySelector('svg');
      
      expect(sortIcon).toHaveClass('text-blue-500');
    });
  });

  describe('반응형 레이아웃', () => {
    it('테이블이 오버플로우 스크롤을 지원해야 한다', () => {
      render(<PaymentTable {...mockProps} />);
      
      const tableContainer = document.querySelector('.overflow-x-auto');
      expect(tableContainer).toBeInTheDocument();
      expect(tableContainer).toHaveStyle({ minWidth: '600px' });
    });

    it('최대 높이가 설정되어야 한다', () => {
      render(<PaymentTable {...mockProps} />);
      
      const tableContainer = document.querySelector('.overflow-x-auto');
      expect(tableContainer).toHaveStyle({ maxHeight: 'calc(100vh - 350px)' });
    });
  });

  describe('이벤트 처리', () => {
    it('행 클릭 시 상세보기가 호출되어야 한다', () => {
      render(<PaymentTable {...mockProps} />);
      
      const rows = screen.getAllByRole('row');
      const dataRow = rows[1]; // 첫 번째 데이터 행
      
      fireEvent.click(dataRow);
      
      expect(mockProps.onViewPayment).toHaveBeenCalledWith(mockPayments[0]);
    });

    it('수정 버튼 클릭 시 수정 함수가 호출되어야 한다', () => {
      render(<PaymentTable {...mockProps} />);
      
      const rows = screen.getAllByRole('row');
      const dataRow = rows[1];
      
      fireEvent.mouseEnter(dataRow);
      
      const editButton = screen.getAllByTitle('수정')[0];
      fireEvent.click(editButton);
      
      expect(mockProps.onEditPayment).toHaveBeenCalledWith(mockPayments[0]);
    });

    it('삭제 버튼 클릭 시 확인창이 표시되어야 한다', () => {
      // window.confirm 모킹
      const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
      
      render(<PaymentTable {...mockProps} />);
      
      const rows = screen.getAllByRole('row');
      const dataRow = rows[1];
      
      fireEvent.mouseEnter(dataRow);
      
      const deleteButton = screen.getAllByTitle('삭제')[0];
      fireEvent.click(deleteButton);
      
      expect(mockConfirm).toHaveBeenCalledWith('이 결제 기록을 삭제하시겠습니까?');
      expect(mockProps.onDeletePayment).toHaveBeenCalledWith(1);
      
      mockConfirm.mockRestore();
    });
  });
}); 