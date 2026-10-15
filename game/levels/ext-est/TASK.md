# EXT-EST — L’antenne de l’Est : fiche de réalisation

**Statut :** contenu à implémenter ; maquette exclue du jeu. **Responsable :** à attribuer. **Relecteur :** autre membre du binôme.

Cette fiche reprend la conception du README au 15 octobre 2026. Les textes et solutions ci-dessous sont la référence éditoriale du niveau ; `level.json` est sa version exécutée. Lors d’un changement de design, mettre à jour ces deux fichiers et signaler toute divergence avec le [README principal](../../../README.md). La fiche n’est pas chargée par le jeu.

## Périmètre et autonomie

- Modifier `game/levels/ext-est/` : contenu, dialogues, règles déclaratives, fixtures, critères et ressources.
- Prévisualiser avec `npm run dev`, puis `http://localhost:5173/?level=ext-est`.
- L’atelier injecte les entrées simulées de `fixtures.json`. Il ne modifie jamais la sauvegarde de campagne.
- Prérequis dans la vraie campagne : **SYN-01**. Points attribués : **0**.
- Ne pas importer un niveau voisin. Ne pas modifier les contrats, les widgets communs ou les bindings de campagne en parallèle sans convenir d’un propriétaire temporaire.
- Briques : AnswerForm et DocumentReader disponibles. Extension indépendante de la victoire.

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
| `east` | `ArchiveEst` | Strasbourg / Illkirch : épisode historique, pas un campus actuel. |

Le moteur attribue les sorties après la réussite de **toutes** les étapes. Le widget ne donne jamais de points. Le schéma 1 sait produire des sorties statiques ; les sorties calculées depuis le site nécessitent le chantier commun 03/05 avant activation du niveau concerné.

## Travail restant dans l’ordre

1. Intégrer les supports datés de 2014 et le contexte historique 2009–2017.
2. Vérifier les informations qui conduisent au code postal 67400.
3. Afficher explicitement que Strasbourg n’est pas un campus actuel dans ce parcours.
4. Ne commencer l’AR qu’après une version 2D complète et la validation du parcours principal.

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
- [ ] `npm run check:content -- ext-est` puis `npm run check` passent.
- [ ] Une autre personne joue la prévisualisation sans explication orale du concepteur.
- [ ] Le statut passe de `draft` à `prototype`, puis à `ready` après recette et dialogues complets. Augmenter `revision` si le contenu joué change.

## Conception, supports, dialogues et solutions

### EXT-EST — L’antenne de l’Est

Cette extension reprend la piste Strasbourg du document fourni, **en la replaçant dans le passé**. Elle est disponible après SYN-01, jamais requise. Cible : 4 minutes, 2D d’abord. Sources S04 et S19.

#### Supports

Une carte schématique de France indique une mémoire située à l’est. Deux fiches sont fournies :

- **Fiche A — annonce institutionnelle :** « Journée portes ouvertes du 15 mars 2014. ENSIIE Strasbourg, bâtiment de l’ISU, 1 rue Jean-Dominique Cassini, 67400 Illkirch. » Reformulation, avec lien S19.
- **Fiche B — historique :** « L’historique de l’école situe son antenne de Strasbourg entre 2009 et 2017. » Source S04.

Trois étiquettes d’époque sont proposées : **implantation actuelle attestée en 2026**, **implantation historique**, **projet fictif de 2068**.

**Consigne :** « Retrouvez la commune ou le code postal de l’annonce, puis classez ce document dans la bonne époque. Attention : une ancienne page encore en ligne ne décrit pas nécessairement la situation actuelle. »

**Solution :** `ILLKIRCH`, `ILLKIRCH-GRAFFENSTADEN` ou `67400`, et **implantation historique**. La page de 2014 et l’intervalle 2009–2017 justifient le classement. L’adresse ne devient pas une destination physique du parcours à Évry.

#### Dialogues

| ID | Situation | Texte |
|---|---|---|
| EST.ENTER | Ouverture | « Une carte me signale un lieu à l’est. Mais mes archives ont tendance à confondre présent et passé. Pouvez-vous dater cette mémoire ? » |
| EST.ERROR | Adresse incorrecte | « L’annonce distingue le nom de l’antenne et la commune de l’adresse. Lisez les coordonnées. » |
| EST.EPOCH | Mauvaise époque | « La page est encore accessible, mais la date de l’annonce et l’historique indiquent son époque. » |
| EST.H1 | Indice 1 | « Comparez les deux fiches, pas seulement le titre Strasbourg. » |
| EST.H2 | Indice 2 | « L’adresse de 2014 donne un code postal commençant par 67. L’historique s’arrête en 2017 pour cette antenne. » |
| EST.H3 | Indice 3 | « Choisissez Illkirch ou 67400, puis implantation historique. » |
| EST.OK | Réussite | « Illkirch, mémoire historique. Une trace peut rester en ligne longtemps après la période qu’elle décrit. » |

**Capsule :** « L’antenne de Strasbourg appartient à l’histoire de l’école. La page de portes ouvertes consultée concerne 2014 ; elle ne prouve pas un campus actuel. » Récompense : fiche historique et badge Archives de l’Est, sans point d’intégrité ni indice supplémentaire.

## Journal de décision

| Date | Décision | Auteur / relecture |
|---|---|---|
| 2026-10-15 | Contrats et dossier isolé créés ; statut ci-dessus | Socle initial |
