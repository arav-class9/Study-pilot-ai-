const fs = require('fs');
let dbCode = fs.readFileSync('src/lib/firebase/db.ts', 'utf8');

// Use query limit for getQuizAttempts
dbCode = dbCode.replace(
  "query(collection(db, 'quizAttempts'), where('userId', '==', userId), orderBy('timestamp', 'desc'));",
  "query(collection(db, 'quizAttempts'), where('userId', '==', userId), orderBy('timestamp', 'desc'), limit(100));"
);

// Include limit in imports if missing
if (!dbCode.includes('limit')) {
  dbCode = dbCode.replace(
    "query, where, orderBy, deleteDoc, serverTimestamp, writeBatch }",
    "query, where, orderBy, deleteDoc, serverTimestamp, writeBatch, limit }"
  );
}

// Add limit for getExamAttempts
dbCode = dbCode.replace(
  "query(collection(db, 'examAttempts'), where('userId', '==', userId));",
  "query(collection(db, 'examAttempts'), where('userId', '==', userId), orderBy('timestamp', 'desc'), limit(50));"
);

fs.writeFileSync('src/lib/firebase/db.ts', dbCode);
console.log('db.ts patched with limits.');
