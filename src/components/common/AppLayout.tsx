import React from 'react';
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
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        currentPage={currentPage}
        onPageChange={onPageChange}
        pages={pages}
      />
      <main
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: 64 }} // 항상 64px 고정 (collapsed width)
      >
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
