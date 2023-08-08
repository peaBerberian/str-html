/**
 * Construct an HTMLElement from a template litteral representing its HTML
 * format, where template literal expressions can be inserted in attribute
 * values and an element's content.
 * @param {Array.<string>} templateStrArr - List of strings generated for the
 * tagged template litteral.
 * @param {Array} ...expressions  - Array of expressions generated for the
 * tagged template litteral.
 * @returns {HTMLElement} - The constructed `HTMLElement` from the parsed
 * string.
 */
declare function strHtml(
  templateStrArr: TemplateStringsArray,
  ...expr: unknown[]
): HTMLElement;
export default strHtml;
