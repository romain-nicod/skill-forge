/**
 * Minimal mustache-like template engine.
 * Supports: {{var}}, {{#if var}}…{{/if}}, {{^if var}}…{{/if}} (inverted),
 * {{#each var}}…{{this}}…{{/each}}.
 * Truthiness: non-empty trimmed string, true, non-empty array.
 * Blocks can be nested ({{#if}} inside {{#if}}): innermost blocks are
 * resolved first, repeatedly, until no block remains.
 */

function truthy(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  return Boolean(value);
}

// Matches an innermost block: its body contains no other block opener.
const IF_INNERMOST = /\{\{([#^])if ([\w-]+)\}\}((?:(?!\{\{[#^](?:if|each) )[\s\S])*?)\{\{\/if\}\}/;
const EACH_INNERMOST = /\{\{#each ([\w-]+)\}\}((?:(?!\{\{[#^](?:if|each) )[\s\S])*?)\{\{\/each\}\}/;

export function render(template, vars) {
  let out = template;
  let match;

  const resolveBlocks = () => {
    let changed = true;
    while (changed) {
      changed = false;
      while ((match = IF_INNERMOST.exec(out))) {
        const [whole, sigil, key, body] = match;
        const keep = sigil === '#' ? truthy(vars[key]) : !truthy(vars[key]);
        out = out.slice(0, match.index) + (keep ? body : '') + out.slice(match.index + whole.length);
        changed = true;
      }
      while ((match = EACH_INNERMOST.exec(out))) {
        const [whole, key, body] = match;
        const list = Array.isArray(vars[key]) ? vars[key] : [];
        const rendered = list.map((item) => body.split('{{this}}').join(String(item))).join('');
        out = out.slice(0, match.index) + rendered + out.slice(match.index + whole.length);
        changed = true;
      }
    }
  };

  resolveBlocks();

  out = out.replace(/\{\{([\w-]+)\}\}/g, (_, key) =>
    vars[key] !== undefined && vars[key] !== null ? String(vars[key]) : ''
  );

  // Tidy up: no more than one blank line in a row, no trailing spaces.
  return out.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}
