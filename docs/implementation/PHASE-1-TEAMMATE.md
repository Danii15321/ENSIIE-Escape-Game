# Phase 1 — contenu, interface et préparation du relevé

État au 15 octobre 2026. Ce lot couvre la colonne « Teammate ». Le lot initial préservait les contrats et le moteur de la colonne « core code ». Le prolongement demandé par le porteur du projet intègre maintenant le profil réel après fusion des travaux du noyau.

## Livré

| Lot | Résultat |
|---|---|
| EXT-EST | Prototype jouable après SYN-01, également isolé via `/?level=ext-est`. Deux fiches historiques sourcées, formulaire, trois indices, erreurs contextualisées, démarche, capsule et fragment ArchiveEst. Aucun point d’intégrité. |
| PRO-00 | Répliques intégrales, questions « Qui t’a créée ? » / « Pourquoi nous ? », retour au dialogue principal et lettres encadrées du tutoriel. |
| PAS-01 | Entrée, branches sur les archives, erreurs dont l’année proche 1972, indices, réussite et retour. |
| PAS-02 | Entrée, question sur le nom, réplique DEMO, erreurs d’observation/déchiffrement, indices, réussite et retour. |
| PAS-03 | Entrée, question sur les dates, retours distincts pour le 5 juillet, le 7 juillet, une date illisible et les preuves manquantes. |
| SYN-01 | Entrée, erreurs de cadran et de clé, ouverture de l’archive en deuxième étape, archive complète, aide documentaire, indices, réussite et retour. |
| Interface | Cartes réutilisables, badges documentaire/fiction/reconstitution, sources, fragments disponibles pendant la résolution, focus sur le titre et retour au bouton du dossier. |
| Terrain | [Relevé Évry 2026](../../game/sites/evry-2026/README.md) reçu du porteur du projet : 2 baby-foot dans le foyer et 3 salles de TP au premier étage. Trajets, accès déclaré permanent, consignes et secours textuel documentés ; photos à ajouter plus tard. |

## Adaptations et limites explicites

1. **EXT-EST demande le code postal `67400` et l’étiquette « implantation historique ».** La conception autorisait aussi deux graphies d’Illkirch. Le formulaire actuel valide une valeur scalaire unique : la consigne est donc resserrée sur le code postal pour ce prototype. Les deux informations restent obligatoires. Ajouter des alias plus tard relève d’une décision commune sur la brique formulaire.
2. **PRO-00 conserve le nom d’équipe existant.** La réplique intégrale proposant un nom est conservée, mais le bouton propose de garder le nom courant. L’édition et la persistance du nom nécessitent une commande moteur à convenir avec son propriétaire.
3. **P2.GO est maintenant branchée sur le site réel.** Les nœuds peuvent définir `realText`, affiché avec les lieux/itinéraires/questions du site. Les profils DEMO conservent leurs répliques de simulation.
4. Pas de carte géographique illustrée ni d’AR dans EXT-EST : les deux documents textuels suffisent à sa résolution 2D. La carte reste un enrichissement visuel.
5. Les niveaux restent `prototype`. Une recette humaine indépendante reste nécessaire ; l’ajout des photos et la finition de toute la campagne restent à faire.

## Écrire les textes sans modifier le moteur

Chaque dossier conserve `level.json`, `fixtures.json`, `acceptance.json` et `TASK.md`. Un fichier **optionnel `presentation.json`**, chargé par `App.tsx`, complète les retours éditoriaux. Un niveau qui n’en possède pas conserve les messages habituels.

| Champ | Rôle |
|---|---|
| `version: 1` | Version du format éditorial |
| `feedback` | Liste ordonnée de répliques `{ id, text, when }`. La première condition correspondante est utilisée après un échec du validateur. |
| `when.step` | Identifiant d’étape du même `level.json` |
| `when.field`, `when.test`, `when.value` | Condition optionnelle sur un champ du brouillon. Sans test, c’est le retour par défaut de cette étape. |
| `stepLines` | Réplique persistante affichée à l’ouverture d’une étape, indexée par son identifiant |
| `reservedLines` | Répliques non activées, avec `reason` expliquant leur dépendance ; jamais affichées automatiquement |
| `exitLabel` | Libellé du bouton revenant aux dossiers après réussite en campagne |

