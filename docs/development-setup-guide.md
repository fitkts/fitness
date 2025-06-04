# ⚙️ 피트니스 회원 관리 시스템 개발환경 설정 가이드

## 📌 개요

이 문서는 **신규 개발자**가 피트니스 회원 관리 시스템을 개발할 수 있도록 개발환경을 설정하는 **완전한 가이드**입니다.

**💡 목표:**
- 0부터 시작해서 개발 가능한 상태까지 안내
- 각 도구의 역할과 필요성 이해
- 발생할 수 있는 문제와 해결방법 제시

---

## 🛠️ 필요한 도구들

### **기본 개발 도구**
- **Node.js** 18.0 이상 - JavaScript 런타임
- **npm** - 패키지 관리자 (Node.js와 함께 설치됨)
- **Git** - 버전 관리 시스템
- **Visual Studio Code** - 코드 에디터 (권장)

### **추가 도구 (선택사항)**
- **Windows**: Git Bash 또는 WSL2
- **macOS**: Homebrew 패키지 관리자
- **Chrome/Edge**: 디버깅용 브라우저

---

## 📦 1단계: 기본 도구 설치

### **1.1 Node.js 설치**

**왜 필요한가요?**
- JavaScript 코드를 실행하기 위한 런타임 환경
- npm(패키지 관리자)이 함께 설치됨
- Electron 애플리케이션 개발의 기반

**설치 방법:**

