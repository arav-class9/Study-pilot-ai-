const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// For updateProfile
code = code.replace(
  /const updateProfile = \(updates: Partial<UserProfile>\) => \{\n\s*setUser\(\(prev\) => \{\n\s*const updated = \{ \.\.\.prev, \.\.\.updates \};\n\s*return updated;\n\s*\}\);\n\s*\};/,
  `const updateProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      if (firebaseUser) {
        DatabaseService.setProfile(firebaseUser.uid, updated).catch(console.error);
      }
      return updated;
    });
  };`
);

// For addQuizAttempt
code = code.replace(
  /const addQuizAttempt = \(attempt: Omit<QuizAttempt, 'id' | 'timestamp'>\) => \{\n\s*const newAttempt: QuizAttempt = \{ \.\.\.attempt, id: crypto\.randomUUID\(\), timestamp: new Date\(\)\.toISOString\(\) \};\n\s*setQuizAttempts\(\(prev\) => \[newAttempt, \.\.\.prev\]\);\n\s*updateTopicProgress\(newAttempt\);\n\s*\};/,
  `const addQuizAttempt = (attempt: Omit<QuizAttempt, 'id' | 'timestamp'>) => {
    const newAttempt: QuizAttempt = { ...attempt, id: crypto.randomUUID(), timestamp: new Date().toISOString() };
    setQuizAttempts((prev) => [newAttempt, ...prev]);
    if (firebaseUser) {
      DatabaseService.saveQuizAttempt(firebaseUser.uid, newAttempt).catch(console.error);
    }
    updateTopicProgress(newAttempt);
  };`
);

fs.writeFileSync('src/context/AppContext.tsx', code);
