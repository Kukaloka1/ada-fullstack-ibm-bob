/**
 * Lightweight message formatter for ADA chat.
 *
 * Provides basic markdown-like formatting without heavy dependencies.
 * Supports: headings, paragraphs, lists, code blocks, and inline emphasis.
 */

export interface FormattedBlock {
  type: "paragraph" | "list" | "code" | "heading";
  content: string;
  items?: string[];
  level?: number;
}

/**
 * Parse message content into formatted blocks
 */
export function parseMessageContent(content: string): FormattedBlock[] {
  const blocks: FormattedBlock[] = [];
  const lines = content.split("\n");

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines
    if (!line.trim()) {
      i++;
      continue;
    }

    // Code block detection (```...```)
    if (line.trim().startsWith("```")) {
      const codeLines: string[] = [];
      i++; // Skip opening ```

      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }

      if (codeLines.length > 0) {
        blocks.push({
          type: "code",
          content: codeLines.join("\n"),
        });
      }

      i++; // Skip closing ```
      continue;
    }

    // Heading detection (# ... ######)
    const headingMatch = line.trim().match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        content: headingMatch[2].trim(),
        level: headingMatch[1].length,
      });
      i++;
      continue;
    }

    // List detection (- or * or numbered)
    if (line.trim().match(/^[-*]\s+/) || line.trim().match(/^\d+\.\s+/)) {
      const listItems: string[] = [];

      while (i < lines.length) {
        const listLine = lines[i].trim();
        if (listLine.match(/^[-*]\s+/) || listLine.match(/^\d+\.\s+/)) {
          // Remove list marker
          const item = listLine.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "");
          listItems.push(item);
          i++;
        } else if (!listLine) {
          i++;
          break;
        } else {
          break;
        }
      }

      if (listItems.length > 0) {
        blocks.push({
          type: "list",
          content: "",
          items: listItems,
        });
      }
      continue;
    }

    // Regular paragraph
    const paragraphLines: string[] = [line];
    i++;

    // Collect continuation lines
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trim().match(/^(#{1,6})\s+/) &&
      !lines[i].trim().match(/^[-*]\s+/) &&
      !lines[i].trim().match(/^\d+\.\s+/)
    ) {
      paragraphLines.push(lines[i]);
      i++;
    }

    blocks.push({
      type: "paragraph",
      content: paragraphLines.join(" "),
    });
  }

  return blocks;
}

/**
 * Apply inline formatting for bold text with ** and inline code with `.
 */
export function formatInlineText(
  text: string
): { text: string; bold: boolean; code: boolean }[] {
  const parts: { text: string; bold: boolean; code: boolean }[] = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Add plain text before token
    if (match.index > lastIndex) {
      parts.push({
        text: text.substring(lastIndex, match.index),
        bold: false,
        code: false,
      });
    }

    const token = match[0];

    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push({
        text: token.slice(2, -2),
        bold: true,
        code: false,
      });
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push({
        text: token.slice(1, -1),
        bold: false,
        code: true,
      });
    }

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      text: text.substring(lastIndex),
      bold: false,
      code: false,
    });
  }

  return parts.length > 0 ? parts : [{ text, bold: false, code: false }];
}
