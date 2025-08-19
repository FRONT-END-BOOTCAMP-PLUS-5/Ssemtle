import { parse } from 'mathjs';

/** Convert "ASCII-ish" math (√, ∛, implicit mult, etc.) to LaTeX via mathjs. */
export function asciiToLatex(input: string): string {
  // Handle comma-separated multiple answers
  if (input.includes(',')) {
    const parts = input.split(',').map((part) => part.trim());
    const latexParts = parts.map((part) => {
      if (part === '') return '';
      const normalized = toMathjsFriendly(part);
      const latex = parse(normalized).toTex({
        parenthesis: 'auto',
        implicit: 'hide',
      });
      return latex.replace(/\\cdot/g, '\\times');
    });
    return latexParts.join(', ');
  }

  const normalized = toMathjsFriendly(input);
  const latex = parse(normalized).toTex({
    parenthesis: 'auto',
    implicit: 'hide',
  });
  // Convert \cdot to \times for educational clarity
  return latex.replace(/\\cdot/g, '\\times');
}

/** Normalize:
 *  - √x, √(x+1), √[n]x, ∛x, ∜x  → sqrt()/nthRoot()
 *  - implicit mult: 2x, x(y+1), (x+1)2 → 2*x, x*(y+1), (x+1)*2
 *  - symbols: π, ×, ·, − → pi, *, *, -
 */
function toMathjsFriendly(s: string): string {
  // basic symbol fixes
  s = s
    .replace(/π/g, 'pi')
    .replace(/[×·•]/g, '*')
    .replace(/[÷]/g, '/')
    .replace(/[−–—]/g, '-');

  // Handle commas for multiple answers - preserve them but ensure proper spacing
  // LaTeX will handle comma spacing automatically in math mode

  // handle radicals (√, ∛, ∜) with optional index [n]
  s = normalizeRadicals(s);

  // add a few common implicit multiplications
  s = s
    // 2x → 2*x, 2(x) → 2*(x)
    .replace(/(\d)([A-Za-z(])/g, '$1*$2')
    // x2 → x*2, )2 → )*2
    .replace(/([A-Za-z\)])(\d)/g, '$1*$2')
    // x(y) → x*(y), but NOT sqrt( → sqrt*(
    .replace(/([A-Za-z]+|\))\(/g, (match, p1) => {
      // Don't add * if it's a function name like sqrt, sin, cos, etc.
      if (/^(sqrt|sin|cos|tan|log|ln|exp|nthRoot)$/.test(p1)) {
        return match; // return as-is: sqrt( stays as sqrt(
      }
      return p1 + '*(';
    });

  return s;
}

function normalizeRadicals(src: string): string {
  let out = '';
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === '√' || ch === '∛' || ch === '∜') {
      const defaultIndex = ch === '√' ? 2 : ch === '∛' ? 3 : 4;
      let j = i + 1;

      // optional [n] index: √[3]x
      let indexExpr: string | null = null;
      if (src[j] === '[') {
        const end = matchBlock(src, j, '[', ']');
        if (end) {
          indexExpr = src.slice(j + 1, end - 1);
          j = end;
        }
      }

      // read the next "atom" as the radicand
      const atom = rightAtom(src, j);
      if (!atom) {
        // fall back: just emit the symbol to avoid loss
        out += ch;
        continue;
      }
      const radicand = src.slice(atom.start, atom.end);

      if (indexExpr && indexExpr.trim() !== '' && indexExpr.trim() !== '2') {
        out += `nthRoot(${radicand}, ${indexExpr})`;
      } else if (defaultIndex !== 2) {
        out += `nthRoot(${radicand}, ${defaultIndex})`;
      } else {
        out += `sqrt(${radicand})`;
      }

      i = atom.end - 1; // jump past the radicand
    } else {
      out += ch;
    }
  }
  return out;
}

type Span = { start: number; end: number };

// Grab the next token/group starting at position `i`.
function rightAtom(s: string, i: number): Span | null {
  // skip spaces
  while (i < s.length && /\s/.test(s[i])) i++;
  if (i >= s.length) return null;

  // parenthesized / bracketed / braced group
  if ('([{'.includes(s[i])) {
    const close = { '(': ')', '[': ']', '{': '}' } as const;
    const end = matchBlock(s, i, s[i], close[s[i] as '(' | '[' | '{']);
    return end ? { start: i, end } : null;
  }

  // function name like sqrt, sin, etc. (leave as-is, include following group if present)
  if (/[A-Za-z\\]/.test(s[i])) {
    let j = i + 1;
    while (j < s.length && /[A-Za-z]/.test(s[j])) j++;
    // if immediately followed by a group, include it
    if (s[j] === '(' || s[j] === '{' || s[j] === '[') {
      const end = matchBlock(
        s,
        j,
        s[j],
        { '(': ')', '{': '}', '[': ']' }[s[j] as '(' | '{' | '[']
      );
      return end ? { start: i, end } : { start: i, end: j };
    }
    return { start: i, end: j };
  }

  // number token (including decimals)
  if (/[0-9]/.test(s[i])) {
    let j = i;
    while (j < s.length && /[0-9.]/.test(s[j])) j++;
    return { start: i, end: j };
  }

  // single variable token
  if (/[A-Za-z_]/.test(s[i])) {
    let j = i + 1;
    while (j < s.length && /[A-Za-z0-9_]/.test(s[j])) j++;
    return { start: i, end: j };
  }

  return null;
}

function matchBlock(
  s: string,
  start: number,
  open: string,
  close: string
): number | null {
  let depth = 1;
  for (let i = start + 1; i < s.length; i++) {
    if (s[i] === open) depth++;
    else if (s[i] === close && --depth === 0) return i + 1;
  }
  return null;
}
