# PRE-02 — Les yeux d’ARIIE : fiche de réalisation

**Statut :** prototype jouable, recette à terminer. **Responsable :** gitvonBS. **Relecteur :** autre membre du binôme.

Cette fiche reprend la conception du README au 15 octobre 2026. Les textes et solutions ci-dessous sont la référence éditoriale du niveau ; `level.json` est sa version exécutée. Lors d’un changement de design, mettre à jour ces deux fichiers et signaler toute divergence avec le [README principal](../../../README.md). La fiche n’est pas chargée par le jeu.

## Périmètre et autonomie

- Modifier `game/levels/pre-02/` : contenu, dialogues, règles déclaratives, fixtures, critères et ressources.
- Prévisualiser avec `npm run dev`, puis `http://localhost:5173/?level=pre-02`.
- L’atelier injecte les entrées simulées de `fixtures.json`. Il ne modifie jamais la sauvegarde de campagne.
- Prérequis dans la vraie campagne : **SYN-01**. Points attribués : **10**.
- Ne pas importer un niveau voisin. Ne pas modifier les contrats, les widgets communs ou les bindings de campagne en parallèle sans convenir d’un propriétaire temporaire.
- Briques : MatchBoard et observation DEMO disponibles. Sorties dérivées du profil à ajouter avant publication.

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
| `student-life` | `VieEtudiante` | Des activités étudiantes pour apprendre ensemble. |
| `orientation` | `OrientationLecture` | DEMO pair : lecture de gauche à droite, du haut vers le bas. |

Le moteur attribue les sorties après la réussite de **toutes** les étapes. Le widget ne donne jamais de points. Le schéma 1 sait produire des sorties statiques ; les sorties calculées depuis le site nécessitent le chantier commun 03/05 avant activation du niveau concerné.

## Travail restant dans l’ordre

1. Construire les quatre associations Muzzik/LudIIE/ORiGiNe/RealitIIE avec leurs fiches.
2. Valider le relevé O2 et sa parité sans dépendre de panneaux associatifs installés.
3. Faire évoluer le contrat commun des sorties pour dériver OrientationLecture depuis le profil figé de la partie ; la valeur 4 actuelle est une fixture, pas une règle générale.
4. Fournir les fixtures pair et impair pour SYN-02 au point de synchronisation.

## Recette à cocher

- [x] Chaque consigne et chaque document nécessaire est lisible dans le niveau.
- [ ] Les dialogues d’entrée, de question, d’erreur, d’indice, de réussite et de retour ci-dessous sont intégrés, ou une simplification est explicitement acceptée dans cette fiche.
- [x] La solution nominale passe ; une réponse fausse et une réponse proche ne terminent pas le niveau.
- [x] Les preuves et sous-objectifs sont exigés, pas seulement le mot de sortie.
- [x] Une interruption après saisie conserve le brouillon et les étapes validées en campagne.
- [x] Les indices et l’aide complète permettent de reprendre sans retirer de points (sauf Conseil narratif : aucune bonne/mauvaise réponse).
- [x] Les références documentaires sont enregistrées dans le registre partagé et leur identifiant existe.
- [x] Le niveau fonctionne au clavier et sans glisser-déposer ; aucun sens transmis seulement par la couleur.
- [x] Les variantes de site utiles sont testées, sans déclarer les repères fictifs réels.
- [x] Une seconde validation ne duplique ni récompense ni points.
- [x] `npm run check:content -- pre-02` puis `npm run check` passent.
- [ ] Une autre personne joue la prévisualisation sans explication orale du concepteur.
- [ ] Le statut passe de `draft` à `prototype`, puis à `ready` après recette et dialogues complets. Augmenter `revision` si le contenu joué change.

## Conception, supports, dialogues et solutions

### PRE-02 — Les yeux d’ARIIE

**Type :** observation O2 et association d’activités. **Source :** S12. Deux sous-objectifs internes, réalisables dans n’importe quel ordre. Le niveau n’attend aucun résultat de PRE-01.

#### Sous-objectif terrain

Se rendre au repère O2 du profil réel. Lire l’inscription demandée. En DEMO, la carte fictive donne **4**. La mission valide la valeur, puis demande : **ce nombre est-il pair ou impair ?** Une note explique qu’un nombre pair est divisible par deux sans reste.

Une petite fiche de protocole annonce déjà l’usage : « Pair : lecture normale, du haut vers le bas et de gauche à droite. Impair : lecture inverse, du bas vers le haut et de droite à gauche. »

#### Sous-objectif vie étudiante

Quatre présentations reformulées d’après la liste institutionnelle sont accessibles dans l’application : Muzzik’ — musique ; LudIIE — jeux de société ; ORiGiNe — robotique ; RealitIIE — réalité virtuelle. Leur activité et leur présence dans les locaux en 2026 seront vérifiées avant toute visite spécifique de leurs espaces. Le niveau n’exige pas d’entrer chez une association.

