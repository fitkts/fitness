import React from 'react';
import { Edit, Trash2, Key, Clock } from 'lucide-react';
import { Locker } from '../../models/types';
import { LOCKER_STATUS_STYLES, LockerAction } from '../../config/lockerConfig';
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
    <div className={`p-3 rounded-lg shadow-sm border ${statusStyle.container}`}>
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            #{locker.number}
          </h3>
          <p className={`text-xs font-medium ${statusStyle.text}`}>
            {statusStyle.label}
          </p>
          
          {/* 크기와 위치 정보 */}
          {(locker.size || locker.location) && (
            <div className="mt-1 text-xs text-gray-500 truncate">
              {locker.size && <span className="capitalize">{locker.size}</span>}
              {locker.size && locker.location && <span className="mx-1">•</span>}
              {locker.location && <span>{locker.location}</span>}
            </div>
          )}
        </div>
        
        {/* 액션 버튼들 */}
        <div className="flex gap-1 ml-2 flex-shrink-0">
          <button
            onClick={() => onAction('view', locker)}
            className="text-gray-600 hover:text-gray-900 transition-colors p-1"
            title="상세 보기"
          >
            <Key size={14} />
          </button>
          <button
            onClick={() => onAction('edit', locker)}
            className="text-blue-600 hover:text-blue-900 transition-colors p-1"
            title="수정"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => onAction('delete', locker)}
            className="text-red-600 hover:text-red-900 transition-colors p-1"
            title="삭제"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* 사용자 정보 */}
      {locker.memberName && locker.status === 'occupied' && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-600 truncate">
            <span className="font-medium">사용자:</span> {locker.memberName}
          </p>
          
          {/* 사용 기간 */}
          {locker.startDate && locker.endDate && (
            <div className="mt-1">
              <p className="text-xs text-gray-500 truncate">
                {locker.startDate?.split('-').slice(1).join('/')} ~ {locker.endDate?.split('-').slice(1).join('/')}
              </p>
              
              {/* 만료 정보 */}
              {daysUntilExpiry !== null && (
                <div className="flex items-center mt-1">
                  <Clock size={12} className="mr-1 flex-shrink-0" />
                  <span 
                    className={`text-xs truncate ${
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
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p 
            className="text-xs text-gray-600 break-words"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
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