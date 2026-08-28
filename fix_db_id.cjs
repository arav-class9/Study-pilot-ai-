const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase/config.ts', 'utf8');

code = code.replace(
  'export const db = getFirestore(app);',
  'export const db = getFirestore(app, import.meta.env.VITE_FIREBASE_DATABASE_ID);'
);

fs.writeFileSync('src/lib/firebase/config.ts', code);
