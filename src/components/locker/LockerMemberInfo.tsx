import React from 'react';
import { Search, X } from 'lucide-react';
import { LockerMemberInfoProps } from '../../types/lockerModal';

const LockerMemberInfo: React.FC<LockerMemberInfoProps> = ({
  selectedMember,
  searchTerm,
  searchResults,
  isSearching,
  onSearch,
  onSelectMember,
  onClearMember,
  isViewMode,
  errors
}) => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 회원 정보</h3>
      
      {!isViewMode ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            회원 검색 <span className="text-red-500">*</span>
          </label>
          
          {selectedMember ? (
            <div className="flex items-center justify-between p-3 bg-white border border-gray-300 rounded-md">
              <div>
                <p className="font-medium text-gray-900">{selectedMember.name}</p>
                <p className="text-sm text-gray-500">ID: {selectedMember.id}</p>
              </div>
              <button
                type="button"
                onClick={onClearMember}
                className="text-red-500 hover:text-red-700"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => onSearch(e.target.value)}
                  placeholder="회원명 또는 전화번호로 검색..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
              </div>

              {searchResults.length > 0 && (
                <div className="mt-2 border rounded-md shadow-sm max-h-48 overflow-y-auto bg-white">
                  {searchResults.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => onSelectMember(member)}
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                    >
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.phone}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        selectedMember && (
          <div className="p-3 bg-white border border-gray-300 rounded-md">
            <p className="font-medium text-gray-900">{selectedMember.name}</p>
            <p className="text-sm text-gray-500">회원 ID: {selectedMember.id}</p>
          </div>
        )
      )}
    </div>
  );
};

export default LockerMemberInfo; 