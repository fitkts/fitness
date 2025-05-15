module.exports = {
  parser: '@typescript-eslint/parser', // TypeScript 파서 지정
  extends: [
    'eslint:recommended', // ESLint 기본 추천 규칙
    'plugin:@typescript-eslint/recommended', // TypeScript ESLint 플러그인 추천 규칙
    'plugin:react/recommended', // React 플러그인 추천 규칙
    'plugin:react-hooks/recommended', // React Hooks 플러그인 추천 규칙
    'prettier', // Prettier와의 충돌 방지를 위해 Prettier 규칙을 ESLint에 통합 (eslint-config-prettier)
  ],
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // 'no-console': 'warn',
    // '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'react/prop-types': 'off', // TypeScript를 사용하므로 prop-types 정의는 불필요
    'react/react-in-jsx-scope': 'off', // React 17+ 에서는 JSX 사용 시 React를 명시적으로 import할 필요 없음
    '@typescript-eslint/explicit-module-boundary-types': 'off', // export되는 함수의 반환 타입 명시 강제 비활성화 (필요에 따라 활성화)
  },
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true,
  },
  ignorePatterns: ['node_modules/', 'dist/', 'build/', '.webpack/', 'coverage/', '*.js'], // ESLint 검사에서 제외할 파일/폴더 및 .js 파일 (TypeScript 프로젝트이므로)
}; 