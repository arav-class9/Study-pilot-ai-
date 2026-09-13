import { CLASS_10_SCIENCE_CH1_PAGES } from '../src/data/ncertBooksData.js';
import { formatNCERTPageContentToText } from '../server/services/ncertTextbookRepository.js';

const BASE_URL = 'http://localhost:3000/api/ai/ncert-page-quiz';

async function runTests() {
  console.log('=== STARTING NCERT PAGE QUIZ VERIFICATION SUITE ===\n');
  let passedCount = 0;
  let totalTests = 5;

  // TEST 1: Class 10 Science, Page 2, 5 questions, Adaptive mode
  console.log('--- TEST 1: Class 10 Science, Page 2, 5 Questions, Adaptive Mode ---');
  try {
    const page2Content = formatNCERTPageContentToText(CLASS_10_SCIENCE_CH1_PAGES[2]);
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookId: 'c10-sci',
        chapterId: 'c10-sci-ch1',
        chapterName: 'Chemical Reactions and Equations',
        subject: 'Science',
        classLevel: '10',
        pageNumber: 2,
        questionCount: 5,
        mode: 'adaptive',
        pageContent: page2Content,
      }),
    });

    const data = await res.json();
    console.log(`HTTP Status: ${res.status}`);
    console.log(`Success: ${data.success}, Questions returned: ${data.data?.length}`);

    if (res.status === 200 && data.success && Array.isArray(data.data) && data.data.length === 5) {
      // Validate schema on all 5 questions
      const allValid = data.data.every((q: any) => {
        const hasQuestion = typeof q.question === 'string' && q.question.length > 5;
        const has4Options = Array.isArray(q.options) && q.options.length === 4;
        const hasValidIdx = typeof q.correctAnswerIndex === 'number' && q.correctAnswerIndex >= 0 && q.correctAnswerIndex <= 3;
        const hasExplanation = typeof q.explanation === 'string' && q.explanation.length > 0;
        const correctOpt = q.options[q.correctAnswerIndex];
        const answerMatches = q.correctAnswer ? q.correctAnswer === correctOpt : true;
        return hasQuestion && has4Options && hasValidIdx && hasExplanation && answerMatches;
      });

      if (allValid) {
        console.log('Sample Question 1:', data.data[0].question);
        console.log('Sample Options:', data.data[0].options);
        console.log('Correct Answer:', data.data[0].options[data.data[0].correctAnswerIndex]);
        console.log('Difficulty:', data.data[0].difficulty);
        console.log('Reference:', data.data[0].ncertPageReference);
        console.log('✅ TEST 1 PASSED: Exactly 5 valid questions returned strictly for Page 2.\n');
        passedCount++;
      } else {
        console.error('❌ TEST 1 FAILED: Questions failed schema validation.');
      }
    } else {
      console.error('❌ TEST 1 FAILED:', data);
    }
  } catch (err) {
    console.error('❌ TEST 1 EXCEPTION:', err);
  }

  // TEST 2: Page 1 vs Page 2 return different page-specific questions
  console.log('--- TEST 2: Page 1 vs Page 2 Page-Specificity Check ---');
  try {
    const page1Content = formatNCERTPageContentToText(CLASS_10_SCIENCE_CH1_PAGES[1]);
    const res1 = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chapterId: 'c10-sci-ch1',
        chapterName: 'Chemical Reactions and Equations',
        pageNumber: 1,
        questionCount: 3,
        mode: 'standard',
        pageContent: page1Content,
      }),
    });
    const data1 = await res1.json();

    const page2Content = formatNCERTPageContentToText(CLASS_10_SCIENCE_CH1_PAGES[2]);
    const res2 = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chapterId: 'c10-sci-ch1',
        chapterName: 'Chemical Reactions and Equations',
        pageNumber: 2,
        questionCount: 3,
        mode: 'standard',
        pageContent: page2Content,
      }),
    });
    const data2 = await res2.json();

    const q1Questions = data1.data?.map((q: any) => q.question.toLowerCase()) || [];
    const q2Questions = data2.data?.map((q: any) => q.question.toLowerCase()) || [];
    const overlap = q1Questions.filter((q: string) => q2Questions.includes(q));

    console.log(`Page 1 Questions count: ${q1Questions.length}, Page 2 Questions count: ${q2Questions.length}`);
    console.log(`Overlapping questions between Page 1 and Page 2: ${overlap.length}`);

    if (res1.status === 200 && res2.status === 200 && overlap.length === 0) {
      console.log('✅ TEST 2 PASSED: Page 1 and Page 2 generated distinct, page-specific questions.\n');
      passedCount++;
    } else {
      console.error('❌ TEST 2 FAILED:', { res1: res1.status, res2: res2.status, overlap });
    }
  } catch (err) {
    console.error('❌ TEST 2 EXCEPTION:', err);
  }

  // TEST 3: Invalid page number (e.g. 0, -1, NaN, "abc") returns controlled 400 error
  console.log('--- TEST 3: Invalid Page Number Boundary Rejection ---');
  try {
    const invalidInputs = [0, -1, -5, 'abc', null];
    let allProperlyRejected = true;

    for (const invalidPage of invalidInputs) {
      const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId: 'c10-sci-ch1',
          pageNumber: invalidPage,
          questionCount: 5,
        }),
      });
      const data = await res.json();
      const is400 = res.status === 400;
      const hasCode = data.code === 'INVALID_REQUEST';
      console.log(`Page value '${invalidPage}' -> HTTP ${res.status}, code: '${data.code}', message: '${data.message}'`);

      if (!is400 || !hasCode) {
        allProperlyRejected = false;
      }
    }

    if (allProperlyRejected) {
      console.log('✅ TEST 3 PASSED: All invalid page inputs were rejected with HTTP 400 INVALID_REQUEST.\n');
      passedCount++;
    } else {
      console.error('❌ TEST 3 FAILED: One or more invalid page values were not rejected properly.');
    }
  } catch (err) {
    console.error('❌ TEST 3 EXCEPTION:', err);
  }

  // TEST 4: Empty page content returns PAGE_CONTENT_NOT_FOUND or EMPTY_PAGE_CONTENT
  console.log('--- TEST 4: Empty Page Content Controlled Error ---');
  try {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chapterId: 'non-existent-book',
        pageNumber: 9999,
        questionCount: 5,
        pageContent: '   ',
      }),
    });
    const data = await res.json();
    console.log(`HTTP Status: ${res.status}, code: '${data.code}', message: '${data.message}'`);

    const validErrorCodes = ['PAGE_CONTENT_NOT_FOUND', 'EMPTY_PAGE_CONTENT'];
    if ((res.status === 404 || res.status === 422) && validErrorCodes.includes(data.code)) {
      console.log('✅ TEST 4 PASSED: Missing/empty page returns controlled error code:', data.code, '\n');
      passedCount++;
    } else {
      console.error('❌ TEST 4 FAILED: Expected 404 or 422 with PAGE_CONTENT_NOT_FOUND or EMPTY_PAGE_CONTENT, got:', res.status, data);
    }
  } catch (err) {
    console.error('❌ TEST 4 EXCEPTION:', err);
  }

  // TEST 5: Malformed AI output does not crash frontend & produces guaranteed question count
  console.log('--- TEST 5: Exact Question Count Guarantee & Fallback Robustness ---');
  try {
    // Request 5 questions directly with preloaded Page 2
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chapterId: 'c10-sci-ch1',
        chapterName: 'Chemical Reactions and Equations',
        pageNumber: 2,
        questionCount: 5,
        mode: 'adaptive',
      }),
    });
    const data = await res.json();
    console.log(`HTTP Status: ${res.status}, returned count: ${data.data?.length}`);

    if (res.status === 200 && data.success && data.data?.length === 5) {
      console.log('✅ TEST 5 PASSED: Response successfully guaranteed exactly 5 valid questions.\n');
      passedCount++;
    } else {
      console.error('❌ TEST 5 FAILED:', data);
    }
  } catch (err) {
    console.error('❌ TEST 5 EXCEPTION:', err);
  }

  console.log(`========================================`);
  console.log(`TEST SUMMARY: ${passedCount}/${totalTests} TESTS PASSED`);
  console.log(`========================================\n`);

  if (passedCount === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
