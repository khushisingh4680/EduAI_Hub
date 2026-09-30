
const toolPageMap = {
  resume: "AI Resume Builder",
  notes: "AI Notes Generator",
  presentation: "AI Presentation Maker",
  mindmap: "Syllabus Mind Map",
  sheets: "Google Sheets Backend",
  quiz: "AI Quiz & MCQ",
  doubt: "Subject Doubt Solver",
  flashcards: "AI Flashcards",
  planner: "Study Planner",
  ocr: "Photo Notes OCR"
};

function openToolPage(toolId) {
  window.open(`${window.location.pathname}?tool=${encodeURIComponent(toolId)}`,
    "_blank", "noopener,noreferrer");
}

function setupToolLinks() {
  document.querySelectorAll("[data-tool]").forEach(el => {
    el.addEventListener("click", e => {
      const id = el.getAttribute("data-tool");
      if (id && toolPageMap[id]) {
        e.preventDefault();
        openToolPage(id);
      }
    });
  });
}

function loadToolFromQuery() {
  const tool = new URLSearchParams(window.location.search).get("tool");
  if (!tool || !toolPageMap[tool]) return;

  setTimeout(() => {
    const target = document.querySelector(`[data-tool="${tool}"]`);
    if (target) target.click();

    document.title = `${toolPageMap[tool]} | EduAI Hub`;

    if (!document.getElementById("tool-page-back")) {
      const back = document.createElement("a");
      back.id = "tool-page-back";
      back.href = window.location.pathname;
      back.textContent = "← Back to EduAI Hub";
      back.style.cssText =
        "position:fixed;top:18px;left:18px;z-index:9999;padding:9px 13px;" +
        "border:1px solid rgba(255,255,255,.14);border-radius:10px;" +
        "background:rgba(15,15,20,.92);color:#fff;text-decoration:none;" +
        "font:600 13px system-ui;";
      document.body.appendChild(back);
    }
  }, 300);
}

window.addEventListener("load", () => {
  setupToolLinks();
  loadToolFromQuery();
});

const TOOLS = [
  {id:"resume",icon:"💼",no:"01",title:"AI Resume Builder",desc:"Generate polished, ATS-friendly resume content and export a PDF."},
  {id:"notes",icon:"📘",no:"02",title:"AI Notes Generator",desc:"Turn raw study material into structured Markdown notes."},
  {id:"ppt",icon:"📊",no:"03",title:"AI Presentation",desc:"Create slide-wise content and download a real PPTX deck."},
  {id:"mindmap",icon:"🧠",no:"04",title:"Syllabus Mind Map",desc:"Convert a syllabus into a visual hierarchical map."},
  {id:"sheets",icon:"📈",no:"05",title:"Google Sheets Backend",desc:"Connect an Apps Script endpoint and ask AI for data insights."},
  {id:"quiz",icon:"📝",no:"06",title:"AI Quiz / MCQ",desc:"Generate MCQs, answer them interactively and calculate your score."},
  {id:"doubt",icon:"💬",no:"07",title:"Subject Doubt Solver",desc:"Chat with a subject tutor while preserving conversation context."},
  {id:"flashcards",icon:"🗂",no:"08",title:"AI Flashcards",desc:"Generate flip cards for active recall and revision."},
  {id:"planner",icon:"📅",no:"09",title:"Study Planner",desc:"Generate a day-wise timetable from subjects and available hours."},
  {id:"ocr",icon:"📸",no:"10",title:"Photo Notes OCR",desc:"Extract and summarize text from a note photo with AI vision."}
];

const app = document.getElementById("app");
const modalBackdrop = document.getElementById("modalBackdrop");
const modalBody = document.getElementById("modalBody");
const toastEl = document.getElementById("toast");

