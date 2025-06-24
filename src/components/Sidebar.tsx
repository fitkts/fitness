import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  Settings as SettingsIcon,
  Briefcase,
  Key,
  ChevronLeft,
  ChevronRight,
  BarChart,
  FileText,
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  pages: string[];
}

const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onPageChange,
  pages,
}) => {
  // 기본적으로 항상 축소 상태로 시작
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isClickMode, setIsClickMode] = useState(false); // 모바일에서는 클릭 모드

  // 반응형 처리
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsClickMode(mobile);
      
      // 모바일로 변경 시 자동으로 축소
      if (mobile) {
        setIsExpanded(false);
      }
    };

    handleResize(); // 초기 설정
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 호버 이벤트 핸들러 (데스크탑만)
  const handleMouseEnter = useCallback(() => {
    if (!isMobile) {
      setIsExpanded(true);
    }
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (!isMobile) {
      setIsExpanded(false);
    }
  }, [isMobile]);

  // 클릭 토글 핸들러 (모바일용)
  const handleToggleClick = useCallback(() => {
    if (isMobile) {
      setIsExpanded(prev => !prev);
    }
  }, [isMobile]);

  // 포커스 이벤트 핸들러 (접근성)
  const handleFocus = useCallback(() => {
    if (!isMobile) {
      setIsExpanded(true);
    }
  }, [isMobile]);

  const handleBlur = useCallback((e: React.FocusEvent) => {
    if (!isMobile) {
      // 포커스가 사이드바 외부로 나갈 때만 축소
      const currentTarget = e.currentTarget;
      setTimeout(() => {
        if (!currentTarget.contains(document.activeElement)) {
          setIsExpanded(false);
        }
      }, 0);
    }
  }, [isMobile]);

  // 각 페이지에 해당하는 아이콘 선택
  const getIcon = (page: string) => {
    switch (page) {
      case '대시보드':
        return <LayoutDashboard size={20} />;
      case '회원 관리':
        return <Users size={20} />;
      case '출석 관리':
        return <Calendar size={20} />;
      case '결제 관리':
        return <CreditCard size={20} />;
      case '락커 관리':
        return <Key size={20} />;
      case '직원 관리':
        return <Briefcase size={20} />;
      case '상담일지':
        return <FileText size={20} />;
      case '통계 관리':
        return <BarChart size={20} />;
      case '설정':
        return <SettingsIcon size={20} />;
      default:
        return <div />;
    }
  };

  // 적절한 z-index 계산
  const getZIndex = () => {
    if (isMobile) return 'z-50'; // 모바일에서는 가장 높게
    return isExpanded ? 'z-40' : 'z-30'; // 데스크탑: 확장 시 z-40, 기본 z-30
  };

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-52' : 'w-16'} 
        ${getZIndex()}
        ${isExpanded ? 'shadow-lg' : ''}
        flex flex-col`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {/* 토글 버튼 (모바일에서만 표시) */}
      {isMobile && (
        <button
          onClick={handleToggleClick}
          className="absolute -right-3 top-6 bg-white rounded-full p-1 border border-gray-200 shadow-sm hover:bg-gray-50 z-10"
          aria-label={isExpanded ? '사이드바 축소' : '사이드바 확장'}
        >
          {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      )}

      {/* 앱 로고 및 제목 */}
      <div
        className={`flex items-center h-16 px-4 border-b border-gray-200 ${isExpanded ? 'justify-start' : 'justify-center'}`}
      >
        {isExpanded && (
          <h1 className="text-xl font-bold text-primary-600 whitespace-nowrap">
            Aware Fit
          </h1>
        )}
        {!isExpanded && (
          <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">AF</span>
          </div>
        )}
      </div>

      {/* 메뉴 항목 */}
      <nav className="flex-1 mt-6 px-3 overflow-y-auto" role="navigation">
        <div className="space-y-1">
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`sidebar-item w-full flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors
                ${
                  currentPage === page
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
                ${isExpanded ? 'justify-start' : 'justify-center'}`}
              title={!isExpanded ? page : ''}
              aria-label={page}
            >
              <span className={`${isExpanded ? 'mr-3' : ''}`}>
                {getIcon(page)}
              </span>
              {isExpanded && (
                <span className="whitespace-nowrap">{page}</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* 버전 정보 */}
      {isExpanded && (
        <div className="px-4 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 whitespace-nowrap">
            Aware Fit v1.0.0
          </p>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
