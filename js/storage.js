/* === STORAGE & SAVE === */

function buildSaveData(){return JSON.stringify({title:appTitle,subtitle:appSubtitle,library,doubts:_doubts});}
function saveCurrentFile(){downloadHtmlWithData(buildSaveData(),appTitle);}
function saveFileWithSet(idx){downloadHtmlWithData(buildSaveData(),library[idx].name);}

function downloadHtmlWithData(jsonData,filename) {
  const orig=document.documentElement.outerHTML;
  const updated=orig.replace(
    /(<script id="embedded-data" type="application\/json">)[\s\S]*?(<\/script>)/,
    `$1\n${jsonData}\n$2`
  );
  const blob=new Blob([updated],{type:'text/html;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url; a.download=(filename||'quiz').replace(/[^a-zA-Z0-9À-ÿ\s\-_]/g,'').trim()+'.html';
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  sndSave(); showNotif('✓ Arquivo salvo!');
}
