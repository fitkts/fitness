import React from 'react';
import { MembershipType } from '../../models/types';
import { Eye, Edit3, Trash2, CheckCircle, XCircle, ChevronUp, ChevronDown } from 'lucide-react'; // Chevron 아이콘 추가

interface MembershipTypeListProps {
  membershipTypes: MembershipType[];
  onViewType: (type: MembershipType) => void;
  onEditType: (type: MembershipType) => void;
  onDeleteType: (typeId: number) => void;
  sortConfig: { // 추가
    key: string;
    direction: 'ascending' | 'descending' | null;
  };
  requestSort: (key: string) => void; // 추가
  formatCurrency: (value: number | undefined | null) => string; // 추가 (Payment.tsx에서 전달받도록)
}

const MembershipTypeList: React.FC<MembershipTypeListProps> = ({
  membershipTypes,
  onViewType,
  onEditType,
  onDeleteType,
  sortConfig, // 추가
  requestSort, // 추가
  formatCurrency, // 추가
}) => {
  if (!membershipTypes || membershipTypes.length === 0) {
    return null;
  }

  const getSortIndicator = (key: string) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? 
        <ChevronUp className="text-blue-500 inline ml-1" size={14} /> : 
        <ChevronDown className="text-blue-500 inline ml-1" size={14} />;
    }
    return null;
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 sticky top-0 z-10"> {/* sticky top-0 z-10 추가 */}
          <tr>
            <th 
              className="py-3 px-4 text-left font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => requestSort('name')}
            >
              이용권 이름 {getSortIndicator('name')}
            </th>
            <th 
              className="py-3 px-4 text-right font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => requestSort('price')}
            >
              가격(원) {getSortIndicator('price')}
            </th>
            <th 
              className="py-3 px-4 text-center font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => requestSort('durationMonths')}
            >
              기간(개월) {getSortIndicator('durationMonths')}
            </th>
            <th 
              className="py-3 px-4 text-center font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => requestSort('maxUses')}
            >
              최대횟수 {getSortIndicator('maxUses')}
            </th>
            <th 
              className="py-3 px-4 text-center font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => requestSort('isActive')}
            >
              활성상태 {getSortIndicator('isActive')}
            </th>
            <th className="py-3 px-4 text-center font-medium text-gray-500 uppercase tracking-wider">작업</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {membershipTypes.map((type) => (
            <tr 
              key={type.id} 
              className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer group"
              onClick={() => onViewType(type)}
            >
              <td className="py-3 px-4 whitespace-nowrap font-medium text-gray-900 group-hover:text-blue-600">
                {type.name}
                {type.description && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs" title={type.description}>
                    {type.description}
                  </p>
                )}
              </td>
              <td className="py-3 px-4 whitespace-nowrap text-gray-700 text-right">
                {formatCurrency(type.price)}
              </td>
              <td className="py-3 px-4 whitespace-nowrap text-gray-700 text-center">
                {type.durationMonths}개월
              </td>
              <td className="py-3 px-4 whitespace-nowrap text-gray-700 text-center">
                {type.maxUses != null ? (type.maxUses === 0 ? '무제한' : `${type.maxUses}회`) : '-'}
              </td>
              <td className="py-3 px-4 whitespace-nowrap text-center">
                {type.isActive ? 
                  <CheckCircle size={18} className="text-green-500 inline" /> : 
                  <XCircle size={18} className="text-red-500 inline" />
                }
              </td>
              <td className="py-3 px-4 whitespace-nowrap text-center">
                <div 
                  className="flex justify-center items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); onViewType(type); }} // 이벤트 전파 중단 추가
                    className="p-1 text-blue-500 hover:text-blue-700 transition-colors" 
                    title="상세보기"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onEditType(type); }} // 이벤트 전파 중단 추가
                    className="p-1 text-yellow-500 hover:text-yellow-700 transition-colors" 
                    title="수정"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={(e) => { // 이벤트 전파 중단 추가 및 확인창
                      e.stopPropagation();
                      if (window.confirm('이 이용권을 삭제하시겠습니까? 관련된 결제 내역에 영향을 줄 수 있습니다.')) {
                        if (type.id) onDeleteType(type.id);
                      }
                    }}
                    className="p-1 text-red-500 hover:text-red-700 transition-colors" 
                    title="삭제"
                    disabled={!type.id}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MembershipTypeList; 