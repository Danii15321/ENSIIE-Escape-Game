# Contrat d’auteur, version 1

## Un dossier autonome

Chaque dossier `game/levels/<id>/` contient `level.json`, `fixtures.json`, `acceptance.json`, `TASK.md` et `assets/README.md`. Le chargement Vite découvre les fichiers `level.json` sans liste manuelle. La campagne contient seulement l’assemblage et les dépendances. Un paquet non raccordé peut être joué dans l’atelier, mais pas dans la campagne.

La référence de structure est [le schéma exécutable](../core/contracts/index.ts). Le [tableau de travail](../../docs/implementation/README.md) décrit les fonctionnalités effectivement livrées.

## Champs du niveau

| Champ | Contrat |
|---|---|
| `contractVersion` | `1` ; version du format |
| `revision` | Entier positif, augmenté quand le contenu exécuté change |
| `id` | Identifiant stable, identique au nom du dossier, minuscules et tirets recommandés |
| `status` | `draft` : non jouable ; `prototype` : jouable mais recette incomplète ; `ready` : recette complète |
| `inputs` | Ports locaux avec type de fragment ; aucun nom de dossier producteur |
| `observations` | `O1` et/ou `O2` ; leur valeur vient du profil figé pour la partie |
| `documents` | Supports locaux, badge de nature du document et identifiants de sources |
| `dialogue` | Nœud d’entrée, nœuds, choix à destination explicite ou `null` pour revenir au puzzle, textes de réussite et de retour |
| `steps` | Liste ordonnée d’étapes ; titre, consigne, supports visibles et mécanique |
| `hints` | Exactement trois textes pour les puzzles de ce contrat initial |
| `solution` | Démarche complète révélée avant confirmation de l’assistance |
| `capsule` | Savoir retenu après réussite |
| `outputs` | Fragments typés attribués une seule fois après toutes les étapes |

## Niveau narratif (Conseil)

Un niveau qui déclare `narrative` n’a ni étape, ni indice, ni entrée, ni sortie (`steps`, `hints`, `inputs` et `outputs` vides ; `solution` peut être vide). Il ne donne aucun point, ne réussit jamais et ne doit être le prérequis d’aucun autre niveau.

```json
"narrative": {
  "speaker": "Nora",
  "done": "Texte affiché quand toutes les questions ont une réponse.",
  "questions": [
    {
      "id": "c1",
      "prompt": "Question affichée",
      "options": [
        { "id": "a", "label": "Choix", "theme": "lucidite", "reply": "Réponse immédiate", "commitment": "Engagement conservé pour la fin" }
      ]
    }
  ]
}
```

La commande `choose` (`questionId`, `optionId` ou `null` pour retirer) stocke une seule option par question dans `progress.choices` et remplace la précédente. Elle est refusée dès que `campaign.finalLevel` est réussi ou accompagné : les choix sont alors figés. « Décider plus tard » est un simple choix de dialogue vers `null`.

`ending(session, catalog)` renvoie `null` tant que le final n’est pas acquis, puis `{ theme, commitments }` : `theme` est le thème majoritaire parmi les réponses actuelles des niveaux narratifs non `draft`, ou `null` en cas d’égalité ou d’absence de réponse (fin Horizon commun) ; `commitments` suit l’ordre des questions et n’invente rien pour une question sans réponse. `outcome(levels, choices)` fait le même calcul sans session.

## Mécaniques livrées

| `kind` | Structure de réponse (`Answer`) | Exemple à lire |
|---|---|---|
| `form` | Objet `idDuChamp → chaîne`, ou tableau de chaînes pour `set` | `pas-03` |
| `order` | `order: [ids des cartes]` plus champs complémentaires | `pas-01` |
| `match` | `idDeGauche → idDeDroite` | Test de mécanique partagé ; prévu pour PRE |
| `constraints` | `projects: [ids des projets]` ; totaux recalculés par le moteur | `fut-01` |
| `program` | `command-<index à partir de 0>` pour chaque trou + `message` | `fut-02` |
| `circuit` | `link-<id de sortie>` → id de l’entrée raccordée (module ou cible) | `pre-01` |
| `wordgrid` | `segments: ["ligne,colonne-ligne,colonne", ...]` (base 1) + `message` | `syn-02` |

| `evidence` | `decision-<id d’affirmation>` → id de décision ; `proofs-<id d’affirmation>` → ids de preuves | `syn-03` |

`match` accepte un `error` facultatif, préfixé par l’élément à corriger.

Un champ de formulaire accepte des `traps` : `[{ "value": "2106", "error": "..." }]`. Une réponse fausse égale à `value` (après normalisation du texte) affiche ce retour au lieu de `error`. Un piège ne peut pas être égal à la réponse attendue.

`evidence` déclare des `decisions` (par exemple Confirmer et Corriger), des `proofs` et des `claims`. Chaque preuve pointe vers une entrée injectée : `{ input }` affiche son résumé, `{ input, path }` une valeur ou une liste, `{ input, path, item }` un élément qui doit être présent dans cette liste. Une affirmation attend une décision et l’ensemble exact de ses preuves : une preuve en trop ou manquante renvoie `proofError`, une mauvaise décision renvoie le `error` de l’affirmation. Les affirmations justifiées sont annoncées avec leur texte `accepted` à chaque vérification ; la vue ne révèle rien avant.

