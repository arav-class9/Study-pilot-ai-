import { TopicPrerequisite } from '../types';

export const TOPIC_PREREQUISITES: TopicPrerequisite[] = [
  // Math Class 10
  {
    topicId: 'top-c10-quad-1',
    topicName: 'Quadratic Equations & Discriminant',
    prerequisiteTopicIds: ['top-c10-poly-1', 'top-c9-alg-1'],
    prerequisiteTopicNames: ['Polynomials & Factorisation', 'Linear Equations in Two Variables'],
    subjectId: 'math',
    classLevel: '10',
    advisoryNote: 'Before mastering Quadratic Equations, ensure confidence in splitting the middle term and algebraic identities.',
  },
  {
    topicId: 'top-c10-ap-1',
    topicName: 'Arithmetic Progressions & Sum of n Terms',
    prerequisiteTopicIds: ['top-c9-seq-1', 'top-c10-lin-1'],
    prerequisiteTopicNames: ['Linear Equations in Two Variables', 'Number Patterns & Sequences'],
    subjectId: 'math',
    classLevel: '10',
    advisoryNote: 'Before solving complex AP word problems, review general term substitutions and linear equation solving.',
  },
  {
    topicId: 'top-c10-trig-1',
    topicName: 'Introduction to Trigonometry & Identities',
    prerequisiteTopicIds: ['top-c10-tri-1', 'top-c9-geom-1'],
    prerequisiteTopicNames: ['Similar Triangles', 'Pythagoras Theorem'],
    subjectId: 'math',
    classLevel: '10',
    advisoryNote: 'Trigonometric ratios rely heavily on Pythagoras theorem and right-angled triangle properties.',
  },
  {
    topicId: 'top-c10-trig-app-1',
    topicName: 'Applications of Trigonometry (Heights and Distances)',
    prerequisiteTopicIds: ['top-c10-trig-1'],
    prerequisiteTopicNames: ['Introduction to Trigonometry & Identities'],
    subjectId: 'math',
    classLevel: '10',
    advisoryNote: 'Master exact values of tan 30°, tan 45°, and tan 60° before attempting double-angle elevation problems.',
  },
  // Science Class 10
  {
    topicId: 'top-c10-light-3',
    topicName: 'Lenses & Lens Formula',
    prerequisiteTopicIds: ['top-c10-light-1', 'top-c10-light-2'],
    prerequisiteTopicNames: ['Spherical Mirrors & Ray Diagrams', 'Refraction & Snell’s Law'],
    subjectId: 'science',
    classLevel: '10',
    advisoryNote: 'Before calculating lens power and focal length, verify mastery of Cartesian sign conventions from spherical mirrors.',
  },
  {
    topicId: 'top-c10-elec-2',
    topicName: 'Resistors in Series & Parallel Combination',
    prerequisiteTopicIds: ['top-c10-elec-1'],
    prerequisiteTopicNames: ['Electric Current & Ohm’s Law (V = IR)'],
    subjectId: 'science',
    classLevel: '10',
    advisoryNote: 'Ensure solid understanding of Ohm’s Law (V = IR) and current conservation at junctions before calculating equivalent resistance.',
  },
  {
    topicId: 'top-c10-elec-3',
    topicName: 'Heating Effect of Current & Electric Power (P = VI)',
    prerequisiteTopicIds: ['top-c10-elec-1', 'top-c10-elec-2'],
    prerequisiteTopicNames: ['Ohm’s Law & Resistance Factors', 'Resistors in Series & Parallel'],
    subjectId: 'science',
    classLevel: '10',
    advisoryNote: 'Joule’s heating effect derives from work done W = VQ = VIt. Review electric potential definition.',
  },
  {
    topicId: 'top-c10-chem-2',
    topicName: 'Acids, Bases and Salts & pH Scale',
    prerequisiteTopicIds: ['top-c10-chem-1'],
    prerequisiteTopicNames: ['Chemical Reactions & Balancing Equations'],
    subjectId: 'science',
    classLevel: '10',
    advisoryNote: 'Master balancing chemical equations and neutralization reaction types before predicting salt hydrolysis outcomes.',
  },
  {
    topicId: 'top-c10-carbon-1',
    topicName: 'Carbon & its Compounds (Covalent Bonding & Functional Groups)',
    prerequisiteTopicIds: ['top-c10-chem-1', 'top-c9-atom-1'],
    prerequisiteTopicNames: ['Atomic Structure & Valency', 'Chemical Reactions & Equations'],
    subjectId: 'science',
    classLevel: '10',
    advisoryNote: 'Review electronic configuration and octet rule before drawing electron dot structures of hydrocarbons.',
  },
  // Class 9 Science
  {
    topicId: 'top-c9-force-1',
    topicName: 'Newton’s Laws of Motion & Momentum',
    prerequisiteTopicIds: ['top-c9-mot-1'],
    prerequisiteTopicNames: ['Motion & Kinematic Equations (v = u + at, s = ut + 1/2at²)'],
    subjectId: 'science',
    classLevel: '9',
    advisoryNote: 'Equations of motion are essential to compute acceleration for F = ma problems.',
  },
  {
    topicId: 'top-c9-work-1',
    topicName: 'Work, Kinetic & Gravitational Potential Energy',
    prerequisiteTopicIds: ['top-c9-force-1', 'top-c9-mot-1'],
    prerequisiteTopicNames: ['Newton’s Second Law (F = ma)', 'Kinematic Equations'],
    subjectId: 'science',
    classLevel: '9',
    advisoryNote: 'Work-energy theorem derives directly from v² - u² = 2as multiplied by force m.',
  },
  {
    topicId: 'top-c9-grav-1',
    topicName: 'Universal Law of Gravitation & Free Fall (g)',
    prerequisiteTopicIds: ['top-c9-force-1'],
    prerequisiteTopicNames: ['Newton’s Third Law of Motion & Forces'],
    subjectId: 'science',
    classLevel: '9',
    advisoryNote: 'Gravitational force is an action-reaction pair between two point masses. Review inverse square dependencies.',
  },
];

/**
 * Finds prerequisites for a struggling topic and returns advisories
 */
export function checkPrerequisitesForTopic(topicNameOrId: string, currentAccuracy: number = 50): TopicPrerequisite | null {
  const normalized = topicNameOrId.toLowerCase().trim();
  const match = TOPIC_PREREQUISITES.find(
    (p) =>
      p.topicId.toLowerCase() === normalized ||
      p.topicName.toLowerCase().includes(normalized) ||
      normalized.includes(p.topicName.toLowerCase())
  );
  return match || null;
}
