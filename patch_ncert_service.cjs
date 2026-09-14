const fs = require('fs');
const filePath = 'src/services/ncertService.ts';
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(
  /if \(!res\.ok\) \{\s+const err = await res\.json\(\)\.catch\(\(\) => \(\{\}\)\);\s+throw new Error\(err\.error \|\| 'Failed to generate comprehensive NCERT test\.'\);\s+\}/g,
  `if (!res.ok) {
      let err: any = {};
      try {
        err = await res.json();
      } catch (parseError) {
        const text = await res.text().catch(() => 'Unknown Server Error');
        err = { error: \`Server Error \${res.status}: \${text.substring(0, 150)}\` };
      }
      throw new Error(err.error || 'Failed to generate comprehensive NCERT test.');
    }`
);

fs.writeFileSync(filePath, code, 'utf8');
