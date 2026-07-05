# ⚒️ Skill Forge

Générateur de skills Claude personnalisés. Un bon skill embarque le contexte de son utilisateur — jargon, projets, acteurs, enjeux. Skill Forge interviewe l'utilisateur via un questionnaire, puis génère un skill prêt à installer, **sans backend ni clé API** : tout se passe dans le navigateur.

**v1 : Comptes-rendus de réunion** — à partir d'un transcript (Teams/Copilot, Meet, Zoom…), le skill généré produit décisions, actions, risques, hypothèses, points ouverts, angles morts et lecture politique, avec le regard d'un chef de projet senior.

## Deux modes de génération

1. **Skill prêt à l'emploi** — les réponses au questionnaire sont injectées dans un template de skill éprouvé. Résultat : un `SKILL.md` téléchargeable en `.zip`, installable tel quel sur claude.ai ou dans Claude Code.
2. **Sur mesure via votre Claude** — la page assemble un méga-prompt (skill de base + vos réponses) à coller dans claude.ai : Claude vous pose 3-5 questions complémentaires puis rédige un skill vraiment sur mesure.

L'interface est bilingue FR/EN, et le skill peut être généré dans l'une ou l'autre langue.

## Lancer en local

Site 100 % statique (vanilla HTML/CSS/JS, zéro dépendance) :

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Déployer sur GitHub Pages

Le workflow `.github/workflows/pages.yml` publie le site à chaque push sur `main`.
Une seule action manuelle est nécessaire : dans **Settings → Pages** du repo, choisir **Source : GitHub Actions**.

## Installer un skill généré

- **claude.ai** : Paramètres → Capacités → Skills → téléverser le `.zip`.
- **Claude Code** : enregistrer le contenu sous `~/.claude/skills/meeting-minutes/SKILL.md`.

## Architecture

```
index.html                       Catalogue des skills
generator.html?skill=<id>        Wizard de personnalisation (générique)
css/style.css                    Design responsive, light/dark
js/
  app.js                         Moteur du wizard (piloté par le manifest)
  template-engine.js             Mini-moteur {{var}} / {{#if}} / {{#each}}
  i18n.js                        Bascule FR/EN
  output.js                      Copie + téléchargement .zip
  zip.js                         Écriture ZIP minimale (aucune dépendance)
  home.js                        Rendu du catalogue
skills/
  catalog.json                   Liste des skills du catalogue
  meeting-minutes/
    manifest.json                Questionnaire (étapes, questions, variables)
    template.fr.md / .en.md      Skill de base avec placeholders
    meta-prompt.fr.md / .en.md   Template du méga-prompt (mode hybride)
```

**Ajouter un skill au catalogue** = créer un dossier `skills/<id>/` (manifest + templates) et ajouter une entrée dans `skills/catalog.json`. Aucun changement de code : le wizard est entièrement piloté par le manifest.

## Feuille de route

- [x] Fusionner le skill `meeting-minutes` original de l'auteur dans les templates (v3.7 — méthodologie généralisée : test d'autorité des décisions, grille risque/hypothèse/dépendance, test d'admission backlog, passe de consolidation par sujet, filtre de contenu sensible, vérification post-production, briefing privé avec angles morts et auto-analyse)
- [ ] Coach de réunion (analyse des rituels dans la durée)
- [ ] Extraction de backlog (user stories depuis transcripts)
- [ ] Débrief candidat (fiches d'évaluation comparables)
- [ ] Partage d'une configuration via lien
