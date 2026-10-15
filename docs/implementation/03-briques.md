# 03 — Catalogue des interactions communes

**État :** cinq mécaniques exécutables ; briques complémentaires à construire. **Propriétaire suggéré :** A et B sur des briques différentes, après accord de contrat.

## Briques disponibles et variantes à ajouter

| Brique du README | Implémentation actuelle | Suite |
|---|---|---|
| DocumentReader | Documents dépliables, nature et sources | Sélection de passages/preuves et médias |
| AnswerForm | Texte, code, entier, date, choix, ensemble | Retours éditoriaux spécifiques |
| OrderBoard | Boutons monter/descendre + champs | Sélection puis placement, habillage |
| CaesarWheel | Chiffrement calculé et formulaire de recul | Roue visuelle optionnelle |
| SlotBoard | Formulaire de calibration + références de fragments | Placement graphique avec même validation |
| MatchBoard | Appariement par listes de choix, retour éditorial `error` facultatif | Présentation en cartes |
| ConnectionBoard | `circuit` : une liste de raccordement par sortie, types, entrées doublées, boucles et trace | Animation d’impulsion facultative |
| ObservationCard | Valeurs fictives O1/O2 + génération César | Profil réel et secours traçable |
| WordGrid | `wordgrid` : sélection départ puis fin, deux sens, résidus recalculés, lecture inverse | Glisser au doigt facultatif |
| ConstraintSelector | Totaux, contraintes et validation | Peaufiner les cartes |
| GridProgram | Programme à trous, obstacles, trace et message | Simulation exploratoire et cartes de rôles |
| EvidenceChoice | `evidence` : décisions, ensemble exact de preuves tirées des ports, retours par affirmation | Cartes de preuves illustrées |
| NarrativeChoice | Niveau `narrative`, commande `choose`, gel au final | Habillage des réponses de Nora |
| MemoryCard | Capsules, carnet et fragments reçus | Cartes de preuves consultables dans le final |

## Extension commune : méthode

1. Écrire un exemple de données et la forme exacte de la réponse avant le composant.
2. Ajouter le discriminant au schéma `Mechanic`.
3. Écrire une fonction pure de validation avec résultat `format/incorrect/partial/correct`.
4. Ajouter le contrôle structurel et les tests de propriétés utiles.
5. Ajouter un composant contrôlé : `mechanic`, `answer`, `onChange` ; aucune sauvegarde interne et aucune récompense.
6. Raccorder au rendu commun et documenter le format dans le guide d’auteur.

## ConnectionBoard : contrat à décider

- Entrées : modules avec identifiants, ports d’entrée/sortie et types, source, destination, contraintes de passage.
- Réponse : liste de connexions ou ordre des modules, sans fonctions JavaScript.
- Validation : connexions existantes, compatibilité des types, chaîne complète, absence de cycle, étapes attendues.
- PRE-01 : BESOIN → MODELE → MODELE VALIDE → SCENE → DEMO FLUIDE.
- Cas négatifs : contournement de MODELE VALIDE, sortie incompatible, cycle, module dupliqué, circuit incomplet.

## WordGrid : contrat à décider

- Entrées : matrice, mots injectés, directions autorisées, cases actives et orientation de lecture.
- Réponse : segments de coordonnées et extraction ; les mots ne sont pas simplement cochés dans une liste.
- Validation : limites, alignement, continuité, sens, lettres exactes, unicité, extraction des seules cases restantes.
- Vérifier les deux orientations et la solution CAPSULE avec la grille complète de la fiche SYN-02.
- Alternative clavier : choisir une case de départ puis une case de fin.

## Definition de fini

- [ ] Un niveau de démonstration utilise la brique sans modifier le moteur de session.
- [ ] Le validateur et la vue ne connaissent aucun identifiant de mission.
- [ ] Les données invalides sont refusées par le contrôle de contenu.
- [ ] Le clavier, les petites largeurs et les messages d’erreur sont vérifiés.
- [ ] Le cas nominal et des contre-exemples réels sont testés.
