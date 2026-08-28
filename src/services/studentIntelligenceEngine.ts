import {
  StudentLearningProfile,
  TopicProgress,
  QuizAttempt,
  ExamAttempt,
  MistakeItem,
  RevisionQueueItem,
  SubjectId,
  ClassLevel,
  MistakeCategory,
  DifficultyLevel,
  ForgettingRisk,
} from '../types';
import { checkPrerequisitesForTopic } from '../data/prerequisites';

export interface IntelligenceEngineInput {
  userId: string;
  classLevel: ClassLevel;
  board: string;
  topicProgressList: TopicProgress[];
  quizAttempts: QuizAttempt[];
  examAttempts: ExamAttempt[];
  mistakes: MistakeItem[];
  revisionQueue: RevisionQueueItem[];
  dailyStudyMinutes?: number;
  examDate?: string;
  streak?: number;
}

/**
 * Ensures all scores are strictly real finite integers between 0 and 100
 */
export function clampScore(value: number | undefined | null, fallback: number = 0, min: number = 0, max: number = 100): number {
  if (value === undefined || value === null || isNaN(value) || !isFinite(value)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, Math.round(value)));
}

export class StudentIntelligenceEngine {
  /**
   * Computes unified, single-source-of-truth student learning profile
   */
  public static computeLearningProfile(input: IntelligenceEngineInput): StudentLearningProfile {
    const {
      userId,
      classLevel,
      board,
      topicProgressList = [],
      quizAttempts = [],
      examAttempts = [],
      mistakes = [],
      revisionQueue = [],
      streak = 0,
    } = input;

    // Filter topics that have actually been attempted
    const activeTopics = topicProgressList.filter((t) => (t.attempts || 0) > 0);

    // 1. Topic Mastery & Classification (Real data only)
    const topicMasteryMap: Record<string, number> = {};
    const strongTopics: string[] = [];
    const weakTopics: string[] = [];
    const developingTopics: string[] = [];
    const needsRevisionTopics: string[] = [];

    activeTopics.forEach((t) => {
      const clampedMastery = clampScore(t.masteryScore, 0);
      topicMasteryMap[t.topicName] = clampedMastery;

      if (clampedMastery >= 75) {
        strongTopics.push(t.topicName);
      } else if (clampedMastery < 60) {
        weakTopics.push(t.topicName);
        if (clampedMastery < 40) {
          needsRevisionTopics.push(t.topicName);
        }
      } else {
        developingTopics.push(t.topicName);
      }
    });

    // 2. Subject Breakdown & Subject Mastery
    const subjectStats: Record<
      SubjectId,
      { totalAttempts: number; totalCorrect: number; masterySum: number; count: number }
    > = {
      math: { totalAttempts: 0, totalCorrect: 0, masterySum: 0, count: 0 },
      science: { totalAttempts: 0, totalCorrect: 0, masterySum: 0, count: 0 },
      physics: { totalAttempts: 0, totalCorrect: 0, masterySum: 0, count: 0 },
      chemistry: { totalAttempts: 0, totalCorrect: 0, masterySum: 0, count: 0 },
      biology: { totalAttempts: 0, totalCorrect: 0, masterySum: 0, count: 0 },
      english: { totalAttempts: 0, totalCorrect: 0, masterySum: 0, count: 0 },
      social_science: { totalAttempts: 0, totalCorrect: 0, masterySum: 0, count: 0 },
      history: { totalAttempts: 0, totalCorrect: 0, masterySum: 0, count: 0 },
      geography: { totalAttempts: 0, totalCorrect: 0, masterySum: 0, count: 0 },
      civics: { totalAttempts: 0, totalCorrect: 0, masterySum: 0, count: 0 },
      hindi: { totalAttempts: 0, totalCorrect: 0, masterySum: 0, count: 0 },
      evs: { totalAttempts: 0, totalCorrect: 0, masterySum: 0, count: 0 },
      computer: { totalAttempts: 0, totalCorrect: 0, masterySum: 0, count: 0 },
      economics: { totalAttempts: 0, totalCorrect: 0, masterySum: 0, count: 0 },
    };

    activeTopics.forEach((tp) => {
      const subj = tp.subjectId in subjectStats ? tp.subjectId : 'science';
      subjectStats[subj].totalAttempts += tp.attempts || 0;
      subjectStats[subj].totalCorrect += tp.correct || 0;
      subjectStats[subj].masterySum += clampScore(tp.masteryScore, 0);
      subjectStats[subj].count += 1;
    });

    const subjectMastery: Record<SubjectId, number> = {
      math: subjectStats.math.count > 0 && subjectStats.math.totalAttempts > 0 ? clampScore(subjectStats.math.masterySum / subjectStats.math.count, 0) : 0,
      science: subjectStats.science.count > 0 && subjectStats.science.totalAttempts > 0 ? clampScore(subjectStats.science.masterySum / subjectStats.science.count, 0) : 0,
      physics: subjectStats.physics.count > 0 && subjectStats.physics.totalAttempts > 0 ? clampScore(subjectStats.physics.masterySum / subjectStats.physics.count, 0) : 0,
      chemistry: subjectStats.chemistry.count > 0 && subjectStats.chemistry.totalAttempts > 0 ? clampScore(subjectStats.chemistry.masterySum / subjectStats.chemistry.count, 0) : 0,
      biology: subjectStats.biology.count > 0 && subjectStats.biology.totalAttempts > 0 ? clampScore(subjectStats.biology.masterySum / subjectStats.biology.count, 0) : 0,
      english: subjectStats.english.count > 0 && subjectStats.english.totalAttempts > 0 ? clampScore(subjectStats.english.masterySum / subjectStats.english.count, 0) : 0,
      social_science: subjectStats.social_science.count > 0 && subjectStats.social_science.totalAttempts > 0 ? clampScore(subjectStats.social_science.masterySum / subjectStats.social_science.count, 0) : 0,
      history: subjectStats.history.count > 0 && subjectStats.history.totalAttempts > 0 ? clampScore(subjectStats.history.masterySum / subjectStats.history.count, 0) : 0,
      geography: subjectStats.geography.count > 0 && subjectStats.geography.totalAttempts > 0 ? clampScore(subjectStats.geography.masterySum / subjectStats.geography.count, 0) : 0,
      civics: subjectStats.civics.count > 0 && subjectStats.civics.totalAttempts > 0 ? clampScore(subjectStats.civics.masterySum / subjectStats.civics.count, 0) : 0,
      hindi: subjectStats.hindi.count > 0 && subjectStats.hindi.totalAttempts > 0 ? clampScore(subjectStats.hindi.masterySum / subjectStats.hindi.count, 0) : 0,
      evs: subjectStats.evs.count > 0 && subjectStats.evs.totalAttempts > 0 ? clampScore(subjectStats.evs.masterySum / subjectStats.evs.count, 0) : 0,
      computer: subjectStats.computer.count > 0 && subjectStats.computer.totalAttempts > 0 ? clampScore(subjectStats.computer.masterySum / subjectStats.computer.count, 0) : 0,
      economics: subjectStats.economics.count > 0 && subjectStats.economics.totalAttempts > 0 ? clampScore(subjectStats.economics.masterySum / subjectStats.economics.count, 0) : 0,
    };

    // 3. Genuine Overall Accuracy & Mastery
    const totalQuizQuestions = quizAttempts.reduce((acc, q) => acc + (q.totalQuestions || 0), 0);
    const totalQuizCorrect = quizAttempts.reduce((acc, q) => acc + (q.score || 0), 0);
    const totalTopicQuestions = activeTopics.reduce((acc, t) => acc + (t.attempts || 0), 0);
    const totalTopicCorrect = activeTopics.reduce((acc, t) => acc + (t.correct || 0), 0);
    const totalExamQuestions = examAttempts.reduce((acc, e) => acc + (e.totalQuestions || 0), 0);
    const totalExamCorrect = examAttempts.reduce((acc, e) => {
      const correctAnswersCount = e.answers ? e.answers.filter((a: any) => a.isCorrect).length : (e.accuracy ? Math.round((e.accuracy / 100) * e.totalQuestions) : 0);
      return acc + correctAnswersCount;
    }, 0);

    const grandTotalQuestions = totalQuizQuestions + totalTopicQuestions + totalExamQuestions;
    const grandTotalCorrect = totalQuizCorrect + totalTopicCorrect + totalExamCorrect;

    // Strict accuracy formula: (correctAnswers / totalQuestions) * 100
    const finalAccuracy = grandTotalQuestions > 0 ? Math.round((grandTotalCorrect / grandTotalQuestions) * 100) : 0;

    // Strict mastery formula: average mastery of attempted topics and quizzes
    let finalMastery = 0;
    if (activeTopics.length > 0) {
      finalMastery = Math.round(activeTopics.reduce((acc, t) => acc + (t.masteryScore || 0), 0) / activeTopics.length);
    } else if (quizAttempts.length > 0) {
      finalMastery = Math.round(quizAttempts.reduce((acc, q) => acc + (q.accuracy || 0), 0) / quizAttempts.length);
    }

    // 4. Average Solve Time (0 for fresh users)
    const totalSolveTime = quizAttempts.reduce((acc, q) => acc + (q.timeTakenSeconds || 0), 0);
    const averageSolveTime = quizAttempts.length > 0 ? Math.round(totalSolveTime / quizAttempts.length) : 0;

    // 5. Common Mistake Categories
    const mistakeCategoryCounts: Record<MistakeCategory, number> = {
      'Concept Gap': 0,
      'Calculation Error': 0,
      'Formula Confusion': 0,
      'Unit Error': 0,
      'Reading Error': 0,
      'Careless Error': 0,
      Misconception: 0,
    };

    mistakes.filter((m) => !m.resolved).forEach((m) => {
      if (m.mistakeType in mistakeCategoryCounts) {
        mistakeCategoryCounts[m.mistakeType]++;
      }
    });

    const commonMistakeTypes = (Object.keys(mistakeCategoryCounts) as MistakeCategory[])
      .filter((k) => mistakeCategoryCounts[k] > 0)
      .sort((a, b) => mistakeCategoryCounts[b] - mistakeCategoryCounts[a]);

    // 6. Forgetting Risk & Revision Due
    const dueRevisions = revisionQueue.filter((r) => r.status === 'due' || r.forgettingRisk === 'high' || r.forgettingRisk === 'critical');
    const forgettingRisk: ForgettingRisk =
      dueRevisions.length >= 4 ? 'critical' : dueRevisions.length >= 2 ? 'high' : dueRevisions.length === 1 ? 'moderate' : 'low';

    // 7. Learning Velocity & Consistency
    const consistencyScore = streak > 0 ? clampScore(streak * 10, 0) : 0;
    const learningVelocity: 'accelerating' | 'steady' | 'needs_boost' =
      grandTotalQuestions > 0
        ? finalAccuracy >= 75 && streak >= 3
          ? 'accelerating'
          : finalAccuracy >= 55
          ? 'steady'
          : 'needs_boost'
        : 'steady';

    // 8. Confidence Score (0 for new users)
    const unresolvedMistakesCount = mistakes.filter((m) => !m.resolved).length;
    const confidence = grandTotalQuestions > 0
      ? clampScore(finalAccuracy * 0.7 + (100 - unresolvedMistakesCount * 5) * 0.3, 0)
      : 0;

    // 9. Recommended Next Focus
    let recommendedNextFocus = '';
    if (weakTopics.length > 0) {
      const targetWeak = weakTopics[0];
      const prereq = checkPrerequisitesForTopic(targetWeak);
      if (prereq && prereq.prerequisiteTopicNames.length > 0) {
        recommendedNextFocus = `Prerequisite for ${targetWeak}: ${prereq.prerequisiteTopicNames[0]}`;
      } else {
        recommendedNextFocus = targetWeak;
      }
    } else if (dueRevisions.length > 0) {
      recommendedNextFocus = `Spaced Revision: ${dueRevisions[0].topicName}`;
    }

    // 10. Estimated Exam Score (0 for fresh users)
    let estimatedExamScore = 0;
    if (grandTotalQuestions > 0) {
      const examScoreBase = examAttempts.length > 0
        ? (examAttempts[0].accuracy * 0.5 + finalMastery * 0.5)
        : Math.round(finalMastery * 0.92 + 5);
      estimatedExamScore = clampScore(examScoreBase, 0);
    }

    const questionDifficultyLevel: DifficultyLevel =
      finalMastery >= 80 ? 'challenge' : finalMastery >= 65 ? 'hard' : finalMastery >= 45 ? 'medium' : 'easy';

    return {
      userId,
      classLevel,
      board,
      overallMastery: finalMastery,
      masteryScore: finalMastery,
      accuracy: finalAccuracy,
      accuracyScore: finalAccuracy,
      confidence,
      confidenceScore: confidence,
      averageSolveTime,
      averageSolveTimeSeconds: averageSolveTime,
      forgettingRisk,
      questionDifficultyLevel,
      strongTopics,
      weakTopics,
      developingTopics,
      needsRevisionTopics,
      dueRevisionTopics: dueRevisions.map((r) => r.topicName),
      commonMistakeTypes,
      learningVelocity,
      consistencyScore,
      subjectMastery,
      chapterMastery: {},
      topicMastery: topicMasteryMap,
      estimatedExamScore,
      recommendedNextFocus,
      recentMistakes: mistakes.slice(0, 5).map((m) => ({
        questionText: m.question,
        concept: m.topic,
        mistakeType: m.mistakeType,
        timestamp: m.createdAt,
      })),
      lastUpdated: new Date().toISOString(),
      lastCalculated: new Date().toISOString(),
    };
  }
}