function esc(s=""){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function toast(msg){toastEl.textContent=msg;toastEl.classList.add("show");setTimeout(()=>toastEl.classList.remove("show"),2800)}
function markdown(s){return window.marked ? DOMPurify.sanitize(marked.parse(s||"")) : esc(s).replace(/\n/g,"<br>")}
function setLoading(el){el.innerHTML='<span class="loading"><span class="spinner"></span>Generating…</span>'}
async function api(prompt, resultEl, extra={}){
  setLoading(resultEl);
  try{
    const r=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt,...extra})});
    const d=await r.json();
    if(!r.ok) throw new Error(d.error||"Request failed");
    return d.text;
  }catch(e){resultEl.innerHTML=`<div style="color:#ff9292"><b>Error:</b> ${esc(e.message)}</div>`;throw e}
}
async function vision(image,prompt,resultEl){
  setLoading(resultEl);
  try{
    const r=await fetch("/api/vision",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({image,prompt})});
    const d=await r.json(); if(!r.ok) throw new Error(d.error||"Vision request failed"); return d.text;
  }catch(e){resultEl.innerHTML=`<div style="color:#ff9292"><b>Error:</b> ${esc(e.message)}</div>`;throw e}
}

function home(){
  app.innerHTML=`<section class="hero" id="home">
    <div>
      <span class="eyebrow"><span class="dot"></span> 10 AI-powered classroom tools</span>
      <h1>Learn by <span class="gradient">building</span><br>with AI.</h1>
      <p>One clean workspace for your student tasks: generate, visualize, quiz, plan, chat and export — powered by Gemini through a secure backend.</p>
      <div class="hero-actions"><a class="primary" href="#tools">Explore all tools →</a><button class="secondary" id="configureBtn">Check API status</button></div>
      <div class="stats"><div><b>10</b>tools</div><div><b>01</b>workspace</div><div><b>AI</b>powered</div></div>
    </div>
  </section>
  <section class="section" id="tools"><div class="section-head"><div><span class="eyebrow">Tool directory</span><h2>Pick a task. Build something.</h2></div><p>Each tool has a real input → AI/browser processing → rendered output flow.</p></div>
    <div class="tool-grid">${TOOLS.map(t=>card(t)).join("")}</div>
  </section>
  <section class="section"><div class="feature-grid">
    <div class="feature"><div>🔐</div><h3>Key stays server-side</h3><p>Your Gemini key is read from <code>.env</code> by Node.js. It is never placed in the frontend JavaScript.</p></div>
    <div class="feature"><div>⚡</div><h3>Real outputs</h3><p>PDF, PPTX, interactive quiz, flashcards, Mermaid mind maps and AI-generated study content.</p></div>
    <div class="feature"><div>📱</div><h3>Responsive workspace</h3><p>The UI adapts to desktop, tablet and mobile screens without a framework dependency.</p></div>
  </div></section>
  <section class="section" id="about"><div class="panel"><span class="eyebrow">About</span><h2>EduAI Hub</h2><p style="color:var(--muted);line-height:1.7">A practical student toolkit inspired by the supplied AI Classroom reference. It combines ten separate learning workflows in one consistent interface.</p></div></section>`;
  bindCards(); document.getElementById("configureBtn").onclick=showStatus;
}
function card(t){return `<article class="tool-card"><div class="tool-icon">${t.icon}</div><div class="tool-no">${t.no} / 10</div><h3>${t.title}</h3><p>${t.desc}</p><button class="secondary launch" data-tool="${t.id}">Launch tool ↗</button></article>`}
function bindCards(){document.querySelectorAll(".launch").forEach(b=>b.onclick=()=>location.hash="tool/"+b.dataset.tool)}

function shell(t,form,result=`<div class="result" id="result"></div>`){
  return `<section class="workspace"><div class="workspace-head"><div><span class="eyebrow">${t.icon} Tool ${t.no}</span><h1>${t.title}</h1><p>${t.desc}</p></div><a class="secondary" href="#tools">← All tools</a></div>${form}${result}</section>`
}

