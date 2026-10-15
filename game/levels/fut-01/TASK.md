# FUT-01 — Le campus sous contraintes : fiche de réalisation

**Statut :** prototype jouable à enrichir. **Responsable :** à attribuer. **Relecteur :** autre membre du binôme.

Cette fiche reprend la conception du README au 15 octobre 2026. Les textes et solutions ci-dessous sont la référence éditoriale du niveau ; `level.json` est sa version exécutée. Lors d’un changement de design, mettre à jour ces deux fichiers et signaler toute divergence avec le [README principal](../../../README.md). La fiche n’est pas chargée par le jeu.

## Périmètre et autonomie

- Modifier `game/levels/fut-01/` : contenu, dialogues, règles déclaratives, fixtures, critères et ressources.
- Prévisualiser avec `npm run dev`, puis `http://localhost:5173/?level=fut-01`.
- L’atelier injecte les entrées simulées de `fixtures.json`. Il ne modifie jamais la sauvegarde de campagne.
- Prérequis dans la vraie campagne : **SYN-02**. Points attribués : **10**.
- Ne pas importer un niveau voisin. Ne pas modifier les contrats, les widgets communs ou les bindings de campagne en parallèle sans convenir d’un propriétaire temporaire.
- Briques : ConstraintSelector disponible avec totaux en direct et liste ordonnée des contraintes.

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
| `projects` | `SelectionProjets` | Simulation BCF : budget 8, pression 4, service 9. |

Le moteur attribue les sorties après la réussite de **toutes** les étapes. Le widget ne donne jamais de points. Le schéma 1 sait produire des sorties statiques ; les sorties calculées depuis le site nécessitent le chantier commun 03/05 avant activation du niveau concerné.

## Travail restant dans l’ordre

1. Intégrer les questions sur les hypothèses fictives et l’accessibilité.
2. Remplacer les retours génériques par les messages F1, en conservant tous les échecs simultanés.
3. Peaufiner les cartes de projets ; conserver le texte points de simulation.
4. Ne pas coder BCF comme simple mot de passe : la validité dépend des cinq contraintes.

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
- [ ] `npm run check:content -- fut-01` puis `npm run check` passent.
- [ ] Une autre personne joue la prévisualisation sans explication orale du concepteur.
- [ ] Le statut passe de `draft` à `prototype`, puis à `ready` après recette et dialogues complets. Augmenter `revision` si le contenu joué change.

## Conception, supports, dialogues et solutions

### FUT-01 — Le campus sous contraintes

**Type :** sélection de projets sous contraintes. **Accès :** acte III ouvert. **Inspiration :** S09 et S11. **Tous les projets, nombres et seuils sont fictifs.**

#### Situation

Le dispositif imaginé transmettra des documents et des expériences aux futurs élèves. Six projets sont disponibles. Le budget est représenté par huit jetons, la pression sur les ressources par un compteur et le service rendu par un autre.

Les trois indicateurs portent la mention **points de simulation**. Ils ne sont ni des euros, ni des kilowattheures, ni un bilan carbone réel. Aucune conclusion générale sur la supériorité d’une technologie n’est déduite de ces valeurs.

| Projet | Description fictionnelle | Budget | Pression | Service |
|---|---|---:|---:|---:|
| A — Moteur immersif permanent | Une reconstitution virtuelle fonctionne en continu | 4 | 4 | 5 |
| B — Interface accessible | Lecture adaptée, commandes alternatives et accès aux contenus | 2 | 1 | 2 |
| C — Atelier de réemploi | Du matériel réutilisé sert à consulter et transmettre les archives | 3 | 1 | 4 |
| D — Mur vidéo continu | Une grande présentation audiovisuelle tourne en permanence | 4 | 3 | 4 |
| E — Tableau de bord connecté | Des indicateurs du dispositif sont regroupés sur un écran | 2 | 2 | 2 |
| F — Bibliothèque hors ligne | Une copie locale reste consultable sans connexion | 3 | 2 | 3 |

#### Consigne

« Choisissez exactement trois projets différents. Respectez un budget maximal de 8, une pression maximale de 6 et un service minimal de 9. Le projet B est obligatoire pour assurer l’accessibilité dans cette simulation. Validez votre sélection et ses totaux. »

