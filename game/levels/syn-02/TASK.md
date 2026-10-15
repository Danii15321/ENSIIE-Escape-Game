# SYN-02 — Le mur des mots : fiche de réalisation

**Statut :** contenu à implémenter ; maquette exclue du jeu. **Responsable :** à attribuer. **Relecteur :** autre membre du binôme.

Cette fiche reprend la conception du README au 15 octobre 2026. Les textes et solutions ci-dessous sont la référence éditoriale du niveau ; `level.json` est sa version exécutée. Lors d’un changement de design, mettre à jour ces deux fichiers et signaler toute divergence avec le [README principal](../../../README.md). La fiche n’est pas chargée par le jeu.

## Périmètre et autonomie

- Modifier `game/levels/syn-02/` : contenu, dialogues, règles déclaratives, fixtures, critères et ressources.
- Prévisualiser avec `npm run dev`, puis `http://localhost:5173/?level=syn-02`.
- L’atelier injecte les entrées simulées de `fixtures.json`. Il ne modifie jamais la sauvegarde de campagne.
- Prérequis dans la vraie campagne : **PRE-01, PRE-02**. Points attribués : **10**.
- Ne pas importer un niveau voisin. Ne pas modifier les contrats, les widgets communs ou les bindings de campagne en parallèle sans convenir d’un propriétaire temporaire.
- Briques : WordGrid et extraction orientée à construire dans le chantier 03-briques.

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
| `lexicon` | `LexiqueTechnique` | fixture locale ; binding de campagne |
| `student-life` | `VieEtudiante` | fixture locale ; binding de campagne |
| `orientation` | `OrientationLecture` | fixture locale ; binding de campagne |

### Sorties

| Port | Type | Preuve conservée |
|---|---|---|
| `key` | `CleTransmission` | Extraction du mur : CAPSULE. |

Le moteur attribue les sorties après la réussite de **toutes** les étapes. Le widget ne donne jamais de points. Le schéma 1 sait produire des sorties statiques ; les sorties calculées depuis le site nécessitent le chantier commun 03/05 avant activation du niveau concerné.

## Travail restant dans l’ordre

1. Transcrire exactement la grille ci-dessous en données, sans changer ses cases résiduelles.
2. Valider huit segments de mots sans chevauchement, avec coordonnées et sens.
3. Consommer les ports lexicon, student-life et orientation ; ne lire aucun fichier PRE.
4. Recalculer les sept lettres résiduelles de la variante impaire et prouver que les deux profils produisent CAPSULE.
5. N’attribuer la clé qu’après sélection des mots et extraction correcte.

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
- [ ] `npm run check:content -- syn-02` puis `npm run check` passent.
- [ ] Une autre personne joue la prévisualisation sans explication orale du concepteur.
- [ ] Le statut passe de `draft` à `prototype`, puis à `ready` après recette et dialogues complets. Augmenter `revision` si le contenu joué change.

## Conception, supports, dialogues et solutions

### SYN-02 — Le mur des mots

**Type :** mots cachés et extraction. **Prérequis :** PRE-01 et PRE-02. **Difficulté :** moyenne. Toute la grille est un accessoire original du jeu.

#### Consigne intégrale

« Retrouvez les huit mots de vos fragments. Ils sont écrits horizontalement ou verticalement, dans un sens ou dans l’autre. Sélectionnez leur première et leur dernière case. Les cases marquées d’un point ne contiennent rien et ne sont pas sélectionnables.

Une fois les huit mots retirés, il reste sept lettres. Si le repère O2 est pair, lisez du haut vers le bas et de gauche à droite. S’il est impair, lisez du bas vers le haut et de droite à gauche. Saisissez le message. »

Les huit mots sont affichés depuis le carnet : **MODELE, LOGICIEL, INTERFACE, CALCUL, MUSIQUE, ROBOTIQUE, JEUX, VIRTUEL**. Le jeu n’utilise pas les sigles de deux lettres ambigus de la proposition initiale.

#### Grille complète DEMO

Lignes 1 à 9 de haut en bas ; colonnes 1 à 10 de gauche à droite. Un point représente une case inactive.

