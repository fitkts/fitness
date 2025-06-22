import React from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  Star, 
  Database 
} from 'lucide-react';
import { ConsultationMember, ConsultationSortConfig } from '../../types/consultation';
import { formatDate, formatPhoneNumber, formatConsultationStatus } from '../../utils/consultationFormatters';
import { STATUS_BADGE_STYLES, CONSULTATION_STATUS_OPTIONS } from '../../config/consultationConfig';
import { CONSULTATION_TABLE_CONFIG } from '../../config/consultationFilterConfig';

interface ConsultationTableRefactoredProps {
  members: ConsultationMember[];
  sortConfig: ConsultationSortConfig;
  onSort: (key: string) => void;
  onView: (member: ConsultationMember) => void;
  onPromote: (member: ConsultationMember) => void;
}

const ConsultationTableRefactored: React.FC<ConsultationTableRefactoredProps> = ({
  members,
  sortConfig,
  onSort,
  onView,
  onPromote,
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

  const renderStatusBadge = (status?: string) => {
    if (!status) return <span className="text-gray-400">-</span>;
    
    const config = CONSULTATION_STATUS_OPTIONS.find(opt => opt.value === status);
    const badgeStyle = STATUS_BADGE_STYLES[status as keyof typeof STATUS_BADGE_STYLES];
    
    return (
      <span 
        className="px-2 py-1 rounded-full text-xs font-medium"
        style={badgeStyle}
      >
        {config?.label || status}
      </span>
    );
  };

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div
          className="w-full overflow-x-auto"
          style={{ 
            maxHeight: CONSULTATION_TABLE_CONFIG.MAX_HEIGHT, 
            minWidth: CONSULTATION_TABLE_CONFIG.MIN_WIDTH 
          }}
        >
          <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <td
                  colSpan={8}
                  className="py-8 px-4 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center">
                    <Database size={48} className="text-gray-300 mb-3" />
                    <p className="text-lg">상담 회원 정보가 없습니다.</p>
                    <p className="text-sm text-gray-400 mt-1">
                      새로운 상담을 등록하려면 '신규 상담 등록' 버튼을 클릭하세요.
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
          maxHeight: CONSULTATION_TABLE_CONFIG.MAX_HEIGHT, 
          minWidth: CONSULTATION_TABLE_CONFIG.MIN_WIDTH 
        }}
      >
        <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
          <thead 
            className="bg-gray-50 border-b border-gray-200 sticky top-0"
            style={{ zIndex: CONSULTATION_TABLE_CONFIG.STICKY_HEADER_Z_INDEX }}
          >
            <tr>
              {[
                { key: 'name', label: '회원명' },
                { key: 'phone', label: '연락처' },
                { key: 'gender', label: '성별' },
                { key: 'birth_date', label: '생년월일' },
                { key: 'consultation_status', label: '상담 상태' },
                { key: 'staff_name', label: '담당자' },
                { key: 'first_visit', label: '최초 방문일' },
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
                  {formatPhoneNumber(member.phone) || '-'}
                </td>
                <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-gray-700">
                  {member.gender || '-'}
                </td>
                <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-gray-700">
                  {member.birth_date ? formatDate(member.birth_date) : '-'}
                </td>
                <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap">
                  {renderStatusBadge(member.consultation_status)}
                </td>
                <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-gray-700">
                  {member.staff_name || '-'}
                </td>
                <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-gray-700">
                  {member.first_visit ? formatDate(member.first_visit) : '-'}
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
                      <Eye size={16} />
                    </button>
                    {!member.is_promoted && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPromote(member);
                        }}
                        className="text-green-500 hover:text-green-700 transition-colors p-1"
                        title="정식 회원으로 승격"
                      >
                        <Star size={16} />
                      </button>
                    )}
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

export default ConsultationTableRefactored; 