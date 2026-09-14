import { NCERTPageContent } from '../types/ncert';

// Class 9 Science - Chapter 1: Matter in Our Surroundings
export const CLASS_9_SCIENCE_CH1_PAGES: Record<number, NCERTPageContent> = {
  1: {
    pageNumber: 1,
    sectionTitle: '1.1 Physical Nature of Matter',
    heading: 'Matter is made up of particles',
    paragraphs: [
      'As we look at our surroundings, we see a large variety of things with different shapes, sizes and textures. Everything in this universe is made up of material which scientists have named "matter". The air we breathe, the food we eat, stones, clouds, stars, plants and animals, even a small drop of water or a particle of sand – each thing is matter.',
      'Since early times, human beings have been trying to understand their surroundings. Early Indian philosophers classified matter in the form of five basic elements – the "Panch Tatva" – air, earth, fire, sky and water. According to them everything, living or non-living, was made up of these five basic elements.',
      'Modern day scientists have evolved two types of classification of matter based on their physical properties and chemical nature. In this chapter, we shall learn about matter based on its physical properties.',
    ],
    keyConcepts: [
      'Matter occupies space and has mass (SI unit of mass is kg, volume is m³ or litres).',
      'Matter is particulate in nature, made up of tiny indivisible particles.',
      'Particles of matter have spaces between them (intermolecular spaces).',
    ],
    formulas: [
      '1 L = 1 dm³ = 1000 mL',
      '1 m³ = 1000 L',
      'Density = Mass / Volume (ρ = m/V)',
    ],
    ncertHighlights: [
      'The SI unit of mass is kilogram (kg). The SI unit of volume is cubic metre (m³). The common unit of measuring volume is litre (L) such that 1 L = 1000 mL = 1000 cm³.',
      'Particles of matter are very small – they are small beyond our imagination!',
    ],
    activities: [
      {
        activityNumber: 'Activity 1.1',
        title: 'Dissolving Salt/Sugar in Water',
        procedure:
          'Take a 100 mL beaker. Fill half the beaker with water and mark the level of water. Dissolve some salt or sugar with the help of a glass rod. Observe any change in water level.',
        observation: 'The salt dissolves completely without any noticeable rise in the water level.',
        conclusion:
          'Particles of salt get into the spaces between the particles of water, proving matter is composed of particles with intermolecular spaces.',
      },
    ],
    inTextQuestions: [
      {
        question: 'Which of the following are matter? Chair, air, love, smell, hate, almonds, thought, cold, cold drink, smell of perfume.',
        answerHint:
          'Matter: Chair, air, almonds, cold drink, smell of perfume (particles causing smell). Non-matter: love, hate, thought, cold (sensations/feelings).',
      },
    ],
    vocabulary: [
      {
        term: 'Matter',
        definition: 'Anything that occupies space and has mass.',
      },
      {
        term: 'Intermolecular Space',
        definition: 'The empty physical space existing between adjacent particles of matter.',
      },
    ],
    pageType: 'theory',
  },
  2: {
    pageNumber: 2,
    sectionTitle: '1.2 Characteristics of Particles of Matter',
    heading: 'Particles of matter are continuously moving',
    paragraphs: [
      'Particles of matter are in continuous random motion; that is, they possess what we call the kinetic energy. As the temperature rises, particles move faster. So, we can say that with an increase in temperature, the kinetic energy of the particles also increases.',
      'In the activities, we observe that particles of matter intermix on their own with each other. They do so by getting into the spaces between the particles. This intermixing of particles of two different types of matter on their own is called diffusion.',
      'We also observe that on heating, diffusion becomes faster. Why does this happen? Higher kinetic energy causes particles to collide and disperse more vigorously.',
    ],
    keyConcepts: [
      'Particles possess kinetic energy proportional to absolute temperature (KE ∝ T).',
      'Diffusion is the spontaneous intermixing of particles of two different substances into each other.',
      'Rate of diffusion increases with temperature due to higher thermal velocity.',
      'Particles of matter attract each other with cohesive intermolecular forces.',
    ],
    formulas: [
      'Kinetic Energy: KE = ½ mv²',
      'Kelvin to Celsius: K = °C + 273.15',
    ],
    ncertHighlights: [
      'Smell of hot sizzling food reaches you several metres away, but to get the smell from cold food you have to go close. This is because the rate of diffusion of gas in air increases with temperature.',
    ],
    activities: [
      {
        activityNumber: 'Activity 1.3',
        title: 'Diffusion of Incense Stick',
        procedure:
          'Put an unlit incense stick in a corner of your class. How close do you have to go near it so as to get its smell? Now light the incense stick. What happens? Do you get the smell sitting at a distance?',
        observation: 'When unlit, scent is faint; when lighted, pleasant fragrance spreads across the room within seconds.',
        conclusion: 'Heating vaporizes aromatic compounds and increases kinetic energy, accelerating gaseous diffusion.',
      },
      {
        activityNumber: 'Activity 1.4',
        title: 'Diffusion of Ink and Honey in Water',
        procedure:
          'Take two glasses filled with water. Put a drop of blue ink slowly along the sides of the first glass and honey in the second glass. Leave them undisturbed.',
        observation: 'Ink spreads evenly through water much faster than viscous honey.',
        conclusion: 'Rate of diffusion depends on molecular mass, viscosity, and intermolecular attraction of the liquid.',
      },
    ],
    inTextQuestions: [
      {
        question: 'Give reasons for the following: The smell of hot sizzling food reaches us several metres away, but to get the smell from cold food we have to go close.',
        answerHint:
          'Kinetic energy of gaseous particles is much higher at elevated temperatures, leading to rapid diffusion over long distances.',
      },
      {
        question: 'A diver is able to cut through water in a swimming pool. Which property of matter does this observation show?',
        answerHint:
          'This shows that particles of matter have spaces between them and the attractive forces between water molecules can be overcome by external force.',
      },
    ],
    vocabulary: [
      {
        term: 'Diffusion',
        definition: 'The spontaneous process of intermixing of particles of two different substances from higher to lower concentration.',
      },
      {
        term: 'Kinetic Energy',
        definition: 'The energy possessed by particles by virtue of their state of motion.',
      },
    ],
    pageType: 'theory',
  },
};

