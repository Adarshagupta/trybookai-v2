import { jsPDF } from 'jspdf';
import { BookOutline } from '@/types/book';
import { convert } from 'html-to-text';

// Add standard fonts
import 'jspdf/dist/polyfills.es.js';

// Define PDF styling constants
const STYLES = {
  fonts: {
    title: { name: 'helvetica', style: 'bold', size: 24 },
    subtitle: { name: 'helvetica', style: 'normal', size: 16 },
    heading1: { name: 'helvetica', style: 'bold', size: 18 },
    heading2: { name: 'helvetica', style: 'bold', size: 14 },
    normal: { name: 'times', style: 'normal', size: 12 },
    italic: { name: 'times', style: 'italic', size: 12 },
    small: { name: 'times', style: 'normal', size: 10 },
  },
  spacing: {
    paragraph: 7,
    heading: 12,
    section: 20,
  },
  margins: {
    top: 20,
    bottom: 20,
    left: 20,
    right: 20,
  },
  colors: {
    text: [0, 0, 0],
    accent: [0, 0, 128],
  }
};

// Function to process markdown for PDF rendering
const processMarkdown = (markdown: string): { text: string, format: 'normal' | 'italic' | 'bold' }[] => {
  // Split the markdown into paragraphs
  const paragraphs = markdown.split(/\n\s*\n/);
  const result: { text: string, format: 'normal' | 'italic' | 'bold' }[] = [];

  // Process each paragraph
  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) continue;

    // Check if it's a heading
    if (paragraph.startsWith('# ')) {
      result.push({ text: paragraph.substring(2).trim(), format: 'bold' });
      continue;
    }

    if (paragraph.startsWith('## ')) {
      result.push({ text: paragraph.substring(3).trim(), format: 'bold' });
      continue;
    }

    // Process emphasis and strong emphasis
    let processedText = paragraph;

    // Check if the entire paragraph is emphasized
    if ((paragraph.startsWith('*') && paragraph.endsWith('*')) ||
        (paragraph.startsWith('_') && paragraph.endsWith('_'))) {
      result.push({ text: paragraph.substring(1, paragraph.length - 1).trim(), format: 'italic' });
      continue;
    }

    // Check if the entire paragraph is strong
    if ((paragraph.startsWith('**') && paragraph.endsWith('**')) ||
        (paragraph.startsWith('__') && paragraph.endsWith('__'))) {
      result.push({ text: paragraph.substring(2, paragraph.length - 2).trim(), format: 'bold' });
      continue;
    }

    // Default case - normal text
    result.push({ text: convert(paragraph, {
      wordwrap: false,
      selectors: [
        { selector: 'a', options: { ignoreHref: true } },
        { selector: 'img', format: 'skip' },
        { selector: 'blockquote', format: 'italic' }
      ]
    }), format: 'normal' });
  }

  return result;
};

// Function to convert markdown to plain text (for simple cases)
const markdownToText = (markdown: string): string => {
  return convert(markdown, {
    wordwrap: 130,
    selectors: [
      { selector: 'a', options: { ignoreHref: true } },
      { selector: 'img', format: 'skip' }
    ]
  });
};

// Helper function to add text with proper formatting and pagination
const addFormattedText = (
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  options: {
    font?: { name: string; style: string; size: number };
    maxWidth?: number;
    align?: 'left' | 'center' | 'right';
    lineHeight?: number;
  }
): number => {
  const {
    font = STYLES.fonts.normal,
    maxWidth = doc.internal.pageSize.getWidth() - STYLES.margins.left - STYLES.margins.right,
    align = 'left',
    lineHeight = STYLES.spacing.paragraph
  } = options;

  // Set font properties
  doc.setFont(font.name, font.style);
  doc.setFontSize(font.size);

  // Split text to fit within maxWidth
  const lines = doc.splitTextToSize(text, maxWidth);

  // Calculate text position based on alignment
  let textX = x;
  if (align === 'center') {
    textX = doc.internal.pageSize.getWidth() / 2;
  } else if (align === 'right') {
    textX = doc.internal.pageSize.getWidth() - STYLES.margins.right;
  }

  // Add text with proper alignment
  doc.text(lines, textX, y, { align });

  // Return the new Y position after this text
  return y + (lines.length * lineHeight);
};

// Helper function to check if we need a new page
const ensurePageSpace = (doc: jsPDF, y: number, neededSpace: number): number => {
  const pageHeight = doc.internal.pageSize.getHeight();
  const bottomMargin = STYLES.margins.bottom;

  if (y + neededSpace > pageHeight - bottomMargin) {
    doc.addPage();
    return STYLES.margins.top;
  }

  return y;
};

