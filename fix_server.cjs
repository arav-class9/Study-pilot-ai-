const fs = require('fs');

// Fix routes.ts
let routes = fs.readFileSync('server/routes.ts', 'utf8');
routes = routes.replace("import { requireAuth, checkUsageLimits } from './middleware.js';", "import { requireAuth } from './middleware.js';");
routes = routes.replace("apiRouter.use(checkUsageLimits);\n", "");
fs.writeFileSync('server/routes.ts', routes);

// Fix middleware.ts
let middleware = fs.readFileSync('server/middleware.ts', 'utf8');
middleware = middleware.replace("import { adminAuth, adminDb } from './firebaseAdmin.js';", "import { adminAuth } from './firebaseAdmin.js';");

// Remove checkUsageLimits export completely
const idx = middleware.indexOf('export const checkUsageLimits');
if (idx !== -1) {
  middleware = middleware.substring(0, idx);
}
fs.writeFileSync('server/middleware.ts', middleware);

// Fix firebaseAdmin.ts (remove adminDb)
let admin = fs.readFileSync('server/firebaseAdmin.ts', 'utf8');
admin = admin.replace("import { getFirestore } from 'firebase-admin/firestore';\n", "");
admin = admin.replace("export const adminDb = getFirestore(getApps()[0], process.env.VITE_FIREBASE_DATABASE_ID);\n", "");
fs.writeFileSync('server/firebaseAdmin.ts', admin);