L’interface calcule les totaux à chaque sélection. La difficulté concerne les arbitrages, pas l’addition mentale. Les cartes peuvent être retirées librement avant validation.

#### Solution et unicité

Choisir **B + C + F** : budget **8**, pression **4**, service **9**. Trois projets distincts et B présent. Une seule combinaison respecte les cinq conditions.

| Paire ajoutée à B | Budget | Pression | Service | Verdict |
|---|---:|---:|---:|---|
| A et C | 9 | 6 | 11 | Budget trop haut |
| A et D | 10 | 8 | 11 | Budget et pression trop hauts |
| A et E | 8 | 7 | 9 | Pression trop haute |
| A et F | 9 | 7 | 10 | Budget et pression trop hauts |
| C et D | 9 | 5 | 10 | Budget trop haut |
| C et E | 7 | 4 | 8 | Service insuffisant |
| C et F | 8 | 4 | 9 | Solution |
| D et E | 8 | 6 | 8 | Service insuffisant |
| D et F | 9 | 6 | 9 | Budget trop haut |
| E et F | 7 | 5 | 7 | Service insuffisant |

#### Dialogues

| ID | Voix et situation | Texte |
|---|---|---|
| F1.ENTER | Nora, ouverture | « Nous ne pouvons pas tout construire. Il faut choisir un ensemble cohérent, pas seulement trois projets séduisants. » |
| F1.Q | Choix | « Ces chiffres viennent de l’école ? » → F1.A ; « Pourquoi B est-il obligatoire ? » → F1.B ; « Comparons les projets. » → puzzle |
| F1.A | Nora | « Non. Ce sont des hypothèses de jeu. Dans un vrai projet, il faudrait mesurer, discuter et documenter les indicateurs avant de décider. » Puis puzzle. |
| F1.B | Nora | « Nous avons décidé que personne ne devait être exclu de la consultation. Dans cette simulation, le projet B représente ce socle commun. » Puis puzzle. |
| F1.COUNT | ARIIE, quantité incorrecte | « Le dispositif doit comprendre exactement trois projets différents. » |
| F1.ACCESS | ARIIE, absence de B | « Il manque le socle d’accessibilité : le projet B est obligatoire. » |
| F1.BUDGET | ARIIE, budget dépassé | « Budget : {budget} sur un maximum de 8. Réduisez le coût de l’ensemble. » |
| F1.PRESSURE | ARIIE, pression dépassée | « Pression : {pression} sur un maximum de 6. Le service rendu ne suffit pas à compenser cette contrainte. » |
| F1.SERVICE | ARIIE, service insuffisant | « Service : {service} pour un minimum de 9. Votre ensemble ne répond pas encore au besoin. » |
| F1.H1 | Nora, indice 1 | « Placez d’abord B, puis cherchez les deux projets qui le complètent. » |
| F1.H2 | Nora, indice 2 | « Après B, il reste six points de budget et au moins sept points de service à obtenir. » |
| F1.H3 | Nora, indice 3 | « Essayez l’atelier de réemploi. La bibliothèque hors ligne permet ensuite d’atteindre le service attendu. » |
| F1.OK | Nora, réussite | « B, C et F répondent aux contraintes. Vous avez construit une décision vérifiable. Ce qui compte aussi, c’est de savoir expliquer les hypothèses qui la rendent valable. » |
| F1.EXIT | ARIIE | « Je conserve votre sélection, ses totaux et la mention simulation. Je ne les classerai pas parmi les budgets réels de l’école. » |

Si plusieurs contraintes échouent, leurs retours sont affichés ensemble dans l’ordre quantité, accessibilité, budget, pression, service, sans multiplier les bulles animées.

**K-F1 :** « La simulation retient BCF : budget 8, pression 4, service 9. Ces valeurs sont fictives. Le défi illustre l’arbitrage sous contraintes et s’inspire des engagements environnementaux et sociaux affichés par l’école. » **Récompense :** sélection et preuve de calcul. **Reprise :** projets choisis conservés.

## Journal de décision

| Date | Décision | Auteur / relecture |
|---|---|---|
| 2026-10-15 | Contrats et dossier isolé créés ; statut ci-dessus | Socle initial |
