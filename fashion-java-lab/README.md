# Fashion Item Java Lab

A build-free AP Computer Science A activity for introducing Java classes, objects, constructors, parameters, arguments, instance methods, and static methods. The lab uses plain HTML, CSS, and JavaScript and works from a local `index.html` or any static host.

## Student workflow

1. Open `index.html`, enter a name and Student ID, and choose **Start Lab**.
2. Complete the four challenges in one cumulative `Main.java`. Moving between challenges never replaces code.
3. Use **Check Answer** for concept-focused feedback. A challenge is recorded as complete only when every required structure is found.
4. Use the read-only `FashionItem.java` and `Calculator.java` tabs as references.
5. Choose **Export** to download `FashionLab_StudentID_StudentName.json` and send that file to the teacher.

Code, progress, detailed check results, and the active challenge are automatically stored in `localStorage` under `fashionLab_<StudentID>`. Logging out preserves this record; signing in again with the same ID restores it. **Reset my lab** deletes only the current student's local record after confirmation.

## Teacher workflow

1. Open `teacher.html`.
2. Select any number of student JSON exports, or drag them onto the drop zone.
3. Review the class table. Select a row to inspect that student's score, progress, submission time, and final `Main.java`.

Files are parsed only in the teacher's browser. There is no upload, account, database, or server-side storage.

## Run Code backend

**Check Answer works entirely in the browser and does not need a backend.** The Run Code button retains a Judge0-compatible integration point in `assets/app.js`. Until `RUNNER_ENDPOINT` is set, it shows a friendly configuration notice and does not block challenge completion. To enable execution, set the constant to a compatible POST endpoint that accepts `source_code` and `language_id`.

## Deploy to GitHub Pages

This lab uses only relative paths, so it works both at a project URL such as `https://username.github.io/repository/fashion-java-lab/` and from the repository root.

1. Push the repository to GitHub.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Select the default branch and `/ (root)`, then save.
5. Open the published URL ending in `/fashion-java-lab/`.

No npm install or build command is required.

## Local verification

Open `index.html` directly, or serve the repository to mirror GitHub Pages:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000/fashion-java-lab/`. Run the structural-check unit tests with:

```bash
node --test fashion-java-lab/tests/checks.test.js
```
