const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase/db.ts', 'utf8');

code = code.replace(
  "query, where, orderBy, deleteDoc, serverTimestamp, writeBatch } from 'firebase/firestore';",
  "query, where, orderBy, deleteDoc, serverTimestamp, writeBatch, limit } from 'firebase/firestore';"
);

fs.writeFileSync('src/lib/firebase/db.ts', code);
