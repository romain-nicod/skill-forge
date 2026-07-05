---
name: backlog-scanner
description: >-
  Scans transcripts, meeting notes, chats or documents from {{organization}}
  for backlog item opportunities and generates a structured markdown file of
  user stories in the BC format. Use when the user says "backlog scan",
  "scan for backlog", "backlog items", "find backlog opportunities",
  "extract backlog", or provides a transcript/document and asks to identify
  actionable items for the product backlog.
---

# Backlog Scanner — {{organization}}

Identify, classify and format backlog candidates from any source material (meeting transcripts, chat history, documents, side conversations, user feedback).

## Context

- Organization: {{organization}}
{{#if domain}}- Business domain: {{domain}}
{{/if}}{{#if products}}- Products and scopes covered:
{{products}}
{{/if}}- Backlog managed in: {{backlog_tool}}
{{#if gatekeeper}}- Candidate shortlisting: {{gatekeeper}}, before anything enters the backlog
{{/if}}
{{#if glossary}}## Glossary

{{glossary}}

{{/if}}## Workflow

### Step 1 — Source identification

- **Transcript**: a meeting recording (.docx, .odt, .vtt, .txt). Scan the full text.
- **Chat history**: if the environment allows it, search past conversations with relevant keywords; scan several chats if needed.
- **Document**: any provided file. Extract actionable items.
- **Multiple sources**: if the user asks to consolidate, scan all sources then deduplicate.

### Step 2 — Extraction pass

For each source, identify statements matching ANY of these signal families:

**Feature signals:**
- "I want…", "we need…", "it would be nice if…"
- "What if we could…", "can we…", "is it possible to…"
- A stakeholder describes a workflow pain point
- A stakeholder describes a manual process that could be automated
- A comparison with another tool ("like in [product]")

**Governance / process signals:**
- "We need to define…", "there's no standard for…"
- "Who decides…", "how do we handle…"
- A recurring problem with no defined response
- Scaling concerns ("when we open to more users…")

**Infrastructure signals:**
- "We need more…", "it's too slow…", "it crashed…"
- Monitoring or alerting gaps, capacity concerns
- Deployment friction, environment issues

**Architecture signals:**
- "We should restructure…", "the current design…"
- Integration needs between systems
- Resilience, redundancy, provider switching

For each signal, capture: **who said it** (reporter), **timestamp** (if available), **verbatim quote or close paraphrase**, **context** (what prompted the statement), **who confirmed or supported** (if anyone).

**Need-without-solution rule.** A clearly expressed need qualifies as a backlog candidate even when no solution was discussed, PROVIDED it implies a product, infrastructure or delivery-process capability (the admission test still applies — a pure complaint with no implied capability is not a BC). Write the user story at the need/capability level (Want = capability, So that = benefit) and park the unresolved solution in "Constraints / open questions". Never drop a solution-less need on estimability grounds: flag it as needing scoping instead.

### Step 3 — Classification

| Field | How to determine |
|-------|-----------------|
| Type | Feature / Governance / Infra / Architecture — based on the nature of the change needed |
| Priority | Per the priority scheme below |
| Reporter | The person who raised it + timestamp |
| Confirmed | If another person explicitly agreed or supported |
| Existing ref | Cross-check against known backlog items. If a match exists, note it and skip unless the new context adds information. |

**Priority scheme:**
{{#if priority_scheme}}{{priority_scheme}}{{/if}}{{^if priority_scheme}}P1 = blocks current work or run operations · P2 = needed for the next milestone · P3 = nice to have, no immediate pressure. Priorities must be justified, never defaulted.{{/if}}

### Step 4 — Deduplication

Before generating the output:
- Check whether the item already exists in a previously produced backlog candidates file
- Check whether it matches an existing backlog item, if the user has provided the backlog{{#if existing_refs}} — reference conventions:
{{existing_refs}}{{/if}}
- If duplicate: skip, or note as "enriches [existing ref]"
- If new: assign a provisional BC number

### Step 5 — Output generation

Produce a markdown file following this structure:

```markdown
# Backlog Candidates — [Source name and date]

Items identified from [source description].
{{#if gatekeeper}}To be submitted to {{gatekeeper}} for shortlisting before entry into the backlog.{{/if}}

Provisional numbering: BC[start]–BC[end].

## Summary

| # | Title | Type | Priority |
|---|-------|------|----------|
| BC[N] | [title] | [type] | [priority] |

### BC[N] — [Title]

| Field | Value |
|-------|-------|
| Type | [Feature / Governance / Infra / Architecture] |
| Reporter | [Name], [timestamp] |
| Confirmed | [Who confirmed, if applicable] |

**As a** [role],
**I want** [capability],
**so that** [benefit].

**Acceptance criteria:**
- [criterion 1]
- [criterion 2]

**Constraints / open questions:**
- [if any]

**Dependencies:**
- [if any]

[repeat for each item]

## Items already tracked (reference)

| Existing ref | Title | New context from this scan |
|--------------|-------|----------------------------|
```

### Step 6 — Filename

Convention: `{context} - {YYYYMMDD} - Backlog Candidates v{NN}.md`. `{context}` is the smallest scope that contains all of the file's content (one meeting → the meeting's name; a multi-source consolidation → the program level), never the most salient sub-topic.

## User story writing rules

- **Role**: use the actual roles{{#if roles}} at {{organization}}:
{{roles}}{{/if}} — never a generic "as a user", unless no specific role applies.
- **Want**: describe the capability, not the implementation. "I want to forward an email", not "I want an Outlook plugin".
- **So that**: describe the business benefit, not the technical outcome. "So that I can query the content immediately", not "so that it is indexed".
- **Acceptance criteria**: observable, testable behaviours — not implementation details.
- **Constraints**: technical limitations, security considerations, dependencies — attributed to the person who raised them, with timestamp.

If an item does not fit the user story format (governance framework, process definition, architectural constraint), use a free-form description with the same header fields (Type, Reporter, Confirmed).

## Quality checks before delivery

1. Every item has a reporter and a timestamp (or "chat context" for a non-timestamped source).
2. No item duplicates an existing backlog entry without adding new context.
3. User stories pass the INVEST test (Independent, Negotiable, Valuable, Estimable, Small, Testable) — flag items that are too large and suggest splitting.
4. Priorities are justified, not defaulted.
5. Dependencies are cross-referenced to other BC items or existing backlog items.
6. The file is written in {{output_language}}.
