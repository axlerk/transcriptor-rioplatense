#!/usr/bin/env node
// Usage: transcribe.js [--phonemic] [--zh] [--syllables] [--casual] "texto"
// Reads stdin when no text is given.
import { readFileSync } from 'node:fs';
import { transcribe } from '../src/transcriber.js';

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const text = args.filter((a) => !a.startsWith('--')).join(' ') || readFileSync(0, 'utf8');
const casual = flags.has('--casual');
const result = transcribe(text, {
  mode: flags.has('--phonemic') ? 'phonemic' : 'phonetic',
  palatal: flags.has('--zh') ? 'ʒ' : 'ʃ',
  syllables: flags.has('--syllables'),
  sPause: casual,
  dFinal: casual,
});
console.log(result.text);
