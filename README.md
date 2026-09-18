# StudyPilot AI 🚀📚
### Open-Source AI-Powered NCERT & CBSE Learning Operating System

StudyPilot AI is a comprehensive, production-grade educational platform built with React, TypeScript, Tailwind CSS, Express, and Google Gemini 2.5 Flash. It transforms static NCERT textbooks into interactive, page-grounded learning environments with retrieval-augmented generation (RAG), automated assessment generation for teachers, multilingual learning aids, and hallucination evaluation guardrails.

---

## 🌟 Key Features

1. **NCERT Smart Library & PDF Ingestion**:
   - Complete textbook chapter hierarchy for Classes 9, 10, 11, and 12 across Science, Mathematics, Social Science, Physics, and Chemistry.
   - Upload official NCERT PDFs with automatic chapter, section, and page indexing.

2. **Page-Based Learning Hub**:
   - Deep academic concept explanations, summaries, formulas with SI units, and official NCERT highlights for every individual page.
   - Active recall interactive flashcards and chapter exam practice questions.

3. **Textbook-Grounded RAG Engine**:
   - Zero-hallucination question-answering strictly grounded in official NCERT text.
   - Exact citation quotes with direct page jump links and grounding confidence scores.

4. **Advanced Multi-Format Quiz Engine**:
   - Multiple Choice Questions (MCQs), True/False, Fill-in-the-Blanks, and Short Answer diagnostics.
   - Immediate feedback with step-by-step NCERT explanations and weak-topic tracking.

5. **Personalized Spaced Repetition & Weak Topic Analytics**:
   - Continuous diagnostic tracking identifying struggling concepts with exact textbook page references.
   - Formative revision intervals calculated for long-term retention.

6. **AI Evaluation System & Telemetry**:
   - Production telemetry tracking latency, grounding fidelity, and JSON schema adherence.
   - Automated benchmark test runner and interactive factuality auditor.

7. **Teacher & Educator Toolkit**:
   - Instant generation of CBSE Question Papers, Classroom Worksheets, and 20-minute Diagnostic Tests.
   - Full point-wise marking schemes, model answers, and pedagogical guidance.

8. **Multilingual Learning Support**:
   - Full support for English, Hindi (हिंदी), and Hinglish modes while preserving standard scientific formulas and notation ($E=mc^2$, chemical reactions).

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React icons, Motion animations.
- **Backend**: Express.js with secure server-side API proxying (`/api/ai/*`).
- **AI Models**: Google Gemini 2.5 Flash with deterministic JSON Schema enforcement.
- **Testing**: Vitest automated unit & integration test suites.
- **Database & Auth**: Firebase Firestore and Firebase Authentication.

---

## 🚀 Quick Start

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/studypilot-ai/studypilot.git
cd studypilot

# Install dependencies
npm install
```

### 2. Environment Configuration
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Ensure your `GEMINI_API_KEY` is configured.

### 3. Development Server
```bash
npm run dev
```
Open `http://localhost:3000` to view the application.

### 4. Running Automated Tests
```bash
npm test
```

### 5. Production Build
```bash
npm run build
npm start
```

---

## 📜 License & Open-Source Guidelines
This project is open-source under the MIT License. See [CONTRIBUTING.md](./CONTRIBUTING.md) for community contribution guidelines and [docs/API.md](./docs/API.md) for API specifications.
