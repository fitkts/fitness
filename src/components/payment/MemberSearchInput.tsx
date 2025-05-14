import React from 'react';
import { PaymentOption } from '../../types/payment'; // PaymentOption 타입 경로 확인 필요

interface MemberSearchInputProps {
  memberSearch: string;
  filteredMembers: PaymentOption[];
  isViewMode: boolean;
  isSubmitting: boolean;
  selectedMemberName?: string; // 뷰 모드에서 선택된 회원 이름을 표시하기 위함
  onMemberSearchChange: (value: string) => void;
  onSelectMember: (id: number, name: string) => void;
  error?: string;
}

const MemberSearchInput: React.FC<MemberSearchInputProps> = ({
  memberSearch,
  filteredMembers,
  isViewMode,
  isSubmitting,
  selectedMemberName,
  onMemberSearchChange,
  onSelectMember,
  error,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        회원 <span className="text-red-500">*</span>
      </label>
      {isViewMode ? (
        <div className="p-2 border rounded bg-gray-50 min-h-[40px] flex items-center">
          {selectedMemberName || '회원 정보 없음'} 
        </div>
      ) : (
        <div>
          <input
            type="text"
            placeholder="회원 검색..."
            value={memberSearch}
            onChange={(e) => onMemberSearchChange(e.target.value)}
            className={`w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
            disabled={isSubmitting}
          />
          {memberSearch && filteredMembers.length > 0 && (
            <div className="mt-1 max-h-40 overflow-y-auto border rounded bg-white shadow-lg z-10 absolute w-full">
              {filteredMembers.map(member => (
                <div
                  key={member.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => onSelectMember(member.id, member.name)}
                >
                  {member.name} (ID: {member.id})
                </div>
              ))}
            </div>
          )}
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MemberSearchInput; 