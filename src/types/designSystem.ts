// 디자인 시스템 타입 정의
export interface PageLayoutStructure {
  container: string;
  pageHeader: {
    wrapper: string;
    title: string;
  };
  sections: string[];
}

export interface ColorSystem {
  primary: {
    blue: string;
    blueHover: string;
    blueLight: string;
  };
  secondary: {
    gray: string;
    grayHover: string;
    grayLight: string;
  };
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  text: {
    primary: string;
    secondary: string;
    light: string;
  };
}

export interface Typography {
  pageTitle: string;
  sectionTitle: string;
  cardTitle: string;
  bodyText: string;
  caption: string;
}

export interface ButtonStyles {
  primary: string;
  secondary: string;
  success: string;
  danger: string;
  outline: string;
}

export interface SpacingSystem {
  pageContainer: string;
  sectionGap: string;
  cardGap: string;
  formGap: string;
  inlineGap: string;
}

export interface DesignSystem {
  layout: PageLayoutStructure;
  colors: ColorSystem;
  typography: Typography;
  buttons: ButtonStyles;
  spacing: SpacingSystem;
} 