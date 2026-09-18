# StudyPilot AI — Backend API Reference 📡

All AI endpoints run server-side through Express to safeguard credentials and provide structured JSON outputs.

---

## 1. Teacher Worksheet & Question Paper Generator
**Endpoint:** `POST /api/ai/teacher-worksheet`

### Request Body:
```json
{
  "subject": "Science",
  "classLevel": "10",
  "board": "CBSE",
  "chapterName": "Chemical Reactions and Equations",
  "worksheetType": "question_paper",
  "difficulty": "mixed",
  "totalMarks": 40,
  "includeAnswerKey": true,
  "language": "en"
}
```

### Response Schema:
```json
{
  "status": "success",
  "data": {
    "id": "ts_123456",
    "title": "Class 10 CBSE Science Question Paper",
    "totalMarks": 40,
    "suggestedDurationMinutes": 90,
    "instructions": ["All questions are compulsory..."],
    "sections": [
      {
        "sectionName": "Section A (Objective)",
        "totalMarks": 10,
        "questions": [
          {
            "questionNumber": 1,
            "questionType": "mcq",
            "marks": 1,
            "questionText": "...",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": "A",
            "stepByStepSolution": "...",
            "markingSchemeGuide": "1 mark for correct option."
          }
        ]
      }
    ],
    "answerKeyAndMarkingScheme": [
      {
        "questionNumber": 1,
        "modelAnswer": "...",
        "markingCriteria": ["1M full credit"]
      }
    ],
    "pedagogicalNotes": "..."
  }
}
```

---

## 2. Textbook-Grounded RAG Engine
**Endpoint:** `POST /api/ai/textbook-rag`

### Request Body:
```json
{
  "query": "What is the difference between exothermic and endothermic reactions?",
  "bookTitle": "NCERT Class 10 Science",
  "chapterName": "Chemical Reactions and Equations",
  "classLevel": "10",
  "subject": "Science",
  "language": "en",
  "availablePages": [
    {
      "pageNumber": 7,
      "text": "..."
    }
  ]
}
```

---

## 3. Grounding & Hallucination Evaluator
**Endpoint:** `POST /api/ai/evaluate-response`

### Request Body:
```json
{
  "question": "What is the formula of gypsum?",
  "aiResponse": "The formula of gypsum is CaSO4.2H2O.",
  "referenceSourceText": "Gypsum has two water molecules as water of crystallisation. It has the chemical formula CaSO4.2H2O."
}
```

---

## 4. Evaluation Benchmark Runner
**Endpoint:** `GET /api/ai/benchmark`
Executes automated RAG and curriculum alignment test suites and returns accuracy rates, hallucination metrics, and latency percentiles.
