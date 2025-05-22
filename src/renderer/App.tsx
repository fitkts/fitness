import React, { useState } from 'react';
import AppLayout from '../components/common/AppLayout';
import Dashboard from '../pages/Dashboard';
import Members from '../pages/Members';
import Attendance from '../pages/Attendance';
import Payment from '../pages/Payment';
import Settings from '../pages/Settings';
import Lockers from '../pages/Lockers';
import Staff from '../pages/Staff';
import Statistics from '../pages/Statistics';
import PageTransition from '../components/common/PageTransition';

// 페이지 enum
enum Page {
  Dashboard = '대시보드',
  Members = '회원 관리',
  Attendance = '출석 관리',
  Payment = '결제 관리',
  Lockers = '락카 관리',
  Staff = '직원 관리',
  Statistics = '통계 관리',
  Settings = '설정',
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);

  // 페이지 전환 핸들러
  const handlePageChange = (page: string) => {
    // 문자열을 Page 타입으로 변환
    const pageValue = Object.values(Page).find((value) => value === page);
    if (pageValue) {
      setCurrentPage(pageValue as Page);
    }
  };

  // 현재 페이지에 따라 컴포넌트 렌더링
  const renderPage = () => {
    switch (currentPage) {
      case Page.Dashboard:
        return <Dashboard />;
      case Page.Members:
        return <Members />;
      case Page.Attendance:
        return <Attendance />;
      case Page.Payment:
        return <Payment />;
      case Page.Lockers:
        return <Lockers />;
      case Page.Staff:
        return <Staff />;
      case Page.Statistics:
        return <Statistics />;
      case Page.Settings:
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppLayout
      currentPage={currentPage}
      onPageChange={handlePageChange}
      pages={Object.values(Page)}
    >
      <main className="p-6">
        <PageTransition>{renderPage()}</PageTransition>
      </main>
    </AppLayout>
  );
};

export default App;
