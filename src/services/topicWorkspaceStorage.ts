import { TopicWorkspaceItem, TopicProgressMetrics } from '../types/workspace';
import { safeGetStorage, safeSetStorage } from '../utils/storage';

const STORAGE_KEY_TOPICS = 'studypilot_topic_workspaces';

/**
 * Calculates dynamic Topic Mastery % and progress metrics based on activity completion.
 */
export function calculateTopicProgress(topic: TopicWorkspaceItem): TopicWorkspaceItem {
  const hasNotes = Boolean(
    (topic.notes.aiGeneratedText && topic.notes.aiGeneratedText.trim().length > 20) ||
    (topic.notes.studentManualText && topic.notes.studentManualText.trim().length > 20) ||
    (topic.uploadedFiles && topic.uploadedFiles.length > 0)
  );

  const hasExplanation = Boolean(
    (topic.selfExplanation.writtenText && topic.selfExplanation.writtenText.trim().length > 15) ||
    topic.selfExplanation.mediaUrl ||
    topic.selfExplanation.checkResult
  );

  const totalQuestions = topic.questionBank.questions.length;
  const attemptedQuestions = topic.questionBank.questions.filter((q) => q.isAttempted).length;
  const correctQuestions = topic.questionBank.questions.filter((q) => q.isAttempted && q.isCorrect).length;

  const quizScorePercent = attemptedQuestions > 0 ? Math.round((correctQuestions / attemptedQuestions) * 100) : 0;

  const flashcardsTotal = topic.activeRecall.flashcards.length;
  const flashcardsMastered = topic.activeRecall.flashcards.filter((f) => f.userRating === 'got_it').length;
  const recallScorePercent = flashcardsTotal > 0 ? Math.round((flashcardsMastered / flashcardsTotal) * 100) : 0;

  const hasRevision = Boolean(topic.revision.latestSheet);

  // Weightings:
  // Notes setup: 20%
  // Self Explanation: 20%
  // Practice Questions: 30%
  // Active Recall: 20%
  // Revision Sheet: 10%

  let masteryScore = 0;
  if (hasNotes) masteryScore += 20;
  if (hasExplanation) masteryScore += 20;

  if (attemptedQuestions > 0) {
    const questionWeight = Math.min(1, attemptedQuestions / 5); // caps at 5 attempted questions
    masteryScore += Math.round(20 * questionWeight + 10 * (quizScorePercent / 100));
  }

  if (flashcardsTotal > 0) {
    masteryScore += Math.round(20 * (recallScorePercent / 100));
  }

  if (hasRevision) masteryScore += 10;

  masteryScore = Math.min(100, Math.max(0, masteryScore));

  const weakAreasSet = new Set<string>();
  topic.questionBank.questions
    .filter((q) => q.isAttempted && !q.isCorrect)
    .forEach((q) => {
      weakAreasSet.add(q.type.replace('_', ' ').toUpperCase());
    });
  topic.activeRecall.weakConcepts.forEach((wc) => weakAreasSet.add(wc));

  if (topic.selfExplanation.checkResult?.missingConcepts) {
    topic.selfExplanation.checkResult.missingConcepts.forEach((mc) => weakAreasSet.add(mc));
  }

  let revisionStatus: 'Not Started' | 'In Progress' | 'Exam Ready' = 'Not Started';
  if (masteryScore >= 80) {
    revisionStatus = 'Exam Ready';
  } else if (masteryScore > 20) {
    revisionStatus = 'In Progress';
  }

  const updatedMetrics: TopicProgressMetrics = {
    notesCompleted: hasNotes,
    explanationCompleted: hasExplanation,
    questionsAttempted: attemptedQuestions,
    totalQuestions,
    quizScorePercent,
    weakAreas: Array.from(weakAreasSet).slice(0, 5),
    revisionStatus,
    masteryPercentage: masteryScore,
  };

  return {
    ...topic,
    masteryScore,
    progressMetrics: updatedMetrics,
    updatedAt: new Date().toISOString(),
  };
}

