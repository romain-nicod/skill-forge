---
name: backlog-scanner
description: >-
  Scanne transcripts, notes de réunion, conversations ou documents de
  {{organization}} à la recherche d'opportunités d'items de backlog et
  génère un fichier markdown structuré de user stories au format BC.
  Utiliser quand l'utilisateur dit « backlog scan », « extraire le
  backlog », « candidats backlog », « scanne pour le backlog », ou fournit
  un transcript/document en demandant d'identifier des items actionnables.
---

# Backlog Scanner — {{organization}}

Identifier, classifier et formater des candidats backlog à partir de n'importe quelle source (transcripts de réunion, historiques de conversation, documents, échanges informels, retours utilisateurs).

## Contexte

- Organisation : {{organization}}
{{#if domain}}- Domaine métier : {{domain}}
{{/if}}{{#if products}}- Produits et périmètres couverts :
{{products}}
{{/if}}- Backlog géré dans : {{backlog_tool}}
{{#if gatekeeper}}- Tri des candidats (shortlisting) : {{gatekeeper}}, avant toute entrée au backlog
{{/if}}
{{#if glossary}}## Glossaire

{{glossary}}

{{/if}}## Workflow

### Étape 1 — Identification de la source

- **Transcript** : enregistrement de réunion (.docx, .odt, .vtt, .txt). Scanner le texte intégral.
- **Historique de conversation** : si l'environnement le permet, rechercher dans les conversations passées avec des mots-clés pertinents ; scanner plusieurs conversations si nécessaire.
- **Document** : tout fichier fourni. Extraire les items actionnables.
- **Sources multiples** : si l'utilisateur demande une consolidation, scanner toutes les sources puis dédupliquer.

### Étape 2 — Passe d'extraction

Pour chaque source, repérer les énoncés correspondant à L'UNE de ces familles de signaux :

**Signaux fonctionnalité :**
- « je veux… », « il nous faut… », « ce serait bien si… »
- « et si on pouvait… », « est-ce qu'on peut… », « est-il possible de… »
- Une partie prenante décrit un point de douleur dans son workflow
- Une partie prenante décrit un processus manuel automatisable
- Une comparaison avec un autre outil (« comme dans [produit] »)

**Signaux gouvernance / processus :**
- « il faut définir… », « il n'y a pas de standard pour… »
- « qui décide… », « comment on gère… »
- Un problème récurrent sans réponse définie
- Des inquiétudes de passage à l'échelle (« quand on ouvrira à plus d'utilisateurs… »)

**Signaux infrastructure :**
- « il nous faut plus de… », « c'est trop lent… », « ça a planté… »
- Lacunes de monitoring ou d'alerting, inquiétudes de capacité
- Frictions de déploiement, problèmes d'environnements

**Signaux architecture :**
- « on devrait restructurer… », « le design actuel… »
- Besoins d'intégration entre systèmes
- Résilience, redondance, changement de fournisseur

Pour chaque signal, capturer : **qui l'a dit** (rapporteur), **timestamp** (si disponible), **verbatim ou paraphrase fidèle**, **contexte** (ce qui a déclenché le propos), **qui a confirmé ou appuyé** (le cas échéant).

**Règle du besoin-sans-solution.** Un besoin clairement exprimé est un candidat backlog même si aucune solution n'a été discutée, À CONDITION qu'il implique une capacité produit, infrastructure ou processus de livraison (le test d'admission s'applique toujours — une pure plainte sans capacité implicite n'est pas un BC). Écrire la user story au niveau du besoin/de la capacité (« je veux » = capacité, « afin de » = bénéfice) et parquer la solution non résolue dans « Contraintes / questions ouvertes ». Ne jamais écarter un besoin sans solution au motif qu'il n'est pas estimable : le marquer « à cadrer ».

### Étape 3 — Classification

| Champ | Comment le déterminer |
|-------|----------------------|
| Type | Fonctionnalité / Gouvernance / Infra / Architecture — selon la nature du changement requis |
| Priorité | Selon le schéma de priorités ci-dessous |
| Rapporteur | La personne qui l'a soulevé + timestamp |
| Confirmé | Si une autre personne a explicitement approuvé ou appuyé |
| Réf existante | Croiser avec les items backlog connus. Si correspondance : la noter et passer, sauf si le nouveau contexte apporte de l'information. |

**Schéma de priorités :**
{{#if priority_scheme}}{{priority_scheme}}{{/if}}{{^if priority_scheme}}P1 = bloque le travail en cours ou le run · P2 = nécessaire pour le prochain jalon · P3 = confort, sans pression immédiate. Les priorités doivent être justifiées, jamais attribuées par défaut.{{/if}}

### Étape 4 — Déduplication

Avant de générer la sortie :
- Vérifier si l'item existe dans un fichier de candidats backlog déjà produit
- Vérifier s'il correspond à un item existant du backlog, si l'utilisateur l'a fourni{{#if existing_refs}} — conventions de référence :
{{existing_refs}}{{/if}}
- Si doublon : passer, ou noter « enrichit [réf existante] »
- Si nouveau : attribuer un numéro BC provisoire

### Étape 5 — Génération du fichier

Produire un fichier markdown suivant cette structure :

```markdown
# Candidats backlog — [Nom de la source et date]

Items identifiés depuis [description de la source].
{{#if gatekeeper}}À soumettre à {{gatekeeper}} pour tri avant entrée au backlog.{{/if}}

Numérotation provisoire : BC[début]–BC[fin].

## Synthèse

| # | Titre | Type | Priorité |
|---|-------|------|----------|
| BC[N] | [titre] | [type] | [priorité] |

### BC[N] — [Titre]

| Champ | Valeur |
|-------|--------|
| Type | [Fonctionnalité / Gouvernance / Infra / Architecture] |
| Rapporteur | [Nom], [timestamp] |
| Confirmé | [Qui a confirmé, le cas échéant] |

**En tant que** [rôle],
**je veux** [capacité],
**afin de** [bénéfice].

**Critères d'acceptation :**
- [critère 1]
- [critère 2]

**Contraintes / questions ouvertes :**
- [le cas échéant]

**Dépendances :**
- [le cas échéant]

[répéter pour chaque item]

## Items déjà suivis (référence)

| Réf existante | Titre | Nouveau contexte apporté par ce scan |
|---------------|-------|--------------------------------------|
```

### Étape 6 — Nommage du fichier

Convention : `{contexte} - {AAAAMMJJ} - Backlog Candidates v{NN}.md`. Le `{contexte}` est le plus petit périmètre qui contient tout le contenu du fichier (une réunion → le nom de la réunion ; une consolidation multi-sources → le niveau programme), jamais le sous-sujet le plus saillant.

## Règles d'écriture des user stories

- **Rôle** : utiliser les rôles réels{{#if roles}} de {{organization}} :
{{roles}}{{/if}} — jamais un générique « en tant qu'utilisateur », sauf si aucun rôle spécifique ne s'applique.
- **Je veux** : décrire la capacité, pas l'implémentation. « Je veux transférer un e-mail », pas « je veux un plugin Outlook ».
- **Afin de** : décrire le bénéfice métier, pas le résultat technique. « Afin d'interroger le contenu immédiatement », pas « afin qu'il soit indexé ».
- **Critères d'acceptation** : comportements observables et testables, pas des détails d'implémentation.
- **Contraintes** : limites techniques, considérations de sécurité, dépendances — attribuées à la personne qui les a soulevées, avec timestamp.

Si un item ne se prête pas au format user story (cadre de gouvernance, définition de processus, contrainte d'architecture), utiliser une description libre avec les mêmes champs d'en-tête (Type, Rapporteur, Confirmé).

## Contrôles qualité avant livraison

1. Chaque item a un rapporteur et un timestamp (ou « contexte de conversation » pour une source non horodatée).
2. Aucun item ne duplique une entrée existante du backlog sans apporter de contexte nouveau.
3. Les user stories passent le test INVEST (Indépendante, Négociable, de Valeur, Estimable, Suffisamment petite, Testable) — signaler les items trop gros et proposer un découpage.
4. Les priorités sont justifiées, pas attribuées par défaut.
5. Les dépendances sont croisées avec les autres BC ou les items existants du backlog.
6. Le fichier est rédigé en {{output_language}}.
