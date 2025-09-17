// 🏆 회원의 날 신청 시스템 - Google Apps Script 코드 (오류 수정 버전)
// 버전: FIXED V2 2025.09.17
// 이 코드를 Google Apps Script 에디터에 모두 지우고 복사-붙여넣기 하세요

const CONFIG = {
  spreadsheetId: '1hFAXknx86eciOWfav1tIo3H-EBLXm8EjMg0BkHLRZaY',
  sheetName: '회원의날_신청자',
  notificationEmails: ['sangsu0916@gmail.com']
};

// 웹 앱으로 POST 요청을 받는 함수 (강화된 오류 처리)
function doPost(e) {
  try {
    console.log('=== 회원의 날 신청 처리 시작 ===');

    // 파라미터 안전성 검증
    if (!e) {
      console.error('이벤트 객체가 null 또는 undefined입니다');
      return createErrorResponse('이벤트 객체가 없습니다');
    }

    console.log('이벤트 객체 구조:', JSON.stringify(e, null, 2));

    // CORS 헤더 추가
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);

    // 입력 데이터 검증 및 파싱 (다중 방식 지원)
    let data;
    try {
      // 방법 1: POST body에서 JSON 데이터
      if (e.postData && e.postData.contents) {
        console.log('JSON 데이터 받음:', e.postData.contents);
        data = JSON.parse(e.postData.contents);
      }
      // 방법 2: URL 파라미터에서 data 필드
      else if (e.parameter && e.parameter.data) {
        console.log('FormData 데이터 받음:', e.parameter.data);
        data = JSON.parse(e.parameter.data);
      }
      // 방법 3: URL 파라미터에서 직접 필드들
      else if (e.parameter && e.parameter.name) {
        console.log('직접 파라미터 받음:', JSON.stringify(e.parameter));
        data = {
          name: e.parameter.name,
          phone: e.parameter.phone,
          email: e.parameter.email
        };
      }
      // 방법 4: GET 요청 처리 (테스트용)
      else if (e.parameter && Object.keys(e.parameter).length === 0) {
        console.log('GET 요청 또는 빈 파라미터 - 테스트 응답 반환');
        return output.setContent(JSON.stringify({
          status: 'success',
          message: '회원의 날 신청 시스템이 정상 작동 중입니다',
          timestamp: new Date().toISOString()
        }));
      }
      else {
        console.error('요청 데이터가 없습니다');
        console.log('전체 요청 정보:', JSON.stringify(e));
        return createErrorResponse('요청 데이터가 없습니다');
      }

      console.log('파싱된 데이터:', data);

      // 필수 필드 검증
      if (!data.name || !data.phone || !data.email) {
        console.error('필수 필드 누락:', data);
        return createErrorResponse('이름, 전화번호, 이메일은 필수입니다');
      }

    } catch (parseError) {
      console.error('데이터 파싱 실패:', parseError);
      return createErrorResponse('데이터 파싱 실패: ' + parseError.toString());
    }

    // 현재 시간 (한국 시간)
    const timestamp = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
    console.log('타임스탬프:', timestamp);

    // 1. 스프레드시트 저장
    let dbResult = { success: false, rowNumber: 0 };
    try {
      dbResult = saveToDatabase(data, timestamp);
      console.log('DB 저장 결과:', dbResult);
    } catch (dbError) {
      console.error('DB 저장 실패:', dbError);
      dbResult.error = dbError.toString();
    }

    // 2. 관리자 이메일 발송
    let adminEmailResult = false;
    try {
      adminEmailResult = sendNotificationEmail(data, timestamp, dbResult.rowNumber || 'N/A');
      console.log('관리자 이메일 결과:', adminEmailResult);
    } catch (emailError) {
      console.error('관리자 이메일 실패:', emailError);
    }

    // 3. 신청자 확인 이메일 발송
    let applicantEmailResult = false;
    try {
      applicantEmailResult = sendApplicantConfirmationEmail(data, timestamp);
      console.log('신청자 이메일 결과:', applicantEmailResult);
    } catch (emailError) {
      console.error('신청자 이메일 실패:', emailError);
    }

    // 최종 응답
    const response = {
      status: 'success',
      message: '신청이 완료되었습니다',
      timestamp: timestamp,
      results: {
        database: dbResult.success,
        adminEmail: adminEmailResult,
        applicantEmail: applicantEmailResult,
        rowNumber: dbResult.rowNumber
      }
    };

    console.log('최종 응답:', response);
    return output.setContent(JSON.stringify(response));

  } catch (error) {
    console.error('전체 처리 실패:', error);
    return createErrorResponse('시스템 오류: ' + error.toString());
  }
}

