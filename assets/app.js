const uxml = document.getElementById('uxml');
const uss = document.getElementById('uss');
const preview = document.getElementById('preview');
const uxmlStatus = document.getElementById('uxmlStatus');
const ussStatus = document.getElementById('ussStatus');
const previewStatus = document.getElementById('previewStatus');

const sampleUxml = `<ui:UXML xmlns:ui="UnityEngine.UIElements">
  <ui:VisualElement name="main-menu" class="menu">
    <ui:Label text="MY GAME" class="title" />
    <ui:Label text="Welcome back, player." class="subtitle" />

    <ui:VisualElement class="button-list">
      <ui:Button text="PLAY" name="play-button" class="menu-button" />
      <ui:Button text="SETTINGS" class="menu-button" />
      <ui:Button text="QUIT" class="menu-button quit" />
    </ui:VisualElement>
  </ui:VisualElement>
</ui:UXML>`;

const sampleUss = `.menu {
  width: 520px;
  min-height: 520px;
  padding: 50px;
  background-color: rgb(25, 28, 36);
  border-width: 2px;
  border-color: rgb(75, 82, 100);
  border-radius: 12px;
  justify-content: center;
  align-items: center;
}

.title {
  font-size: 42px;
  -unity-font-style: bold;
  color: rgb(235, 238, 255);
  margin-bottom: 8px;
}

.subtitle {
  color: rgb(155, 162, 180);
  margin-bottom: 35px;
}

.button-list {
  width: 100%;
  gap: 12px;
}

.menu-button {
  height: 52px;
  background-color: rgb(58, 68, 95);
  border-radius: 7px;
  border-width: 0;
  color: white;
  font-size: 17px;
  -unity-font-style: bold;
}

.menu-button:hover {
  background-color: rgb(79, 94, 130);
}

.quit {
  background-color: rgb(100, 52, 60);
}`;

const aliases = {
  'engine:VisualElement':'div',
  'ui:VisualElement':'div',
  'VisualElement':'div',
  'engine:Label':'span',
  'ui:Label':'span',
  'Label':'span',
  'engine:Button':'button',
  'ui:Button':'button',
  'Button':'button',
  'ui:TextField':'input',
  'TextField':'input',
  'ui:IntegerField':'input',
  'IntegerField':'input',
  'ui:FloatField':'input',
  'FloatField':'input',
  'ui:Toggle':'input',
  'Toggle':'input',
  'ui:Slider':'input',
  'Slider':'input',
  'ui:SliderInt':'input',
  'SliderInt':'input',
  'ui:MinMaxSlider':'input',
  'MinMaxSlider':'input',
  'ui:DropdownField':'select',
  'DropdownField':'select',
  'ui:PopupField':'select',
  'PopupField':'select',
  'ui:EnumField':'select',
  'EnumField':'select',
  'ui:ScrollView':'div',
  'ScrollView':'div',
  'ui:Foldout':'details',
  'Foldout':'details',
  'ui:GroupBox':'fieldset',
  'GroupBox':'fieldset',
  'ui:HelpBox':'div',
  'HelpBox':'div',
  'ui:ProgressBar':'progress',
  'ProgressBar':'progress',
  'ui:Image':'img',
  'Image':'img',
  'ui:TemplateContainer':'div',
  'TemplateContainer':'div',
  'ui:TwoPaneSplitView':'div',
  'TwoPaneSplitView':'div'
};

function safeText(v){return v == null ? '' : String(v)}

