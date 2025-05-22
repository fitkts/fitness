import React, { useState, useEffect } from 'react';
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      case '락카 관리':
        return <Key size={20} />;
      case '직원 관리':
        return <Briefcase size={20} />;
      case '통계 관리':
        return <BarChart size={20} />;
      case '설정':
        return <SettingsIcon size={20} />;

      default:
        return <div />;
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
        ${isCollapsed ? 'min-w-[4rem] max-w-[4rem]' : 'min-w-[12rem] max-w-[20rem]'} 
        ${isMobile ? 'z-50' : 'z-30'}
        flex flex-col`}
    >
      {/* 토글 버튼 */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-white rounded-full p-1 border border-gray-200 shadow-sm hover:bg-gray-50 z-10"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* 앱 로고 및 제목 */}
      <div
        className={`flex items-center h-16 px-4 border-b border-gray-200 ${isCollapsed ? 'justify-center' : 'justify-start'}`}
      >
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-primary-600 whitespace-nowrap">
            피트니스 매니저
          </h1>
        )}
      </div>

      {/* 메뉴 항목 */}
      <nav className="flex-1 mt-6 px-2 overflow-y-auto">
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
                ${isCollapsed ? 'justify-center' : 'justify-start'}`}
              title={isCollapsed ? page : ''}
            >
              <span className={`${isCollapsed ? '' : 'mr-3'}`}>
                {getIcon(page)}
              </span>
              {!isCollapsed && (
                <span className="whitespace-nowrap">{page}</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* 버전 정보 */}
      {!isCollapsed && (
        <div className="px-4 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 whitespace-nowrap">
            피트니스 매니저 v1.0.0
          </p>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
