// ✏ Change these two to personalise
const NAME = "Lumaya";
document.getElementById("nm").textContent = NAME;

const $ = id => document.getElementById(id);
const pick = {place:"", year: 2026, month: 10, day: 0, time:"", notes:""}; // month 10 = November (0-indexed)
const bars = [...document.querySelectorAll("#bar span")];

function go(n){
  document.querySelectorAll(".step").forEach(s => s.classList.remove("on"));
  $("s"+n).classList.add("on");
  bars.forEach((b,i) => b.classList.toggle("on", i < n));
  window.scrollTo({top:0, behavior:"smooth"});
}
function hearts(){
  for(let i=0;i<24;i++){
    const h = document.createElement("div");
    h.className = "heart";
    h.textContent = ["💗","💖","🌹","✨","💕"][i%5];
    h.style.left = Math.random()*100+"vw";
    h.style.fontSize = 16+Math.random()*22+"px";
    h.style.animationDelay = Math.random()*1.2+"s";
    document.body.appendChild(h);
    setTimeout(()=>h.remove(), 4500);
  }
}

// Step 1 — the NO button runs away
let tries = 0;
const lines = ["NO","still no?","are you sure?","think again 🥺","nope, wrong one"];
function dodge(e){
  e.preventDefault();
  const b = $("no");
  tries++;
  b.textContent = lines[Math.min(tries, lines.length-1)];
  b.style.left = (60 + Math.random()*130) + "px";
  b.style.transform = `translate(0, ${(Math.random()-.5)*130}px) scale(${Math.max(.6, 1 - tries*.07)})`;
  $("yes").style.transform = `scale(${Math.min(1.5, 1 + tries*.06)})`;
}
$("no").addEventListener("mouseenter", dodge);
$("no").addEventListener("touchstart", dodge, {passive:false});
$("no").addEventListener("click", dodge);
$("yes").addEventListener("click", () => { hearts(); setTimeout(()=>go(2), 500); });

// Step 2 — choose place
document.querySelectorAll(".opt").forEach(o => o.addEventListener("click", () => {
  document.querySelectorAll(".opt").forEach(x => x.classList.remove("sel"));
  o.classList.add("sel");
  pick.place = o.dataset.v;
  $("n2").disabled = false;
}));
$("n2").addEventListener("click", () => go(3));

// Step 3 — calendar (Dynamic Year & Month selection)
const months = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const monthSelect = $("month-select");
const yearSelect = $("year-select");

months.forEach((m, idx) => {
  const opt = document.createElement("option");
  opt.value = idx;
  opt.textContent = m;
  if(idx === 10) opt.selected = true; // Default to November
  monthSelect.appendChild(opt);
});

// Populate years (2025 to 2030)
for(let y = 2025; y <= 2030; y++){
  const opt = document.createElement("option");
  opt.value = y;
  opt.textContent = y;
  if(y === 2026) opt.selected = true; // Default to 2026
  yearSelect.appendChild(opt);
}

function renderCalendar(){
  const g = $("grid");
  g.innerHTML = "";
  ["SUN","MON","TUE","WED","THU","FRI","SAT"].forEach(d => g.insertAdjacentHTML("beforeend", `<div class="h">${d}</div>`));

  const y = parseInt(yearSelect.value);
  const m = parseInt(monthSelect.value);
  pick.year = y;
  pick.month = m;
  pick.day = 0; // Reset selected day on month/year change
  check();

  const firstDay = new Date(y, m, 1).getDay();
  const totalDays = new Date(y, m + 1, 0).getDate();

  for(let i=0; i<firstDay; i++) g.insertAdjacentHTML("beforeend", "<div></div>");

  for(let d=1; d<=totalDays; d++){
    const b = document.createElement("button");
    b.textContent = d;
    b.onclick = () => { 
      g.querySelectorAll("button").forEach(x=>x.classList.remove("sel")); 
      b.classList.add("sel"); 
      pick.day = d; 
      check(); 
    };
    g.appendChild(b);
  }
}

monthSelect.addEventListener("change", renderCalendar);
yearSelect.addEventListener("change", renderCalendar);
renderCalendar();

// Time input
const timeInput = $("custom-time");
timeInput.addEventListener("input", (e) => {
  pick.time = e.target.value.trim();
  check();
});

// Special Notes input
const notesInput = $("notes");
notesInput.addEventListener("input", (e) => {
  pick.notes = e.target.value.trim();
});

function check(){ 
  $("n3").disabled = !(pick.day && pick.time); 
}

$("n3").addEventListener("click", () => {
  const chosenPlace = pick.place;
  const chosenDate = months[pick.month] + " " + pick.day + ", " + pick.year;
  const chosenTime = pick.time;
  const chosenNotes = pick.notes;

  $("o1").textContent = chosenPlace;
  $("o2").textContent = chosenDate;
  $("o3").textContent = chosenTime;

  if(chosenNotes){
    $("notes-box").style.display = "flex";
    $("o4").textContent = chosenNotes;
  } else {
    $("notes-box").style.display = "none";
  }

  // Formspree email submission
  fetch("https://formspree.io/f/mdekqjea", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      name: NAME,
      place: chosenPlace,
      date: chosenDate,
      time: chosenTime,
      specialNotes: chosenNotes || "None",
      submittedAt: new Date().toLocaleString()
    })
  }).catch(err => console.error("Error sending response:", err));

  go(4); 
  hearts();
});

// Step 4
$("yay").addEventListener("click", hearts);
$("again").addEventListener("click", () => go(2));