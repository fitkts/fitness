import React from 'react';
import {
  ChevronUp,
  ChevronDown,
  Info,
  Edit,
  Trash2,
  Database,
  Edit3,
} from 'lucide-react';
import { Payment, MembershipType } from '../../models/types'; // MembershipType 추가
import { PAYMENT_TABLE_CONFIG } from '../../config/paymentConfig';

interface PaymentTableProps {
  payments: Payment[];
  membershipTypes: MembershipType[]; // 이용권 정보를 가져오기 위해 추가
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
  membershipTypes, // prop 추가
  sortConfig,
  requestSort,
  formatDate,
  formatCurrency,
  onViewPayment,
  onEditPayment,
  onDeletePayment,
}) => {
  if (!payments || payments.length === 0) {
    // 데이터 없을 때의 표시는 부모 컴포넌트(Payment.tsx)에서 이미 처리하므로 여기서는 null 반환 가능
    // 또는 여기서도 간단한 메시지 표시 가능
    return null; 
  }

  const getMembershipTypeName = (membershipTypeName: string | undefined): string => {
    if (membershipTypeName === undefined) return 'N/A';
    return membershipTypeName || 'N/A';
  };

  const getStatusBadge = (status: Payment['status']) => {
    const badgeClass = `px-2 py-0.5 inline-flex ${PAYMENT_TABLE_CONFIG.HEADER.badgeTextSize} leading-5 font-semibold rounded-full`;
    
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div
        className="w-full overflow-x-auto"
        style={{ maxHeight: 'calc(100vh - 350px)', minWidth: 600 }}
      >
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th
                className={`${PAYMENT_TABLE_CONFIG.HEADER.cellPadding} text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors`}
                onClick={() => requestSort('memberName')}
              >
                <div className="flex items-center">
                  회원명
                  {sortConfig.key === 'memberName' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ascending' ? (
                        <ChevronUp className="text-blue-500" size={PAYMENT_TABLE_CONFIG.PAGINATION.iconSize} />
                      ) : sortConfig.direction === 'descending' ? (
                        <ChevronDown className="text-blue-500" size={PAYMENT_TABLE_CONFIG.PAGINATION.iconSize} />
                      ) : null}
                    </span>
                  )}
                </div>
              </th>
              <th
                className={`${PAYMENT_TABLE_CONFIG.HEADER.cellPadding} text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors`}
                onClick={() => requestSort('paymentDate')}
              >
                <div className="flex items-center">
                  결제일
                  {sortConfig.key === 'paymentDate' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ascending' ? (
                        <ChevronUp className="text-blue-500" size={PAYMENT_TABLE_CONFIG.PAGINATION.iconSize} />
                      ) : sortConfig.direction === 'descending' ? (
                        <ChevronDown className="text-blue-500" size={PAYMENT_TABLE_CONFIG.PAGINATION.iconSize} />
                      ) : null}
                    </span>
                  )}
                </div>
              </th>
              <th
                className={`${PAYMENT_TABLE_CONFIG.HEADER.cellPadding} text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors`}
                onClick={() => requestSort('membershipType')}
              >
                <div className="flex items-center">
                  이용권
                  {sortConfig.key === 'membershipType' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ascending' ? (
                        <ChevronUp className="text-blue-500" size={PAYMENT_TABLE_CONFIG.PAGINATION.iconSize} />
                      ) : sortConfig.direction === 'descending' ? (
                        <ChevronDown className="text-blue-500" size={PAYMENT_TABLE_CONFIG.PAGINATION.iconSize} />
                      ) : null}
                    </span>
                  )}
                </div>
              </th>
              <th
                className={`${PAYMENT_TABLE_CONFIG.HEADER.cellPadding} text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors`}
                onClick={() => requestSort('paymentMethod')}
              >
                <div className="flex items-center">
                  결제 방법
                  {sortConfig.key === 'paymentMethod' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ascending' ? (
                        <ChevronUp className="text-blue-500" size={PAYMENT_TABLE_CONFIG.PAGINATION.iconSize} />
                      ) : sortConfig.direction === 'descending' ? (
                        <ChevronDown className="text-blue-500" size={PAYMENT_TABLE_CONFIG.PAGINATION.iconSize} />
                      ) : null}
                    </span>
                  )}
                </div>
              </th>
              <th
                className={`${PAYMENT_TABLE_CONFIG.HEADER.cellPadding} text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors`}
                onClick={() => requestSort('amount')}
              >
                <div className="flex items-center justify-end">
                  금액
                  {sortConfig.key === 'amount' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ascending' ? (
                        <ChevronUp className="text-blue-500" size={PAYMENT_TABLE_CONFIG.PAGINATION.iconSize} />
                      ) : sortConfig.direction === 'descending' ? (
                        <ChevronDown className="text-blue-500" size={PAYMENT_TABLE_CONFIG.PAGINATION.iconSize} />
                      ) : null}
                    </span>
                  )}
                </div>
              </th>
              <th
                className={`${PAYMENT_TABLE_CONFIG.HEADER.cellPadding} text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors`}
                onClick={() => requestSort('status')}
              >
                <div className="flex items-center">
                  상태
                  {sortConfig.key === 'status' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ascending' ? (
                        <ChevronUp className="text-blue-500" size={PAYMENT_TABLE_CONFIG.PAGINATION.iconSize} />
                      ) : sortConfig.direction === 'descending' ? (
                        <ChevronDown className="text-blue-500" size={PAYMENT_TABLE_CONFIG.PAGINATION.iconSize} />
                      ) : null}
                    </span>
                  )}
                </div>
              </th>
              <th
                className={`${PAYMENT_TABLE_CONFIG.HEADER.cellPadding} text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors`}
                onClick={() => requestSort('staffName')}
              >
                <div className="flex items-center">
                  담당 직원
                  {sortConfig.key === 'staffName' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ascending' ? (
                        <ChevronUp className="text-blue-500" size={PAYMENT_TABLE_CONFIG.PAGINATION.iconSize} />
                      ) : sortConfig.direction === 'descending' ? (
                        <ChevronDown className="text-blue-500" size={PAYMENT_TABLE_CONFIG.PAGINATION.iconSize} />
                      ) : null}
                    </span>
                  )}
                </div>
              </th>
              <th className={`${PAYMENT_TABLE_CONFIG.HEADER.cellPadding} text-center text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                작업
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {payments.length > 0 ? (
              payments.map((payment) => (
                <tr
                  key={payment.id}
                  className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer group"
                  onClick={() => onViewPayment(payment)}
                >
                  <td className={`${PAYMENT_TABLE_CONFIG.CELL.padding} whitespace-nowrap font-medium text-gray-900 group-hover:text-blue-600`}>
                    {payment.memberName || `ID:${payment.memberId}`}
                  </td>
                  <td className={`${PAYMENT_TABLE_CONFIG.CELL.padding} whitespace-nowrap ${PAYMENT_TABLE_CONFIG.CELL.textSize} text-gray-700`}>
                    {formatDate(payment.paymentDate)}
                  </td>
                  <td className={`${PAYMENT_TABLE_CONFIG.CELL.padding} whitespace-nowrap ${PAYMENT_TABLE_CONFIG.CELL.textSize} text-gray-700`}>
                    {payment.membershipType || 'N/A'}
                  </td>
                  <td className={`${PAYMENT_TABLE_CONFIG.CELL.padding} whitespace-nowrap ${PAYMENT_TABLE_CONFIG.CELL.textSize} text-gray-700`}>
                    {payment.paymentType}
                  </td>
                  <td className={`${PAYMENT_TABLE_CONFIG.CELL.padding} whitespace-nowrap text-right ${PAYMENT_TABLE_CONFIG.CELL.textSize} text-gray-900`}>
                    ₩ {formatCurrency(payment.amount)}
                  </td>
                  <td className={`${PAYMENT_TABLE_CONFIG.CELL.padding} whitespace-nowrap`}>
                    {getStatusBadge(payment.status)}
                  </td>
                  <td className={`${PAYMENT_TABLE_CONFIG.CELL.padding} whitespace-nowrap ${PAYMENT_TABLE_CONFIG.CELL.textSize} text-gray-700`}>
                    {payment.staffName || '-'}
                  </td>
                  <td className={`${PAYMENT_TABLE_CONFIG.CELL.padding} whitespace-nowrap text-center`}>
                    <div
                      className="flex justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewPayment(payment);
                        }}
                        className="p-1 text-blue-500 hover:text-blue-700 transition-colors rounded hover:bg-blue-50"
                        title="상세보기"
                      >
                        <Info size={PAYMENT_TABLE_CONFIG.HEADER.iconSize} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditPayment(payment);
                        }}
                        className="p-1 text-yellow-500 hover:text-yellow-700 transition-colors rounded hover:bg-yellow-50"
                        title="수정"
                      >
                        <Edit3 size={PAYMENT_TABLE_CONFIG.HEADER.iconSize} />
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
                        className="p-1 text-red-500 hover:text-red-700 transition-colors rounded hover:bg-red-50"
                        title="삭제"
                      >
                        <Trash2 size={PAYMENT_TABLE_CONFIG.HEADER.iconSize} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className={`${PAYMENT_TABLE_CONFIG.EMPTY_STATE.containerPadding} text-center text-gray-500`}
                >
                  <div className="flex flex-col items-center justify-center">
                    <Database size={PAYMENT_TABLE_CONFIG.EMPTY_STATE.iconSize} className="text-gray-300 mb-3" />
                    <p className="text-lg">결제 내역이 없습니다.</p>
                    <p className="text-sm text-gray-400 mt-1">
                      결제를 등록하려면 '새 결제 등록' 버튼을 클릭하세요.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentTable; 