# FUT-02 — Le protocole incomplet : fiche de réalisation

**Statut :** prototype jouable à enrichir. **Responsable :** à attribuer. **Relecteur :** autre membre du binôme.

Cette fiche reprend la conception du README au 15 octobre 2026. Les textes et solutions ci-dessous sont la référence éditoriale du niveau ; `level.json` est sa version exécutée. Lors d’un changement de design, mettre à jour ces deux fichiers et signaler toute divergence avec le [README principal](../../../README.md). La fiche n’est pas chargée par le jeu.

## Périmètre et autonomie

- Modifier `game/levels/fut-02/` : contenu, dialogues, règles déclaratives, fixtures, critères et ressources.
- Prévisualiser avec `npm run dev`, puis `http://localhost:5173/?level=fut-02`.
- L’atelier injecte les entrées simulées de `fixtures.json`. Il ne modifie jamais la sauvegarde de campagne.
- Prérequis dans la vraie campagne : **SYN-02**. Points attribués : **10**.
- Ne pas importer un niveau voisin. Ne pas modifier les contrats, les widgets communs ou les bindings de campagne en parallèle sans convenir d’un propriétaire temporaire.
- Briques : GridProgram disponible, trace et première erreur calculées par le moteur.

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
| Aucun | — | Niveau indépendant des fragments précédents |

### Sorties

| Port | Type | Preuve conservée |
|---|---|---|
| `program` | `ProgrammeTransmission` | Trajet vérifié, sans répétition : D → O → U → V → R → E. |

Le moteur attribue les sorties après la réussite de **toutes** les étapes. Le widget ne donne jamais de points. Le schéma 1 sait produire des sorties statiques ; les sorties calculées depuis le site nécessitent le chantier commun 03/05 avant activation du niveau concerné.

## Travail restant dans l’ordre

1. Séparer visuellement les fiches archiviste et opérateur, tout en permettant de les consulter ensemble.
2. Ajouter une simulation exploratoire distincte de la soumission pour aider à examiner les erreurs.
3. Intégrer les répliques F2 et les erreurs spécifiques, y compris DOUVRE.
4. Conserver les commandes fixes non éditables et vérifier les seize couples possibles.

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
- [ ] `npm run check:content -- fut-02` puis `npm run check` passent.
- [ ] Une autre personne joue la prévisualisation sans explication orale du concepteur.
- [ ] Le statut passe de `draft` à `prototype`, puis à `ready` après recette et dialogues complets. Augmenter `revision` si le contenu joué change.

## Conception, supports, dialogues et solutions

### FUT-02 — Le protocole incomplet

**Type :** réparation de programme coopérative. **Accès :** acte III ouvert ; aucun besoin de terminer FUT-01. **Ancrage :** programmation et vérification, S09 et S14.

#### Distribution des informations

L’archiviste voit une grille et les cases verrouillées. L’opérateur voit un programme à deux trous, la consigne d’arrivée et la règle interdisant de repasser sur une case. Ils échangent les informations oralement ou par écrit. Les autres joueurs peuvent noter la trace ou tester une hypothèse.

Les cartes de rôle sont séparables, mais aucun mécanisme ne punit une équipe qui les consulte ensemble pour une adaptation accessible.

#### Grille de l’archiviste

|  | Colonne 1 | Colonne 2 | Colonne 3 |
|---|---|---|---|
| Ligne 1 | U | V | X — verrouillée |
| Ligne 2 | O | R | E — arrivée |
| Ligne 3 | D — départ | N — verrouillée | T — verrouillée |

Le haut est toujours la ligne 1. Les trois cases verrouillées sont indiquées par texte et pictogramme, pas uniquement par une couleur.

#### Fiche de l’opérateur

« Départ : D. Arrivée obligatoire : E. Cinq déplacements exactement. Ne sortez pas de la grille, n’entrez pas dans une case verrouillée et ne repassez jamais sur une case déjà visitée, y compris le départ. Notez une lettre après chaque déplacement ; le départ ne fait pas partie du message. »

