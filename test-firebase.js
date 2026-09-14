const { getApps, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

try {
  throw new Error("Simulated init fail");
} catch(e) {
  console.log("Failed");
}
console.log(getApps().length);
try {
  const auth = getAuth();
  console.log("Auth success");
} catch(e) {
  console.log("Auth failed:", e.message);
}
