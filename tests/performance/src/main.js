test();

async function test() {
  await sleep(200);
  const timeBeforeInsert = performance.now();
  for (let i = 0; i < 100; i++) {
    insertComplexElement();
  }
  const timeToInsert = performance.now() - timeBeforeInsert;
  sendTestResult("insert", timeToInsert);
  reloadIfNeeded();
}

function sendTestResult(testName, testResult) {
  fetch("http://127.0.0.1:6789", {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify({ type: "value",
                           data: { name: testName, value: testResult } }),
  });
}

function reloadIfNeeded() {
  const testNumber = getTestNumber();
  if (testNumber < 100) {
    location.hash = "#" + (testNumber + 1);
    location.reload();
  } else {
    sendDone();
  }

}

function sendDone() {
  fetch("http://127.0.0.1:6789", {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify({ type: "done" }),
  });
}

function getTestNumber() {
  if (location.hash === "") {
    return 1;
  }
  return Number(location.hash.substring(1));
}

function insertComplexElement() {
  const persistentTokensListElt = strHtml`<pre
    class="persistent-tokens-list">Loading...</pre>`;
  const temporaryTokensListElt = strHtml`<pre
    class="temporary-tokens-list">Loading...</pre>`;
  const errorContainerElt = strHtml`<div></div>`;
  const pageBodyElt = strHtml`<div>
    ${errorContainerElt}
    <div class="header">
      <div class="header-item page-title">
        <a href=${4444}>${"wrT4WGREJK"}</a>
        ${"> Token"}
      </div>
    </div>
    <div class="page-input-block token-block">
      <div class="token-presentation">
        <h2>Token Management</h2>
        <p>${
          "You need a token to link the inspector to a client. " +
          "Those may be created (or reused) in this page."
        }</p>
        <p>${
          "A (default) temporary token can be used until either its " +
          "expiration or until no inspector AND no device are linked " +
          "to it anymore."
        }<br>Persistent tokens can be used until their expiration.</p>
      </div>
      <div>
        <div class="input-title">
          Generate a temporary token:
        </div>
        ${strHtml`<button class="btn-generate-token">Generate Token </button>`}
      </div>
      <br>
      <div>
        <div class="input-title">
          <span class="emphasized">OR</span>
          <span> enter the wanted token:</span>
        </div>
        ${strHtml`<input placeholder="Enter the wanted token">`}
      </div>
      <br>
      <div>
        <div class="input-title">
          <span class="emphasized">OR</span>
          <span> import an already-generated log file (Post-Debugger page):</span>
        </div>
        ${strHtml`<button>Go to Post-Debugger page </button>`}
      </div>
      <br>
      <div>
        <div class="persistent-tokens-title">
          List of active persistent tokens:
          ${persistentTokensListElt}
        </div>
        <div class="temporary-tokens-title">
          List of active temporary tokens:
          ${temporaryTokensListElt}
        </div>
      </div>
    </div>
  </div>`;
  document.body.appendChild(pageBodyElt);
}

/**
 * Convert a setTimeout to a Promise.
 *
 * You can use it to have a much more readable blocking code with async/await
 * in some asynchronous tests.
 *
 * @param {number} timeInMs
 * @returns {Promise}
 */
function sleep(timeInMs) {
  return new Promise((res) => {
    setTimeout(res, timeInMs);
  });
}

