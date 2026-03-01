// GPT Lab - App JavaScript
const SHEET_ID = '1hV8bLhwTI2cBq0Is_mqn_Mt5fPxtGQ3CZ4_naFk3JiY';
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzxFrCJirfgpEmAf0EmfxBsxZEoPdyvjZ806sJkxD-OuSaypmSvXvuKoLafSukbDEF4IA/exec';
const PASSWORD = '3820';

// Google Sheets에서 데이터 가져오기
async function fetchSheetData(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${sheetName}`;

  try {
    const response = await fetch(url);
    const text = await response.text();

    // Google의 JSON 응답에서 실제 데이터 추출
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonString = text.substring(jsonStart, jsonEnd);
    const data = JSON.parse(jsonString);

    return parseSheetData(data, sheetName);
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

function parseSheetData(data, sheetName) {
  const rows = data.table.rows;
  const cols = data.table.cols;
  const result = [];

  // 헤더 건너뛰기 (첫 번째 행)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row.c || !row.c[0]) continue;

    if (sheetName === 'Publications') {
      result.push({
        id: row.c[0] ? row.c[0].v : '',
        year: row.c[1] ? row.c[1].v : '',
        authors: row.c[2] ? row.c[2].v : '',
        title: row.c[3] ? row.c[3].v : '',
        journal: row.c[4] ? row.c[4].v : '',
        details: row.c[5] ? row.c[5].v : '',
        link: row.c[6] ? row.c[6].v : ''
      });
    } else if (sheetName === 'News') {
      result.push({
        id: row.c[0] ? row.c[0].v : '',
        title: row.c[1] ? row.c[1].v : '',
        description: row.c[2] ? row.c[2].v : '',
        imageUrl: row.c[3] ? row.c[3].v : '',
        date: row.c[4] ? formatDate(row.c[4].v) : ''
      });
    } else if (sheetName === 'Members') {
      result.push({
        id: row.c[0] ? row.c[0].v : '',
        name: row.c[1] ? row.c[1].v : '',
        role: row.c[2] ? row.c[2].v : '',
        imageUrl: row.c[3] ? row.c[3].v : '',
        order: row.c[4] ? row.c[4].v : 0
      });
    }
  }

  return result;
}

function formatDate(dateValue) {
  if (!dateValue) return '';
  if (typeof dateValue === 'string') {
    // Date(yyyy,m,d) 형식 파싱
    const match = dateValue.match(/Date\((\d+),(\d+),(\d+)\)/);
    if (match) {
      const year = match[1];
      const month = String(parseInt(match[2]) + 1).padStart(2, '0');
      const day = String(match[3]).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }
  return dateValue;
}

// Apps Script API 호출 (쓰기 작업용)
async function callAppsScript(action, data, password) {
  if (password !== PASSWORD) {
    return { success: false, message: 'Incorrect password' };
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: action,
        data: data,
        password: password
      })
    });

    // no-cors 모드에서는 응답을 읽을 수 없음
    // 성공했다고 가정하고 페이지 새로고침
    return { success: true };
  } catch (error) {
    console.error('Error calling Apps Script:', error);
    return { success: false, message: error.toString() };
  }
}

// 페이지 공통 초기화
document.addEventListener('DOMContentLoaded', function() {
  // 네비게이션 active 상태 설정
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function(link) {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Reveal 애니메이션
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(function(el) {
    observer.observe(el);
  });
});

// HTML 이스케이프
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Google Drive URL을 lh3 형식으로 변환 (더 안정적인 이미지 로딩)
function convertDriveUrl(url) {
  if (!url) return '';
  // https://drive.google.com/uc?export=view&id=FILE_ID 형식에서 ID 추출
  const match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) {
    return 'https://lh3.googleusercontent.com/d/' + match[1];
  }
  // 이미 lh3 형식이거나 다른 URL이면 그대로 반환
  return url;
}
