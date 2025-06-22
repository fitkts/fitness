import { DESIGN_SYSTEM, COMMON_STYLES, STATUS_BADGE_STYLES } from '../config/designSystemConfig';

// 페이지 구조 생성 함수
export interface PageStructure {
  containerClass: string;
  headerClass: string;
  titleClass: string;
  title: string;
}

export const createPageStructure = (title: string): PageStructure => {
  return {
    containerClass: DESIGN_SYSTEM.spacing.pageContainer,
    headerClass: DESIGN_SYSTEM.layout.pageHeader.wrapper,
    titleClass: `${DESIGN_SYSTEM.typography.pageTitle} ${DESIGN_SYSTEM.colors.text.primary}`,
    title
  };
};

// 버튼 스타일 생성 함수
export const getButtonStyle = (variant: keyof typeof DESIGN_SYSTEM.buttons): string => {
  return DESIGN_SYSTEM.buttons[variant];
};

// 버튼 클래스 조합 함수
export const combineButtonClasses = (variant: keyof typeof DESIGN_SYSTEM.buttons, additionalClasses?: string): string => {
  const baseClasses = getButtonStyle(variant);
  return additionalClasses ? `${baseClasses} ${additionalClasses}` : baseClasses;
};

// 카드 스타일 생성 함수
export const createCardStyle = (variant: 'default' | 'stats' | 'small' | 'error' = 'default'): string => {
  switch (variant) {
    case 'stats':
      return 'bg-white rounded-lg border border-gray-200 shadow-sm p-4';
    case 'small':
      return 'bg-white rounded-lg border border-gray-200 shadow-sm p-3';
    case 'error':
      return 'bg-red-50 border border-red-200 rounded-lg p-4';
    default:
      return COMMON_STYLES.card;
  }
};

// 상태 배지 스타일 함수
export const getStatusBadgeStyle = (status: 'active' | 'expired' | 'warning' | 'inactive'): string => {
  const baseClasses = COMMON_STYLES.badge;
  const statusClasses = STATUS_BADGE_STYLES[status];
  return `${baseClasses} ${statusClasses}`;
};

// 테이블 관련 스타일 함수
export const getTableHeaderStyle = (): string => {
  return COMMON_STYLES.tableHeader;
};

export const getTableCellStyle = (): string => {
  return COMMON_STYLES.tableCell;
};

// 입력 필드 스타일 함수
export const getInputStyle = (hasError: boolean = false): string => {
  const baseStyle = COMMON_STYLES.input;
  return hasError ? baseStyle.replace('border-gray-300', 'border-red-500') : baseStyle;
};

export const getSelectStyle = (hasError: boolean = false): string => {
  const baseStyle = COMMON_STYLES.select;
  return hasError ? baseStyle.replace('border-gray-300', 'border-red-500') : baseStyle;
};

// 색상 유틸리티 함수
export const getColorClass = (colorType: 'primary' | 'secondary' | 'success' | 'warning' | 'error'): string => {
  switch (colorType) {
    case 'primary':
      return DESIGN_SYSTEM.colors.primary.blue;
    case 'secondary':
      return DESIGN_SYSTEM.colors.secondary.gray;
    case 'success':
      return DESIGN_SYSTEM.colors.status.success;
    case 'warning':
      return DESIGN_SYSTEM.colors.status.warning;
    case 'error':
      return DESIGN_SYSTEM.colors.status.error;
    default:
      return DESIGN_SYSTEM.colors.primary.blue;
  }
};

// 타이포그래피 유틸리티 함수
export const getTypographyClass = (variant: keyof typeof DESIGN_SYSTEM.typography): string => {
  return DESIGN_SYSTEM.typography[variant];
};

// 간격 유틸리티 함수
export const getSpacingClass = (variant: keyof typeof DESIGN_SYSTEM.spacing): string => {
  return DESIGN_SYSTEM.spacing[variant];
};

// 그리드 스타일 함수
export const getGridStyle = (columns: 2 | 3 | 4): string => {
  switch (columns) {
    case 2:
      return 'grid grid-cols-1 md:grid-cols-2 gap-6';
    case 3:
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
    case 4:
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6';
    default:
      return 'grid grid-cols-1 gap-6';
  }
};

// 페이지네이션 버튼 스타일 함수
export const getPaginationButtonStyle = (isActive: boolean = false, isDisabled: boolean = false): string => {
  let baseStyle = 'relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors';
  
  if (isDisabled) {
    return `${baseStyle} border-gray-300 text-gray-400 bg-white cursor-not-allowed opacity-50`;
  }
  
  if (isActive) {
    return `${baseStyle} z-10 bg-blue-50 border-blue-500 text-blue-600`;
  }
  
  return `${baseStyle} bg-white border-gray-300 text-gray-500 hover:bg-gray-50`;
};

// 모달 스타일 함수
export const getModalOverlayStyle = (): string => {
  return 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
};

export const getModalContentStyle = (): string => {
  return 'bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden';
};

// 로딩 스피너 스타일 함수
export const getLoadingSpinnerStyle = (size: 'sm' | 'md' | 'lg' = 'md'): string => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };
  
  return `animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`;
};

// 아바타 스타일 함수
export const getAvatarStyle = (size: 'sm' | 'md' | 'lg' = 'md'): string => {
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-12 w-12 text-lg'
  };
  
  return `${sizeClasses[size]} rounded-full bg-blue-100 flex items-center justify-center font-medium text-blue-600`;
}; 