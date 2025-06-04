import React from 'react';
import { X, Check } from 'lucide-react';
import { KPICardConfig } from '../types/statistics';

interface KPICardEditModalProps {
  isOpen: boolean;
  kpiCards: KPICardConfig[];
  enabledCards: KPICardConfig[];
  onClose: () => void;
  onSave: () => void;
  onToggleCard: (cardId: string) => void;
  onToggleAllCards: (enabled: boolean) => void;
  onToggleCategoryCards: (category: string, enabled: boolean) => void;
}

const KPICardEditModal: React.FC<KPICardEditModalProps> = ({
  isOpen,
  kpiCards,
  enabledCards,
  onClose,
  onSave,
  onToggleCard,
  onToggleAllCards,
  onToggleCategoryCards
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">KPI 카드 편집</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 모달 내용 */}
        <div className="p-6">
          {/* 전체 선택/해제 */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div>
              <h4 className="text-lg font-medium text-gray-800">표시할 KPI 카드 선택</h4>
              <p className="text-sm text-gray-600 mt-1">
                활성화된 카드: {enabledCards.length}개 / 전체: {kpiCards.length}개
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleAllCards(false)}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              >
                모두 해제
              </button>
              <button
                onClick={() => onToggleAllCards(true)}
                className="px-3 py-1.5 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-md transition-colors"
              >
                모두 선택
              </button>
            </div>
          </div>

          {/* 카테고리별 카드 목록 */}
          {['매출', '회원', '운영', '성과'].map(category => {
            const categoryCards = kpiCards.filter(card => card.category === category);
            const enabledCategoryCards = categoryCards.filter(card => card.enabled);
            
            return (
              <div key={category} className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-md font-medium text-gray-700">
                    {category} ({enabledCategoryCards.length}/{categoryCards.length})
                  </h5>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleCategoryCards(category, false)}
                      className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    >
                      해제
                    </button>
                    <button
                      onClick={() => onToggleCategoryCards(category, true)}
                      className="px-2 py-1 text-xs bg-gray-200 text-gray-700 hover:bg-gray-300 rounded transition-colors"
                    >
                      선택
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categoryCards.map(card => (
                    <div
                      key={card.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        card.enabled 
                          ? 'border-blue-300 bg-blue-50' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                      onClick={() => onToggleCard(card.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${card.color}`}>
                            {card.icon}
                          </div>
                          <div>
                            <h6 className="font-medium text-gray-800">{card.title}</h6>
                            <p className="text-sm text-gray-600">{card.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={card.enabled}
                            onChange={() => onToggleCard(card.id)}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* 모달 푸터 */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            변경사항은 자동으로 저장됩니다
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors flex items-center"
            >
              <Check size={18} className="mr-2" />
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KPICardEditModal; 