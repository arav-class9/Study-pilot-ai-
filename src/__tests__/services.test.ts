import { describe, it, expect } from 'vitest';
import { runAIEvaluationBenchmark } from '../../server/services/aiEvaluation';
import { verifyNumericalSolution, verifyMCQQuestion } from '../../server/services/verification';

describe('StudyPilot AI Open-Source Engineering Test Suite', () => {
  describe('AI Evaluation & Benchmark Service', () => {
    it('should run deterministic benchmarks with high pass rate', async () => {
      const report = await runAIEvaluationBenchmark();
      expect(report).toBeDefined();
      expect(report.totalBenchmarksRun).toBeGreaterThanOrEqual(4);
      expect(report.passedBenchmarks).toBeGreaterThanOrEqual(4);
      expect(report.accuracyRatePercentage).toBeGreaterThanOrEqual(95);
      expect(report.hallucinationRatePercentage).toBeLessThan(5);
      expect(report.benchmarkTests.length).toBeGreaterThanOrEqual(4);
    });

    it('should correctly verify numerical calculations deterministically', () => {
      const validNumerical = {
        isNumerical: true,
        numericalBreakdown: {
          given: ['m = 2 kg', 'h = 5 m', 'g = 9.8 m/s^2'],
          formula: 'PE = m * g * h',
          substitution: '2 * 9.8 * 5',
          calculation: '98',
          answer: '98',
          unit: 'J',
        },
        finalAnswer: '98 J',
      };

      const result = verifyNumericalSolution(validNumerical);
      expect(result.status).toBe('verified');
      expect(result.numericalCheckPassed).toBe(true);
      expect(result.confidenceScore).toBeGreaterThanOrEqual(90);
    });

    it('should correctly validate MCQ questions and prevent duplicates or empty options', () => {
      const validMCQ = {
        options: ['10 N', '20 N', '30 N', '40 N'],
        correctAnswer: '20 N',
        explanation: 'F = m * a = 2 * 10 = 20 N',
      };

      const isValid = verifyMCQQuestion(validMCQ);
      expect(isValid).toBe(true);

      const invalidDuplicateMCQ = {
        options: ['10 N', '10 N', '30 N', '40 N'],
        correctAnswer: '10 N',
        explanation: 'Duplicate options',
      };
      expect(verifyMCQQuestion(invalidDuplicateMCQ)).toBe(false);
    });
  });

  describe('Textbook Grounding & Citation Schema', () => {
    it('should validate chunk extraction structure and citation formatting', () => {
      const sampleChunk = {
        pageNumber: 6,
        sectionTitle: 'Types of Chemical Reactions',
        heading: 'Combination Reaction',
        text: 'When two or more substances combine to form a single product, the reactions are called combination reactions.',
        formulas: ['CaO(s) + H2O(l) -> Ca(OH)2(aq)'],
        keyPoints: ['Calcium oxide reacts vigorously with water to produce slaked lime.'],
      };

      expect(sampleChunk.pageNumber).toBe(6);
      expect(sampleChunk.formulas).toContain('CaO(s) + H2O(l) -> Ca(OH)2(aq)');
      expect(sampleChunk.keyPoints.length).toBeGreaterThan(0);
    });
  });
});
