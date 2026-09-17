(()=>{
'use strict';
const STORAGE_KEY='cam-switch-configurator-v1';
const root=document.getElementById('app');
const $=s=>root.querySelector(s);
const angles=Array.from({length:24},(_,i)=>i*15);
const pairs=Array.from({length:12},(_,i)=>[i*2+1,i*2+2]);
const ns='http://www.w3.org/2000/svg';
let selected=0;
let state=createInitialState();

function createAngleState(){return{pairs:Array(12).fill(0),positionReturn:false,positionTarget:0,springReturn:false,springTarget:0}}
function createInitialState(){const program={};angles.forEach(a=>program[a]=createAngleState());return{version:1,details:{model:'',customer:'',reference:'',ratedCurrent:''},program,jumpers:[]}}
function normalizeState(raw){const fresh=createInitialState();if(!raw||typeof raw!=='object')return fresh;if(raw.details&&typeof raw.details==='object')for(const k of Object.keys(fresh.details))fresh.details[k]=String(raw.details[k]??'');if(raw.program&&typeof raw.program==='object')angles.forEach(a=>{const s=raw.program[a];if(!s)return;fresh.program[a].pairs=Array.from({length:12},(_,i)=>[0,1,2].includes(Number(s.pairs?.[i]))?Number(s.pairs[i]):0);fresh.program[a].positionReturn=!!s.positionReturn;fresh.program[a].positionTarget=angles.includes(Number(s.positionTarget))?Number(s.positionTarget):0;fresh.program[a].springReturn=!!s.springReturn;fresh.program[a].springTarget=angles.includes(Number(s.springTarget))?Number(s.springTarget):0});if(Array.isArray(raw.jumpers))fresh.jumpers=raw.jumpers.map(j=>({type:j.type==='external'?'external':'internal',a:Number(j.a),b:Number(j.b)})).filter(j=>Number.isInteger(j.a)&&Number.isInteger(j.b)&&j.a>=1&&j.a<=24&&j.b>=1&&j.b<=24&&j.a!==j.b).map(j=>j.a<j.b?j:{...j,a:j.b,b:j.a});return fresh}
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch(e){}}
function load(){try{const raw=localStorage.getItem(STORAGE_KEY);if(raw)state=normalizeState(JSON.parse(raw))}catch(e){state=createInitialState()}}
function option(el,value,label){const o=document.createElement('option');o.value=String(value);o.textContent=label;el.appendChild(o)}
function populate(){angles.forEach(a=>{option($('#angleSelect'),a,a+'°');option($('#positionReturnTarget'),a,a+'°');option($('#springReturnTarget'),a,a+'°')});for(let i=1;i<=24;i++){option($('#jFrom'),i,String(i));option($('#jTo'),i,String(i))}$('#jTo').value='3';pairs.forEach(p=>{const th=document.createElement('th');th.textContent=p.join('–');$('#pairHeader').appendChild(th)});const mh=document.createElement('th');mh.textContent='';$('#pairHeader').appendChild(mh);angles.forEach(a=>{const tr=document.createElement('tr');tr.dataset.angle=a;const ac=document.createElement('td');ac.className='angle-cell';const ab=document.createElement('button');ab.type='button';ab.className='cell';ab.dataset.pick=a;ab.textContent=a+'°';ac.appendChild(ab);tr.appendChild(ac);pairs.forEach((p,i)=>{const td=document.createElement('td');const b=document.createElement('button');b.type='button';b.className='cell';b.dataset.a=a;b.dataset.p=i;b.setAttribute('aria-label',`Angle ${a} degrees, contact ${p.join(' to ')}`);td.appendChild(b);tr.appendChild(td)});const mech=document.createElement('td');mech.className='mech';tr.appendChild(mech);$('#matrixBody').appendChild(tr)})}
function polar(deg,r){const t=(deg-90)*Math.PI/180;return{x:230+Math.cos(t)*r,y:230+Math.sin(t)*r}}
function setupCam(){angles.forEach(a=>{const p1=polar(a,160),p2=polar(a,185),ln=document.createElementNS(ns,'line');ln.setAttribute('x1',p1.x);ln.setAttribute('y1',p1.y);ln.setAttribute('x2',p2.x);ln.setAttribute('y2',p2.y);ln.setAttribute('stroke','#d8dee6');ln.setAttribute('stroke-width',a%45===0?'4':'2');ln.dataset.a=a;$('#camTicks').appendChild(ln);const p=polar(a,150),t=document.createElementNS(ns,'text');t.setAttribute('x',p.x);t.setAttribute('y',p.y+4);t.setAttribute('text-anchor','middle');t.setAttribute('font-size',a%30===0?'13':'10');t.setAttribute('fill','#667085');t.textContent=a;$('#camLabels').appendChild(t)})}
function svgLine(x1,y1,x2,y2,w=5,stroke='#211815'){const e=document.createElementNS(ns,'line');for(const [k,v] of Object.entries({x1,y1,x2,y2}))e.setAttribute(k,v);e.setAttribute('stroke',stroke);e.setAttribute('stroke-width',w);e.setAttribute('stroke-linecap','square');return e}
function svgPath(d,w=5,stroke='#211815',fill='none'){const e=document.createElementNS(ns,'path');e.setAttribute('d',d);e.setAttribute('stroke',stroke);e.setAttribute('stroke-width',w);e.setAttribute('fill',fill);e.setAttribute('stroke-linejoin','miter');e.setAttribute('stroke-linecap','round');return e}
function svgCircle(cx,cy,r,w=4){const e=document.createElementNS(ns,'circle');e.setAttribute('cx',cx);e.setAttribute('cy',cy);e.setAttribute('r',r);e.setAttribute('fill','#fff');e.setAttribute('stroke','#211815');e.setAttribute('stroke-width',w);return e}
function svgText(x,y,value,size=13,weight='650',fill='#211815'){const e=document.createElementNS(ns,'text');e.setAttribute('x',x);e.setAttribute('y',y);e.setAttribute('text-anchor','middle');e.setAttribute('font-size',size);e.setAttribute('font-weight',weight);e.setAttribute('fill',fill);e.textContent=value;return e}
function terminalPoint(term){const i=Math.floor((term-1)/2),x=67+i*118;return{x,y:term%2?42:273}}
function drawContact(i,s){
  const x=67+i*118,mirror=i%2===1,g=document.createElementNS(ns,'g');
  g.dataset.p=i;g.setAttribute('role','button');g.setAttribute('tabindex','0');
  g.setAttribute('aria-label',`Contact ${pairs[i].join(' to ')}, ${stateName(s)}`);g.style.cursor='pointer';

  const dir=mirror?1:-1;
  const bodyX=x+dir*24;
  const innerX=bodyX-dir*12;
  const stemX=x+dir*5;

  g.appendChild(svgCircle(x,42,11));
  g.appendChild(svgCircle(x,273,11));
  g.appendChild(svgPath(`M ${x} 53 L ${x} 67 L ${stemX} 82 L ${stemX} 96 L ${innerX} 96`,5));
  g.appendChild(svgPath(`M ${innerX} 218 L ${stemX} 218 L ${stemX} 234 L ${x} 249 L ${x} 262`,5));

  g.appendChild(svgLine(bodyX,90,bodyX,224,7));
  g.appendChild(svgPath(`M ${bodyX} 98 L ${bodyX} 88 L ${innerX} 88 L ${innerX} 99`,7));
  g.appendChild(svgPath(`M ${bodyX} 216 L ${bodyX} 226 L ${innerX} 226 L ${innerX} 215`,7));
  g.appendChild(svgPath(`M ${bodyX} 137 C ${bodyX-dir*31} 137 ${bodyX-dir*31} 180 ${bodyX} 180`,4));

  const markerX=innerX-dir*5,markerY=96;
  if(s===1){
    const m=document.createElementNS(ns,'circle');m.setAttribute('cx',markerX);m.setAttribute('cy',markerY);m.setAttribute('r','5.5');m.setAttribute('fill','#168a5b');m.setAttribute('stroke','#fff');m.setAttribute('stroke-width','2');g.appendChild(m);
  }else if(s===2){
    const m1=document.createElementNS(ns,'circle');m1.setAttribute('cx',markerX);m1.setAttribute('cy',markerY);m1.setAttribute('r','5.5');m1.setAttribute('fill','#8b5cf6');m1.setAttribute('stroke','#fff');m1.setAttribute('stroke-width','2');g.appendChild(m1);
    const m2=document.createElementNS(ns,'circle');m2.setAttribute('cx',markerX-dir*11);m2.setAttribute('cy',markerY);m2.setAttribute('r','3.5');m2.setAttribute('fill','#8b5cf6');g.appendChild(m2);
  }

  g.appendChild(svgText(x,20,pairs[i][0]));
  g.appendChild(svgText(x,307,pairs[i][1]));
  return g;
}
function arcPath(from,to,r){const s=polar(from,r),e=polar(to,r);let delta=((to-from)%360+360)%360;if(delta>180)delta-=360;const sweep=delta>=0?1:0;return`M ${s.x} ${s.y} A ${r} ${r} 0 0 ${sweep} ${e.x} ${e.y}`}
function renderCam(){const d=state.program[selected],p=polar(selected,148);$('#needle').setAttribute('x2',p.x);$('#needle').setAttribute('y2',p.y);$('#angleText').textContent=selected+'°';$('#camTicks').querySelectorAll('line').forEach(l=>{const a=Number(l.dataset.a),active=a===selected;l.setAttribute('stroke',active?'#155eef':'#d8dee6');l.setAttribute('stroke-width',active?'9':a%45===0?'4':'2')});const pr=$('#positionReturnArc'),sr=$('#springReturnArc');if(d.positionReturn&&d.positionTarget!==selected){pr.setAttribute('d',arcPath(selected,d.positionTarget,120));pr.setAttribute('opacity','1')}else pr.setAttribute('opacity','0');if(d.springReturn&&d.springTarget!==selected){sr.setAttribute('d',arcPath(selected,d.springTarget,105));sr.setAttribute('opacity','1')}else sr.setAttribute('opacity','0');const notes=$('#camNotes');notes.innerHTML='';let y=320;if(d.positionReturn){notes.appendChild(svgText(230,y,'Position return → '+d.positionTarget+'°',14,'650','#b7791f'));y+=21}if(d.springReturn){notes.appendChild(svgText(230,y,'Spring return → '+d.springTarget+'°',14,'650','#c63c3c'))}const cl=d.pairs.map((s,i)=>s===1?pairs[i].join('–'):null).filter(Boolean),co=d.pairs.map((s,i)=>s===2?pairs[i].join('–'):null).filter(Boolean);$('#closedSummary').textContent=cl.length?cl.join(', '):'None';$('#continuousSummary').textContent=co.length?co.join(', '):'None'}
function renderPhysical(){const contacts=$('#contactLayer'),wires=$('#jumperLayer');contacts.innerHTML='';wires.innerHTML='';state.jumpers.forEach((j,idx)=>{const a=terminalPoint(j.a),b=terminalPoint(j.b);if(j.type==='internal'&&a.y===b.y){const y=a.y<100?18:313;wires.appendChild(svgPath(`M ${a.x} ${a.y} L ${a.x} ${y} L ${b.x} ${y} L ${b.x} ${b.y}`,5,'#0f766e'));wires.appendChild(svgText((a.x+b.x)/2,y+(y<100?14:-7),'IB'+(idx+1),11,'800','#0f766e'))}else{const routeY=a.y===b.y?(a.y<100?8:321):160;const p=svgPath(`M ${a.x} ${a.y} C ${a.x} ${routeY} ${b.x} ${routeY} ${b.x} ${b.y}`,4,'#b45309');p.setAttribute('stroke-dasharray','8 5');wires.appendChild(p);wires.appendChild(svgText((a.x+b.x)/2,routeY+(routeY<100?14:-7),'EW'+(idx+1),11,'800','#b45309'))}});state.program[selected].pairs.forEach((s,i)=>contacts.appendChild(drawContact(i,s)));$('#physicalAngle').textContent=selected+'°';$('#jumperSummary').textContent=state.jumpers.length?'Physical jumpers: '+state.jumpers.map((j,i)=>(j.type==='internal'?'IB':'EW')+(i+1)+' '+j.a+'↔'+j.b).join(' · '):'No physical jumpers configured.'}
function stateName(s){return s===1?'Closed':s===2?'Closed without interruption':'Open'}
function cyclePair(i,a=selected){state.program[a].pairs[i]=(state.program[a].pairs[i]+1)%3;selected=a;setStatus(`Contact ${pairs[i].join('–')} at ${a}°: ${stateName(state.program[a].pairs[i])}.`);commitRender()}
function renderPairButtons(){const el=$('#pairButtons');el.innerHTML='';state.program[selected].pairs.forEach((s,i)=>{const b=document.createElement('button');b.type='button';b.className='pair-btn';b.dataset.state=s;b.innerHTML=`<strong>${pairs[i].join('–')}</strong><small>${stateName(s)}</small>`;b.addEventListener('click',()=>cyclePair(i));el.appendChild(b)})}
function renderControls(){const d=state.program[selected];$('#angleSelect').value=String(selected);$('#mechanicalAngle').textContent=selected+'°';$('#positionReturnCheck').checked=d.positionReturn;$('#positionReturnTarget').disabled=!d.positionReturn;$('#positionReturnTarget').value=String(d.positionTarget);$('#springReturnCheck').checked=d.springReturn;$('#springReturnTarget').disabled=!d.springReturn;$('#springReturnTarget').value=String(d.springTarget);$('#modelInput').value=state.details.model;$('#customerInput').value=state.details.customer;$('#referenceInput').value=state.details.reference;$('#ratedCurrentInput').value=state.details.ratedCurrent}
function mechanicalText(a){const d=state.program[a],x=[];if(d.positionReturn)x.push('↩ '+d.positionTarget+'°');if(d.springReturn)x.push('↔ '+d.springTarget+'°');return x.join('  ')}
function renderMatrix(){root.querySelectorAll('.matrix button.cell[data-a]').forEach(b=>{const a=Number(b.dataset.a),i=Number(b.dataset.p),s=state.program[a].pairs[i];b.textContent=s===1?'×':s===2?'××':'';b.classList.toggle('closed',s===1);b.classList.toggle('cont',s===2)});root.querySelectorAll('#matrixBody tr').forEach(tr=>{const a=Number(tr.dataset.angle);tr.classList.toggle('selected',a===selected);tr.querySelector('.mech').textContent=mechanicalText(a)})}
function validateJumper(type,a,b){if(a===b)return{level:'bad',title:'Not allowed',text:'A terminal cannot be jumpered to itself.',allow:false};let lo=Math.min(a,b),hi=Math.max(a,b);const samePair=Math.floor((lo-1)/2)===Math.floor((hi-1)/2),sameSide=(lo%2)===(hi%2),diff=hi-lo,duplicate=state.jumpers.some(j=>j.a===lo&&j.b===hi),usesExisting=state.jumpers.some(j=>j.a===lo||j.b===lo||j.a===hi||j.b===hi);if(duplicate)return{level:'bad',title:'Duplicate jumper',text:'This terminal pair is already bridged.',allow:false};if(type==='internal'){if(samePair)return{level:'bad',title:'Internal bridge blocked',text:'This would permanently bypass one switching contact.',allow:false};if(!sameSide)return{level:'bad',title:'Internal bridge blocked',text:'Conservative rule: rigid internal bridges stay on the same side of the stack (odd-to-odd or even-to-even).',allow:false};if(diff!==2)return{level:'bad',title:'Internal bridge not assumed to fit',text:'This model only accepts adjacent same-side terminals, e.g. 1↔3 or 2↔4. Use External wire for longer connections.',allow:false};return{level:usesExisting?'warn':'ok',title:usesExisting?'Accepted, but forms a common bus':'Conservative internal bridge accepted',text:usesExisting?'A terminal is already bridged. Check total current through the common feed.':'The geometry matches the app\'s conservative generic bridge rule. Manufacturer confirmation is still required.',allow:true}}if(samePair)return{level:'warn',title:'Possible externally, but bypasses the contact',text:'This makes the pair electrically common regardless of cam position.',allow:true};if(usesExisting)return{level:'warn',title:'External common / branch connection',text:'Physically wireable in principle, but it forms a multi-terminal common. Check conductor size, branch current and circuit function.',allow:true};return{level:'warn',title:'Externally wireable in principle',text:'The app does not check phase, voltage, load, protection or fault current. Verify the circuit before use.',allow:true}}
function renderValidation(){const v=validateJumper($('#jumperType').value,Number($('#jFrom').value),Number($('#jTo').value)),box=$('#validationBox');box.className='validation '+v.level;$('#validationTitle').textContent=(v.level==='ok'?'✓ ':v.level==='warn'?'⚠ ':'⛔ ')+v.title;$('#validationText').textContent=v.text;$('#addJumper').disabled=!v.allow}
function renderJumperList(){const el=$('#jumperList');el.innerHTML='';if(!state.jumpers.length){el.innerHTML='<div class="note">No physical jumpers.</div>';return}state.jumpers.forEach((j,i)=>{const row=document.createElement('div');row.className='jumper-item';const left=document.createElement('div');left.innerHTML=`<span class="tag ${j.type}">${j.type==='internal'?'Internal':'External'}</span><strong>${j.a} ↔ ${j.b}</strong>`;const rm=document.createElement('button');rm.type='button';rm.className='btn';rm.textContent='Remove';rm.addEventListener('click',()=>{state.jumpers.splice(i,1);setStatus('Jumper removed.');commitRender()});row.append(left,rm);el.appendChild(row)})}
function render(){renderControls();renderCam();renderPhysical();renderPairButtons();renderJumperList();renderValidation();renderMatrix()}
function commitRender(){save();render()}
function setStatus(msg){$('#status').textContent=msg}
function setAngle(a){selected=angles.includes(a)?a:0;setStatus('Selected '+selected+'°.');render()}
function downloadJSON(){const payload=JSON.stringify(state,null,2),blob=new Blob([payload],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='cam-switch-configuration.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);setStatus('Configuration exported.')}

load();populate();setupCam();render();
$('#angleSelect').addEventListener('change',e=>setAngle(Number(e.target.value)));
$('#prevAngle').addEventListener('click',()=>setAngle(angles[(angles.indexOf(selected)+angles.length-1)%angles.length]));
$('#nextAngle').addEventListener('click',()=>setAngle(angles[(angles.indexOf(selected)+1)%angles.length]));
$('#positionReturnCheck').addEventListener('change',e=>{const d=state.program[selected];d.positionReturn=e.target.checked;if(d.positionReturn&&d.positionTarget===selected)d.positionTarget=angles[(angles.indexOf(selected)+angles.length-1)%angles.length];commitRender()});
$('#positionReturnTarget').addEventListener('change',e=>{state.program[selected].positionTarget=Number(e.target.value);commitRender()});
$('#springReturnCheck').addEventListener('change',e=>{const d=state.program[selected];d.springReturn=e.target.checked;if(d.springReturn&&d.springTarget===selected)d.springTarget=angles[(angles.indexOf(selected)+angles.length-1)%angles.length];commitRender()});
$('#springReturnTarget').addEventListener('change',e=>{state.program[selected].springTarget=Number(e.target.value);commitRender()});
for(const [id,key] of [['modelInput','model'],['customerInput','customer'],['referenceInput','reference'],['ratedCurrentInput','ratedCurrent']])$('#'+id).addEventListener('input',e=>{state.details[key]=e.target.value;save()});
for(const id of ['jumperType','jFrom','jTo'])$('#'+id).addEventListener('change',renderValidation);
$('#addJumper').addEventListener('click',()=>{let a=Number($('#jFrom').value),b=Number($('#jTo').value);if(a>b)[a,b]=[b,a];const type=$('#jumperType').value,v=validateJumper(type,a,b);if(!v.allow){setStatus(v.title+': '+v.text);renderValidation();return}state.jumpers.push({type,a,b});setStatus(`Added ${type==='internal'?'internal bridge':'external wire'} ${a}↔${b}.`);commitRender()});
$('#contactLayer').addEventListener('click',e=>{const g=e.target.closest('[data-p]');if(g)cyclePair(Number(g.dataset.p))});
$('#contactLayer').addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const g=e.target.closest('[data-p]');if(!g)return;e.preventDefault();cyclePair(Number(g.dataset.p))});
$('#matrixBody').addEventListener('click',e=>{const pick=e.target.closest('[data-pick]');if(pick){setAngle(Number(pick.dataset.pick));return}const b=e.target.closest('button[data-a]');if(b)cyclePair(Number(b.dataset.p),Number(b.dataset.a))});
$('#clearAngle').addEventListener('click',()=>{state.program[selected]=createAngleState();setStatus('Cleared '+selected+'°.');commitRender()});
$('#clearProgramme').addEventListener('click',()=>{if(!confirm('Clear all switching states and mechanical-return settings? Physical jumpers will be kept.'))return;angles.forEach(a=>state.program[a]=createAngleState());setStatus('Switching programme cleared; physical jumpers kept.');commitRender()});
$('#resetBtn').addEventListener('click',()=>{if(!confirm('Reset the entire configurator, including physical jumpers and project details?'))return;state=createInitialState();selected=0;setStatus('Configurator reset.');commitRender()});
$('#exportBtn').addEventListener('click',downloadJSON);
$('#importBtn').addEventListener('click',()=>$('#importFile').click());
$('#importFile').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{state=normalizeState(JSON.parse(await file.text()));selected=0;setStatus('Configuration imported.');commitRender()}catch(err){setStatus('Could not import this JSON file.')}finally{e.target.value=''}});
$('#printBtn').addEventListener('click',()=>window.print());
})();