// Class 10 Science - Chapter 2: Acids, Bases and Salts
export const CLASS_10_SCIENCE_CH2_PAGES: Record<number, NCERTPageContent> = {
  1: {
    pageNumber: 1,
    sectionTitle: '2.1 Understanding the Chemical Properties of Acids and Bases',
    heading: 'Acids and Bases in the Laboratory & Olfactory Indicators',
    paragraphs: [
      'You know that acids are sour in taste and change the colour of blue litmus to red, whereas bases are bitter and change the colour of red litmus to blue. Litmus is a natural indicator; turmeric is another such indicator. Have you noticed that a stain of curry on a white cloth becomes reddish-brown when soap, which is basic in nature, is scrubbed on it? It turns yellow again when the cloth is washed with plenty of water.',
      'You can also use synthetic indicators such as methyl orange and phenolphthalein to test for acids and bases. Litmus solution is a purple dye, which is extracted from lichen, a plant belonging to the division Thallophyta, and is commonly used as an indicator.',
      'There are some substances whose odour changes in acidic or basic media. These are called olfactory indicators. Vanilla extract, onion and clove oil can be used as olfactory indicators.',
    ],
    keyConcepts: [
      'Acids turn blue litmus red; bases turn red litmus blue.',
      'Natural indicators: Litmus (from lichen), turmeric, red cabbage leaves, hydrangeas.',
      'Synthetic indicators: Phenolphthalein (colorless in acid, pink in base), Methyl orange (red in acid, yellow in base).',
      'Olfactory indicators: Vanilla, onion, clove oil lose their characteristic smell in basic medium.',
    ],
    formulas: [
      'HCl(aq) → H⁺(aq) + Cl⁻(aq)',
      'NaOH(aq) → Na⁺(aq) + OH⁻(aq)',
    ],
    ncertHighlights: [
      'When the litmus solution is neither acidic nor basic, its colour is purple.',
      'Soap is basic in nature, which turns yellow turmeric stain reddish-brown.',
    ],
    activities: [
      {
        activityNumber: 'Activity 2.1',
        title: 'Testing Laboratory Chemicals with Indicators',
        procedure:
          'Collect samples of HCl, H₂SO₄, HNO₃, CH₃COOH, NaOH, Ca(OH)₂, KOH, Mg(OH)₂, NH₄OH. Put a drop of each on a watch glass and test with blue litmus, red litmus, phenolphthalein, and methyl orange.',
        observation: 'Acids turn blue litmus red and stay colourless in phenolphthalein. Bases turn red litmus blue and turn phenolphthalein pink.',
        conclusion: 'Acidic and basic solutions produce distinct, characteristic colour transformations with synthetic and natural indicators.',
      },
      {
        activityNumber: 'Activity 2.2',
        title: 'Olfactory Testing with Onion Strips',
        procedure:
          'Take finely chopped onions in a plastic bag along with clean cloth strips. Keep overnight. Test cloth strips with dilute HCl and dilute NaOH.',
        observation: 'The cloth strip treated with dilute NaOH loses the smell of onion completely; the strip treated with HCl retains the onion smell.',
        conclusion: 'Bases destroy the characteristic odor of onion, while acids do not, making onion an olfactory indicator.',
      },
    ],
    inTextQuestions: [
      {
        question: 'You have been provided with three test tubes containing distilled water, acidic solution and basic solution respectively. If you are given only red litmus paper, how will you identify the contents of each?',
        answerHint:
          'Dip red litmus in all three. The one turning it blue is basic. Now use this blue litmus on the remaining two: the one turning it red is acidic, and the remaining is distilled water.',
      },
    ],
    vocabulary: [
      {
        term: 'Indicator',
        definition: 'A chemical substance that changes color or odour in the presence of an acid or a base.',
      },
      {
        term: 'Olfactory Indicator',
        definition: 'Substances whose characteristic smell changes depending on whether they are placed in acidic or basic medium.',
      },
    ],
    pageType: 'theory',
  },
  2: {
    pageNumber: 2,
    sectionTitle: '2.2 How do Acids and Bases React with Metals?',
    heading: 'Reaction of Metals with Acids and Evolution of Hydrogen Gas',
    paragraphs: [
      'Note that the metal in the above reactions displaces hydrogen atoms from the acids as hydrogen gas and forms a compound called a salt. Thus, the reaction of a metal with an acid can be summarized as: Acid + Metal → Salt + Hydrogen gas.',
      'For example, dilute sulphuric acid reacts with granulated zinc to form zinc sulphate and hydrogen gas: Zn + H₂SO₄ → ZnSO₄ + H₂↑. When a burning candle is brought near a soap bubble filled with hydrogen gas, it burns with a characteristic "pop" sound.',
      'Bases also react with certain active metals like zinc and aluminium to liberate hydrogen gas, but such reactions are not possible with all metals: 2NaOH + Zn → Na₂ZnO₂ (Sodium zincate) + H₂↑.',
    ],
    keyConcepts: [
      'Acid + Active Metal → Salt + Hydrogen Gas (H₂↑).',
      'Hydrogen gas pop sound test: burning splinter extinguishes with a pop sound.',
      'Strong bases react with amphoteric metals (Zn, Al) to form complex salts and H₂ (e.g. Sodium Zincate Na₂ZnO₂).',
      'Not all metals react with bases to liberate hydrogen gas.',
    ],
    formulas: [
      'Zn(s) + H₂SO₄(aq) → ZnSO₄(aq) + H₂(g)↑',
      'Zn(s) + 2HCl(aq) → ZnCl₂(aq) + H₂(g)↑',
      '2NaOH(aq) + Zn(s) → Na₂ZnO₂(aq) + H₂(g)↑ (Sodium Zincate)',
    ],
    ncertHighlights: [
      'CAUTION: Handle concentrated sulphuric acid with utmost care! It is strongly corrosive and exothermic upon hydration.',
      'Hydrogen gas is lighter than air and insoluble in water, which allows it to be collected over water or trapped in soap bubbles.',
    ],
    activities: [
      {
        activityNumber: 'Activity 2.3',
        title: 'Zinc Granules Reaction with Dilute Sulphuric Acid',
        procedure:
          'Set up apparatus with test tube containing 5 mL dilute H₂SO₄ and zinc granules. Pass gas through delivery tube into a trough containing soap solution. Bring a burning candle near the soap bubbles.',
        observation: 'Soap bubbles filled with gas rise up and burst with a distinctive pop sound on contact with the flame.',
        conclusion: 'Reaction produces hydrogen gas according to Zn + H₂SO₄ → ZnSO₄ + H₂↑.',
      },
    ],
    inTextQuestions: [
      {
        question: 'Why should curd and sour substances not be kept in brass and copper vessels?',
        answerHint:
          'Curd and sour substances contain organic acids (lactic acid) that react with copper and brass to produce toxic, poisonous metallic salts.',
      },
      {
        question: 'Which gas is usually liberated when an acid reacts with a metal? Illustrate with an example. How will you test for the presence of this gas?',
        answerHint:
          'Hydrogen gas is liberated: Zn + 2HCl → ZnCl₂ + H₂↑. Test: Bring a burning splinter near the gas; it burns with a pop sound.',
      },
    ],
    vocabulary: [
      {
        term: 'Sodium Zincate',
        definition: 'An amphoteric salt (Na₂ZnO₂) formed when zinc reacts with strong sodium hydroxide base.',
      },
      {
        term: 'Pop Sound Test',
        definition: 'The standard diagnostic laboratory flame test confirming liberation of flammable hydrogen gas.',
      },
    ],
    pageType: 'activity',
  },
};

