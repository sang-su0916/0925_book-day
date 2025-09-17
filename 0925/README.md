# 회원의 날 신청 시스템 (2025.09.25)

## 📋 프로젝트 개요

에이큐브 회원의 날 행사를 위한 온라인 신청 시스템입니다.

- **행사명**: 실전 프롬프트 비법 공개와 책소개
- **일시**: 2025년 9월 25일 (목) 오후 2시
- **장소**: 에이큐브 본사
- **연사**: 이상수

## 🗂️ 파일 구성

### 1. `Google_Apps_Script.js`
- **용도**: Google Apps Script 백엔드 코드
- **기능**:
  - 폼 데이터 수신 및 검증
  - Google Sheets 데이터베이스 저장
  - 관리자 알림 이메일 (텍스트)
  - 신청자 확인 이메일 (HTML 디자인)
- **특징**:
  - 강화된 오류 처리 (다중 데이터 처리 방식 지원)
  - 프리미엄 HTML 이메일 디자인
  - 프롬프트 구조 가이드 + 실제 예시 포함

### 2. `index.html`
- **용도**: 신청 접수용 랜딩페이지
- **기능**:
  - 반응형 웹디자인 (모바일/데스크톱)
  - 실시간 폼 검증
  - 다중 제출 방식 (JSON + FormData + iframe)
  - 재시도 로직 및 오류 처리
- **스택**: Tailwind CSS + DaisyUI

### 3. `README.md`
- **용도**: 프로젝트 문서화 및 배포 가이드

## 🚀 배포 방법

### Google Apps Script 배포

1. **Apps Script 설정**
   ```
   1. https://script.google.com 접속
   2. 새 프로젝트 생성
   3. Google_Apps_Script.js 내용 전체 복사
   4. 붙여넣기 후 저장
   ```

2. **웹앱 배포**
   ```
   1. 배포 → 새 배포 클릭
   2. 유형: 웹 앱 선택
   3. 실행: 나
   4. 액세스: 모든 사용자
   5. 배포 클릭
   6. 생성된 URL 복사
   ```

3. **랜딩페이지 URL 업데이트**
   ```javascript
   // index.html의 CONFIG 섹션에서
   apiUrl: '생성된_웹앱_URL' // 여기에 배포된 URL 입력
   ```

### 웹호스팅 배포

1. **GitHub Pages / Netlify / Vercel 등에 index.html 업로드**
2. **도메인 연결 (선택사항)**

## ⚙️ 설정 정보

### Google Sheets 설정
- **스프레드시트 ID**: `1hFAXknx86eciOWfav1tIo3H-EBLXm8EjMg0BkHLRZaY`
- **시트명**: `회원의날_신청자`
- **관리자 이메일**: `sangsu0916@gmail.com`

### 현재 배포 URL
- **웹앱 URL**: `https://script.google.com/macros/s/AKfycbywAoZTk5vSgJSxfb7Ih1U5F9gGVMKVyNEz1RWZ8UJvZRaOoYv97b_dl4z0oZ5iE8jb/exec`

## ✨ 주요 기능

### 📧 이메일 시스템
- **관리자용**: 간단한 텍스트 알림 (신청자 정보 + 관리 체크리스트)
- **신청자용**: 프리미엄 HTML 디자인
  - 애니메이션 헤더
  - 행사 상세 정보
  - 프롬프트 구조 가이드 (5단계)
  - 완성된 프롬프트 예시 (색상별 구분)
  - 문의 연락처

### 🛡️ 보안 및 안정성
- 다중 데이터 처리 방식 (JSON/FormData/직접 파라미터)
- 필수 필드 검증
- 상세한 오류 로깅
- CORS 지원
- 재시도 로직

### 📱 사용자 경험
- 반응형 디자인
- 실시간 폼 검증
- 로딩 상태 표시
- 성공/오류 메시지
- 접근성 최적화

## 🔧 개발 환경

- **백엔드**: Google Apps Script (JavaScript)
- **프론트엔드**: HTML5 + Tailwind CSS + DaisyUI
- **데이터베이스**: Google Sheets
- **이메일**: Gmail API (MailApp)

## 📞 문의사항

- **담당자**: 이상수
- **연락처**: 010-3709-5785
- **이메일**: sangsu0916@gmail.com

---

**© 2025 에이큐브. All rights reserved.**