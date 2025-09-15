// 스프레드시트 권한 테스트 함수
// Google Apps Script 에디터에서 실행하세요

function testSpreadsheetAccess() {
  try {
    console.log('=== 스프레드시트 접근 권한 테스트 ===');

    const spreadsheetId = '1YBHmXfPEbrGQ-VQEy-AbvgWAXx7Qk4-dNokB3Bdsfd0';

    // 1. 스프레드시트 열기 테스트
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    console.log('✅ 스프레드시트 열기 성공');

    // 2. 시트 접근 테스트
    let sheet;
    try {
      sheet = spreadsheet.getSheetByName('회원의날_신청자');
      console.log('✅ 기존 시트 접근 성공');
    } catch (e) {
      console.log('ℹ️ 새 시트 생성 중...');
      sheet = spreadsheet.insertSheet('회원의날_신청자');

      // 헤더 설정
      const headers = ['신청일시', '이름', '연락처', '이메일', '행사명', '상태', 'IP주소'];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      console.log('✅ 새 시트 생성 및 헤더 설정 완료');
    }

    // 3. 쓰기 권한 테스트
    const testData = [
      new Date().toLocaleString('ko-KR'),
      '권한테스트',
      '010-0000-0000',
      'test@test.com',
      '회원의 날(실전 프롬프트 비법 공개와 책소개)',
      '테스트',
      '127.0.0.1'
    ];

    sheet.appendRow(testData);
    const rowNumber = sheet.getLastRow();
    console.log('✅ 데이터 쓰기 성공, 행 번호:', rowNumber);

    // 4. 읽기 권한 테스트
    const savedData = sheet.getRange(rowNumber, 1, 1, testData.length).getValues()[0];
    console.log('✅ 데이터 읽기 성공:', savedData);

    return {
      status: 'success',
      message: '모든 권한 테스트 통과',
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
      testRowNumber: rowNumber
    };

  } catch (error) {
    console.error('❌ 권한 테스트 실패:', error);
    return {
      status: 'error',
      message: error.toString(),
      solution: '스프레드시트 공유 설정에서 편집자 권한을 부여해주세요'
    };
  }
}

// 실행 방법:
// 1. Google Apps Script 에디터에서 이 코드를 새 파일에 붙여넣기
// 2. 함수 선택 드롭다운에서 "testSpreadsheetAccess" 선택
// 3. 실행 버튼 클릭
// 4. 결과를 실행 로그에서 확인