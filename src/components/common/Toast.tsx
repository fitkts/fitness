import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  type: ToastType;
  message: string;
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
  type,
  message,
  duration = 3000,
  onClose,
}) => {
  // 일정 시간 후 자동으로 닫기
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // 타입에 따른 아이콘과 스타일 결정
  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="text-green-500" size={20} />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
        };
      case 'error':
        return {
          icon: <XCircle className="text-red-500" size={20} />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
        };
      case 'warning':
        return {
          icon: <AlertCircle className="text-yellow-500" size={20} />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
        };
      case 'info':
      default:
        return {
          icon: <Info className="text-blue-500" size={20} />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
        };
    }
  };

  const { icon, bgColor, borderColor, textColor } = getToastConfig();

  return (
    <div
      className={`fixed right-4 top-4 flex items-center ${bgColor} border ${borderColor} ${textColor} px-4 py-3 rounded shadow-lg z-[100] min-w-[300px] max-w-md animate-slideIn`}
    >
      <div className="mr-3">{icon}</div>
      <div className="flex-1">{message}</div>
      <button
        onClick={onClose}
        className="ml-2 text-gray-500 hover:text-gray-700"
        aria-label="닫기"
      >
        <XCircle size={18} />
      </button>
    </div>
  );
};

export default Toast;
