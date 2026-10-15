# SYN-03 — Le contrôle du centenaire : fiche de réalisation

**Statut :** contenu à implémenter ; maquette exclue du jeu. **Responsable :** à attribuer. **Relecteur :** autre membre du binôme.

Cette fiche reprend la conception du README au 15 octobre 2026. Les textes et solutions ci-dessous sont la référence éditoriale du niveau ; `level.json` est sa version exécutée. Lors d’un changement de design, mettre à jour ces deux fichiers et signaler toute divergence avec le [README principal](../../../README.md). La fiche n’est pas chargée par le jeu.

## Périmètre et autonomie

- Modifier `game/levels/syn-03/` : contenu, dialogues, règles déclaratives, fixtures, critères et ressources.
- Prévisualiser avec `npm run dev`, puis `http://localhost:5173/?level=syn-03`.
- L’atelier injecte les entrées simulées de `fixtures.json`. Il ne modifie jamais la sauvegarde de campagne.
- Prérequis dans la vraie campagne : **FUT-01, FUT-02**. Points attribués : **10**.
- Ne pas importer un niveau voisin. Ne pas modifier les contrats, les widgets communs ou les bindings de campagne en parallèle sans convenir d’un propriétaire temporaire.
- Briques : EvidenceChoice composé de décisions et preuves, puis cadran final à réaliser.

## Fichiers à prendre en charge

| Fichier | Travail attendu |
|---|---|
| `level.json` | Supports, graphe de dialogue, trois indices pour les puzzles, étapes, validation et sorties |
| `fixtures.json` | Fragments simulés typés pour jouer sans les autres niveaux |
| `acceptance.json` | Une réponse complète par étape, site de référence, cas de recette |
| `TASK.md` | Suivi de cette fiche, décisions et changements de design |
| `assets/README.md` | Inventaire des médias locaux, droits et alternatives ; pas de dépendance obligatoire à une page externe |

## Contrats à respecter

### Entrées

| Port | Type | Origine pendant le développement |
|---|---|---|
| `origin` | `OrigineHistorique` | fixture locale ; binding de campagne |
| `transition` | `TransitionInstitutionnelle` | fixture locale ; binding de campagne |
| `lexicon` | `LexiqueTechnique` | fixture locale ; binding de campagne |
| `projects` | `SelectionProjets` | fixture locale ; binding de campagne |
| `program` | `ProgrammeTransmission` | fixture locale ; binding de campagne |

### Sorties

| Port | Type | Preuve conservée |
|---|---|---|
| `memory` | `MemoireRestauree` | Centenaire : origine 1968 → projection fictive 2068. |

Le moteur attribue les sorties après la réussite de **toutes** les étapes. Le widget ne donne jamais de points. Le schéma 1 sait produire des sorties statiques ; les sorties calculées depuis le site nécessitent le chantier commun 03/05 avant activation du niveau concerné.

## Travail restant dans l’ordre

1. Créer une étape pour les cinq affirmations exactes et les preuves liées aux ports injectés.
2. Valider les décisions faux/vrai/faux/faux/vrai ET leurs preuves.
3. Ouvrir le cadran 2068 seulement après cette première validation ; connaître le code ne suffit pas.
4. Émettre MemoireRestauree et les dix derniers points, puis déclencher l’écran END via la campagne, pas via une URL de niveau.

## Recette à cocher

- [ ] Chaque consigne et chaque document nécessaire est lisible dans le niveau.
- [ ] Les dialogues d’entrée, de question, d’erreur, d’indice, de réussite et de retour ci-dessous sont intégrés, ou une simplification est explicitement acceptée dans cette fiche.
- [ ] La solution nominale passe ; une réponse fausse et une réponse proche ne terminent pas le niveau.
- [ ] Les preuves et sous-objectifs sont exigés, pas seulement le mot de sortie.
- [ ] Une interruption après saisie conserve le brouillon et les étapes validées en campagne.
- [ ] Les indices et l’aide complète permettent de reprendre sans retirer de points (sauf Conseil narratif : aucune bonne/mauvaise réponse).
- [ ] Les références documentaires sont enregistrées dans le registre partagé et leur identifiant existe.
- [ ] Le niveau fonctionne au clavier et sans glisser-déposer ; aucun sens transmis seulement par la couleur.
- [ ] Les variantes de site utiles sont testées, sans déclarer les repères fictifs réels.
- [ ] Une seconde validation ne duplique ni récompense ni points.
- [ ] `npm run check:content -- syn-03` puis `npm run check` passent.
- [ ] Une autre personne joue la prévisualisation sans explication orale du concepteur.
- [ ] Le statut passe de `draft` à `prototype`, puis à `ready` après recette et dialogues complets. Augmenter `revision` si le contenu joué change.

## Conception, supports, dialogues et solutions

### SYN-03 — Le contrôle du centenaire

