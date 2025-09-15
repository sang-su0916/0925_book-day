// 🏆 회원의 날 신청 시스템 - Google Apps Script 코드
// 버전: ULTIMATE 2025.09.15
// 이 코드를 Google Apps Script 에디터에 복사-붙여넣기 하세요

const CONFIG = {
  spreadsheetId: '1BhFi_fNCqht1ENT-SQ_ezgkw5HE5lEyCk88-oINJ0gQ', // 회원의날 신청자 DB
  sheetName: '회원의날_신청자', // 새로운 깨끗한 시트
  notificationEmails: [
    'sangsu0916@gmail.com',
    'sangsu0916@naver.com'
  ]
};

// 웹 앱으로 POST 요청을 받는 함수
function doPost(e) {
  try {
    console.log('=== 회원의 날 신청 처리 시작 ===');

    // 입력 데이터 검증
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('요청 데이터가 없습니다');
    }

    console.log('Request body:', e.postData.contents);

    // 데이터 파싱
    const data = JSON.parse(e.postData.contents);
    console.log('신청자 데이터:', data);

    // 현재 시간 (한국 시간)
    const timestamp = new Date().toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // 스프레드시트 처리
    const dbResult = saveToDatabase(data, timestamp);

    // 이메일 발송
    const emailResult = sendNotificationEmail(data, timestamp, dbResult.rowNumber);

    console.log('=== 처리 완료 ===');
    console.log('DB 저장:', dbResult.success ? '성공' : '실패');
    console.log('이메일 발송:', emailResult ? '성공' : '실패');

    // 성공 응답
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: '신청이 완료되었습니다',
        timestamp: timestamp,
        rowNumber: dbResult.rowNumber,
        dbSaved: dbResult.success,
        emailSent: emailResult
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('=== 처리 오류 ===');
    console.error('Error:', error);

    // 긴급 알림 이메일
    try {
      sendEmergencyEmail(error.toString());
    } catch (emergencyError) {
      console.error('긴급 이메일 실패:', emergencyError);
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: '신청 처리 중 오류가 발생했습니다',
        error: error.toString(),
        timestamp: new Date().toLocaleString('ko-KR')
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 데이터베이스 저장 함수
function saveToDatabase(data, timestamp) {
  try {
    console.log('데이터베이스 저장 시작...');

    // 스프레드시트 열기 - 더 안전한 방법 사용
    let spreadsheet;
    try {
      spreadsheet = SpreadsheetApp.openById(CONFIG.spreadsheetId);
      console.log('스프레드시트 열기 성공');
    } catch (e) {
      console.error('스프레드시트 열기 실패:', e);
      throw new Error('스프레드시트에 접근할 수 없습니다. 권한을 확인해주세요.');
    }

    // 첫 번째 시트 사용 (가장 안전한 방법)
    let sheet = spreadsheet.getSheets()[0];

    // 시트 이름 변경
    if (sheet.getName() !== CONFIG.sheetName) {
      try {
        sheet.setName(CONFIG.sheetName);
        console.log('시트 이름 변경:', CONFIG.sheetName);
      } catch (e) {
        console.log('시트 이름 변경 실패, 기존 이름 사용:', sheet.getName());
      }
    }

    // 헤더 확인 및 설정
    if (sheet.getLastRow() === 0) {
      setupNewSheet(sheet);
    }

    // 신청자 데이터 준비
    const rowData = [
      timestamp,
      data.name || '이름없음',
      data.phone || '연락처없음',
      data.email || '이메일없음',
      '회원의 날(실전 프롬프트 비법 공개와 책소개)',
      '신규',
      data.ip || '알 수 없음'
    ];

    // 데이터 추가
    sheet.appendRow(rowData);
    const rowNumber = sheet.getLastRow();

    // 스타일링
    try {
      const newRowRange = sheet.getRange(rowNumber, 1, 1, rowData.length);
      newRowRange.setBackground('#f8f9fa');
      sheet.getRange(rowNumber, 6).setBackground('#d4edda').setFontColor('#155724');
    } catch (styleError) {
      console.warn('스타일링 실패:', styleError);
    }

    console.log('데이터베이스 저장 성공, 행 번호:', rowNumber);
    return { success: true, rowNumber: rowNumber };

  } catch (error) {
    console.error('데이터베이스 저장 실패:', error);
    return { success: false, rowNumber: 'DB저장실패' };
  }
}

// 새 시트 설정
function setupNewSheet(sheet) {
  const headers = ['신청일시', '이름', '연락처', '이메일', '행사명', '상태', 'IP주소'];

  // 헤더 추가
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);

  // 헤더 스타일링
  headerRange.setBackground('#4285f4')
             .setFontColor('white')
             .setFontWeight('bold')
             .setHorizontalAlignment('center');

  // 컬럼 너비 조정
  sheet.setColumnWidth(1, 150); // 신청일시
  sheet.setColumnWidth(2, 100); // 이름
  sheet.setColumnWidth(3, 130); // 연락처
  sheet.setColumnWidth(4, 200); // 이메일
  sheet.setColumnWidth(5, 250); // 행사명
  sheet.setColumnWidth(6, 80);  // 상태
  sheet.setColumnWidth(7, 120); // IP주소

  console.log('새 시트 설정 완료');
}

// 이메일 알림 발송
function sendNotificationEmail(data, timestamp, rowNumber) {
  try {
    console.log('이메일 발송 시작...');

    const subject = `🎉 [회원의 날] 새로운 참가 신청: ${data.name || '이름없음'}님`;

    const body = `회원의 날 참가 신청 알림

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 신청자 정보
• 이름: ${data.name || '이름없음'}
• 연락처: ${data.phone || '연락처없음'}
• 이메일: ${data.email || '이메일없음'}
• 신청시간: ${timestamp}
• 저장위치: ${CONFIG.sheetName} 시트 ${rowNumber}행

📅 행사 정보
• 행사명: 회원의 날(실전 프롬프트 비법 공개와 책소개)
• 일시: 9월 25일 (목) 오후 2시
• 장소: 에이큐브 본사
• 강사: 이상수

⚡ 즉시 조치 사항
1. 신청자에게 확인 연락 또는 문자 발송
2. 행사 안내 및 준비물 안내
3. 참석 인원 파악 및 좌석 배치 확인

📊 전체 신청자 명단 확인:
https://docs.google.com/spreadsheets/d/${CONFIG.spreadsheetId}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
이 메일은 회원의 날 신청 시스템에서 자동 발송되었습니다.
시스템 버전: ULTIMATE 2025.09.15`;

    let sentCount = 0;

    CONFIG.notificationEmails.forEach((email, index) => {
      try {
        console.log(`이메일 발송 시도 ${index + 1}: ${email}`);
        MailApp.sendEmail(email, subject, body);
        console.log(`이메일 발송 성공 ${index + 1}: ${email}`);
        sentCount++;

        // 발송 간격
        if (index < CONFIG.notificationEmails.length - 1) {
          Utilities.sleep(2000);
        }
      } catch (emailError) {
        console.error(`이메일 발송 실패 ${index + 1} (${email}):`, emailError);
      }
    });

    console.log(`총 ${sentCount}/${CONFIG.notificationEmails.length}개 이메일 발송 완료`);
    return sentCount > 0;

  } catch (error) {
    console.error('이메일 발송 오류:', error);
    return false;
  }
}

// 긴급 알림 이메일
function sendEmergencyEmail(errorMessage) {
  try {
    const subject = `🚨 [회원의 날] 시스템 오류 발생`;
    const body = `회원의 날 신청 시스템에서 오류가 발생했습니다.

오류 발생 시간: ${new Date().toLocaleString('ko-KR')}
오류 내용: ${errorMessage}

즉시 확인이 필요합니다.`;

    CONFIG.notificationEmails.forEach(email => {
      MailApp.sendEmail(email, subject, body);
    });
  } catch (error) {
    console.error('긴급 이메일 발송 실패:', error);
  }
}

// GET 요청 처리 (상태 확인용)
function doGet(e) {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.spreadsheetId);
    const sheets = spreadsheet.getSheets();

    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'ready',
        message: '회원의 날 신청 시스템이 정상 작동 중입니다',
        timestamp: new Date().toLocaleString('ko-KR'),
        version: 'ULTIMATE 2025.09.15',
        config: {
          spreadsheetId: CONFIG.spreadsheetId,
          sheetName: CONFIG.sheetName,
          emailCount: CONFIG.notificationEmails.length,
          sheetsCount: sheets.length
        }
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: '시스템 점검이 필요합니다',
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 테스트 함수
function runUltimateTest() {
  console.log('=== ULTIMATE 시스템 테스트 ===');

  const testData = {
    name: '얼티메이트테스트',
    phone: '010-9999-0000',
    email: 'ultimate@test.com',
    ip: '192.168.1.1'
  };

  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };

  try {
    const result = doPost(mockEvent);
    const resultData = JSON.parse(result.getContent());
    console.log('테스트 결과:', resultData);
    return resultData;
  } catch (error) {
    console.error('테스트 실패:', error);
    return { status: 'error', message: error.toString() };
  }
}