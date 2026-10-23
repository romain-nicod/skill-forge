import { createZip } from './zip.js';
import { t } from './i18n.js';
import { pixelMark } from './pixel-marks.js';

export async function copyToClipboard(text, button) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback for non-secure contexts (e.g. plain http)
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  if (button) {
    // « Copié » with a pixel tick; also announced, since the colour change says nothing
    const original = button.innerHTML;
    button.innerHTML = `${pixelMark('check')} ${t('out.copied')}`;
    button.classList.add('is-copied');
    const status = document.getElementById('copy-status');
    if (status) status.textContent = t('out.copied');
    setTimeout(() => {
      button.innerHTML = original;
      button.classList.remove('is-copied');
      if (status) status.textContent = '';
    }, 1800);
  }
}

export function downloadSkillZip(skillId, skillContent) {
  const blob = createZip([{ name: `${skillId}/SKILL.md`, content: skillContent }]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${skillId}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