// Helper function to add a formatted paragraph with proper pagination
const addParagraph = (
  doc: jsPDF,
  paragraph: { text: string; format: 'normal' | 'italic' | 'bold' },
  y: number
): number => {
  // Determine font style based on format
  let font;
  switch (paragraph.format) {
    case 'bold':
      font = STYLES.fonts.heading2;
      break;
    case 'italic':
      font = STYLES.fonts.italic;
      break;
    default:
      font = STYLES.fonts.normal;
  }

  // Ensure we have enough space for at least one line
  y = ensurePageSpace(doc, y, STYLES.spacing.paragraph);

  // Add the paragraph
  const maxWidth = doc.internal.pageSize.getWidth() - STYLES.margins.left - STYLES.margins.right;
  const lines = doc.splitTextToSize(paragraph.text, maxWidth);

  // Check if we need to split across pages
  const pageHeight = doc.internal.pageSize.getHeight();
  const bottomMargin = STYLES.margins.bottom;
  const lineHeight = STYLES.spacing.paragraph;

  doc.setFont(font.name, font.style);
  doc.setFontSize(font.size);

  let currentLine = 0;
  while (currentLine < lines.length) {
    // Calculate how many lines can fit on the current page
    const linesRemaining = lines.length - currentLine;
    const spaceRemaining = pageHeight - bottomMargin - y;
    const linesFitting = Math.floor(spaceRemaining / lineHeight);
    const linesToAdd = Math.min(linesFitting, linesRemaining);

    if (linesToAdd <= 0) {
      // No space for even one line, add a new page
      doc.addPage();
      y = STYLES.margins.top;
      continue;
    }

    // Add the lines that fit
    for (let i = 0; i < linesToAdd; i++) {
      doc.text(lines[currentLine], STYLES.margins.left, y);
      y += lineHeight;
      currentLine++;
    }

    // If we have more lines, add a new page
    if (currentLine < lines.length) {
      doc.addPage();
      y = STYLES.margins.top;
    }
  }

  // Add paragraph spacing
  return y + STYLES.spacing.paragraph;
};

