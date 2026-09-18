# Contributing to StudyPilot AI 🤝

Thank you for your interest in contributing to StudyPilot AI! We welcome contributions from educators, developers, researchers, and students.

## 🛠️ Code of Conduct
We are committed to providing a friendly, safe, and welcoming environment for all contributors regardless of background or experience level.

## 📋 How to Contribute

### 1. Reporting Bugs & Inaccuracies
- Check existing issues to see if the bug has already been reported.
- If not, open a new issue with steps to reproduce, expected vs actual behavior, and relevant error messages.
- If you find an inaccurate NCERT solution or formula, include the textbook edition, Class, Subject, Chapter, and Page number.

### 2. Suggesting Features
- Open a feature proposal issue detailing the user story, pedagogical benefits, and proposed UI or backend architecture.

### 3. Submitting Pull Requests (PRs)
1. Fork the repository and create a new branch: `git checkout -b feature/my-new-feature`
2. Ensure all tests pass: `npm test`
3. Run the linter to verify formatting: `npm run lint`
4. Commit your changes with clear, descriptive commit messages.
5. Push to your fork and submit a Pull Request against the `main` branch.

## 🧪 Testing Standards
- All new AI services, RAG retrieval methods, and teacher utilities must include unit tests in `src/__tests__/`.
- Maintain high grounding fidelity (>90%) and zero hallucination risk on NCERT textbook content.

## 🏛️ Code Conventions
- Use TypeScript with strict typing. Avoid `any` where possible.
- Style with Tailwind CSS utility classes.
- Use Lucide React icons exclusively.
- All Gemini API calls must remain on the server side (`/api/ai/*`) to protect API keys.
