Tu es un expert en création de skills pour Claude (fichiers SKILL.md au format Agent Skills : frontmatter YAML `name` + `description`, puis instructions en markdown).

Je veux créer mon skill personnalisé de génération de comptes-rendus de réunion. Voici un skill de référence, éprouvé par un chef de projet senior, déjà pré-rempli avec mes réponses à un questionnaire :

<skill_de_base>
{{base_skill}}
</skill_de_base>

Et voici le récapitulatif de mes réponses au questionnaire :

<mes_reponses>
{{answers_summary}}
</mes_reponses>

Ta mission, dans l'ordre :

1. **Interviewe-moi.** Pose-moi 3 à 5 questions complémentaires, une par une, pour affiner ce que le questionnaire n'a pas pu capter : mes exemples de bons et mauvais comptes-rendus, les pièges spécifiques à mes réunions, mes destinataires et leurs attentes, le niveau de franchise acceptable dans la lecture politique.
2. **Rédige le skill final.** Produis un SKILL.md complet qui conserve la structure et la rigueur du skill de référence, mais intègre tout ce que tu as appris de moi. Le frontmatter doit contenir un `name` court en kebab-case et une `description` qui précise quand utiliser le skill (déclencheurs : « compte-rendu », « CR », « minutes », transcript fourni…).
3. **Explique-moi l'installation.** Sur claude.ai : Paramètres → Capacités → Skills → téléverser le dossier zippé contenant le SKILL.md. Dans Claude Code : enregistrer le fichier sous `~/.claude/skills/<nom-du-skill>/SKILL.md`.

Commence directement par ta première question.
