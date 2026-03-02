import { type ReactNode, useMemo } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { glossary, type GlossaryEntry } from '@/data/glossary';

// Build a regex that matches any glossary term (case-insensitive, longest first)
// Glossary is already ordered longest-first
const termPattern = glossary
  .map((e) => e.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  .join('|');
const termRegex = new RegExp(`\\b(${termPattern})\\b`, 'gi');

function TermPopover({ entry, children }: { entry: GlossaryEntry; children: ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-blue-600 dark:text-blue-400 underline decoration-dotted underline-offset-2 hover:text-blue-800 dark:hover:text-blue-300 cursor-help font-medium inline">
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 text-sm" side="top">
        <p className="font-semibold mb-1">
          {entry.term}
          {entry.abbreviation && (
            <span className="text-muted-foreground font-normal"> ({entry.abbreviation})</span>
          )}
        </p>
        <p className="text-muted-foreground text-xs leading-relaxed">{entry.definition}</p>
      </PopoverContent>
    </Popover>
  );
}

function findEntry(matched: string): GlossaryEntry | undefined {
  const lower = matched.toLowerCase();
  return glossary.find((e) => e.term.toLowerCase() === lower);
}

export function GlossaryText({ text }: { text: string }) {
  const parts = useMemo(() => {
    const result: ReactNode[] = [];
    let lastIndex = 0;
    const seen = new Set<string>();

    // Reset regex
    termRegex.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = termRegex.exec(text)) !== null) {
      const matchedText = match[0];
      const key = matchedText.toLowerCase();

      // Add plain text before match
      if (match.index > lastIndex) {
        result.push(text.slice(lastIndex, match.index));
      }

      const entry = findEntry(matchedText);
      if (entry && !seen.has(key)) {
        // Only highlight first occurrence of each term per paragraph
        seen.add(key);
        result.push(
          <TermPopover key={match.index} entry={entry}>
            {matchedText}
          </TermPopover>,
        );
      } else {
        result.push(matchedText);
      }

      lastIndex = match.index + matchedText.length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      result.push(text.slice(lastIndex));
    }

    return result;
  }, [text]);

  return <>{parts}</>;
}
