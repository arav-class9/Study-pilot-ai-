const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

if (!code.includes('/subjectDiscussions/')) {
  const insertion = `
    match /subjectDiscussions/{docId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isAuthenticated() && (
        request.auth.uid == resource.data.userId || 
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['likes'])
      );
      allow delete: if isAuthenticated() && request.auth.uid == resource.data.userId;
    }
`;
  code = code.replace(/match \/questions\/\{docId\} \{.*?\}/s, match => match + insertion);
  fs.writeFileSync('firestore.rules', code, 'utf8');
}