**Windows/macOS:**
1. [Node.js 공식 사이트](https://nodejs.org/) 방문
2. **LTS 버전** (안정 버전) 다운로드
3. 설치 프로그램 실행하고 기본 설정으로 설치

**설치 확인:**
```bash
# 터미널에서 실행
node --version    # v18.0.0 이상이어야 함
npm --version     # 9.0.0 이상이어야 함
```

### **1.2 Git 설치**

**왜 필요한가요?**
- 소스코드 버전 관리
- 팀 협업을 위한 필수 도구
- 코드 변경 이력 추적

**설치 방법:**

**Windows:**
1. [Git for Windows](https://git-scm.com/download/win) 다운로드
2. 설치 시 "Git Bash" 옵션 선택

**macOS:**
```bash
# Homebrew로 설치 (권장)
brew install git

# 또는 Xcode Command Line Tools
xcode-select --install
```

**설치 확인:**
```bash
git --version    # git version 2.30.0 이상
```

### **1.3 Visual Studio Code 설치**

**왜 이 에디터를 사용하나요?**
- TypeScript/React 개발에 최적화
- 풍부한 확장 프로그램
- 내장 터미널과 디버거

**설치 방법:**
1. [VS Code 공식 사이트](https://code.visualstudio.com/) 방문
2. 운영체제에 맞는 버전 다운로드 및 설치

**필수 확장 프로그램:**
```
- TypeScript and JavaScript Language Features (내장)
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Tailwind CSS IntelliSense
- Auto Rename Tag
- Bracket Pair Colorizer
```

---

## 💻 2단계: 프로젝트 클론 및 의존성 설치

### **2.1 프로젝트 클론**

**Git 저장소에서 프로젝트 가져오기:**

```bash
# 프로젝트 클론 (실제 저장소 주소로 변경)
git clone [저장소 URL]

# 프로젝트 폴더로 이동
cd fitness

# 현재 폴더 구조 확인
ls -la
```

**예상되는 폴더 구조:**
```
fitness/
├── src/                 # 소스 코드
├── docs/               # 문서
├── dist/               # 빌드 결과물
├── node_modules/       # 설치된 패키지 (설치 후 생성됨)
├── package.json        # 프로젝트 설정
├── tsconfig.json       # TypeScript 설정
├── webpack.config.js   # 번들링 설정
└── README.md          # 프로젝트 설명
```

### **2.2 패키지 설치**

**왜 이 과정이 필요한가요?**
- `package.json`에 명시된 모든 라이브러리 설치
- 개발에 필요한 도구들 자동 설치
- 프로젝트 실행을 위한 준비 작업

**설치 명령어:**
```bash
# 모든 의존성 패키지 설치
npm install

# 또는 줄여서
npm i
```

**설치되는 주요 패키지들:**

**프로덕션 의존성:**
- `react` - UI 라이브러리
- `electron` - 데스크톱 앱 프레임워크
- `better-sqlite3` - SQLite 데이터베이스
- `zustand` - 상태 관리
- `tailwindcss` - CSS 프레임워크

**개발 의존성:**
- `typescript` - 타입 안전성
- `webpack` - 번들링 도구
- `eslint` - 코드 품질 검사
- `prettier` - 코드 포맷팅
- `jest` - 테스트 프레임워크

**설치 확인:**
```bash
# node_modules 폴더가 생성되었는지 확인
ls -la node_modules/

# package-lock.json이 생성되었는지 확인
ls -la package-lock.json
```

---

## 🚀 3단계: 개발 서버 실행

### **3.1 개발 모드 실행**

**개발 모드란?**
- 코드 변경 시 자동으로 애플리케이션 재시작
- 개발자 도구 활성화
- Hot Reload 기능으로 빠른 개발 가능

**실행 명령어:**
```bash
# 개발 서버 시작
npm run dev
```

**내부적으로 실행되는 것들:**
1. **Webpack Dev Server** - React 앱 번들링 및 서빙 (포트 3000)
2. **Electron Main Process** - 데스크톱 앱 실행
3. **자동 리로드** - 코드 변경 감지 및 재시작

**성공 시 화면:**
```
✓ Webpack Dev Server 시작됨 (http://localhost:3000)
✓ Electron 앱 실행됨
✓ 데이터베이스 초기화 완료
```

### **3.2 개별 스크립트 실행**

**각 스크립트의 역할:**

```bash
# 1. Webpack Dev Server만 실행 (웹 개발 시)
npm run dev:webpack

# 2. Electron만 실행 (데스크톱 앱 테스트 시)
npm run dev:electron

# 3. 프로덕션 빌드
npm run build

# 4. 코드 포맷팅
npm run format

# 5. 코드 품질 검사
npm run lint

# 6. 테스트 실행
npm test
```

---

## 🔧 4단계: 개발 도구 설정

### **4.1 VS Code 설정**

**권장 설정 파일 (`.vscode/settings.json`):**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "typescriptreact"
  }
}
```

**작업 영역 설정:**
1. VS Code에서 프로젝트 폴더 열기: `File → Open Folder`
2. 통합 터미널 열기: `` Ctrl + ` `` (백틱)
3. 사이드바에서 파일 탐색기 확인

### **4.2 Git 설정**

**초기 설정 (최초 1회만):**
```bash
# 사용자 정보 설정
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 기본 브랜치명 설정
git config --global init.defaultBranch main

# 줄바꿈 설정 (Windows)
git config --global core.autocrlf true

# 줄바꿈 설정 (macOS/Linux)
git config --global core.autocrlf input
```

**브랜치 작업 흐름:**
```bash
# 새 기능 개발 시
git checkout -b feature/new-feature

# 작업 완료 후
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin feature/new-feature
```

---

## 🐛 5단계: 문제 해결 가이드

### **5.1 자주 발생하는 문제들**

#### **문제 1: npm install 실패**

**증상:**
```
npm ERR! code ENOENT
npm ERR! syscall open
npm ERR! path package.json
```

**원인 및 해결:**
```bash
# 1. 올바른 폴더에 있는지 확인
pwd
ls package.json  # 파일이 있어야 함

# 2. npm 캐시 정리
npm cache clean --force

# 3. node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

#### **문제 2: Electron 실행 실패**

**증상:**
```
Error: Cannot find module 'electron'
```

**해결 방법:**
```bash
# 1. electron 개별 설치
npm install electron --save-dev

# 2. 전역 설치도 시도
npm install -g electron

# 3. 권한 문제 (macOS/Linux)
sudo npm install
```

#### **문제 3: 포트 충돌**

**증상:**
```
Error: listen EADDRINUSE :::3000
```

**해결 방법:**
```bash
# 1. 다른 프로세스 종료
lsof -ti:3000 | xargs kill -9

# 2. 다른 포트 사용
npm run dev:webpack -- --port 3001
```

#### **문제 4: TypeScript 오류**

**증상:**
```
TS2307: Cannot find module '@/components/...'
```

**해결 방법:**
1. VS Code에서 TypeScript 버전 확인:
   - `Ctrl+Shift+P` → "TypeScript: Select TypeScript Version"
   - "Use Workspace Version" 선택

2. 경로 별칭 확인:
```json
// tsconfig.json에서 확인
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### **5.2 성능 최적화**

#### **개발 속도 향상:**

```bash
# 1. npm 대신 yarn 사용 (선택사항)
npm install -g yarn
yarn install
yarn dev

# 2. 파일 감시 제한 증가 (Linux/macOS)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# 3. Node.js 메모리 증가
export NODE_OPTIONS="--max-old-space-size=8192"
npm run dev
```

#### **빌드 속도 향상:**
```bash
# 병렬 빌드 사용
npm install --save-dev thread-loader

# TypeScript 컴파일 건너뛰기 (개발 시)
npm run dev:webpack -- --transpile-only
```

---

## 🎯 6단계: 개발 워크플로우

### **6.1 일반적인 개발 과정**

**1. 프로젝트 시작:**
```bash
# 1. 최신 코드 가져오기
git pull origin main

# 2. 새 브랜치 생성
git checkout -b feature/user-authentication

# 3. 개발 서버 실행
npm run dev
```

**2. 코드 작성:**
```bash
# 1. 파일 수정 (VS Code에서)
# 2. 자동 저장 시 포맷팅 적용
# 3. 브라우저에서 즉시 반영 확인
```

**3. 코드 품질 검사:**
```bash
# 1. 린팅 검사
npm run lint

# 2. 자동 수정
npm run lint:fix

# 3. 포맷팅
npm run format

# 4. 테스트 실행
npm test
```

**4. 커밋 및 푸시:**
```bash
# 1. 변경사항 확인
git status
git diff

# 2. 스테이징
git add .

# 3. 커밋 (의미있는 메시지)
git commit -m "feat: 사용자 인증 기능 추가"

# 4. 원격 저장소에 푸시
git push origin feature/user-authentication
```

### **6.2 컴포넌트 개발 패턴**

**새 컴포넌트 생성 예시:**
```typescript
// src/components/UserProfile.tsx
import React from 'react';

interface UserProfileProps {
  name: string;
  email: string;
  onEdit: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  name, 
  email, 
  onEdit 
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold">{name}</h2>
      <p className="text-gray-600">{email}</p>
      <button 
        onClick={onEdit}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        편집
      </button>
    </div>
  );
};

export default UserProfile;
```

**컴포넌트 테스트:**
```typescript
// src/components/__tests__/UserProfile.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import UserProfile from '../UserProfile';

test('사용자 정보를 올바르게 표시한다', () => {
  const mockOnEdit = jest.fn();
  
  render(
    <UserProfile 
      name="홍길동" 
      email="hong@example.com" 
      onEdit={mockOnEdit} 
    />
  );
  
  expect(screen.getByText('홍길동')).toBeInTheDocument();
  expect(screen.getByText('hong@example.com')).toBeInTheDocument();
  
  fireEvent.click(screen.getByText('편집'));
  expect(mockOnEdit).toHaveBeenCalled();
});
```

---

## 📚 7단계: 학습 리소스

### **7.1 핵심 기술 문서**

**React:**
- [React 공식 문서](https://react.dev/)
- [React TypeScript Cheatsheet](https://github.com/typescript-cheatsheets/react)

**Electron:**
- [Electron 공식 문서](https://www.electronjs.org/docs)
- [Electron Security Guidelines](https://www.electronjs.org/docs/tutorial/security)

**TypeScript:**
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

**Tailwind CSS:**
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/components)

### **7.2 추천 VS Code 확장 프로그램**

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "christian-kohler.path-intellisense",
    "formulahendry.auto-rename-tag",
    "ms-vscode.vscode-json"
  ]
}
```

### **7.3 유용한 명령어 모음**

**패키지 관리:**
```bash
# 새 패키지 설치
npm install <package-name>
npm install <package-name> --save-dev

# 패키지 업데이트
npm update
npm outdated  # 오래된 패키지 확인

# 패키지 제거
npm uninstall <package-name>
```

**디버깅:**
```bash
# 자세한 로그 출력
DEBUG=* npm run dev

# Node.js 디버거 연결
npm run dev -- --inspect

# Chrome DevTools 열기
chrome://inspect
```

---

## ✅ 8단계: 설정 완료 체크리스트

### **환경 설정 확인:**
- [ ] Node.js 18+ 설치 완료
- [ ] Git 설치 및 사용자 정보 설정
- [ ] VS Code 설치 및 확장 프로그램 설치
- [ ] 프로젝트 클론 완료
- [ ] `npm install` 성공

### **개발 환경 확인:**
- [ ] `npm run dev` 실행 성공
- [ ] Electron 앱 정상 실행
- [ ] 웹 서버 접근 가능 (localhost:3000)
- [ ] 코드 변경 시 자동 리로드 동작
- [ ] 개발자 도구 접근 가능

### **코드 품질 도구 확인:**
- [ ] `npm run lint` 실행 성공
- [ ] `npm run format` 실행 성공
- [ ] `npm test` 실행 성공
- [ ] VS Code에서 자동 포맷팅 동작
- [ ] ESLint 오류 표시 동작

### **Git 워크플로우 확인:**
- [ ] 새 브랜치 생성 가능
- [ ] 커밋 및 푸시 가능
- [ ] `.gitignore` 정상 동작

---

## 🆘 도움이 필요할 때

### **문제 해결 순서:**

1. **오류 메시지 정확히 읽기**
   - 어떤 파일에서 발생했는지 확인
   - 오류 코드 검색해보기

2. **기본 해결책 시도:**
   ```bash
   # 캐시 정리
   npm cache clean --force
   
   # 의존성 재설치
   rm -rf node_modules package-lock.json
   npm install
   
   # 재시작
   npm run dev
   ```

3. **로그 확인:**
   ```bash
   # 자세한 로그 출력
   npm run dev --verbose
   
   # Electron 로그 확인
   # 앱 실행 후 Ctrl+Shift+I로 DevTools 열기
   ```

4. **구글 검색 키워드:**
   - `"오류 메시지" site:stackoverflow.com`
   - `"오류 메시지" electron react typescript`
   - `"오류 메시지" npm install`

### **커뮤니티 도움:**
- **Stack Overflow**: 기술적 질문
- **GitHub Issues**: 라이브러리 관련 문제
- **Discord/Slack**: 실시간 커뮤니티 지원

---

## 🎉 마무리

축하합니다! 🎊 개발환경 설정이 완료되었습니다.

**이제 할 수 있는 것들:**
- ✅ 피트니스 회원 관리 시스템 개발
- ✅ React 컴포넌트 작성
- ✅ TypeScript로 타입 안전한 코드 작성
- ✅ Electron 데스크톱 앱 빌드
- ✅ 팀원들과 Git으로 협업

**다음 단계:**
1. 📖 [시스템 아키텍처 문서](./system-architecture.md) 읽기
2. 🔧 [Clean Coding Guidelines](../.cursor/rules/clean-coding-guidelines.md) 숙지
3. 🗄️ [Database Schema](../.cursor/rules/database_schema.md) 이해
4. 🚀 첫 번째 컴포넌트 개발 시작!

**Happy Coding! 🚀**

---

**작성일**: 2024년 12월
**작성자**: 개발팀  
**버전**: 1.0.0

> 💡 **팁**: 이 문서를 북마크해두고 문제 발생 시 참고하세요! 