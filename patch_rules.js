const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

// Add hasRole, isTeacher, isParent
const roleChecks = `
    function hasRole(role) {
      return get(/databases/$(database)/documents/profiles/$(request.auth.uid)).data.role == role;
    }
    function isTeacher() { return hasRole('teacher'); }
    function isParent() { return hasRole('parent'); }
    function isAdmin() { return hasRole('admin'); }
    function isAuthorizedForStudent(studentId) {
      return isOwner(studentId) || isTeacher() || isParent() || isAdmin();
    }
`;

rules = rules.replace(
  'function isOwner(userId) {',
  roleChecks + '\n    function isOwner(userId) {'
);

// Replace `if isOwner(...)` with `if isAuthorizedForStudent(...)` for read access on student data
rules = rules.replace(/allow read, update, delete: if isOwner\(resource\.data\.userId\);/g, 'allow update, delete: if isOwner(resource.data.userId);\n      allow read: if isAuthorizedForStudent(resource.data.userId);');
rules = rules.replace(/allow read, write: if isOwner\(userId\);/g, 'allow write: if isOwner(userId);\n      allow read: if isAuthorizedForStudent(userId);');

fs.writeFileSync('firestore.rules', rules);
