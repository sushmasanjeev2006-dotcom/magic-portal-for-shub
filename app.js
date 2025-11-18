// app.js — unified portal logic (realistic game-like UX)

// ---------- DATA ----------
const QUESTIONS = [
  { q: "1) Gym Encouragement — How will you hype them?", choices: ["Drag them heroically", "Spam gym memes", "Flex together", "Pink workout plan"] },
  { q: "2) Daily Sparkle — Glitter level?", choices: ["Subtle", "Cute", "Maximum", "Full makeover"] },
  { q: "3) Snack Pact — What do you do?", choices: ["Share happily", "Secretly steal", "Healthy disguised as candy", "Cheer them on"] },
  { q: "4) Birthday Drama — Your move?", choices: ["Overhype on socials", "Surprise gym party", "Heartfelt note", "All of the above"] },
  { q: "5) Meme Supply — Frequency?", choices: ["3/day", "10/day", "100 if ignored", "Gym memes Mondays"] },
  { q: "6) Roasting Protocol — Allowed when?", choices: ["Minor mistakes", "Miss reps", "Go emo", "Always lovingly"] },
  { q: "7) Secrets — Can you keep them?", choices: ["Yes", "Try my best", "Maybe", "I leak cute pics"] },
  { q: "8) Mood Lifters — Best method?", choices: ["Anime scenes", "Dog videos", "Chocolate delivery", "Gym sesh together"] },
  { q: "9) Silliness — Will you join cringe reels?", choices: ["Yes", "Only for them", "Absolutely", "Depends on outfit"] },
  { q: "10) Eternal Enrollment — Do you accept? (Only YES)", choices: ["YES"] },
  { q: "11) Princess Gym — Kawaii Squats accepted?", choices: ["Y", "N"] },
  { q: "12) Anime Fundamentals — Dramatic pose before lift?", choices: ["Y", "N"] }
];

const state = { idx: 0, answers: new Array(QUESTIONS.length).fill(null), sfx: true };

// ---------- ELEMENTS ----------
const preloader = document.getElementById('preloader');
const entry = document.getElementById('entry');
const enterBtn = document.getElementById('enterBtn');
const previewQRbtn = document.getElementById('previewQRbtn');
const toggleSfx = document.getElementById('toggleSfx');
const progressI = document.querySelector('#progressBar i');
const progressPct = document.getElementById('progressPct');
const questionArea = document.getElementById('questionArea');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const unlocked = document.getElementById('unlocked');
const extraButtons = document.getElementById('bookletBtn') || null;
const qrModal = document.getElementById('qrModal');
const qrLarge = document.getElementById('qrLarge');
const closeQr = document.getElementById('closeQr');
const resultSection = document.getElementById('resultSection');
const summary = document.getElementById('summary');
const revealCert = document.getElementById('revealCert');
const retake = document.getElementById('retake');
const certSection = document.getElementById('certSection');
const certCanvas = document.getElementById('certCanvas');
const downloadPNG = document.getElementById('downloadPNG');
const downloadPDF = document.getElementById('downloadPDF');
const backHome = document.getElementById('backHome');
const playerName = document.getElementById('playerName');

// ---------- PARTICLES (realistic glitter) ----------
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
function resizeCanvas(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resizeCanvas);
function spawnParticles(n=40){
  particles = [];
  for(let i=0;i<n;i++){
    particles.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      r: 0.8 + Math.random()*2.5,
      vx: (Math.random()-0.5)*0.2,
      vy: -0.2 - Math.random()*0.6,
      alpha: 0.6 + Math.random()*0.4,
      glow: 6 + Math.random()*12
    });
  }
}
function drawParticles(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles.forEach(p=>{
    ctx.beginPath();
    const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.glow);
    g.addColorStop(0, `rgba(255,255,255,${p.alpha})`);
    g.addColorStop(1, 'rgba(255,182,211,0)');
    ctx.fillStyle = g;
    ctx.fillRect(p.x-p.glow,p.y-p.glow,p.glow*2,p.glow*2);
    p.x += p.vx; p.y += p.vy;
    if(p.y < -50){ p.y = canvas.height + 30; p.x = Math.random()*canvas.width; }
  });
  requestAnimationFrame(drawParticles);
}

