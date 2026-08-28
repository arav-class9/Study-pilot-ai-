const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const imports = `import { useAuth } from './AuthContext';
import { DatabaseService } from '../lib/firebase/db';\n`;

// Prepend imports
code = code.replace("import React, {", imports + "import React, {");

// Inject useAuth inside AppProvider
code = code.replace(
  "export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {",
  `export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: firebaseUser } = useAuth();
  
  useEffect(() => {
    if (firebaseUser) {
      DatabaseService.getProfile(firebaseUser.uid).then(profile => {
        if (profile) {
          setUser(prev => ({ ...prev, ...profile }));
        } else {
          // Create profile
          DatabaseService.setProfile(firebaseUser.uid, user);
        }
      });
      // Similarly, fetch other collections for full sync (omitted for brevity, we focus on profile/usage syncing for now)
    }
  }, [firebaseUser]);\n`
);

fs.writeFileSync('src/context/AppContext.tsx', code);
