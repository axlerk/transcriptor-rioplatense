// Spell out integers and simple decimals in Spanish words, so that digits in
// the input can be transcribed. Argentine conventions: "." groups thousands,
// "," is the decimal separator.

const UNITS = [
  'cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
  'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete',
  'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós', 'veintitrés',
  'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve',
];
const TENS = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
const HUNDREDS = [
  '', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos',
  'seiscientos', 'setecientos', 'ochocientos', 'novecientos',
];

function below100(n) {
  if (n < 30) return UNITS[n];
  const t = Math.floor(n / 10), u = n % 10;
  return u ? `${TENS[t]} y ${UNITS[u]}` : TENS[t];
}

function below1000(n) {
  if (n === 100) return 'cien';
  const h = Math.floor(n / 100), rest = n % 100;
  const parts = [];
  if (h) parts.push(HUNDREDS[h]);
  if (rest) parts.push(below100(rest));
  return parts.join(' ');
}

// "uno" becomes "un" / "veintiuno" becomes "veintiún" before mil / millones.
function apocope(words) {
  return words.replace(/veintiuno$/, 'veintiún').replace(/uno$/, 'un');
}

export function integerToWords(n) {
  if (n === 0) return 'cero';
  const parts = [];
  const millions = Math.floor(n / 1e6);
  const thousands = Math.floor((n % 1e6) / 1000);
  const rest = n % 1000;
  if (millions) {
    parts.push(millions === 1 ? 'un millón' : `${apocope(integerToWords(millions))} millones`);
  }
  if (thousands) parts.push(thousands === 1 ? 'mil' : `${apocope(below1000(thousands))} mil`);
  if (rest) parts.push(below1000(rest));
  return parts.join(' ');
}

// Returns Spanish words for a numeric token, or null if it is out of range.
export function numberToWords(token) {
  let intPart = token, decPart = '';
  if (/^\d{1,3}(\.\d{3})+$/.test(token)) {
    intPart = token.replace(/\./g, '');
  } else if (/^\d+[.,]\d+$/.test(token)) {
    [intPart, decPart] = token.split(/[.,]/);
  } else if (!/^\d+$/.test(token)) {
    return null;
  }
  const n = Number(intPart);
  if (!Number.isSafeInteger(n) || n >= 1e12) return null;
  let words = integerToWords(n);
  if (decPart) {
    const dec = /^0/.test(decPart)
      ? decPart.split('').map((d) => UNITS[+d]).join(' ')
      : integerToWords(Number(decPart));
    words += ` coma ${dec}`;
  }
  return words;
}
