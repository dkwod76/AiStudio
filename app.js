const pageDefs = {
  background: { title: '배경 변경', sub: '이미지 배경만 정밀하게 변경합니다.', promptTitle: '배경 변경 지시', promptPlaceholder: '원하는 배경 스타일을 설명해주세요...', btn: '배경 변경 이미지 생성', left: '기본 이미지 업로드', right: '참조 배경 이미지' },
  pose: { title: '포즈 변경', sub: '참조 포즈 구조를 그대로 반영해 새로운 피팅 이미지를 생성합니다.', promptTitle: '추가 정밀 지침', promptPlaceholder: '포즈 변경 시 보정할 요소를 입력하세요...', btn: '포즈 변경 이미지 생성', left: '베이스 이미지 업로드', right: '참조 포즈 이미지' },
  product: { title: '제품 변경', sub: '참조 제품의 색감과 실루엣을 정밀 복제합니다.', promptTitle: '제품 정밀 매칭 옵션', promptPlaceholder: '강조할 디테일을 입력하세요...', btn: '제품 정밀 변경 이미지 생성', left: '베이스 이미지 업로드', right: '참조 제품 이미지' },
  color: { title: '색상 변경', sub: 'AI로 색상만 변환합니다.', promptTitle: '색상 변경', promptPlaceholder: '원하는 색상 변경 지침을 입력하세요...', btn: '색상 변경 이미지 생성', left: '베이스 이미지 업로드', right: '참조 색상 이미지' },
  detail: { title: '디테일 추출', sub: '특정 디테일을 고해상도로 추출합니다.', promptTitle: '디테일 추출', promptPlaceholder: '추출하고 싶은 디테일을 입력하세요...', btn: '디테일 추출 이미지 생성', left: '분석할 이미지 업로드', right: '참조 이미지' },
  multi: { title: 'Multi Fitting Change', sub: '하나의 베이스 이미지로 최대 5가지 피팅 변형을 동시 생성합니다.', promptTitle: '피팅 변형 설명 (최대 5개)', promptPlaceholder: '포즈 변형 설명 1~5를 줄바꿈으로 입력하세요...', btn: '0개 변형 동시 생성하기', left: '베이스 이미지 업로드', right: '변형 옵션 입력 영역', noRightUpload: true },
  ai: { title: 'AI Fitting Variation', sub: 'AI가 5가지 포즈 변형을 개별 생성합니다.', promptTitle: 'AI 피팅 변형 프롬프트 (필수)', promptPlaceholder: '원하는 피팅 스타일을 자세히 설명해주세요...', btn: 'AI 피팅 변형 5개 포즈 생성', left: '베이스 이미지 업로드', right: 'AI 프롬프트 입력 영역', noRightUpload: true },
  motion: { title: 'Motion Builder', sub: '정적 이미지에 자연스러운 모션 비디오를 생성합니다.', promptTitle: '모션 생성 프롬프트를 입력해주세요 (필수)', promptPlaceholder: '원하는 모션을 상세히 설명해주세요...', btn: '모션 비디오 생성', left: '모션을 적용할 이미지 업로드', right: '모션 프롬프트', noRightUpload: true },
};

function createToolPage(key, def) {
  const root = document.getElementById(`page-${key}`);
  const node = document.getElementById('tool-template').content.cloneNode(true);
  node.querySelector('.tool-header h2').textContent = def.title;
  node.querySelector('.tool-header .sub').textContent = def.sub;
  node.querySelector('.prompt-panel h3').textContent = def.promptTitle;
  node.querySelector('.prompt-panel textarea').placeholder = def.promptPlaceholder;
  node.querySelector('.gen-btn').textContent = def.btn;
  node.querySelector('.result-head h3').textContent = `${def.title} 결과`;

  const grid = node.querySelector('.upload-grid');
  grid.appendChild(makeUpload(def.left, true));
  if (def.noRightUpload) {
    const card = document.createElement('div');
    card.className = 'upload-card';
    card.innerHTML = `<h4>${def.right}</h4><p>이 영역은 프롬프트 입력으로 대체됩니다.</p>`;
    grid.appendChild(card);
  } else {
    grid.appendChild(makeUpload(def.right, false));
  }

  root.appendChild(node);
}

function makeUpload(title, required) {
  const card = document.createElement('div');
  card.className = 'upload-card';
  const id = `file-${Math.random().toString(36).slice(2)}`;
  card.innerHTML = `
    <div style="font-size:50px">☁️</div>
    <h4>${title}</h4>
    <p>${required ? '필수 업로드' : '선택 업로드'}</p>
    <small class="filename"></small>
    <label for="${id}">파일 선택</label>
    <input id="${id}" type="file" ${required ? 'data-required="true"' : ''}>
  `;
  return card;
}

