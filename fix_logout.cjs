const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Replace loginWithGoogle
code = code.replace(
  /const loginWithGoogle = \(\) => \{\n\s*setUser\(\{[\s\S]*?\}\);\n\s*setIsOnboarded\(true\);\n\s*localStorage\.setItem\('studypilot_onboarded', 'true'\);\n\s*\};/,
  `const { signInWithGoogle, logout: authLogout } = useAuth();
  const loginWithGoogle = async () => {
    try {
      await signInWithGoogle();
      setIsOnboarded(true);
      localStorage.setItem('studypilot_onboarded', 'true');
    } catch(err) { console.error(err); }
  };`
);

// Replace logout
code = code.replace(
  /const logout = \(\) => \{\n\s*setUser\(\{[\s\S]*?\}\);\n\s*\};/,
  `const logout = async () => {
    await authLogout();
  };`
);

fs.writeFileSync('src/context/AppContext.tsx', code);
