import { DesignSystem } from '../types/designSystem';

// Members.tsx 기준 디자인 시스템 설정
export const DESIGN_SYSTEM: DesignSystem = {
  layout: {
    container: 'space-y-6',
    pageHeader: {
      wrapper: 'flex items-center justify-between',
      title: 'text-3xl font-bold text-gray-800'
    },
    sections: [
      'SearchFilter',
      'Statistics',
      'TableWithPagination',
      'Modal'
    ]
  },

  colors: {
    primary: {
      blue: 'blue-600',
      blueHover: 'blue-700',
      blueLight: 'blue-100'
    },
    secondary: {
      gray: 'gray-600',
      grayHover: 'gray-700',
      grayLight: 'gray-100'
    },
    status: {
      success: 'green-600',
      warning: 'yellow-600',
      error: 'red-600',
      info: 'blue-600'
    },
    text: {
      primary: 'gray-800',
      secondary: 'gray-600',
      light: 'gray-500'
    }
  },

  typography: {
    pageTitle: 'text-3xl font-bold',
    sectionTitle: 'text-xl font-semibold',
    cardTitle: 'text-lg font-semibold',
    bodyText: 'text-sm',
    caption: 'text-xs text-gray-500'
  },

  buttons: {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors',
    success: 'bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors',
    danger: 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors'
  },

  spacing: {
    pageContainer: 'space-y-6',
    sectionGap: 'space-y-4',
    cardGap: 'space-y-3',
    formGap: 'space-y-2',
    inlineGap: 'space-x-2'
  }
};

// 자주 사용되는 스타일 조합
export const COMMON_STYLES = {
  card: 'bg-white rounded-lg border border-gray-200 shadow-sm p-6',
  input: 'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  select: 'border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  badge: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  table: 'min-w-full divide-y divide-gray-200',
  tableHeader: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
  tableCell: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900'
};

// 상태별 배지 스타일
export const STATUS_BADGE_STYLES = {
  active: 'bg-green-100 text-green-800',
  expired: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  inactive: 'bg-gray-100 text-gray-800'
};

// 반응형 그리드 시스템
export const GRID_SYSTEM = {
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  grid2: 'grid grid-cols-1 md:grid-cols-2 gap-6',
  grid3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  grid4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
}; 