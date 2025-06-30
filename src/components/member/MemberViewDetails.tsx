import React from 'react';
import { Member } from '../../models/types';
import { COMPACT_MODAL_CONFIG } from '../../config/memberConfig';

interface MemberViewDetailsProps {
  formData: Partial<Member>;
  membershipStatus: 'active' | 'expired';
  daysLeft: number;
  formatDate: (dateString: string | undefined | null) => string;
}

const MemberViewDetails: React.FC<MemberViewDetailsProps> = ({
  formData,
  membershipStatus,
  daysLeft,
  formatDate,
}) => {
  return (
    <div className={COMPACT_MODAL_CONFIG.SECTION.contentPadding}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 기본 정보 */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {formData.name?.charAt(0) || '?'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{formData.name}</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  {formData.gender || '성별 미지정'}
                </span>
                {formData.birthDate && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    {formatDate(formData.birthDate)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">연락처</span>
              <span className="text-sm font-medium text-gray-900">{formData.phone || '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">이메일</span>
              <span className="text-sm font-medium text-gray-900">{formData.email || '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">가입일</span>
              <span className="text-sm font-medium text-gray-900">{formatDate(formData.joinDate)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-500">담당자</span>
              <span className="text-sm font-medium text-gray-900">{formData.staffName || '-'}</span>
            </div>
          </div>
        </div>

        {/* 회원권 정보 */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-900">현재 이용권</h4>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                membershipStatus === 'active'
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}
            >
              {membershipStatus === 'active' ? '사용중' : '만료'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">이용권 종류</span>
              <span className="text-sm font-semibold text-gray-900">
                {formData.membershipType || '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">시작일</span>
              <span className="text-sm font-medium text-gray-900">
                {formatDate(formData.membershipStart)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">종료일</span>
              <span className="text-sm font-medium text-gray-900">
                {formatDate(formData.membershipEnd)}
              </span>
            </div>
          </div>

          {membershipStatus === 'active' && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">잔여 기간</span>
                <span className="text-sm font-semibold text-blue-600">
                  {daysLeft}일 남음
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                  style={{
                    width: `${Math.max(5, Math.min(100, (daysLeft / 30) * 100))}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberViewDetails;
