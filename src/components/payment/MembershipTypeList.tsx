import React from 'react';
import { MembershipType } from '../../models/types';
import { Eye, Edit3, Trash2, CheckCircle, XCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { MEMBERSHIP_TYPE_TABLE_CONFIG } from '../../config/paymentConfig';

interface MembershipTypeListProps {
  membershipTypes: MembershipType[];
  onViewType: (type: MembershipType) => void;
  onEditType: (type: MembershipType) => void;
  onDeleteType: (typeId: number) => void;
  sortConfig: {
    key: string;
    direction: 'ascending' | 'descending' | null;
  };
  requestSort: (key: string) => void;
  formatCurrency: (value: number | undefined | null) => string;
}

const MembershipTypeList: React.FC<MembershipTypeListProps> = ({
  membershipTypes,
  onViewType,
  onEditType,
  onDeleteType,
  sortConfig,
  requestSort,
  formatCurrency,
}) => {
  if (!membershipTypes || membershipTypes.length === 0) {
    return null;
  }

  const getSortIndicator = (key: string) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? 
        <ChevronUp className="text-blue-500 inline ml-1" size={MEMBERSHIP_TYPE_TABLE_CONFIG.PAGINATION.iconSize} /> : 
        <ChevronDown className="text-blue-500 inline ml-1" size={MEMBERSHIP_TYPE_TABLE_CONFIG.PAGINATION.iconSize} />;
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto w-full">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th 
                className={`${MEMBERSHIP_TYPE_TABLE_CONFIG.HEADER.cellPadding} text-left font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors`}
                onClick={() => requestSort('name')}
              >
                이용권 이름 {getSortIndicator('name')}
              </th>
              <th 
                className={`${MEMBERSHIP_TYPE_TABLE_CONFIG.HEADER.cellPadding} text-right font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors`}
                onClick={() => requestSort('price')}
              >
                가격(원) {getSortIndicator('price')}
              </th>
              <th 
                className={`${MEMBERSHIP_TYPE_TABLE_CONFIG.HEADER.cellPadding} text-center font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors`}
                onClick={() => requestSort('durationMonths')}
              >
                기간(개월) {getSortIndicator('durationMonths')}
              </th>
              <th 
                className={`${MEMBERSHIP_TYPE_TABLE_CONFIG.HEADER.cellPadding} text-center font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors`}
                onClick={() => requestSort('maxUses')}
              >
                최대횟수 {getSortIndicator('maxUses')}
              </th>
              <th 
                className={`${MEMBERSHIP_TYPE_TABLE_CONFIG.HEADER.cellPadding} text-center font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors`}
                onClick={() => requestSort('isActive')}
              >
                활성상태 {getSortIndicator('isActive')}
              </th>
              <th className={`${MEMBERSHIP_TYPE_TABLE_CONFIG.HEADER.cellPadding} text-center font-medium text-gray-500 uppercase tracking-wider`}>
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {membershipTypes.map((type) => (
              <tr 
                key={type.id} 
                className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer group"
                onClick={() => onViewType(type)}
              >
                <td className={`${MEMBERSHIP_TYPE_TABLE_CONFIG.CELL.padding} whitespace-nowrap font-medium text-gray-900 group-hover:text-blue-600`}>
                  {type.name}
                  {type.description && (
                    <p className={`${MEMBERSHIP_TYPE_TABLE_CONFIG.CELL.avatarTextSize} text-gray-500 mt-0.5 truncate max-w-xs`} title={type.description}>
                      {type.description}
                    </p>
                  )}
                </td>
                <td className={`${MEMBERSHIP_TYPE_TABLE_CONFIG.CELL.padding} whitespace-nowrap ${MEMBERSHIP_TYPE_TABLE_CONFIG.CELL.textSize} text-gray-700 text-right`}>
                  {formatCurrency(type.price)}
                </td>
                <td className={`${MEMBERSHIP_TYPE_TABLE_CONFIG.CELL.padding} whitespace-nowrap ${MEMBERSHIP_TYPE_TABLE_CONFIG.CELL.textSize} text-gray-700 text-center`}>
                  {type.durationMonths}개월
                </td>
                <td className={`${MEMBERSHIP_TYPE_TABLE_CONFIG.CELL.padding} whitespace-nowrap ${MEMBERSHIP_TYPE_TABLE_CONFIG.CELL.textSize} text-gray-700 text-center`}>
                  {type.maxUses != null ? (type.maxUses === 0 ? '무제한' : `${type.maxUses}회`) : '-'}
                </td>
                <td className={`${MEMBERSHIP_TYPE_TABLE_CONFIG.CELL.padding} whitespace-nowrap text-center`}>
                  {type.isActive ? 
                    <CheckCircle size={MEMBERSHIP_TYPE_TABLE_CONFIG.HEADER.iconSize} className="text-green-500 inline" /> : 
                    <XCircle size={MEMBERSHIP_TYPE_TABLE_CONFIG.HEADER.iconSize} className="text-red-500 inline" />
                  }
                </td>
                <td className={`${MEMBERSHIP_TYPE_TABLE_CONFIG.CELL.padding} whitespace-nowrap text-center`}>
                  <div 
                    className="flex justify-center items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); onViewType(type); }}
                      className="p-1 text-blue-500 hover:text-blue-700 transition-colors rounded hover:bg-blue-50" 
                      title="상세보기"
                    >
                      <Eye size={MEMBERSHIP_TYPE_TABLE_CONFIG.HEADER.iconSize} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditType(type); }}
                      className="p-1 text-yellow-500 hover:text-yellow-700 transition-colors rounded hover:bg-yellow-50" 
                      title="수정"
                    >
                      <Edit3 size={MEMBERSHIP_TYPE_TABLE_CONFIG.HEADER.iconSize} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('이 이용권을 삭제하시겠습니까? 관련된 결제 내역에 영향을 줄 수 있습니다.')) {
                          if (type.id) onDeleteType(type.id);
                        }
                      }}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors rounded hover:bg-red-50" 
                      title="삭제"
                      disabled={!type.id}
                    >
                      <Trash2 size={MEMBERSHIP_TYPE_TABLE_CONFIG.HEADER.iconSize} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MembershipTypeList; 