Tests éditoriaux disponibles : `equals`, `notEquals`, `integerEquals`, `dateEquals` (date canonique), `invalidDate`, `notEightDigits`, `notObservation` (`O1` ou `O2`). Ils choisissent uniquement un texte ; ils ne valident pas une réponse, ne produisent aucun fragment et ne modifient aucun score. Les erreurs du validateur restent affichées si elles apportent une autre information. `{equipe}` est remplacé par le nom de session ; les autres variables ne sont pas interprétées.

Le parseur vérifie le format au chargement. Les tests de contenu vérifient les références étape/champ et la présence des répliques originales des TASK. Après un changement éditorial, lancer `npm run check`, pas seulement `check:content`.

## Composants communs

`src/presentation/components/Cards.tsx` expose `MissionCard`, `DocumentCard`, `NarrativeCard`, `MemoryCard`, `TextBlocks` et `FocusedLevelTitle`. Les contenus restent dans les dossiers de niveaux. `TextBlocks` affiche du texte, des paragraphes et les lettres `[A]` encadrées ; il n’interprète pas de HTML.

`LevelView` assemble les cartes et les widgets existants. `App.tsx` fournit les textes et gère le retour au bouton de la mission. Les tokens de couleur, rayons et espacements restent dans `theme/global.css`. Aucun style propre à une énigme n’est requis pour utiliser ces cartes.

## Vérifications et reprise

- `npm run check` réussi : frontières, catalogue (8 prototypes, 5 drafts), **41 tests** et build. `npm run format:check` et `git diff --check` passent également.
- Tests ajoutés : conservation des répliques, conditions éditoriales, boucle de dialogue, solution/erreurs/assistance d’EXT-EST, reprise de brouillon, prérequis, score inchangé et récompense unique ; focus, saisie, cartes verrouillées et lettres du tutoriel.
- Navigateur : EXT-EST testé avec erreur d’époque puis solution complète. Documents consultables et réussite visible.
- Largeurs 360, 390, 768 et 1280 px : formulaire EXT-EST et documents ouverts sans débordement horizontal ; boutons de cette vue d’au moins 44 px. Il s’agit de contrôles navigateur avec viewport, pas d’essais sur quatre appareils physiques.
- Contrôle complémentaire des vues initiales PAS-01, SYN-01 et FUT-02 aux quatre largeurs : pas de débordement horizontal, boutons d’au moins 44 px et titre recevant le focus.
- À compléter : recette humaine extérieure, lecteur d’écran, mesure exhaustive des contrastes, vrais trajets et fermeture des zones.

Les six paquets du lot initial passent en **révision 2**, puis PAS-02 et PRE-02 passent en **révision 3** lors de l’intégration du site réel. Les sauvegardes portant une ancienne révision peuvent être refusées par le contrôle existant : exporter l’original puis créer une nouvelle partie de test. Aucune sauvegarde utilisateur n’est effacée automatiquement. L’atelier reste isolé de la campagne.

## Répartition à poursuivre

Le propriétaire du noyau poursuit EvidenceChoice/SYN-03, les choix révisables de FUT-C et la fonction de fin. Le propriétaire contenu peut retravailler chaque `level.json` et `presentation.json` dans son dossier. Les valeurs du relevé O1/O2 sont désormais reçues : O1 = 2 et O2 = 3 (impair). Le chantier terrain commun a intégré ce profil ; les photos seront ajoutées ultérieurement. Voir la fiche Évry 2026 pour les textes et la variante de grille à utiliser.

## Intégration sur main — profil réel

Les commits de l’acte II, du final et du contrat narratif ont été fusionnés avec ce lot. Le catalogue contient désormais 12 prototypes et un dossier draft (FUT-C). Évry 2026 est le profil par défaut des nouvelles campagnes, sélectionnable aussi dans l’atelier. La commande `fallback`, le composant `ObservationCard` et le contrat Site enrichi couvrent les trajets et secours sans photo. Voir le [chantier terrain](05-terrain.md) pour le détail.

Validation après fusion et intégration terrain : **92 tests passent**, contrôle du catalogue (12 prototypes), frontières, build et formatage réussis. PAS-02 et PRE-02 ont aussi été résolus dans le navigateur avec le profil Évry 2026 et les secours textuels.
