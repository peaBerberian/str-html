// I keep this unneeded code there because I can, who're we to force code to go
// away?
// Yeah I know VCS exist but it is the inferior paradigm compared to commenting
// out code and/or moving it elsewhere.
//
// Jokes aside, this file is just here for helping with brainstorming.

const CHAR_CODE_UPPER_A = "A".charCodeAt(0);
const CHAR_CODE_UPPER_Z = "Z".charCodeAt(0);

const CHAR_CODE_LOWER_A = "a".charCodeAt(0);
const CHAR_CODE_LOWER_Z = "z".charCodeAt(0);

const CHAR_CODE_0 = "0".charCodeAt(0);
const CHAR_CODE_9 = "9".charCodeAt(0);
const CHAR_CODE_DASH = "-".charCodeAt(0);
const CHAR_CODE_UNDERSCORE = "_".charCodeAt(0);
const CHAR_CODE_COLON = ":".charCodeAt(0);
const CHAR_CODE_DOT = ".".charCodeAt(0);

/* eslint-disable max-len */
/**
 * NOTE: Thrown away because no point when relying on `document.createElement`
 * and HTML5 isn't even based on SGML smh - there's your response past me.
 *
 * As per SGML:
 * ID and NAME tokens must begin with a letter ([A-Za-z]) and may be followed
 * by any number of letters, digits ([0-9]), hyphens ("-"), underscores ("_"),
 * colons (":"), and periods (".").
 *
 * NOTE: Browsers seem to be much more tolerant I don't know why yet.
 *
 * Both Firefox:
 * https://searchfox.org/mozilla-central/rev/fb43eb3bdf5b51000bc7dfe3474cbe56ca2ab63c/parser/expat/lib/moz_extensions.c#27
 *
 * and Chrome:
 * https://source.chromium.org/chromium/chromium/src/+/refs/heads/main:third_party/blink/renderer/core/dom/document.cc;l=599
 *
 * Actually authorize much more characters. I'll guess for now that this is only
 * to better interact with XML-related API, though it's perfectly fine to add
 * those elements to the DOM, for whatever reason.
 *
 * I'll stay less tolerant for now, tolerance is for the weak è_é.
 * @param {string} str
 * @returns {Boolean}
 */
/* eslint-enable max-len */
function isValidSgmlName(str) {
  if (str.length === 0) {
    return false;
  }
  const firstChar = str.charCodeAt(0);
  if (
    !(firstChar >= CHAR_CODE_UPPER_A && firstChar <= CHAR_CODE_UPPER_Z) &&
    !(firstChar >= CHAR_CODE_LOWER_A && firstChar <= CHAR_CODE_LOWER_Z)
  ) {
    return false;
  }

  for (let i = 1; i < str.length; i++) {
    const char = str.charCodeAt(i);
    if (
      !(char >= CHAR_CODE_UPPER_A && CHAR_CODE_UPPER_Z) &&
      !(char >= CHAR_CODE_LOWER_A && char <= CHAR_CODE_LOWER_Z) &&
      !(char >= CHAR_CODE_0 && char <= CHAR_CODE_9) &&
      char !== CHAR_CODE_UNDERSCORE &&
      char !== CHAR_CODE_DASH &&
      char !== CHAR_CODE_COLON &&
      char !== CHAR_CODE_DOT
    ) {
      return false;
    }
  }
  return true;
}

/**
 * NOTE: Thrown away because: why did I need this?
 * @param {string} currStr
 * @param {number} baseOffset
 * @returns {number}
 */
function skipCharacterReference(currStr, baseOffset) {
  if (currStr[baseOffset] !== "&") {
    return baseOffset;
  }
  const indexOf = currStr.substring(baseOffset + 1).indexOf(";");
  if (indexOf === -1) {
    return currStr.length;
  }
  return indexOf + 1;
}

/**
 * NOTE: thrown away because it's easier to understand when just inlined for
 * now.
 */
function processTagClosingElement(remainingStr, baseOffset, lastTagName) {
  let offset = baseOffset;
  const endOfElt = skipToElementNameDeclarationEnd(remainingStr[0], offset + 2);
  if (remainingStr[0].substring(offset + 2, endOfElt) !== lastTagName) {
    checkExprWrongPlace(remainingStr, "in an element's closing tag");
    throw new SyntaxError(
      "str-html: Closing tag does not " + "correspond to last opened taeg."
    );
  }
  offset = skipWhiteSpace(remainingStr[0], endOfElt);
  if (remainingStr[0][offset] !== ">") {
    checkExprWrongPlace(remainingStr, "in an element's closing tag");
    throw new SyntaxError("str-html: Malformed closing tag.");
  }
  offset++;
  return offset;
}

/**
 * NOTE: Thrown away because no point now.
 *
 * Newlines in HTML may be represented either as U+000D CARRIAGE RETURN (CR)
 * characters, U+000A LINE FEED (LF) characters, or pairs of U+000D CARRIAGE
 * RETURN (CR), U+000A LINE FEED (LF) characters in that order.
 * @param {string} str
 * @param {number} offset
 * @returns {number}
 */
function getHtmlNewLineLengthAtOffset(str, offset) {
  if (str[offset] === "\r") {
    if (str[offset + 1] === "\n") {
      return 2;
    }
    return 1;
  } else if (str[offset] === "\n") {
    return 1;
  }
  return 0;
}

/**
 * @param {string} str
 * @param {number} offset
 * @returns {number}
 */
function checkTagOpeningEndElement(str, offset) {
  if (str[offset] !== ">") {
    return -1;
  }
  return offset + 1;
}
