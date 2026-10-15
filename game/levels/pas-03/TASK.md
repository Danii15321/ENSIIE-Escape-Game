# PAS-03 — Le décret aux trois dates : fiche de réalisation

**Statut :** prototype jouable à enrichir. **Responsable :** à attribuer. **Relecteur :** autre membre du binôme.

Cette fiche reprend la conception du README au 15 octobre 2026. Les textes et solutions ci-dessous sont la référence éditoriale du niveau ; `level.json` est sa version exécutée. Lors d’un changement de design, mettre à jour ces deux fichiers et signaler toute divergence avec le [README principal](../../../README.md). La fiche n’est pas chargée par le jeu.

## Périmètre et autonomie

- Modifier `game/levels/pas-03/` : contenu, dialogues, règles déclaratives, fixtures, critères et ressources.
- Prévisualiser avec `npm run dev`, puis `http://localhost:5173/?level=pas-03`.
- L’atelier injecte les entrées simulées de `fixtures.json`. Il ne modifie jamais la sauvegarde de campagne.
- Prérequis dans la vraie campagne : **PRO-00**. Points attribués : **10**.
- Ne pas importer un niveau voisin. Ne pas modifier les contrats, les widgets communs ou les bindings de campagne en parallèle sans convenir d’un propriétaire temporaire.
- Briques : AnswerForm date et sélection de preuves disponibles.

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
| `transition` | `TransitionInstitutionnelle` | Décret du 5 juillet 2006, publié le 7 juillet, applicable le 1er août. |

Le moteur attribue les sorties après la réussite de **toutes** les étapes. Le widget ne donne jamais de points. Le schéma 1 sait produire des sorties statiques ; les sorties calculées depuis le site nécessitent le chantier commun 03/05 avant activation du niveau concerné.

## Travail restant dans l’ordre

1. Associer les réponses 05/07 et 07/07 aux retours P3.NEAR1 et P3.NEAR2 via un mécanisme commun de messages.
2. Ajouter le choix Pourquoi changer de nom et son retour au puzzle.
3. Vérifier les quatre formats de date et les deux pièces, sans convertir la date en nombre.

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
- [ ] `npm run check:content -- pas-03` puis `npm run check` passent.
- [ ] Une autre personne joue la prévisualisation sans explication orale du concepteur.
- [ ] Le statut passe de `draft` à `prototype`, puis à `ready` après recette et dialogues complets. Augmenter `revision` si le contenu joué change.

## Conception, supports, dialogues et solutions

### PAS-03 — Le décret aux trois dates

**Type :** enquête documentaire. **Accès :** acte I ouvert. **Sources :** S06, S07, S08.

#### Trois pièces affichées

1. **Texte :** « Décret n° 2006-805, daté du 5 juillet 2006, portant création de l’ENSIIE. »
2. **Publication :** « Ce décret figure dans le Journal officiel du 7 juillet 2006. »
3. **Règle :** « Son article 4 fait commencer l’application le premier jour du mois suivant la publication. »

Ce sont des reformulations pédagogiques avec liens vers les textes, pas des documents inventés présentés comme authentiques.

**Consigne :** « Retrouvez la date d’entrée en vigueur. Saisissez le jour, le mois et l’année. Expliquez votre choix en sélectionnant les deux pièces nécessaires au calcul. »

**Solution :** publication en juillet → premier jour d’août → **01/08/2006**. Pièces utiles : **Publication + Règle**. Accepter `01082006`, `01/08/2006`, `1/8/2006` et `2006-08-01` comme représentations d’une même date. La représentation interne reste une date, pas un entier.

| ID | Déclencheur | Texte |
|---|---|---|
| P3.ENTER | Ouverture | « J’ai trois dates possibles pour un changement. Avant de supprimer des doublons, je préfère vérifier si elles parlent vraiment de la même chose. » |
| P3.Q | Choix | « Pourquoi changer de nom ? » → P3.A ; « Examinons les pièces. » → puzzle |
| P3.A | Question | « La FAQ de l’époque relie le nouveau nom à un nouveau statut et à davantage d’autonomie. Ici, nous cherchons quand le texte commence à s’appliquer. » Puis puzzle. |
| P3.DATE | Mauvais format | « Il me faut une date complète. Vous pouvez écrire jour/mois/année. » |
| P3.NEAR1 | 05/07/2006 | « C’est la date du décret. Cherchez le début de son application. » |
| P3.NEAR2 | 07/07/2006 | « C’est la publication. Il reste à appliquer la règle de calendrier. » |
| P3.ERROR | Autre erreur | « Vérifiez le mois de publication et le premier jour du mois suivant. » |
| P3.PROOF | Date juste, mauvaise preuve | « La date convient. Montrez maintenant les pièces qui permettent de la déduire. » |
| P3.H1 | Indice 1 | « Une pièce fournit une date, une autre fournit une règle. » |
| P3.H2 | Indice 2 | « La règle part du Journal officiel, pas du titre du décret. » |
| P3.H3 | Indice 3 | « Le mois qui suit juillet est août. Prenez son premier jour en 2006. » |
| P3.OK | Réussite | « Trois dates, trois rôles. Transition restaurée : le 1er août 2006. » |
| P3.EXIT | Après capsule | « Cette preuve restera accessible au contrôle final. » |

**K-P3 :** « Le décret est daté du 5 juillet 2006, publié le 7 juillet et applicable le 1er août. Le passage à l’ENSIIE est une évolution institutionnelle, pas seulement une nouvelle enseigne. » **Récompense :** date de transition et référence du décret.

## Journal de décision

| Date | Décision | Auteur / relecture |
|---|---|---|
| 2026-10-15 | Contrats et dossier isolé créés ; statut ci-dessus | Socle initial |
