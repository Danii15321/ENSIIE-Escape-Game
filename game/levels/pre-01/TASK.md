# PRE-01 — L’atelier des compétences : fiche de réalisation

**Statut :** contenu à implémenter ; maquette exclue du jeu. **Responsable :** à attribuer. **Relecteur :** autre membre du binôme.

Cette fiche reprend la conception du README au 15 octobre 2026. Les textes et solutions ci-dessous sont la référence éditoriale du niveau ; `level.json` est sa version exécutée. Lors d’un changement de design, mettre à jour ces deux fichiers et signaler toute divergence avec le [README principal](../../../README.md). La fiche n’est pas chargée par le jeu.

## Périmètre et autonomie

- Modifier `game/levels/pre-01/` : contenu, dialogues, règles déclaratives, fixtures, critères et ressources.
- Prévisualiser avec `npm run dev`, puis `http://localhost:5173/?level=pre-01`.
- L’atelier injecte les entrées simulées de `fixtures.json`. Il ne modifie jamais la sauvegarde de campagne.
- Prérequis dans la vraie campagne : **SYN-01**. Points attribués : **10**.
- Ne pas importer un niveau voisin. Ne pas modifier les contrats, les widgets communs ou les bindings de campagne en parallèle sans convenir d’un propriétaire temporaire.
- Briques : MatchBoard disponible. ConnectionBoard typé à construire dans le chantier 03-briques.

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
| `lexicon` | `LexiqueTechnique` | Quatre mots pour explorer les compétences. |

Le moteur attribue les sorties après la réussite de **toutes** les étapes. Le widget ne donne jamais de points. Le schéma 1 sait produire des sorties statiques ; les sorties calculées depuis le site nécessitent le chantier commun 03/05 avant activation du niveau concerné.

## Travail restant dans l’ordre

1. Construire une première étape d’appariement des quatre domaines avec les fiches exactes ci-dessous.
2. Créer une seconde étape de circuit : BESOIN → MODELE → MODELE VALIDE → SCENE → DEMO FLUIDE.
3. Faire valider les compatibilités de ports par une mécanique commune ; ne pas accepter seulement les quatre mots finaux.
4. Émettre le fragment LexiqueTechnique une seule fois après les deux sous-objectifs.

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
- [ ] `npm run check:content -- pre-01` puis `npm run check` passent.
- [ ] Une autre personne joue la prévisualisation sans explication orale du concepteur.
- [ ] Le statut passe de `draft` à `prototype`, puis à `ready` après recette et dialogues complets. Augmenter `revision` si le contenu joué change.

## Conception, supports, dialogues et solutions

### PRE-01 — L’atelier des compétences

**Type :** association de domaines et circuit de données. **Source :** S09. **But :** manipuler les liens entre compétences au lieu de seulement réciter des intitulés.

#### Situation et supports

Un simulateur pédagogique fictif doit transformer un besoin en démonstration fluide. Quatre modules sont mélangés. Chaque module a une mission, un type de donnée d’entrée et un type de sortie. Les types sont visibles, ils ne nécessitent pas de connaître la programmation.

| Module | Mission | Entrée | Sortie |
|---|---|---|---|
| Modéliser | Répartir des ressources sous contraintes | BESOIN | MODELE |
| Vérifier | Contrôler les propriétés du modèle programmé | MODELE | MODELE VALIDE |
| Faire interagir | Concevoir les commandes et les retours du simulateur | MODELE VALIDE | SCENE |
| Accélérer | Répartir les traitements pour fluidifier la simulation | SCENE | DEMO FLUIDE |

Les quatre fiches de domaines sont fournies avec leur définition : **mathématiques appliquées** pour modélisation et optimisation ; **ingénierie logicielle** pour conception et vérification de programmes ; **interactions numériques** pour interfaces et expériences interactives ; **calcul intensif et données massives** pour calcul parallèle et grands ensembles de données.

L’ordre de ce circuit est une règle de cette simulation, **pas une description imposée des cursus ou de tous les projets réels**.

#### Consigne

« Attribuez un domaine principal à chaque module. Branchez ensuite les modules pour transformer BESOIN en DEMO FLUIDE. Une sortie peut être raccordée uniquement à une entrée portant exactement le même nom. Utilisez chaque module une fois. »

#### Solution

Mathématiques → Modéliser ; Ingénierie logicielle → Vérifier ; Interactions numériques → Faire interagir ; Calcul intensif → Accélérer.

Chaîne unique : **BESOIN → Modéliser → Vérifier → Faire interagir → Accélérer → DEMO FLUIDE**. Le prototype montre une impulsion traversant les quatre connexions seulement lorsque le circuit est cohérent. Les domaines doivent également être correctement attribués.

La réussite donne quatre étiquettes de mémoire : **MODELE, LOGICIEL, INTERFACE, CALCUL**. Ce sont des mots de jeu associés aux quatre domaines, pas les sigles officiels de quatre parcours.

| ID | Déclencheur | Texte |
|---|---|---|
| R1.ENTER | Ouverture | « Mon simulateur possède tous ses modules. Il essaie simplement de faire interagir un besoin avant d’avoir construit son modèle. Cela explique plusieurs choses. » |
| R1.Q | Choix | « Faut-il connaître les cursus ? » → R1.A ; « Ouvrons l’atelier. » → puzzle |
| R1.A | Question | « Non. Les fiches expliquent les compétences. Vous cherchez une association principale ; dans un projet réel, les domaines se croisent. » Puis puzzle. |
| R1.DOMAIN | Mauvaise attribution | « Relisez l’action principale du module et la définition du domaine. Les connexions ne suffisent pas à elles seules. » |
| R1.LINK | Raccord incompatible | « Ces deux prises ne portent pas le même type de donnée. La sortie précédente doit correspondre à l’entrée suivante. » |
| R1.ERROR | Circuit incomplet | « Il manque un module ou une liaison pour atteindre DEMO FLUIDE. » |
| R1.H1 | Indice 1 | « Cherchez d’abord le seul module qui accepte BESOIN. » |
| R1.H2 | Indice 2 | « MODELE doit être validé avant de devenir une SCENE dans ce circuit. » |
| R1.H3 | Indice 3 | « L’ordre est Modéliser, Vérifier, Faire interagir, Accélérer. Associez mathématiques, logiciel, interactions et calcul à ces quatre actions. » |
| R1.OK | Réussite | « Le simulateur fonctionne. Vous avez relié des compétences et des informations, pas seulement quatre boîtes. » |
| R1.EXIT | Après capsule | « Je garde quatre mots : MODELE, LOGICIEL, INTERFACE, CALCUL. Ils seront utiles au mur de mémoire. » |

**K-R1 :** « L’école présente notamment des domaines de mathématiques appliquées, de logiciel, d’interactions numériques et de calcul intensif. Cette sélection illustre leur complémentarité sans résumer toute l’offre de formation. »

**Reprise :** associations et connexions conservées. **Alternative tactile :** choisir une sortie, puis une entrée ; aucune obligation de tracer une ligne au doigt.

## Journal de décision

| Date | Décision | Auteur / relecture |
|---|---|---|
| 2026-10-15 | Contrats et dossier isolé créés ; statut ci-dessus | Socle initial |
