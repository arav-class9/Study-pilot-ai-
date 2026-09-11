import { NCERTChapter, NCERTSubject, NCERTClass, NCERTPageContent } from '../types/ncert';

// Sample Authentic Preloaded NCERT Pages for Class 10 Science - Chapter 1: Chemical Reactions and Equations
export const CLASS_10_SCIENCE_CH1_PAGES: Record<number, NCERTPageContent> = {
  1: {
    pageNumber: 1,
    sectionTitle: '1.1 Chemical Reactions in Daily Life',
    heading: 'Consider these situations of daily life...',
    paragraphs: [
      'Consider the following situations of daily life and think what happens when: milk is left at room temperature during summers, an iron tawa/pan/nail is left exposed to humid atmosphere, grapes get fermented, food is cooked, food gets digested in our body, and we respire.',
      'In all the above situations, the nature and the identity of the initial substance have somewhat changed. We have already learnt about physical and chemical changes of matter in our previous classes. Whenever a chemical change occurs, we can say that a chemical reaction has taken place.',
      'You may perhaps be wondering as to what is actually meant by a chemical reaction. How do we come to know that a chemical reaction has taken place? Let us perform some activities to find the answer to these questions.',
    ],
    keyConcepts: [
      'Chemical change involves formation of one or more new substances with altered properties.',
      'Common everyday examples: souring of milk, rusting of iron, digestion, and respiration.',
      'Physical vs Chemical change distinction in substances.',
    ],
    formulas: [],
    ncertHighlights: [
      'CAUTION: This activity needs the teacher’s assistance. It would be better if students wear suitable eyeglasses.',
      'Clean a magnesium ribbon about 3-4 cm long by rubbing it with sandpaper before burning.',
    ],
    activities: [
      {
        activityNumber: 'Activity 1.1',
        title: 'Burning of a Magnesium Ribbon in Air',
        procedure:
          'Clean a magnesium ribbon about 3-4 cm long with sandpaper. Hold it with a pair of tongs. Burn it using a spirit lamp or burner and collect the ash so formed in a watch glass as shown in Fig. 1.1. Burn the magnesium ribbon keeping it as far as possible from your eyes.',
        observation:
          'Magnesium ribbon burns with a dazzling white flame and changes into a white powder.',
        conclusion:
          'This powder is magnesium oxide. It is formed due to the reaction between magnesium and oxygen present in the air: 2Mg + O₂ → 2MgO.',
      },
    ],
    inTextQuestions: [
      {
        question: 'Why should a magnesium ribbon be cleaned before burning in air?',
        answerHint:
          'To remove the protective layer of basic magnesium carbonate/oxide formed on its surface due to atmospheric exposure.',
      },
    ],
    vocabulary: [
      {
        term: 'Chemical Reaction',
        definition:
          'A process in which one or more substances (reactants) are converted to one or more different substances (products).',
      },
      {
        term: 'Dazzling White Flame',
        definition: 'The intense, bright white glow produced when magnesium oxidizes rapidly in atmospheric oxygen.',
      },
    ],
    diagramNote: 'Fig. 1.1: Burning of a magnesium ribbon in air and collection of magnesium oxide in a watch glass.',
    pageType: 'activity',
  },
  2: {
    pageNumber: 2,
    sectionTitle: '1.2 Determination of Chemical Reactions',
    heading: 'Characteristics of a Chemical Reaction',
    paragraphs: [
      'From the activities, we can say that any of the following observations helps us to determine whether a chemical reaction has taken place: (i) change in state, (ii) change in colour, (iii) evolution of a gas, and (iv) change in temperature.',
      'As we observe the changes around us, we can see that there is a large variety of chemical reactions taking place around us. We will study the various types of chemical reactions and their symbolic representation in this Chapter.',
      'Activity 1.2: Take lead nitrate solution in a test tube. Add potassium iodide solution to this. What do you observe? A yellow precipitate of lead iodide (PbI₂) is formed.',
      'Activity 1.3: Take a few zinc granules in a conical flask or a test tube. Add dilute hydrochloric acid or sulphuric acid to this. Touch the conical flask. A rise in temperature is observed and hydrogen gas bubbles evolve around the zinc granules.',
    ],
    keyConcepts: [
      'Four primary criteria for chemical reaction: change in state, colour, gas evolution, temperature.',
      'Formation of yellow precipitate of Lead Iodide: Pb(NO₃)₂ + 2KI → PbI₂↓ + 2KNO₃.',
      'Exothermic evolution of Hydrogen gas with Zinc and Acid: Zn + H₂SO₄ → ZnSO₄ + H₂↑.',
    ],
    formulas: [
      'Pb(NO₃)₂(aq) + 2KI(aq) → PbI₂(s)↓ + 2KNO₃(aq)',
      'Zn(s) + H₂SO₄(aq) → ZnSO₄(aq) + H₂(g)↑',
    ],
    ncertHighlights: [
      'CAUTION: Handle acid with care! Always pour acid slowly into water, never water into concentrated acid.',
      'The conical flask feels hot to touch, proving that heat is liberated (exothermic process).',
    ],
    activities: [
      {
        activityNumber: 'Activity 1.2',
        title: 'Precipitation Reaction: Lead Nitrate & Potassium Iodide',
        procedure: 'Mix aqueous lead nitrate with aqueous potassium iodide in a test tube.',
        observation: 'An insoluble brilliant yellow precipitate immediately settles.',
        conclusion: 'Double displacement reaction forming insoluble Lead Iodide (PbI₂).',
      },
      {
        activityNumber: 'Activity 1.3',
        title: 'Action of Dilute Acid on Zinc Granules',
        procedure: 'Add dilute sulphuric acid to zinc granules in a flask fitted with a one-hole cork and delivery tube.',
        observation: 'Bubbles of a gas evolve and the flask turns warm.',
        conclusion: 'Zinc displaces hydrogen to form zinc sulphate; the reaction is exothermic.',
      },
    ],
    inTextQuestions: [
      {
        question: 'Which gas is usually liberated when an acid reacts with a metal? Illustrate with an example.',
        answerHint: 'Hydrogen gas (H₂). Test by bringing a burning candle near the gas; it burns with a pop sound.',
      },
    ],
    vocabulary: [
      {
        term: 'Precipitate',
        definition: 'An insoluble solid that emerges from a liquid solution during a chemical reaction.',
      },
      {
        term: 'Exothermic Reaction',
        definition: 'A reaction accompanied by the release of thermal energy (heat).',
      },
    ],
    diagramNote: 'Fig. 1.2: Formation of hydrogen gas by the action of dilute sulphuric acid on zinc granules.',
    pageType: 'theory',
  },
  3: {
    pageNumber: 3,
    sectionTitle: '1.3 Chemical Equations and Balancing',
    heading: 'Writing and Balancing a Chemical Equation',
    paragraphs: [
      'Activity 1.1 can be described as: when a magnesium ribbon is burnt in oxygen, it gets converted to magnesium oxide. This description of a chemical reaction in a sentence form is quite long. It can be written in a shorter form as a word-equation: Magnesium + Oxygen → Magnesium oxide (Reactants → Product).',
      'The substances that undergo chemical change in the reaction, magnesium and oxygen, are the reactants. The new substance, magnesium oxide, formed during the reaction, is the product. A word-equation shows change of reactants to products through an arrow placed between them.',
      'Recall the Law of Conservation of Mass that you studied in Class IX; mass can neither be created nor destroyed in a chemical reaction. That is, the total mass of the elements present in the products of a chemical reaction has to be equal to the total mass of the elements present in the reactants.',
    ],
    keyConcepts: [
      'Reactants are written on the left-hand side (LHS) with a plus sign (+) between them.',
      'Products are written on the right-hand side (RHS) with a plus sign (+) between them.',
      'Arrowhead points towards the products and indicates direction of reaction.',
      'Law of Conservation of Mass necessitates balancing of chemical equations.',
    ],
    formulas: [
      'Mg + O₂ → MgO (Skeletal Chemical Equation)',
      '2Mg + O₂ → 2MgO (Balanced Chemical Equation)',
      'Zn + H₂SO₄ → ZnSO₄ + H₂',
    ],
    ncertHighlights: [
      'If the number of atoms of each element is not the same on both sides, then the equation is unbalanced because the mass is not the same on both sides of the equation. Such an equation is a skeletal equation.',
    ],
    inTextQuestions: [
      {
        question: 'Write the balanced equation for the following: Hydrogen + Chlorine → Hydrogen chloride.',
        answerHint: 'H₂ + Cl₂ → 2HCl.',
      },
    ],
    vocabulary: [
      {
        term: 'Skeletal Chemical Equation',
        definition: 'An equation where mass is not balanced on both sides of the reaction.',
      },
      {
        term: 'Law of Conservation of Mass',
        definition: 'In any chemical reaction, the total mass of the reactants equals the total mass of the products.',
      },
    ],
    pageType: 'theory',
  },
  4: {
    pageNumber: 4,
    sectionTitle: '1.4 Step-by-Step Hit and Trial Method',
    heading: 'Balancing the Reaction of Iron with Steam',
    paragraphs: [
      'Let us try to balance the following chemical equation: Fe + H₂O → Fe₃O₄ + H₂.',
      'Step I: First of all, draw boxes around each formula. Do not change anything inside the boxes while balancing the equation: [Fe] + [H₂O] → [Fe₃O₄] + [H₂].',
      'Step II: List the number of atoms of different elements present in the unbalanced equation: Fe (LHS: 1, RHS: 3), H (LHS: 2, RHS: 2), O (LHS: 1, RHS: 4).',
      'Step III: It is often convenient to start balancing with the compound that contains the maximum number of atoms. It may be a reactant or a product. In Fe₃O₄, oxygen has 4 atoms. To balance oxygen, put coefficient 4 before H₂O: Fe + 4H₂O → Fe₃O₄ + H₂.',
      'Step IV & V: Now balance hydrogen and iron atoms. There are 8 H atoms on LHS, so place 4 before H₂ on RHS. There are 3 Fe atoms on RHS, so place 3 before Fe on LHS.',
      'Final Balanced Equation: 3Fe(s) + 4H₂O(g) → Fe₃O₄(s) + 4H₂(g). Note that water is taken as steam, hence denoted as (g).',
    ],
    keyConcepts: [
      'Hit-and-trial method: We balance by trial using the smallest whole number coefficient.',
      'Never alter chemical subscripts inside formulas (e.g. H₂O cannot become H₂O₄).',
      'Notations of physical states: (s) for solid, (l) for liquid, (aq) for aqueous, (g) for gas.',
    ],
    formulas: [
      '3Fe(s) + 4H₂O(g) → Fe₃O₄(s) + 4H₂(g)',
      'CO(g) + 2H₂(g) --(340 atm)--> CH₃OH(l)',
      '6CO₂(aq) + 12H₂O(l) --(Sunlight / Chlorophyll)--> C₆H₁₂O₆(aq) + 6O₂(aq) + 6H₂O(l)',
    ],
    ncertHighlights: [
      'Usually physical states are not included in a chemical equation unless it is necessary to specify them.',
      'Reaction conditions such as temperature, pressure, or catalyst are indicated above and/or below the arrow.',
    ],
    inTextQuestions: [
      {
        question: 'Balance the equation: Barium chloride + Aluminium sulphate → Barium sulphate + Aluminium chloride.',
        answerHint: '3BaCl₂ + Al₂(SO₄)₃ → 3BaSO₄ + 2AlCl₃.',
      },
    ],
    vocabulary: [
      {
        term: 'Aqueous (aq)',
        definition: 'A solution in which water is the solvent.',
      },
      {
        term: 'Catalyst',
        definition: 'A substance that speeds up a chemical reaction without being consumed in the process.',
      },
    ],
    pageType: 'numerical_example',
  },
  5: {
    pageNumber: 5,
    sectionTitle: '1.5 Types of Reactions: Combination Reaction',
    heading: 'Combination Reactions & Slaking of Lime',
    paragraphs: [
      'We have learnt in Class IX that during a chemical reaction atoms of one element do not change into those of another element. Nor do atoms disappear from the mixture or appear from elsewhere. Actually, chemical reactions involve the breaking and making of bonds between atoms to produce new substances.',
      'Activity 1.4: Take a small amount of calcium oxide or quicklime in a beaker. Slowly add water to this. Touch the beaker as shown in Fig. 1.3. Do you feel any change in temperature? Calcium oxide reacts vigorously with water to produce slaked lime (calcium hydroxide) releasing a large amount of heat.',
      'In this reaction, calcium oxide and water combine to form a single product, calcium hydroxide. Such a reaction in which a single product is formed from two or more reactants is known as a combination reaction: CaO(s) + H₂O(l) → Ca(OH)₂(aq) + Heat.',
    ],
    keyConcepts: [
      'Combination reaction: Two or more reactants combine to form a SINGLE product: A + B → AB.',
      'Quicklime (CaO) reaction with water gives Slaked Lime [Ca(OH)₂] with immense heat release.',
      'Whitewashing of walls: Slaked lime reacts slowly with CO₂ in air to form shiny Calcium Carbonate (CaCO₃).',
    ],
    formulas: [
      'CaO(s) + H₂O(l) → Ca(OH)₂(aq) + Heat',
      'Ca(OH)₂(aq) + CO₂(g) → CaCO₃(s) + H₂O(l)',
      'C(s) + O₂(g) → CO₂(g) (Burning of coal)',
      '2H₂(g) + O₂(g) → 2H₂O(l) (Formation of water)',
    ],
    ncertHighlights: [
      'DO YOU KNOW? A solution of slaked lime produced by Activity 1.4 is used for white-washing walls. Calcium hydroxide reacts slowly with carbon dioxide in air to form a thin layer of calcium carbonate on the walls after two to three days and gives a shiny finish. Chemical formula of marble is also CaCO₃.',
    ],
    activities: [
      {
        activityNumber: 'Activity 1.4',
        title: 'Reaction of Quicklime with Water',
        procedure: 'Add water slowly to solid calcium oxide in a glass beaker.',
        observation: 'Vigorous hissing sound, boiling bubbles, and beaker becomes intensely hot.',
        conclusion: 'Exothermic combination reaction synthesizing calcium hydroxide.',
      },
    ],
    inTextQuestions: [
      {
        question: 'A solution of a substance ‘X’ is used for white washing. (i) Name the substance ‘X’ and write its formula. (ii) Write the reaction of ‘X’ with water.',
        answerHint: '(i) Substance X is Calcium Oxide (Quicklime), CaO. (ii) CaO(s) + H₂O(l) → Ca(OH)₂(aq).',
      },
    ],
    vocabulary: [
      {
        term: 'Quicklime',
        definition: 'Common name for Calcium Oxide (CaO).',
      },
      {
        term: 'Slaked Lime',
        definition: 'Common name for Calcium Hydroxide [Ca(OH)₂].',
      },
    ],
    diagramNote: 'Fig. 1.3: Formation of slaked lime by the reaction of calcium oxide with water.',
    pageType: 'theory',
  },
  6: {
    pageNumber: 6,
    sectionTitle: '1.6 Exothermic & Respiration Reactions',
    heading: 'Respiration and Decomposition of Vegetable Matter',
    paragraphs: [
      'Reactions in which heat is released along with the formation of products are called exothermic chemical reactions. Other examples of exothermic reactions are: (i) Burning of natural gas: CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(g) + Energy.',
      '(ii) Do you know that respiration is an exothermic process? We all know that we need energy to stay alive. We get this energy from the food we eat. During digestion, food is broken down into simpler substances. For example, rice, potatoes and bread contain carbohydrates. These carbohydrates are broken down to form glucose.',
      'This glucose combines with oxygen in the cells of our body and provides energy. The special name of this reaction is respiration: C₆H₁₂O₆(aq) + 6O₂(aq) → 6CO₂(aq) + 6H₂O(l) + Energy.',
      '(iii) The decomposition of vegetable matter into compost is also an example of an exothermic reaction.',
    ],
    keyConcepts: [
      'Exothermic reactions release energy into the surroundings (ΔH is negative).',
      'Respiration is cellular combustion of glucose yielding CO₂, H₂O, and ATP energy.',
      'Composting of organic biomass generates warmth due to microbial exothermic decomposition.',
    ],
    formulas: [
      'CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(g) + Energy',
      'C₆H₁₂O₆(aq) + 6O₂(aq) → 6CO₂(aq) + 6H₂O(l) + Energy',
    ],
    ncertHighlights: [
      'CBSE Exam Favorite: "Why is respiration considered an exothermic reaction? Explain." Always write the glucose cellular respiration equation with state symbols.',
    ],
    inTextQuestions: [
      {
        question: 'Why is respiration considered an exothermic reaction?',
        answerHint:
          'Because glucose combines with oxygen in body cells to release significant metabolic energy needed for physiological processes.',
      },
    ],
    vocabulary: [
      {
        term: 'Respiration',
        definition: 'The biochemical process by which living organisms harvest energy from glucose with oxygen.',
      },
    ],
    pageType: 'theory',
  },
};