// ---------- SOUND (tiny sparkle) ----------
let audio;
function playSpark(){ if(!state.sfx) return; try{ if(!audio){ audio = new (window.AudioContext||window.webkitAudioContext)(); } const o = audio.createOscillator(); const g = audio.createGain(); o.type='sine'; o.frequency.value = 900 + Math.random()*200; g.gain.value = 0.0001; o.connect(g); g.connect(audio.destination); o.start(); g.gain.exponentialRampToValueAtTime(0.06, audio.currentTime+0.01); g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime+0.35); o.stop(audio.currentTime+0.4);}catch(e){} }

// ---------- UI: quiz rendering ----------
function updateProgress(){
  const pct = Math.round((state.idx/(QUESTIONS.length-1))*100);
  progressI.style.width = pct + '%';
  progressPct.textContent = `${state.idx+1}/${QUESTIONS.length}`;
}

function render(){
  const item = QUESTIONS[state.idx];
  questionArea.innerHTML = '';
  const cont = document.createElement('div'); cont.className = 'quizItem';
  const qtext = document.createElement('div'); qtext.className='qText'; qtext.textContent = item.q;
  const choices = document.createElement('div'); choices.className='choices';
  item.choices.forEach((c, i) => {
    const b = document.createElement('button'); b.className='choice'; b.textContent = c; b.onclick = ()=>{ select(i,c,b); };
    if(state.answers[state.idx] === c) b.classList.add('selected');
    choices.appendChild(b);
  });
  cont.appendChild(qtext); cont.appendChild(choices);
  questionArea.appendChild(cont);
  updateProgress();
  unlocked.textContent = state.answers.filter(a=>a).length;
}

function select(i,text,el){
  Array.from(el.parentNode.children).forEach(ch=>ch.classList.remove('selected'));
  el.classList.add('selected');
  state.answers[state.idx] = text;
  playSpark();
}

// navigation
prevBtn.addEventListener('click', ()=>{
  if(state.idx>0) { state.idx--; render(); }
});
nextBtn.addEventListener('click', ()=>{
  if(!state.answers[state.idx]){
    if(QUESTIONS[state.idx].choices.length===1){
      state.answers[state.idx] = QUESTIONS[state.idx].choices[0];
    } else { alert('Pick an option to proceed.'); return; }
  }
  if(state.idx < QUESTIONS.length -1){ state.idx++; render(); }
  else submit();
});

// submit
function submit(){
  document.getElementById('panelMain').classList.add('hidden');
  resultSection.classList.remove('hidden');
  summary.innerHTML = '';
  QUESTIONS.forEach((q, i)=> {
    const el = document.createElement('div'); el.style.padding='8px 0';
    el.innerHTML = `<strong>${q.q}</strong><div style="margin-top:6px">${state.answers[i]||'<em class="hint">No answer</em>'}</div>`;
    summary.appendChild(el);
  });
}

// reveal certificate
revealCert.addEventListener('click', ()=>{
  resultSection.classList.add('hidden');
  certSection.classList.remove('hidden');
  drawCertificate();
});
retake.addEventListener('click', ()=> location.reload());

// ---------- Certificate drawing ----------
function drawCertificate(){
  const c = certCanvas;
  const ctx = c.getContext('2d');
  // reset scale to device pixels for sharpness
  const DPR = window.devicePixelRatio || 1;
  const W = c.width; const H = c.height;
  // fill background
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = '#fff9fb'; ctx.fillRect(0,0,W,H);
  // frame
  ctx.strokeStyle = '#ffb3e6'; ctx.lineWidth = 14;
  roundRect(ctx, 28, 28, W-56,H-56,28,false,true);
  // heading
  ctx.fillStyle = '#8a1d55'; ctx.font = '36px "Playfair Display", serif'; ctx.textAlign='center';
  ctx.fillText('Certificate of Unescapable Friendship', W/2, 120);
  // message
  ctx.fillStyle = '#682043'; ctx.font = '20px Inter, sans-serif';
  const msg = `This certifies that ${playerName.textContent} is forcefully enrolled in this fabulous friendship, and now you can't escape.`;
  wrapText(ctx, msg, W/2, 200, W-180, 28);
  // footer
  ctx.font = '18px Georgia'; ctx.fillStyle = '#b24682';
  ctx.fillText('Signed with pink glitter & friendship', W/2, H-120);
}

