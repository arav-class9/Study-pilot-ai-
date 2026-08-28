const fs = require('fs');
let code = fs.readFileSync('server/firebaseAdmin.ts', 'utf8');

code = code.replace(
  'export const adminDb = getFirestore();',
  'export const adminDb = getFirestore(getApps()[0], process.env.VITE_FIREBASE_DATABASE_ID);'
);

fs.writeFileSync('server/firebaseAdmin.ts', code);