function makeElement(node){
  const name = node.nodeName;
  if(name === 'ui:UXML' || name === 'engine:UXML' || name === 'UXML'){
    for(const child of [...node.children]){
      const rendered = makeElement(child);
      if(rendered) return rendered;
    }
    return null;
  }

  const tag = aliases[name] || aliases[node.localName] || 'div';
  let el = document.createElement(tag);
  const attrs = {};
  for(const a of [...node.attributes]) attrs[a.name] = a.value;

  let cls = attrs.class || '';
  el.className = 'uxml-box ' + cls;
  if(attrs.name) el.id = 'uxml-' + attrs.name.replace(/[^a-zA-Z0-9_-]/g,'-');

  const type = attrs.type || '';
  if(tag === 'button') {
    el.className = 'uxml-button ' + cls;
    el.type = 'button';
    el.textContent = attrs.text || '';
  } else if(tag === 'input') {
    el.className = 'uxml-field ' + cls;
    if(name.includes('Toggle')) el.type='checkbox';
    else if(name.includes('Slider')) el.type='range';
    else el.type = attrs.password === 'true' ? 'password' : 'text';
    el.value = attrs.value ?? '';
    if(attrs.label) el.setAttribute('aria-label',attrs.label);
    if(attrs.value) el.value=attrs.value;
  } else if(tag === 'select') {
    el.className = 'uxml-dropdown ' + cls;
    const choices=(attrs.choices||'').split(',').map(x=>x.trim()).filter(Boolean);
    choices.forEach(c=>{const o=document.createElement('option');o.textContent=c;o.value=c;el.appendChild(o)});
  } else if(tag === 'details') {
    const s=document.createElement('summary'); s.textContent=attrs.text || attrs.label || 'Foldout'; el.appendChild(s);
  } else if(tag === 'fieldset') {
    const l=document.createElement('legend'); l.textContent=attrs.text || attrs.label || ''; el.appendChild(l);
  } else if(tag === 'progress') {
    el.className='uxml-progress ' + cls;
    el.max=parseFloat(attrs.highValue || attrs.max || '100');
    el.value=parseFloat(attrs.value || '0');
  } else if(tag === 'img') {
    el.className='uxml-image ' + cls;
    el.alt=attrs.name || '';
    if(attrs.image) el.src=attrs.image;
  } else if(tag === 'span') {
    el.className='uxml-label ' + cls;
    el.textContent=attrs.text || '';
  } else {
    el.className='uxml-box ' + cls;
  }

  if(attrs.tooltip) el.title=attrs.tooltip;
  if(attrs.style) el.setAttribute('style', transformUSS(attrs.style));

  for(const child of [...node.children]){
    const ce=makeElement(child);
    if(ce) el.appendChild(ce);
  }
  return el;
}

function transformUSS(css){
  let out=css;
  out=out.replace(/-webkit-unity-font-style\s*:\s*bold\s*;?/gi,'font-weight:bold;');
  out=out.replace(/-unity-font-style\s*:\s*bold\s*;?/gi,'font-weight:bold;');
  out=out.replace(/-unity-font-style\s*:\s*italic\s*;?/gi,'font-style:italic;');
  out=out.replace(/-unity-font-style\s*:\s*bold-italic\s*;?/gi,'font-weight:bold;font-style:italic;');
  out=out.replace(/-unity-font-style\s*:\s*normal\s*;?/gi,'font-weight:normal;');
  out=out.replace(/-unity-text-align\s*:\s*(\w+)\s*;/gi,'text-align:$1;');
  out=out.replace(/-unity-background-scale-mode\s*:\s*scale-to-fit\s*;/gi,'object-fit:contain;');
  out=out.replace(/-unity-background-scale-mode\s*:\s*scale-and-crop\s*;/gi,'object-fit:cover;');
  out=out.replace(/-unity-background-scale-mode\s*:\s*stretch-to-fill\s*;/gi,'object-fit:fill;');
  out=out.replace(/-unity-font-definition\s*:[^;]+;/gi,'');
  out=out.replace(/-unity-\w+\s*:[^;]+;/gi,'');
  return out;
}

