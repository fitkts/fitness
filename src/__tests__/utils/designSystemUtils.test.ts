import {
  getPageLayout,
  getTypography,
  getColor,
  getButtonStyle,
  getSpacing,
  getCommonStyle,
  getStatusBadgeStyle,
  createPageStructure,
  combineButtonClasses,
  createCardStyle,
  createInputStyle
} from '../../utils/designSystemUtils';

describe('디자인 시스템 유틸리티', () => {
  describe('getPageLayout', () => {
    it('표준 페이지 레이아웃을 반환해야 한다', () => {
      const layout = getPageLayout();
      
      expect(layout.container).toBe('space-y-6');
      expect(layout.header.wrapper).toBe('flex items-center justify-between');
      expect(layout.header.title).toBe('text-3xl font-bold text-gray-800');
      expect(layout.sections).toContain('SearchFilter');
      expect(layout.sections).toContain('Statistics');
    });
  });

  describe('getTypography', () => {
    it('올바른 타이포그래피 클래스를 반환해야 한다', () => {
      expect(getTypography('pageTitle')).toBe('text-3xl font-bold');
      expect(getTypography('sectionTitle')).toBe('text-xl font-semibold');
      expect(getTypography('bodyText')).toBe('text-sm');
    });
  });

  describe('getButtonStyle', () => {
    it('올바른 버튼 스타일을 반환해야 한다', () => {
      const primaryButton = getButtonStyle('primary');
      expect(primaryButton).toContain('bg-blue-600');
      expect(primaryButton).toContain('hover:bg-blue-700');
      expect(primaryButton).toContain('text-white');
      expect(primaryButton).toContain('px-4 py-2 rounded-lg');
    });
  });

  describe('getStatusBadgeStyle', () => {
    it('상태별 배지 스타일을 조합해야 한다', () => {
      const activeBadge = getStatusBadgeStyle('active');
      expect(activeBadge).toContain('inline-flex items-center');
      expect(activeBadge).toContain('bg-green-100 text-green-800');
    });
  });

  describe('createPageStructure', () => {
    it('표준 페이지 구조를 생성해야 한다', () => {
      const structure = createPageStructure('회원 관리');
      
      expect(structure.containerClass).toBe('space-y-6');
      expect(structure.headerClass).toBe('flex items-center justify-between');
      expect(structure.titleClass).toBe('text-3xl font-bold text-gray-800');
      expect(structure.title).toBe('회원 관리');
    });
  });

  describe('combineButtonClasses', () => {
    it('버튼 클래스를 추가 클래스와 조합해야 한다', () => {
      const combinedClass = combineButtonClasses('primary', 'ml-2');
      expect(combinedClass).toContain('bg-blue-600');
      expect(combinedClass).toContain('ml-2');
    });
  });

  describe('createCardStyle', () => {
    it('카드 스타일을 생성해야 한다', () => {
      const cardStyle = createCardStyle();
      expect(cardStyle).toContain('bg-white rounded-lg border');
      
      const cardWithExtra = createCardStyle('mt-4');
      expect(cardWithExtra).toContain('bg-white rounded-lg border');
      expect(cardWithExtra).toContain('mt-4');
    });
  });

  describe('createInputStyle', () => {
    it('입력 필드 스타일을 생성해야 한다', () => {
      const inputStyle = createInputStyle();
      expect(inputStyle).toContain('border border-gray-300 rounded-lg');
      
      const selectStyle = createInputStyle('select');
      expect(selectStyle).toContain('bg-white');
    });
  });
}); 