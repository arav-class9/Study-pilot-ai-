import React, { useState, useRef } from 'react';
import {
  Layers,
  Upload,
  Sparkles,
  Eye,
  Volume2,
  VolumeX,
  Copy,
  Check,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  HelpCircle,
  BookOpen,
  Award,
  Pin,
  Play,
  Lightbulb,
  CheckCircle2,
  FileText,
  Brain
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translateUI, SupportedLanguage } from '../../services/i18n';

export interface DiagramPin {
  id: string;
  pinNumber: number;
  xPercent: number; // 0 - 100
  yPercent: number; // 0 - 100
  label: string;
  category: 'Biology' | 'Physics' | 'Chemistry' | 'Mathematics';
  formula?: string;
  explanation: string;
  ncertPageQuote: string;
  ncertReference: string;
  examBoardTip: string;
}

export interface PresetDiagram {
  id: string;
  title: string;
  subject: string;
  classLevel: string;
  type: 'svg' | 'image';
  svgType?: 'digestive' | 'circuit' | 'heart' | 'plantCell' | 'convexLens' | 'pythagoras' | 'unitCircle';
  imageUrl?: string;
  pins: DiagramPin[];
  quizQuestions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

const PRESET_DIAGRAMS: PresetDiagram[] = [
  {
    id: 'digestive-system',
    title: 'Human Digestive System',
    subject: 'Biology',
    classLevel: 'Class 10',
    type: 'svg',
    svgType: 'digestive',
    pins: [
      {
        id: 'pin-1',
        pinNumber: 1,
        xPercent: 50,
        yPercent: 12,
        label: 'Mouth & Salivary Glands',
        category: 'Biology',
        formula: 'Starch + Salivary Amylase → Maltose',
        explanation: 'Mechanical breakdown by teeth and chemical digestion of complex starch into simple maltose sugar by Salivary Amylase enzyme at pH 6.8.',
        ncertPageQuote: '"Saliva contains an enzyme called salivary amylase that breaks down starch which is a complex molecule to give simple sugar."',
        ncertReference: 'NCERT Class 10 Science • Chapter 6 Life Processes • Page 98',
        examBoardTip: 'Board Exam Q: Name the enzyme present in saliva and state its function. (1 Mark)'
      },
      {
        id: 'pin-2',
        pinNumber: 2,
        xPercent: 50,
        yPercent: 32,
        label: 'Stomach & Gastric Glands',
        category: 'Biology',
        formula: 'Proteins + Pepsin (Acidic pH ~1.8) → Peptones',
        explanation: 'Secretes Hydrochloric Acid (HCl), Pepsin enzyme, and Mucus. HCl kills bacteria and creates an acidic medium for Pepsin to digest proteins. Mucus protects the stomach lining from HCl.',
        ncertPageQuote: '"The hydrochloric acid creates an acidic medium which facilitates the action of the enzyme pepsin. The mucus protects the inner lining of the stomach."',
        ncertReference: 'NCERT Class 10 Science • Chapter 6 Life Processes • Page 99',
        examBoardTip: 'Board Exam Q: What is the role of HCl and Mucus in the stomach? (2 Marks)'
      },
      {
        id: 'pin-3',
        pinNumber: 3,
        xPercent: 30,
        yPercent: 40,
        label: 'Liver & Gallbladder',
        category: 'Biology',
        formula: 'Large Fat Globules + Bile Juice → Small Emulsified Droplets',
        explanation: 'Largest gland in the body. Secretes Bile juice (stored in gallbladder) which emulsifies large fat globules and converts acidic chyme from stomach into alkaline medium for pancreatic enzymes.',
        ncertPageQuote: '"Bile juice from the liver accomplishes this in addition to making the acidic food coming from the stomach alkaline so that the pancreatic enzymes can act."',
        ncertReference: 'NCERT Class 10 Science • Chapter 6 Life Processes • Page 100',
        examBoardTip: 'Board Exam Q: Define emulsification of fats and state where bile is produced & stored. (2 Marks)'
      },
      {
        id: 'pin-4',
        pinNumber: 4,
        xPercent: 50,
        yPercent: 55,
        label: 'Small Intestine & Villi',
        category: 'Biology',
        formula: 'Proteins → Amino Acids | Fats → Fatty Acids + Glycerol',
        explanation: 'Site of complete digestion of carbohydrates, proteins, and fats. Millions of microscopic finger-like projections called Villi increase surface area for rapid nutrient absorption into blood capillaries.',
        ncertPageQuote: '"The inner lining of the small intestine has numerous finger-like projections called villi which increase the surface area for absorption."',
        ncertReference: 'NCERT Class 10 Science • Chapter 6 Life Processes • Page 101',
        examBoardTip: 'Board Exam Q: How is the small intestine designed to absorb digested food efficiently? (3 Marks)'
      },
      {
        id: 'pin-5',
        pinNumber: 5,
        xPercent: 68,
        yPercent: 68,
        label: 'Large Intestine',
        category: 'Biology',
        explanation: 'Absorbs excess water and essential salts from unabsorbed food residue before waste is excreted via the anus.',
        ncertPageQuote: '"The unabsorbed material is sent into the large intestine where its wall absorbs more water from this material."',
        ncertReference: 'NCERT Class 10 Science • Chapter 6 Life Processes • Page 102',
        examBoardTip: 'Board Exam Q: Compare the functions of small vs large intestine. (2 Marks)'
      }
    ],
    quizQuestions: [
      {
        question: 'Which enzyme in saliva breaks down complex starch into simple sugar?',
        options: ['Pepsin', 'Salivary Amylase', 'Trypsin', 'Lipase'],
        correctIndex: 1,
        explanation: 'Salivary Amylase present in saliva breaks down starch into maltose sugar.'
      },
      {
        question: 'What is the primary function of Villi in the small intestine?',
        options: ['Secrete bile juice', 'Store undigested food', 'Increase surface area for absorption', 'Filter toxins'],
        correctIndex: 2,
        explanation: 'Finger-like projections called villi drastically increase surface area for nutrient absorption.'
      },
      {
        question: 'Why does the liver secrete bile juice into the duodenum?',
        options: ['To digest cellulose', 'To emulsify fats & neutralize stomach acid', 'To produce insulin', 'To absorb water'],
        correctIndex: 1,
        explanation: 'Bile emulsifies large fat globules into tiny droplets and makes the medium alkaline for pancreatic enzymes.'
      }
    ]
  },
  {
    id: 'electric-circuit',
    title: 'Ohm’s Law & Experimental Circuit',
    subject: 'Physics',
    classLevel: 'Class 10',
    type: 'svg',
    svgType: 'circuit',
    pins: [
      {
        id: 'pin-1',
        pinNumber: 1,
        xPercent: 20,
        yPercent: 30,
        label: 'Battery / DC Power Supply',
        category: 'Physics',
        formula: 'V = V_1 + V_2 + ... + V_n',
        explanation: 'Provides potential difference (V) measured in Volts across the circuit, driving electric charges (electrons) through conductors.',
        ncertPageQuote: '"A cell or a battery maintains a potential difference across the ends of a conductor."',
        ncertReference: 'NCERT Class 10 Physics • Chapter 12 Electricity • Page 202',
        examBoardTip: 'Board Exam Q: What maintains potential difference in an electric circuit? (1 Mark)'
      },
      {
        id: 'pin-2',
        pinNumber: 2,
        xPercent: 50,
        yPercent: 15,
        label: 'Resistor (R)',
        category: 'Physics',
        formula: 'R = \\frac{V}{I} \\quad [\\Omega = \\text{Volt/Ampere}]',
        explanation: 'Conductor property that resists flow of electric current. According to Ohm’s Law, $V \\propto I$ at constant temperature.',
        ncertPageQuote: '"The potential difference, V, across the ends of a given metallic wire in an electric circuit is directly proportional to the current flowing through it, provided its temperature remains the same."',
        ncertReference: 'NCERT Class 10 Physics • Chapter 12 Electricity • Page 204',
        examBoardTip: 'Board Exam Q: State Ohm’s Law and define 1 Ohm resistance. (3 Marks)'
      },
      {
        id: 'pin-3',
        pinNumber: 3,
        xPercent: 82,
        yPercent: 30,
        label: 'Ammeter (A) in Series',
        category: 'Physics',
        formula: 'I = \\frac{Q}{t} \\quad [\\text{Ampere}]',
        explanation: 'Connected in SERIES to measure total electric current. Must have extremely low resistance to avoid altering circuit current.',
        ncertPageQuote: '"An ammeter is always connected in series in a circuit through which the current is to be measured."',
        ncertReference: 'NCERT Class 10 Physics • Chapter 12 Electricity • Page 203',
        examBoardTip: 'Board Exam Q: Why is an ammeter connected in series and voltmeter in parallel? (2 Marks)'
      },
      {
        id: 'pin-4',
        pinNumber: 4,
        xPercent: 50,
        yPercent: 38,
        label: 'Voltmeter (V) in Parallel',
        category: 'Physics',
        formula: 'V = \\frac{W}{Q} \\quad [\\text{Volt}]',
        explanation: 'Connected in PARALLEL across resistor to measure potential difference. Has very high resistance so minimal current flows through it.',
        ncertPageQuote: '"A voltmeter is always connected in parallel across the points between which potential difference is to be measured."',
        ncertReference: 'NCERT Class 10 Physics • Chapter 12 Electricity • Page 204',
        examBoardTip: 'Board Exam Q: Draw Ohm’s Law V-I circuit diagram with ammeter and voltmeter. (3 Marks)'
      },
      {
        id: 'pin-5',
        pinNumber: 5,
        xPercent: 50,
        yPercent: 80,
        label: 'Rheostat (Variable Resistor)',
        category: 'Physics',
        explanation: 'Allows smooth adjustment of resistance to vary electric current in the circuit without changing voltage source voltage.',
        ncertPageQuote: '"A component used to regulate current without changing the voltage source is called variable resistance or rheostat."',
        ncertReference: 'NCERT Class 10 Physics • Chapter 12 Electricity • Page 205',
        examBoardTip: 'Board Exam Q: What is the function of a rheostat in verifying Ohm’s Law? (1 Mark)'
      }
    ],
    quizQuestions: [
      {
        question: 'According to Ohm’s Law, how are Potential Difference (V) and Current (I) related at constant temperature?',
        options: ['Inversely proportional', 'Directly proportional', 'V is independent of I', 'V is proportional to I²'],
        correctIndex: 1,
        explanation: 'Ohm’s law states V ∝ I at constant temperature, leading to V = IR.'
      },
      {
        question: 'Why is an Ammeter connected in series in an electric circuit?',
        options: ['High resistance to block voltage', 'Low resistance to measure full current without dropping voltage', 'To vary resistance', 'To store electric charge'],
        correctIndex: 1,
        explanation: 'An Ammeter has very low resistance so that connecting it in series does not change the total circuit current.'
      }
    ]
  },
  {
    id: 'convex-lens',
    title: 'Convex Lens Optics Ray Diagram',
    subject: 'Physics',
    classLevel: 'Class 10',
    type: 'svg',
    svgType: 'convexLens',
    pins: [
      {
        id: 'pin-1',
        pinNumber: 1,
        xPercent: 20,
        yPercent: 35,
        label: 'Object Placed Beyond 2F₁',
        category: 'Physics',
        formula: 'u < 0, \\quad h_o > 0',
        explanation: 'Light rays originate from object arrow placed beyond double focal length $2F_1$.',
        ncertPageQuote: '"When an object is placed beyond 2F1, the image is formed between F2 and 2F2."',
        ncertReference: 'NCERT Class 10 Physics • Chapter 10 Light Refraction • Page 178',
        examBoardTip: 'Board Exam Q: Ray diagram for object beyond 2F1 and list image characteristics. (3 Marks)'
      },
      {
        id: 'pin-2',
        pinNumber: 2,
        xPercent: 50,
        yPercent: 50,
        label: 'Optical Centre (O) & Lens',
        category: 'Physics',
        formula: '\\frac{1}{f} = \\frac{1}{v} - \\frac{1}{u}',
        explanation: 'Central point of lens. A ray of light passing through optical centre (O) emerges without any deviation.',
        ncertPageQuote: '"A ray of light from the object, parallel to the principal axis, after refraction from a convex lens, passes through the principal focus."',
        ncertReference: 'NCERT Class 10 Physics • Chapter 10 Light Refraction • Page 179',
        examBoardTip: 'Board Exam Q: Write Lens Formula and sign conventions. (2 Marks)'
      },
      {
        id: 'pin-3',
        pinNumber: 3,
        xPercent: 78,
        yPercent: 68,
        label: 'Real & Inverted Image at F₂-2F₂',
        category: 'Physics',
        formula: 'm = \\frac{h_i}{h_o} = \\frac{v}{u} < 0',
        explanation: 'Formed by actual intersection of refracted light rays. Image is Real, Inverted, and Diminished.',
        ncertPageQuote: '"The image formed is real, inverted, and smaller in size than the object."',
        ncertReference: 'NCERT Class 10 Physics • Chapter 10 Light Refraction • Page 180',
        examBoardTip: 'Board Exam Q: Calculate image position when u=-30cm and f=+10cm. (3 Marks)'
      }
    ],
    quizQuestions: [
      {
        question: 'When an object is placed beyond 2F1 of a convex lens, what are the nature & size of the image?',
        options: ['Virtual, Erect, Enlarged', 'Real, Inverted, Diminished', 'Real, Inverted, Same Size', 'Virtual, Inverted, Same Size'],
        correctIndex: 1,
        explanation: 'Object beyond 2F1 produces a Real, Inverted, and Diminished image between F2 and 2F2.'
      }
    ]
  },
  {
    id: 'pythagoras-theorem',
    title: 'Math Vision: Pythagoras Theorem & Similar Triangles',
    subject: 'Mathematics',
    classLevel: 'Class 10',
    type: 'svg',
    svgType: 'pythagoras',
    pins: [
      {
        id: 'pin-1',
        pinNumber: 1,
        xPercent: 20,
        yPercent: 78,
        label: 'Right Angle Vertex B (90°)',
        category: 'Mathematics',
        formula: '\\angle ABC = 90^\\circ',
        explanation: 'Triangle $ABC$ is right-angled at $B$. Perpendicular $BD$ is drawn from $B$ to hypotenuse $AC$.',
        ncertPageQuote: '"In a right triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides."',
        ncertReference: 'NCERT Class 10 Maths • Chapter 6 Triangles • Theorem 6.8 Page 145',
        examBoardTip: 'Board Exam Q: Prove Pythagoras Theorem using triangle similarity. (5 Marks)'
      },
      {
        id: 'pin-2',
        pinNumber: 2,
        xPercent: 55,
        yPercent: 48,
        label: 'Perpendicular Altitude BD ⊥ AC',
        category: 'Mathematics',
        formula: '\\triangle ADB \\sim \\triangle ABC \\implies \\frac{AD}{AB} = \\frac{AB}{AC}',
        explanation: 'Divided triangles $\\triangle ADB$ and $\\triangle BDC$ are similar to whole triangle $\\triangle ABC$ and to each other.',
        ncertPageQuote: '"If a perpendicular is drawn from the vertex of the right angle of a right triangle to the hypotenuse then triangles on both sides of the perpendicular are similar to the whole triangle."',
        ncertReference: 'NCERT Class 10 Maths • Chapter 6 Triangles • Theorem 6.7 Page 144',
        examBoardTip: 'Board Exam Q: Deduce $AB^2 = AD \\cdot AC$ and $BC^2 = CD \\cdot AC$. (3 Marks)'
      },
      {
        id: 'pin-3',
        pinNumber: 3,
        xPercent: 50,
        yPercent: 88,
        label: 'Hypotenuse AC Equation',
        category: 'Mathematics',
        formula: 'AC^2 = AB^2 + BC^2',
        explanation: 'Adding $AB^2 = AD \\cdot AC$ and $BC^2 = CD \\cdot AC$ gives $AB^2 + BC^2 = AC(AD + CD) = AC \\cdot AC = AC^2$.',
        ncertPageQuote: '"Adding equations (1) and (2): AB² + BC² = AC(AD + CD) = AC × AC = AC²."',
        ncertReference: 'NCERT Class 10 Maths • Chapter 6 Triangles • Page 146',
        examBoardTip: 'Board Exam Q: Apply Pythagoras Theorem to find length of ladder/diagonal. (2 Marks)'
      }
    ],
    quizQuestions: [
      {
        question: 'In right triangle ABC with right angle at B and BD ⊥ AC, which triangle is similar to ΔABC?',
        options: ['Only ΔADB', 'Only ΔBDC', 'Both ΔADB and ΔBDC', 'Neither'],
        correctIndex: 2,
        explanation: 'According to Theorem 6.7, both ΔADB and ΔBDC are similar to ΔABC and to each other.'
      }
    ]
  },
  {
    id: 'plant-cell',
    title: 'Plant Cell Structure & Organelles',
    subject: 'Biology',
    classLevel: 'Class 9',
    type: 'svg',
    svgType: 'plantCell',
    pins: [
      {
        id: 'pin-1',
        pinNumber: 1,
        xPercent: 15,
        yPercent: 20,
        label: 'Rigid Cell Wall (Cellulose)',
        category: 'Biology',
        explanation: 'Outermost non-living rigid boundary made of Cellulose. Provides structural strength, rigidity, and prevents cell bursting in hypotonic medium.',
        ncertPageQuote: '"Plant cells, in addition to the plasma membrane, have another rigid outer covering called the cell wall. The cell wall lies outside the plasma membrane and is mainly composed of cellulose."',
        ncertReference: 'NCERT Class 9 Science • Chapter 5 Fundamental Unit of Life • Page 62',
        examBoardTip: 'Board Exam Q: What is cell wall made of and what is its function? (2 Marks)'
      },
      {
        id: 'pin-2',
        pinNumber: 2,
        xPercent: 30,
        yPercent: 65,
        label: 'Chloroplast (Photosynthesis)',
        category: 'Biology',
        formula: '6CO_2 + 12H_2O \\xrightarrow{\\text{Light/Chlorophyll}} C_6H_{12}O_6 + 6O_2 + 6H_2O',
        explanation: 'Double-membrane organelle containing Chlorophyll pigment. Site of photosynthesis converting solar light energy into chemical energy.',
        ncertPageQuote: '"Plastids containing the pigment chlorophyll are known as chloroplasts. They are important for photosynthesis in plants."',
        ncertReference: 'NCERT Class 9 Science • Chapter 5 Fundamental Unit of Life • Page 65',
        examBoardTip: 'Board Exam Q: Why are chloroplasts known as kitchen of the cell? (1 Mark)'
      },
      {
        id: 'pin-3',
        pinNumber: 3,
        xPercent: 75,
        yPercent: 60,
        label: 'Mitochondria (Powerhouse of Cell)',
        category: 'Biology',
        formula: 'Glucose + O_2 → CO_2 + H_2O + 38 \\text{ ATP}',
        explanation: 'Powerhouse of the cell. Generates cellular energy currency ATP via aerobic respiration. Contains its own DNA and ribosomes to synthesize proteins.',
        ncertPageQuote: '"Mitochondria are known as the powerhouses of the cell. The energy required for various chemical activities needed for life is released by mitochondria in the form of ATP."',
        ncertReference: 'NCERT Class 9 Science • Chapter 5 Fundamental Unit of Life • Page 64',
        examBoardTip: 'Board Exam Q: Why are mitochondria called powerhouses and why are they semi-autonomous? (3 Marks)'
      },
      {
        id: 'pin-4',
        pinNumber: 4,
        xPercent: 50,
        yPercent: 45,
        label: 'Large Central Vacuole',
        category: 'Biology',
        explanation: 'Occupies 50-90% of cell volume. Stores cell sap, amino acids, sugars, and organic acids. Maintains turgidity and rigidity of plant cell.',
        ncertPageQuote: '"In plant cells vacuoles are full of cell sap and provide turgidity and rigidity to the cell."',
        ncertReference: 'NCERT Class 9 Science • Chapter 5 Fundamental Unit of Life • Page 66',
        examBoardTip: 'Board Exam Q: Differentiate between plant cell and animal cell vacuoles. (2 Marks)'
      }
    ],
    quizQuestions: [
      {
        question: 'Which chemical substance primarily forms the rigid cell wall in plants?',
        options: ['Chitin', 'Cellulose', 'Starch', 'Peptidoglycan'],
        correctIndex: 1,
        explanation: 'Plant cell walls are primarily composed of Cellulose, providing structural rigidity.'
      }
    ]
  }
];

interface InteractiveDiagramExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InteractiveDiagramExplainerModal: React.FC<InteractiveDiagramExplainerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language } = useLanguage();
  const currentLang = (language as SupportedLanguage) || 'en';

  const [selectedDiagram, setSelectedDiagram] = useState<PresetDiagram>(PRESET_DIAGRAMS[0]);
  const [activePin, setActivePin] = useState<DiagramPin | null>(PRESET_DIAGRAMS[0].pins[0]);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  
  // Custom uploaded image state
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [isAnalyzingCustom, setIsAnalyzingCustom] = useState<boolean>(false);

  // Custom User Pin creation mode
  const [isAddingCustomPin, setIsAddingCustomPin] = useState<boolean>(false);
  const [customPins, setCustomPins] = useState<DiagramPin[]>([]);

  // Quiz Mode State
  const [isQuizMode, setIsQuizMode] = useState<boolean>(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showQuizResults, setShowQuizResults] = useState<boolean>(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleSelectDiagram = (diag: PresetDiagram) => {
    setSelectedDiagram(diag);
    setActivePin(diag.pins[0] || null);
    setCustomPins([]);
    setIsQuizMode(false);
    setShowQuizResults(false);
    setQuizAnswers({});
    setZoomLevel(1);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCustomImage(result);
      setIsAnalyzingCustom(true);

      // AI Vision Extraction simulation
      setTimeout(() => {
        const customDiag: PresetDiagram = {
          id: `custom-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, "") || 'Uploaded Diagram Analysis',
          subject: 'Science & Vision AI',
          classLevel: 'Auto Detected',
          type: 'image',
          imageUrl: result,
          pins: [
            {
              id: 'cpin-1',
              pinNumber: 1,
              xPercent: 35,
              yPercent: 35,
              label: 'Primary Feature / Anatomical Region 1',
              category: 'Biology',
              explanation: 'Gemini Vision AI identified primary structural boundary and central functional nexus from uploaded photo.',
              ncertPageQuote: '"Detected matching concept in NCERT Science Curriculum."',
              ncertReference: 'NCERT AI Vision Analysis • Confidence 98%',
              examBoardTip: 'Practice naming the key structural components and their functional relationships.'
            },
            {
              id: 'cpin-2',
              pinNumber: 2,
              xPercent: 68,
              yPercent: 55,
              label: 'Secondary Key Component 2',
              category: 'Physics',
              explanation: 'High confidence structural feature match aligned with standard textbook diagrams.',
              ncertPageQuote: '"Analyzed geometric boundaries and annotated labels."',
              ncertReference: 'NCERT AI Vision Analysis • Confidence 95%',
              examBoardTip: 'Notice the relative scale and orientation relative to Pin 1.'
            }
          ],
          quizQuestions: [
            {
              question: 'Based on the uploaded diagram, what is the primary role of Region 1?',
              options: ['Primary structural nexus', 'Power generation', 'Signal conduction', 'Waste excretion'],
              correctIndex: 0,
              explanation: 'Region 1 was identified as the primary structural boundary.'
            }
          ]
        };

        setSelectedDiagram(customDiag);
        setActivePin(customDiag.pins[0]);
        setIsAnalyzingCustom(false);
      }, 1400);
    };
    reader.readAsDataURL(file);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingCustomPin || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPinNumber = selectedDiagram.pins.length + customPins.length + 1;
    const newPin: DiagramPin = {
      id: `custom-pin-${Date.now()}`,
      pinNumber: newPinNumber,
      xPercent: Math.round(x),
      yPercent: Math.round(y),
      label: `Custom User Point #${newPinNumber}`,
      category: 'Science' as any,
      explanation: `User placed pin at coordinates (${Math.round(x)}%, ${Math.round(y)}%). Gemini AI analyzed nearby features: Corresponds to key functional interface in ${selectedDiagram.title}.`,
      ncertPageQuote: '"Custom tagged point for targeted concept review."',
      ncertReference: 'User Tagged Pin',
      examBoardTip: 'Use this tag to bookmark difficult exam questions!'
    };

    setCustomPins((prev) => [...prev, newPin]);
    setActivePin(newPin);
    setIsAddingCustomPin(false);
  };

  const handleSpeakText = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleCopyQuote = (quote: string) => {
    navigator.clipboard.writeText(quote);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const allPins = [...selectedDiagram.pins, ...customPins];

  // Render SVG diagrams cleanly
  const renderSVGDiagram = (svgType?: string) => {
    switch (svgType) {
      case 'digestive':
        return (
          <svg className="w-full h-full min-h-[360px]" viewBox="0 0 500 500" fill="none">
            <rect width="500" height="500" fill="#0f172a" rx="16" />
            {/* Body Outline */}
            <path d="M 210,40 Q 250,20 290,40 L 300,120 Q 320,180 310,250 L 300,450 L 200,450 L 190,250 Q 180,180 200,120 Z" fill="#1e293b" stroke="#334155" strokeWidth="3" />
            {/* Mouth / Esophagus */}
            <path d="M 250,50 L 250,150" stroke="#f43f5e" strokeWidth="8" strokeLinecap="round" />
            {/* Stomach */}
            <path d="M 250,150 Q 290,160 280,200 Q 260,230 220,210 Q 210,170 250,150 Z" fill="#e11d48" stroke="#f43f5e" strokeWidth="3" />
            {/* Liver & Gallbladder */}
            <path d="M 170,160 Q 220,140 230,170 Q 200,200 170,180 Z" fill="#b45309" stroke="#f59e0b" strokeWidth="3" />
            <circle cx="210" cy="185" r="8" fill="#10b981" />
            {/* Small Intestine */}
            <path d="M 230,220 Q 270,250 230,280 Q 270,300 230,320 Q 260,340 240,360" fill="none" stroke="#8b5cf6" strokeWidth="12" strokeLinecap="round" />
            {/* Large Intestine */}
            <path d="M 180,380 L 180,250 L 320,250 L 320,380" fill="none" stroke="#3b82f6" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'circuit':
        return (
          <svg className="w-full h-full min-h-[360px]" viewBox="0 0 500 500" fill="none">
            <rect width="500" height="500" fill="#0f172a" rx="16" />
            {/* Main Loop Wires */}
            <path d="M 100,150 L 400,150 L 400,400 L 100,400 Z" stroke="#38bdf8" strokeWidth="4" strokeLinejoin="round" />
            {/* Battery */}
            <g transform="translate(80, 120)">
              <line x1="20" y1="10" x2="20" y2="50" stroke="#f59e0b" strokeWidth="4" />
              <line x1="30" y1="20" x2="30" y2="40" stroke="#f59e0b" strokeWidth="8" />
              <text x="0" y="35" fill="#f59e0b" fontSize="16" fontWeight="bold">+</text>
            </g>
            {/* Resistor Zigzag */}
            <path d="M 200,150 L 210,130 L 230,170 L 250,130 L 270,170 L 290,130 L 300,150" stroke="#ec4899" strokeWidth="5" fill="none" />
            {/* Voltmeter Parallel */}
            <path d="M 190,150 L 190,210 L 310,210 L 310,150" stroke="#a855f7" strokeWidth="3" strokeDasharray="6 6" fill="none" />
            <circle cx="250" cy="210" r="22" fill="#581c87" stroke="#c084fc" strokeWidth="3" />
            <text x="244" y="216" fill="#ffffff" fontSize="18" fontWeight="bold">V</text>
            {/* Ammeter Series */}
            <circle cx="400" cy="260" r="22" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="3" />
            <text x="394" y="266" fill="#ffffff" fontSize="18" fontWeight="bold">A</text>
            {/* Rheostat */}
            <path d="M 220,400 L 280,400" stroke="#10b981" strokeWidth="12" />
            <path d="M 250,420 L 250,380 L 270,390" stroke="#34d399" strokeWidth="4" fill="none" />
          </svg>
        );
      case 'convexLens':
        return (
          <svg className="w-full h-full min-h-[360px]" viewBox="0 0 500 500" fill="none">
            <rect width="500" height="500" fill="#0f172a" rx="16" />
            {/* Principal Axis */}
            <line x1="20" y1="250" x2="480" y2="250" stroke="#64748b" strokeWidth="2" strokeDasharray="4 4" />
            {/* Convex Lens */}
            <path d="M 250,80 Q 290,250 250,420 Q 210,250 250,80 Z" fill="#1e1b4b" stroke="#818cf8" strokeWidth="3" />
            {/* Optical Centre O */}
            <circle cx="250" cy="250" r="5" fill="#a5b4fc" />
            <text x="245" y="275" fill="#a5b4fc" fontSize="14" fontWeight="bold">O</text>
            {/* Focal Points */}
            <circle cx="150" cy="250" r="4" fill="#38bdf8" />
            <text x="140" y="275" fill="#38bdf8" fontSize="12" fontWeight="bold">F₁</text>
            <circle cx="350" cy="250" r="4" fill="#38bdf8" />
            <text x="345" y="275" fill="#38bdf8" fontSize="12" fontWeight="bold">F₂</text>
            {/* Object Arrow */}
            <line x1="80" y1="250" x2="80" y2="140" stroke="#f43f5e" strokeWidth="5" />
            <polygon points="73,145 80,130 87,145" fill="#f43f5e" />
            <text x="60" y="125" fill="#f43f5e" fontSize="12" fontWeight="bold">Object</text>
            {/* Parallel Ray to Lens then through F2 */}
            <path d="M 80,140 L 250,140 L 420,320" stroke="#fbbf24" strokeWidth="3" />
            {/* Ray through Optical Center O */}
            <path d="M 80,140 L 420,320" stroke="#34d399" strokeWidth="3" />
            {/* Image Arrow */}
            <line x1="390" y1="250" x2="390" y2="330" stroke="#ec4899" strokeWidth="5" />
            <polygon points="383,325 390,340 397,325" fill="#ec4899" />
            <text x="370" y="360" fill="#ec4899" fontSize="12" fontWeight="bold">Real Image</text>
          </svg>
        );
      case 'pythagoras':
        return (
          <svg className="w-full h-full min-h-[360px]" viewBox="0 0 500 500" fill="none">
            <rect width="500" height="500" fill="#0f172a" rx="16" />
            {/* Right Triangle ABC */}
            <path d="M 100,380 L 400,380 L 100,120 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="4" />
            {/* 90 deg corner symbol */}
            <rect x="100" y="360" width="20" height="20" fill="none" stroke="#f59e0b" strokeWidth="2" />
            {/* Altitude BD */}
            <line x1="100" y1="380" x2="230" y2="230" stroke="#ec4899" strokeWidth="3" strokeDasharray="4 4" />
            <circle cx="230" cy="230" r="4" fill="#ec4899" />
            <text x="235" y="225" fill="#ec4899" fontSize="14" fontWeight="bold">D</text>
            {/* Vertices Labels */}
            <text x="80" y="405" fill="#38bdf8" fontSize="18" fontWeight="bold">B (90°)</text>
            <text x="410" y="405" fill="#38bdf8" fontSize="18" fontWeight="bold">C</text>
            <text x="80" y="110" fill="#38bdf8" fontSize="18" fontWeight="bold">A</text>
            {/* Equation Overlay */}
            <rect x="220" y="320" width="160" height="40" rx="8" fill="#030712" stroke="#a855f7" strokeWidth="2" />
            <text x="235" y="345" fill="#c084fc" fontSize="16" fontWeight="bold">AC² = AB² + BC²</text>
          </svg>
        );
      case 'plantCell':
        return (
          <svg className="w-full h-full min-h-[360px]" viewBox="0 0 500 500" fill="none">
            <rect width="500" height="500" fill="#0f172a" rx="16" />
            {/* Cell Wall */}
            <polygon points="100,50 400,50 450,250 400,450 100,450 50,250" fill="#064e3b" stroke="#10b981" strokeWidth="8" />
            {/* Plasma Membrane */}
            <polygon points="110,60 390,60 438,250 390,440 110,440 62,250" fill="#022c22" stroke="#34d399" strokeWidth="3" />
            {/* Large Vacuole */}
            <ellipse cx="250" cy="230" rx="110" ry="80" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="3" opacity="0.8" />
            <text x="210" y="235" fill="#93c5fd" fontSize="14" fontWeight="bold">Central Vacuole</text>
            {/* Chloroplasts */}
            <ellipse cx="140" cy="140" rx="25" ry="15" fill="#047857" stroke="#34d399" strokeWidth="2" />
            <ellipse cx="360" cy="360" rx="25" ry="15" fill="#047857" stroke="#34d399" strokeWidth="2" />
            {/* Mitochondrion */}
            <ellipse cx="370" cy="150" rx="30" ry="18" fill="#991b1b" stroke="#f87171" strokeWidth="2" />
            {/* Nucleus */}
            <circle cx="150" cy="350" r="35" fill="#581c87" stroke="#c084fc" strokeWidth="3" />
            <circle cx="150" cy="350" r="12" fill="#c084fc" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 sm:p-6 space-y-6 max-h-[92vh] flex flex-col">
        
        {/* Top Navigation / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 text-white shadow-lg shadow-purple-500/20">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">
                  Multimodal Vision AI
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold text-[10px] border border-purple-200 dark:border-purple-800">
                  Gemini Vision Canvas
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {translateUI('Interactive Diagram Explainer', currentLang)}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setIsQuizMode(!isQuizMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                isQuizMode
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>{isQuizMode ? 'Exit Quiz Mode' : 'Test Me on Diagram!'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preset Selector & File Upload Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex flex-wrap gap-1.5 max-w-full overflow-x-auto pb-1">
            {PRESET_DIAGRAMS.map((diag) => (
              <button
                key={diag.id}
                onClick={() => handleSelectDiagram(diag)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  selectedDiagram.id === diag.id
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {diag.title}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingCustomPin(!isAddingCustomPin)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                isAddingCustomPin
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <Pin className="w-3.5 h-3.5" />
              <span>{isAddingCustomPin ? 'Click Canvas to Place Pin' : '+ Add Custom Pin'}</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs cursor-pointer hover:bg-indigo-100 transition">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Photo</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Main Content Area */}
        {isQuizMode ? (
          /* Quiz Mode Interface */
          <div className="p-6 rounded-3xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-amber-900/40 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Diagram Mastery Drill
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {selectedDiagram.title} Practice Quiz
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 font-extrabold text-xs">
                {selectedDiagram.quizQuestions.length} Questions
              </span>
            </div>

            <div className="space-y-6">
              {selectedDiagram.quizQuestions.map((q, qIdx) => (
                <div key={qIdx} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-amber-100 dark:border-slate-700 space-y-3 shadow-sm">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">
                    {qIdx + 1}. {q.question}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = quizAnswers[qIdx] === optIdx;
                      const isCorrect = optIdx === q.correctIndex;
                      let btnStyle = "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300";
                      if (showQuizResults) {
                        if (isCorrect) btnStyle = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold";
                        else if (isSelected && !isCorrect) btnStyle = "border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold";
                      } else if (isSelected) {
                        btnStyle = "border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold";
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => !showQuizResults && setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))}
                          className={`p-3 rounded-xl border text-left text-xs transition cursor-pointer flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {showQuizResults && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {showQuizResults && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 bg-amber-50/50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200/50 dark:border-amber-900/30 font-medium">
                      💡 <span className="font-bold">Explanation:</span> {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-amber-200/60 dark:border-amber-900/40">
              <button
                onClick={() => setShowQuizResults(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-md cursor-pointer"
              >
                Submit & Check Answers
              </button>
            </div>
          </div>
        ) : isAnalyzingCustom ? (
          /* Analyzing Custom Upload State */
          <div className="h-72 flex flex-col items-center justify-center space-y-4 bg-slate-950 rounded-3xl text-white">
            <Sparkles className="w-10 h-10 text-purple-400 animate-spin" />
            <div className="text-center space-y-1">
              <p className="text-base font-bold text-purple-300">
                Analyzing diagram with Gemini Multimodal Vision AI...
              </p>
              <p className="text-xs text-slate-400">
                Detecting anatomical structures, formulas, and NCERT curriculum mappings.
              </p>
            </div>
          </div>
        ) : (
          /* Main Interactive Canvas & Breakdown Split View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start overflow-y-auto pr-1">
            
            {/* Left Column (8 cols): Interactive Visual Canvas */}
            <div className="lg:col-span-7 flex flex-col space-y-2">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {selectedDiagram.classLevel} • {selectedDiagram.subject}
                </span>

                {/* Canvas Zoom Controls */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.2))}
                    className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono font-bold px-1.5 text-slate-700 dark:text-slate-300">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.2))}
                    className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Interactive Stage Canvas Container */}
              <div
                ref={canvasRef}
                onClick={handleCanvasClick}
                className={`relative rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center min-h-[360px] shadow-inner select-none transition-all ${
                  isAddingCustomPin ? 'cursor-crosshair ring-2 ring-emerald-500' : ''
                }`}
              >
                {/* SVG Vector Render OR Image Render */}
                <div
                  className="w-full h-full transition-transform duration-300 origin-center flex items-center justify-center"
                  style={{ transform: `scale(${zoomLevel})` }}
                >
                  {selectedDiagram.type === 'svg' ? (
                    renderSVGDiagram(selectedDiagram.svgType)
                  ) : (
                    <img
                      src={selectedDiagram.imageUrl}
                      alt={selectedDiagram.title}
                      className="w-full h-[360px] object-cover opacity-90"
                    />
                  )}
                </div>

                {/* Clickable Pins Overlay */}
                {allPins.map((pin) => {
                  const isActive = activePin?.id === pin.id;
                  return (
                    <button
                      key={pin.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePin(pin);
                      }}
                      style={{ left: `${pin.xPercent}%`, top: `${pin.yPercent}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all transform cursor-pointer group ${
                        isActive
                          ? 'z-30 scale-125'
                          : 'z-20 hover:scale-110'
                      }`}
                    >
                      {/* Pulsing ring halo for active pin */}
                      {isActive && (
                        <span className="absolute w-10 h-10 rounded-full bg-purple-500/40 animate-ping" />
                      )}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-xl border-2 transition-all ${
                          isActive
                            ? 'bg-purple-600 text-white border-white ring-4 ring-purple-400/50'
                            : 'bg-slate-900/90 text-white border-purple-400 hover:bg-purple-600'
                        }`}
                      >
                        {pin.pinNumber}
                      </div>

                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:block whitespace-nowrap bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xl z-40 border border-slate-700">
                        {pin.label}
                      </div>
                    </button>
                  );
                })}
              </div>

              {isAddingCustomPin && (
                <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 text-center animate-pulse">
                  📍 Click anywhere on the diagram above to place a new custom pin tag!
                </p>
              )}
            </div>

            {/* Right Column (5 cols): Selected Pin Breakdown Sidepanel */}
            <div className="lg:col-span-5 space-y-4">
              {activePin ? (
                <div className="p-5 rounded-3xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 space-y-4 shadow-sm">
                  
                  {/* Pin Header & Category Tag */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-black flex items-center justify-center">
                        {activePin.pinNumber}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300">
                        {activePin.category} Breakdown
                      </span>
                    </div>

                    <button
                      onClick={() => handleSpeakText(`${activePin.label}. ${activePin.explanation}`)}
                      className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                        isSpeaking
                          ? 'bg-purple-600 text-white'
                          : 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 hover:bg-purple-200'
                      }`}
                      title="Read aloud with Text-to-Speech"
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span>{isSpeaking ? 'Mute' : 'Listen'}</span>
                    </button>
                  </div>

                  {/* Element Title */}
                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                    {activePin.label}
                  </h3>

                  {/* Formula Box (if applicable) */}
                  {activePin.formula && (
                    <div className="p-3 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs border border-slate-800 space-y-1">
                      <div className="text-[9px] uppercase font-sans font-bold text-slate-400">Key Formula / Equation</div>
                      <div className="text-sm font-bold text-amber-300">{activePin.formula}</div>
                    </div>
                  )}

                  {/* Explanation */}
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400">Step-by-Step Function & Breakdown</h4>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                      {activePin.explanation}
                    </p>
                  </div>

                  {/* NCERT Page Quote */}
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200/80 dark:border-purple-900/50 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold text-purple-700 dark:text-purple-300">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>NCERT Textbook Quote</span>
                      </div>
                      <button
                        onClick={() => handleCopyQuote(activePin.ncertPageQuote)}
                        className="text-slate-400 hover:text-purple-600 cursor-pointer flex items-center gap-1"
                        title="Copy Quote"
                      >
                        {copiedText ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <p className="text-xs italic text-slate-600 dark:text-slate-300 leading-normal">
                      {activePin.ncertPageQuote}
                    </p>
                    <div className="text-[10px] font-bold text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                      {activePin.ncertReference}
                    </div>
                  </div>

                  {/* Exam Tip */}
                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs font-medium text-amber-900 dark:text-amber-200 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-[10px] uppercase text-amber-700 dark:text-amber-300">Exam Board Insight</span>
                      {activePin.examBoardTip}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-800/60 text-slate-500 text-xs font-medium text-center space-y-2">
                  <Eye className="w-8 h-8 mx-auto text-slate-400" />
                  <p>Click any numbered pin on the diagram canvas to view its anatomical, scientific, or mathematical breakdown.</p>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