function render(){
  preview.innerHTML='';
  const old=document.getElementById('dynamicUSS'); if(old) old.remove();

  try{
    const parser=new DOMParser();
    const source=uxml.value.replace(/\\:/g,':').replace(/\\</g,'<').replace(/\\>/g,'>');
    const doc=parser.parseFromString(source,'application/xml');
    const err=doc.querySelector('parsererror');
    if(err) throw new Error('Invalid XML: ' + err.textContent.replace(/\s+/g,' ').slice(0,250));

    const root=doc.documentElement;
    const el=makeElement(root);
    if(!el) throw new Error('No renderable root element found.');
    el.classList.add('uxml-root');
    preview.appendChild(el);

    const style=document.createElement('style');
    style.id='dynamicUSS';
    style.textContent=transformUSS(uss.value);
    document.head.appendChild(style);

    const count=preview.querySelectorAll('*').length;
    previewStatus.textContent=count + ' elements';
    if(controller.fileName) buildMapping();
    updateMockPanel();
    uxmlStatus.textContent='Rendered successfully';
    uxmlStatus.className='status';
    ussStatus.textContent='USS applied';
    ussStatus.className='status';
    preview.querySelectorAll('button').forEach(btn=>{
      btn.addEventListener('click',()=>{
        previewStatus.textContent='Clicked: ' + (btn.textContent || 'Button');
      });
    });
  }catch(e){
    preview.innerHTML='<div style="padding:20px;color:#ff7d7d;font:13px Consolas,monospace;white-space:pre-wrap">'+escapeHtml(e.message)+'</div>';
    previewStatus.textContent='Render error';
    uxmlStatus.textContent=e.message;
    uxmlStatus.className='status error';
  }
}

function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}



let csSource='';
let csInfo={fields:[],methods:[],types:[]};
const uxmlElements=[
  ['VisualElement','element'],['Label','element'],['Button','element'],['TextField','element'],
  ['IntegerField','element'],['FloatField','element'],['DoubleField','element'],['LongField','element'],
  ['Toggle','element'],['Slider','element'],['SliderInt','element'],['ScrollView','element'],
  ['Foldout','element'],['ListView','element'],['DropdownField','element'],['EnumField','element'],
  ['ObjectField','element'],['PropertyField','element'],['ProgressBar','element'],['Image','element'],
  ['Box','element'],['GroupBox','element']
];
const uxmlAttrs=[
  ['name','attribute'],['text','attribute'],['class','attribute'],['style','attribute'],
  ['tooltip','attribute'],['binding-path','attribute'],['display-tooltip-when-elided','attribute'],
  ['tabindex','attribute'],['focusable','attribute'],['picking-mode','attribute'],
  ['view-data-key','attribute'],['enabled-self','attribute'],['visible','attribute']
];
const ussProps=[
  'background-color','color','font-size','-unity-font-style','-unity-text-align','width','height',
  'min-width','min-height','max-width','max-height','margin','margin-top','margin-right','margin-bottom',
  'margin-left','padding','padding-top','padding-right','padding-bottom','padding-left',
  'border-width','border-color','border-radius','border-top-left-radius','border-top-right-radius',
  'border-bottom-left-radius','border-bottom-right-radius','position','top','right','bottom','left',
  'flex-direction','flex-wrap','flex-grow','flex-shrink','flex-basis','align-items','align-self',
  'justify-content','overflow','opacity','display','visibility','font-style','font-weight','letter-spacing'
];

function logConsole(message, type='info'){
  const body=document.getElementById('consoleBody');
  if(!body) return;
  const row=document.createElement('div');
  row.className='log-line log-'+type;
  const t=new Date().toLocaleTimeString();
  row.textContent=`[${t}] ${message}`;
  body.append(row);
  body.scrollTop=body.scrollHeight;
}

let controller={
  source:'',
  fileName:'',
  fields:[],
  methods:[],
  types:[],
  refs:[],
  assignments:[],
  events:[],
  bindings:{}
};

