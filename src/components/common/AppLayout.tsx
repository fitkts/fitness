import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  pages: string[];
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
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

  // 사이드바 너비에 따라 main 영역 margin-left 조정
  const sidebarWidth = isCollapsed ? 64 : 256; // w-16(64px), w-64(256px)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        currentPage={currentPage}
        onPageChange={onPageChange}
        pages={pages}
        // Sidebar 내부에서 isCollapsed, isMobile을 관리하지 않고 props로 전달하려면 Sidebar도 수정 필요
      />
      <main
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: isMobile ? 64 : sidebarWidth }}
      >
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
