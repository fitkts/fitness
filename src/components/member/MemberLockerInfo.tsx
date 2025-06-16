import React, { useState, useEffect } from 'react';
import { MemberLockerInfo } from '../../types/locker';
import { convertToMemberLockerInfo, formatDateToKorean } from '../../utils/lockerUtils';
import { useToast } from '../../contexts/ToastContext';

interface MemberLockerInfoProps {
  memberId: number;
  className?: string;
}

const MemberLockerInfoComponent: React.FC<MemberLockerInfoProps> = ({ 
  memberId, 
  className = '' 
}) => {
  const [lockerInfo, setLockerInfo] = useState<MemberLockerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    const fetchLockerInfo = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (window.api && window.api.getLockerByMemberId) {
          const response = await window.api.getLockerByMemberId(memberId);
          
          if (response.success) {
            const convertedInfo = convertToMemberLockerInfo(response.data);
            setLockerInfo(convertedInfo);
          } else {
            setLockerInfo(null);
            if (response.error) {
              setError('락커 정보를 불러올 수 없습니다');
            }
          }
        } else {
          setError('락커 정보 API를 사용할 수 없습니다');
        }
      } catch (err) {
        console.error('락커 정보 조회 오류:', err);
        setError('락커 정보를 불러올 수 없습니다');
      } finally {
        setIsLoading(false);
      }
    };

    if (memberId) {
      fetchLockerInfo();
    }
  }, [memberId]);

  if (isLoading) {
    return (
      <div className={`bg-gray-50 p-4 rounded-lg ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-900">🗄️ 락커 정보</h4>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
        </div>
        <p className="text-sm text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 p-4 rounded-lg ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-red-900">🗄️ 락커 정보</h4>
          <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">오류</span>
        </div>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!lockerInfo) {
    return (
      <div className={`bg-gray-50 p-4 rounded-lg ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-900">🗄️ 락커 정보</h4>
          <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded">미사용</span>
        </div>
        <p className="text-sm text-gray-500">사용 중인 락커 없음</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expiring_soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string, daysRemaining: number) => {
    switch (status) {
      case 'active':
        return `${daysRemaining}일 남음`;
      case 'expiring_soon':
        return `${daysRemaining}일 후 만료`;
      case 'expired':
        return '만료됨';
      default:
        return '확인 필요';
    }
  };

  return (
    <div className={`bg-blue-50 p-4 rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900">🗄️ 락커 정보</h4>
        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(lockerInfo.status)}`}>
          {getStatusText(lockerInfo.status, lockerInfo.daysRemaining)}
        </span>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">락커 번호:</span>
          <span className="font-medium text-blue-700">{lockerInfo.number}번</span>
        </div>
        
        {lockerInfo.location && (
          <div className="flex justify-between">
            <span className="text-gray-600">위치:</span>
            <span className="font-medium">{lockerInfo.location}</span>
          </div>
        )}
        
        {lockerInfo.size && (
          <div className="flex justify-between">
            <span className="text-gray-600">크기:</span>
            <span className="font-medium">
              {lockerInfo.size === 'small' ? '소형' : 
               lockerInfo.size === 'medium' ? '중형' : '대형'}
            </span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span className="text-gray-600">월 사용료:</span>
          <span className="font-medium">{lockerInfo.monthlyFee.toLocaleString()}원</span>
        </div>
        
        <div className="flex justify-between text-xs border-t pt-2 mt-2">
          <span className="text-gray-600">사용 기간:</span>
          <span className="font-medium">
            {formatDateToKorean(lockerInfo.startDate)} ~ {formatDateToKorean(lockerInfo.endDate)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MemberLockerInfoComponent; 