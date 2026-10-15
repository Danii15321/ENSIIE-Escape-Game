# FUT-C — Le Conseil du futur : fiche de réalisation

**Statut :** prototype narratif jouable, révision 2 ; recette humaine à faire. **Responsable :** à attribuer. **Relecteur :** autre membre du binôme.

Cette fiche reprend la conception du README au 15 octobre 2026. Les textes et solutions ci-dessous sont la référence éditoriale du niveau ; `level.json` est sa version exécutée. Lors d’un changement de design, mettre à jour ces deux fichiers et signaler toute divergence avec le [README principal](../../../README.md). La fiche n’est pas chargée par le jeu.

## Périmètre et autonomie

- Modifier `game/levels/fut-c/` : contenu, dialogues, règles déclaratives, fixtures, critères et ressources.
- Prévisualiser avec `npm run dev`, puis `http://localhost:5173/?level=fut-c`.
- L’atelier injecte les entrées simulées de `fixtures.json`. Il ne modifie jamais la sauvegarde de campagne.
- Prérequis dans la vraie campagne : **SYN-02**. Points attribués : **0**.
- Ne pas importer un niveau voisin. Ne pas modifier les contrats, les widgets communs ou les bindings de campagne en parallèle sans convenir d’un propriétaire temporaire.
- Briques : NarrativeChoice, remplacement des réponses et calcul de fin disponibles et utilisés.

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
| Aucun | — | Aucune récompense de fragment |

Le moteur attribue les sorties après la réussite de **toutes** les étapes. Le widget ne donne jamais de points. Le schéma 1 sait produire des sorties statiques ; les sorties calculées depuis le site nécessitent le chantier commun 03/05 avant activation du niveau concerné.

## Livraison phase 2

Les trois questions et leurs neuf options sont intégrées exactement dans `level.json` : thèmes, réponses immédiates de Nora et engagements. Le niveau déclare `narrative`, sans étape, solution, indice ni sortie de fragment. Aucun point et aucun prérequis ajouté pour SYN-03.

« Décider plus tard » affiche C.SKIP et le bouton « Retour aux dossiers » permet de quitter. Les réponses déjà choisies sont conservées ; leur remplacement ou retrait reste possible jusqu’à l’ouverture de la capsule. Une fois le final réussi ou accompagné, la vue désactive les choix et le moteur refuse les changements.

Les engagements sont également rangés dans `game/endings/content.json`. Leur égalité avec les neuf options du Conseil est contrôlée par `check:content` ; éditer les deux fichiers ensemble lors d’un changement de rédaction. La fin utilise `ending(session, catalog)` existant, sans modifier le calcul de majorité.

## Recette

- [x] Trois questions, trois options chacune, répliques exactes des tableaux ci-dessous.
- [x] Aucun indice, aucune bonne/mauvaise réponse, aucun point ni fragment.
- [x] Choix remplaçables et retirables ; dix clics ne deviennent pas dix votes.
- [x] Absence, choix partiels et égalités aboutissent à une fin définie.
- [x] Report et reprise conservent les réponses sans bloquer le final.
- [x] Choix figés lorsque SYN-03 est réussi ou accompagné.
- [x] Toutes les combinaisons de trois choix ou abstentions sont testées (64 cas).
- [x] Lecture clavier et noms accessibles ; atelier isolé de la campagne.
- [ ] Recette indépendante par l’autre membre du binôme.

## Conception, supports, dialogues et solutions

### FUT-C — Le Conseil du futur

**Type :** trois choix narratifs facultatifs. **Aucune réponse fausse, aucun indice, aucun fragment requis.** Le Conseil est accessible dès l’ouverture de l’acte III et reste modifiable jusqu’à l’ouverture de la capsule.

**C.ENTER — Nora :** « Le dispositif fonctionne. Mais ce qu’il transmettra dépend aussi de vos priorités. Je vous propose trois décisions. Aucune ne vous fera perdre la partie. »

**C.SKIP — bouton :** « Décider plus tard ». Réponse : « Bien sûr. La capsule s’ouvrira aussi sans ce choix. Nous laisserons alors l’avenir ouvert. »