// GET 요청 처리 (테스트용)
function doGet(e) {
  console.log('GET 요청 받음:', JSON.stringify(e));

  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  return output.setContent(JSON.stringify({
    status: 'success',
    message: '회원의 날 신청 시스템이 정상 작동 중입니다 (GET 요청)',
    timestamp: new Date().toISOString(),
    note: 'POST 요청으로 데이터를 전송해주세요'
  }));
}

// 오류 응답 생성 헬퍼 함수
function createErrorResponse(message) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  return output.setContent(JSON.stringify({
    status: 'error',
    message: message,
    timestamp: new Date().toISOString()
  }));
}

// 스프레드시트에 데이터 저장
function saveToDatabase(data, timestamp) {
  try {
    console.log('DB 저장 시작...');

    const spreadsheet = SpreadsheetApp.openById(CONFIG.spreadsheetId);
    const sheet = spreadsheet.getSheetByName(CONFIG.sheetName);

    if (!sheet) {
      throw new Error(`시트를 찾을 수 없습니다: ${CONFIG.sheetName}`);
    }

    // 헤더가 없으면 추가
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 4).setValues([['신청일시', '이름', '연락처', '이메일']]);
      console.log('헤더 추가 완료');
    }

    // 데이터 추가
    const rowData = [timestamp, data.name, data.phone, data.email];
    const newRow = sheet.getLastRow() + 1;
    sheet.getRange(newRow, 1, 1, 4).setValues([rowData]);

    console.log(`✅ DB 저장 완료 - 행: ${newRow}`, rowData);

    return {
      success: true,
      rowNumber: newRow,
      data: rowData
    };

  } catch (error) {
    console.error('❌ DB 저장 실패:', error);
    return {
      success: false,
      error: error.toString(),
      rowNumber: 0
    };
  }
}

// 관리자 알림 이메일 (텍스트 형식)
function sendNotificationEmail(data, timestamp, rowNumber) {
  try {
    console.log('관리자 이메일 발송 시작...');

    const subject = `🚨 [관리자 알림] 회원의 날 신규 신청: ${data.name}님`;

    const body = `[관리자 전용] 회원의 날 신청 알림

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 새로운 신청자가 등록되었습니다!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 신청자 정보:
• 이름: ${data.name}
• 연락처: ${data.phone}
• 이메일: ${data.email}
• 신청일시: ${timestamp}
• DB 저장: 회원의날_신청자 시트 ${rowNumber}행

📊 관리 작업:
✅ 데이터베이스 자동 저장 완료
✅ 신청자 확인 이메일 자동 발송 완료

⚡ 관리자 할 일:
□ 신청자 연락 또는 문자 발송
□ 참석 인원 체크 및 좌석 준비
□ 행사 자료 준비 확인

📈 전체 명단 확인:
https://docs.google.com/spreadsheets/d/${CONFIG.spreadsheetId}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
※ 관리자 전용 알림 - 자동 발송
시스템: 회원의 날 신청 관리 시스템 v2.0`;

    // 관리자 이메일 발송
    CONFIG.notificationEmails.forEach(email => {
      MailApp.sendEmail(email, subject, body);
      console.log(`✅ 관리자 이메일 발송: ${email}`);
    });

    return true;

  } catch (error) {
    console.error('❌ 관리자 이메일 발송 실패:', error);
    return false;
  }
}

