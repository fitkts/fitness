// 통합 회원 관리 페이지
// 정식 회원과 상담 회원을 하나의 인터페이스에서 관리

import React, { useState } from 'react';
import { Users, UserCheck } from 'lucide-react';
import Members from './Members';
import ConsultationDashboard from './ConsultationDashboard';

interface UnifiedMemberManagementProps {
  onNavigate?: (page: string) => void;
}

const UnifiedMemberManagement: React.FC<UnifiedMemberManagementProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'regular' | 'consultation'>('regular');

  const tabs = [
    {
      id: 'regular' as const,
      label: '정식 회원 관리',
      icon: <Users size={20} />,
      description: '정식 회원의 등록, 수정, 조회 및 관리',
    },
    {
      id: 'consultation' as const,
      label: '상담 회원 관리',
      icon: <UserCheck size={20} />,
      description: '상담 회원의 등록, 관리 및 정식 회원 승격',
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'regular':
        return <Members />;
      case 'consultation':
        return <ConsultationDashboard />;
      default:
        return <Members />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">통합 회원 관리</h1>
          <p className="mt-2 text-gray-600">
            정식 회원과 상담 회원을 통합적으로 관리할 수 있는 시스템입니다.
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="탭 네비게이션">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group relative min-w-0 flex-1 overflow-hidden py-4 px-1 text-center hover:bg-gray-50 focus:z-10 transition-colors ${
                      isActive
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span className={`${isActive ? 'text-blue-600' : 'text-gray-400'} transition-colors`}>
                        {tab.icon}
                      </span>
                      <span className="font-medium text-sm">{tab.label}</span>
                    </div>
                    {isActive && (
                      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-600" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 탭 설명 */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              {tabs.find((tab) => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="tab-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default UnifiedMemberManagement; 