function parseCSharp(src){
  const fields=[], methods=[], types=[], refs=[], assignments=[], events=[];
  let m;
  const fieldRe=/\b(?:(?:public|private|protected|internal|static|readonly|const|volatile|sealed|virtual|override|new|SerializeField)\s+)*([A-Za-z_][\w<>\[\],.?]*)\s+([A-Za-z_]\w*)\s*(?:=[^;]+)?;/g;
  while((m=fieldRe.exec(src))){
    const type=m[1], name=m[2];
    if(!['if','for','while','return','new'].includes(type) && !fields.some(x=>x.name===name))
      fields.push({type,name});
  }
  const methodRe=/\b(?:public|private|protected|internal|static|virtual|override|async|sealed|new|\s)+([A-Za-z_][\w<>\[\],.?]*)\s+([A-Za-z_]\w*)\s*\(([^)]*)\)/g;
  while((m=methodRe.exec(src))){
    if(!['if','for','while','switch','catch'].includes(m[2]))
      methods.push({returnType:m[1],name:m[2],args:m[3]});
  }
  const typeRe=/\b(?:class|struct|interface|enum)\s+([A-Za-z_]\w*)/g;
  while((m=typeRe.exec(src))) types.push(m[1]);

  // root.Q<T>("UxmlName") -> C# field -> UXML name
  const qRe=/(\w+)\s*=\s*root\.Q<\s*([\w.]+)\s*>\(\s*"([^"]+)"\s*\)/g;
  while((m=qRe.exec(src))) refs.push({field:m[1],type:m[2].split('.').pop(),uxml:m[3]});

  // label.text = $"..." assignments, retained for the mock interpreter
  const assignRe=/(\w+)\.text\s*=\s*\$?"([^"\n]*)"/g;
  while((m=assignRe.exec(src))) assignments.push({field:m[1],template:m[2]});

  // $"HP: {playerHealth.CurrentHealth} / {playerHealth.MaxHealth}"
  const interpRe=/(\w+)\.text\s*=\s*\$"([^"\n]*)"/g;
  while((m=interpRe.exec(src))) assignments.push({field:m[1],template:m[2]});

  // AddListener(EventName, MethodName)
  const eventRe=/(\w+)\.(\w+)\.AddListener\(\s*(\w+)\s*\)/g;
  while((m=eventRe.exec(src))) events.push({object:m[1],event:m[2],handler:m[3]});

  return {fields,methods,types,refs,assignments,events};
}

function connectController(text,fileName){
  controller.source=text;
  controller.fileName=fileName;
  const parsed=parseCSharp(text);
  Object.assign(controller,parsed);
  document.getElementById('csDot').classList.add('connected');
  document.getElementById('csFileName').textContent=fileName;
  document.getElementById('uxmlStatus').textContent=
    `C#: ${parsed.fields.length} fields • ${parsed.methods.length} methods • ${parsed.refs.length} UXML refs`;
  logConsole(`Linked ${fileName}`, 'ok');
  parsed.refs.forEach(r=>logConsole(`Linked C# ${r.field} → UXML "${r.uxml}"`, 'info'));
  parsed.events.forEach(e=>logConsole(`Event ${e.object}.${e.event} → ${e.handler}()`, 'info'));
  buildMapping();
  updateMockPanel();
}

function buildMapping(){
  const box=document.getElementById('mapRows');
  if(!box) return;
  box.innerHTML='';
  if(!controller.refs.length){
    box.textContent='No root.Q<T>("name") references found.';
    return;
  }
  controller.refs.forEach(ref=>{
    const row=document.createElement('div');
    row.className='map-row';
    const label=document.createElement('label');
    label.textContent=`${ref.field} → ${ref.uxml}`;
    const select=document.createElement('select');
    const opts=[...preview.querySelectorAll('[id]')];
    const names=[...new Set(opts.map(e=>e.id).filter(Boolean))];
    names.forEach(n=>{
      const o=document.createElement('option');o.value=n;o.textContent=n;
      if(n===ref.uxml)o.selected=true;
      select.append(o);
    });
    select.addEventListener('change',()=>{
      controller.bindings[ref.field]=select.value;
      logConsole(`Mapped ${ref.field} → UXML "${select.value}"`, 'ok');
    });
    row.append(label,select);box.append(row);
  });
}

function updateMockPanel(){
  const panel=document.getElementById('mockPanel');
  const box=document.getElementById('mockFields');
  if(!controller.fields.length){panel.classList.add('hidden');box.innerHTML='';return;}
  const useful=controller.fields.filter(f=>/int|float|double|decimal|long|short|string|bool/i.test(f.type));
  if(!useful.length){panel.classList.add('hidden');return;}
  panel.classList.remove('hidden');
  box.innerHTML='';
  useful.forEach(f=>{
    const row=document.createElement('div');row.className='mock-row';
    const label=document.createElement('label');label.textContent=f.name;
    const input=document.createElement('input');
    input.value=/string/i.test(f.type)?'':/bool/i.test(f.type)?'false':'0';
    input.dataset.field=f.name;
    input.addEventListener('input',()=>applyMockValues(false));
    row.append(label,input);box.append(row);
  });
  applyMockValues(false);
}