// Helper function to add page numbers
const addPageNumbers = (doc: jsPDF): void => {
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Skip page numbers on title page
  for (let i = 2; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont(STYLES.fonts.small.name, STYLES.fonts.small.style);
    doc.setFontSize(STYLES.fonts.small.size);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
};

// Helper function to add headers to chapter pages
const addChapterHeaders = (doc: jsPDF, outline: BookOutline): void => {
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Start from page 3 (after title and TOC)
  let currentChapter = 0;

  for (let i = 3; i <= pageCount; i++) {
    doc.setPage(i);

    // Determine which chapter this page belongs to
    if (i === 3 || (i > 3 && doc.getTextDimensions('').h < 5)) { // New chapter starts on this page
      currentChapter++;
    }

    if (currentChapter > 0 && currentChapter <= outline.chapters.length) {
      const chapter = outline.chapters[currentChapter - 1];
      doc.setFont(STYLES.fonts.small.name, STYLES.fonts.small.style);
      doc.setFontSize(STYLES.fonts.small.size);
      doc.text(
        outline.title,
        STYLES.margins.left,
        7,
        { align: 'left' }
      );
      doc.text(
        `Chapter ${chapter.chapterNumber}: ${chapter.title}`,
        pageWidth - STYLES.margins.right,
        7,
        { align: 'right' }
      );
    }
  }
};

// Function to generate a PDF from a book outline and chapter contents
export const generateBookPDF = (
  outline: BookOutline,
  chapterContents: { [key: number]: string }
): jsPDF => {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Set initial position
  let y = STYLES.margins.top;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = STYLES.margins.left;
  const textWidth = pageWidth - STYLES.margins.left - STYLES.margins.right;

  // ===== TITLE PAGE =====

  // Create a decorative border

  // Draw a decorative border
  doc.setDrawColor(0, 0, 128); // Dark blue border
  doc.setLineWidth(0.5);
  doc.rect(
    STYLES.margins.left - 5,
    STYLES.margins.top - 5,
    pageWidth - (STYLES.margins.left + STYLES.margins.right) + 10,
    pageHeight - (STYLES.margins.top + STYLES.margins.bottom) + 10
  );

  // Add a second inner border
  doc.setLineWidth(0.2);
  doc.rect(
    STYLES.margins.left - 2,
    STYLES.margins.top - 2,
    pageWidth - (STYLES.margins.left + STYLES.margins.right) + 4,
    pageHeight - (STYLES.margins.top + STYLES.margins.bottom) + 4
  );

  // Center the title vertically
  y = pageHeight / 3;

  // Add book title
  y = addFormattedText(doc, outline.title, margin, y, {
    font: STYLES.fonts.title,
    align: 'center',
    lineHeight: STYLES.spacing.heading
  });

  y += STYLES.spacing.section;

  // Add genre and subgenre if available
  const genreText = outline.subgenre
    ? `${outline.genre} - ${outline.subgenre}`
    : outline.genre;
  y = addFormattedText(doc, genreText, margin, y, {
    font: STYLES.fonts.subtitle,
    align: 'center'
  });

  y += STYLES.spacing.section;

  // Add description
  if (outline.description) {
    y = addFormattedText(doc, outline.description, margin, y, {
      font: STYLES.fonts.italic,
      align: 'center',
      lineHeight: STYLES.spacing.paragraph
    });
  }

  // Add decorative line
  y += STYLES.spacing.section;
  doc.setDrawColor(0, 0, 128);
  doc.setLineWidth(0.3);
  doc.line(
    pageWidth / 2 - 30,
    y,
    pageWidth / 2 + 30,
    y
  );

  // Add author information if available
  y = pageHeight - STYLES.margins.bottom - 20;
  y = addFormattedText(doc, 'Generated with Bookify', margin, y, {
    font: STYLES.fonts.small,
    align: 'center'
  });

  // Add generation date
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  y = addFormattedText(doc, dateStr, margin, y + 5, {
    font: STYLES.fonts.small,
    align: 'center'
  });

  // ===== TABLE OF CONTENTS =====
  doc.addPage();
  y = STYLES.margins.top;

  // Add table of contents heading
  y = addFormattedText(doc, 'Table of Contents', margin, y, {
    font: STYLES.fonts.heading1,
    align: 'center'
  });

  y += STYLES.spacing.section;

  // Add decorative line
  doc.setDrawColor(0, 0, 128);
  doc.setLineWidth(0.2);
  doc.line(
    pageWidth / 2 - 40,
    y - 10,
    pageWidth / 2 + 40,
    y - 10
  );

  // Add chapter listings
  for (const chapter of outline.chapters) {
    const chapterTitle = `Chapter ${chapter.chapterNumber}: ${chapter.title}`;

    // Ensure we have space for this entry
    y = ensurePageSpace(doc, y, STYLES.spacing.paragraph);

    // Calculate the page number for this chapter (chapter number + 2 for title and TOC pages)
    const chapterPage = chapter.chapterNumber + 2;

    // Add chapter entry
    doc.setFont(STYLES.fonts.normal.name, STYLES.fonts.normal.style);
    doc.setFontSize(STYLES.fonts.normal.size);

    // Add the chapter title
    doc.text(chapterTitle, margin, y);

    // Add dotted line
    const titleWidth = doc.getTextWidth(chapterTitle);
    const pageNumWidth = doc.getTextWidth(String(chapterPage));
    const dotsWidth = pageWidth - margin * 2 - titleWidth - pageNumWidth - 5;
    const dotCount = Math.floor(dotsWidth / doc.getTextWidth('.'));
    let dots = '';
    for (let i = 0; i < dotCount; i++) {
      dots += '.';
    }
    doc.text(dots, margin + titleWidth + 2, y);

    // Add the page number
    doc.text(String(chapterPage), pageWidth - margin - pageNumWidth, y);

    y += STYLES.spacing.paragraph;
  }

  // ===== CHAPTERS =====

  // Add each chapter
  for (const chapter of outline.chapters) {
    // Start each chapter on a new page
    doc.addPage();
    y = STYLES.margins.top;

    // Add chapter title
    const chapterTitle = `Chapter ${chapter.chapterNumber}: ${chapter.title}`;
    y = addFormattedText(doc, chapterTitle, margin, y, {
      font: STYLES.fonts.heading1,
      lineHeight: STYLES.spacing.heading
    });

    y += STYLES.spacing.section;

    // Add chapter content if available
    if (chapterContents[chapter.chapterNumber]) {
      // Process the markdown content
      const processedContent = processMarkdown(chapterContents[chapter.chapterNumber]);

      // Add each paragraph with proper formatting
      for (const paragraph of processedContent) {
        y = addParagraph(doc, paragraph, y);
      }
    } else {
      // If no content is available, add a placeholder
      y = addFormattedText(doc, 'Content not generated for this chapter.', margin, y, {
        font: STYLES.fonts.italic
      });
    }
  }

  // Add page numbers and headers
  addPageNumbers(doc);
  addChapterHeaders(doc, outline);

  return doc;
};

// Function to download the PDF
export const downloadBookPDF = (
  outline: BookOutline,
  chapterContents: { [key: number]: string }
): void => {
  const doc = generateBookPDF(outline, chapterContents);

  // Generate a filename based on the book title
  const filename = outline.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') + '.pdf';

  // Save the PDF
  doc.save(filename);
};