// download PNG
downloadPNG.addEventListener('click', ()=>{
  const url = certCanvas.toDataURL('image/png');
  const a = document.createElement('a'); a.href = url; a.download = `${playerName.textContent}_certificate.png`; a.click();
});

// download PDF booklet (jsPDF)
downloadPDF.addEventListener('click', ()=>{
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit:'pt', format:'a4' });
  doc.setFillColor(255,230,245); doc.rect(0,0,doc.internal.pageSize.getWidth(),doc.internal.pageSize.getHeight(),'F');
  doc.setFontSize(22); doc.setTextColor(110,20,70);
  doc.text('Princess Portal Booklet', doc.internal.pageSize.getWidth()/2, 80, { align:'center' });
  doc.setFontSize(14); doc.text(`For: ${playerName.textContent}`, doc.internal.pageSize.getWidth()/2, 110, { align:'center' });
  doc.addPage();
  doc.setFontSize(12);
  QUESTIONS.forEach((q,i)=>{
    const y = 60 + (i*40);
    doc.text(`${i+1}. ${q.q}`, 40, y);
    doc.text(`Answer: ${state.answers[i] || '—'}`, 60, y+16);
    if(y>700) doc.addPage();
  });
  doc.addPage();
  doc.setFontSize(16); doc.text('Certificate', 40, 80);
  doc.setFontSize(12); doc.text(`This certifies that ${playerName.textContent} is forcefully enrolled in this fabulous friendship. Escape is not an option.`, 40, 110, { maxWidth: doc.internal.pageSize.getWidth()-80 });
  doc.save(`${playerName.textContent}_princess_booklet.pdf`);
});

// ---------- QR generation (modal) ----------
previewQRbtn.addEventListener('click', ()=> {
  const url = (location && location.href && !location.href.startsWith('file://')) ? location.href : 'Open the included HTML on mobile';
  qrLarge.innerHTML = '';
  new QRCode(qrLarge, { text: url, width: 280, height: 280, colorDark: "#3b1230", colorLight: "#fff7fb", correctLevel: QRCode.CorrectLevel.H });
  qrModal.classList.remove('hidden');
});
closeQr.addEventListener('click', ()=> qrModal.classList.add('hidden'));

// ---------- helpers ----------
function roundRect(ctx,x,y,w,h,r,fill,stroke){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); if(fill) ctx.fill(); if(stroke) ctx.stroke(); }
function wrapText(ctx, text, x, y, maxWidth, lineHeight) { ctx.textAlign='center'; let words=text.split(' '), line=''; for(let n=0;n<words.length;n++){ const testLine = line + words[n] + ' '; const metrics = ctx.measureText(testLine); if(metrics.width > maxWidth && n>0){ ctx.fillText(line, x, y); line = words[n] + ' '; y += lineHeight; } else { line = testLine; } } ctx.fillText(line, x, y); }

// ---------- INIT ----------
function init(){
  resizeCanvas(); spawnParticles(60); drawParticles();
  render(); // initial render
  setTimeout(()=>{ preloader.style.display='none'; }, 700);
}
window.addEventListener('load', init);
enterBtn.addEventListener('click', ()=>{ entry.style.display = 'none'; document.getElementById('panelMain').classList.remove('hidden'); });
toggleSfx.addEventListener('click', ()=>{ state.sfx = !state.sfx; toggleSfx.textContent = state.sfx ? 'SFX On' : 'SFX Off'; });