function mockValue(name){
  const el=document.querySelector(`#mockFields input[data-field="${CSS.escape(name)}"]`);
  return el ? el.value : undefined;
}

function applyMockValues(announce=true){
  const values={};
  document.querySelectorAll('#mockFields input').forEach(i=>values[i.dataset.field]=i.value);

  // Simulate common text assignments from the linked controller.
  controller.refs.forEach(ref=>{
    const targetName=controller.bindings[ref.field]||ref.uxml;
    const target=preview.querySelector('#'+CSS.escape(targetName));
    if(!target) return;

    if(/hp/i.test(ref.field) && /label/i.test(ref.type)){
      const cur=values.CurrentHealth;
      const max=values.MaxHealth;
      if(cur!==undefined) target.textContent=`HP: ${cur} / ${max!==undefined?max:'--'}`;
    }
    if(/armor/i.test(ref.field)){
      const v=values.Armor;
      if(v!==undefined) target.textContent=`Armor: ${v}`;
    }
    if(/damage|attack/i.test(ref.field)){
      const v=values.AttackDmg ?? values.Damage;
      if(v!==undefined) target.textContent=`Damage: ${v}`;
    }
  });

  // Generic mapping from assignments when the assignment target is known.
  controller.assignments.forEach(a=>{
    const targetName=controller.bindings[a.field] || controller.refs.find(r=>r.field===a.field)?.uxml;
    const target=targetName ? preview.querySelector('#'+CSS.escape(targetName)) : null;
    if(!target) return;
    let out=a.template;
    out=out.replace(/\{([^}]+)\}/g,(_,expr)=>{
      const parts=expr.trim().split('.');
      const direct=values[parts[parts.length-1]];
      return direct!==undefined ? direct : `[${expr}]`;
    });
    if(out.includes('[')) return;
    target.textContent=out;
  });

  if(announce) logConsole('Mock state applied to HUD', 'ok');
}

function runMock(){
  if(!controller.fileName){
    logConsole('No C# controller linked. Load a .cs file first.', 'warn');
    return;
  }
  logConsole(`Running mock controller: ${controller.fileName}`, 'info');
  render();
  setTimeout(()=>applyMockValues(true),0);
  controller.events.forEach(e=>logConsole(`MOCK EVENT: ${e.event} → ${e.handler}()`, 'ok'));
  logConsole('Mock execution complete. Unity APIs are simulated, not executed.', 'warn');
}


function showAutocomplete(items, textarea, start, end){
  let box=document.getElementById('autocomplete');
  if(!box){box=document.createElement('div');box.id='autocomplete';box.className='autocomplete';document.body.append(box);}
  box.innerHTML='';
  items.slice(0,40).forEach((item,i)=>{
    const row=document.createElement('div');row.className='ac-item'+(i===0?' selected':'');
    row.innerHTML=`<span class="ac-kind"></span><span></span><span class="ac-detail"></span>`; row.children[0].textContent=item.kind; row.children[1].textContent=item.name; row.children[2].textContent=item.detail||'';
    row.addEventListener('mousedown',e=>{
      e.preventDefault();
      textarea.setRangeText(item.insert||item.name,start,end,'end');
      box.style.display='none'; textarea.focus(); render();
    });
    box.append(row);
  });
  if(!items.length){box.style.display='none';return;}
  const r=textarea.getBoundingClientRect();
  box.style.left=Math.min(r.left+20,window.innerWidth-430)+'px';
  box.style.top=Math.min(r.top+42,window.innerHeight-280)+'px';
  box.style.display='block';
}

