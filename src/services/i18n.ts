export type TranslationKey =
  | 'home.greeting'
  | 'home.tagline'
  | 'home.streak'
  | 'home.xp'
  | 'home.today_goal'
  | 'home.revision_due'
  | 'home.start_revision'
  | 'home.what_next'
  | 'home.weakness_radar'
  | 'home.mistake_challenge'
  | 'home.exam_countdown'
  | 'home.weekly_progress'
  | 'home.quick_doubt'
  | 'home.explore_chapters'
  | 'nav.home'
  | 'nav.learn'
  | 'nav.practice'
  | 'nav.tutor'
  | 'nav.radar'
  | 'nav.plan'
  | 'nav.progress'
  | 'nav.mistakes'
  | 'nav.exam'
  | 'nav.parent'
  | 'nav.teacher'
  | 'nav.profile'
  | 'quiz.submit'
  | 'quiz.next'
  | 'quiz.previous'
  | 'quiz.accuracy'
  | 'quiz.score'
  | 'mistakes.title'
  | 'mistakes.unresolved'
  | 'mistakes.resolved'
  | 'mistakes.save_btn'
  | 'mistakes.start_challenge'
  | 'exam.title'
  | 'exam.start'
  | 'exam.submit'
  | 'exam.time_left'
  | 'tutor.ask_placeholder'
  | 'tutor.check_solution'
  | 'tutor.speak'
  | 'general.loading'
  | 'general.save'
  | 'general.search'
  | 'general.verified'
  | 'general.offline_warning';

export const translations: Record<'en' | 'hi', Record<TranslationKey, string>> = {
  en: {
    'home.greeting': 'Good day',
    'home.tagline': "Study smarter. Improve every day. Let's conquer your weak concepts!",
    'home.streak': 'Study Streak',
    'home.xp': 'XP Earned',
    'home.today_goal': "Today's Study Target",
    'home.revision_due': 'Spaced Repetition Due',
    'home.start_revision': 'Start Revision',
    'home.what_next': 'What Should I Study Next?',
    'home.weakness_radar': 'Academic Weakness Radar',
    'home.mistake_challenge': 'Mistake Challenge Drill',
    'home.exam_countdown': 'Target Exam Countdown',
    'home.weekly_progress': 'Weekly Study Telemetry',
    'home.quick_doubt': 'Ask Doubt / Scan Photo',
    'home.explore_chapters': 'Curriculum & Chapter Explorer',
    'nav.home': 'Home',
    'nav.learn': 'Learn & Notes',
    'nav.practice': 'Practice Quiz',
    'nav.tutor': 'AI Tutor',
    'nav.radar': 'Weakness Radar',
    'nav.plan': 'Study Plan',
    'nav.progress': 'Progress',
    'nav.mistakes': 'My Mistakes',
    'nav.exam': 'Exam Mode',
    'nav.parent': 'Parent View',
    'nav.teacher': 'Teacher Portal',
    'nav.profile': 'Profile',
    'quiz.submit': 'Submit Answers',
    'quiz.next': 'Next Question',
    'quiz.previous': 'Previous Question',
    'quiz.accuracy': 'Accuracy',
    'quiz.score': 'Score',
    'mistakes.title': 'My Mistakes Notebook',
    'mistakes.unresolved': 'Unresolved Mistakes',
    'mistakes.resolved': 'Mastered & Resolved',
    'mistakes.save_btn': 'Save to Mistake Notebook',
    'mistakes.start_challenge': 'Launch Mistake Challenge',
    'exam.title': 'Full Exam & Mock Simulator',
    'exam.start': 'Start Examination',
    'exam.submit': 'Submit Final Exam',
    'exam.time_left': 'Time Remaining',
    'tutor.ask_placeholder': 'Ask any academic question, doubt, or paste formula...',
    'tutor.check_solution': 'Check My Handwritten Solution',
    'tutor.speak': 'Voice Tutor Audio',
    'general.loading': 'Loading AI response...',
    'general.save': 'Save',
    'general.search': 'Search chapters, notes, mistakes (Ctrl+K)...',
    'general.verified': 'Verified Solution',
    'general.offline_warning': 'You are currently offline. Local notes & curriculum are available.',
  },
  hi: {
    'home.greeting': 'नमस्ते',
    'home.tagline': 'होशियारी से पढ़ें। हर दिन बेहतर बनें। कठिन कॉन्सेप्ट्स को आसानी से समझें!',
    'home.streak': 'अध्ययन स्ट्रीक',
    'home.xp': 'अर्जित XP',
    'home.today_goal': 'आज का अध्ययन लक्ष्य',
    'home.revision_due': 'दोहराने के लिए विषय (रिवीजन)',
    'home.start_revision': 'रिवीजन शुरू करें',
    'home.what_next': 'आगे क्या पढ़ना चाहिए?',
    'home.weakness_radar': 'कमजोरी पहचान रडार',
    'home.mistake_challenge': 'गलती सुधार अभ्यास',
    'home.exam_countdown': 'परीक्षा उल्टी गिनती',
    'home.weekly_progress': 'साप्ताहिक प्रगति विवरण',
    'home.quick_doubt': 'सवाल पूछें / फोटो स्कैन करें',
    'home.explore_chapters': 'पाठ्यक्रम एवं अध्याय',
    'nav.home': 'होम',
    'nav.learn': 'सीखें और नोट्स',
    'nav.practice': 'अभ्यास क्विज',
    'nav.tutor': 'AI शिक्षक',
    'nav.radar': 'कमजोरी रडार',
    'nav.plan': 'अध्ययन योजना',
    'nav.progress': 'प्रगति',
    'nav.mistakes': 'मेरी गलतियां',
    'nav.exam': 'परीक्षा मोड',
    'nav.parent': 'अभिभावक डैशबोर्ड',
    'nav.teacher': 'शिक्षक पोर्टल',
    'nav.profile': 'प्रोफाइल',
    'quiz.submit': 'उत्तर जमा करें',
    'quiz.next': 'अगला प्रश्न',
    'quiz.previous': 'पिछला प्रश्न',
    'quiz.accuracy': 'सटीकता',
    'quiz.score': 'अंक',
    'mistakes.title': 'गलतियों की नोटबुक',
    'mistakes.unresolved': 'अनसुलझी गलतियां',
    'mistakes.resolved': 'सुधार ली गई गलतियां',
    'mistakes.save_btn': 'गलती नोटबुक में सहेजें',
    'mistakes.start_challenge': 'गलती सुधार क्विज शुरू करें',
    'exam.title': 'बोर्ड परीक्षा एवं मॉक टेस्ट',
    'exam.start': 'परीक्षा शुरू करें',
    'exam.submit': 'परीक्षा समाप्त कर जमा करें',
    'exam.time_left': 'शेष समय',
    'tutor.ask_placeholder': 'कोई भी शैक्षिक प्रश्न, डाउट पूछें या फोटो अपलोड करें...',
    'tutor.check_solution': 'मेरी हस्तलिखित हल की जांच करें',
    'tutor.speak': 'आवाज में समझाएं',
    'general.loading': 'उत्तर तैयार हो रहा है...',
    'general.save': 'सहेजें',
    'general.search': 'अध्याय, नोट्स, गलतियां खोजें (Ctrl+K)...',
    'general.verified': 'सत्यापित समाधान',
    'general.offline_warning': 'आप अभी ऑफलाइन हैं। सहेजे गए नोट्स उपलब्ध हैं।',
  },
};

export function getTranslation(key: TranslationKey, lang: 'en' | 'hi' = 'en'): string {
  return translations[lang]?.[key] || translations.en[key] || key;
}
