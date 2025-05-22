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

  const getStatusBadge = (status: Payment['status']) => { // Payment 타입의 status 사용
    switch (status) {
      case '완료': // 한글로 변경
        return <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">완료</span>;
      case '취소': // 한글로 변경
        return <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">취소</span>;
      case '환불': // 한글로 변경
        return <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">환불</span>;
      default:
        // 스키마에 없는 status 값이 온 경우 또는 '기타' 등의 상태
        return <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status || '알 수 없음'}</span>;
    }
  };

  return (
    <div
      className="w-full overflow-x-auto"
      style={{ maxHeight: 'calc(100vh - 350px)', minWidth: 600 }}
    >
      <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
          <tr>
            <th
              className="py-2 px-2 sm:py-2.5 sm:px-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => requestSort('memberName')}
            >
              <div className="flex items-center">
                회원명
                {sortConfig.key === 'memberName' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'ascending' ? (
                      <ChevronUp className="text-blue-500" size={14} />
                    ) : sortConfig.direction === 'descending' ? (
                      <ChevronDown className="text-blue-500" size={14} />
                    ) : null}
                  </span>
                )}
              </div>
            </th>
            <th
              className="py-2 px-2 sm:py-2.5 sm:px-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => requestSort('paymentDate')}
            >
              <div className="flex items-center">
                결제일
                {sortConfig.key === 'paymentDate' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'ascending' ? (
                      <ChevronUp className="text-blue-500" size={14} />
                    ) : sortConfig.direction === 'descending' ? (
                      <ChevronDown className="text-blue-500" size={14} />
                    ) : null}
                  </span>
                )}
              </div>
            </th>
            <th
              className="py-2 px-2 sm:py-2.5 sm:px-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => requestSort('membershipType')}
            >
              <div className="flex items-center">
                이용권
                {sortConfig.key === 'membershipType' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'ascending' ? (
                      <ChevronUp className="text-blue-500" size={14} />
                    ) : sortConfig.direction === 'descending' ? (
                      <ChevronDown className="text-blue-500" size={14} />
                    ) : null}
                  </span>
                )}
              </div>
            </th>
            <th
              className="py-2 px-2 sm:py-2.5 sm:px-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => requestSort('paymentMethod')}
            >
              <div className="flex items-center">
                결제 방법
                {sortConfig.key === 'paymentMethod' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'ascending' ? (
                      <ChevronUp className="text-blue-500" size={14} />
                    ) : sortConfig.direction === 'descending' ? (
                      <ChevronDown className="text-blue-500" size={14} />
                    ) : null}
                  </span>
                )}
              </div>
            </th>
            <th
              className="py-2 px-2 sm:py-2.5 sm:px-3 text-right text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => requestSort('amount')}
            >
              <div className="flex items-center justify-end">
                금액
                {sortConfig.key === 'amount' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'ascending' ? (
                      <ChevronUp className="text-blue-500" size={14} />
                    ) : sortConfig.direction === 'descending' ? (
                      <ChevronDown className="text-blue-500" size={14} />
                    ) : null}
                  </span>
                )}
              </div>
            </th>
            <th
              className="py-2 px-2 sm:py-2.5 sm:px-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => requestSort('status')}
            >
              <div className="flex items-center">
                상태
                {sortConfig.key === 'status' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'ascending' ? (
                      <ChevronUp className="text-blue-500" size={14} />
                    ) : sortConfig.direction === 'descending' ? (
                      <ChevronDown className="text-blue-500" size={14} />
                    ) : null}
                  </span>
                )}
              </div>
            </th>
            <th
              className="py-2 px-2 sm:py-2.5 sm:px-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => requestSort('staffName')}
            >
              <div className="flex items-center">
                담당 직원
                {sortConfig.key === 'staffName' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'ascending' ? (
                      <ChevronUp className="text-blue-500" size={14} />
                    ) : sortConfig.direction === 'descending' ? (
                      <ChevronDown className="text-blue-500" size={14} />
                    ) : null}
                  </span>
                )}
              </div>
            </th>
            <th className="py-2 px-2 sm:py-2.5 sm:px-3 text-center text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
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
                    onClick={(e) => e.stopPropagation()} // 이벤트 전파 중단
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
            ))
          ) : (
            <tr>
              <td
                colSpan={7} // 컬럼 수에 맞게 조정
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
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentTable; 