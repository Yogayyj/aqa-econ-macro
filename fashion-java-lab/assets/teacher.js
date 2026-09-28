(function () {
  "use strict";
  const input = document.getElementById("file-input");
  const dropZone = document.getElementById("drop-zone");
  const list = document.getElementById("submission-list");
  const detail = document.getElementById("student-detail");
  const errors = document.getElementById("import-errors");
  const submissions = new Map();
  let selectedId = null;

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>'"]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char];
    });
  }
  function validSubmission(data) {
    return data && data.student && typeof data.student.name === "string" && typeof data.student.id === "string" &&
      data.progress && typeof (data.mainJava || data.code) === "string";
  }
  function score(data) { return [1, 2, 3, 4].filter(function (n) { return Boolean(data.progress["challenge" + n]); }).length; }
  function renderList() {
    const rows = Array.from(submissions.values());
    document.getElementById("submission-count").textContent = rows.length + (rows.length === 1 ? " student" : " students");
    if (!rows.length) { list.className = "empty-state"; list.textContent = "Import one or more assignment exports to see class progress."; return; }
    list.className = "table-wrap";
    list.innerHTML = `<table><thead><tr><th>Student</th><th>ID</th><th>C1</th><th>C2</th><th>C3</th><th>C4</th><th>Score</th></tr></thead><tbody>${rows.map(function (item) {
      const id = item.student.id, marks = [1,2,3,4].map(function (n) { const done = Boolean(item.progress["challenge" + n]); return `<td class="${done ? "tick" : "cross"}">${done ? "✓" : "✗"}</td>`; }).join("");
      return `<tr data-id="${escapeHtml(id)}" class="${selectedId === id ? "selected" : ""}"><td><strong>${escapeHtml(item.student.name)}</strong></td><td>${escapeHtml(id)}</td>${marks}<td><strong>${score(item)}/4</strong></td></tr>`;
    }).join("")}</tbody></table>`;
    list.querySelectorAll("tbody tr").forEach(function (row) { row.addEventListener("click", function () { selectedId = row.dataset.id; renderList(); renderDetail(submissions.get(selectedId)); }); });
  }
  function renderDetail(item) {
    if (!item) return;
    const submitted = item.submittedAt ? new Date(item.submittedAt) : null;
    const time = submitted && !Number.isNaN(submitted.getTime()) ? submitted.toLocaleString() : "Not provided";
    detail.className = "student-detail";
    detail.innerHTML = `<div class="detail-meta"><p>Student<strong>${escapeHtml(item.student.name)}</strong></p><p>Student ID<strong>${escapeHtml(item.student.id)}</strong></p><p>Score<strong>${score(item)} / 4</strong></p><p>Submission time<strong>${escapeHtml(time)}</strong></p></div>
      <div class="progress-row">${[1,2,3,4].map(function (n) { const done = Boolean(item.progress["challenge" + n]); return `<span class="progress-chip ${done ? "done" : ""}">C${n} ${done ? "✓" : "○"}</span>`; }).join("")}</div>
      <p class="eyebrow">FINAL MAIN.JAVA</p><pre class="code-block"><code>${escapeHtml(item.mainJava || item.code)}</code></pre>`;
  }
  async function importFiles(files) {
    const messages = [];
    await Promise.all(Array.from(files).map(async function (file) {
      try {
        const data = JSON.parse(await file.text());
        if (!validSubmission(data)) throw new Error("not a Fashion Lab export");
        submissions.set(data.student.id, data);
      } catch (error) { messages.push(file.name + ": " + error.message); }
    }));
    errors.textContent = messages.length ? "Could not import " + messages.join(" · ") : "";
    renderList();
    if (!selectedId && submissions.size) { selectedId = submissions.keys().next().value; renderList(); renderDetail(submissions.get(selectedId)); }
  }
  input.addEventListener("change", function () { importFiles(input.files); input.value = ""; });
  ["dragenter", "dragover"].forEach(function (eventName) { dropZone.addEventListener(eventName, function (event) { event.preventDefault(); dropZone.classList.add("dragging"); }); });
  ["dragleave", "drop"].forEach(function (eventName) { dropZone.addEventListener(eventName, function (event) { event.preventDefault(); dropZone.classList.remove("dragging"); }); });
  dropZone.addEventListener("drop", function (event) { importFiles(Array.from(event.dataTransfer.files).filter(function (file) { return file.name.toLowerCase().endsWith(".json"); })); });
})();