export function createNewTopicWorkspace(params: {
  topicName: string;
  subject: string;
  classLevel: string;
  chapter: string;
  userId?: string;
}): TopicWorkspaceItem {
  const now = new Date().toISOString();
  const id = `topic_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const newTopic: TopicWorkspaceItem = {
    id,
    userId: params.userId || 'guest_user',
    topicName: params.topicName.trim(),
    subject: params.subject.trim(),
    classLevel: params.classLevel.trim(),
    chapter: params.chapter.trim(),
    createdAt: now,
    updatedAt: now,
    isBookmarked: false,
    masteryScore: 10,
    lastActivityTab: 'learn',
    notes: {
      aiGeneratedText: '',
      studentManualText: '',
      noteType: 'detailed',
    },
    uploadedFiles: [],
    selfExplanation: {
      writtenText: '',
    },
    questionBank: {
      questions: [],
      difficulty: 'medium',
      questionCount: 5,
      sourceFilter: 'all',
    },
    activeRecall: {
      flashcards: [],
      attemptsCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      weakConcepts: [],
    },
    revision: {
      history: [],
    },
    progressMetrics: {
      notesCompleted: false,
      explanationCompleted: false,
      questionsAttempted: 0,
      totalQuestions: 0,
      quizScorePercent: 0,
      weakAreas: [],
      revisionStatus: 'Not Started',
      masteryPercentage: 10,
    },
  };

  return calculateTopicProgress(newTopic);
}

export function getAllTopicWorkspaces(): TopicWorkspaceItem[] {
  const rawData = safeGetStorage(STORAGE_KEY_TOPICS);
  let topics: TopicWorkspaceItem[] = [];
  if (rawData) {
    try {
      topics = JSON.parse(rawData);
    } catch (e) {
      console.warn('Failed to parse topic workspaces JSON:', e);
    }
  }

  if (!topics || topics.length === 0) {
    // Generate an initial sample topic for immediate rich experience
    const initialTopic = createNewTopicWorkspace({
      topicName: 'Connective Tissue',
      subject: 'Science',
      classLevel: 'Class 9',
      chapter: 'Tissues',
    });

    initialTopic.definitionBreakdown = {
      formalDefinition: 'Connective tissue is a fundamental animal tissue composed of cells embedded within an abundant extracellular matrix, serving to connect, bind, support, and anchor organs and tissues throughout the body.',
      keyUses: [
        'Structural Framework: Connects muscles to bones (tendons) and bones to bones (ligaments) at joints.',
        'Internal Transport & Defense: Delivers oxygen, nutrients, and immune cells throughout organs via blood and lymph.',
        'Thermal Insulation & Cushioning: Stores energy and protects delicate internal organs via adipose tissue.',
      ],
      solvedExamples: [
        {
          title: 'Example 1: Tendon vs. Ligament Attachment',
          explanation: 'When walking, skeletal muscles contract and pull on tough tendons to move bones, while elastic ligaments hold bones securely aligned at knee and ankle joints.',
          calculationOrSteps: 'Key Rule: Tendon = Muscle-to-Bone (High tensile strength) | Ligament = Bone-to-Bone (High elasticity)',
        },
        {
          title: 'Example 2: Bone Matrix Mineral Composition',
          explanation: 'Mammalian bone cells (osteocytes) reside inside a rigid extracellular matrix hardened by inorganic mineral salts.',
          calculationOrSteps: 'Composition: ~65% Calcium & Phosphorus inorganic salts + ~35% organic collagen fibers.',
        },
      ],
      quickSummary: 'Connective tissue binds, anchors, and supports body structures using specialized cells in an extracellular matrix.',
      coreConcepts: [
        'Abundant extracellular matrix composed of ground substance and protein fibers.',
        'Includes Loose (Areolar, Adipose), Dense (Tendons, Ligaments), Fluid (Blood), and Skeletal (Bone, Cartilage).',
      ],
      keyFormulasOrRules: [
        'Rule 1: Tendons join Muscle to Bone.',
        'Rule 2: Ligaments join Bone to Bone.',
      ],
      realWorldExamples: [
        'Achilles tendon connecting calf muscles to the heel bone.',
        'Blubber layer under whale skin for thermal insulation.',
      ],
      commonExamPoints: [
        'Differentiate between tendon and ligament based on elasticity and function.',
        'Identify blood plasma as the non-cellular fluid matrix.',
      ],
    };

    initialTopic.notes.aiGeneratedText = `# Connective Tissue Overview
Connective tissue is one of the four main types of animal tissue. It supports, connects, or separates different types of tissues and organs in the body.

## Key Characteristics:
- **Extracellular Matrix:** Abundant non-living substance composed of fibers and ground substance.
- **Cells:** Embedded within the matrix (e.g., Fibroblasts, Adipocytes, Chondrocytes, Osteocytes, RBCs/WBCs).
- **Vascularity:** Highly vascularized (except cartilage and tendons).

## Types of Connective Tissue:
1. **Connective Tissue Proper:**
   - *Loose:* Areolar (packs organs) and Adipose (fat storage & thermal insulation).
   - *Dense:* Tendons (connects muscle to bone) & Ligaments (connects bone to bone).
2. **Fluid Connective Tissue:** Blood (plasma, RBCs, WBCs, platelets) and Lymph.
3. **Skeletal Connective Tissue:** Bone (hard matrix rich in Calcium & Phosphorus) and Cartilage (flexible matrix of protein & sugar).`;

    initialTopic.notes.studentManualText = `My Class Notes:
Remember:
- Tendon = Muscle to Bone (TMB)
- Ligament = Bone to Bone (LBB)
- Bone matrix is hard because of Calcium and Phosphorus salts!
- Blood is a fluid connective tissue with NO fibers in normal state.`;

    initialTopic.notes.diagramConceptMap = `
\`\`\`
[CONNECTIVE TISSUE]
  │
  ├──► PROPER ────────► Areolar & Adipose / Tendons & Ligaments
  ├──► FLUID  ────────► Blood & Lymph
  └──► SKELETAL ──────► Bone & Cartilage
\`\`\``;

    initialTopic.questionBank.questions = [
      {
        id: 'q1',
        type: 'mcq',
        question: 'Which of the following connects a bone to another bone?',
        options: ['Tendon', 'Ligament', 'Areolar tissue', 'Cartilage'],
        correctAnswer: 'Ligament',
        explanation: 'Ligaments are strong dense fibrous tissues that join bone to bone at joints.',
        difficulty: 'easy',
        userAnswer: 'Ligament',
        isCorrect: true,
        isAttempted: true,
      },
      {
        id: 'q2',
        type: 'mcq',
        question: 'Which matrix constituent is abundant in mammalian bone tissue?',
        options: ['Calcium & Phosphorus salts', 'Sodium & Potassium', 'Pure Collagen fibers only', 'Fatty acids'],
        correctAnswer: 'Calcium & Phosphorus salts',
        explanation: 'Bone cells (osteocytes) are embedded in a hard matrix composed mainly of Calcium and Phosphorus.',
        difficulty: 'medium',
        userAnswer: 'Calcium & Phosphorus salts',
        isCorrect: true,
        isAttempted: true,
      },
      {
        id: 'q3',
        type: 'short',
        question: 'Differentiate between Tendon and Ligament based on structure and function.',
        correctAnswer: 'Tendons connect muscles to bones and are tough/non-flexible. Ligaments connect bones to bones and are elastic with high flexibility.',
        explanation: 'Tendons possess high tensile strength with limited elasticity, whereas ligaments exhibit high elasticity.',
        difficulty: 'medium',
        isAttempted: false,
      },
    ];

    initialTopic.activeRecall.flashcards = [
      {
        id: 'f1',
        frontPrompt: 'What type of connective tissue stores fat and acts as an insulator?',
        backAnswer: 'Adipose Tissue (located beneath the skin and around internal organs).',
        userRating: 'got_it',
        attemptsCount: 1,
      },
      {
        id: 'f2',
        frontPrompt: 'Why is blood classified as a fluid connective tissue?',
        backAnswer: 'Because it has a fluid matrix called plasma in which RBCs, WBCs, and platelets float.',
        userRating: 'got_it',
        attemptsCount: 1,
      },
      {
        id: 'f3',
        frontPrompt: 'What cells compose cartilage tissue?',
        backAnswer: 'Chondrocytes embedded in a solid but pliable matrix.',
        attemptsCount: 0,
      },
    ];

    const processed = calculateTopicProgress(initialTopic);
    safeSetStorage(STORAGE_KEY_TOPICS, JSON.stringify([processed]));
    return [processed];
  }

  return topics;
}

export function saveTopicWorkspace(topic: TopicWorkspaceItem): TopicWorkspaceItem {
  const currentList = getAllTopicWorkspaces();
  const updatedTopic = calculateTopicProgress(topic);

  const existingIndex = currentList.findIndex((t) => t.id === updatedTopic.id);
  if (existingIndex >= 0) {
    currentList[existingIndex] = updatedTopic;
  } else {
    currentList.unshift(updatedTopic);
  }

  safeSetStorage(STORAGE_KEY_TOPICS, JSON.stringify(currentList));
  return updatedTopic;
}

export function deleteTopicWorkspace(id: string): void {
  const currentList = getAllTopicWorkspaces();
  const filtered = currentList.filter((t) => t.id !== id);
  safeSetStorage(STORAGE_KEY_TOPICS, JSON.stringify(filtered));
}

export function getTopicWorkspaceById(id: string): TopicWorkspaceItem | null {
  const topics = getAllTopicWorkspaces();
  return topics.find((t) => t.id === id) || null;
}
