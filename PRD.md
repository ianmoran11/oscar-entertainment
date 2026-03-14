# Project: Oscar-Entertainment - Browser-Based Youtube app that shows reading quizes at timed intervals 

## 🤖 AGENT INSTRUCTIONS: READ THIS FIRST
1. You are an autonomous developer operating in a continuous loop.
2. Your goal is to complete the tasks in the `Implementation Steps` section in exact order.
3. DO NOT skip ahead. DO NOT combine tasks.
4. For each iteration:
   - Read this document to find the first unchecked task `[ ]`.
   - Implement the code required for that task.
   - Run the development server and/or test commands to verify functionality.
   - If there are errors, fix the code until they are resolved. Do not move on until the feature works.
   - Once working, update `progress.txt` with a brief summary of what you did.
   - Mark the task complete in this `PRD.md` file by changing `[ ]` to `[x]`.
   - Commit the changes to git with a descriptive message.
5. If all tasks are marked `[x]`, output EXACTLY: `<promise>COMPLETE</promise>`

---

## 1. Context & Architecture
**Deployment:** Vercel (Static Export/Client-Side only).

**Design & Security Rules:**
- The application runs entirely in the browser. There is no custom backend.
- **Security:** The OpenRouter API key MUST NOT be hardcoded. Implement a secure settings modal where the user inputs their key, which is then saved to browser `localStorage`.
- **Modularity:** Separate the UI components (chat bubbles, input fields) from the LLM service logic.

---

## 2. Definition of Done
A task is ONLY complete when:
- [ ] The code is fully implemented and passes all TypeScript/ESLint checks.
- [ ] The feature renders in the browser without console errors.
- [ ] `npm run build` executes successfully.
- [ ] The git working tree is clean (committed).

---

mplementation Steps
*(Agent: Work through these sequentially. Check them off as you go.)*

- [x] **Task 1:** Add a complete log of each quiz, answer and result in the statistics view
- [x] **Task 2:** In the word quiz, under each reponse option, add letters for each individual letter - e.g. DOG /n [D][O][G] - which, when pressed, plays the letter sound. I want this to help my son sound out each letter of the words that are presented as options.
- [x] **Task 3:** Please make the text as large as possible on the quiz screen.
- [x] **Task 4:** Remove the numbers quiz element.
- [x] **Task 5:** Fix the number entry when selecting the interval for showing quizes. It's unusually and hard to input. Can you make it a more traditional android input.