`circuit` déclare une `source`, une `target` et des `modules` avec `input`/`output` typés et une `mission` facultative. `expected` liste l’ordre des modules ; le contrôle de contenu vérifie que cette chaîne est correctement typée de la source à la cible. Le validateur signale les raccords incompatibles (`feedback.link`), les entrées doublées et les circuits incomplets ou en boucle (`feedback.incomplete`). La réussite renvoie la trace de l’impulsion.

`wordgrid` décrit la grille ligne par ligne (`A` à `Z`, `.` pour une case vide). `words` mélange des mots littéraux et des références `{ input, path }` vers une chaîne ou une liste de chaînes. `orientation` vaut `forward`, `reverse` ou une référence d’entrée. `message` doit être lu, en lecture normale, dans les cases qui restent après retrait des mots : chaque mot doit avoir un seul emplacement, sans chevauchement. En lecture inverse, le moteur replace les lettres du message à l’envers dans ces mêmes cases, sans modifier les mots. Les retours `select`, `missing`, `near.forward`, `near.reverse` et `error` viennent des données.

Les formes de champs sont `text`, `code`, `date`, `integer`, `choice`, `set`. `text` ignore casse, accents et espaces multiples. `code` conserve les zéros et demande la chaîne exacte après retrait des espaces externes. Les dates acceptent les quatre représentations du README mais rejettent un jour impossible. Un entier doit contenir uniquement des chiffres. Les choix utilisent leurs identifiants ; une sélection multiple compare les ensembles sans doublons.

Un `expected` peut être une chaîne, un tableau pour `set`, une référence `{ input, path }` vers un champ scalaire du fragment reçu, `{ observation: "O1" }` ou `{ parityOf: "O2", even: "<valeur si pair>", odd: "<valeur si impair>" }`. Pour un champ `choice`, `even` et `odd` doivent être des identifiants d’options.

Une sortie peut porter `derive: { rule: "orientation-parity", observation: "O2" }`. Ses `data` et `summary` servent alors de réservation DEMO : le moteur recalcule la valeur observée, le sens de lecture et le résumé depuis le profil figé de la partie, puis valide le fragment obtenu. La règle doit correspondre au type de la sortie (`OrientationLecture`). Les ports et observations doivent être déclarés. `SYN-01` montre une synthèse dont la réponse de calibration dépend des entrées injectées, pas d’une copie de ses voisins.

## Étapes et sauvegarde

Le moteur reçoit des commandes `open`, `draft`, `submit`, `hint`, `dialogue`, `assist` et, pour un niveau narratif, `choose`. La vue émet une intention ; elle ne change jamais un statut elle-même. `draft` remplace le brouillon complet de l’étape courante. `submit` valide cette étape puis avance. La réussite finale n’arrive qu’après la dernière étape. Les étapes précédentes et leurs réponses restent sauvegardées ; l’UI actuelle ne les réédite pas après validation.

La mécanique retourne `format`, `incorrect`, `partial` ou `correct`, avec des messages textuels et éventuellement une trace. Les erreurs sont aujourd’hui des textes directs ; le catalogue de codes éditoriaux spécifique au README est à compléter dans le chantier 04. Pas de HTML ni d’expression exécutable dans les données.

L’intégrité et le carnet sont dérivés des succès : aucune duplication de compteurs ou d’objets de récompense dans la sauvegarde. Un identifiant de récompense combine niveau et sortie. La provenance et la révision sont ajoutées lors de la lecture du carnet.

## Fixtures et critères

`fixtures.json` contient `inputs`, un dictionnaire port → fragment complet (`id`, `type`, `data`, `summary`). Le contenu des fixtures est indépendant des fichiers producteurs. Les types et les champs obligatoires sont contrôlés. Un dictionnaire facultatif `sites` remplace certains ports pour un profil donné, par exemple `sites["demo-odd"].orientation` ; l’atelier l’applique quand ce profil est choisi.

`acceptance.json` contient le `siteId` de référence, `answers` avec une réponse par étape, `status` (`todo`/`executable`) et une liste de cas manuels. Une liste de cas en prose n’est pas un test automatisé : seuls les objets `answers` sont exécutés par `check:content`. Ajouter les contre-exemples importants dans `checks/puzzles/`.

L’atelier réinitialise le niveau lorsque le profil change. Ses données ne peuvent pas se retrouver par accident dans la partie normale : il utilise `advance`, un état mémoire distinct et aucun adaptateur de sauvegarde. Les réponses de référence sont visibles uniquement dans cette vue d’auteur. Ce n’est pas une protection contre l’inspection du navigateur.

## Ajouter une primitive

1. Définir ses paramètres et sa réponse dans `core/contracts`.
2. Ajouter les contrôles de cohérence dans `core/content`.
3. Écrire un validateur pur dans `core/validation` et au moins un contre-exemple réel.
4. Ajouter sa présentation dans `presentation/widgets` avec le même contrat `mechanic`, `answer`, `onChange`.
5. Fournir un petit exemple de données et une fixture.
6. Faire passer `npm run check` et seulement ensuite l’utiliser dans un niveau.

Les sources techniques utilisées pour ce socle : [Vite](https://vite.dev/guide/), [React](https://react.dev/learn), [Zod](https://zod.dev/basics), [Vitest](https://vitest.dev/guide/). Les règles métier restent celles du README du jeu.
