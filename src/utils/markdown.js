/**
 * A lightweight, safe markdown parser that processes basic markdown styling:
 * - Bold: **text**
 * - Italic: *text*
 * - Underline: ~text~
 * - Unordered list item: - text or * text
 * - Ordered list item: 1. text
 * It escapes any raw HTML tags to prevent XSS vulnerability before formatting.
 */
export function parseMarkdown(text) {
  if (!text) return '';

  // Normalize newlines (strip carriage returns)
  const normalized = text.replace(/\r/g, '');

  // 1. Escape HTML entities first to prevent arbitrary script execution
  let escaped = normalized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 2. Inline markdown parsing
  // Bold: **text** -> <strong>text</strong>
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italic: *text* -> <em>text</em>
  escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Underline: ~text~ -> <u>text</u>
  escaped = escaped.replace(/~(.*?)~/g, '<u>$1</u>');

  // 3. Block level parsing (paragraphs, lists)
  const lines = escaped.split('\n');
  const result = [];
  
  let inUl = false;
  let inOl = false;
  let paragraphBuffer = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      result.push(`<p class="mb-2 last:mb-0 leading-[1.8] text-t2">${paragraphBuffer.join('<br />')}</p>`);
      paragraphBuffer = [];
    }
  };

  const closeLists = () => {
    if (inUl) {
      result.push('</ul>');
      inUl = false;
    }
    if (inOl) {
      result.push('</ol>');
      inOl = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for lists
    const ulMatch = line.match(/^(\s*)[-*]\s+(.*)/);
    const olMatch = line.match(/^(\s*)\d+\.\s+(.*)/);

    if (ulMatch) {
      flushParagraph();
      if (inOl) {
        result.push('</ol>');
        inOl = false;
      }
      if (!inUl) {
        result.push('<ul class="list-disc pl-5 mb-2 space-y-1 text-t2">');
        inUl = true;
      }
      result.push(`<li>${ulMatch[2]}</li>`);
    } else if (olMatch) {
      flushParagraph();
      if (inUl) {
        result.push('</ul>');
        inUl = false;
      }
      if (!inOl) {
        result.push('<ol class="list-decimal pl-5 mb-2 space-y-1 text-t2">');
        inOl = true;
      }
      result.push(`<li>${olMatch[2]}</li>`);
    } else {
      // Not a list item
      if (trimmed === '') {
        closeLists();
        flushParagraph();
        // Render a spacing element for empty lines
        result.push('<div class="h-2"></div>');
      } else {
        closeLists();
        paragraphBuffer.push(line);
      }
    }
  }

  closeLists();
  flushParagraph();

  return result.join('');
}
