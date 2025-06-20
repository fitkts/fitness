// 통합 회원 관리 페이지
// 정식 회원과 상담 회원을 하나의 인터페이스에서 관리

import React, { useState, useEffect, useMemo } from 'react';
import { 
  UnifiedMember, 
  UnifiedMemberFilter, 
  UnifiedMemberStats,
  MemberConversionData 
} from '../types/unifiedMember';
import { 
  MEMBER_TYPE_OPTIONS, 
  MEMBER_STATUS_OPTIONS,
  DEFAULT_MEMBER_FILTER,
  NOTIFICATION_MESSAGES,
  TABLE_COLUMNS
} from '../config/unifiedMemberConfig';
import { 
  getMemberStatusDisplay, 
  getMemberTypeDisplay,
  canPromoteMember,
  formatDateKorean 
} from '../utils/unifiedMemberUtils';

interface UnifiedMemberManagementProps {
  onNavigate?: (page: string) => void;
}

const UnifiedMemberManagement: React.FC<UnifiedMemberManagementProps> = ({ onNavigate }) => {
  // 상태 관리
  const [members, setMembers] = useState<UnifiedMember[]>([]);
  const [stats, setStats] = useState<UnifiedMemberStats | null>(null);
  const [filter, setFilter] = useState<UnifiedMemberFilter>({
    memberType: 'all',
    sortKey: 'name',
    sortDirection: 'ascending'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<UnifiedMember | null>(null);
  const [showPromotionModal, setShowPromotionModal] = useState(false);

  // 데이터 로딩
  useEffect(() => {
    loadMembers();
    loadStats();
  }, [filter]);

  /**
   * 회원 목록 로딩
   */
  const loadMembers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await window.api.invoke('unified-members:getAll', filter);
      
      if (result.success) {
        setMembers(result.data);
      } else {
        setError(result.error || NOTIFICATION_MESSAGES.dataLoadError);
      }
    } catch (error) {
      console.error('회원 목록 로딩 실패:', error);
      setError(NOTIFICATION_MESSAGES.networkError);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 통계 데이터 로딩
   */
  const loadStats = async () => {
    try {
      const result = await window.api.invoke('unified-members:getStats');
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('통계 로딩 실패:', error);
    }
  };

  /**
   * 회원 승격 처리
   */
  const handlePromoteMember = async (member: UnifiedMember, conversionData: MemberConversionData) => {
    if (!member.id || member.memberType !== 'consultation') return;

    setLoading(true);
    
    try {
      const result = await window.api.invoke('unified-members:promote', member.id, conversionData);
      
      if (result.success) {
        await loadMembers();
        await loadStats();
        setShowPromotionModal(false);
        setSelectedMember(null);
        // 성공 알림 표시
      } else {
        setError(result.error || NOTIFICATION_MESSAGES.promotionFailed);
      }
    } catch (error) {
      console.error('회원 승격 실패:', error);
      setError(NOTIFICATION_MESSAGES.networkError);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 필터링된 회원 목록
   */
  const filteredMembers = useMemo(() => {
    return members; // 서버에서 이미 필터링됨
  }, [members]);

  /**
   * 통계 카드 렌더링
   */
  const renderStatsCards = () => {
    if (!stats) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">전체 회원</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">정식 회원</h3>
          <p className="text-3xl font-bold text-green-600">{stats.regular.total}</p>
          <p className="text-sm text-gray-500">활성: {stats.regular.active}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">상담 회원</h3>
          <p className="text-3xl font-bold text-orange-600">{stats.consultation.total}</p>
          <p className="text-sm text-gray-500">승격 대상: {stats.consultation.readyForPromotion}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">만료 임박</h3>
          <p className="text-3xl font-bold text-red-600">{stats.regular.expiringSoon}</p>
          <p className="text-sm text-gray-500">7일 이내</p>
        </div>
      </div>
    );
  };

  /**
   * 필터 컨트롤 렌더링
   */
  const renderFilterControls = () => {
    return (
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 검색 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              검색
            </label>
            <input
              type="text"
              placeholder="이름, 전화번호, 이메일"
              value={filter.search || ''}
              onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 회원 타입 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              회원 타입
            </label>
            <select
              value={filter.memberType || 'all'}
              onChange={(e) => setFilter(prev => ({ 
                ...prev, 
                memberType: e.target.value as any 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <option value="regular">정식 회원</option>
              <option value="consultation">상담 회원</option>
            </select>
          </div>

          {/* 새로고침 버튼 */}
          <div className="flex items-end">
            <button
              onClick={loadMembers}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '로딩중...' : '새로고침'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  /**
   * 회원 테이블 렌더링
   */
  const renderMemberTable = () => {
    const columns = TABLE_COLUMNS.unified;

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map(column => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.map(member => {
                const typeDisplay = getMemberTypeDisplay(member);
                const statusDisplay = getMemberStatusDisplay(member);
                
                return (
                  <tr key={`${member.memberType}-${member.id}`} className="hover:bg-gray-50">
                    {/* 타입 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center">
                        <span className="mr-2">{typeDisplay.icon}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {typeDisplay.text}
                        </span>
                      </span>
                    </td>

                    {/* 이름 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{member.name}</div>
                    </td>

                    {/* 연락처 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.phone || '-'}</div>
                    </td>

                    {/* 상태 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusDisplay.badge === 'success' ? 'bg-green-100 text-green-800' :
                        statusDisplay.badge === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        statusDisplay.badge === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        <span className="mr-1">{statusDisplay.icon}</span>
                        {statusDisplay.text}
                      </span>
                    </td>

                    {/* 가입일 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDateKorean(member.joinDate)}
                      </div>
                    </td>

                    {/* 담당자 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.staffName || '-'}</div>
                    </td>

                    {/* 액션 */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        {canPromoteMember(member) && (
                          <button
                            onClick={() => {
                              setSelectedMember(member);
                              setShowPromotionModal(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            승격
                          </button>
                        )}
                        <button
                          onClick={() => {
                            // 상세 정보 모달 또는 페이지 이동
                            if (member.memberType === 'regular') {
                              onNavigate?.('member-detail');
                            } else {
                              onNavigate?.('consultation-detail');
                            }
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          상세
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredMembers.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">통합 회원 관리</h1>
        <p className="mt-2 text-gray-600">
          정식 회원과 상담 회원을 하나의 화면에서 통합 관리합니다.
        </p>
      </div>

      {/* 오류 메시지 */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* 통계 카드 */}
      {renderStatsCards()}

      {/* 필터 컨트롤 */}
      {renderFilterControls()}

      {/* 회원 테이블 */}
      {renderMemberTable()}

      {/* 승격 모달 */}
      {showPromotionModal && selectedMember && (
        <PromotionModal
          member={selectedMember}
          onClose={() => {
            setShowPromotionModal(false);
            setSelectedMember(null);
          }}
          onConfirm={handlePromoteMember}
        />
      )}
    </div>
  );
};

/**
 * 승격 모달 컴포넌트
 */
interface PromotionModalProps {
  member: UnifiedMember;
  onClose: () => void;
  onConfirm: (member: UnifiedMember, conversionData: MemberConversionData) => void;
}

const PromotionModal: React.FC<PromotionModalProps> = ({ member, onClose, onConfirm }) => {
  const [conversionData, setConversionData] = useState<MemberConversionData>({
    membershipType: '3개월권',
    membershipStart: new Date().toISOString().split('T')[0],
    membershipEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentAmount: 270000,
    paymentMethod: 'card'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(member, conversionData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">회원 승격</h2>
        <p className="text-gray-600 mb-4">
          <strong>{member.name}</strong>님을 정식 회원으로 승격하시겠습니까?
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              회원권 종류
            </label>
            <select
              value={conversionData.membershipType || ''}
              onChange={(e) => setConversionData(prev => ({ ...prev, membershipType: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1개월권">1개월권</option>
              <option value="3개월권">3개월권</option>
              <option value="6개월권">6개월권</option>
              <option value="12개월권">12개월권</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              결제 금액
            </label>
            <input
              type="number"
              value={conversionData.paymentAmount || ''}
              onChange={(e) => setConversionData(prev => ({ ...prev, paymentAmount: Number(e.target.value) }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              결제 방법
            </label>
            <select
              value={conversionData.paymentMethod || ''}
              onChange={(e) => setConversionData(prev => ({ ...prev, paymentMethod: e.target.value as 'card' | 'cash' | 'transfer' }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="card">카드</option>
              <option value="cash">현금</option>
              <option value="transfer">계좌이체</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              승격하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnifiedMemberManagement; 