// Sample Authentic Preloaded NCERT Pages for Class 10 Mathematics - Chapter 4: Quadratic Equations
export const CLASS_10_MATH_CH4_PAGES: Record<number, NCERTPageContent> = {
  1: {
    pageNumber: 1,
    sectionTitle: '4.1 Introduction to Quadratic Equations',
    heading: 'Standard Form of a Quadratic Equation',
    paragraphs: [
      'In Chapter 2, you have studied different types of polynomials. One type was the quadratic polynomial of the form ax² + bx + c, a ≠ 0. When we equate this polynomial to zero, we get a quadratic equation.',
      'A quadratic equation in the variable x is an equation of the form ax² + bx + c = 0, where a, b, c are real numbers and a ≠ 0. For example, 2x² + x - 300 = 0 is a quadratic equation. Similarly, 2x² - 3x + 1 = 0, 4x - 3x² + 2 = 0 and 1 - x² + 300 = 0 are also quadratic equations.',
      'In fact, any equation of the form p(x) = 0, where p(x) is a polynomial of degree 2, is a quadratic equation. But when we write the terms of p(x) in descending order of their degrees, then we get the standard form of the equation: ax² + bx + c = 0, a ≠ 0 is called the standard form of a quadratic equation.',
    ],
    keyConcepts: [
      'Standard form: ax² + bx + c = 0 where a, b, c ∈ ℝ and a ≠ 0.',
      'Degree of a quadratic equation must strictly be equal to 2.',
      'If a = 0, the equation reduces to a linear equation bx + c = 0.',
    ],
    formulas: [
      'ax² + bx + c = 0, a ≠ 0',
    ],
    ncertHighlights: [
      'Note: The coefficient "a" of x² can NEVER be zero, but b or c can be zero (e.g. 5x² = 0 or 3x² - 9 = 0 are quadratic equations).',
    ],
    inTextQuestions: [
      {
        question: 'Check whether the following is a quadratic equation: (x - 2)² + 1 = 2x - 3.',
        answerHint: 'Expanding: x² - 4x + 4 + 1 = 2x - 3 => x² - 6x + 8 = 0. Yes, it is in standard quadratic form ax² + bx + c = 0.',
      },
    ],
    vocabulary: [
      {
        term: 'Standard Form',
        definition: 'Arrangement of quadratic equation terms in descending order of degrees: ax² + bx + c = 0.',
      },
      {
        term: 'Degree of Polynomial',
        definition: 'The highest exponent of the variable in a polynomial expression.',
      },
    ],
    pageType: 'theory',
  },
  2: {
    pageNumber: 2,
    sectionTitle: '4.2 Solution of a Quadratic Equation by Factorisation',
    heading: 'Splitting the Middle Term Method',
    paragraphs: [
      'A real number α is called a root of the quadratic equation ax² + bx + c = 0, a ≠ 0 if aα² + bα + c = 0. We also say that x = α is a solution of the quadratic equation, or that α satisfies the quadratic equation.',
      'Note that the zeroes of the quadratic polynomial ax² + bx + c and the roots of the quadratic equation ax² + bx + c = 0 are the same. A quadratic equation can have at most two roots.',
      'Let us find the roots of 2x² - 5x + 3 = 0 by factorisation: Let us first split the middle term -5x as -2x - 3x (since (-2) × (-3) = 6 = 2 × 3). So, 2x² - 5x + 3 = 2x² - 2x - 3x + 3 = 2x(x - 1) - 3(x - 1) = (2x - 3)(x - 1) = 0.',
      'Now, 2x - 3 = 0 or x - 1 = 0, which gives x = 3/2 or x = 1. Therefore, 3/2 and 1 are the roots of the given equation.',
    ],
    keyConcepts: [
      'Zeroes of quadratic polynomial = roots of corresponding quadratic equation.',
      'A quadratic equation has at most two real roots.',
      'Middle term splitting: find two numbers p and q such that p + q = b and pq = ac.',
    ],
    formulas: [
      '2x² - 5x + 3 = (2x - 3)(x - 1) = 0 => x = 3/2, 1',
    ],
    ncertHighlights: [
      'Zero Product Property: If A × B = 0, then either A = 0 or B = 0 or both are 0.',
    ],
    inTextQuestions: [
      {
        question: 'Find the roots of the quadratic equation 6x² - x - 2 = 0.',
        answerHint: '6x² + 3x - 4x - 2 = 3x(2x + 1) - 2(2x + 1) = (3x - 2)(2x + 1) = 0 => x = 2/3, -1/2.',
      },
    ],
    vocabulary: [
      {
        term: 'Root of an Equation',
        definition: 'A numerical value of the variable which satisfies the equation making LHS = RHS.',
      },
    ],
    pageType: 'numerical_example',
  },
};

