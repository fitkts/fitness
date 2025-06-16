import React from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Edit, 
  Trash2, 
  Info, 
  Database 
} from 'lucide-react';
import { Member } from '../../models/types';
import { SortConfig } from '../../types/member';
import { formatDate, getMembershipStatus } from '../../utils/memberUtils';
import { TABLE_CONFIG } from '../../config/memberConfig';

interface MemberTableProps {
  members: Member[];
  sortConfig: SortConfig;
  onSort: (key: string) => void;
  onView: (member: Member) => void;
  onEdit: (member: Member) => void;
  onDelete: (id: number) => void;
}

const MemberTable: React.FC<MemberTableProps> = ({
  members,
  sortConfig,
  onSort,
  onView,
  onEdit,
  onDelete,
}) => {
  const renderSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) return null;
    
    return (
      <span className="ml-1">
        {sortConfig.direction === 'ascending' ? (
          <ChevronUp className="text-blue-500" size={14} />
        ) : sortConfig.direction === 'descending' ? (
          <ChevronDown className="text-blue-500" size={14} />
        ) : null}
      </span>
    );
  };

  const getStatusBadge = (endDate: string | undefined | null) => {
    const status = getMembershipStatus(endDate);
    return (
      <span
        className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
          status === 'active'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}
      >
        {status === 'active' ? '활성' : '만료'}
      </span>
    );
  };

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div
          className="w-full overflow-x-auto"
          style={{ 
            maxHeight: TABLE_CONFIG.MAX_HEIGHT, 
            minWidth: TABLE_CONFIG.MIN_WIDTH 
          }}
        >
          <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <td
                  colSpan={9}
                  className="py-8 px-4 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center">
                    <Database size={48} className="text-gray-300 mb-3" />
                    <p className="text-lg">회원 정보가 없습니다.</p>
                    <p className="text-sm text-gray-400 mt-1">
                      회원을 추가하려면 '회원 추가' 버튼을 클릭하세요.
                    </p>
                  </div>
                </td>
              </tr>
            </thead>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div
        className="w-full overflow-x-auto"
        style={{ 
          maxHeight: TABLE_CONFIG.MAX_HEIGHT, 
          minWidth: TABLE_CONFIG.MIN_WIDTH 
        }}
      >
        <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
          <thead 
            className="bg-gray-50 border-b border-gray-200 sticky top-0"
            style={{ zIndex: TABLE_CONFIG.STICKY_HEADER_Z_INDEX }}
          >
            <tr>
              {[
                { key: 'name', label: '이름' },
                { key: 'gender', label: '성별' },
                { key: 'phone', label: '연락처' },
                { key: 'membershipType', label: '회원권 종류' },
                { key: 'membershipEnd', label: '만료일' },
                { key: 'createdAt', label: '최초 등록일' },
                { key: 'staffName', label: '담당자' },
                { key: 'status', label: '상태', sortable: false },
                { key: 'actions', label: '작업', sortable: false },
              ].map((column) => (
                <th
                  key={column.key}
                  className={`py-2 px-2 sm:py-2.5 sm:px-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable !== false
                      ? 'cursor-pointer hover:bg-gray-100 transition-colors'
                      : ''
                  } ${column.key === 'actions' ? 'text-center' : ''}`}
                  onClick={() => 
                    column.sortable !== false ? onSort(column.key) : undefined
                  }
                >
                  <div className="flex items-center">
                    {column.label}
                    {column.sortable !== false && renderSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {members.map((member) => (
              <tr
                key={member.id}
                className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer group"
                onClick={() => onView(member)}
              >
                <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap font-medium text-gray-900 group-hover:text-blue-600">
                  {member.name}
                </td>
                <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-gray-700">
                  {member.gender || '-'}
                </td>
                <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-gray-700">
                  {member.phone || '-'}
                </td>
                <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-gray-700">
                  {member.membershipType || '-'}
                </td>
                <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-gray-700">
                  {formatDate(member.membershipEnd)}
                </td>
                <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-gray-700">
                  {formatDate(member.createdAt)}
                </td>
                <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-gray-700">
                  {member.staffName || '-'}
                </td>
                <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap">
                  {getStatusBadge(member.membershipEnd)}
                </td>
                <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-center">
                  <div
                    className="flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(member);
                      }}
                      className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                      title="상세보기"
                    >
                      <Info size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(member);
                      }}
                      className="text-yellow-500 hover:text-yellow-700 transition-colors p-1"
                      title="수정"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(member.id!);
                      }}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                      title="삭제"
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
    </div>
  );
};

export default MemberTable; 