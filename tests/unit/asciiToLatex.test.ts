// ABOUTME: Regression tests for asciiToLatex, the MathInput answer preview renderer
// ABOUTME: Expected LaTeX was recorded under mathjs 14.6.0 so mathjs upgrades that change rendering fail here
import { asciiToLatex } from '@/libs/asciiToLatex';

describe('asciiToLatex', () => {
  it.each([
    // plain numeric answers
    ['2', '2'],
    ['-4', '-4'],
    ['-28', '-28'],
    ['6.2', '6.2'],
    ['0.12', '0.12'],
    ['28.26', '28.26'],
    ['.5', '0.5'],
    ['1.', '1'],
    [' 3 ', '3'],
    // fractions, powers, signs
    ['1/2', '\\frac{1}{2}'],
    ['-3/4', '\\frac{-3}{4}'],
    ['3/4+1/2', '\\frac{3}{4}+\\frac{1}{2}'],
    ['6÷2', '\\frac{6}{2}'],
    ['50%', '\\frac{50}{100}'],
    ['2^3', '{2}^{3}'],
    ['x^2', '{ x}^{2}'],
    ['x^2+2x+1', '{ x}^{2}+2\\times x+1'],
    ['(x+1)^2', '{\\left( x+1\\right)}^{2}'],
    ['2^-1', '{2}^{-1}'],
    ['10^(-3)', '{10}^{-3}'],
    ['-x', '- x'],
    ['--2', '-\\left(-2\\right)'],
    ['5−3', '5-3'],
    // radicals and symbols
    ['√2', '\\sqrt{2}'],
    ['√(x+1)', '\\sqrt{ x+1}'],
    ['2√3', '2\\times\\sqrt{3}'],
    ['√[3]8', '\\sqrt[3]{8}'],
    ['∛27', '\\sqrt[3]{27}'],
    ['∜16', '\\sqrt[4]{16}'],
    ['√2/2', '\\frac{\\sqrt{2}}{2}'],
    ['sqrt(16)', '\\sqrt{16}'],
    ['3π', '3\\times\\pi'],
    ['π/4', '\\frac{\\pi}{4}'],
    ['2×3', '2\\times3'],
    ['4·5', '4\\times5'],
    // implicit multiplication
    ['2x', '2\\times x'],
    ['x(y+1)', ' x\\times\\left( y+1\\right)'],
    ['(x+1)2', '\\left( x+1\\right)\\times2'],
    ['(x+1)(x-1)', '\\left( x+1\\right)\\times\\left( x-1\\right)'],
    ['2(3+4)', '2\\times\\left(3+4\\right)'],
    // functions
    ['sin(x)', '\\sin\\left( x\\right)'],
    ['cos(pi/3)', '\\cos\\left(\\frac{\\pi}{3}\\right)'],
    ['exp(2)', '\\exp\\left(2\\right)'],
    ['tan(x)^2', '{\\tan\\left( x\\right)}^{2}'],
    // equations, inequalities, factorials
    ['x=3', ' x=3'],
    ['x>2', ' x>2'],
    ['x<=5', ' x\\leq5'],
    ['y=2x+1', ' y=2\\times x+1'],
    ['5!', '5!'],
    // multiple answers
    ['1, 2', '1, 2'],
    ['2, -3', '2, -3'],
    ['x=1, x=2', ' x=1,  x=2'],
  ])('renders %j as %j', (input, expected) => {
    expect(asciiToLatex(input)).toBe(expected);
  });

  it.each(['잘못된 답', '1+', '(', ')', '2**3', '3..2', '√', '[1,2]'])(
    'throws on unparseable input %j',
    (input) => {
      expect(() => asciiToLatex(input)).toThrow();
    }
  );
});