const TOOL_DATA = {
resume(){return shell(TOOLS[0],`<div class="panel"><div class="form-grid">
<label>Full name<input id="rName" placeholder="Alex Sharma"></label>
<label>Target role<input id="rRole" placeholder="Software Engineer"></label>
<label>Email<input id="rEmail" placeholder="alex@example.com"></label>
<label>Phone<input id="rPhone" placeholder="+91 98765 43210"></label>
<label class="full">Skills<input id="rSkills" placeholder="C++, Java, SQL, Spring Boot, Git"></label>
<label class="full">Education / Experience / Projects<textarea id="rDetails" placeholder="Paste your details here..."></textarea></label>
</div><div class="actions"><button class="primary" id="rGenerate">Generate Resume</button><button class="secondary" id="rPdf">Export PDF</button></div></div>`);},
notes(){return shell(TOOLS[1],`<div class="panel"><label>Study material<textarea id="nInput" placeholder="Paste your chapter, lecture text or raw points..."></textarea></label><label>Format<select id="nFormat"><option>Exam-ready notes</option><option>Detailed notes</option><option>1-page revision notes</option></select></label><div class="actions"><button class="primary" id="nGenerate">Generate Notes</button></div></div>`);},
ppt(){return shell(TOOLS[2],`<div class="panel"><div class="form-grid"><label>Topic<input id="pTopic" placeholder="Programming Paradigms"></label><label>Number of slides<input id="pCount" type="number" min="3" max="20" value="10"></label><label class="full">Requirements<textarea id="pReq" placeholder="Audience, important subtopics, examples, diagrams..."></textarea></label></div><div class="actions"><button class="primary" id="pGenerate">Generate Slides</button><button class="secondary" id="pDownload" disabled>Download PPTX</button></div></div>`);},
mindmap(){return shell(TOOLS[3],`<div class="panel"><label>Syllabus / topic<textarea id="mInput" placeholder="Unit 1: Introduction\nUnit 2: Variables...\nUnit 3: Control Flow..."></textarea></label><div class="actions"><button class="primary" id="mGenerate">Generate Mind Map</button></div></div>` ,`<div class="result mindmap" id="result"></div>`);},
sheets(){return shell(TOOLS[4],`<div class="panel"><label>Google Apps Script Web App URL<input id="sUrl" placeholder="https://script.google.com/macros/s/.../exec"></label><div class="actions"><button class="secondary" id="sLoad">Read Sheet</button></div><label style="margin-top:18px">AI question about the sheet<textarea id="sQuestion" placeholder="Which subject has the highest average score?"></textarea></label><div class="actions"><button class="primary" id="sAnalyze">Analyze with AI</button></div></div>`);},
quiz(){return shell(TOOLS[5],`<div class="panel"><div class="form-grid"><label>Subject<input id="qSubject" placeholder="DBMS"></label><label>Number of questions<input id="qCount" type="number" min="3" max="20" value="10"></label><label class="full">Topic / difficulty<textarea id="qTopic" placeholder="Normalization, keys, dependencies. Medium difficulty."></textarea></label></div><div class="actions"><button class="primary" id="qGenerate">Generate Quiz</button></div></div>`);},
doubt(){return shell(TOOLS[6],`<div class="panel"><div id="chat" class="result" style="min-height:260px"></div><div class="actions"><input id="dInput" placeholder="Ask your subject doubt..." style="flex:1;min-width:220px"><button class="primary" id="dSend">Send</button><button class="secondary" id="dClear">Clear</button></div></div>`);},
flashcards(){return shell(TOOLS[7],`<div class="panel"><label>Topic<textarea id="fInput" placeholder="Java OOPs: inheritance, polymorphism, abstraction, encapsulation"></textarea></label><div class="actions"><button class="primary" id="fGenerate">Generate Flashcards</button></div></div>`);},
planner(){return shell(TOOLS[8],`<div class="panel"><div class="form-grid"><label>Subjects<input id="plSubjects" placeholder="DBMS, OS, CN, DSA, Java"></label><label>Study hours/day<input id="plHours" type="number" min="1" max="16" value="4"></label><label>Days available<input id="plDays" type="number" min="1" max="60" value="7"></label><label>Target date / exam<input id="plDate" type="date"></label><label class="full">Priority / weak areas<textarea id="plWeak" placeholder="DSA is weak, DBMS exam is first..."></textarea></label></div><div class="actions"><button class="primary" id="plGenerate">Create Plan</button></div></div>`);},
ocr(){return shell(TOOLS[9],`<div class="panel"><label>Upload note photo<input id="oFile" type="file" accept="image/*"></label><label>What should AI do?<select id="oMode"><option>Extract text and summarize</option><option>Extract text only</option><option>Convert to exam-ready notes</option></select></label><div class="actions"><button class="primary" id="oGenerate">Process Photo</button></div></div>`);}
};