Object.entries(pageDefs).forEach(([k,v])=>createToolPage(k,v));

const menu = document.getElementById('menu');
menu.addEventListener('click', (e)=>{
  const btn = e.target.closest('.menu-item');
  if (!btn) return;
  document.querySelectorAll('.menu-item').forEach(el=>el.classList.remove('active'));
  btn.classList.add('active');
  const page = btn.dataset.page;
  document.querySelectorAll('.page').forEach(el=>el.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
});

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('res-btn')) {
    const wrap = e.target.parentElement;
    wrap.querySelectorAll('.res-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
  }
});

document.addEventListener('change', (e)=>{
  if (e.target.matches('.upload-card input[type=file]')) {
    const name = e.target.files[0]?.name || '';
    e.target.closest('.upload-card').querySelector('.filename').textContent = name;
    syncPageState(e.target.closest('.page'));
  }
  if (e.target.id === 'chatInput') syncChatBtn();
});

document.addEventListener('input', (e)=>{
  if (e.target.matches('textarea')) syncPageState(e.target.closest('.page'));
  if (e.target.id === 'chatInput') syncChatBtn();
});

function syncPageState(pageEl) {
  if (!pageEl) return;
  const requiredUploads = [...pageEl.querySelectorAll('input[data-required="true"]')];
  const prompt = pageEl.querySelector('textarea');
  const genBtn = pageEl.querySelector('.gen-btn');
  const ready = requiredUploads.every(i => i.files.length) && !!prompt.value.trim();
  genBtn.disabled = !ready;
  genBtn.classList.toggle('enabled', ready);
  if (pageEl.id === 'page-multi') {
    const count = prompt.value.split('\n').map(v=>v.trim()).filter(Boolean).length;
    genBtn.textContent = `${count}개 변형 동시 생성하기`;
  }
}

document.addEventListener('click', (e)=>{
  if (e.target.classList.contains('gen-btn') && !e.target.disabled) {
    const pageEl = e.target.closest('.page');
    const resList = pageEl.querySelector('.result-list');
    const empty = pageEl.querySelector('.empty-result');
    const badge = pageEl.querySelector('.badge');
    const item = document.createElement('div');
    item.className = 'result-item';
    const count = resList.children.length + 1;
    item.innerHTML = `<strong>생성 결과 #${count}</strong><p>${new Date().toLocaleTimeString('ko-KR')}</p>`;
    resList.appendChild(item);
    resList.classList.remove('hidden');
    empty.classList.add('hidden');
    badge.textContent = `${count}개 생성됨`;
  }
  if (e.target.classList.contains('clear-btn')) {
    const panel = e.target.closest('.result-panel');
    panel.querySelector('.result-list').innerHTML='';
    panel.querySelector('.result-list').classList.add('hidden');
    panel.querySelector('.empty-result').classList.remove('hidden');
    panel.querySelector('.badge').textContent='0개 생성됨';
  }
});

// free chat
const rooms = [{title:'새 채팅', date:'마지막 대화: 2025. 2. 18.'}];
const chatRooms = document.getElementById('chatRooms');
function renderRooms(){ chatRooms.innerHTML = rooms.map(r=>`<div class="chat-room"><strong>${r.title}</strong><div class="date">${r.date}</div></div>`).join(''); }
renderRooms();
document.getElementById('newChat').addEventListener('click', ()=>{
  rooms.unshift({title:`새 채팅 ${rooms.length+1}`, date:`마지막 대화: ${new Date().toLocaleDateString('ko-KR')}`});
  renderRooms();
});
const messages = document.getElementById('messages');
messages.innerHTML = `<div class="msg"><div>🤖</div><div class="bubble">안녕하세요! 저는 비트업스페이스의 이미지 생성 전문 AI입니다. 이미지를 업로드하고 분석을 요청하거나 새로운 스타일을 생성해보세요!</div></div>`;
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendChat');
function syncChatBtn(){ sendBtn.style.color = chatInput.value.trim() ? '#3af5aa' : '#3d526e'; }
function sendChat(){
  const text = chatInput.value.trim();
  if (!text) return;
  messages.insertAdjacentHTML('beforeend', `<div class="msg user"><div class="bubble">${text}</div></div>`);
  messages.insertAdjacentHTML('beforeend', `<div class="msg"><div>🤖</div><div class="bubble">요청을 분석했습니다. 업로드 이미지를 기반으로 작업을 준비할게요.</div></div>`);
  chatInput.value='';
  syncChatBtn();
  messages.scrollTop = messages.scrollHeight;
}
sendBtn.addEventListener('click', sendChat);
chatInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') sendChat(); });
