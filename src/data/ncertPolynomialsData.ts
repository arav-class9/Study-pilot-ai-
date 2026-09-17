import { NCERTPageContent } from '../types/ncert';

/**
 * Authentic Class 9 Mathematics - Chapter 2: Polynomials
 * Faithful to official NCERT textbook syllabus, including introduction to polynomials,
 * degrees, coefficients, zeroes of a polynomial, Remainder & Factor theorems, and algebraic identities.
 */
export const CLASS_9_MATH_CH2_PAGES: Record<number, NCERTPageContent> = {
  12: {
    pageNumber: 12,
    sectionTitle: 'Chapter 2 : Polynomials',
    heading: '2.1 Introduction & 2.2 Types of Polynomials',
    paragraphs: [
      'In this chapter, we will study polynomials in one variable. A polynomial is an expression of the form p(x) = a_n x^n + a_{n-1} x^{n-1} + ... + a_1 x + a_0, where a_n, a_{n-1}, ..., a_0 are real numbers and a_n ≠ 0. The degree of the polynomial is the highest power of x with a non-zero coefficient.',
      'There are different types of polynomials:\n• Constant polynomial\n• Linear polynomial\n• Quadratic polynomial\n• Cubic polynomial\nand so on.',
      'A polynomial having only one term is called a monomial. A polynomial having two terms is called a binomial. A polynomial having three terms is called a trinomial.',
      'The degree of a non-zero constant polynomial is zero. The degree of the zero polynomial is not defined.',
    ],
    keyConcepts: [
      'Polynomial expression: a_n x^n + ... + a_0',
      'Degree: highest power of the variable x with non-zero coefficient',
      'Types: constant, linear (degree 1), quadratic (degree 2), cubic (degree 3)',
      'Terms: monomial (1 term), binomial (2 terms), trinomial (3 terms)',
    ],
    formulas: [
      'p(x) = a_n x^n + a_{n-1} x^{n-1} + ... + a_1 x + a_0, a_n ≠ 0',
      'Linear: ax + b (a ≠ 0)',
      'Quadratic: ax² + bx + c (a ≠ 0)',
      'Cubic: ax³ + bx² + cx + d (a ≠ 0)',
    ],
    ncertHighlights: [
      'NCERT Rule: The exponents of the variable in any polynomial MUST be whole numbers (0, 1, 2, 3...). An expression like 1/x = x^(-1) or √x = x^(1/2) is NOT a polynomial.',
      'The degree of a non-zero constant polynomial is always 0. Example: 5 = 5x^0.',
      'The degree of the zero polynomial 0 is not defined.',
    ],
    activities: [
      {
        activityNumber: 'Example 1',
        title: 'Finding Degrees of Polynomials',
        procedure: 'Inspect the powers of the variable x in (i) x^5 - x^4 + 3, (ii) 2 - y^2 - y^3 + 2y^8, (iii) 2.',
        observation: '(i) Highest power is 5. (ii) Highest power is 8. (iii) Only term is 2 = 2x^0, highest power is 0.',
        conclusion: 'The degrees of the given polynomials are 5, 8, and 0 respectively.',
      },
    ],
    inTextQuestions: [
      {
        question: 'Which of the following expressions are polynomials in one variable? (i) 4x² - 3x + 7, (ii) y² + √2, (iii) 3√t + t√2, (iv) y + 2/y.',
        answerHint:
          '(i) and (ii) are polynomials since exponents of variables are whole numbers. (iii) is not a polynomial because exponent of t in 3√t is 1/2. (iv) is not a polynomial because 2/y = 2y^(-1), exponent is -1 (not a whole number).',
      },
      {
        question: 'Write the coefficients of x² in (i) 2 + x² + x, (ii) 2 - x² + x³, (iii) (π/2)x² + x, (iv) √2 x - 1.',
        answerHint:
          '(i) 1, (ii) -1, (iii) π/2, (iv) 0 (since there is no x² term, 0·x²).',
      },
    ],
    vocabulary: [
      {
        term: 'Polynomial',
        definition: 'An algebraic expression consisting of variables and coefficients with non-negative integer exponents.',
      },
      {
        term: 'Degree of Polynomial',
        definition: 'The highest power of the variable occurring in the polynomial with a non-zero coefficient.',
      },
      {
        term: 'Monomial',
        definition: 'A polynomial containing only one non-zero term.',
      },
      {
        term: 'Binomial',
        definition: 'A polynomial containing exactly two distinct non-zero terms.',
      },
      {
        term: 'Trinomial',
        definition: 'A polynomial containing exactly three distinct non-zero terms.',
      },
    ],
    pageType: 'theory',
  },
  1: {
    pageNumber: 1,
    sectionTitle: '2.1 Introduction to Algebraic Expressions',
    heading: 'Constants, Variables and Algebraic Terms',
    paragraphs: [
      'You have studied algebraic expressions, their addition, subtraction, multiplication and division in earlier classes. There you also studied how to factorise some algebraic expressions.',
      'Recall that a variable is denoted by a symbol that can take any real value, often denoted by letters x, y, z, etc. Consider the perimeter of a square of side x: perimeter = 4x. Here 4 is a constant and x is a variable.',
      'An algebraic expression of the form cx^n where c is a constant and n is a whole number is called a term. A combination of such terms via addition or subtraction forms a polynomial.',
    ],
    keyConcepts: [
      'Constants have fixed values; variables can take varying real values.',
      'Algebraic terms combine constants and variable powers.',
      'Exponents of variable in polynomial must be non-negative integers.',
    ],
    formulas: [
      'Perimeter of square: P = 4x',
      'Area of square: A = x²',
    ],
    ncertHighlights: [
      'Remember: Expressions with negative or fractional powers of variable (such as 1/x or √x) are algebraic expressions, but NOT polynomials.',
    ],
    pageType: 'theory',
  },
  2: {
    pageNumber: 2,
    sectionTitle: '2.2 Zeroes of a Polynomial',
    heading: 'Values and Zeroes of p(x)',
    paragraphs: [
      'Consider the polynomial p(x) = 5x³ - 2x² + 3x - 2. If we replace x by 1 everywhere in p(x), we get p(1) = 5(1)³ - 2(1)² + 3(1) - 2 = 5 - 2 + 3 - 2 = 4. We say that the value of p(x) at x = 1 is 4.',
      'A real number c is called a zero of a polynomial p(x) if p(c) = 0.',
      'For example, consider p(x) = x - 1. Then p(1) = 1 - 1 = 0. Here 1 is a zero of the polynomial p(x).',
      'A non-zero constant polynomial has no zero. Every linear polynomial in one variable has a unique zero.',
    ],
    keyConcepts: [
      'Value of polynomial at x = k is denoted as p(k).',
      'Zero of polynomial: any real number c such that p(c) = 0.',
      'Linear polynomial ax + b (a ≠ 0) has a unique zero: x = -b/a.',
      'A polynomial can have more than one zero.',
    ],
    formulas: [
      'Zero of linear polynomial ax + b: x = -b/a',
      'p(c) = 0 => c is a zero of p(x)',
    ],
    ncertHighlights: [
      'A zero of a polynomial need not be 0.',
      '0 may be a zero of a polynomial.',
      'Every linear polynomial has one and only one zero.',
      'A polynomial of degree n can have at most n zeroes.',
    ],
    inTextQuestions: [
      {
        question: 'Find the zero of the polynomial p(x) = 2x + 5.',
        answerHint: 'Setting p(x) = 0 => 2x + 5 = 0 => 2x = -5 => x = -5/2. Thus, -5/2 is the zero of p(x).',
      },
    ],
    vocabulary: [
      {
        term: 'Zero of a Polynomial',
        definition: 'A real value of the variable for which the value of the polynomial equals zero.',
      },
    ],
    pageType: 'theory',
  },
  3: {
    pageNumber: 3,
    sectionTitle: '2.3 Remainder Theorem',
    heading: 'Dividing Polynomials & Finding Remainders',
    paragraphs: [
      'Let p(x) be any polynomial of degree greater than or equal to one and let a be any real number. If p(x) is divided by the linear polynomial (x - a), then the remainder is p(a).',
      'Dividend = (Divisor × Quotient) + Remainder, i.e., p(x) = g(x)q(x) + r(x), where either r(x) = 0 or degree of r(x) < degree of g(x).',
      'If g(x) = x - a is linear (degree 1), then degree of r(x) must be 0, which means r(x) is a constant, r.',
      'Putting x = a: p(a) = (a - a)q(a) + r = 0 + r = r. Hence, remainder = p(a).',
    ],
    keyConcepts: [
      'Remainder Theorem: when p(x) is divided by (x - a), remainder is p(a).',
      'Division Algorithm: p(x) = g(x)q(x) + r(x).',
      'Avoids lengthy long division when only remainder is required.',
    ],
    formulas: [
      'p(x) = (x - a)q(x) + p(a)',
      'Dividend = Divisor × Quotient + Remainder',
    ],
    ncertHighlights: [
      'To find remainder when p(x) is divided by (ax + b), calculate p(-b/a).',
    ],
    pageType: 'numerical_example',
  },
  4: {
    pageNumber: 4,
    sectionTitle: '2.4 Factor Theorem',
    heading: 'Factorisation of Polynomials using Factor Theorem',
    paragraphs: [
      'Factor Theorem: If p(x) is a polynomial of degree n ≥ 1 and a is any real number, then:\n(i) (x - a) is a factor of p(x), if p(a) = 0, and\n(ii) p(a) = 0, if (x - a) is a factor of p(x).',
      'We can use the Factor Theorem to factorise quadratic and cubic polynomials. For quadratic polynomials ax² + bx + c, we can also factorise by splitting the middle term.',
      'To factorise cubic polynomials like x³ - 23x² + 142x - 120, find one integer root a by trial using factors of the constant term, then divide by (x - a) to obtain a quadratic quotient.',
    ],
    keyConcepts: [
      'Factor theorem is a direct consequence of Remainder theorem.',
      '(x - a) is factor ⇔ p(a) = 0.',
      'Splitting the middle term for quadratic polynomials.',
      'Trial method + long division for cubic polynomials.',
    ],
    formulas: [
      'ax² + bx + c = a(x - α)(x - β)',
    ],
    ncertHighlights: [
      'Always test the integral factors of the constant term when using the trial method for cubic polynomials.',
    ],
    pageType: 'theory',
  },
  5: {
    pageNumber: 5,
    sectionTitle: '2.5 Algebraic Identities',
    heading: 'Standard Algebraic Identities for Polynomials',
    paragraphs: [
      'Recall the algebraic identities you learned earlier:\nIdentity I: (x + y)² = x² + 2xy + y²\nIdentity II: (x - y)² = x² - 2xy + y²\nIdentity III: x² - y² = (x + y)(x - y)\nIdentity IV: (x + a)(x + b) = x² + (a + b)x + ab.',
      'In this class we extend to three variables and cubes:\nIdentity V: (x + y + z)² = x² + y² + z² + 2xy + 2yz + 2zx\nIdentity VI: (x + y)³ = x³ + y³ + 3xy(x + y) = x³ + 3x²y + 3xy² + y³\nIdentity VII: (x - y)³ = x³ - y³ - 3xy(x - y) = x³ - 3x²y + 3xy² - y³\nIdentity VIII: x³ + y³ + z³ - 3xyz = (x + y + z)(x² + y² + z² - xy - yz - zx).',
      'A very useful conditional identity: If x + y + z = 0, then x³ + y³ + z³ = 3xyz.',
    ],
    keyConcepts: [
      '8 Core NCERT Algebraic Identities.',
      'Expansion of trinomial squares: (x + y + z)²',
      'Expansion of binomial cubes: (x ± y)³',
      'Sum of three cubes identity: x³ + y³ + z³ - 3xyz',
      'Conditional identity: if x + y + z = 0, then x³ + y³ + z³ = 3xyz',
    ],
    formulas: [
      '(x + y + z)² = x² + y² + z² + 2xy + 2yz + 2zx',
      '(x + y)³ = x³ + y³ + 3xy(x + y)',
      '(x - y)³ = x³ - y³ - 3xy(x - y)',
      'x³ + y³ + z³ - 3xyz = (x + y + z)(x² + y² + z² - xy - yz - zx)',
      'If x + y + z = 0, then x³ + y³ + z³ = 3xyz',
    ],
    ncertHighlights: [
      'Board Favorite: Evaluating (-12)³ + (7)³ + (5)³ without actually calculating cubes: since -12 + 7 + 5 = 0, the value is 3(-12)(7)(5) = -1260.',
    ],
    pageType: 'theory',
  },
};
