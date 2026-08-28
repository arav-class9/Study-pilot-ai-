const fs = require('fs');
let code = fs.readFileSync('src/data/questionBank.ts', 'utf8');

code = code.replace(
  'difficulty: DifficultyLevel;',
  `difficulty: DifficultyLevel;
  questionType?: 'mcq' | 'numerical' | 'assertion_reason' | 'conceptual';
  estimatedSolvingTimeSeconds?: number;
  source?: string;
  tags?: string[];
  prerequisiteConcepts?: string[];
  qualityStatus?: 'verified' | 'needs_review';`
);

fs.writeFileSync('src/data/questionBank.ts', code);
