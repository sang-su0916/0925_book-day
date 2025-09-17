# GitHub Pages 배포 가이드

## 🌐 GitHub Pages로 완전 배포하기

### ⚠️ 중요 사항
GitHub Pages는 **정적 웹사이트만** 호스팅 가능합니다.
따라서 **2단계 배포**가 필요합니다:

1. **Google Apps Script** → Google에서 백엔드 서버 실행
2. **GitHub Pages** → 프론트엔드 웹사이트 호스팅

## 🚀 1단계: Google Apps Script 배포

### 1-1. Apps Script 배포
```bash
1. https://script.google.com 접속
2. 새 프로젝트 생성
3. Google_Apps_Script.js 내용 전체 복사 → 붙여넣기
4. 저장 (Ctrl+S)
5. 배포 → 새 배포 선택
   - 유형: 웹 앱
   - 실행: 나
   - 액세스: 모든 사용자
6. 배포 → 웹앱 URL 복사
```

### 1-2. 생성된 URL 예시
```
https://script.google.com/macros/s/AKfycbywAoZTk5vSgJSxfb7Ih1U5F9gGVMKVyNEz1RWZ8UJvZRaOoYv97b_dl4z0oZ5iE8jb/exec
```

## 🚀 2단계: GitHub Pages 배포

### 2-1. Repository 생성
```bash
1. GitHub.com 접속 → 로그인
2. New Repository 클릭
3. Repository name: member-day-2025 (예시)
4. Public 선택
5. Create repository
```

### 2-2. 파일 업로드

**방법 1: GitHub 웹사이트에서**
```bash
1. 생성된 Repository로 이동
2. "uploading an existing file" 클릭
3. 0925 폴더의 모든 파일 드래그 앤 드롭:
   - index.html
   - Google_Apps_Script.js
   - README.md
   - DEPLOYMENT_GUIDE.md
   - GITHUB_PAGES_GUIDE.md
4. Commit changes
```

**방법 2: Git 명령어로**
```bash
git clone https://github.com/USERNAME/REPOSITORY_NAME.git
cd REPOSITORY_NAME
cp /path/to/0925/* .
git add .
git commit -m "Add member day registration system"
git push origin main
```

### 2-3. GitHub Pages 활성화
```bash
1. Repository → Settings 탭
2. 왼쪽 메뉴에서 "Pages" 클릭
3. Source: "Deploy from a branch" 선택
4. Branch: main 선택
5. Folder: / (root) 선택
6. Save 클릭
```

### 2-4. API URL 업데이트
```bash
1. Repository에서 index.html 파일 클릭
2. 편집 (연필 아이콘) 클릭
3. CONFIG 섹션 찾기:
```

```javascript
const CONFIG = {
    apiUrl: 'YOUR_GOOGLE_APPS_SCRIPT_URL', // 1단계에서 복사한 URL로 교체
    maxRetries: 3,
    retryDelay: 2000
};
```

```bash
4. 1단계에서 복사한 Google Apps Script URL로 교체
5. Commit changes
```

## 🎯 최종 결과

### 배포 완료 후 URL들:
- **웹사이트**: `https://USERNAME.github.io/REPOSITORY_NAME`
- **백엔드**: `https://script.google.com/macros/s/...../exec`

### 작동 원리:
```
사용자 → GitHub Pages (index.html) → Google Apps Script → Google Sheets + Gmail
```

## ✅ 배포 확인 체크리스트

### Google Apps Script 확인
- [ ] 웹앱 배포 완료
- [ ] "모든 사용자" 액세스 권한 설정
- [ ] 웹앱 URL 복사 완료

### GitHub Pages 확인
- [ ] Repository 생성 완료
- [ ] 모든 파일 업로드 완료
- [ ] Pages 설정 활성화
- [ ] index.html에 올바른 API URL 설정

### 기능 테스트
- [ ] GitHub Pages 사이트 접속 가능
- [ ] 폼 제출 테스트 성공
- [ ] Google Sheets에 데이터 저장 확인
- [ ] 이메일 수신 확인 (관리자 + 신청자)

## 🛠️ 문제 해결

### GitHub Pages가 로드되지 않는 경우:
```bash
1. Repository → Settings → Pages에서 상태 확인
2. 파일명이 index.html인지 확인
3. 대소문자 정확성 확인
4. 5-10분 후 다시 시도 (배포 시간 필요)
```

### API 연결이 안되는 경우:
```bash
1. Google Apps Script URL이 정확한지 확인
2. 웹앱 권한이 "모든 사용자"인지 확인
3. 브라우저 개발자 도구에서 네트워크 오류 확인
4. CORS 문제일 경우 새 배포 생성
```

## 🎉 성공적인 배포 예시

### 최종 결과물:
- **사용자 접속**: `https://yourname.github.io/member-day-2025`
- **폼 작성 → 제출**
- **즉시 확인 이메일 수신** (프리미엄 HTML 디자인)
- **관리자 알림 이메일 수신** (간단한 텍스트)
- **Google Sheets에 데이터 자동 저장**

---

**배포 지원**: 문제 발생 시 sangsu0916@gmail.com으로 연락