function getSuggestions(textarea){
  const text=textarea.value, pos=textarea.selectionStart;
  const before=text.slice(0,pos);
  const isUSS=textarea===uss;
  const isUXML=textarea===uxml;
  const line=before.split(/\n/).pop();
  let items=[];
  if(isUXML){
    const tagMatch=line.match(/<([\w:-]*)$/);
    const attrMatch=line.match(/<[\w:-]+\s+[\w-]*$/);
    const nameMatch=line.match(/(?:name|class)="([^"]*)$/);
    if(tagMatch){
      items=uxmlElements.map(x=>({name:'engine:'+x[0],kind:x[1],insert:'engine:'+x[0]}));
    }else if(attrMatch){
      items=uxmlAttrs.map(x=>({name:x[0],kind:x[1]}));
    }else if(nameMatch){
      const prefix=nameMatch[1];
      const names=[...new Set(csInfo.fields.map(f=>f.name).concat(['DebugWindow','HpLabel','ArmorLabel','DamageLabel']))];
      items=names.filter(n=>n.toLowerCase().startsWith(prefix.toLowerCase())).map(n=>({name:n,kind:'C# name'}));
    }
    const classMatch=line.match(/class="([^"]*)$/);
    if(classMatch){
      const prefix=classMatch[1].split(/\s+/).pop();
      const classes=[...new Set([...uss.value.matchAll(/\.([A-Za-z_][\w-]*)\s*\{/g)].map(m=>m[1]))];
      items=classes.filter(n=>n.toLowerCase().startsWith(prefix.toLowerCase())).map(n=>({name:n,kind:'USS class'}));
    }
  }else if(isUSS){
    if(/\{\s*[^}]*[\w-]*$/.test(before.split(/\n/).pop())){
      const prefix=line.match(/([\w-]*)$/)?.[1]||'';
      items=ussProps.filter(x=>x.startsWith(prefix)).map(x=>({name:x,kind:'property'}));
    }else if(/^\s*\.[\w-]*$/.test(line)){
      const prefix=line.trim().slice(1);
      const classes=[...new Set([...uss.value.matchAll(/\.([A-Za-z_][\w-]*)\s*\{/g)].map(m=>m[1]))];
      items=classes.filter(n=>n.toLowerCase().startsWith(prefix.toLowerCase())).map(n=>({name:'.'+n,kind:'class'}));
    }
  }
  if(e=>false){}
  const all = items;
  const token=(before.match(/[\w:-]*$/)||[''])[0].toLowerCase();
  return {items:all.filter(x=>x.name.toLowerCase().startsWith(token)),start:pos-token.length,end:pos};
}

function setupAutocomplete(textarea){
  textarea.addEventListener('keydown',e=>{
    if(e.ctrlKey && e.code==='Space'){
      e.preventDefault();
      const q=getSuggestions(textarea);
      showAutocomplete(q.items,textarea,q.start,q.end);
    }else if(e.key==='Escape'){
      const b=document.getElementById('autocomplete');if(b)b.style.display='none';
    }else if(e.key==='Tab'){
      const b=document.getElementById('autocomplete');
      if(b && b.style.display!=='none'){
        const selected=b.querySelector('.selected');
        if(selected){e.preventDefault();selected.dispatchEvent(new MouseEvent('mousedown',{bubbles:true}));}
      }
    }
  });
}
setupAutocomplete(uxml); setupAutocomplete(uss);