| L / C | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | · | L | L | O | G | I | C | I | E | L |
| 2 | · | U | · | · | C | · | · | · | · | A |
| 3 | · | C | · | E | U | Q | I | S | U | M |
| 4 | · | L | P | · | · | J | E | U | X | S |
| 5 | · | A | · | E | L | E | D | O | M | · |
| 6 | · | C | · | U | · | · | · | · | · | · |
| 7 | R | O | B | O | T | I | Q | U | E | L |
| 8 | V | I | R | T | U | E | L | E | · | · |
| 9 | · | I | N | T | E | R | F | A | C | E |

#### Corrigé vérifiable

| Mot | Départ (ligne, colonne) | Fin | Sens |
|---|---|---|---|
| MODELE | (5, 9) | (5, 4) | Vers la gauche |
| LOGICIEL | (1, 3) | (1, 10) | Vers la droite |
| INTERFACE | (9, 2) | (9, 10) | Vers la droite |
| CALCUL | (6, 2) | (1, 2) | Vers le haut |
| MUSIQUE | (3, 10) | (3, 4) | Vers la gauche |
| ROBOTIQUE | (7, 1) | (7, 9) | Vers la droite |
| JEUX | (4, 6) | (4, 9) | Vers la droite |
| VIRTUEL | (8, 1) | (8, 7) | Vers la droite |

Les mots ne se chevauchent pas. Les lettres restantes, dans l’ordre normal, sont : **C(2,5), A(2,10), P(4,3), S(4,10), U(6,4), L(7,10), E(8,8)**. O2 = 4 étant pair, le résultat est **CAPSULE**.

Si un profil réel utilise un O2 impair, on conserve les mots et on place **E, L, U, S, P, A, C** dans ces sept positions normales. La lecture inverse produit encore CAPSULE. Cette variante doit être validée à la préparation du profil ; elle ne change pas aléatoirement pendant la partie.

L’interface accepte la sélection d’un mot dans les deux orientations, mais pas un segment partiel, un mot absent du carnet ou une diagonale. Il faut les huit sélections et l’extraction correcte pour réussir.

#### Dialogues

| ID | Déclencheur | Texte |
|---|---|---|
| S2.ENTER | Ouverture | « Vos mots sont revenus, mais ils recouvrent le message qui ouvre la capsule. Retirez seulement les huit mots du carnet, puis utilisez le repère de lecture. » |
| S2.SELECT | Sélection invalide | « Ce segment ne correspond pas à un mot complet du carnet. Les diagonales ne sont pas utilisées. » |
| S2.MISSING | Mot final tenté trop tôt | « Le message ne sera vérifiable qu’après les huit mots. Il en reste à retrouver dans la grille. » |
| S2.NEAR | ELUSPAC dans DEMO | « Les lettres sont les bonnes, mais leur ordre est inversé. Le repère pair impose la lecture normale. » |
| S2.ERROR | Mauvaise extraction | « Reprenez les lettres non barrées, en ignorant les cases vides. Vérifiez le sens indiqué par O2. » |
| S2.H1 | Indice 1 | « La liste de mots vient des deux missions, pas d’un dictionnaire à deviner. » |
| S2.H2 | Indice 2 | « CALCUL est vertical dans la deuxième colonne. MODELE et MUSIQUE se lisent vers la gauche. » |
| S2.H3 | Indice 3 | « Après les huit mots, utilisez seulement les sept cases restantes. Leur ordre de lecture doit former CAPSULE. » |
| S2.OK | Réussite | « CAPSULE. L’école n’est plus un nom isolé : ses compétences et ses activités ont retrouvé leurs liens. » |
| S2.EXIT | Fin d’acte | « Le futur reste à écrire. Nora a laissé un message pour les personnes qui parviendraient jusqu’ici. » |

**K-S2 :** « Les mots réunissent plusieurs dimensions de l’école : apprendre, créer et participer. Le message caché est une construction du jeu. » **Récompense :** clé CAPSULE et acte III. **Reprise :** mots retirés et sélection en cours conservés. **Accessibilité :** choix d’un mot puis de ses coordonnées ou navigation clavier, en complément du toucher.

## Journal de décision

| Date | Décision | Auteur / relecture |
|---|---|---|
| 2026-10-15 | Contrats et dossier isolé créés ; statut ci-dessus | Socle initial |
