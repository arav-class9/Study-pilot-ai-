import { ClassLevel, SubjectId, DifficultyLevel } from '../types';

export interface BankQuestion {
  id: string;
  classLevel: ClassLevel;
  board: string;
  subjectId: SubjectId;
  chapterId?: string;
  chapterName: string;
  topicName: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  correctAnswer: string;
  explanation: string;
  concept: string;
  difficulty: DifficultyLevel;
  questionType?: 'mcq' | 'numerical' | 'assertion_reason' | 'conceptual';
  estimatedSolvingTimeSeconds?: number;
  source?: string;
  tags?: string[];
  prerequisiteConcepts?: string[];
  qualityStatus?: 'verified' | 'needs_review';
  hint?: string;
}

export const QUESTION_BANK: BankQuestion[] = [
  // Class 10 Science - Chemical Reactions & Equations
  {
    id: 'qb-c10-sci-1',
    classLevel: '10',
    board: 'CBSE',
    subjectId: 'science',
    chapterName: 'Chemical Reactions and Equations',
    topicName: 'Types of Chemical Reactions',
    question: 'When white silver chloride (AgCl) is exposed to sunlight for a long duration, it turns grey due to which type of reaction?',
    options: [
      'Decomposition of silver chloride into silver and chlorine gas by light',
      'Sublimation of silver chloride',
      'Combination of silver with atmospheric oxygen',
      'Oxidation of chlorine gas into chloride ions',
    ],
    correctAnswerIndex: 0,
    correctAnswer: 'Decomposition of silver chloride into silver and chlorine gas by light',
    explanation: '2AgCl(s) exposed to sunlight decomposes photochemically into grey metallic silver (2Ag) and pungent chlorine gas (Cl₂). This is a photolytic decomposition reaction used in black-and-white photography.',
    concept: 'Photolytic Decomposition',
    difficulty: 'medium',
    hint: 'Think of sunlight breaking the bond between silver and chlorine.',
  },
  {
    id: 'qb-c10-sci-2',
    classLevel: '10',
    board: 'CBSE',
    subjectId: 'science',
    chapterName: 'Chemical Reactions and Equations',
    topicName: 'Balancing Chemical Equations',
    question: 'What are the stoichiometric coefficients a, b, c, d in the balanced reaction: a Fe + b H₂O -> c Fe₃O₄ + d H₂?',
    options: ['3, 4, 1, 4', '2, 3, 1, 3', '3, 2, 1, 2', '1, 4, 1, 4'],
    correctAnswerIndex: 0,
    correctAnswer: '3, 4, 1, 4',
    explanation: 'Balancing Fe: 3 on left gives 1 Fe₃O₄ on right (3 Fe). Balancing Oxygen: 4 oxygen in Fe₃O₄ requires 4 H₂O on left. Balancing Hydrogen: 4 H₂O gives 8 H, needing 4 H₂ on right. Hence: 3Fe + 4H₂O -> Fe₃O₄ + 4H₂.',
    concept: 'Mass Conservation in Balancing Equations',
    difficulty: 'medium',
    hint: 'Balance Fe and O atoms first before hydrogen.',
  },
  {
    id: 'qb-c10-sci-3',
    classLevel: '10',
    board: 'CBSE',
    subjectId: 'science',
    chapterName: 'Acids, Bases and Salts',
    topicName: 'pH Scale & Industrial Salts',
    question: 'What is the chemical formula and common name of Plaster of Paris (POP)?',
    options: [
      'CaSO₄ · (1/2)H₂O (Calcium Sulphate Hemihydrate)',
      'CaSO₄ · 2H₂O (Gypsum)',
      'CaCO₃ (Calcium Carbonate)',
      'CaOCl₂ (Bleaching Powder)',
    ],
    correctAnswerIndex: 0,
    correctAnswer: 'CaSO₄ · (1/2)H₂O (Calcium Sulphate Hemihydrate)',
    explanation: 'Plaster of Paris is Calcium Sulphate Hemihydrate (CaSO₄·(1/2)H₂O), prepared by heating Gypsum (CaSO₄·2H₂O) at 373 K (100°C). When mixed with water, it re-solidifies into gypsum.',
    concept: 'Water of Crystallization & Plaster of Paris',
    difficulty: 'easy',
    hint: 'It has half a molecule of water per CaSO₄ unit.',
  },
  {
    id: 'qb-c10-sci-4',
    classLevel: '10',
    board: 'CBSE',
    subjectId: 'science',
    chapterName: 'Life Processes',
    topicName: 'Cardiovascular Circulation & Nephron Physiology',
    question: 'In human heart circulation, which chamber pumps oxygenated blood to the entire body through the aorta?',
    options: ['Left Ventricle', 'Right Ventricle', 'Left Atrium', 'Right Atrium'],
    correctAnswerIndex: 0,
    correctAnswer: 'Left Ventricle',
    explanation: 'The left ventricle has the thickest muscular wall because it must generate high pressure to pump oxygenated blood through the aorta into systemic circulation across all body tissues.',
    concept: 'Double Circulation & Cardiac Mechanics',
    difficulty: 'medium',
    hint: 'It has the thickest muscular myocardium.',
  },
  {
    id: 'qb-c10-sci-5',
    classLevel: '10',
    board: 'CBSE',
    subjectId: 'science',
    chapterName: 'Electricity',
    topicName: 'Ohm’s Law & Series/Parallel Circuits',
    question: 'A wire of resistance R is cut into 5 equal parts. These 5 parts are then connected in parallel. If the equivalent resistance is R′, what is the ratio R / R′?',
    options: ['25', '5', '1/5', '1/25'],
    correctAnswerIndex: 0,
    correctAnswer: '25',
    explanation: 'Each equal part has resistance r = R/5. When 5 such resistors are connected in parallel: 1/R′ = 1/r + 1/r + 1/r + 1/r + 1/r = 5/r = 5/(R/5) = 25/R. Therefore, R′ = R/25, which gives the ratio R / R′ = 25.',
    concept: 'Parallel Resistor Network Scaling',
    difficulty: 'hard',
    hint: 'Each segment has R/5 resistance. Combine them in parallel.',
  },
  {
    id: 'qb-c10-sci-6',
    classLevel: '10',
    board: 'CBSE',
    subjectId: 'science',
    chapterName: 'Light — Reflection and Refraction',
    topicName: 'Mirror Formula & Power in Dioptres',
    question: 'A convex lens of focal length f = +25 cm has its optical power equal to:',
    options: ['+4.0 D', '-4.0 D', '+0.25 D', '+2.5 D'],
    correctAnswerIndex: 0,
    correctAnswer: '+4.0 D',
    explanation: 'Power of a lens P = 1 / f (in metres). Converting 25 cm to metres: f = 0.25 m. Hence, P = 1 / 0.25 = +4.0 Dioptres (D).',
    concept: 'Lens Power Calculation',
    difficulty: 'medium',
    hint: 'Convert focal length to metres before taking reciprocal.',
  },

  // Class 10 Math
  {
    id: 'qb-c10-math-1',
    classLevel: '10',
    board: 'CBSE',
    subjectId: 'math',
    chapterName: 'Real Numbers',
    topicName: 'Fundamental Theorem & Irrationality Proofs',
    question: 'If HCF(306, 657) = 9, what is the LCM(306, 657)?',
    options: ['22338', '22383', '23238', '21338'],
    correctAnswerIndex: 0,
    correctAnswer: '22338',
    explanation: 'Using the fundamental relation: HCF(a, b) × LCM(a, b) = a × b. Therefore, LCM(306, 657) = (306 × 657) / 9 = 34 × 657 = 22338.',
    concept: 'HCF-LCM Product Formula',
    difficulty: 'medium',
    hint: 'Product of two numbers equals product of their HCF and LCM.',
  },
  {
    id: 'qb-c10-math-2',
    classLevel: '10',
    board: 'CBSE',
    subjectId: 'math',
    chapterName: 'Quadratic Equations',
    topicName: 'Quadratic Formula & Nature of Roots',
    question: 'What is the condition on discriminant D = b² - 4ac for quadratic equation ax² + bx + c = 0 to have real and equal roots?',
    options: ['D = 0', 'D > 0', 'D < 0', 'D ≤ 0'],
    correctAnswerIndex: 0,
    correctAnswer: 'D = 0',
    explanation: 'When discriminant D = b² - 4ac = 0, the quadratic formula roots x = (-b ± √D)/(2a) collapse to x = -b / (2a), giving two real and coincident (equal) roots.',
    concept: 'Discriminant and Root Multiplicity',
    difficulty: 'easy',
    hint: 'The term under the square root must vanish.',
  },
  {
    id: 'qb-c10-math-3',
    classLevel: '10',
    board: 'CBSE',
    subjectId: 'math',
    chapterName: 'Arithmetic Progressions (AP)',
    topicName: 'nth Term and Sum of AP Series',
    question: 'What is the 20th term of the arithmetic progression: 4, 9, 14, 19, ...?',
    options: ['99', '95', '104', '100'],
    correctAnswerIndex: 0,
    correctAnswer: '99',
    explanation: 'First term a = 4, common difference d = 9 - 4 = 5. nth term formula: a_n = a + (n - 1)d. For n = 20: a₂₀ = 4 + (20 - 1) × 5 = 4 + 19 × 5 = 4 + 95 = 99.',
    concept: 'General Term of AP',
    difficulty: 'easy',
    hint: 'Use a_n = a + (n - 1)d.',
  },
  {
    id: 'qb-c10-math-4',
    classLevel: '10',
    board: 'CBSE',
    subjectId: 'math',
    chapterName: 'Introduction to Trigonometry & Heights and Distances',
    topicName: 'Trigonometric Identities & Standard Angles',
    question: 'If sin θ = 3/5 in a right triangle, what is the value of (1 + tan² θ)?',
    options: ['25/16', '16/25', '9/16', '25/9'],
    correctAnswerIndex: 0,
    correctAnswer: '25/16',
    explanation: 'Using the fundamental trigonometric identity: 1 + tan² θ = sec² θ = 1 / cos² θ. Since sin θ = 3/5, cos θ = √(1 - sin² θ) = √(1 - 9/25) = 4/5. Thus sec θ = 5/4, and sec² θ = 25/16.',
    concept: 'Pythagorean Trigonometric Identities',
    difficulty: 'medium',
    hint: 'Use 1 + tan² θ = sec² θ = 1 / cos² θ.',
  },

  // Class 9 Science
  {
    id: 'qb-c9-sci-1',
    classLevel: '9',
    board: 'CBSE',
    subjectId: 'science',
    chapterName: 'Force and Laws of Motion',
    topicName: 'Newton’s Laws & Momentum Conservation',
    question: 'A vehicle of mass 1000 kg moving at 20 m/s is brought to rest in 5 seconds. What is the average braking force applied?',
    options: ['4000 N', '2000 N', '5000 N', '10000 N'],
    correctAnswerIndex: 0,
    correctAnswer: '4000 N',
    explanation: 'Acceleration a = (v - u) / t = (0 - 20) / 5 = -4 m/s² (retardation). By Newton’s second law: Force F = m × a = 1000 kg × 4 m/s² = 4000 N.',
    concept: 'Newton’s Second Law of Motion',
    difficulty: 'medium',
    hint: 'Find acceleration first, then multiply with mass.',
  },
  {
    id: 'qb-c9-sci-2',
    classLevel: '9',
    board: 'CBSE',
    subjectId: 'science',
    chapterName: 'Atoms and Molecules',
    topicName: 'Chemical Formulas & Mole Calculations',
    question: 'How many moles are present in 44 grams of Carbon Dioxide (CO₂)? (Molar mass: C=12 u, O=16 u)',
    options: ['1 mole', '2 moles', '0.5 mole', '44 moles'],
    correctAnswerIndex: 0,
    correctAnswer: '1 mole',
    explanation: 'Molar mass of CO₂ = 12 + 2 × 16 = 44 g/mol. Number of moles n = Given mass (m) / Molar mass (M) = 44 / 44 = 1 mole (containing 6.022 × 10²³ molecules).',
    concept: 'Molar Mass & Mole Definition',
    difficulty: 'easy',
    hint: 'Calculate molar mass by summing atomic weights.',
  },

  // Class 8 Science & Math
  {
    id: 'qb-c8-sci-1',
    classLevel: '8',
    board: 'CBSE',
    subjectId: 'science',
    chapterName: 'Force and Pressure',
    topicName: 'Pressure, Thrust & Hydraulic Forces',
    question: 'A force of 150 N is applied perpendicular to an area of 0.5 m². What is the resulting pressure exerted on the surface?',
    options: ['300 Pa', '75 Pa', '150 Pa', '600 Pa'],
    correctAnswerIndex: 0,
    correctAnswer: '300 Pa',
    explanation: 'Pressure = Force / Area = 150 N / 0.5 m² = 300 N/m² = 300 Pascals (Pa).',
    concept: 'Definition of Pressure',
    difficulty: 'easy',
    hint: 'Pressure equals Force divided by Area.',
  },
  {
    id: 'qb-c8-math-1',
    classLevel: '8',
    board: 'CBSE',
    subjectId: 'math',
    chapterName: 'Rational Numbers',
    topicName: 'Algebraic Properties of Rational Numbers',
    question: 'What is the multiplicative inverse (reciprocal) of -5/9?',
    options: ['-9/5', '9/5', '5/9', '-5/9'],
    correctAnswerIndex: 0,
    correctAnswer: '-9/5',
    explanation: 'The multiplicative inverse of a non-zero rational number a/b is b/a such that (a/b) × (b/a) = 1. Hence the reciprocal of -5/9 is -9/5.',
    concept: 'Multiplicative Inverse of Fractions',
    difficulty: 'easy',
    hint: 'Swap numerator and denominator while keeping sign.',
  },

  // Class 6 & 7 Math & Science
  {
    id: 'qb-c7-sci-1',
    classLevel: '7',
    board: 'CBSE',
    subjectId: 'science',
    chapterName: 'Nutrition in Plants and Animals',
    topicName: 'Photosynthesis & Human Alimentary Canal',
    question: 'Which green pigment in chloroplasts absorbs solar energy for photosynthesis?',
    options: ['Chlorophyll', 'Xanthophyll', 'Carotene', 'Hemoglobin'],
    correctAnswerIndex: 0,
    correctAnswer: 'Chlorophyll',
    explanation: 'Chlorophyll is the green pigment located within plant chloroplast thylakoids that traps photons from sunlight to drive water photolysis and glucose synthesis.',
    concept: 'Chloroplast Pigments',
    difficulty: 'easy',
    hint: 'It gives leaves their characteristic green color.',
  },
  {
    id: 'qb-c6-math-1',
    classLevel: '6',
    board: 'CBSE',
    subjectId: 'math',
    chapterName: 'Playing with Numbers (Factors & Multiples)',
    topicName: 'HCF and LCM & Divisibility Rules',
    question: 'What is the Least Common Multiple (LCM) of 12 and 18?',
    options: ['36', '72', '6', '54'],
    correctAnswerIndex: 0,
    correctAnswer: '36',
    explanation: 'Prime factorization: 12 = 2² × 3, 18 = 2 × 3². LCM is product of highest powers of prime factors = 2² × 3² = 4 × 9 = 36.',
    concept: 'LCM by Prime Factorization',
    difficulty: 'easy',
    hint: 'Multiples of 18 are 18, 36, 54. Check which divides by 12.',
  },

  // Class 11 & 12 Physics & Chemistry
  {
    id: 'qb-c12-phy-1',
    classLevel: '12',
    board: 'CBSE',
    subjectId: 'physics',
    chapterName: 'Electric Charges and Fields & Gauss’s Law',
    topicName: 'Coulomb’s Law & Gauss’s Theorem Applications',
    question: 'What is the electric flux through a closed Gaussian surface enclosing a net electric dipole of charge +q and -q?',
    options: ['Zero', 'q / ε₀', '2q / ε₀', 'q / (2ε₀)'],
    correctAnswerIndex: 0,
    correctAnswer: 'Zero',
    explanation: 'According to Gauss’s Law: Total electric flux Φ = Q_enclosed / ε₀. For an electric dipole, the total enclosed charge Q_enclosed = (+q) + (-q) = 0. Therefore, net flux is strictly zero.',
    concept: 'Gauss’s Law & Dipole Flux',
    difficulty: 'medium',
    hint: 'Calculate net enclosed charge inside the closed surface.',
  },
  {
    id: 'qb-c12-chem-1',
    classLevel: '12',
    board: 'CBSE',
    subjectId: 'chemistry',
    chapterName: 'Solutions and Colligative Properties',
    topicName: 'Colligative Properties & Van ’t Hoff Factor',
    question: 'What is the expected van ’t Hoff factor (i) for complete dissociation of Calcium Chloride (CaCl₂)?',
    options: ['3', '2', '1', '4'],
    correctAnswerIndex: 0,
    correctAnswer: '3',
    explanation: 'CaCl₂ dissociates completely into 1 Ca²⁺ cation and 2 Cl⁻ anions: CaCl₂ -> Ca²⁺ + 2Cl⁻. Total number of ions produced per formula unit n = 1 + 2 = 3. For 100% dissociation (α = 1), i = n = 3.',
    concept: 'Van ’t Hoff Dissociation Factor',
    difficulty: 'medium',
    hint: 'Count the total number of ions formed upon ionization.',
  },
];

