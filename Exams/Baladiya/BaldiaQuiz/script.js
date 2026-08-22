
let quiz = [], idx = 0, score = 0, answers = [], seconds = 0, timerId = null;

const $ = id => document.getElementById(id);
const labels = ["ক", "খ", "গ", "ঘ", "ঙ", "চ"];

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function init() {

}

function startQuiz() {
  let n = +$("count").value;
  let pool = BANK;
  
  quiz = shuffle([...pool]).slice(0, Math.min(n, pool.length));
  idx = 0;
  score = 0;
  answers = [];
  seconds = 0;
  
  $("result").classList.add("hidden");
  $("quiz").classList.remove("hidden");
  
  clearInterval(timerId);
  timerId = setInterval(() => {
    seconds++;
    $("timer").textContent = `সময় ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  }, 1000);
  
  render();
}

function render() {
  let q = quiz[idx];
  let old = answers[idx];
  
  $("question").textContent = `${idx + 1}. ${q.q}`;
  $("source").textContent = `উৎস: ${q.src}`;
  $("progressText").textContent = `প্রশ্ন ${idx + 1} / ${quiz.length}`;
  $("bar").style.width = ((idx + 1) / quiz.length * 100) + "%";
  $("feedback").classList.add("hidden");
  $("feedback").textContent = "";
  $("options").innerHTML = "";
  
  q.o.forEach((t, i) => {
    let l = document.createElement("label");
    l.className = "opt";
    l.innerHTML = `<input type="radio" name="answer" value="${i}"><span><b>${labels[i]}.</b> ${t}</span>`;
    l.querySelector("input").addEventListener("change", () => choose(i));
    $("options").appendChild(l);
  });
  
  if (old !== undefined) {
    mark(old);
    choose(old);
  }
  
  $("nextBtn").textContent = idx === quiz.length - 1 ? "ফলাফল দেখুন" : "পরের প্রশ্ন →";
}

function choose(i) {
  answers[idx] = i;
  mark(i);
  
  let q = quiz[idx];
  let ok = i === q.a;
  
  $("feedback").classList.remove("hidden");
  $("feedback").innerHTML = ok 
    ? `<span class="ok">✓ সঠিক উত্তর</span>` 
    : `<span class="no">✗ ভুল উত্তর</span> — সঠিক উত্তর: <b>${labels[q.a]}. ${q.o[q.a]}</b>`;
}

function mark(s) {
  document.querySelectorAll(".opt").forEach((e, i) => {
    e.classList.remove("correct", "wrong");
    if (i === quiz[idx].a) e.classList.add("correct");
    if (i === s && i !== quiz[idx].a) e.classList.add("wrong");
    e.querySelector("input").checked = (i === s);
  });
}

function nextQ() {
  if (answers[idx] === undefined) {
    $("feedback").classList.remove("hidden");
    $("feedback").textContent = "একটি উত্তর নির্বাচন করুন।";
    return;
  }
  
  if (idx < quiz.length - 1) {
    idx++;
    render();
  } else {
    finish();
  }
}

function prevQ() {
  if (idx > 0) {
    idx--;
    render();
  }
}

function finish() {
  clearInterval(timerId);
  score = quiz.reduce((s, q, i) => s + (answers[i] === q.a ? 1 : 0), 0);
  let pct = Math.round((score / quiz.length) * 100);
  
  $("quiz").classList.add("hidden");
  $("result").classList.remove("hidden");
  $("result").innerHTML = `
    <div class="result">
      <h2>কুইজ সম্পন্ন 🎉</h2>
      <div class="score">${pct}%</div>
      <div class="stats">
        <div class="stat"><b>${score}</b>সঠিক</div>
        <div class="stat"><b>${quiz.length - score}</b>ভুল</div>
        <div class="stat"><b>${quiz.length}</b>মোট</div>
      </div>
      <p>সময়: ${Math.floor(seconds / 60)} মিনিট ${seconds % 60} সেকেন্ড</p>
      <button class="primary" onclick="startQuiz()">আবার চেষ্টা করুন</button> 
      <button onclick="review()">উত্তর রিভিউ</button>
      <div id="review" class="review hidden"></div>
    </div>
  `;
}

function review() {
  let b = $("review");
  b.classList.toggle("hidden");
  
  if (!b.innerHTML) {
    b.innerHTML = quiz.map((q, i) => {
      let ok = answers[i] === q.a;
      return `
        <div class="review-item">
          <b>${i + 1}. ${q.q}</b><br>
          <span class="${ok ? "ok" : "no"}">${ok ? "✓ সঠিক" : "✗ ভুল"}</span> — 
          আপনার উত্তর: ${labels[answers[i]] || "—"}; 
          সঠিক: ${labels[q.a]}. ${q.o[q.a]}<br>
          <small>${q.src}</small>
        </div>
      `;
    }).join("");
  }
}

init();







