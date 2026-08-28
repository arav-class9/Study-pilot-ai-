const fs = require('fs');
let code = fs.readFileSync('src/services/aiClient.ts', 'utf8');

code = code.replace(
  "const response = await fetch('/api/ai/benchmark');",
  "const response = await fetch('/api/ai/benchmark', { headers: await getAuthHeaders() });"
);

fs.writeFileSync('src/services/aiClient.ts', code);