#### Question C1 — Que doit comprendre une personne qui utilise votre dispositif ?

| Choix affiché | Thème | Réponse immédiate de Nora | Engagement conservé pour la fin |
|---|---|---|---|
| « D’où viennent les informations et comment les vérifier. » | Lucidité | « Vous rendez visibles les sources et les limites. Une mémoire doit pouvoir être discutée. » | « Nous rendrons les sources et les limites des informations compréhensibles. » |
| « Quelles ressources il consomme et comment les réduire. » | Sobriété | « Vous voulez que le fonctionnement matériel reste visible, même derrière une interface simple. » | « Nous expliquerons les ressources nécessaires et les moyens de les économiser. » |
| « Comment y accéder et contribuer, quel que soit son profil. » | Partage | « Vous placez la participation au centre, avec plusieurs manières d’apprendre et de contribuer. » | « Nous proposerons plusieurs façons d’accéder aux contenus et de contribuer. » |

#### Question C2 — Quelle première action lanceriez-vous ?

| Choix affiché | Thème | Réponse immédiate | Engagement final |
|---|---|---|---|
| « Un atelier pour vérifier les résultats des systèmes numériques. » | Lucidité | « Vous choisissez d’apprendre à demander des preuves avant de faire confiance. » | « Nous apprendrons à vérifier les résultats plutôt qu’à seulement les accepter. » |
| « Un atelier pour prolonger la vie des équipements. » | Sobriété | « Vous choisissez de comprendre, entretenir et réparer avant de remplacer. » | « Nous prolongerons la vie des équipements quand cela répond aux besoins. » |
| « Un atelier associant élèves, personnels et anciens. » | Partage | « Vous faites circuler les expériences entre les générations et les rôles. » | « Nous organiserons la transmission entre élèves, personnels et anciens. » |

#### Question C3 — Quel engagement laisser dans la capsule ?

| Choix affiché | Thème | Réponse immédiate | Engagement final |
|---|---|---|---|
| « Expliquer nos décisions, même quand elles sont difficiles. » | Lucidité | « Une décision expliquée peut être réexaminée quand le contexte change. » | « Nous documenterons les raisons de nos décisions. » |
| « Réévaluer nos usages avant d’ajouter de nouveaux moyens. » | Sobriété | « Vous donnez une place à la mesure et à la remise en question des besoins. » | « Nous réévaluerons nos usages avant de multiplier les dispositifs. » |
| « Laisser aux suivants les moyens de transformer notre travail. » | Partage | « Vous transmettez une capacité d’agir, pas seulement un résultat figé. » | « Nous laisserons une documentation que les suivants pourront reprendre. » |

**C.DONE — Nora :** « Vos engagements sont enregistrés. Vous pourrez les relire avant l’ouverture. Ils décrivent votre projection, pas une politique officielle de l’école. »

Chaque question stocke une option, remplaçable. Le thème final est celui qui apparaît le plus souvent parmi les réponses ; en cas d’égalité ou d’absence de réponse, choisir **Horizon commun**. Le résultat est recalculé, jamais accumulé au fil des clics. Les phrases d’engagement sont conservées dans l’ordre C1, C2, C3 ; une question non répondue n’ajoute pas de phrase inventée.

## Journal de décision

| Date | Décision | Auteur / relecture |
|---|---|---|
| 2026-10-15 | Contrats et dossier isolé créés ; statut ci-dessus | Socle initial |
| 2026-10-15 | Contrat narratif disponible : champ `narrative` (speaker, questions, options avec theme, reply, commitment, texte done), commande `choose` remplaçable, gel au final, calcul `ending`/`outcome` (majorité, sinon `null` pour Horizon commun). Voir `src/authoring/README.md`, section Niveau narratif. Le contenu de ce niveau reste à saisir. | gitvonBS |

| 2026-10-15 | Phase 2 : trois questions et neuf options intégrées, révision 2 ; fin et engagements contrôlés comme données, sans modification du moteur | Lot Teammate |