**Prérequis :** FUT-01 et FUT-02 terminés, donc les actes précédents également. Le Conseil est facultatif. **Lieu suggéré :** retour au départ réel P0 si le parcours le permet ; ce retour ne dépend pas d’une localisation numérique.

Le final vérifie que les faits restaurés n’ont pas été confondus avec la fiction. Le carnet reste ouvert : ce n’est pas une interrogation de mémoire. Pour chaque affirmation, le joueur choisit **Confirmer** ou **Corriger**, puis la ou les preuves requises. Une correction affiche la formulation juste ; elle n’est pas validée par une saisie libre imprécise.

**S3.ENTER — ARIIE :** « Le dispositif peut transmettre. Avant d’ouvrir la capsule, vérifions ce qu’il raconte. Je vais proposer cinq affirmations. Confirmez ou corrigez chacune avec notre carnet. Vous pouvez relire toutes les preuves. »

| Étape | Affirmation exacte d’ARIIE | Décision et preuve attendues | Réponse correcte d’ARIIE |
|---|---|---|---|
| S3.Q1 | « Le nom ENSIIE était déjà celui de l’école à son origine en 1968. » | **Corriger** ; frise de PAS-01 + preuve de transition de PAS-03 | « Correction enregistrée. L’origine remonte à l’IIE ; le passage au nom ENSIIE intervient en 2006. » |
| S3.Q2 | « L’installation de l’école à Évry date de 1984. » | **Confirmer** ; frise de PAS-01 | « Confirmé. Cette étape appartient à l’histoire des lieux de l’école. » |
| S3.Q3 | « La publication du décret le 7 juillet 2006 est aussi sa date d’entrée en vigueur. » | **Corriger** ; pièces Publication et Règle de PAS-03 | « Correction enregistrée : publication le 7 juillet, entrée en vigueur le 1er août 2006. » |
| S3.Q4 | « Les domaines découverts dans l’atelier se résument tous à écrire du code. » | **Corriger** ; capsule et fiches de PRE-01 | « Correction enregistrée. Vous avez aussi rencontré la modélisation, l’optimisation, l’interaction et le calcul intensif. » |
| S3.Q5 | « Dans notre simulation, BCF respecte le budget maximal de 8, la pression maximale de 6 et le service minimal de 9. » | **Confirmer** ; calcul de FUT-01 | « Confirmé : 8, 4 et 9. Ces valeurs décrivent notre simulation, pas les moyens réels de l’école. » |

#### Répliques d’erreur par affirmation

| ID | Texte |
|---|---|
| S3.E1 | « Reprenez la frise et le dossier du changement de nom. Une origine et une nouvelle identité peuvent avoir des dates différentes. » |
| S3.E2 | « La notice Lieux permet de trancher. Il n’est pas nécessaire de deviner. » |
| S3.E3 | « Les deux dates remplissent des rôles différents. Retrouvez la règle du mois suivant. » |
| S3.E4 | « Relisez les quatre fiches de domaines. Quelles activités ne se réduisent pas à la saisie d’un programme ? » |
| S3.E5 | « Ouvrez le calcul BCF et comparez chacun des trois totaux à son seuil. » |
| S3.PROOF | « Votre décision ne suffit pas encore : sélectionnez la preuve qui permet de la justifier. » |

Une affirmation déjà justifiée reste acquise. Une erreur ne remet pas la série à zéro. Les cinq affirmations sont fixes pour cette version, afin que les textes, les preuves et les tests restent alignés.

#### Indices du final

1. **S3.H1 :** « Le carnet contient toutes les preuves. Le final distingue origine, changement de nom, publication et simulation. »
2. **S3.H2 :** « Pour les trois premières affirmations, ouvrez la frise et le décret. Pour les deux dernières, ouvrez l’atelier et le calcul BCF. »
3. **S3.H3 :** « Les décisions sont : Corriger, Confirmer, Corriger, Corriger, Confirmer. Sélectionnez les preuves correspondantes. »

#### Dernier cadran

**S3.DATE — ARIIE :** « Les cinq affirmations sont vérifiées. Réglez maintenant le cadran du centenaire de l’origine de l’école : année d’origine plus cent ans. »

Réponse : **1968 + 100 = 2068**. L’année était annoncée dès le début : c’est une confirmation rituelle de clôture, pas un secret censé constituer toute l’énigme.

Erreur : « Reprenez l’année d’origine, pas celle du changement de nom. » Si 2106 : « Vous avez ajouté cent ans à 2006. La capsule célèbre ici l’origine de 1968. » Aide finale : « Ajoutez 100 à 1968 : 2068. »

La réussite attribue les dix derniers points d’intégrité, fige les choix narratifs dans le résultat et ouvre la capsule. **Une saisie anticipée de 2068 n’accorde pas cette réussite.**

## Journal de décision

| Date | Décision | Auteur / relecture |
|---|---|---|
| 2026-10-15 | Contrats et dossier isolé créés ; statut ci-dessus | Socle initial |
