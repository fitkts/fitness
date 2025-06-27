import React from 'react';
import {
  ChevronUp,
  ChevronDown,
  Info,
  Edit3,
  Trash2,
  Database,
} from 'lucide-react';
import { Payment } from '../../models/types';
import { PAYMENT_TABLE_CONFIG } from '../../config/paymentConfig';

interface PaymentTableProps {
  payments: Payment[];
  sortConfig: {
    key: string;
    direction: 'ascending' | 'descending' | null;
  };
  requestSort: (key: string) => void;
  formatDate: (dateString: string | undefined | null) => string;
  formatCurrency: (value: number) => string;
  onViewPayment: (payment: Payment) => void;
  onEditPayment: (payment: Payment) => void;
  onDeletePayment: (paymentId: number) => void;
}

const PaymentTable: React.FC<PaymentTableProps> = ({
  payments,
  sortConfig,
  requestSort,
  formatDate,
  formatCurrency,
  onViewPayment,
  onEditPayment,
  onDeletePayment,
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

  const getStatusBadge = (status: Payment['status']) => {
    const badgeClass = `px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full`;
    
    switch (status) {
      case '완료':
        return <span className={`${badgeClass} bg-green-100 text-green-800`}>완료</span>;
      case '취소':
        return <span className={`${badgeClass} bg-yellow-100 text-yellow-800`}>취소</span>;
      case '환불':
        return <span className={`${badgeClass} bg-red-100 text-red-800`}>환불</span>;
      default:
        return <span className={`${badgeClass} bg-gray-100 text-gray-800`}>{status || '알 수 없음'}</span>;
    }
  };

  if (payments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div
          className="w-full overflow-x-auto"
          style={{ 
            maxHeight: 'calc(100vh - 350px)', 
            minWidth: 600 
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
                    <p className="text-lg">결제 내역이 없습니다.</p>
                    <p className="text-sm text-gray-400 mt-1">
                      결제를 등록하려면 '새 결제 등록' 버튼을 클릭하세요.
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
          maxHeight: 'calc(100vh - 350px)', 
          minWidth: 600 
        }}
      >
        <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
          <thead 
            className="bg-gray-50 border-b border-gray-200 sticky top-0"
            style={{ zIndex: 10 }}
          >
            <tr>
              {[
                { key: 'memberName', label: '회원명' },
                { key: 'paymentDate', label: '결제일' },
                { key: 'membershipType', label: '이용권' },
                { key: 'paymentMethod', label: '결제 방법' },
                { key: 'amount', label: '금액' },
                { key: 'status', label: '상태' },
                { key: 'staffName', label: '담당 직원' },
                { key: 'actions', label: '작업', sortable: false },
              ].map((column) => (
                <th
                  key={column.key}
                  className={`py-2 px-2 sm:py-2.5 sm:px-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable !== false
                      ? 'cursor-pointer hover:bg-gray-100 transition-colors'
                      : ''
                  } ${column.key === 'actions' ? 'text-center' : ''} ${column.key === 'amount' ? 'text-right' : ''}`}
                  onClick={() => 
                    column.sortable !== false ? requestSort(column.key) : undefined
                  }
                >
                  <div className={`flex items-center ${column.key === 'amount' ? 'justify-end' : ''}`}>
                    {column.label}
                    {column.sortable !== false && renderSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {payments.map((payment) => (
              <tr
                key={payment.id}
                className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer group"
                onClick={() => onViewPayment(payment)}
              >
                <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap font-medium text-gray-900 group-hover:text-blue-600">
                  {payment.memberName || `ID:${payment.memberId}`}
                </td>
                <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-gray-700">
                  {formatDate(payment.paymentDate)}
                </td>
                <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-gray-700">
                  {payment.membershipType || 'N/A'}
                </td>
                <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-gray-700">
                  {payment.paymentType}
                </td>
                <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-right text-gray-900">
                  ₩ {formatCurrency(payment.amount)}
                </td>
                <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap">
                  {getStatusBadge(payment.status)}
                </td>
                <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-gray-700">
                  {payment.staffName || '-'}
                </td>
                <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-center">
                  <div
                    className="flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewPayment(payment);
                      }}
                      className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                      title="상세보기"
                    >
                      <Info size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditPayment(payment);
                      }}
                      className="text-yellow-500 hover:text-yellow-700 transition-colors p-1"
                      title="수정"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            '이 결제 기록을 삭제하시겠습니까?',
                          )
                        ) {
                          onDeletePayment(payment.id!);
                        }
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

export default PaymentTable; 