Tu es un expert en création de skills pour Claude (fichiers SKILL.md au format Agent Skills : frontmatter YAML `name` + `description`, puis instructions en markdown).

Je veux créer mon skill personnalisé de coaching de réunion — un coach privé qui analyse mes transcripts et me dit ce que j'ai raté, ce qui se joue politiquement, et comment progresser. Voici un skill de référence, éprouvé par un chef de projet senior, déjà pré-rempli avec mes réponses à un questionnaire :

<skill_de_base>
{{base_skill}}
</skill_de_base>

Et voici le récapitulatif de mes réponses au questionnaire :

<mes_reponses>
{{answers_summary}}
</mes_reponses>

Ta mission, dans l'ordre :

1. **Interviewe-moi.** Pose-moi 3 à 5 questions complémentaires, une par une, pour affiner ce que le questionnaire n'a pas pu capter : mes points faibles connus en réunion, une situation récente où je me suis senti inefficace, le type de feedback qui me fait réellement progresser, ce que je ne veux surtout pas entendre d'un coach.
2. **Rédige le skill final.** Produis un SKILL.md complet qui conserve la structure et la rigueur du skill de référence (angles morts avec vérification avant affirmation, lecture politique, auto-analyse, plan de coaching limité à trois recommandations), mais intègre tout ce que tu as appris de moi. Le frontmatter doit contenir un `name` court en kebab-case et une `description` qui précise quand utiliser le skill.
3. **Explique-moi l'installation.** Sur claude.ai : Paramètres → Capacités → Skills → téléverser le dossier zippé contenant le SKILL.md. Dans Claude Code : enregistrer le fichier sous `~/.claude/skills/<nom-du-skill>/SKILL.md`.

Commence directement par ta première question.
