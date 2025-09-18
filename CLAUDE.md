# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

회원의 날 신청 시스템 - Google Forms alternative with Google Apps Script backend and premium HTML frontend for event registration.

**Current Status**: ✅ **FIXED** - New clean Google Apps Script deployed with proper email functions. Ready for testing!

## Architecture

### Backend (Google Apps Script)
- **Main File**: `NEW_Google_Apps_Script_완전깔끔버전.js` (197 lines)
- **Web App URL**: `https://script.google.com/macros/s/AKfycbz38lXwTLqnJyeJnsFKwSgIm5ekQR6ZR785E5zE1NH9G7iZNe2CHo0jmJZKAliZEqf7/exec`
- **Project ID**: `1aAmMLMzKGJY6TPTez6Qj83kcNIRpqT9pZf17shyPbp0`
- **Spreadsheet ID**: `1hFAXknx86eciOWfav1tIo3H-EBLXm8EjMg0BkHLRZaY`
- **Sheet Name**: `회원의날_신청자`
- **Admin Email**: `sangsu0916@gmail.com`

Key Functions:
- `doPost(e)` - Handles form submissions
- `saveToDatabase()` - Saves to Google Sheets
- `sendNotificationEmail()` - Sends admin notification (plain text)
- `sendApplicantConfirmationEmail()` - Sends applicant confirmation (HTML)

### Frontend (HTML Landing Page)
- **Main File**: `PREMIUM_회원의날_랜딩페이지.html`
- **Stack**: Tailwind CSS + DaisyUI
- **Features**: Responsive design, form validation, retry logic, local storage backup

## Common Commands

### Google Apps Script Testing
```javascript
// Test the entire system
runUltimateTest()

// Test with sample data
const testData = {
  name: '테스트',
  phone: '010-1234-5678',
  email: 'test@test.com'
};
```

### Deploy Web App
1. Open Google Apps Script editor
2. Deploy → New deployment
3. Type: Web app
4. Execute as: Me
5. Access: Anyone
6. Deploy and get URL

### Check Logs
View → Executions → View logs for error messages

## Current Issues (마무리할일.md)

### 1. Database Not Saving
- **Problem**: Form submissions not saving to spreadsheet
- **Check**: Spreadsheet permissions, Script execution logs
- **Solution**: Verify spreadsheet ID and sharing settings

### 2. Email System Not Differentiating
- **Problem**: Same email sent to admin and applicant
- **Required**: Admin gets plain text alert, applicant gets HTML welcome
- **Check**: `sendNotificationEmail()` vs `sendApplicantConfirmationEmail()`

### 3. Deployment Not Updating
- **Problem**: Code changes not reflecting in live app
- **Solution**: Create new deployment version, clear cache

## Email Templates

### Admin Email (Plain Text)
- Subject: `🚨 [관리자 알림] 회원의 날 신규 신청: {name}님`
- Content: Simple text with applicant info, DB row number, spreadsheet link
- Recipient: `sangsu0916@gmail.com`

### Applicant Email (HTML)
- Subject: `✅ 접수 완료 - 회원의 날 신청이 접수되었습니다 ({name}님)`
- Content: Beautiful HTML with event details, prompt guide preview
- Recipient: Applicant's email address

## Testing Workflow

1. **Manual Function Test**:
   ```javascript
   // In Script Editor, run:
   runUltimateTest()
   ```

2. **Check Database**:
   - Open spreadsheet: `https://docs.google.com/spreadsheets/d/1hFAXknx86eciOWfav1tIo3H-EBLXm8EjMg0BkHLRZaY`
   - Verify data in `회원의날_신청자` sheet

3. **Test Form Submission**:
   - Open `PREMIUM_회원의날_랜딩페이지.html` in browser
   - Submit test registration
   - Check both emails (admin & applicant)

## Security Requirements

- ❌ Applicants must NOT see other applicants' data
- ❌ Spreadsheet link only for admin access
- ✅ Applicants only receive their own confirmation

## File Structure

```
회원의날/
├── UPDATED_Google_Apps_Script.js    # Latest backend (use this)
├── PREMIUM_회원의날_랜딩페이지.html  # Frontend landing page
├── 마무리할일.md                     # TODO list and issues
├── README.md                        # Project documentation
└── .claude/                        # Claude Code settings
```

## Troubleshooting Steps

### If database not saving:
1. Check Script execution logs
2. Verify spreadsheet permissions (Editor access)
3. Test with `runUltimateTest()` function
4. Check spreadsheet ID matches CONFIG

### If emails not sending:
1. Check Gmail quotas (100/day limit)
2. Verify script permissions for Gmail
3. Check spam folder
4. Test email functions individually

### If deployment not updating:
1. Create NEW deployment (not update existing)
2. Update HTML file with new Web App URL
3. Clear browser cache
4. Test in incognito mode

## Important Configuration

```javascript
// In UPDATED_Google_Apps_Script.js
const CONFIG = {
  spreadsheetId: '1hFAXknx86eciOWfav1tIo3H-EBLXm8EjMg0BkHLRZaY',
  sheetName: '회원의날_신청자',
  notificationEmails: ['sangsu0916@gmail.com']
};
```

```javascript
// In PREMIUM_회원의날_랜딩페이지.html
const API_URL = 'https://script.google.com/macros/s/AKfycbw9OMk2tflSw9-NJzBu3EYJSbsZub_11YipMLdRUvIsy5WxxZpnQFTbRNJraM9IH7PY/exec';
```

## Event Details

- **Date**: 2025년 9월 25일 (목) 오후 2시
- **Location**: 에이큐브 본사
- **Speaker**: 이상수
- **Topic**: 실전 프롬프트 비법 공개와 책소개
- **Contact**: 010-3709-5785 / sangsu0916@gmail.com