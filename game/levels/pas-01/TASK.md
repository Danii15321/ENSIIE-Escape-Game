# PAS-01 — Les archives déclassées : fiche de réalisation

**Statut :** prototype jouable à enrichir. **Responsable :** à attribuer. **Relecteur :** autre membre du binôme.

Cette fiche reprend la conception du README au 15 octobre 2026. Les textes et solutions ci-dessous sont la référence éditoriale du niveau ; `level.json` est sa version exécutée. Lors d’un changement de design, mettre à jour ces deux fichiers et signaler toute divergence avec le [README principal](../../../README.md). La fiche n’est pas chargée par le jeu.

## Périmètre et autonomie

- Modifier `game/levels/pas-01/` : contenu, dialogues, règles déclaratives, fixtures, critères et ressources.
- Prévisualiser avec `npm run dev`, puis `http://localhost:5173/?level=pas-01`.
- L’atelier injecte les entrées simulées de `fixtures.json`. Il ne modifie jamais la sauvegarde de campagne.
- Prérequis dans la vraie campagne : **PRO-00**. Points attribués : **10**.
- Ne pas importer un niveau voisin. Ne pas modifier les contrats, les widgets communs ou les bindings de campagne en parallèle sans convenir d’un propriétaire temporaire.
- Briques : OrderBoard et AnswerForm disponibles.

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
| `origin` | `OrigineHistorique` | L’IIE est créé en 1968 au Cnam. |

Le moteur attribue les sorties après la réussite de **toutes** les étapes. Le widget ne donne jamais de points. Le schéma 1 sait produire des sorties statiques ; les sorties calculées depuis le site nécessitent le chantier commun 03/05 avant activation du niveau concerné.

## Travail restant dans l’ordre

1. Remplacer les retours génériques par P1.NEAR, P1.PROOF et les erreurs de dates.
2. Intégrer les branches P1.Q, P1.A et P1.M dans le graphe de dialogue.
3. Conserver les quatre notices accessibles pendant le classement ; améliorer les cartes sans imposer le glisser-déposer.

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
- [ ] `npm run check:content -- pas-01` puis `npm run check` passent.
- [ ] Une autre personne joue la prévisualisation sans explication orale du concepteur.
- [ ] Le statut passe de `draft` à `prototype`, puis à `ready` après recette et dialogues complets. Augmenter `revision` si le contenu joué change.

## Conception, supports, dialogues et solutions

### PAS-01 — Les archives déclassées

**Type :** classement documentaire. **Accès :** acte I ouvert. **Source :** S04, S05, S15. **Difficulté :** facile, montée en confiance.

#### Ce que voit le joueur

Un bureau d’archives avec quatre cartes sans date, dans cet ordre initial : **Évry**, **nouveau nom**, **anciens élèves**, **création**. Quatre notices s’ouvrent séparément ; elles peuvent être réparties entre les joueurs.

| Carte | Texte affiché |
|---|---|
| Création | « L’institut est créé au sein de sa maison mère. » |
| Anciens élèves | « Les ingénieurs issus de l’institut constituent leur association. » |
| Évry | « L’école quitte ses locaux parisiens pour s’installer à Évry. » |
| Nouveau nom | « L’IIE devient l’ENSIIE. » |

**Notice Origines :** « En 1968, l’Institut d’informatique d’entreprise est créé au Conservatoire national des arts et métiers, le Cnam. »

**Notice Communauté :** « Les ingénieurs IIE se regroupent dans leur association, l’A3IE, à partir de 1973. »

**Notice Lieux :** « Après ses locaux du Cnam à Paris, rue Saint-Martin, l’école s’installe à Évry en 1984. »

**Notice Identité :** « L’année 2006 marque le passage à l’ENSIIE. La date précise d’entrée en vigueur appartient à un autre dossier. »

Mention commune : **reformulations pédagogiques de sources institutionnelles**. Les notices restent disponibles pendant le classement.

#### Consigne

« Associez chaque événement à son année, rangez les quatre cartes du plus ancien au plus récent, puis identifiez la maison mère de l’institut. Justifiez l’origine en sélectionnant la notice qui la documente. »

Interactions : sélectionner une carte puis une position, ou la déplacer ; quatre champs d’année ; choix de maison mère parmi CNAM, une autre institution fictivement proposée comme leurre et « je ne sais pas encore » ; sélection d’une notice comme preuve. Le leurre affiché est **Université de Strasbourg**, qui intervient dans un autre épisode historique mais pas dans cette origine.

#### Solution et validation

Ordre : **création 1968 → anciens élèves 1973 → Évry 1984 → nouveau nom 2006**. Maison mère : **CNAM**. Preuve de l’origine : **Notice Origines**. Les trois éléments sont validés ensemble ; un message précise si c’est l’ordre, une date ou la preuve qui manque.

Le niveau ne dépend pas du déchiffrement de PAS-02. Les acronymes peuvent déjà être connus ; l’enjeu est de restaurer le document, pas de cacher chaque fait jusqu’à sa découverte.

#### Dialogues complets du niveau

| ID | Déclencheur | Texte |
|---|---|---|
| P1.ENTER | Ouverture | « Ma première date certaine est 1972. Donc l’école est née en 1972. Raisonnement impeccable… sauf si j’ai confondu deux événements. » |
| P1.Q | Choix | « Vérifions les notices. » → puzzle ; « Que représente 1972 ? » → P1.A ; « Comment classer ? » → P1.M |
| P1.A | Question | « Une trace parle de reconnaissance du diplôme. Cela ne prouve pas la date de naissance de l’institut. Cherchez la notice consacrée à l’origine. » Puis puzzle. |
| P1.M | Méthode | « Associez d’abord chaque carte à sa notice. Rangez ensuite les événements. Les dates sont des indices, pas des numéros de dossier. » Puis puzzle. |
| P1.ERROR | Erreur générale | « Au moins une association ne correspond pas à la notice. Vérifiez l’événement avant de modifier toute la frise. » |
| P1.NEAR | Origine 1972 | « 1972 correspond ici à la reconnaissance du diplôme. La création de l’institut est antérieure. » |
| P1.PROOF | Preuve incorrecte | « Cette notice parle d’un autre événement. Choisissez celle qui nomme la maison mère au moment de la création. » |
| P1.H1 | Indice 1 | « Chaque notice contient le sujet d’une des cartes. » |
| P1.H2 | Indice 2 | « La communauté des anciens précède l’arrivée à Évry ; le changement de nom arrive en dernier. » |
| P1.H3 | Indice 3 | « L’ordre des années est 1968, 1973, 1984, 2006. La première notice nomme le Cnam. » |
| P1.OK | Réussite | « Vous aviez raison de vérifier. J’avais pris une reconnaissance pour une naissance. Origine retrouvée : 1968, au Cnam. » |
| P1.EXIT | Après capsule | « Je garde cette frise dans notre mémoire commune. Vous pourrez la consulter à tout moment. » |

**K-P1 — capsule :** « L’école commence comme IIE au Cnam. Son implantation, son nom et sa communauté évoluent ensuite. La date d’un diplôme ne se confond pas avec celle de la création. »

**Récompense :** origine 1968, maison mère CNAM et frise comme preuve consultable. **Reprise :** toutes les positions et années sont conservées. **Assistance :** montrer l’ordre corrigé et les passages utiles des notices.

## Journal de décision

| Date | Décision | Auteur / relecture |
|---|---|---|
| 2026-10-15 | Contrats et dossier isolé créés ; statut ci-dessus | Socle initial |
