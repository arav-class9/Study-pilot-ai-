const fs = require('fs');
let code = fs.readFileSync('src/services/aiClient.ts', 'utf8');

const importReplacement = `import { auth, db } from '../lib/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

async function checkClientSideLimits() {
  const user = auth.currentUser;
  if (!user) return;
  const uid = user.uid;
  try {
    const limitRef = doc(db, 'usageLimits', uid);
    const docSnap = await getDoc(limitRef);
    let currentUsage = 0;
    if (docSnap.exists()) {
      currentUsage = docSnap.data()?.aiQuestions || 0;
    }
    
    const subRef = doc(db, 'subscriptions', uid);
    const subSnap = await getDoc(subRef);
    const plan = subSnap.exists() ? subSnap.data()?.plan || 'free' : 'free';
    
    const limits: any = {
      free: 10,
      plus: 100,
      pro: 99999
    };
    
    if (currentUsage >= limits[plan]) {
      throw new Error('Usage limit reached. Please upgrade your plan.');
    }
    
    await setDoc(limitRef, { aiQuestions: currentUsage + 1 }, { merge: true });
  } catch (err) {
    if (err.message === 'Usage limit reached. Please upgrade your plan.') throw err;
    console.error('Client limit check error:', err);
  }
}

async function getAuthHeaders() {
  await checkClientSideLimits();
  const token = await auth.currentUser?.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${token}\`
  };
}
`;

code = code.replace(
  "import { auth } from '../lib/firebase/config';\n\nasync function getAuthHeaders() {\n  const token = await auth.currentUser?.getIdToken();\n  return {\n    'Content-Type': 'application/json',\n    'Authorization': `Bearer ${token}`\n  };\n}",
  importReplacement
);

fs.writeFileSync('src/services/aiClient.ts', code);
