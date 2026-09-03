# ⚒️ Skill Forge

*[Version française](README.fr.md)*

**A service by [AI-GMENTED.pm](https://ai-gmented.pm)**, hosted at [forge.ai-gmented.pm](https://forge.ai-gmented.pm).

**Licence**: [CC BY 4.0](LICENSE) across the whole repository, skill templates
included. Reuse it, adapt it, sell what you build with it, and keep the credit
visible. The skills **you** generate belong to you, commercial use included,
with no attribution required. The AI-GMENTED name stays reserved, which a
copyright licence does not cover: see [NOTICE](NOTICE).

A generator for personalised Claude skills. A good skill carries its user's
context: their jargon, their projects, the people involved, what is at stake.
Skill Forge interviews the user through a questionnaire, then generates a skill
ready to install, **with no backend and no API key**. Everything happens in the
browser.

**v1: meeting minutes.** From a transcript (Teams, Meet, Zoom), the generated
skill produces decisions, actions, risks, assumptions, open points, blind spots
and the political read, with the eye of a senior project manager.

## Two ways to generate

1. **Ready to use.** The questionnaire answers are injected into a proven skill
   template. The result is a `SKILL.md` downloadable as a `.zip`, installable as
   is on claude.ai or in Claude Code.
2. **Tailored, through your own Claude.** The page assembles a mega-prompt (the
   base skill plus your answers) to paste into claude.ai. Claude then asks three
   to five follow-up questions and writes a genuinely bespoke skill.

The interface is bilingual, and a skill can be generated in either language.

## Running it locally

A fully static site: vanilla HTML, CSS and JS, zero dependencies.

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploying to GitHub Pages

The `.github/workflows/pages.yml` workflow publishes the site on every push to
`main`. One manual step is needed: in the repository's **Settings → Pages**,
choose **Source: GitHub Actions**.

## Deploying to Infomaniak, or any FTP host

The `.github/workflows/deploy-infomaniak.yml` workflow pushes the site over FTPS
on every push to `main`, as soon as three secrets are set in **Settings →
Secrets and variables → Actions**:

| Secret | Value |
|---|---|
| `INFOMANIAK_FTP_HOST` | FTP host (e.g. `xxxxx.ftp.infomaniak.com`, found under Manager → Web Hosting → FTP/SSH) |
| `INFOMANIAK_FTP_USER` | FTP user |
| `INFOMANIAK_FTP_PASSWORD` | FTP password |

You also need the **variable** `INFOMANIAK_SERVER_DIR` (the *Variables* tab):
the target directory, for example `/` for an FTP account restricted to the
site's folder, or `/sites/forge.example.com/`. **There is deliberately no
default directory**: until the secrets and the variable are set, the job is
skipped, so an existing site cannot be overwritten by accident. Create a
dedicated FTP account restricted to the subdomain's folder. Since the site is
fully static, dragging the files into the Manager's web FTP works too.

## Installing a generated skill

- **claude.ai**: Settings → Capabilities → Skills → upload the `.zip`.
- **Claude Code**: save the content as `~/.claude/skills/meeting-minutes/SKILL.md`.

## Architecture

```
index.html                       Skill catalogue, LinkedIn call to action, contact
generator.html?skill=<id>        The personalisation wizard, generic
css/style.css                    AI-GMENTED.pm styling, light and dark
js/
  app.js                         Wizard engine, driven by the manifest
  template-engine.js             Small {{var}} / {{#if}} / {{#each}} engine
  i18n.js                        Language switch
  theme.js                       Light and dark switch, plus the mobile menu
  contact.js                     Contact form (CSRF and AJAX, mailto fallback)
  output.js                      Copy and .zip download
  zip.js                         Minimal ZIP writer, no dependency
  home.js                        Catalogue rendering
skills/
  catalog.json                   The catalogue's skill list
  meeting-minutes/
    manifest.json                Questionnaire: steps, questions, variables
    template.fr.md / .en.md      Base skill with placeholders
    meta-prompt.fr.md / .en.md   Mega-prompt template, for the hybrid mode
```

**Adding a skill to the catalogue** means creating a `skills/<id>/` directory
(manifest plus templates) and adding an entry to `skills/catalog.json`. No code
changes: the wizard is entirely manifest-driven.

## Design, and how it sits with AI-GMENTED.pm

The site follows the [ai-gmented.pm](https://ai-gmented.pm) styling: the orange
accent `#C2661A`, system fonts, and the parent site's navigation and footer. The
dark theme (the sun and moon button, remembered in localStorage) keeps the
orange accent for links, lightened to `#E8853B` for AA contrast.

**Contact form.** It posts to `/contact.php`, included in the repository and the
same handler as the parent site: HMAC CSRF without a cookie, a honeypot, rate
limiting, and local SMTP delivery. It deploys with the site. On GitHub Pages,
where there is no PHP, the page falls back to a direct email link on its own.
Recommended hardening: set the `CSRF_SECRET` environment variable server-side,
otherwise a secret derived from the install path is used.

**Analytics.** `js/analytics.js` sends anonymous measurements to the parent
site's self-hosted Matomo (`ai-gmented.pm/analytics/`): no cookie, no
third-party script, no fingerprinting, and Do Not Track is honoured. Pageviews,
plus `generate-zip`, `copy-skill` and `copy-megaprompt` events carrying the skill
id and language, never the answers or the generated content. ⚠️ One manual step:
create the "forge.ai-gmented.pm" site in the Matomo admin (Administration →
Websites → Manage) and check that its ID matches `SITE_ID` in `js/analytics.js`,
which defaults to 2.

**`.htaccess`.** The same security headers as the parent site: a `script-src
'self'` CSP, since no inline script is used and the theme is initialised by
`js/theme.js` loaded in the `<head>`; forced HTTPS; and PHP blocked except for
`contact.php`.

## Roadmap

- [x] Merge the author's original `meeting-minutes` skill into the templates
      (v3.7: generalised method, with the decision authority test, the
      risk/assumption/dependency grid, the backlog admission test, the topic
      consolidation pass, the sensitive-content filter, post-production
      verification, and the private briefing with blind spots and self-analysis)
- [x] Meeting coach: a private briefing that is never circulated, covering blind
      spots, the political read, self-analysis, who spoke and for how long,
      decisions that keep slipping, and the rituals
- [x] Backlog extraction: user stories from transcripts, with signal families,
      the need-without-solution rule, deduplication, and the INVEST test
- [ ] Candidate debrief, producing comparable scorecards
- [ ] Sharing a configuration through a link