// 신청자 확인 이메일 (예쁜 HTML 형식)
function sendApplicantConfirmationEmail(data, timestamp) {
  try {
    console.log('신청자 확인 이메일 발송 시작...');

    const subject = `✅ 접수 완료 - 회원의 날 신청이 접수되었습니다 (${data.name}님)`;

    const htmlBody = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>회원의 날 신청 완료</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            line-height: 1.7;
            color: #2c3e50;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
            min-height: 100vh;
            padding: 20px 0;
        }
        .container {
            max-width: 650px;
            margin: 0 auto;
            background: white;
            border-radius: 25px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 80%, #f093fb 100%);
            color: white;
            padding: 50px 35px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
        }
        .header::after {
            content: '';
            position: absolute;
            bottom: -15px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 25px solid transparent;
            border-right: 25px solid transparent;
            border-top: 25px solid #764ba2;
            filter: drop-shadow(0 5px 10px rgba(0,0,0,0.2));
        }
        .header h1 {
            font-size: 38px;
            margin-bottom: 15px;
            font-weight: 900;
            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
            position: relative;
            z-index: 2;
        }
        .header p {
            font-size: 20px;
            opacity: 0.95;
            font-weight: 400;
            text-shadow: 0 1px 5px rgba(0,0,0,0.2);
            position: relative;
            z-index: 2;
        }
        .content {
            padding: 45px 35px;
            background: linear-gradient(180deg, #ffffff 0%, #fafbff 100%);
        }
        .greeting {
            font-size: 24px;
            color: #2c3e50;
            margin-bottom: 30px;
            text-align: center;
            padding: 25px;
            background: linear-gradient(135deg, #e8f4fd 0%, #f1f8ff 100%);
            border-radius: 20px;
            border: 2px solid #e3f2fd;
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.1);
        }
        .greeting strong {
            color: #667eea;
            font-weight: 800;
            font-size: 26px;
            text-shadow: 0 1px 3px rgba(102, 126, 234, 0.2);
        }
        .info-card {
            background: linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 100%);
            border: 2px solid #e1e8ff;
            border-radius: 20px;
            padding: 30px;
            margin: 30px 0;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.12);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        .info-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
        }
        .info-card h3 {
            color: #667eea;
            margin-bottom: 20px;
            font-size: 22px;
            font-weight: 800;
            text-shadow: 0 1px 3px rgba(102, 126, 234, 0.2);
        }
        .info-card h3[data-emoji]::before {
            content: attr(data-emoji);
            margin-right: 8px;
        }
        .event-details {
            background: linear-gradient(135deg, #ffe0f0 0%, #fce4ec 100%);
            border: 1px solid #f8bbd9;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
        }
        .event-details h4 {
            color: #c2185b;
            margin-bottom: 15px;
            font-size: 18px;
        }
        .detail-item {
            display: flex;
            margin: 8px 0;
            align-items: center;
        }
        .detail-item strong {
            min-width: 80px;
            color: #880e4f;
            font-weight: 600;
        }
        .highlight-box {
            background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
            border: 2px solid #81c784;
            border-radius: 20px;
            padding: 35px;
            margin: 35px 0;
            box-shadow: 0 12px 35px rgba(46, 125, 50, 0.15);
            position: relative;
            overflow: hidden;
        }
        .highlight-box::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 5px;
            background: linear-gradient(90deg, #4caf50 0%, #8bc34a 50%, #cddc39 100%);
        }
        .highlight-box h3 {
            color: #2e7d32;
            margin-bottom: 25px;
            font-size: 24px;
            font-weight: 800;
            text-shadow: 0 1px 3px rgba(46, 125, 50, 0.2);
            text-align: center;
        }
        .prompt-structure {
            margin-top: 20px;
        }
        .structure-item {
            background: white;
            border-radius: 15px;
            padding: 20px;
            margin: 15px 0;
            border-left: 6px solid #4caf50;
            box-shadow: 0 5px 20px rgba(0,0,0,0.08);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            position: relative;
        }
        .structure-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.12);
        }
        .structure-item::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #4caf50, #8bc34a);
            opacity: 0.1;
            border-radius: 0 15px 0 50px;
        }
        .structure-item h4 {
            color: #2e7d32;
            margin-bottom: 12px;
            font-size: 18px;
            font-weight: 700;
        }
        .structure-item p {
            color: #555;
            font-size: 15px;
            line-height: 1.6;
        }
        .structure-item em {
            color: #6a6a6a;
            font-style: italic;
            background: #f0f8f0;
            padding: 2px 6px;
            border-radius: 4px;
        }
        .contact-card {
            background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
            border: 1px solid #ffcc80;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .contact-card h4 {
            color: #ef6c00;
            margin-bottom: 15px;
        }
        .contact-item {
            margin: 8px 0;
            color: #e65100;
        }
        .footer {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 35px;
            text-align: center;
            border-top: 3px solid #dee2e6;
            color: #495057;
            position: relative;
            overflow: hidden;
        }
        .footer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
        }
        .footer p {
            margin: 8px 0;
            font-size: 15px;
            font-weight: 500;
        }
        .footer p:first-child {
            font-weight: 700;
            color: #343a40;
        }
        .emoji {
            font-size: 18px;
            margin-right: 8px;
        }
        .application-info {
            background: linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%);
            border: 1px solid #81d4fa;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
        }
        .application-info h4 {
            color: #0277bd;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ 신청 완료!</h1>
            <p>회원의 날 행사 신청이 성공적으로 접수되었습니다</p>
        </div>

        <div class="content">
            <div class="greeting">
                <strong>${data.name}</strong>님, 회원의 날 신청해주셔서 감사합니다! 🎉
            </div>

            <div class="application-info">
                <h4>📋 신청 정보 확인</h4>
                <div class="detail-item">
                    <strong>이름:</strong> ${data.name}
                </div>
                <div class="detail-item">
                    <strong>연락처:</strong> ${data.phone}
                </div>
                <div class="detail-item">
                    <strong>이메일:</strong> ${data.email}
                </div>
                <div class="detail-item">
                    <strong>신청일시:</strong> ${timestamp}
                </div>
            </div>

            <div class="event-details">
                <h4>📅 행사 상세 정보</h4>
                <div class="detail-item">
                    <strong>행사명:</strong> 회원의 날 - 실전 프롬프트 비법 공개와 책소개
                </div>
                <div class="detail-item">
                    <strong>일시:</strong> 2025년 9월 25일 (목) 오후 2시
                </div>
                <div class="detail-item">
                    <strong>장소:</strong> 에이큐브 본사
                </div>
                <div class="detail-item">
                    <strong>연사:</strong> 이상수
                </div>
                <div class="detail-item">
                    <strong>주제:</strong> 실전 프롬프트 비법 공개와 책소개
                </div>
                <div class="detail-item">
                    <strong>문의:</strong> 010-3709-5785 / sangsu0916@gmail.com
                </div>
                <div class="detail-item">
                    <span>${timestamp}</span>
                </div>
            </div>

            <div class="highlight-box">
                <h3 data-emoji="💡">실전 프롬프트 구조 미리보기</h3>
                <p style="margin-bottom: 20px; color: #555; text-align: center;">
                    행사에서 배우게 될 효과적인 프롬프트의 5가지 핵심 구조를 미리 만나보세요!
                </p>

                <div class="prompt-structure">
                    <div class="structure-item">
                        <h4>역할 설정 (Role)</h4>
                        <p>AI에게 구체적인 역할을 부여하여 전문성을 높입니다.<br>
                        <em>예: "당신은 10년 경력의 마케팅 전문가입니다."</em></p>
                    </div>

                    <div class="structure-item">
                        <h4>맥락 제공 (Context)</h4>
                        <p>상황과 배경 정보를 명확히 전달합니다.<br>
                        <em>예: "우리 회사는 IT 스타트업이며, 새로운 앱을 출시 예정입니다."</em></p>
                    </div>

                    <div class="structure-item">
                        <h4>구체적 요청 (Task)</h4>
                        <p>원하는 결과물을 명확하게 요청합니다.<br>
                        <em>예: "앱 출시를 위한 소셜미디어 마케팅 전략 3가지를 제안해주세요."</em></p>
                    </div>

                    <div class="structure-item">
                        <h4>형식 지정 (Format)</h4>
                        <p>결과물의 형태를 구체적으로 명시합니다.<br>
                        <em>예: "각 전략마다 제목, 설명, 예상 효과를 표 형태로 정리해주세요."</em></p>
                    </div>

                    <div class="structure-item">
                        <h4>제약 조건 (Constraints)</h4>
                        <p>필요한 제한사항이나 조건을 추가합니다.<br>
                        <em>예: "예산은 100만원 이내이며, 실행 기간은 1개월입니다."</em></p>
                    </div>
                </div>

                <div style="background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 50%, #ffe0b2 100%); border-radius: 20px; padding: 35px; margin-top: 35px; border: 3px solid #ffb74d; box-shadow: 0 15px 40px rgba(255, 152, 0, 0.2); position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 0; left: 0; right: 0; height: 6px; background: linear-gradient(90deg, #ff9800 0%, #ffc107 50%, #ffeb3b 100%);"></div>
                    <h4 style="color: #e65100; margin-bottom: 25px; font-size: 22px; font-weight: 800; text-align: center; text-shadow: 0 1px 3px rgba(230, 81, 0, 0.2);">💼 완성된 프롬프트 예시</h4>
                    <div style="background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%); border-radius: 15px; padding: 25px; font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace; font-size: 15px; line-height: 1.8; border: 2px solid #ffe0b2; box-shadow: inset 0 2px 10px rgba(0,0,0,0.05);">
                        <div style="margin: 0; color: #2c3e50;">
                            <div style="margin-bottom: 20px; padding: 15px; background: linear-gradient(135deg, #e3f2fd, #bbdefb); border-radius: 10px; border-left: 5px solid #1976d2;">
                                <strong style="color: #1976d2; font-size: 16px;">🎯 역할:</strong><br>
                                <span style="color: #424242; margin-left: 20px;">당신은 10년 경력의 디지털 마케팅 전문가입니다.</span>
                            </div>
                            <div style="margin-bottom: 20px; padding: 15px; background: linear-gradient(135deg, #e8f5e8, #c8e6c9); border-radius: 10px; border-left: 5px solid #388e3c;">
                                <strong style="color: #388e3c; font-size: 16px;">📋 맥락:</strong><br>
                                <span style="color: #424242; margin-left: 20px;">우리 회사는 B2B SaaS 스타트업이며, 중소기업 대상 업무 자동화 솔루션을 개발했습니다. 이제 첫 번째 제품을 출시하려고 합니다.</span>
                            </div>
                            <div style="margin-bottom: 20px; padding: 15px; background: linear-gradient(135deg, #fff3e0, #ffe0b2); border-radius: 10px; border-left: 5px solid #f57c00;">
                                <strong style="color: #f57c00; font-size: 16px;">⚡ 요청:</strong><br>
                                <span style="color: #424242; margin-left: 20px;">제품 출시를 위한 효과적인 디지털 마케팅 전략 3가지를 제안해주세요.</span>
                            </div>
                            <div style="margin-bottom: 20px; padding: 15px; background: linear-gradient(135deg, #f3e5f5, #e1bee7); border-radius: 10px; border-left: 5px solid #7b1fa2;">
                                <strong style="color: #7b1fa2; font-size: 16px;">📝 형식:</strong><br>
                                <span style="color: #424242; margin-left: 20px;">각 전략마다 다음과 같이 표 형태로 정리해주세요: 전략명, 구체적 실행방법, 예상 효과, 필요 리소스</span>
                            </div>
                            <div style="margin-bottom: 0; padding: 15px; background: linear-gradient(135deg, #ffebee, #ffcdd2); border-radius: 10px; border-left: 5px solid #d32f2f;">
                                <strong style="color: #d32f2f; font-size: 16px;">⚠️ 제약:</strong><br>
                                <span style="color: #424242; margin-left: 20px;">마케팅 예산은 월 500만원 이내이며, 실행 기간은 3개월입니다. 인력은 마케터 2명이 전담할 예정입니다.</span>
                            </div>
                        </div>
                    </div>
                    <div style="margin-top: 25px; padding: 20px; background: linear-gradient(135deg, #f0f4c3, #dcedc8); border-radius: 15px; border: 2px solid #aed581;">
                        <p style="margin: 0; font-size: 16px; color: #33691e; text-align: center; font-weight: 600;">
                            ✨ 이런 식으로 5가지 요소를 모두 포함하면 훨씬 정확하고 유용한 답변을 받을 수 있습니다! ✨
                        </p>
                    </div>
                </div>
            </div>


            <div class="contact-card">
                <h4>📞 문의사항이 있으시면 언제든 연락주세요!</h4>
                <div class="contact-item">
                    <strong>담당자:</strong> 이상수
                </div>
                <div class="contact-item">
                    <strong>연락처:</strong> 010-3709-5785
                </div>
                <div class="contact-item">
                    <strong>이메일:</strong> sangsu0916@gmail.com
                </div>
            </div>
        </div>

        <div class="footer">
            <p><strong>이 메일은 회원의 날 신청 완료 확인용으로 자동 발송되었습니다.</strong></p>
            <p>© 2025 에이큐브. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

    // 신청자에게 예쁜 HTML 이메일 발송
    MailApp.sendEmail({
      to: data.email,
      subject: subject,
      htmlBody: htmlBody
    });

    console.log(`✅ 신청자 확인 이메일 발송: ${data.email}`);
    return true;

  } catch (error) {
    console.error('❌ 신청자 이메일 발송 실패:', error);
    return false;
  }
}

