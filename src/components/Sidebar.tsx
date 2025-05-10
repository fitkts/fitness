import React from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  FileSpreadsheet,
  Archive,
  Settings as SettingsIcon,
  Briefcase,
  Key,
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  pages: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange, pages }) => {
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
      case '엑셀 가져오기':
        return <FileSpreadsheet size={20} />;
      case '백업 관리':
        return <Archive size={20} />;
      case '설정':
        return <SettingsIcon size={20} />;
      default:
        return <div />;
    }
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200">
      {/* 앱 로고 및 제목 */}
      <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary-600">피트니스 매니저</h1>
      </div>

      {/* 메뉴 항목 */}
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`sidebar-item w-full ${currentPage === page ? 'active' : ''}`}
            >
              <span className="mr-3">{getIcon(page)}</span>
              {page}
            </button>
          ))}
        </div>
      </nav>

      {/* 버전 정보 */}
      <div className="absolute bottom-0 w-64 px-6 py-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">피트니스 매니저 v1.0.0</p>
      </div>
    </div>
  );
};

export default Sidebar; 