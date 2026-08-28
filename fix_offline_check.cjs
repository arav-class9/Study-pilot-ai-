const fs = require('fs');
let code = fs.readFileSync('src/services/aiClient.ts', 'utf8');

code = code.replace(
  "console.error('Client limit check error:', err);",
  "if (err.message && err.message.includes('offline')) {\n      console.warn('Skipping limit check due to offline client');\n    } else {\n      console.warn('Client limit check warning:', err.message);\n    }"
);

fs.writeFileSync('src/services/aiClient.ts', code);
