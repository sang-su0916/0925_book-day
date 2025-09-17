# 🔍 회원의 날 신청 시스템 디버깅 가이드

## 🚨 현재 발생 중인 문제
GitHub Pages 배포 후에도 동일한 문제 반복 발생

## 📋 체크리스트

### 1. Google Apps Script URL 확인
현재 사용 중인 URL:
```
https://script.google.com/macros/s/AKfycbywAoZTk5vSgJSxfb7Ih1U5F9gGVMKVyNEz1RWZ8UJvZRaOoYv97b_dl4z0oZ5iE8jb/exec
```

✅ **확인 사항**:
- [ ] index.html의 apiUrl이 위 URL과 일치하는가?
- [ ] Google Apps Script 에디터에서 새 배포를 만들었는가?
- [ ] 배포 시 "새 배포"를 선택했는가? (기존 배포 업데이트 X)

### 2. Google Apps Script 실행 로그 확인

**방법 1: Apps Script 에디터에서 확인**
1. [Google Apps Script 에디터](https://script.google.com) 접속
2. 해당 프로젝트 열기
3. 왼쪽 메뉴에서 "실행" 클릭
4. 실행 기록에서 오류 확인

**방법 2: 로그 보기**
1. 보기 → 실행 로그
2. 최근 실행 내역과 오류 메시지 확인

### 3. 브라우저 캐시 문제 해결

**완전 새로고침 방법**:
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`
- 또는 시크릿/프라이빗 모드에서 테스트

### 4. CORS 문제 확인

**브라우저 개발자 도구에서**:
1. F12 또는 개발자 도구 열기
2. Console 탭 확인
3. Network 탭에서 실패한 요청 확인
4. CORS 관련 오류 메시지 찾기

### 5. 테스트 스크립트

Google Apps Script 에디터에서 실행:
```javascript
function testSystem() {
  // 1. 스프레드시트 접근 테스트
  try {
    const ss = SpreadsheetApp.openById('1hFAXknx86eciOWfav1tIo3H-EBLXm8EjMg0BkHLRZaY');
    console.log('✅ 스프레드시트 접근 성공');
  } catch(e) {
    console.error('❌ 스프레드시트 오류:', e);
  }

  // 2. 시트 접근 테스트
  try {
    const ss = SpreadsheetApp.openById('1hFAXknx86eciOWfav1tIo3H-EBLXm8EjMg0BkHLRZaY');
    const sheet = ss.getSheetByName('회원의날_신청자');
    console.log('✅ 시트 접근 성공');
  } catch(e) {
    console.error('❌ 시트 오류:', e);
  }

  // 3. 데이터 저장 테스트
  try {
    const testData = {
      name: '테스트_' + new Date().toISOString(),
      phone: '010-0000-0000',
      email: 'test@test.com'
    };

    const result = saveToDatabase(testData);
    console.log('✅ 데이터 저장 성공:', result);
  } catch(e) {
    console.error('❌ 저장 오류:', e);
  }

  // 4. 이메일 권한 테스트
  try {
    const emailQuota = MailApp.getRemainingDailyQuota();
    console.log('✅ 이메일 할당량:', emailQuota);
  } catch(e) {
    console.error('❌ 이메일 권한 오류:', e);
  }
}
```

### 6. GitHub Pages 특수 문제

**가능한 원인들**:
1. **Mixed Content**: GitHub Pages는 HTTPS인데 Google Apps Script가 HTTP로 호출되는 경우
2. **JavaScript 실행 순서**: DOMContentLoaded 이벤트 타이밍 문제
3. **경로 문제**: 상대 경로/절대 경로 충돌

### 7. 권한 재설정

Google Apps Script에서:
1. 파일 → 프로젝트 속성
2. 범위 탭 확인
3. 필요한 권한:
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/gmail.send`

### 8. 새 배포 만들기

**중요**: 코드를 수정한 후에는 반드시 새 배포를 만들어야 함

1. 배포 → 새 배포
2. 유형: 웹 앱
3. 실행: 나
4. 액세스: 모든 사용자
5. 배포 클릭
6. 새 URL을 index.html에 업데이트

## 🔥 빠른 해결책

### Option A: 완전 재배포
```bash
# 1. 새 배포 만들기 (Google Apps Script)
# 2. 새 URL 복사
# 3. index.html 업데이트
# 4. GitHub에 푸시
git add index.html
git commit -m "Update API URL with new deployment"
git push origin main
```

### Option B: 로컬 테스트
```bash
# Python으로 로컬 서버 실행
python3 -m http.server 8000

# 브라우저에서 접속
http://localhost:8000/index.html
```

### Option C: 다른 호스팅 사용
- Netlify: 즉시 배포 가능
- Vercel: GitHub 연동 자동 배포
- Firebase Hosting: Google 서비스와 호환성 좋음

## 📝 문제 해결 순서

1. **Google Apps Script 로그 확인** → 서버 측 오류 확인
2. **브라우저 콘솔 확인** → 클라이언트 측 오류 확인
3. **네트워크 탭 확인** → 요청/응답 상태 확인
4. **새 배포 만들기** → 캐시 문제 해결
5. **시크릿 모드 테스트** → 브라우저 캐시 배제
6. **testSystem() 실행** → 권한 및 접근 확인

## 🆘 여전히 문제가 있다면

다음 정보를 수집하여 디버깅:
1. Google Apps Script 실행 로그 전체
2. 브라우저 콘솔 오류 메시지
3. Network 탭의 실패한 요청 상세 정보
4. 스프레드시트 공유 설정 스크린샷

---

**마지막 업데이트**: 2025-09-17
**문제 상황**: GitHub Pages 배포 후 동일 문제 반복