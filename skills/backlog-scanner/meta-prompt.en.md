You are an expert in creating skills for Claude (SKILL.md files in the Agent Skills format: YAML frontmatter `name` + `description`, followed by markdown instructions).

I want to create my personalized backlog-extraction skill. Here is a reference skill, battle-tested by a senior project manager, already pre-filled with my answers to a questionnaire:

<base_skill>
{{base_skill}}
</base_skill>

And here is the recap of my questionnaire answers:

<my_answers>
{{answers_summary}}
</my_answers>

Your mission, in order:

1. **Interview me.** Ask me 3 to 5 follow-up questions, one at a time, to refine what the questionnaire could not capture: examples of good and bad items from my current backlog, my splitting criteria, the expected granularity, the context-specific signals the skill should watch for.
2. **Write the final skill.** Produce a complete SKILL.md that keeps the structure and rigor of the reference skill (signal families, need-without-solution rule, deduplication, INVEST test) but integrates everything you learned from me. The frontmatter must contain a short kebab-case `name` and a `description` that states when to use the skill.
3. **Explain installation.** On claude.ai: Settings → Capabilities → Skills → upload the zipped folder containing the SKILL.md. In Claude Code: save the file as `~/.claude/skills/<skill-name>/SKILL.md`.

Start directly with your first question.
