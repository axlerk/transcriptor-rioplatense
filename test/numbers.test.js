import { test } from 'node:test';
import assert from 'node:assert/strict';
import { numberToWords } from '../src/numbers.js';

test('numbers to Spanish words', () => {
  const cases = [
    ['0', 'cero'], ['7', 'siete'], ['16', 'dieciséis'], ['21', 'veintiuno'],
    ['35', 'treinta y cinco'], ['100', 'cien'], ['101', 'ciento uno'],
    ['555', 'quinientos cincuenta y cinco'], ['1000', 'mil'], ['1.500', 'mil quinientos'],
    ['2024', 'dos mil veinticuatro'], ['21000', 'veintiún mil'],
    ['1000000', 'un millón'], ['2500000', 'dos millones quinientos mil'],
    ['3,5', 'tres coma cinco'], ['0,05', 'cero coma cero cinco'],
  ];
  for (const [n, words] of cases) assert.equal(numberToWords(n), words, n);
});
