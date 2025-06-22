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

    it('현재 페이지 정보가 올바르게 표시되어야 한다', () => {
      render(<LockerPagination {...mockProps} />);
      
      expect(screen.getByText('1-20 / 100')).toBeInTheDocument();
    });
  });

  describe('컴팩트 스타일 적용', () => {
    it('이전/다음 버튼이 컴팩트 크기를 가져야 한다', () => {
      render(<LockerPagination {...mockProps} currentPage={3} />);
      
      const prevButton = screen.getByTitle('이전 페이지');
      const nextButton = screen.getByTitle('다음 페이지');
      
      expect(prevButton).toHaveClass('p-1.5'); // 컴팩트 버튼 패딩
      expect(nextButton).toHaveClass('p-1.5');
    });

    it('페이지 번호 버튼이 컴팩트 크기를 가져야 한다', () => {
      render(<LockerPagination {...mockProps} currentPage={3} />);
      
      const pageButtons = screen.getAllByRole('button').filter(btn => 
        /^\d+$/.test(btn.textContent || '')
      );
      
      pageButtons.forEach(button => {
        expect(button).toHaveClass('px-2.5', 'py-1', 'text-sm'); // 컴팩트 페이지 버튼
      });
    });

    it('아이콘이 컴팩트 크기를 가져야 한다', () => {
      render(<LockerPagination {...mockProps} currentPage={3} />);
      
      const prevButton = screen.getByTitle('이전 페이지');
      const nextButton = screen.getByTitle('다음 페이지');
      
      const prevIcon = prevButton.querySelector('svg');
      const nextIcon = nextButton.querySelector('svg');
      
      expect(prevIcon).toHaveAttribute('width', '14'); // 컴팩트 아이콘 크기
      expect(nextIcon).toHaveAttribute('width', '14');
    });
  });

  describe('페이지 상태', () => {
    it('첫 페이지에서 이전 버튼이 비활성화되어야 한다', () => {
      render(<LockerPagination {...mockProps} currentPage={1} />);
      
      const prevButton = screen.getByTitle('이전 페이지');
      expect(prevButton).toBeDisabled();
      expect(prevButton).toHaveClass('text-gray-300'); // 비활성화 스타일
    });

    it('마지막 페이지에서 다음 버튼이 비활성화되어야 한다', () => {
      render(<LockerPagination {...mockProps} currentPage={5} totalPages={5} />);
      
      const nextButton = screen.getByTitle('다음 페이지');
      expect(nextButton).toBeDisabled();
      expect(nextButton).toHaveClass('text-gray-300'); // 비활성화 스타일
    });

    it('현재 페이지가 활성 스타일을 가져야 한다', () => {
      render(<LockerPagination {...mockProps} currentPage={3} />);
      
      const currentPageButton = screen.getByText('3');
      expect(currentPageButton).toHaveClass('bg-blue-500', 'text-white'); // 활성 페이지 스타일
    });

    it('다른 페이지 버튼들은 기본 스타일을 가져야 한다', () => {
      render(<LockerPagination {...mockProps} currentPage={3} />);
      
      const pageButton = screen.getByText('2');
      expect(pageButton).toHaveClass('bg-white', 'text-gray-700'); // 기본 페이지 스타일
    });
  });

  describe('페이지 변경 기능', () => {
    it('이전 버튼 클릭이 작동해야 한다', () => {
      render(<LockerPagination {...mockProps} currentPage={3} />);
      
      const prevButton = screen.getByTitle('이전 페이지');
      fireEvent.click(prevButton);
      
      expect(mockProps.onPageChange).toHaveBeenCalledWith(2);
    });

    it('다음 버튼 클릭이 작동해야 한다', () => {
      render(<LockerPagination {...mockProps} currentPage={3} />);
      
      const nextButton = screen.getByTitle('다음 페이지');
      fireEvent.click(nextButton);
      
      expect(mockProps.onPageChange).toHaveBeenCalledWith(4);
    });

    it('페이지 번호 버튼 클릭이 작동해야 한다', () => {
      render(<LockerPagination {...mockProps} currentPage={1} />);
      
      const pageButton = screen.getByText('4');
      fireEvent.click(pageButton);
      
      expect(mockProps.onPageChange).toHaveBeenCalledWith(4);
    });
  });

  describe('페이지 정보 계산', () => {
    it('첫 페이지 정보가 올바르게 계산되어야 한다', () => {
      render(<LockerPagination {...mockProps} currentPage={1} />);
      
      expect(screen.getByText('1-20 / 100')).toBeInTheDocument();
    });

    it('중간 페이지 정보가 올바르게 계산되어야 한다', () => {
      render(<LockerPagination {...mockProps} currentPage={3} />);
      
      expect(screen.getByText('41-60 / 100')).toBeInTheDocument();
    });

    it('마지막 페이지 정보가 올바르게 계산되어야 한다', () => {
      render(<LockerPagination {...mockProps} currentPage={5} totalItems={95} />);
      
      expect(screen.getByText('81-95 / 95')).toBeInTheDocument();
    });
  });

  describe('단일 페이지 처리', () => {
    it('페이지가 1개일 때 페이지네이션이 숨겨져야 한다', () => {
      render(<LockerPagination {...mockProps} totalPages={1} totalItems={10} />);
      
      expect(screen.getByText('전체 10개 락커 표시 중 (페이지네이션 불필요)')).toBeInTheDocument();
      expect(screen.queryByTitle('이전 페이지')).not.toBeInTheDocument();
      expect(screen.queryByTitle('다음 페이지')).not.toBeInTheDocument();
    });

    it('데이터가 없을 때도 숨겨져야 한다', () => {
      render(<LockerPagination {...mockProps} totalPages={0} totalItems={0} />);
      
      expect(screen.getByText('전체 0개 락커 표시 중 (페이지네이션 불필요)')).toBeInTheDocument();
    });
  });

  describe('가시 페이지 번호', () => {
    it('5개 이하 페이지에서 모든 페이지가 표시되어야 한다', () => {
      render(<LockerPagination {...mockProps} totalPages={3} />);
      
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('많은 페이지에서 적절한 범위만 표시되어야 한다', () => {
      render(<LockerPagination {...mockProps} totalPages={10} currentPage={5} />);
      
      // 3, 4, 5, 6, 7 페이지가 표시되어야 함
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
    });
  });

  describe('반응형 레이아웃', () => {
    it('컴팩트 레이아웃이 모든 화면 크기에서 작동해야 한다', () => {
      render(<LockerPagination {...mockProps} />);
      
      const container = document.querySelector('.flex');
      expect(container).toHaveClass('flex', 'items-center', 'justify-between');
    });

    it('버튼들이 터치 친화적인 크기를 유지해야 한다', () => {
      render(<LockerPagination {...mockProps} currentPage={3} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // 최소 터치 영역 확보 (44px)를 위한 패딩 확인
        const hasMinTouchArea = 
          button.classList.contains('p-1.5') || 
          button.classList.contains('px-2.5');
        expect(hasMinTouchArea).toBe(true);
      });
    });
  });

  describe('접근성', () => {
    it('버튼들이 적절한 aria-label을 가져야 한다', () => {
      render(<LockerPagination {...mockProps} currentPage={3} />);
      
      expect(screen.getByTitle('이전 페이지')).toBeInTheDocument();
      expect(screen.getByTitle('다음 페이지')).toBeInTheDocument();
    });

    it('페이지 번호 버튼들이 명확한 텍스트를 가져야 한다', () => {
      render(<LockerPagination {...mockProps} />);
      
      const pageButtons = screen.getAllByRole('button').filter(btn => 
        /^\d+$/.test(btn.textContent || '')
      );
      
      expect(pageButtons.length).toBeGreaterThan(0);
      pageButtons.forEach(button => {
        expect(button.textContent).toMatch(/^\d+$/);
      });
    });
  });
}); 