// Class 12 Physics - Chapter 1: Electric Charges and Fields
export const CLASS_12_PHYSICS_CH1_PAGES: Record<number, NCERTPageContent> = {
  1: {
    pageNumber: 1,
    sectionTitle: '1.1 Electric Charge and Electrostatics',
    heading: 'Frictional Electricity and Fundamental Properties of Charge',
    paragraphs: [
      'All of us have the experience of seeing a spark or hearing a crackle when we take off our synthetic clothes or sweater, particularly in dry weather. Another common example of electric discharge is the lightning that we see in the sky during thunderstorms. We also experience a sensation of an electric shock either while opening the door of a car or holding the iron bar of a bus after sliding from our seat. The reason for these experiences is discharge of electric charges through our body, which were accumulated due to friction.',
      'Historically, the credit of discovery of the fact that amber rubbed with wool or silk cloth attracts light objects goes to Thales of Miletus, Greece, around 600 BC. The name electricity is coined from the Greek word "elektron" meaning amber.',
      'There are only two kinds of an entity which is called the electric charge. Benjamin Franklin named them positive and negative. By convention, the charge on a glass rod rubbed with silk is called positive and that on a plastic rod rubbed with fur is called negative. Like charges repel and unlike charges attract each other.',
    ],
    keyConcepts: [
      'Two types of electric charges exist: Positive (+ve) and Negative (-ve).',
      'Electrostatic fundamental law: Like charges repel; unlike charges attract.',
      'Charge is a scalar quantity. SI unit of electric charge is Coulomb (C).',
      'Conductors allow free movement of electrons; Insulators offer high resistance to charge movement.',
    ],
    formulas: [
      'Quantization of Charge: q = ± n e, where e = 1.602 × 10⁻¹⁹ C and n ∈ ℤ⁺',
      'Conservation of Total Electric Charge: Σ q_initial = Σ q_final',
      'Additive Property: Q = q₁ + q₂ + q₃ + ... + q_n',
    ],
    ncertHighlights: [
      'Charge on an electron is the elementary charge e = 1.6 × 10⁻¹⁹ C.',
      'A neutral body acquiring a positive charge loses electrons, hence its mass decreases slightly (by n × m_e).',
      'Charge is invariant under relativistic velocities (unlike mass).',
    ],
    activities: [
      {
        activityNumber: 'Gold Leaf Electroscope',
        title: 'Detection of Electric Charge',
        procedure:
          'Touch a charged glass rod to the brass disc of a gold-leaf electroscope. Observe the gold leaves inside the glass jar.',
        observation: 'The two delicate gold leaves diverge immediately from each other.',
        conclusion: 'Like charges conducted to both leaves exert mutual electrostatic repulsion, indicating the presence and amount of charge.',
      },
    ],
    inTextQuestions: [
      {
        question: 'If a body gives out 10⁹ electrons every second, how much time is required to get a total charge of 1 C from it?',
        answerHint:
          'q = n e => Rate of charge emission = 10⁹ × 1.6 × 10⁻¹⁹ = 1.6 × 10⁻¹⁰ C/s. Time = 1 / (1.6 × 10⁻¹⁰) = 6.25 × 10⁹ seconds ≈ 198 years!',
      },
    ],
    vocabulary: [
      {
        term: 'Quantization of Charge',
        definition: 'The principle that all observable electric charges in nature are integral multiples of the elementary charge e (q = ne).',
      },
      {
        term: 'Electroscope',
        definition: 'A sensitive laboratory apparatus used for detecting and measuring the presence of static electric charge.',
      },
    ],
    pageType: 'theory',
  },
  2: {
    pageNumber: 2,
    sectionTitle: '1.2 Coulomb\'s Law and Superposition Principle',
    heading: 'Force Between Two Point Charges in Vacuum and Dielectric Media',
    paragraphs: [
      'Coulomb’s law is a quantitative statement about the force between two point charges. When the linear sizes of charged bodies are much smaller than the distance separating them, the size may be ignored and the charged bodies are treated as point charges.',
      'Coulomb measured the force between two point charges and found that it varied inversely as the square of the distance between the charges and was directly proportional to the product of the magnitude of the two charges and acted along the line joining the two charges.',
      'Thus, if two point charges q₁ and q₂ are separated by a distance r in vacuum, the magnitude of the force (F) between them is given by F = k |q₁ q₂| / r², where k is electrostatic constant k = 1 / (4πε₀) = 8.987 × 10⁹ N m² C⁻² ≈ 9 × 10⁹ N m² C⁻².',
    ],
    keyConcepts: [
      'Coulomb\'s Law: F = (1 / 4πε₀) · (|q₁ q₂| / r²).',
      'Permittivity of free space ε₀ = 8.854 × 10⁻¹² C² N⁻¹ m⁻².',
      'In a medium with relative permittivity (dielectric constant K): F_medium = F_vacuum / K.',
      'Principle of Superposition: Net force on any charge is the vector sum of forces exerted by all other individual charges.',
    ],
    formulas: [
      'F = (1 / 4πε₀) · (q₁ q₂ / r²)',
      'Vector form: F₁₂ = (1 / 4πε₀) · (q₁ q₂ / r₁₂²) · r̂₁₂',
      'Permittivity relation: ε = εᵣ · ε₀ = K · ε₀',
      'F_medium = F_vacuum / εᵣ',
    ],
    ncertHighlights: [
      'Coulomb force is central and conservative in nature, obeying Newton\'s third law: F₁₂ = -F₂₁.',
      'Electrostatic force is 10³⁶ times stronger than gravitational force between two protons.',
    ],
    inTextQuestions: [
      {
        question: 'What is the force between two small charged spheres having charges of 2 × 10⁻⁷ C and 3 × 10⁻⁷ C placed 30 cm apart in air?',
        answerHint:
          'F = (9 × 10⁹ × 2 × 10⁻⁷ × 3 × 10⁻⁷) / (0.3)² = 5.4 × 10⁻⁴ / 0.09 = 6 × 10⁻³ N (repulsive force).',
      },
    ],
    vocabulary: [
      {
        term: 'Permittivity (ε₀)',
        definition: 'A physical quantity that describes how an electric field affects, and is affected by, a medium.',
      },
      {
        term: 'Dielectric Constant (K)',
        definition: 'The ratio of the electrostatic force between two charges in vacuum to that in a given dielectric medium (K = ε / ε₀).',
      },
    ],
    pageType: 'theory',
  },
};