// 권한 확인 함수
function checkPermissions() {
  console.log('=== 권한 확인 ===');

  // 스프레드시트 권한
  try {
    const ss = SpreadsheetApp.openById(CONFIG.spreadsheetId);
    console.log('✅ 스프레드시트 접근 가능:', ss.getName());
  } catch (error) {
    console.error('❌ 스프레드시트 접근 불가:', error.toString());
  }

  // 이메일 권한
  try {
    const quota = MailApp.getRemainingDailyQuota();
    console.log('✅ 이메일 권한 확인됨. 남은 발송 가능 수:', quota);
  } catch (error) {
    console.error('❌ 이메일 권한 없음:', error.toString());
  }
}

// 테스트 함수 (수동 실행용)
function runUltimateTest() {
  console.log('=== 완전 시스템 테스트 시작 ===');

  // 권한 확인
  checkPermissions();

  // 테스트 데이터
  const testData = {
    name: '테스트사용자',
    phone: '010-1234-5678',
    email: 'sangsu0916@gmail.com' // 테스트용 이메일
  };

  try {
    // 가짜 이벤트 객체 생성
    const mockEvent = {
      postData: {
        contents: JSON.stringify(testData)
      }
    };

    // doPost 함수 실행
    const result = doPost(mockEvent);
    console.log('테스트 결과:', result.getContent());

  } catch (error) {
    console.error('테스트 실패:', error);
  }
}