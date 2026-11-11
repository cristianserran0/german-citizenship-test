// Builds worker/questions.json from ../index.html, so the questions are
// written once: the page stays the single source and the Worker looks them
// up by id. Wrangler runs this before every dev run and deploy
// (build.command in wrangler.jsonc).
//
// It runs the data part of the page's script (from `var Q=[` up to
// `var showTrans`) in an empty sandbox and keeps Q, QL, TRANS and CURRENT
// (the tutor's current-politics facts and patterns).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const html = readFileSync(here('../index.html'), 'utf8');

const start = html.indexOf('var Q=[');
const end = html.indexOf('var showTrans');
if (start < 0 || end < 0 || end < start) {
  throw new Error('extract-questions: could not find `var Q=[` ... `var showTrans` in index.html');
}

const sandbox = {};
vm.runInNewContext(html.slice(start, end), sandbox);
const { Q, QL, TRANS, CURRENT } = sandbox;
if (!Array.isArray(Q) || !Array.isArray(QL) || !TRANS || !CURRENT) throw new Error('extract-questions: Q, QL, TRANS or CURRENT missing');

const out = {};
for (const q of Q.concat(QL)) {
  const t = TRANS[q.id] || {};
  out[q.id] = {
    cat: q.cat,
    q: q.q,
    o: q.o,
    a: q.a,
    img: !!(q.qim || q.im),   // the question shows a picture the model can't see
    qt: t.qt || '',
    ot: t.ot || [],
  };
}
const cats = [...new Set(Q.map((q) => q.cat))];

writeFileSync(here('./questions.json'), JSON.stringify({ cats, questions: out, current: CURRENT }));
console.log(`extract-questions: ${Object.keys(out).length} questions, ${cats.length} topics -> worker/questions.json`);
