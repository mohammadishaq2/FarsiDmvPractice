#!/usr/bin/env node
/**
 * fixRtlFarsiText.js
 *
 * Wraps English/LTR terms inside Farsi strings with Unicode Left-to-Right Mark
 * characters (U+200E) so they display correctly in RTL contexts.
 *
 * Usage:  node scripts/fixRtlFarsiText.js
 * Output: src/data/california_dmv_farsi_questions.json
 */

const fs = require("fs");
const path = require("path");

const INPUT_FILE = path.resolve(
  __dirname,
  "../src/data/california_dmv_farsi_questions.json",
);
const OUTPUT_FILE = path.resolve(
  __dirname,
  "../src/data/california_dmv_farsi_questions_rtl_fixed.json",
);

const LRM = "\u200E";

// ---------------------------------------------------------------------------
// Terms to wrap, ordered longest-first so more specific patterns match before
// shorter substrings (e.g. "SR 1P" before "SR 1").
// Each entry is either a plain string (matched literally, case-sensitive) or
// a RegExp.  Plain strings that contain spaces / special chars will be escaped.
// ---------------------------------------------------------------------------
const TERMS = [
  // Multi-word sign labels (longest first)
  "NO TURN ON RED",
  "DON'T WALK",
  "DO NOT ENTER",
  "WRONG WAY",

  // Single-word signs
  "YIELD",
  "STOP",
  "WALK",

  // Abbreviations / codes
  "SR 1P",
  "SR 22",
  "SR 1",
  "DMV",
  "HOV",
  "DUI",
  "BAC",
  "IID",

  // Class designators that appear next to Farsi word "کلاس"
  // e.g. "کلاس A" or "Class A"
  /Class\s+[A-Z]/g,

  // Standalone capital letters used as licence-class values
  // Must be surrounded by Farsi characters, space, or LRM/boundary,
  // NOT already wrapped.
  // This regex matches a single uppercase ASCII letter that is
  // preceded by a non-ASCII (Farsi) char or space, and followed by
  // a space, end of string, punctuation, or Farsi char.
  /(?<=[^\x00-\x7F\u200E\s]|\s)([A-Z])(?=[\s\u060C\u061B\u061F\u06CC\u200C\u200D،؛؟\u0600-\u06FF]|$)/g,
];

// ---------------------------------------------------------------------------
// Escape a plain string for use inside a RegExp
// ---------------------------------------------------------------------------
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ---------------------------------------------------------------------------
// Build a list of {regex} objects from TERMS
// ---------------------------------------------------------------------------
function buildPatterns() {
  return TERMS.map((term) => {
    if (term instanceof RegExp) {
      return term;
    }
    // Plain string: match whole occurrences not already wrapped with LRM
    return new RegExp(`(?<!\u200E)${escapeRegex(term)}(?!\u200E)`, "g");
  });
}

const PATTERNS = buildPatterns();

// ---------------------------------------------------------------------------
// Fix a single Farsi string
// ---------------------------------------------------------------------------
function fixFarsiString(text) {
  if (!text || typeof text !== "string") return text;

  let result = text;

  for (const pattern of PATTERNS) {
    // Reset lastIndex for stateful regexes
    if (pattern.global) pattern.lastIndex = 0;

    result = result.replace(pattern, (match) => {
      // Avoid double-wrapping
      if (match.startsWith(LRM) && match.endsWith(LRM)) return match;
      return `${LRM}${match}${LRM}`;
    });
  }

  return result;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  console.log(`Reading: ${INPUT_FILE}`);
  const raw = fs.readFileSync(INPUT_FILE, "utf8");
  const data = JSON.parse(raw);

  let questionFaCount = 0;
  let answerFaCount = 0;
  let explanationFaCount = 0;

  for (const q of data.questions) {
    // questionFa
    const fixedQFa = fixFarsiString(q.questionFa);
    if (fixedQFa !== q.questionFa) {
      q.questionFa = fixedQFa;
      questionFaCount++;
    }

    // answers[].fa
    if (Array.isArray(q.answers)) {
      for (const ans of q.answers) {
        const fixedFa = fixFarsiString(ans.fa);
        if (fixedFa !== ans.fa) {
          ans.fa = fixedFa;
          answerFaCount++;
        }
      }
    }

    // explanationFa
    const fixedExpFa = fixFarsiString(q.explanationFa);
    if (fixedExpFa !== q.explanationFa) {
      q.explanationFa = fixedExpFa;
      explanationFaCount++;
    }
  }

  const output = JSON.stringify(data, null, 2);
  fs.writeFileSync(OUTPUT_FILE, output, "utf8");

  console.log("\n=== RTL Fix Summary ===");
  console.log(`  questionFa fields updated  : ${questionFaCount}`);
  console.log(`  answers[].fa fields updated: ${answerFaCount}`);
  console.log(`  explanationFa fields updated: ${explanationFaCount}`);
  console.log(
    `  Total fields updated       : ${questionFaCount + answerFaCount + explanationFaCount}`,
  );
  console.log(`\nOutput written to: ${OUTPUT_FILE}`);
}

main();
