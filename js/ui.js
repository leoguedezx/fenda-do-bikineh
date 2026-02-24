/* === UI: TABS, RENDER, MODAL, NOTIFICATIONS === */

/* ═══════════════════════════════════
   MODAL
═══════════════════════════════════ */
function showModal({title,sub,bodyText,input,inputPlaceholder,inputValue,confirmLabel,danger,onConfirm}){
  document.getElementById('app-modal')?.remove();
  const overlay=document.createElement('div');
  overlay.className='modal-overlay';overlay.id='app-modal';
  overlay.innerHTML=`<div class="modal-box">
    <div class="modal-title">${title}</div>
    ${sub?`<div class="modal-sub">${sub}</div>`:''}
    ${bodyText?`<div class="modal-body-text">${bodyText}</div>`:''}
    ${input?`<input class="modal-input" id="modal-inp" type="text" placeholder="${inputPlaceholder||''}" value="${inputValue||''}" />`:''}
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn ${danger?'btn-danger':'btn-primary'}" id="modal-ok">${confirmLabel||'Confirmar'}</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
  window._modalCb=onConfirm;
  if(input){const inp=document.getElementById('modal-inp');inp.focus();inp.select();inp.addEventListener('keydown',e=>{if(e.key==='Enter') doConfirm();});}
  overlay.addEventListener('click',e=>{if(e.target===overlay) closeModal();});
  document.getElementById('modal-ok').addEventListener('click',doConfirm);
}
function doConfirm(){const inp=document.getElementById('modal-inp');const v=inp?inp.value:null;closeModal();if(window._modalCb) window._modalCb(v);}
function closeModal(){document.getElementById('app-modal')?.remove();}

/* ═══════════════════════════════════
   NOTIFICATION
═══════════════════════════════════ */
function showNotif(msg,err=false){
  const n=document.createElement('div');n.className='notif'+(err?' err':'');n.textContent=msg;
  document.body.appendChild(n);setTimeout(()=>n.remove(),3000);
}

/* ═══════════════════════════════════
   TABS
═══════════════════════════════════ */
function switchTab(tab) {
  sndClick();
  currentTab = tab;
  document.querySelectorAll('.tab-btn').forEach((b,i) => {
    b.classList.toggle('active', ['import','library','quiz'][i] === tab);
  });
  render();
}

function render() {
  const s = document.getElementById('screen');
  if (currentTab === 'import')       renderImport(s);
  else if (currentTab === 'library') renderLibrary(s);
  else if (currentTab === 'quiz')    renderQuizScreen(s);
}
