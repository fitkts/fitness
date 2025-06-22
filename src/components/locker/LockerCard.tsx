import React from 'react';
import { Edit, Trash2, Key, Clock } from 'lucide-react';
import { Locker } from '../../models/types';
import { LOCKER_STATUS_STYLES, LockerAction, LOCKER_CARD_COMPACT_CONFIG } from '../../config/lockerConfig';
import { calculateDaysUntilExpiry } from '../../utils/lockerUtils';

interface LockerCardProps {
  locker: Locker;
  onAction: (action: LockerAction, locker: Locker) => void;
}

const LockerCard: React.FC<LockerCardProps> = ({ locker, onAction }) => {
  const statusStyle = LOCKER_STATUS_STYLES[locker.status || 'available'];
  const daysUntilExpiry = calculateDaysUntilExpiry(locker.endDate);
  
  // 만료 임박 알림 (7일 이내)
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry <= 0;

  return (
    <div className={`${LOCKER_CARD_COMPACT_CONFIG.CONTAINER.padding} ${LOCKER_CARD_COMPACT_CONFIG.CONTAINER.border} ${statusStyle.container}`}>
      {/* 헤더 */}
      <div className={LOCKER_CARD_COMPACT_CONFIG.HEADER.spacing}>
        <div className="flex-1 min-w-0">
          <h3 className={`${LOCKER_CARD_COMPACT_CONFIG.HEADER.titleSize} truncate`}>
            #{locker.number}
          </h3>
          <p className={`${LOCKER_CARD_COMPACT_CONFIG.HEADER.statusSize} ${statusStyle.text}`}>
            {statusStyle.label}
          </p>
        </div>
        
        {/* 액션 버튼들 */}
        <div className={`flex ${LOCKER_CARD_COMPACT_CONFIG.HEADER.gap} flex-shrink-0`}>
          <button
            onClick={() => onAction('view', locker)}
            className={`text-gray-600 hover:text-gray-900 transition-colors ${LOCKER_CARD_COMPACT_CONFIG.ACTION_BUTTONS.padding} ${LOCKER_CARD_COMPACT_CONFIG.ACTION_BUTTONS.hover}`}
            title="상세 보기"
          >
            <Key size={LOCKER_CARD_COMPACT_CONFIG.ACTION_BUTTONS.iconSize} />
          </button>
          <button
            onClick={() => onAction('edit', locker)}
            className={`text-blue-600 hover:text-blue-900 transition-colors ${LOCKER_CARD_COMPACT_CONFIG.ACTION_BUTTONS.padding} ${LOCKER_CARD_COMPACT_CONFIG.ACTION_BUTTONS.hover}`}
            title="수정"
          >
            <Edit size={LOCKER_CARD_COMPACT_CONFIG.ACTION_BUTTONS.iconSize} />
          </button>
          <button
            onClick={() => onAction('delete', locker)}
            className={`text-red-600 hover:text-red-900 transition-colors ${LOCKER_CARD_COMPACT_CONFIG.ACTION_BUTTONS.padding} ${LOCKER_CARD_COMPACT_CONFIG.ACTION_BUTTONS.hover}`}
            title="삭제"
          >
            <Trash2 size={LOCKER_CARD_COMPACT_CONFIG.ACTION_BUTTONS.iconSize} />
          </button>
        </div>
      </div>

      {/* 사용자 정보 */}
      {locker.memberName && locker.status === 'occupied' && (
        <div className={`${LOCKER_CARD_COMPACT_CONFIG.CONTENT.marginTop} ${LOCKER_CARD_COMPACT_CONFIG.CONTENT.paddingTop} ${LOCKER_CARD_COMPACT_CONFIG.CONTENT.border}`}>
          <p className={`${LOCKER_CARD_COMPACT_CONFIG.CONTENT.textSize} text-gray-600 truncate`}>
            <span className="font-medium">사용자:</span> {locker.memberName}
          </p>
          
          {/* 사용 기간 */}
          {locker.startDate && locker.endDate && (
            <div className={LOCKER_CARD_COMPACT_CONFIG.CONTENT.spacing}>
              <p className={`${LOCKER_CARD_COMPACT_CONFIG.CONTENT.textSize} text-gray-500 truncate`}>
                {locker.startDate?.split('-').slice(1).join('/')} ~ {locker.endDate?.split('-').slice(1).join('/')}
              </p>
              
              {/* 만료 정보 */}
              {daysUntilExpiry !== null && (
                <div className={LOCKER_CARD_COMPACT_CONFIG.EXPIRY_INFO.spacing}>
                  <Clock size={LOCKER_CARD_COMPACT_CONFIG.EXPIRY_INFO.iconSize} className={`${LOCKER_CARD_COMPACT_CONFIG.EXPIRY_INFO.marginRight} flex-shrink-0`} />
                  <span 
                    className={`${LOCKER_CARD_COMPACT_CONFIG.CONTENT.textSize} truncate ${
                      isExpired 
                        ? 'text-red-600 font-medium' 
                        : isExpiringSoon 
                          ? 'text-orange-600 font-medium'
                          : 'text-gray-500'
                    }`}
                  >
                    {isExpired 
                      ? `${Math.abs(daysUntilExpiry)}일 초과` 
                      : `${daysUntilExpiry}일 남음`
                    }
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 비고 */}
      {locker.notes && (
        <div className={`${LOCKER_CARD_COMPACT_CONFIG.CONTENT.marginTop} ${LOCKER_CARD_COMPACT_CONFIG.CONTENT.paddingTop} ${LOCKER_CARD_COMPACT_CONFIG.CONTENT.border}`}>
          <p 
            className={`${LOCKER_CARD_COMPACT_CONFIG.CONTENT.textSize} text-gray-600 break-words`}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {locker.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default LockerCard; 