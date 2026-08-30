const fs = require('fs');
let code = fs.readFileSync('src/pages/ExamPage.tsx', 'utf8');

code = code.replace(
  /            <\/div>\n          <\/div>\n          <\/div>\n          \{\/\* Question by Question Review \*\/\}/g,
  `            </div>
          </div>
          {/* Question by Question Review */}`
);

fs.writeFileSync('src/pages/ExamPage.tsx', code);
