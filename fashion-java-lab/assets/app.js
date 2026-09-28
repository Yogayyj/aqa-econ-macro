(function () {
  "use strict";

  const STORAGE_PREFIX = "fashionLab_";
  const SESSION_KEY = "fashionLab_activeStudent";
  const RUNNER_ENDPOINT = ""; // Add a Judge0-compatible endpoint here when available.
  const starterCode = `public class Main {

    public static void main(String[] args) {
        // Build your program here. Keep adding to this same Main.java!

    }
}`;
  const teacherFiles = {
    fashion: `public class FashionItem {

    private String brand;
    private String type;
    private double price;

    public FashionItem(String itemBrand, String itemType, double itemPrice) {
        brand = itemBrand;
        type = itemType;
        price = itemPrice;
    }

    public void showInfo() {
        System.out.println("Brand: " + brand);
        System.out.println("Type: " + type);
        System.out.println("Price: $" + price);
    }

    public double getPrice() {
        return price;
    }
}`,
    calculator: `public class Calculator {

    public static double add(double price1, double price2) {
        return price1 + price2;
    }

    public static double discount(double price, double discountRate) {
        return price * (1 - discountRate);
    }
}`
  };
  const lessons = [
    { title: "Create It", summary: "Create your first object from the FashionItem class.", tags: ["class", "object", "new", "constructor"], task: `<p>Create a <code>FashionItem</code> object called <code>hairClip</code>.</p><strong>Brand:</strong> “Miu Miu”<br><strong>Type:</strong> “Hair Clip”<br><strong>Price:</strong> 450` },
    { title: "Arguments", summary: "Match actual arguments to the constructor’s formal parameters.", tags: ["parameter", "argument", "constructor"], task: `<p>Keep <code>hairClip</code>, then create:</p><strong>ribbon</strong> — “LV”, “Ribbon”, 200<br><strong>earring</strong> — “LV”, “Earring”, 600` },
    { title: "Instance Method", summary: "Call a behavior through a particular object.", tags: ["object.method()", "instance method"], task: `<p>Call <code>showInfo()</code> on <code>hairClip</code>.</p><strong>Pattern:</strong> <code>object.method();</code>` },
    { title: "Static Method", summary: "Call a static method through its class, using values from objects.", tags: ["Class.method()", "static method", "return value"], task: `<p>Add the hair clip and earring prices with <code>Calculator.add()</code>.</p><p>Use both objects’ <code>getPrice()</code>, store the result, then print <code>Total: $</code> plus the result.</p>` }
  ];

  const $ = function (id) { return document.getElementById(id); };
  let state = null;
  let saveTimer = null;

  function safeId(id) { return id.trim().replace(/\s+/g, "_"); }
  function storageKey(id) { return STORAGE_PREFIX + encodeURIComponent(id.trim()); }
  function newState(name, id) {
    return { student: { name: name.trim(), id: id.trim() }, code: starterCode, currentChallenge: 1,
      progress: { challenge1: false, challenge2: false, challenge3: false, challenge4: false }, score: 0, checkResults: {} };
  }
  function normalize(saved, name, id) {
    const base = newState(name, id);
    if (!saved || !saved.student) return base;
    base.student = { name: name.trim(), id: id.trim() };
    base.code = typeof saved.code === "string" ? saved.code : (saved.mainJava || starterCode);
    base.currentChallenge = Math.min(4, Math.max(1, Number(saved.currentChallenge) || 1));
    base.progress = Object.assign(base.progress, saved.progress || {});
    base.checkResults = saved.checkResults || {};
    base.score = Object.values(base.progress).filter(Boolean).length;
    return base;
  }
  function saveState() {
    if (!state) return;
    state.code = $("code-editor").value;
    state.score = Object.values(state.progress).filter(Boolean).length;
    localStorage.setItem(storageKey(state.student.id), JSON.stringify(state));
    $("save-status").textContent = "Saved locally ✓";
    $("save-status").classList.remove("saving");
    renderHeader();
  }
  function scheduleSave() {
    $("save-status").textContent = "Saving…";
    $("save-status").classList.add("saving");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveState, 650);
  }
  function updateLines() {
    const count = $("code-editor").value.split("\n").length;
    $("line-numbers").textContent = Array.from({ length: count }, function (_, i) { return i + 1; }).join("\n");
  }
  function renderHeader() {
    $("header-name").textContent = state.student.name;
    $("header-id").textContent = "ID " + state.student.id;
    $("header-score").textContent = state.score + " / 4";
  }
  function renderLesson() {
    const lesson = lessons[state.currentChallenge - 1];
    $("challenge-number").textContent = "Challenge " + state.currentChallenge + " of 4";
    $("challenge-title").textContent = lesson.title;
    $("challenge-summary").textContent = lesson.summary;
    $("challenge-task").innerHTML = `<div class="task-box">${lesson.task}</div>`;
    $("concept-tags").innerHTML = lesson.tags.map(function (tag) { return "<span>" + tag + "</span>"; }).join("");
    $("challenge-nav").innerHTML = lessons.map(function (item, index) {
      const n = index + 1, complete = state.progress["challenge" + n];
      return `<button class="challenge-link ${n === state.currentChallenge ? "active" : ""} ${complete ? "complete" : ""}" data-challenge="${n}"><span class="step">${complete ? "✓" : n}</span><span>${item.title}</span>${complete ? "<small>DONE</small>" : ""}</button>`;
    }).join("");
    $("challenge-nav").querySelectorAll("button").forEach(function (button) {
      button.addEventListener("click", function () {
        state.currentChallenge = Number(button.dataset.challenge);
        saveState(); renderLesson(); clearResults();
      });
    });
  }
  function clearResults() { $("results-content").className = "results-placeholder"; $("results-content").textContent = "Choose a challenge, add your code, then check your answer."; }
  function showResults(result) {
    const title = result.passed ? "Challenge complete — well done!" : "Almost there! Review the feedback below.";
    $("results-content").className = "";
    $("results-content").innerHTML = `<div class="result-banner ${result.passed ? "" : "almost"}">${title}</div><ul class="result-list">${result.items.map(function (item) {
      return `<li class="${item.pass ? "pass" : "fail"}">${item.pass ? "✓" : "✗"} ${item.label}${!item.pass && item.help ? `<br><small>${item.help}</small>` : ""}</li>`;
    }).join("")}</ul>`;
  }
  function checkAnswer() {
    state.code = $("code-editor").value;
    const result = window.FashionLabChecks.check(state.currentChallenge, state.code);
    state.checkResults["challenge" + state.currentChallenge] = { passed: result.passed, checkedAt: new Date().toISOString(), items: result.items };
    if (result.passed) state.progress["challenge" + state.currentChallenge] = true;
    saveState(); renderLesson(); showResults(result);
  }
  function runCode() {
    const output = $("results-content");
    output.className = "";
    if (!RUNNER_ENDPOINT) {
      output.innerHTML = `<div class="result-banner almost">Java Runner is not configured yet.</div><p class="results-placeholder">You can still use <strong>Check Answer</strong> to complete this activity.</p>`;
      return;
    }
    output.textContent = "Sending your program to the Java runner…";
    fetch(RUNNER_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source_code: state.code, language_id: 62 }) })
      .then(function (response) { if (!response.ok) throw new Error("Runner returned " + response.status); return response.json(); })
      .then(function (data) { output.textContent = data.stdout || data.stderr || data.compile_output || "Program finished with no output."; })
      .catch(function () { output.innerHTML = `<div class="result-banner almost">The Java Runner is unavailable.</div><p class="results-placeholder">Your work is safe. Use <strong>Check Answer</strong> and try Run Code later.</p>`; });
  }
  function switchFile(name) {
    document.querySelectorAll(".file-tab").forEach(function (tab) { const active = tab.dataset.file === name; tab.classList.toggle("active", active); tab.setAttribute("aria-selected", active); });
    const main = name === "main";
    $("code-editor").hidden = !main; $("line-numbers").hidden = !main; $("readonly-code").hidden = main;
    $("check-button").disabled = !main;
    if (!main) $("readonly-code").querySelector("code").textContent = teacherFiles[name];
  }
  function exportSubmission() {
    saveState();
    const payload = { version: "1.0", student: state.student, score: state.score, progress: state.progress,
      checkResults: state.checkResults, mainJava: state.code, submittedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    const safeName = state.student.name.trim().replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_|_$/g, "") || "Student";
    link.href = URL.createObjectURL(blob); link.download = `FashionLab_${safeId(state.student.id)}_${safeName}.json`;
    document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(link.href);
  }
  function enterLab(name, id) {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(storageKey(id))); } catch (_) { saved = null; }
    state = normalize(saved, name, id);
    localStorage.setItem(SESSION_KEY, JSON.stringify(state.student));
    $("code-editor").value = state.code;
    $("login-view").hidden = true; $("lab-view").hidden = false;
    renderHeader(); renderLesson(); updateLines(); saveState(); switchFile("main");
  }
  function logout() { saveState(); localStorage.removeItem(SESSION_KEY); state = null; $("lab-view").hidden = true; $("login-view").hidden = false; $("profile-form").reset(); }

  $("profile-form").addEventListener("submit", function (event) {
    event.preventDefault(); const name = $("student-name").value.trim(), id = $("student-id").value.trim();
    if (!name || !id) { $("profile-error").textContent = "Enter both your name and Student ID."; return; }
    $("profile-error").textContent = ""; enterLab(name, id);
  });
  $("code-editor").addEventListener("input", function () { updateLines(); scheduleSave(); });
  $("code-editor").addEventListener("scroll", function () { $("line-numbers").scrollTop = $("code-editor").scrollTop; });
  $("code-editor").addEventListener("keydown", function (event) { if (event.key === "Tab") { event.preventDefault(); const start = this.selectionStart; this.value = this.value.slice(0, start) + "    " + this.value.slice(this.selectionEnd); this.selectionStart = this.selectionEnd = start + 4; updateLines(); scheduleSave(); } });
  document.querySelectorAll(".file-tab").forEach(function (tab) { tab.addEventListener("click", function () { switchFile(tab.dataset.file); }); });
  $("check-button").addEventListener("click", checkAnswer); $("run-button").addEventListener("click", runCode);
  $("clear-results").addEventListener("click", clearResults); $("export-button").addEventListener("click", exportSubmission); $("logout-button").addEventListener("click", logout);
  $("reset-button").addEventListener("click", function () { $("reset-dialog").showModal(); });
  $("confirm-reset").addEventListener("click", function () { localStorage.removeItem(storageKey(state.student.id)); state = newState(state.student.name, state.student.id); $("code-editor").value = state.code; updateLines(); saveState(); renderLesson(); clearResults(); });

  try { const active = JSON.parse(localStorage.getItem(SESSION_KEY)); if (active && active.name && active.id) enterLab(active.name, active.id); } catch (_) { localStorage.removeItem(SESSION_KEY); }
})();
