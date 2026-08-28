const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase/db.ts', 'utf8');

// Find the import line
code = code.replace(
  /query, where, orderBy, deleteDoc, serverTimestamp, writeBatch }/g,
  "query, where, orderBy, deleteDoc, serverTimestamp, writeBatch, limit }"
);

fs.writeFileSync('src/lib/firebase/db.ts', code);