| Instruction | Commande |
|---|---|
| 1 | Monter |
| 2 | **À retrouver** |
| 3 | Aller à droite |
| 4 | **À retrouver** |
| 5 | Aller à droite |

Chaque trou reçoit une commande parmi **monter, descendre, gauche, droite**. Les trois commandes connues ne peuvent pas être déplacées. On peut simuler, revenir au début et essayer sans limite.

#### Consigne commune

« Partagez les informations de vos fiches. Réparez les deux instructions, simulez le trajet, puis saisissez les cinq lettres d’arrivée. Le programme doit respecter toutes les règles. »

#### Solution

Instruction 2 : **monter**. Instruction 4 : **descendre**.

Trace : **D(3,1) → O(2,1) → U(1,1) → V(1,2) → R(2,2) → E(2,3)**. Message **OUVRE**.

Les seize couples de commandes ont été examinés : un seul respecte toutes les contraintes. Par exemple, choisir droite au deuxième déplacement mène sur R, puis E au troisième ; revenir ensuite à R violerait la règle de non-répétition. Descendre au deuxième déplacement retourne au départ, également interdit.

La validation exige les deux commandes, une simulation valide et le message. Un mot deviné ne remplace pas le trajet.

#### Dialogues

| ID | Voix et situation | Texte |
|---|---|---|
| F2.ENTER | ARIIE | « Le canal de transmission existe, mais deux instructions ont disparu. Une personne possède le plan, l’autre le programme. Il faudra mettre vos informations en commun. » |
| F2.Q | Choix | « Comment se répartir ? » → F2.A ; « Peut-on essayer plusieurs fois ? » → F2.B ; « Choisir les rôles. » → puzzle |
| F2.A | Nora | « L’archiviste décrit la grille et ses obstacles. L’opérateur propose les instructions. Une troisième personne peut vérifier le trajet et noter les lettres. » Puis puzzle. |
| F2.B | ARIIE | « Oui. Chaque essai repart de D. Une hypothèse incorrecte n’efface pas les informations que vous avez trouvées. » Puis puzzle. |
| F2.OUT | Sortie de grille | « Le programme quitte la grille à l’instruction {numero}. Reprenez cette étape avec votre coéquipier. » |
| F2.LOCK | Case verrouillée | « L’instruction {numero} entre dans une case verrouillée. Le signal ne peut pas passer ici. » |
| F2.REPEAT | Case revisitée | « Cette case a déjà été visitée. Le protocole exige un trajet sans retour sur ses pas. » |
| F2.END | Mauvaise arrivée | « Le programme reste valide jusqu’ici, mais ne termine pas sur E après les cinq déplacements. » |
| F2.NEAR | Message DOUVRE | « Le trajet commence bien sur D, mais le message ne contient que les cases d’arrivée. » |
| F2.ERROR | Message incorrect | « Rejouez le trajet et notez une lettre après chacun des cinq déplacements. » |
| F2.H1 | Indice 1 | « Après le premier déplacement, regardez quelles directions restent compatibles avec les obstacles et les cases déjà visitées. » |
| F2.H2 | Indice 2 | « Depuis O, descendre revient au départ. Partir à droite mène trop tôt vers l’arrivée et bloque la suite. » |
| F2.H3 | Indice 3 | « Complétez par MONTER, puis DESCENDRE. Les cinq arrivées forment un verbe qui autorise l’ouverture. » |
| F2.OK | ARIIE | « OUVRE. Vous n’avez pas seulement exécuté une instruction : vous avez réparé le programme et vérifié son comportement. » |
| F2.EXIT | Nora | « C’est une bonne transmission : une autre équipe pourrait comprendre votre procédure et la reproduire. » |

**K-F2 :** « Un programme doit être explicite et vérifiable. Ici, le partage d’informations et les contraintes permettent de retrouver une procédure unique. La grille est fictive ; ce n’est pas un plan de l’école. » **Récompense :** trace, commandes et message OUVRE.

## Journal de décision

| Date | Décision | Auteur / relecture |
|---|---|---|
| 2026-10-15 | Contrats et dossier isolé créés ; statut ci-dessus | Socle initial |
