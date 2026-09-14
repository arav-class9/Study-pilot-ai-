const http = require('http');
const payload = JSON.stringify({
  bookId: 'custom-book-123',
  chapterId: 'custom-chapter-123',
  chapterName: 'NCERT Class 9 Chapter-5',
  subject: 'Science',
  classLevel: '9',
  pageNumber: 1,
  questionCount: 5,
  mode: 'standard',
  difficulty: 'medium',
  pageContent: "This is the text of the page. The fundamental unit of life is the cell. Cells were discovered by Robert Hooke in 1665. He observed slices of cork under a simple magnifying device. Cork is a substance which comes from the bark of a tree."
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/ai/ncert-page-quiz',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}, (res) => {
  console.log('STATUS:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('BODY:', data));
});
req.on('error', (e) => console.error(e));
req.write(payload);
req.end();
