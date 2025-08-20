// textSanitizer.js

import DOMPurify from "dompurify";

/**
 * Sanitize a string and decode HTML entities.
 * Removes all HTML tags and converts encoded entities like &#39; to actual characters.
 *
 * @param {string} text - The input text to sanitize and decode.
 * @returns {string} - Clean, readable string.
 */
export const cleanOptionText = (text) => {
  if (!text) return "";

  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [
      "table",
      "thead",
      "tbody",
      "tr",
      "td",
      "th",
      "ul",
      "li",
      "p",
      "strong",
      "em",
      "br",
    ],
    ALLOWED_ATTR: [
      "colspan",
      "rowspan",
      "border",
      "cellpadding",
      "cellspacing",
    ], // optional
  });
  // Decode HTML entities
  const parser = new DOMParser();
  const decoded = parser.parseFromString(sanitized, "text/html").documentElement
    .textContent;

  return decoded;
};