// All Supported NCERT Subjects & Catalog
export const NCERT_SUBJECTS_CATALOG: NCERTSubject[] = [
  {
    id: 'science',
    name: 'Science',
    bookTitle: 'Science - Textbook for Class X',
    iconName: 'Atom',
    color: '#0284C7',
    bgLight: '#E0F2FE',
    classes: ['6', '7', '8', '9', '10'],
    chapters: [
      {
        id: 'c10-sci-ch1',
        chapterNumber: 1,
        title: 'Chemical Reactions and Equations',
        subjectId: 'science',
        classLevel: '10',
        bookTitle: 'Science - Class 10 (NCERT)',
        totalPages: 16,
        description: 'Chemical equations, balancing, combination, decomposition, displacement, double displacement, redox, and corrosion.',
        highYieldWeightage: '7-9 Marks (CBSE Board)',
        keyThemes: ['Balancing Equations', 'Types of Reactions', 'Oxidation & Reduction', 'Corrosion & Rancidity'],
        pages: CLASS_10_SCIENCE_CH1_PAGES,
      },
      {
        id: 'c10-sci-ch2',
        chapterNumber: 2,
        title: 'Acids, Bases and Salts',
        subjectId: 'science',
        classLevel: '10',
        bookTitle: 'Science - Class 10 (NCERT)',
        totalPages: 18,
        description: 'Indicators, pH scale, chemical properties of acids and bases, salts, chlor-alkali process, and Plaster of Paris.',
        highYieldWeightage: '6-8 Marks',
        keyThemes: ['pH in Everyday Life', 'Baking Soda & Bleaching Powder', 'Water of Crystallisation'],
      },
      {
        id: 'c10-sci-ch3',
        chapterNumber: 3,
        title: 'Metals and Non-metals',
        subjectId: 'science',
        classLevel: '10',
        bookTitle: 'Science - Class 10 (NCERT)',
        totalPages: 20,
        description: 'Physical & chemical properties, reactivity series, extraction of metals, ionic compounds, and corrosion prevention.',
        highYieldWeightage: '8-10 Marks',
        keyThemes: ['Reactivity Series', 'Ionic Bond Formation', 'Metallurgy Roasting & Calcination'],
      },
      {
        id: 'c10-sci-ch6',
        chapterNumber: 6,
        title: 'Life Processes',
        subjectId: 'science',
        classLevel: '10',
        bookTitle: 'Science - Class 10 (NCERT)',
        totalPages: 24,
        description: 'Nutrition (autotrophic & heterotrophic), Respiration, Transportation in humans and plants, and Excretion.',
        highYieldWeightage: '9-11 Marks',
        keyThemes: ['Photosynthesis Light/Dark Reactions', 'Human Heart & Double Circulation', 'Nephron Filtration'],
      },
      {
        id: 'c10-sci-ch10',
        chapterNumber: 10,
        title: 'Light - Reflection and Refraction',
        subjectId: 'science',
        classLevel: '10',
        bookTitle: 'Science - Class 10 (NCERT)',
        totalPages: 26,
        description: 'Spherical mirrors, ray diagrams, mirror formula, refraction through glass slab, lens formula, and power of lenses.',
        highYieldWeightage: '8-10 Marks',
        keyThemes: ['Mirror Formula 1/f = 1/v + 1/u', 'Refractive Index', 'Lens Formula & Magnification'],
      },
      {
        id: 'c10-sci-ch12',
        chapterNumber: 12,
        title: 'Electricity',
        subjectId: 'science',
        classLevel: '10',
        bookTitle: 'Science - Class 10 (NCERT)',
        totalPages: 22,
        description: 'Electric current, potential difference, Ohm’s law, factors affecting resistance, series/parallel combinations, and Joule’s heating.',
        highYieldWeightage: '7-9 Marks',
        keyThemes: ["Ohm's Law V=IR", 'Series vs Parallel Resistors', "Joule's Law of Heating H=I²Rt"],
      },
    ],
  },
  {
    id: 'math',
    name: 'Mathematics',
    bookTitle: 'Mathematics - Textbook for Class X',
    iconName: 'Calculator',
    color: '#4F46E5',
    bgLight: '#EEF2FF',
    classes: ['6', '7', '8', '9', '10', '11', '12'],
    chapters: [
      {
        id: 'c10-math-ch1',
        chapterNumber: 1,
        title: 'Real Numbers',
        subjectId: 'math',
        classLevel: '10',
        bookTitle: 'Mathematics - Class 10 (NCERT)',
        totalPages: 12,
        description: 'Fundamental Theorem of Arithmetic, proving irrationality of √2, √3, √5, and decimal expansions.',
        highYieldWeightage: '6 Marks',
        keyThemes: ['Fundamental Theorem of Arithmetic', 'Proving Irrationality', 'HCF × LCM = Product of Numbers'],
      },
      {
        id: 'c10-math-ch2',
        chapterNumber: 2,
        title: 'Polynomials',
        subjectId: 'math',
        classLevel: '10',
        bookTitle: 'Mathematics - Class 10 (NCERT)',
        totalPages: 14,
        description: 'Geometrical meaning of zeroes, relationship between zeroes and coefficients of quadratic polynomials.',
        highYieldWeightage: '4-5 Marks',
        keyThemes: ['Sum & Product of Zeroes α + β = -b/a', 'Graphical Zeroes Intersection'],
      },
      {
        id: 'c10-math-ch3',
        chapterNumber: 3,
        title: 'Pair of Linear Equations in Two Variables',
        subjectId: 'math',
        classLevel: '10',
        bookTitle: 'Mathematics - Class 10 (NCERT)',
        totalPages: 22,
        description: 'Graphical method, substitution method, elimination method, and word problems.',
        highYieldWeightage: '6-8 Marks',
        keyThemes: ['Consistency Criteria a₁/a₂ ≠ b₁/b₂', 'Substitution & Elimination Methods'],
      },
      {
        id: 'c10-math-ch4',
        chapterNumber: 4,
        title: 'Quadratic Equations',
        subjectId: 'math',
        classLevel: '10',
        bookTitle: 'Mathematics - Class 10 (NCERT)',
        totalPages: 18,
        description: 'Standard form ax²+bx+c=0, factorisation method, quadratic formula, and nature of roots using discriminant.',
        highYieldWeightage: '6-8 Marks',
        keyThemes: ['Quadratic Formula x = (-b ± √D)/2a', 'Discriminant D = b² - 4ac', 'Word Problems on Speed & Age'],
        pages: CLASS_10_MATH_CH4_PAGES,
      },
      {
        id: 'c10-math-ch6',
        chapterNumber: 6,
        title: 'Triangles',
        subjectId: 'math',
        classLevel: '10',
        bookTitle: 'Mathematics - Class 10 (NCERT)',
        totalPages: 24,
        description: 'Basic Proportionality Theorem (Thales Theorem), criteria for similarity of triangles (AAA, SSS, SAS).',
        highYieldWeightage: '8-10 Marks',
        keyThemes: ['Basic Proportionality Theorem (BPT)', 'Similarity Criteria Theorems & Proofs'],
      },
      {
        id: 'c10-math-ch8',
        chapterNumber: 8,
        title: 'Introduction to Trigonometry',
        subjectId: 'math',
        classLevel: '10',
        bookTitle: 'Mathematics - Class 10 (NCERT)',
        totalPages: 18,
        description: 'Trigonometric ratios of acute angles, values at 0°, 30°, 45°, 60°, 90°, and trigonometric identities.',
        highYieldWeightage: '8-10 Marks',
        keyThemes: ['sin²θ + cos²θ = 1', 'Table of Standard Angles', 'Trigonometric Identity Proofs'],
      },
    ],
  },
  {
    id: 'social_science',
    name: 'Social Science',
    bookTitle: 'India and the Contemporary World - II',
    iconName: 'Globe',
    color: '#D97706',
    bgLight: '#FFFBEB',
    classes: ['6', '7', '8', '9', '10'],
    chapters: [
      {
        id: 'c10-soc-ch1',
        chapterNumber: 1,
        title: 'The Rise of Nationalism in Europe',
        subjectId: 'social_science',
        classLevel: '10',
        bookTitle: 'History - India & The Contemporary World II',
        totalPages: 26,
        description: 'French Revolution and the Idea of the Nation, Making of Nationalism, Age of Revolutions 1830-1848, Unification of Germany and Italy.',
        highYieldWeightage: '6-8 Marks',
        keyThemes: ['Napoleonic Civil Code 1804', 'Mazzini & Italian Unification', 'Bismarck & German Unification'],
      },
      {
        id: 'c10-soc-ch2',
        chapterNumber: 2,
        title: 'Nationalism in India',
        subjectId: 'social_science',
        classLevel: '10',
        bookTitle: 'History - India & The Contemporary World II',
        totalPages: 24,
        description: 'First World War, Khilafat and Non-Cooperation Movement, Differing Strands, Salt March and Civil Disobedience, Sense of Collective Belonging.',
        highYieldWeightage: '8-10 Marks',
        keyThemes: ['Rowlatt Act & Jallianwala Bagh', 'Non-Cooperation Movement', 'Dandi Salt March & Civil Disobedience'],
      },
      {
        id: 'c10-soc-geo-ch1',
        chapterNumber: 3,
        title: 'Resources and Development',
        subjectId: 'social_science',
        classLevel: '10',
        bookTitle: 'Geography - Contemporary India II',
        totalPages: 16,
        description: 'Classification of resources, resource planning, land resources, land degradation and conservation, and soil classification.',
        highYieldWeightage: '5-6 Marks',
        keyThemes: ['Alluvial, Black, Red & Laterite Soils', 'Soil Erosion & Conservation Measures'],
      },
    ],
  },
  {
    id: 'english',
    name: 'English',
    bookTitle: 'First Flight - Class X',
    iconName: 'BookOpen',
    color: '#059669',
    bgLight: '#ECFDF5',
    classes: ['6', '7', '8', '9', '10', '11', '12'],
    chapters: [
      {
        id: 'c10-eng-ch1',
        chapterNumber: 1,
        title: 'A Letter to God (Lencho)',
        subjectId: 'english',
        classLevel: '10',
        bookTitle: 'First Flight (NCERT)',
        totalPages: 10,
        description: 'Faith, irony, and human nature: Lencho writes a letter to God after a hailstorm destroys his cornfields.',
        highYieldWeightage: '5-6 Marks',
        keyThemes: ['Unshakable Faith vs Irony of Postmaster', 'Character Sketch of Lencho'],
      },
      {
        id: 'c10-eng-ch2',
        chapterNumber: 2,
        title: 'Nelson Mandela: Long Walk to Freedom',
        subjectId: 'english',
        classLevel: '10',
        bookTitle: 'First Flight (NCERT)',
        totalPages: 14,
        description: 'Inauguration speech, struggle against Apartheid, meaning of true courage, and twin obligations in life.',
        highYieldWeightage: '6-8 Marks',
        keyThemes: ['Twin Obligations of Man', 'Apartheid & Emancipation', 'Triumph of Human Spirit'],
      },
    ],
  },
];

export function getNCERTSubjectById(subjectId: string): NCERTSubject | undefined {
  return NCERT_SUBJECTS_CATALOG.find((s) => s.id === subjectId);
}

export function getNCERTChaptersForClass(classLevel: NCERTClass, subjectId?: string): NCERTChapter[] {
  const result: NCERTChapter[] = [];
  for (const subject of NCERT_SUBJECTS_CATALOG) {
    if (subjectId && subject.id !== subjectId) continue;
    for (const chapter of subject.chapters) {
      if (chapter.classLevel === classLevel) {
        result.push(chapter);
      }
    }
  }
  return result;
}

export function getNCERTChapterById(chapterId: string): NCERTChapter | undefined {
  for (const subject of NCERT_SUBJECTS_CATALOG) {
    const found = subject.chapters.find((c) => c.id === chapterId);
    if (found) return found;
  }
  return undefined;
}
