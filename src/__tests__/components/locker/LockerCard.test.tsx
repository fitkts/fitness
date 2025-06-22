import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LockerCard from '../../../components/locker/LockerCard';
import { Locker, LockerSize } from '../../../models/types';

const mockAvailableLocker: Locker = {
  id: 1,
  number: '001',
  status: 'available',
  size: LockerSize.MEDIUM,
  location: '1층 A구역',
  memberName: null,
  startDate: null,
  endDate: null,
  notes: ''
};

const mockOccupiedLocker: Locker = {
  id: 2,
  number: '002',
  status: 'occupied',
  size: LockerSize.LARGE,
  location: '2층 B구역',
  memberName: '홍길동',
  memberId: 1,
  startDate: '2024-01-01',
  endDate: '2024-03-31',
  notes: '정기 점검 필요'
};

const mockExpiredLocker: Locker = {
  id: 3,
  number: '003',
  status: 'occupied',
  size: LockerSize.SMALL,
  location: '1층 C구역',
  memberName: '김영희',
  memberId: 2,
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  notes: ''
};

const mockProps = {
  onAction: jest.fn(),
};

describe('LockerCard - 컴팩트 레이아웃', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('컴팩트 카드 컨테이너가 렌더링되어야 한다', () => {
      render(<LockerCard locker={mockAvailableLocker} {...mockProps} />);
      
      const cardContainer = document.querySelector('.p-1\\.5.rounded-md.shadow-sm.border');
      expect(cardContainer).toHaveClass('p-1.5', 'rounded-md', 'shadow-sm'); // 컴팩트 컨테이너
    });

    it('락커 번호가 컴팩트 크기로 표시되어야 한다', () => {
      render(<LockerCard locker={mockAvailableLocker} {...mockProps} />);
      
      const lockerNumber = screen.getByText('#001');
      expect(lockerNumber).toHaveClass('text-xs', 'font-semibold'); // 컴팩트 제목 크기
    });

    it('상태가 컴팩트 크기로 표시되어야 한다', () => {
      render(<LockerCard locker={mockAvailableLocker} {...mockProps} />);
      
      const status = screen.getByText('사용 가능');
      expect(status).toHaveClass('text-xs', 'font-medium'); // 컴팩트 상태 크기
    });

    it('사용 가능한 락커의 스타일이 올바르게 적용되어야 한다', () => {
      render(<LockerCard locker={mockAvailableLocker} {...mockProps} />);
      
      const cardContainer = document.querySelector('.bg-green-50.border-green-200');
      expect(cardContainer).toHaveClass('bg-green-50', 'border-green-200');
    });
  });

  describe('컴팩트 스타일 적용', () => {
    it('헤더 영역이 컴팩트 간격을 사용해야 한다', () => {
      render(<LockerCard locker={mockAvailableLocker} {...mockProps} />);
      
      const headerContainer = screen.getByText('#001').closest('.flex');
      expect(headerContainer).toHaveClass('flex', 'items-start', 'justify-between');
    });

    it('액션 버튼들이 컴팩트 크기를 가져야 한다', () => {
      render(<LockerCard locker={mockAvailableLocker} {...mockProps} />);
      
      const actionButtons = screen.getByTitle('상세 보기').closest('.flex');
      expect(actionButtons).toHaveClass('gap-0.5'); // 컴팩트 버튼 간격
    });

    it('액션 버튼 아이콘이 컴팩트 크기를 가져야 한다', () => {
      render(<LockerCard locker={mockAvailableLocker} {...mockProps} />);
      
      const viewButton = screen.getByTitle('상세 보기');
      const editButton = screen.getByTitle('수정');
      const deleteButton = screen.getByTitle('삭제');
      
      // 아이콘 크기는 SVG 속성으로 확인
      const viewIcon = viewButton.querySelector('svg');
      const editIcon = editButton.querySelector('svg');
      const deleteIcon = deleteButton.querySelector('svg');
      
      expect(viewIcon).toHaveAttribute('width', '10'); // 컴팩트 아이콘 크기
      expect(editIcon).toHaveAttribute('width', '10');
      expect(deleteIcon).toHaveAttribute('width', '10');
    });

    it('사용자 정보 영역이 컴팩트 간격을 사용해야 한다', () => {
      render(<LockerCard locker={mockOccupiedLocker} {...mockProps} />);
      
      const memberInfo = screen.getByText('사용자:');
      const memberContainer = memberInfo.closest('div');
      expect(memberContainer).toHaveClass('mt-1', 'pt-1'); // 컴팩트 컨텐츠 간격
    });

    it('텍스트가 컴팩트 크기를 사용해야 한다', () => {
      render(<LockerCard locker={mockOccupiedLocker} {...mockProps} />);
      
      const memberInfoElement = screen.getByText(/사용자:/).closest('p');
      expect(memberInfoElement).toHaveClass('text-xs'); // 컴팩트 텍스트 크기
    });
  });

  describe('사용 중 락커 정보', () => {
    it('사용자 이름이 표시되어야 한다', () => {
      render(<LockerCard locker={mockOccupiedLocker} {...mockProps} />);
      
      expect(screen.getByText('홍길동')).toBeInTheDocument();
    });

    it('사용 기간이 컴팩트 형식으로 표시되어야 한다', () => {
      render(<LockerCard locker={mockOccupiedLocker} {...mockProps} />);
      
      expect(screen.getByText('01/01 ~ 03/31')).toBeInTheDocument();
    });

    it('만료 정보가 컴팩트 스타일로 표시되어야 한다', () => {
      render(<LockerCard locker={mockOccupiedLocker} {...mockProps} />);
      
      const expiryInfo = screen.getByText(/일 남음|일 초과/);
      const expiryContainer = expiryInfo.closest('.flex');
      expect(expiryContainer).toHaveClass('flex', 'items-center', 'mt-0.5');
      
      const clockIcon = expiryContainer?.querySelector('svg');
      expect(clockIcon).toHaveAttribute('width', '8'); // 컴팩트 만료 아이콘 크기
    });

    it('만료된 락커는 빨간색으로 표시되어야 한다', () => {
      render(<LockerCard locker={mockExpiredLocker} {...mockProps} />);
      
      const expiryInfo = screen.getByText(/일 초과/);
      expect(expiryInfo).toHaveClass('text-red-600', 'font-medium');
    });
  });

  describe('비고 정보', () => {
    it('비고가 있을 때 컴팩트 스타일로 표시되어야 한다', () => {
      render(<LockerCard locker={mockOccupiedLocker} {...mockProps} />);
      
      const notes = screen.getByText('정기 점검 필요');
      expect(notes).toHaveClass('text-xs', 'text-gray-600'); // 컴팩트 비고 스타일
      
      const notesContainer = notes.closest('div');
      expect(notesContainer).toHaveClass('mt-1', 'pt-1'); // 컴팩트 비고 간격
    });

    it('비고가 없을 때는 표시되지 않아야 한다', () => {
      render(<LockerCard locker={mockAvailableLocker} {...mockProps} />);
      
      expect(screen.queryByText('정기 점검 필요')).not.toBeInTheDocument();
    });
  });

  describe('액션 버튼 기능', () => {
    it('상세보기 버튼 클릭이 작동해야 한다', () => {
      render(<LockerCard locker={mockAvailableLocker} {...mockProps} />);
      
      const viewButton = screen.getByTitle('상세 보기');
      fireEvent.click(viewButton);
      
      expect(mockProps.onAction).toHaveBeenCalledWith('view', mockAvailableLocker);
    });

    it('수정 버튼 클릭이 작동해야 한다', () => {
      render(<LockerCard locker={mockAvailableLocker} {...mockProps} />);
      
      const editButton = screen.getByTitle('수정');
      fireEvent.click(editButton);
      
      expect(mockProps.onAction).toHaveBeenCalledWith('edit', mockAvailableLocker);
    });

    it('삭제 버튼 클릭이 작동해야 한다', () => {
      render(<LockerCard locker={mockAvailableLocker} {...mockProps} />);
      
      const deleteButton = screen.getByTitle('삭제');
      fireEvent.click(deleteButton);
      
      expect(mockProps.onAction).toHaveBeenCalledWith('delete', mockAvailableLocker);
    });
  });

  describe('상태별 스타일링', () => {
    it('사용 중 락커 스타일이 올바르게 적용되어야 한다', () => {
      render(<LockerCard locker={mockOccupiedLocker} {...mockProps} />);
      
      const cardContainer = document.querySelector('.bg-blue-50.border-blue-200');
      expect(cardContainer).toHaveClass('bg-blue-50', 'border-blue-200');
      
      const status = screen.getByText('사용 중');
      expect(status).toHaveClass('text-blue-600');
    });

    it('점검 중 락커 스타일이 올바르게 적용되어야 한다', () => {
      const maintenanceLocker = { ...mockAvailableLocker, status: 'maintenance' as const };
      render(<LockerCard locker={maintenanceLocker} {...mockProps} />);
      
      const cardContainer = document.querySelector('.bg-yellow-50.border-yellow-200');
      expect(cardContainer).toHaveClass('bg-yellow-50', 'border-yellow-200');
      
      const status = screen.getByText('점검 중');
      expect(status).toHaveClass('text-yellow-600');
    });
  });

  describe('반응형 레이아웃', () => {
    it('모든 텍스트가 컴팩트 크기를 사용해야 한다', () => {
      render(<LockerCard locker={mockOccupiedLocker} {...mockProps} />);
      
      const textElements = document.querySelectorAll('.text-xs');
      expect(textElements.length).toBeGreaterThan(0); // 컴팩트 텍스트 요소들이 존재
    });

    it('카드가 유연한 레이아웃을 사용해야 한다', () => {
      render(<LockerCard locker={mockAvailableLocker} {...mockProps} />);
      
      const headerSection = screen.getByText('#001').closest('.flex-1');
      expect(headerSection).toHaveClass('flex-1', 'min-w-0'); // 유연한 레이아웃
    });
  });

  describe('접근성', () => {
    it('버튼들이 적절한 title 속성을 가져야 한다', () => {
      render(<LockerCard locker={mockAvailableLocker} {...mockProps} />);
      
      expect(screen.getByTitle('상세 보기')).toBeInTheDocument();
      expect(screen.getByTitle('수정')).toBeInTheDocument();
      expect(screen.getByTitle('삭제')).toBeInTheDocument();
    });

    it('텍스트가 truncate 클래스를 사용해 오버플로우를 처리해야 한다', () => {
      render(<LockerCard locker={mockAvailableLocker} {...mockProps} />);
      
      const lockerNumber = screen.getByText('#001');
      expect(lockerNumber).toHaveClass('truncate');
    });
  });
}); 