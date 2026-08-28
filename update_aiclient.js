const fs = require('fs');
let code = fs.readFileSync('src/services/aiClient.ts', 'utf8');

// Add import
const importStatement = `import { auth } from '../lib/firebase/config';\n\nasync function getAuthHeaders() {\n  const token = await auth.currentUser?.getIdToken();\n  return {\n    'Content-Type': 'application/json',\n    'Authorization': \`Bearer \${token}\`\n  };\n}\n`;
code = importStatement + code;

// Replace fetch headers
code = code.replace(/headers:\s*{\s*'Content-Type':\s*'application\/json',\s*},/g, 'headers: await getAuthHeaders(),');

fs.writeFileSync('src/services/aiClient.ts', code);
