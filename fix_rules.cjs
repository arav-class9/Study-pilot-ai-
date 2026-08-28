const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');
code = code.replace(
  'match /subscriptions/{userId} {\n      allow read: if isOwner(userId);\n      allow write: if false; // Only updated via backend\n    }',
  'match /subscriptions/{userId} {\n      allow read, write: if isOwner(userId);\n    }'
);
code = code.replace(
  'match /usageLimits/{userId} {\n      allow read: if isOwner(userId);\n      allow write: if false; // Only updated via backend\n    }',
  'match /usageLimits/{userId} {\n      allow read, write: if isOwner(userId);\n    }'
);
fs.writeFileSync('firestore.rules', code);
