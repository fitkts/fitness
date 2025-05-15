module.exports = {
  printWidth: 80, // 한 줄의 최대 길이를 80자로 제한
  tabWidth: 2, // 탭 너비를 2칸으로 설정
  useTabs: false, // 탭 대신 스페이스 사용
  semi: true, // 문장 끝에 세미콜론 사용
  singleQuote: true, // 작은따옴표 사용
  trailingComma: 'all', // 가능한 모든 곳에 후행 쉼표 사용 (ES5부터 지원)
  bracketSpacing: true, // 객체 리터럴에서 괄호와 내용 사이에 공백 추가 ({ foo: bar })
  arrowParens: 'always', // 화살표 함수에서 항상 괄호 사용 (x) => x  ->  (x) => x
  jsxSingleQuote: false, // JSX 속성에서 작은따옴표 대신 큰따옴표 사용
  jsxBracketSameLine: false, // JSX의 닫는 괄호를 다음 줄에 배치
};
