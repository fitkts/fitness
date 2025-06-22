import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MembershipTypeList from '../../../components/payment/MembershipTypeList';
import { MembershipType } from '../../../models/types';

const mockMembershipTypes: MembershipType[] = [
  {
    id: 1,
    name: '일반회원권',
    price: 100000,
    durationMonths: 1,
    maxUses: null,
    isActive: true,
    description: '기본 회원권입니다'
  },
  {
    id: 2,
    name: '프리미엄회원권',
    price: 200000,
    durationMonths: 3,
    maxUses: 20,
    isActive: true,
    description: '프리미엄 회원권입니다'
  },
  {
    id: 3,
    name: '비활성회원권',
    price: 50000,
    durationMonths: 1,
    maxUses: 10,
    isActive: false,
    description: '비활성화된 회원권입니다'
  }
];

const mockProps = {
  membershipTypes: mockMembershipTypes,
  onViewType: jest.fn(),
  onEditType: jest.fn(),
  onDeleteType: jest.fn(),
  sortConfig: { key: 'name', direction: 'ascending' as const },
  requestSort: jest.fn(),
  formatCurrency: (value: number | undefined | null) => value ? value.toLocaleString() : '0',
};

describe('MembershipTypeList - 컴팩트 레이아웃', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('컴팩트 테이블이 렌더링되어야 한다', () => {
      render(<MembershipTypeList {...mockProps} />);
      
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('이용권 이름')).toBeInTheDocument();
      expect(screen.getByText('가격(원)')).toBeInTheDocument();
      expect(screen.getByText('기간(개월)')).toBeInTheDocument();
      expect(screen.getByText('최대횟수')).toBeInTheDocument();
      expect(screen.getByText('활성상태')).toBeInTheDocument();
      expect(screen.getByText('작업')).toBeInTheDocument();
    });

    it('이용권 데이터가 표시되어야 한다', () => {
      render(<MembershipTypeList {...mockProps} />);
      
      expect(screen.getByText('일반회원권')).toBeInTheDocument();
      expect(screen.getByText('프리미엄회원권')).toBeInTheDocument();
      expect(screen.getByText('비활성회원권')).toBeInTheDocument();
      expect(screen.getByText('100,000')).toBeInTheDocument();
      expect(screen.getByText('200,000')).toBeInTheDocument();
      expect(screen.getByText('50,000')).toBeInTheDocument();
    });

    it('빈 데이터일 때 null을 반환해야 한다', () => {
      const { container } = render(<MembershipTypeList {...mockProps} membershipTypes={[]} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('컴팩트 스타일 적용', () => {
    it('헤더 셀이 컴팩트 패딩을 사용해야 한다', () => {
      render(<MembershipTypeList {...mockProps} />);
      
      const headerCells = screen.getAllByRole('columnheader');
      headerCells.forEach(cell => {
        expect(cell).toHaveClass('px-4', 'py-2');
      });
    });

    it('데이터 셀이 컴팩트 패딩을 사용해야 한다', () => {
      render(<MembershipTypeList {...mockProps} />);
      
      const dataCells = screen.getAllByRole('cell');
      dataCells.forEach(cell => {
        expect(cell).toHaveClass('px-4', 'py-2');
      });
    });

    it('텍스트 크기가 sm이어야 한다', () => {
      render(<MembershipTypeList {...mockProps} />);
      
      const table = screen.getByRole('table');
      expect(table).toHaveClass('text-sm');
    });

    it('아이콘 크기가 14px이어야 한다', () => {
      render(<MembershipTypeList {...mockProps} />);
      
      // 정렬 아이콘 체크 (ChevronUp)
      const sortIcon = document.querySelector('svg');
      expect(sortIcon).toHaveAttribute('width', '14');
      expect(sortIcon).toHaveAttribute('height', '14');
    });
  });

  describe('데이터 표시', () => {
    it('이용권 설명이 표시되어야 한다', () => {
      render(<MembershipTypeList {...mockProps} />);
      
      expect(screen.getByText('기본 회원권입니다')).toBeInTheDocument();
      expect(screen.getByText('프리미엄 회원권입니다')).toBeInTheDocument();
    });

    it('기간이 올바르게 표시되어야 한다', () => {
      render(<MembershipTypeList {...mockProps} />);
      
      const durations = screen.getAllByText(/1개월/);
      expect(durations.length).toBeGreaterThan(0); // 1개월이 표시되는지 확인
      expect(screen.getByText(/3개월/)).toBeInTheDocument();
    });

    it('최대횟수가 올바르게 표시되어야 한다', () => {
      render(<MembershipTypeList {...mockProps} />);
      
      expect(screen.getByText('-')).toBeInTheDocument(); // maxUses가 null인 경우
      expect(screen.getByText('20회')).toBeInTheDocument();
      expect(screen.getByText('10회')).toBeInTheDocument();
    });

    it('활성 상태 아이콘이 올바르게 표시되어야 한다', () => {
      render(<MembershipTypeList {...mockProps} />);
      
      // CheckCircle 아이콘 (활성 상태)만 체크
      const activeIcons = document.querySelectorAll('.lucide-check-circle.text-green-500');
      // XCircle 아이콘 (비활성 상태)만 체크  
      const inactiveIcons = document.querySelectorAll('.lucide-xcircle.text-red-500');
      
      expect(activeIcons).toHaveLength(2); // 2개의 활성 이용권
      expect(inactiveIcons).toHaveLength(1); // 1개의 비활성 이용권
    });
  });

  describe('정렬 기능', () => {
    it('컬럼 클릭 시 정렬 함수가 호출되어야 한다', () => {
      render(<MembershipTypeList {...mockProps} />);
      
      const nameHeader = screen.getByText('이용권 이름').closest('th');
      fireEvent.click(nameHeader!);
      
      expect(mockProps.requestSort).toHaveBeenCalledWith('name');
    });

    it('정렬 아이콘이 올바르게 표시되어야 한다', () => {
      render(<MembershipTypeList {...mockProps} />);
      
      // name으로 오름차순 정렬 상태
      const nameHeader = screen.getByText('이용권 이름').closest('th');
      const sortIcon = nameHeader?.querySelector('svg');
      
      expect(sortIcon).toHaveClass('text-blue-500');
    });

    it('가격 컬럼이 정렬 가능해야 한다', () => {
      render(<MembershipTypeList {...mockProps} />);
      
      const priceHeader = screen.getByText('가격(원)').closest('th');
      fireEvent.click(priceHeader!);
      
      expect(mockProps.requestSort).toHaveBeenCalledWith('price');
    });
  });

  describe('액션 버튼', () => {
    it('hover 시 액션 버튼이 표시되어야 한다', () => {
      render(<MembershipTypeList {...mockProps} />);
      
      const rows = screen.getAllByRole('row');
      const dataRow = rows[1]; // 첫 번째 데이터 행
      
      fireEvent.mouseEnter(dataRow);
      
      const actionButtons = document.querySelectorAll('[title="상세보기"], [title="수정"], [title="삭제"]');
      expect(actionButtons).toHaveLength(9); // 3행 × 3버튼
    });

    it('액션 버튼이 올바른 크기를 가져야 한다', () => {
      render(<MembershipTypeList {...mockProps} />);
      
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

  describe('테이블 래퍼', () => {
    it('컴팩트 래퍼 컨테이너가 적용되어야 한다', () => {
      render(<MembershipTypeList {...mockProps} />);
      
      const wrapper = document.querySelector('.bg-white.rounded-lg.shadow-sm');
      expect(wrapper).toBeInTheDocument();
    });

    it('오버플로우 스크롤이 지원되어야 한다', () => {
      render(<MembershipTypeList {...mockProps} />);
      
      const scrollContainer = document.querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();
    });
  });

  describe('이벤트 처리', () => {
    it('행 클릭 시 상세보기가 호출되어야 한다', () => {
      render(<MembershipTypeList {...mockProps} />);
      
      const rows = screen.getAllByRole('row');
      const dataRow = rows[1]; // 첫 번째 데이터 행
      
      fireEvent.click(dataRow);
      
      expect(mockProps.onViewType).toHaveBeenCalledWith(mockMembershipTypes[0]);
    });

    it('수정 버튼 클릭 시 수정 함수가 호출되어야 한다', () => {
      render(<MembershipTypeList {...mockProps} />);
      
      const rows = screen.getAllByRole('row');
      const dataRow = rows[1];
      
      fireEvent.mouseEnter(dataRow);
      
      const editButton = screen.getAllByTitle('수정')[0];
      fireEvent.click(editButton);
      
      expect(mockProps.onEditType).toHaveBeenCalledWith(mockMembershipTypes[0]);
    });

    it('삭제 버튼 클릭 시 확인창이 표시되어야 한다', () => {
      // window.confirm 모킹
      const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
      
      render(<MembershipTypeList {...mockProps} />);
      
      const rows = screen.getAllByRole('row');
      const dataRow = rows[1];
      
      fireEvent.mouseEnter(dataRow);
      
      const deleteButton = screen.getAllByTitle('삭제')[0];
      fireEvent.click(deleteButton);
      
      expect(mockConfirm).toHaveBeenCalledWith('이 이용권을 삭제하시겠습니까? 관련된 결제 내역에 영향을 줄 수 있습니다.');
      expect(mockProps.onDeleteType).toHaveBeenCalledWith(1);
      
      mockConfirm.mockRestore();
    });
  });
}); 