function readFileInto(file,target){
  const reader=new FileReader();
  reader.onload=()=>{target.value=reader.result;render();};
  reader.readAsText(file);
}
function wire(id,fn){
  const el=document.getElementById(id);
  if(el) el.addEventListener('click',fn);
}
wire('loadUxmlBtn',()=>document.getElementById('uxmlFile').click());
wire('loadCsBtn',()=>document.getElementById('csFile').click());
document.getElementById('csFile').addEventListener('change',e=>{
  const file=e.target.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=()=>{
    connectController(reader.result,file.name);
  };
  reader.readAsText(file);
  e.target.value='';
});
wire('loadUssBtn',()=>document.getElementById('ussFile').click());
document.getElementById('uxmlFile').addEventListener('change',e=>{
  if(e.target.files[0]) readFileInto(e.target.files[0],uxml);
  e.target.value='';
});
document.getElementById('ussFile').addEventListener('change',e=>{
  if(e.target.files[0]) readFileInto(e.target.files[0],uss);
  e.target.value='';
});
[uxml,uss].forEach(area=>{
  area.addEventListener('dragover',e=>{e.preventDefault();area.style.outline='2px solid #5f8cff';});
  area.addEventListener('dragleave',()=>area.style.outline='');
  area.addEventListener('drop',e=>{
    e.preventDefault(); area.style.outline='';
    const file=e.dataTransfer.files[0];
    if(file) readFileInto(file,area);
  });
});
function downloadText(text,name,type){
  const blob=new Blob([text],{type});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=name;
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),500);
}
wire('saveUxmlBtn',()=>downloadText(uxml.value,'menu.uxml','application/xml'));
wire('saveUssBtn',()=>downloadText(uss.value,'menu.uss','text/css'));
wire('toggleMapBtn',()=>{
  const el=document.getElementById('csharpMap');
  el.classList.toggle('hidden');
  if(!el.classList.contains('hidden')) buildMapping();
});
wire('runMockBtn',runMock);
wire('clearConsoleBtn',()=>{
  document.getElementById('consoleBody').innerHTML='';
  logConsole('Console cleared','info');
});

document.getElementById('renderBtn').onclick=render;
document.getElementById('sampleBtn').onclick=()=>{uxml.value=sampleUxml;
logConsole('Previewer ready. Load your HudController.cs to link the HUD.','info');uss.value=sampleUss;render()};
document.getElementById('clearBtn').onclick=()=>{uxml.value='';uss.value='';preview.innerHTML='';previewStatus.textContent='0 elements'};
document.addEventListener('keydown',e=>{if(e.ctrlKey&&e.key==='Enter'){e.preventDefault();render()}});

// Resizable splitters:
// 1) vertical: UXML <-> Preview
// 2) horizontal: top area <-> USS
const splitter=document.getElementById('splitter');
const horizontalSplitter=document.getElementById('horizontalSplitter');
const main=document.querySelector('main');
let resizing=null;

splitter.addEventListener('pointerdown',e=>{
  resizing='vertical';
  splitter.setPointerCapture?.(e.pointerId);
  splitter.classList.add('dragging');
  document.body.style.cursor='col-resize';
  document.body.style.userSelect='none';
  e.preventDefault();
});

horizontalSplitter.addEventListener('pointerdown',e=>{
  resizing='horizontal';
  horizontalSplitter.setPointerCapture?.(e.pointerId);
  horizontalSplitter.classList.add('dragging');
  document.body.style.cursor='row-resize';
  document.body.style.userSelect='none';
  e.preventDefault();
});

document.addEventListener('pointermove',e=>{
  if(!resizing) return;

  const rect=main.getBoundingClientRect();

  if(resizing==='vertical'){
    const minLeft=220;
    const minRight=280;
    const splitterWidth=10;
    let left=e.clientX-rect.left;
    const maxLeft=rect.width-splitterWidth-minRight;
    left=Math.max(minLeft,Math.min(left,maxLeft));
    main.style.gridTemplateColumns=`${left}px ${splitterWidth}px minmax(0,1fr)`;
  }

  if(resizing==='horizontal'){
    const minTop=220;
    const minBottom=160;
    const splitterHeight=10;
    let top=e.clientY-rect.top;
    const maxTop=rect.height-splitterHeight-minBottom;
    top=Math.max(minTop,Math.min(top,maxTop));
    main.style.gridTemplateRows=`${top}px ${splitterHeight}px minmax(0,1fr)`;
  }
});

document.addEventListener('pointerup',()=>{
  if(!resizing) return;

  splitter.classList.remove('dragging');
  horizontalSplitter.classList.remove('dragging');
  resizing=null;
  document.body.style.cursor='';
  document.body.style.userSelect='';
});
uxml.value=sampleUxml;
logConsole('Previewer ready. Load your HudController.cs to link the HUD.','info');
uss.value=sampleUss;
render();
