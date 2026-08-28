const fs = require('fs');
let code = fs.readFileSync('src/services/aiClient.ts', 'utf8');

const importStatement = `import { auth } from '../lib/firebase/config';

async function getAuthHeaders() {
  const token = await auth.currentUser?.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${token}\`
  };
}
`;
code = importStatement + code;

// Replace generic headers
code = code.replace(/headers:\s*{\s*'Content-Type':\s*'application\/json',\s*}/g, 'headers: await getAuthHeaders()');
code = code.replace(/headers:\s*{\s*'Content-Type':\s*'application\/json'\s*}/g, 'headers: await getAuthHeaders()');

fs.writeFileSync('src/services/aiClient.ts', code);
