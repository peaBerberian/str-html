import strHtml from "../main";

// Simple test suite because I don't want to spend time debugging huge testing
// frameworks in my free time when my needs are as simple as it gets.
const onlyTests = [];
const tests = [];
export function addTest(val, fn) {
  tests.push({ testName: val, testFn: fn });
}
addTest.only = function (val, fn) {
  onlyTests.push({ testName: val, testFn: fn });
};

export function assert(cond, errorMsg) {
  if (!cond) {
    if (errorMsg === undefined || errorMsg === null) {
      throw new Error("Invalid assertion");
    }
    throw new Error(errorMsg);
  }
}

export function assertThrows(fn, errorMsg) {
  try {
    fn();
  } catch (_) {
    return;
  }
  if (errorMsg === undefined || errorMsg === null) {
    throw new Error("Expected function to throw");
  }
  throw new Error(errorMsg);
}

export function assertEqual(val, expected, errorMsg) {
  if (val !== expected) {
    if (errorMsg === undefined || errorMsg === null) {
      throw new Error(`Expected:

=====================
${val}
=====================

to be equal to:

=====================
${expected}
=====================
`);
    }
    throw new Error(errorMsg);
  }
}

export function assertIncludedIn(val, validValues, errorMsg) {
  if (!validValues.includes(val)) {
    if (errorMsg === undefined || errorMsg === null) {
      throw new Error(`Expected:

=====================
${val}
=====================

to be either:

=====================
${validValues.join("\n=====================\n\nor\n\n=====================\n")}
=====================
`);
    }
    throw new Error(errorMsg);
  }
}

export default function runTests() {
  const date = new Date();
  const testResultsElements = strHtml`<div class="tests-wrapper">
    <div class="tests-title">Tests performed the ${date.toISOString()}:</div>
  </div>`;
  document.body.appendChild(testResultsElements);
  const runTests = onlyTests.length > 0 ? onlyTests : tests;
  for (const test of runTests) {
    try {
      test.testFn();
      testResultsElements.appendChild(
        strHtml`<div class="test test-ok">
          <span class="test-result">OK</span>
          <span> </span>
          <span class="test-case">${test.testName}</span>
        </div>`
      );
    } catch (err) {
      console.error(`Failure of: "${test.testName}"\n`, err);
      let errorMessage;
      if (err !== null && err !== undefined) {
        errorMessage = err.toString();
      } else {
        errorMessage = err;
      }
      testResultsElements.appendChild(
        strHtml`<div class="test test-ko">
          <span class="test-result">KO</span>
          <span> </span>
          <span class="test-case">${test.testName}</span>
          <pre>${errorMessage}</pre>
        </div>`
      );
    }
  }
}