Les joueurs reçoivent quatre invitations fictives :

| Invitation | Besoin |
|---|---|
| Une répétition | « Nous cherchons des personnes pour jouer d’un instrument ensemble. » |
| Une soirée autour d’un plateau | « Nous voulons découvrir des règles et jouer autour d’une table. » |
| Un atelier de machine mobile | « Nous voulons construire et faire agir un robot. » |
| Une exploration immersive | « Nous voulons créer ou explorer un environnement virtuel. » |

**Consigne :** « Retrouvez le repère indiqué et déterminez sa parité. Associez ensuite chaque invitation à l’activité et au collectif présentés dans les fiches. Les quatre bonnes associations restaureront quatre mots de mémoire. »

#### Solution

DEMO : **4, pair, lecture normale**. Invitations : **Muzzik’**, **LudIIE**, **ORiGiNe**, **RealitIIE** dans l’ordre du tableau. Mots obtenus : **MUSIQUE, JEUX, ROBOTIQUE, VIRTUEL**.

| ID | Déclencheur | Texte |
|---|---|---|
| R2.ENTER | Ouverture | « Mes capteurs ne voient plus les lieux. Soyez mes yeux au repère indiqué. Pendant ce temps, les autres peuvent rendre leurs destinataires à ces invitations. » |
| R2.GO | Terrain réel | « Destination : {O2.lieu}. {O2.direction} Relevez : {O2.question} » |
| R2.DEMO | Démonstration | « La carte de simulation remplace le repère. Son nombre est fictif. » |
| R2.Q | Choix | « Pourquoi ce nombre ? » → R2.A ; « Que sont ces collectifs ? » → R2.B ; « Commençons. » → puzzle |
| R2.A | Question | « Sa parité indique le sens de lecture de mon mur de mémoire. L’observation vous servira après cette mission. » Puis puzzle. |
| R2.B | Question | « Les fiches présentent quatre exemples de vie associative. Elles ne constituent pas la liste complète des activités de l’école. » Puis puzzle. |
| R2.OBSERROR | Relevé incorrect | « Vérifiez le repère exact, pas une inscription voisine. Le secours textuel est disponible si le lieu est fermé. » |
| R2.PARITY | Parité incorrecte | « Un nombre pair peut se partager en deux parts entières égales. Vérifiez votre choix. » |
| R2.ERROR | Association incorrecte | « Cherchez l’activité décrite dans chaque invitation. Le nom de l’association peut être moins explicite que sa fiche. » |
| R2.H1 | Indice 1 | « Traitez le relevé et les invitations comme deux petits dossiers séparés. » |
| R2.H2 | Indice 2 | « Muzzik’ correspond à la musique et LudIIE aux jeux de société. » |
| R2.H3 | Indice 3 | « Associez ORiGiNe au robot et RealitIIE au monde virtuel. Conservez ensuite le nombre observé et sa parité. » |
| R2.OK | Réussite | « Observation retrouvée, invitations distribuées. Une école se découvre aussi dans ce que ses élèves choisissent de faire ensemble. » |
| R2.EXIT | Après capsule | « J’ajoute les quatre mots et la règle de lecture à notre mémoire. » |

**K-R2 :** « Musique, jeux, robotique et réalité virtuelle illustrent la diversité des activités étudiantes présentées par l’école. » **Récompense :** quatre mots, valeur O2 et sens de lecture. Si l’un des deux sous-objectifs est réussi, il reste acquis pendant l’autre.

## Journal de décision

| Date | Décision | Auteur / relecture |
|---|---|---|
| 2026-10-15 | Contrats et dossier isolé créés ; statut ci-dessus | Socle initial |
| 2026-10-15 | Prototype jouable (révision 2). Les deux sous-objectifs sont réunis dans une seule étape de formulaire : ils se remplissent dans n’importe quel ordre et les réponses justes restent dans le brouillon pendant la correction des autres. Champs : relevé O2, parité, sens de lecture, quatre invitations (R2.OBSERROR, R2.PARITY, R2.ERROR). La sortie `orientation` est dérivée du profil par la règle `orientation-parity` ; les profils DEMO pair et impair sont testés. Simplifications à valider : R2.GO attend la description réelle du repère dans le profil de site (chantier 05) ; le secours textuel citée par R2.OBSERROR n’existe pas encore. | gitvonBS, relecture à faire |

## Intégration terrain Évry 2026

Révision 3 : profil réel activé avec trajets et secours textuel persisté. O1 = 2 (baby-foot du foyer), O2 = 3 (salles de TP du premier étage). La réplique `realText` remplace celle de simulation uniquement sur un site réel. Les photos restent à ajouter. Prévisualiser avec `?level=pre-02&site=evry-2026` ; les variantes de recette utilisent les valeurs du profil réel.
