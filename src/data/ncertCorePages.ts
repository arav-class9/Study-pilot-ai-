import { NCERTPageContent } from '../types/ncert';

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
        term: 'Chemical Change',
        definition:
          'A transformation where one or more new substances are created with unique chemical properties.',
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
      'Solution of slaked lime produced by the reaction 1.13 is used for white-washing walls. Calcium hydroxide reacts slowly with carbon dioxide in air to form a thin layer of calcium carbonate on the walls. Calcium carbonate is formed after two to three days of white-washing and gives a shiny finish to the walls.',
      'Chemical formula of marble is also CaCO₃.',
    ],
    activities: [
      {
        activityNumber: 'Activity 1.4',
        title: 'Combination Reaction of Calcium Oxide with Water',
        procedure: 'Take quicklime in a beaker and gradually add water. Touch the base of the beaker.',
        observation: 'The beaker becomes extremely hot; vigorous hissing sound.',
        conclusion: 'Exothermic combination reaction synthesizing calcium hydroxide.',
      },
    ],
    inTextQuestions: [
      {
        question: 'A solution of a substance ‘X’ is used for white washing. Name the substance ‘X’ and write its formula.',
        answerHint: 'Substance ‘X’ is calcium oxide (Quicklime). Formula: CaO.',
      },
    ],
    vocabulary: [
      {
        term: 'Combination Reaction',
        definition: 'A reaction where two or more substances combine to form a single product.',
      },
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
    pageType: 'activity',
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
        definition: 'ax² + bx + c = 0 written with terms in decreasing order of degrees.',
      },
    ],
    pageType: 'theory',
  },
  2: {
    pageNumber: 2,
    sectionTitle: '4.2 Solution of a Quadratic Equation by Factorisation',
    heading: 'Finding Roots by Splitting the Middle Term',
    paragraphs: [
      'Consider the quadratic equation 2x² - 3x + 1 = 0. If we replace x by 1 on the LHS of this equation, we get (2 × 1²) - (3 × 1) + 1 = 0 = RHS. We say that 1 is a root of the quadratic equation 2x² - 3x + 1 = 0.',
      'In general, a real number α is called a root of the quadratic equation ax² + bx + c = 0, a ≠ 0 if aα² + bα + c = 0. We also say that x = α is a solution of the quadratic equation, or that α satisfies the quadratic equation.',
      'Note that the zeroes of the quadratic polynomial ax² + bx + c and the roots of the quadratic equation ax² + bx + c = 0 are the same.',
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
