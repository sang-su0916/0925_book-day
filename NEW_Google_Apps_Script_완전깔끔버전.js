// 🏆 회원의 날 신청 시스템 - 완전 깔끔 버전
// 이 파일을 Google Apps Script 새 프로젝트에 복사-붙여넣기 하세요

const CONFIG = {
  spreadsheetId: '1hFAXknx86eciOWfav1tIo3H-EBLXm8EjMg0BkHLRZaY',
  sheetName: '회원의날_신청자',
  notificationEmails: ['sangsu0916@gmail.com']
};

// 웹 앱 POST 요청 처리
function doPost(e) {
  try {
    console.log('=== 신청 처리 시작 ===');

    // 데이터 파싱
    let data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    } else {
      throw new Error('데이터가 없습니다');
    }

    console.log('받은 데이터:', data);
    const timestamp = new Date().toLocaleString('ko-KR');

    // 1. 데이터베이스 저장
    const dbResult = saveToDatabase(data, timestamp);
    console.log('DB 저장 결과:', dbResult);

    // 2. 관리자 이메일 (텍스트)
    const adminResult = sendAdminEmail(data, timestamp, dbResult.rowNumber);
    console.log('관리자 이메일:', adminResult);

    // 3. 신청자 이메일 (HTML)
    const applicantResult = sendBeautifulEmail(data, timestamp);
    console.log('신청자 이메일:', applicantResult);

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: '신청이 완료되었습니다!',
        timestamp: timestamp
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('❌ 오류:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 데이터베이스 저장
function saveToDatabase(data, timestamp) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.spreadsheetId);
    const sheet = ss.getSheetByName(CONFIG.sheetName);

    const newRow = [
      timestamp,
      data.name,
      data.phone,
      data.email,
      '접수완료'
    ];

    sheet.appendRow(newRow);
    const rowNumber = sheet.getLastRow();

    return { success: true, rowNumber: rowNumber };
  } catch (error) {
    console.error('DB 저장 실패:', error);
    return { success: false, error: error.toString() };
  }
}

// 관리자 이메일 (간단한 텍스트)
function sendAdminEmail(data, timestamp, rowNumber) {
  try {
    const subject = `🚨 [관리자] 신규 신청: ${data.name}님`;
    const body = `새로운 신청이 접수되었습니다.

이름: ${data.name}
연락처: ${data.phone}
이메일: ${data.email}
신청시간: ${timestamp}
DB 행번호: ${rowNumber}

스프레드시트: https://docs.google.com/spreadsheets/d/${CONFIG.spreadsheetId}`;

    MailApp.sendEmail(CONFIG.notificationEmails[0], subject, body);
    console.log('✅ 관리자 이메일 발송');
    return true;
  } catch (error) {
    console.error('❌ 관리자 이메일 실패:', error);
    return false;
  }
}

// 신청자 이메일 (예쁜 HTML)
function sendBeautifulEmail(data, timestamp) {
  try {
    const subject = `✅ 접수완료 - 회원의 날 신청 (${data.name}님)`;

    const htmlBody = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Malgun Gothic', sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 20px; color: #667eea; margin-bottom: 20px; text-align: center; padding: 20px; background: #f8f9ff; border-radius: 10px; }
        .info-box { background: #f1f3ff; border: 2px solid #e1e8ff; border-radius: 10px; padding: 25px; margin: 20px 0; }
        .info-title { font-size: 18px; font-weight: bold; color: #667eea; margin-bottom: 15px; }
        .info-item { margin: 8px 0; }
        .highlight { color: #667eea; font-weight: bold; }
        .footer { background: #f8f9ff; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 신청이 완료되었습니다!</h1>
            <p>회원의 날에 오신 것을 환영합니다</p>
        </div>

        <div class="content">
            <div class="greeting">
                <strong>${data.name}님</strong>, 안녕하세요!<br>
                회원의 날 신청이 성공적으로 접수되었습니다.
            </div>

            <div class="info-box">
                <div class="info-title">📋 신청 정보</div>
                <div class="info-item">• 이름: <span class="highlight">${data.name}</span></div>
                <div class="info-item">• 연락처: <span class="highlight">${data.phone}</span></div>
                <div class="info-item">• 이메일: <span class="highlight">${data.email}</span></div>
                <div class="info-item">• 접수시간: <span class="highlight">${timestamp}</span></div>
            </div>

            <div class="info-box">
                <div class="info-title">📅 행사 정보</div>
                <div class="info-item">• 일시: <span class="highlight">2025년 9월 25일 (목) 오후 2시</span></div>
                <div class="info-item">• 장소: <span class="highlight">에이큐브 본사</span></div>
                <div class="info-item">• 강사: <span class="highlight">이상수</span></div>
                <div class="info-item">• 주제: <span class="highlight">실전 프롬프트 비법 공개와 책소개</span></div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <p style="font-size: 16px; color: #667eea;">
                    문의사항이 있으시면 언제든 연락주세요!<br>
                    📞 010-3709-5785 | ✉️ sangsu0916@gmail.com
                </p>
            </div>
        </div>

        <div class="footer">
            <p>© 2025 에이큐브. 감사합니다!</p>
        </div>
    </div>
</body>
</html>`;

    MailApp.sendEmail({
      to: data.email,
      subject: subject,
      htmlBody: htmlBody
    });

    console.log('✅ 신청자 HTML 이메일 발송:', data.email);
    return true;
  } catch (error) {
    console.error('❌ 신청자 이메일 실패:', error);
    return false;
  }
}

// 테스트 함수
function 테스트() {
  const testData = {
    name: '테스트사용자',
    phone: '010-1234-5678',
    email: 'sangsu0916@gmail.com'
  };

  console.log('=== 테스트 시작 ===');
  const result = sendBeautifulEmail(testData, new Date().toLocaleString('ko-KR'));
  console.log('테스트 결과:', result);
}