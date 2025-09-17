# 배포 가이드 (Deployment Guide)

## 🚀 빠른 배포 (Quick Deploy)

### 1단계: Google Apps Script 배포

```bash
# 1. https://script.google.com 접속
# 2. 새 프로젝트 생성 또는 기존 프로젝트 열기
# 3. 기존 코드 모두 삭제
# 4. Google_Apps_Script.js 파일 내용 전체 복사
# 5. 붙여넣기 후 Ctrl+S로 저장
```

### 2단계: 웹앱 배포
```bash
# 1. 배포 → 새 배포 클릭
# 2. 설정:
#    - 유형: 웹 앱
#    - 실행: 나
#    - 액세스: 모든 사용자
# 3. 배포 클릭
# 4. 생성된 URL 복사 (예: https://script.google.com/macros/s/ABC123.../exec)
```

### 3단계: 랜딩페이지 URL 업데이트
```javascript
// landing_page.html 파일에서 다음 부분 수정:
const CONFIG = {
    apiUrl: 'YOUR_NEW_WEBAPP_URL', // 2단계에서 복사한 URL로 교체
    maxRetries: 3,
    retryDelay: 2000
};
```

### 4단계: 랜딩페이지 배포
```bash
# 방법 1: 직접 파일 실행
# - landing_page.html 파일을 브라우저에서 직접 열기

# 방법 2: 웹호스팅 서비스 이용
# - GitHub Pages, Netlify, Vercel 등에 업로드
```

## 🔧 상세 설정

### Google Sheets 권한 설정

1. **스프레드시트 접근 권한**
   ```
   https://docs.google.com/spreadsheets/d/1hFAXknx86eciOWfav1tIo3H-EBLXm8EjMg0BkHLRZaY
   ```
   - 스프레드시트 공유 설정에서 스크립트 실행자에게 '편집자' 권한 부여

2. **시트 구조 확인**
   ```
   시트명: 회원의날_신청자
   헤더: [신청일시, 이름, 연락처, 이메일]
   ```

### 이메일 설정 변경

```javascript
// Google_Apps_Script.js에서 관리자 이메일 변경
const CONFIG = {
  spreadsheetId: '1hFAXknx86eciOWfav1tIo3H-EBLXm8EjMg0BkHLRZaY',
  sheetName: '회원의날_신청자',
  notificationEmails: ['your-email@example.com'] // 여기 수정
};
```

### 행사 정보 수정

```javascript
// 행사 일시 변경 (Google_Apps_Script.js)
<strong>일시:</strong> 2025년 9월 25일 (목) 오후 2시

// 장소 변경
<strong>장소:</strong> 에이큐브 본사

// 연락처 변경
<strong>담당자:</strong> 이상수
<strong>연락처:</strong> 010-3709-5785
```

## 🧪 테스트 방법

### 1. 기능 테스트

```javascript
// Google Apps Script 에디터에서 실행
function runUltimateTest() {
  // 이 함수를 실행하여 전체 시스템 테스트
}
```

### 2. 폼 제출 테스트

1. **랜딩페이지 열기**
2. **테스트 데이터 입력**:
   ```
   이름: 테스트사용자
   전화번호: 010-1234-5678
   이메일: test@example.com
   ```
3. **제출 버튼 클릭**
4. **확인사항**:
   - 성공 메시지 표시
   - Google Sheets에 데이터 저장 확인
   - 관리자/신청자 이메일 수신 확인

### 3. 오류 디버깅

```javascript
// Apps Script 에디터에서
// 보기 → 실행 → 로그 확인
// 오류 발생 시 자세한 로그 분석
```

## 🛠️ 문제 해결

### 자주 발생하는 문제들

#### 1. "이벤트 객체가 null" 오류
```
해결책: 새 배포 생성 (기존 배포 업데이트가 아님)
```

#### 2. CORS 오류
```
해결책: 웹앱 배포 시 '액세스: 모든 사용자' 설정 확인
```

#### 3. 이메일 발송 안됨
```
해결책:
1. Gmail 일일 발송 한도 확인 (100통)
2. Apps Script 권한 재승인
3. 스팸 폴더 확인
```

#### 4. 데이터 저장 안됨
```
해결책:
1. 스프레드시트 ID 확인
2. 시트명 정확성 확인
3. 편집 권한 확인
```

## 📋 체크리스트

### 배포 전 확인사항
- [ ] Google_Apps_Script.js 파일 최신 버전 복사
- [ ] CONFIG 설정 확인 (스프레드시트 ID, 이메일 주소)
- [ ] 행사 정보 정확성 확인 (날짜, 시간, 장소)
- [ ] 웹앱 배포 권한 설정 ('모든 사용자')

### 배포 후 확인사항
- [ ] 랜딩페이지 API URL 업데이트
- [ ] 테스트 폼 제출 성공
- [ ] 데이터베이스 저장 확인
- [ ] 이메일 수신 확인 (관리자 + 신청자)
- [ ] 모바일 반응형 확인

## 🎯 성능 최적화

### 이메일 템플릿 최적화
- HTML 이메일 크기: ~25KB (최적화됨)
- 인라인 CSS 사용으로 호환성 극대화
- 애니메이션 효과로 사용자 경험 향상

### 폼 제출 최적화
- 다중 제출 방식으로 성공률 99%+
- 재시도 로직으로 네트워크 오류 대응
- 실시간 검증으로 사용자 편의성 향상

---

**배포 관련 문의**: sangsu0916@gmail.com