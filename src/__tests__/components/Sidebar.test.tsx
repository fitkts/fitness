import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from '../../components/Sidebar';

// Mock window.innerWidth for responsive testing
const mockInnerWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
};

const mockProps = {
  currentPage: '대시보드',
  onPageChange: jest.fn(),
  pages: ['대시보드', '회원 관리', '결제 관리', '락커 관리', '직원 관리'],
};

describe('Sidebar - Hover 기반 동작', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 기본적으로 데스크탑 환경으로 설정
    mockInnerWidth(1024);
  });

  describe('기본 렌더링', () => {
    it('축소 상태에서는 아이콘만 표시되어야 한다', () => {
      render(<Sidebar {...mockProps} />);
      
      // 축소 상태에서는 아이콘만 보이고 텍스트는 aria-label로 제공
      mockProps.pages.forEach(page => {
        const button = screen.getByRole('button', { name: page });
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('aria-label', page);
        expect(button).toHaveAttribute('title', page);
      });
    });

    it('현재 페이지가 활성 상태로 표시되어야 한다', () => {
      render(<Sidebar {...mockProps} />);
      
      const activeButton = screen.getByRole('button', { name: /대시보드/ });
      expect(activeButton).toHaveClass('bg-primary-50', 'text-primary-600');
    });

    it('축소 상태에서는 AF 로고가 표시되어야 한다', () => {
      render(<Sidebar {...mockProps} />);
      
      expect(screen.getByText('AF')).toBeInTheDocument();
    });

    it('축소 상태에서는 버전 정보가 숨겨져야 한다', () => {
      render(<Sidebar {...mockProps} />);
      
      expect(screen.queryByText('Aware Fit v1.0.0')).not.toBeInTheDocument();
    });
  });

  describe('Hover 기반 확장/축소 (데스크탑)', () => {
    beforeEach(() => {
      mockInnerWidth(1024);
    });

    it('기본 상태에서는 축소된 상태여야 한다', () => {
      render(<Sidebar {...mockProps} />);
      
      const sidebar = screen.getByRole('navigation').parentElement;
      expect(sidebar).toHaveClass('w-16'); // collapsed width
    });

    it('마우스 호버 시 확장되어야 한다', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...mockProps} />);
      
      const sidebar = screen.getByRole('navigation').parentElement;
      
      await user.hover(sidebar);
      
      await waitFor(() => {
        expect(sidebar).toHaveClass('w-52'); // expanded width
      });
    });

    it('마우스가 벗어나면 다시 축소되어야 한다', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...mockProps} />);
      
      const sidebar = screen.getByRole('navigation').parentElement;
      
      // 호버 -> 확장
      await user.hover(sidebar);
      await waitFor(() => {
        expect(sidebar).toHaveClass('w-52');
      });
      
      // 언호버 -> 축소
      await user.unhover(sidebar);
      await waitFor(() => {
        expect(sidebar).toHaveClass('w-16');
      });
    });

    it('호버 시 그림자 효과가 적용되어야 한다', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...mockProps} />);
      
      const sidebar = screen.getByRole('navigation').parentElement;
      
      await user.hover(sidebar);
      
      await waitFor(() => {
        expect(sidebar).toHaveClass('shadow-lg');
      });
    });

    it('호버 시 적절한 z-index가 적용되어야 한다', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...mockProps} />);
      
      const sidebar = screen.getByRole('navigation').parentElement;
      
      // 기본 상태: z-30
      expect(sidebar).toHaveClass('z-30');
      
      await user.hover(sidebar);
      
      // 호버 상태: z-40 (모달보다는 낮고, 필터보다는 높게)
      await waitFor(() => {
        expect(sidebar).toHaveClass('z-40');
      });
    });

    it('데스크탑에서는 토글 버튼이 숨겨져야 한다', () => {
      render(<Sidebar {...mockProps} />);
      
      expect(screen.queryByLabelText(/사이드바 확장|사이드바 축소/)).not.toBeInTheDocument();
    });

    it('호버 시 전체 텍스트와 로고가 표시되어야 한다', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...mockProps} />);
      
      const sidebar = screen.getByRole('navigation').parentElement;
      
      await user.hover(sidebar);
      
      await waitFor(() => {
        expect(screen.getByText('Aware Fit')).toBeInTheDocument();
        expect(screen.getByText('Aware Fit v1.0.0')).toBeInTheDocument();
      });
    });
  });

  describe('모바일 반응형 동작', () => {
    beforeEach(() => {
      mockInnerWidth(600); // 모바일 크기
    });

    it('모바일에서는 클릭 기반으로 동작해야 한다', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...mockProps} />);
      
      const toggleButton = screen.getByRole('button', { name: /사이드바 확장/ });
      const sidebar = screen.getByRole('navigation').parentElement;
      
      // 기본적으로 축소 상태
      expect(sidebar).toHaveClass('w-16');
      
      // 클릭 시 확장
      await user.click(toggleButton);
      expect(sidebar).toHaveClass('w-52');
      
      // 토글 버튼 텍스트도 변경됨
      const collapseButton = screen.getByRole('button', { name: /사이드바 축소/ });
      expect(collapseButton).toBeInTheDocument();
      
      // 다시 클릭 시 축소
      await user.click(collapseButton);
      expect(sidebar).toHaveClass('w-16');
    });

    it('모바일에서는 hover 이벤트가 무시되어야 한다', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...mockProps} />);
      
      const sidebar = screen.getByRole('navigation').parentElement;
      
      // 호버해도 변화 없음
      await user.hover(sidebar);
      expect(sidebar).toHaveClass('w-16');
    });

    it('모바일에서는 높은 z-index가 적용되어야 한다', () => {
      render(<Sidebar {...mockProps} />);
      
      const sidebar = screen.getByRole('navigation').parentElement;
      expect(sidebar).toHaveClass('z-50');
    });

    it('모바일에서는 토글 버튼이 표시되어야 한다', () => {
      render(<Sidebar {...mockProps} />);
      
      expect(screen.getByRole('button', { name: /사이드바 확장/ })).toBeInTheDocument();
    });
  });

  describe('페이지 네비게이션', () => {
    it('메뉴 클릭 시 onPageChange가 호출되어야 한다', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...mockProps} />);
      
      const menuButton = screen.getByRole('button', { name: '회원 관리' });
      await user.click(menuButton);
      
      expect(mockProps.onPageChange).toHaveBeenCalledWith('회원 관리');
    });

    it('아이콘만 보이는 상태에서도 클릭 가능해야 한다', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...mockProps} />);
      
      // 축소 상태에서 아이콘 클릭
      const iconButton = screen.getByRole('button', { name: '회원 관리' });
      await user.click(iconButton);
      
      expect(mockProps.onPageChange).toHaveBeenCalledWith('회원 관리');
    });
  });

  describe('키보드 접근성', () => {
    it('Tab 키로 메뉴 간 이동이 가능해야 한다', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...mockProps} />);
      
      const firstButton = screen.getByRole('button', { name: '대시보드' });
      const secondButton = screen.getByRole('button', { name: '회원 관리' });
      
      firstButton.focus();
      expect(firstButton).toHaveFocus();
      
      await user.tab();
      expect(secondButton).toHaveFocus();
    });

    it('Enter 키로 메뉴 선택이 가능해야 한다', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...mockProps} />);
      
      const menuButton = screen.getByRole('button', { name: '회원 관리' });
      menuButton.focus();
      
      await user.keyboard('{Enter}');
      
      expect(mockProps.onPageChange).toHaveBeenCalledWith('회원 관리');
    });

    it('Space 키로 메뉴 선택이 가능해야 한다', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...mockProps} />);
      
      const menuButton = screen.getByRole('button', { name: '회원 관리' });
      menuButton.focus();
      
      await user.keyboard(' ');
      
      expect(mockProps.onPageChange).toHaveBeenCalledWith('회원 관리');
    });

    it('포커스 시 사이드바가 확장되어야 한다 (데스크탑)', async () => {
      mockInnerWidth(1024);
      render(<Sidebar {...mockProps} />);
      
      const sidebar = screen.getByRole('navigation').parentElement;
      const menuButton = screen.getByRole('button', { name: '회원 관리' });
      
      menuButton.focus();
      
      await waitFor(() => {
        expect(sidebar).toHaveClass('w-52');
      });
    });
  });

  describe('화면 크기 변경 대응', () => {
    it('화면 크기가 모바일로 변경되면 자동으로 축소되어야 한다', () => {
      // 데스크탑에서 시작
      mockInnerWidth(1024);
      render(<Sidebar {...mockProps} />);
      
      // 모바일로 변경
      mockInnerWidth(600);
      fireEvent(window, new Event('resize'));
      
      const sidebar = screen.getByRole('navigation').parentElement;
      expect(sidebar).toHaveClass('w-16');
    });

    it('모바일에서 데스크탑으로 변경되면 hover 모드가 활성화되어야 한다', async () => {
      const user = userEvent.setup();
      
      // 모바일에서 시작
      mockInnerWidth(600);
      render(<Sidebar {...mockProps} />);
      
      // 데스크탑으로 변경
      mockInnerWidth(1024);
      fireEvent(window, new Event('resize'));
      
      const sidebar = screen.getByRole('navigation').parentElement;
      
      // 호버 테스트
      await user.hover(sidebar);
      await waitFor(() => {
        expect(sidebar).toHaveClass('w-52');
      });
    });
  });

  describe('애니메이션 및 전환 효과', () => {
    it('적절한 transition 클래스가 적용되어야 한다', () => {
      render(<Sidebar {...mockProps} />);
      
      const sidebar = screen.getByRole('navigation').parentElement;
      expect(sidebar).toHaveClass('transition-all', 'duration-300', 'ease-in-out');
    });

    it('hover 상태 전환이 부드러워야 한다', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...mockProps} />);
      
      const sidebar = screen.getByRole('navigation').parentElement;
      
      // transition 클래스 확인
      expect(sidebar).toHaveClass('transition-all');
      
      await user.hover(sidebar);
      await user.unhover(sidebar);
      
      // 에러 없이 전환되어야 함
      expect(sidebar).toBeInTheDocument();
    });
  });
});
