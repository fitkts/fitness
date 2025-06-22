import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LockerPagination from '../../../components/locker/LockerPagination';

const mockProps = {
  currentPage: 1,
  totalPages: 5,
  onPageChange: jest.fn(),
  totalItems: 100,
  itemsPerPage: 20,
};

describe('LockerPagination - 컴팩트 레이아웃', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('컴팩트 페이지네이션 컨테이너가 렌더링되어야 한다', () => {
      render(<LockerPagination {...mockProps} />);
      
      const container = screen.getByText('1-20 / 100').closest('.py-2');
      expect(container).toHaveClass('py-2'); // 컴팩트 컨테이너 패딩
    });

    it('정보 텍스트가 컴팩트 크기로 표시되어야 한다', () => {
      render(<LockerPagination {...mockProps} />);
      
      const infoText = screen.getByText('1-20 / 100');
      expect(infoText).toHaveClass('text-xs', 'text-gray-500'); // 컴팩트 정보 텍스트
    });
  });

  describe('컴팩트 스타일 적용', () => {
    it('버튼이 컴팩트 크기를 가져야 한다', () => {
      render(<LockerPagination {...mockProps} currentPage={3} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const hasCompactClass = 
          button.classList.contains('p-1.5') || 
          button.classList.contains('px-2.5');
        expect(hasCompactClass).toBe(true);
      });
    });
  });
}); 