/**
 * Filter questions from question bank matching Class, Subject, Chapter, or Difficulty
 */
export function getBankQuestions(params: {
  classLevel?: ClassLevel;
  subjectId?: SubjectId;
  chapterName?: string;
  count?: number;
  difficulty?: DifficultyLevel;
}): BankQuestion[] {
  let matched = QUESTION_BANK.filter((q) => {
    if (params.classLevel && q.classLevel !== params.classLevel) return false;
    if (params.subjectId && q.subjectId !== params.subjectId) return false;
    if (params.chapterName && !q.chapterName.toLowerCase().includes(params.chapterName.toLowerCase())) return false;
    if (params.difficulty && q.difficulty !== params.difficulty) return false;
    return true;
  });

  // If specific filters yield too few results, relax chapter and difficulty filters
  if (matched.length < (params.count || 5)) {
    matched = QUESTION_BANK.filter((q) => {
      if (params.classLevel && q.classLevel !== params.classLevel) return false;
      if (params.subjectId && q.subjectId !== params.subjectId) return false;
      return true;
    });
  }

  // If still empty, return whatever matches classLevel or general bank
  if (matched.length === 0) {
    matched = QUESTION_BANK;
  }

  // Shuffle and slice
  const shuffled = [...matched].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, params.count || 5);
}
