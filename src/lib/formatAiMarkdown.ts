/**
 * 🎨 TØNSBERGLIVET AI MARKDOWN FORMATTER & ENHANCER
 * 
 * Forvandler ustrukturerte eller sammenklemte AI-svar til luftige,
 * oversiktlige og lettleste faglige meldinger tilpasset Tønsberglivet OS.
 */

export function formatAiMarkdown(text: string): string {
  if (!text || typeof text !== 'string') return '';

  let formatted = text.trim();
  // Normaliser linjeskift
  formatted = formatted.replace(/\r\n/g, '\n');

  // Normaliser uformelle kulepunkter (en-dash –, em-dash —, bullet •, ●) til standard markdown '- '
  formatted = formatted
    .replace(/^[ \t]*[•●–—][ \t]*/gm, '- ')
    .replace(/\n[ \t]*[•●–—][ \t]*/g, '\n- ')
    .replace(/([^\n])\s+[-•]\s+\*\*/g, '$1\n- **');

  const lines = formatted.split('\n');
  const resultLines: string[] = [];
  let inOrderedList = false;
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      if (resultLines.length > 0 && resultLines[resultLines.length - 1] !== '') {
        resultLines.push('');
      }
      inOrderedList = false;
      inList = false;
      continue;
    }

    // Markdown-overskrift (#, ##, ###)
    if (/^#{1,6}\s/.test(line)) {
      if (resultLines.length > 0 && resultLines[resultLines.length - 1] !== '') {
        resultLines.push('');
      }
      resultLines.push(line);
      resultLines.push('');
      inOrderedList = false;
      inList = false;
      continue;
    }

    // Seksjonsoverskrifter som slutter på kolon
    const isSectionHeader = 
      /^(Arrangementer|Handlinger|Viktig|Forhåndsregler|Fremgangsmåte|Anbefaling|Oppsummering|Sjekkliste|Bylivet|Kultur|Torvleie|Markedsføring|SoMe)/i.test(line) && 
      (line.endsWith(':') || line.endsWith(':-') || line.endsWith(';'));

    const isCalloutAction = 
      /^(Vil du at jeg|Ønsker du at|Skal jeg|Vil du ha|Husk at|Tips:|Anbefaling:)/i.test(line) && 
      (line.endsWith('?') || line.endsWith('.'));

    if (isSectionHeader) {
      let icon = '📌';
      if (/arrangement|konsert|festival/i.test(line)) icon = '📅';
      else if (/handling|oppgave|flyt/i.test(line)) icon = '⚙️';
      else if (/viktig|advarsel|obs/i.test(line)) icon = '⚠️';
      else if (/some|markedsføring|facebook|instagram/i.test(line)) icon = '📣';
      else if (/tips|anbefaling/i.test(line)) icon = '💡';

      const cleanHeader = line.replace(/^#+\s*/, '').replace(/[:;-]+$/, '').trim();
      if (resultLines.length > 0 && resultLines[resultLines.length - 1] !== '') {
        resultLines.push('');
      }
      resultLines.push(`### ${icon} ${cleanHeader}`);
      resultLines.push('');
      inOrderedList = false;
      inList = false;
      continue;
    }

    if (isCalloutAction) {
      if (resultLines.length > 0 && resultLines[resultLines.length - 1] !== '') {
        resultLines.push('');
      }
      resultLines.push(`> 💡 **Neste steg:** ${line}`);
      resultLines.push('');
      inOrderedList = false;
      inList = false;
      continue;
    }

    // Nummerert element
    if (/^\d+[\.\)]\s/.test(line)) {
      if (resultLines.length > 0 && resultLines[resultLines.length - 1] !== '' && !inList && !inOrderedList) {
        resultLines.push('');
      }
      resultLines.push(line);
      inOrderedList = true;
      inList = true;
      continue;
    }

    // Kulepunkt
    if (/^[\*\-\+]\s/.test(line)) {
      if (inOrderedList) {
        resultLines.push(`   ${line}`);
      } else {
        resultLines.push(line);
      }
      inList = true;
      continue;
    }

    // Sitat
    if (/^>\s/.test(line)) {
      resultLines.push(line);
      inOrderedList = false;
      inList = false;
      continue;
    }

    // Vanlig avsnitt
    resultLines.push(line);
    inOrderedList = false;
    inList = false;

    const nextLine = lines[i + 1]?.trim();
    if (line.endsWith('.') || line.endsWith('!') || line.endsWith(':')) {
      if (nextLine && !nextLine.startsWith('-') && !nextLine.startsWith('*') && !nextLine.startsWith('#') && !/^\d+[\.\)]/.test(nextLine)) {
        resultLines.push('');
      }
    }
  }

  let finalResult = resultLines.join('\n');
  finalResult = finalResult.replace(/\n{3,}/g, '\n\n');
  finalResult = linkifyUrlsAndDomains(finalResult);

  return finalResult;
}

/**
 * Gjør råe nettadresser og domenenavn (f.eks. foynhagen.no, nrk.no/tonsberg)
 * om til klikkbare markdown-lenker dersom de ikke allerede er lenket.
 */
function linkifyUrlsAndDomains(text: string): string {
  const parts = text.split(/(\[[^\]]+\]\([^\)]+\))/g);
  for (let i = 0; i < parts.length; i++) {
    if (!parts[i].startsWith('[')) {
      parts[i] = parts[i].replace(
        /(^|[\s(\[])((?:https?:\/\/[^\s,)]+)|(?:[a-zA-Z0-9-]+\.(?:no|com|org|net|io|info|app)(?:\/[^\s,)]*)?))/gi,
        (match, prefix, url) => {
          let cleanUrl = url;
          let trailing = '';
          const punctMatch = cleanUrl.match(/[.,;:!?]+$/);
          if (punctMatch) {
            trailing = punctMatch[0];
            cleanUrl = cleanUrl.slice(0, -trailing.length);
          }
          if (cleanUrl.length < 4 || !cleanUrl.includes('.')) return match;
          const href = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;
          return `${prefix}[${cleanUrl}](${href})${trailing}`;
        }
      );
    }
  }
  return parts.join('');
}

export function stripMarkdownFormatting(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+?)\*\*/g, '$1')
    .replace(/\*([^*]+?)\*/g, '$1')
    .replace(/\*{1,2}/g, '')
    .replace(/_([^_]+?)_/g, '$1')
    .replace(/^>\s*/gm, '')
    .replace(/```[a-z]*\n([\s\S]*?)\n```/g, '$1')
    .replace(/`([^`]+?)`/g, '$1')
    .replace(/^[ \t]*[•●–—][ \t]*/gm, '- ')
    .trim();
}
