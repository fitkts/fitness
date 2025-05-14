import React from 'react';
import { Member } from '../../models/types';

interface MemberViewDetailsProps {
  formData: Partial<Member>;
  membershipStatus: 'active' | 'expired';
  daysLeft: number;
  formatDate: (dateString: string | undefined) => string;
}

const MemberViewDetails: React.FC<MemberViewDetailsProps> = ({
  formData,
  membershipStatus,
  daysLeft,
  formatDate,
}) => {
  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-center">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-3xl font-bold border border-gray-300">
              {formData.name?.charAt(0) || '?'}
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-bold">{formData.name}</h3>
              <div className="mt-1 flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                  {formData.gender || '성별 미지정'}
                </span>
                {formData.birthDate && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                    {formatDate(formData.birthDate)}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-sm text-gray-500">연락처</p>
              <p className="font-medium">{formData.phone || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">이메일</p>
              <p className="font-medium">{formData.email || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">가입일</p>
              <p className="font-medium">{formatDate(formData.joinDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">담당자</p>
              <p className="font-medium">{formData.staffName || '-'}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 mt-6 md:mt-0">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold">현재 이용권</h4>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                membershipStatus === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {membershipStatus === 'active' ? '사용중' : '만료'}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-500">이용권 종류</p>
                <p className="font-semibold text-lg">{formData.membershipType || '-'}</p>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-500">시작일</p>
                <p className="font-semibold">{formatDate(formData.membershipStart)}</p>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-500">종료일</p>
                <p className="font-semibold">{formatDate(formData.membershipEnd)}</p>
              </div>
            </div>
            
            {membershipStatus === 'active' && (
              <div className="mt-4 text-center">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500" 
                    style={{ 
                      width: `${Math.max(0, Math.min(100, daysLeft / 30 * 100))}%`
                    }}
                  ></div>
                </div>
                <p className="mt-2 text-sm font-medium text-gray-700">
                  {daysLeft}일 남음
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberViewDetails; 