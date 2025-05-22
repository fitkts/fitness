import React from 'react';
import { Search, Filter, Plus, Download } from 'lucide-react';

interface PaymentActionsProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  showFilterOptions: boolean;
  onShowFilterOptionsToggle: () => void;
  onAddNewPayment: () => void;
  onExportExcel: () => void;
}

const PaymentActions: React.FC<PaymentActionsProps> = ({
  searchTerm,
  onSearchTermChange,
  showFilterOptions,
  onShowFilterOptionsToggle,
  onAddNewPayment,
  onExportExcel,
}) => {
  return (
    <div className="flex flex-wrap gap-4 items-center mb-4">
      <div className="relative flex-grow">
        <input
          type="text"
          placeholder="회원명, 이용권, 영수증 번호로 검색..."
          className="border border-gray-300 p-3 rounded-md w-full pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
        />
        <Search
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
      </div>

      <button
        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-md flex items-center transition-colors"
        onClick={onShowFilterOptionsToggle}
      >
        <Filter size={18} className="mr-2" />
        필터 {showFilterOptions ? '숨기기' : '보기'}
      </button>

      <button
        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-md flex items-center transition-colors ml-auto"
        onClick={onAddNewPayment}
      >
        <Plus size={18} className="mr-2" />새 결제 등록
      </button>

      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <button
          title="엑셀 내보내기"
          style={{
            background: '#f3f4f6',
            border: 'none',
            borderRadius: 4,
            padding: 6,
            cursor: 'pointer',
          }}
          onClick={onExportExcel}
        >
          <Download size={16} />
        </button>
      </div>
    </div>
  );
};

export default PaymentActions; 