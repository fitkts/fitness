import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { ToastProvider } from '@/contexts/ToastContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'md'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300); // 애니메이션 시간과 동일하게 설정
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ESC 키 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 외부 클릭 이벤트 핸들러
  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // 모달 너비 설정
  const getModalWidth = () => {
    switch (size) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-2xl md:max-w-3xl lg:max-w-4xl'; // 데스크탑에서 더 넓게, 모바일에서는 적당히
      default: return 'max-w-md';
    }
  };

  if (!isVisible && !isOpen) return null;

  // createPortal을 사용하여 모달을 ToastProvider 내부에 렌더링
  const modalRoot = document.getElementById('root');
  if (!modalRoot) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl md:max-w-3xl lg:max-w-4xl',
  };

  return createPortal(
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-8 ${
        isOpen ? 'animate-fadeIn' : 'animate-fadeOut'
      }`}
      onClick={handleOutsideClick}
    >
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      <div
        ref={modalRef}
        className={`relative bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto px-2 sm:px-6 py-4 animate-slideIn`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>,
    modalRoot
  );
};

export default Modal; 