let lastPpt = null;
let chatHistory = [];

async function initTool(id){
  const index=TOOLS.findIndex(t=>t.id===id); if(index<0){home();return}
  app.innerHTML=TOOL_DATA[id]();
  if(id==="resume") bindResume();
  if(id==="notes") bindNotes();
  if(id==="ppt") bindPpt();
  if(id==="mindmap") bindMindmap();
  if(id==="sheets") bindSheets();
  if(id==="quiz") bindQuiz();
  if(id==="doubt") bindDoubt();
  if(id==="flashcards") bindFlashcards();
  if(id==="planner") bindPlanner();
  if(id==="ocr") bindOcr();
}

function bindResume(){
  rGenerate.onclick=async()=>{const out=document.getElementById("result");const prompt=`Create an ATS-friendly professional resume in Markdown. Name: ${rName.value}. Target role: ${rRole.value}. Email: ${rEmail.value}. Phone: ${rPhone.value}. Skills: ${rSkills.value}. Details: ${rDetails.value}. Do not invent facts. Use concise bullet points.`;const text=await api(prompt,out);out.innerHTML=markdown(text);window.__resumeText=text}
  rPdf.onclick=()=>exportResumePDF(window.__resumeText||"Generate the resume first.");
}
function exportResumePDF(text){
  if(!window.jspdf){toast("PDF library is still loading.");return}
  const {jsPDF}=window.jspdf;const doc=new jsPDF();const lines=doc.splitTextToSize(text.replace(/[#*_`]/g,""),180);let y=15;lines.forEach(line=>{if(y>280){doc.addPage();y=15}doc.text(line,15,y);y+=6});doc.save("EduAI-Resume.pdf")
}
function bindNotes(){nGenerate.onclick=async()=>{const out=document.getElementById("result");const text=await api(`Turn the following material into ${nFormat.value}. Preserve factual accuracy, organize with headings, bullets, definitions, examples and a short quick-revision section. Material:\n${nInput.value}`,out);out.innerHTML=markdown(text)}}
function bindPpt(){
  pGenerate.onclick=async()=>{const out=document.getElementById("result");const count=Math.min(20,Math.max(3,Number(pCount.value)||10));const prompt=`Create a ${count}-slide educational presentation on "${pTopic.value}". Requirements: ${pReq.value}. Return ONLY valid JSON with this shape: {"title":"...","slides":[{"title":"...","bullets":["..."],"speakerNotes":"..."}]}. No markdown fences. Keep bullets concise and explanatory.`;const text=await api(prompt,out);try{lastPpt=JSON.parse(text.replace(/^```json|```$/g,"").trim());out.innerHTML=markdown(lastPpt.slides.map((s,i)=>`### ${i+1}. ${s.title}\n${s.bullets.map(b=>"- "+b).join("\n")}`).join("\n\n"));pDownload.disabled=false}catch(e){out.innerHTML=markdown(text);toast("AI returned non-JSON output; see result.")}}
  pDownload.onclick=()=>downloadPpt();
}
function downloadPpt(){if(!lastPpt||!window.PptxGenJS){toast("Generate slides first.");return}const pptx=new PptxGenJS();pptx.layout="LAYOUT_WIDE";pptx.author="EduAI Hub";pptx.subject=lastPpt.title;lastPpt.slides.forEach((s,i)=>{const slide=pptx.addSlide();slide.background={color:"090C11"};slide.addText(s.title,{x:.6,y:.55,w:11.8,h:.6,fontSize:25,bold:true,color:"FFFFFF"});slide.addText(s.bullets.map(x=>"• "+x).join("\n"),{x:.8,y:1.5,w:11.2,h:4.8,fontSize:18,color:"DCE4EF",breakLine:false,fit:"shrink"});slide.addText(`${i+1} / ${lastPpt.slides.length}`,{x:11.4,y:7,w:1,h:.3,fontSize:9,color:"7B8798"})});pptx.writeFile({fileName:"EduAI-Presentation.pptx"})}
async function bindMindmap(){mGenerate.onclick=async()=>{const out=document.getElementById("result");const text=await api(`Convert this syllabus into Mermaid mindmap syntax. Return ONLY Mermaid syntax starting with "mindmap". Use short node labels and hierarchy. Syllabus:\n${mInput.value}`,out);out.innerHTML=`<pre>${esc(text)}</pre>`;try{const cleaned=text.replace(/^```mermaid/i,"").replace(/```$/,"").trim();out.innerHTML=`<div class="mermaid">${esc(cleaned)}</div>`;await mermaid.run({querySelector:".mermaid"})}catch(e){out.innerHTML+=`<p style="color:#ff9292">Mind map rendering failed. The generated Mermaid source is shown above.</p>`}}}
async function bindSheets(){
  sLoad.onclick=async()=>{const out=document.getElementById("result");setLoading(out);try{const r=await fetch(sUrl.value);const data=await r.json();window.__sheetData=data;out.innerHTML=markdown("```json\n"+JSON.stringify(data,null,2)+"\n```")}catch(e){out.innerHTML=`<div style="color:#ff9292">Could not read the endpoint. Check that your Apps Script Web App allows access and returns JSON.<br>${esc(e.message)}</div>`}}
  sAnalyze.onclick=async()=>{const out=document.getElementById("result");const data=window.__sheetData;if(!data){toast("Load the sheet first.");return}const text=await api(`Analyze this Google Sheets data and answer the user's question. Do not invent values. Question: ${sQuestion.value}\nData:\n${JSON.stringify(data).slice(0,25000)}`,out);out.innerHTML=markdown(text)}
}
async function bindQuiz(){
  qGenerate.onclick=async()=>{const out=document.getElementById("result");const count=Math.min(20,Math.max(3,Number(qCount.value)||10));const text=await api(`Generate ${count} MCQs for ${qSubject.value}. Topic/difficulty: ${qTopic.value}. Return ONLY valid JSON: {"questions":[{"question":"...","options":["A","B","C","D"],"answer":0,"explanation":"..."}]}. answer is zero-based. No markdown fences.` ,out);try{const data=JSON.parse(text.replace(/^```json|```$/g,"").trim());renderQuiz(data.questions,out)}catch(e){out.innerHTML=markdown(text);toast("Could not parse quiz JSON.")}}
}
function renderQuiz(qs,out){out.innerHTML=`<div id="quizBox">${qs.map((q,i)=>`<div class="quiz-card"><b>${i+1}. ${esc(q.question)}</b><div class="quiz-options">${q.options.map((o,j)=>`<label><input type="radio" name="q${i}" value="${j}"> ${esc(o)}</label>`).join("")}</div><div id="exp${i}" style="display:none;color:#9faabd;margin-top:10px"></div></div>`).join("")}</div><button class="primary" id="submitQuiz">Submit Quiz</button><div id="score" style="margin-top:15px"></div>`;submitQuiz.onclick=()=>{let score=0;qs.forEach((q,i)=>{const selected=document.querySelector(`input[name=q${i}]:checked`);const ex=document.getElementById(`exp${i}`);ex.style.display="block";ex.innerHTML=`${selected&&Number(selected.value)===q.answer?"✓ Correct":"✗ Correct answer: "+esc(q.options[q.answer])} — ${esc(q.explanation||"")}`;if(selected&&Number(selected.value)===q.answer)score++});scoreEl=document.getElementById("score");scoreEl.innerHTML=`<b>Score: ${score}/${qs.length}</b>`}}
async function bindDoubt(){
  const chat=document.getElementById("chat"); chat.innerHTML='<div style="color:var(--muted)">Your AI tutor is ready. Ask a question.</div>';
  async function send(){const value=dInput.value.trim();if(!value)return;dInput.value="";chat.innerHTML+=`<p><b>You:</b> ${esc(value)}</p>`;const out=document.createElement("div");out.className="result";out.style.marginTop="8px";chat.appendChild(out);chat.scrollTop=chat.scrollHeight;chatHistory.push({role:"user",text:value});const context=chatHistory.map(x=>`${x.role}: ${x.text}`).join("\n");const text=await api(`You are a patient subject tutor. Answer clearly at a college level, use simple language, examples and code when relevant. Maintain context.\nConversation:\n${context}`,out);chatHistory.push({role:"assistant",text});out.innerHTML=markdown(text);chat.scrollTop=chat.scrollHeight}
  dSend.onclick=send;dInput.addEventListener("keydown",e=>{if(e.key==="Enter")send()});dClear.onclick=()=>{chatHistory=[];chat.innerHTML="";toast("Chat cleared.")}
}
async function bindFlashcards(){fGenerate.onclick=async()=>{const out=document.getElementById("result");const text=await api(`Create 10 study flashcards for: ${fInput.value}. Return ONLY valid JSON {"cards":[{"front":"question/term","back":"answer"}]}. No markdown fences.`,out);try{const data=JSON.parse(text.replace(/^```json|```$/g,"").trim());out.innerHTML=`<div class="flash-grid">${data.cards.map(c=>`<div class="flashcard" onclick="this.classList.toggle('flipped')"><div class="flash-inner"><div class="flash-front">${esc(c.front)}</div><div class="flash-back">${esc(c.back)}</div></div></div>`).join("")}</div><p style="color:var(--muted);font-size:12px">Click a card to flip it.</p>`}catch(e){out.innerHTML=markdown(text)}}}
async function bindPlanner(){plGenerate.onclick=async()=>{const out=document.getElementById("result");const text=await api(`Create a practical day-wise study timetable. Subjects: ${plSubjects.value}. Hours/day: ${plHours.value}. Days: ${plDays.value}. Target date: ${plDate.value||"not specified"}. Weak areas/priorities: ${plWeak.value}. Return a Markdown table with Day, Time, Subject, Task, Break/Review. Keep workload realistic.` ,out);out.innerHTML=markdown(text)}}
async function bindOcr(){
  oGenerate.onclick=async()=>{const file=oFile.files[0],out=document.getElementById("result");if(!file){toast("Choose an image first.");return}if(file.size>8*1024*1024){toast("Please use an image smaller than 8 MB.");return}const reader=new FileReader();reader.onload=async()=>{const text=await vision(reader.result,`Read this handwritten/printed study note carefully. ${oMode.value}. Preserve important technical terms, formulas and headings. Do not invent missing text.`,out);out.innerHTML=markdown(text)};reader.readAsDataURL(file)}
}

async function showStatus(){
  modalBody.innerHTML=`<h2>API status</h2><p>Checking the server configuration…</p>`;modalBackdrop.classList.remove("hidden");
  try{const r=await fetch("/api/health");const d=await r.json();modalBody.innerHTML=`<h2>API status</h2><p>${d.ok?"<b style='color:var(--accent)'>✓ Gemini key configured</b>":"<b style='color:#ff9292'>✗ Gemini key not configured</b>"}</p><p>Model: <code>${esc(d.model)}</code></p><p>The key is read by the Node.js backend from <code>.env</code>; it is not stored in browser localStorage or frontend source.</p>`}catch(e){modalBody.innerHTML=`<h2>Server unavailable</h2><p>Start the project with <code>npm install</code> followed by <code>npm start</code>.</p>`}}
document.getElementById("keyStatusBtn").onclick=showStatus;document.getElementById("modalClose").onclick=()=>modalBackdrop.classList.add("hidden");modalBackdrop.addEventListener("click",e=>{if(e.target===modalBackdrop)modalBackdrop.classList.add("hidden")});

function route(){
  const hash=location.hash.slice(1)||"home";
  if(hash.startsWith("tool/"))initTool(hash.split("/")[1]);else home();
  document.querySelectorAll("nav a").forEach(a=>a.classList.toggle("active",a.dataset.route===hash));
}
window.addEventListener("hashchange",route);route();
if(window.mermaid) mermaid.initialize({startOnLoad:false,theme:"dark",securityLevel:"loose"});
