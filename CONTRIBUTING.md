# Travailler à deux

Commencer par le [tableau des tâches](docs/implementation/README.md). Le [README](README.md) contient la vision du jeu ; chaque `game/levels/<id>/TASK.md` contient le détail d’une étape.

## Installer et vérifier

```sh
npm ci
npm run dev
npm run check
```

Utiliser Node 22 et npm. Sous WSL, exécuter npm dans Ubuntu, pas dans PowerShell sur le même dossier. Les versions exactes sont dans `package-lock.json`. Le serveur local est accessible à `http://localhost:5173` ; le port peut changer si celui-ci est occupé, consulter le terminal.

## Modifier un niveau existant

1. Réserver son dossier dans `TASK.md` et travailler sur une branche dédiée.
2. Lire consigne, documents, solution et dialogues dans cette fiche.
3. Éditer `level.json`, `fixtures.json` et `acceptance.json` dans ce même dossier.
4. Ouvrir `/?level=<id>` : l’atelier injecte les fragments simulés et n’écrit pas la sauvegarde du joueur.
5. Tester une bonne réponse, une erreur, l’aide et les reprises. Les réponses dans `acceptance.json` sont des réponses complètes, une par étape.
6. Exécuter `npm run check:content -- <id>` puis `npm run check`.
7. Faire relire le niveau et sa preuve par l’autre personne ; passer à `ready` uniquement après recette complète.

Les tests de puzzles nomment les niveaux : `npm test -- -t pas-03` cible son contrat nominal. Ce filtre ne remplace pas `npm run check` avant intégration.

`npm run format` harmonise le code et les données JSON ; `npm run format:check` vérifie leur présentation. Les grands documents de game design sont exclus de ce formatage pour garder leurs tableaux éditoriaux stables.

## Qui modifie quoi ?

| Dossier | Propriétaire pendant une tâche |
|---|---|
| `game/levels/<id>/` | La personne qui prend ce niveau |
| `src/core/contracts/`, `src/core/session/` | Un seul propriétaire annoncé pour la tâche |
| `src/presentation/widgets/` | Une brique par personne ; synchroniser le registre avant ajout |
| `game/campaigns/chrono-iie/` | Modifications lors du point d’intégration |
| `game/shared/sources/` | Ajouter une source sous un identifiant unique, sans renuméroter celles existantes |
| `src/presentation/theme/` | Propriétaire DA temporaire ; tous les niveaux consomment le thème |

Un niveau ne connaît aucun voisin. Les fragments arrivent par `inputs`, les sorties sont déclarées dans `outputs`, et la campagne choisit les producteurs. Une mécanique inconnue doit devenir une primitive commune ; ne pas ajouter une condition `if (level.id === ...)` au moteur.

## Compatibilité

- Changement de texte, règle, grille ou réponse jouée : augmenter `level.revision`.
- Changement des bindings ou du graphe : augmenter `campaign.revision`.
- Changement d’observation : augmenter `site.revision`.
- Changement incompatible de structure : nouvelle version de contrat et stratégie de migration explicite.
- Au socle actuel, une incompatibilité bloque la reprise et conserve la sauvegarde brute. L’utilisateur peut l’exporter puis démarrer une nouvelle partie. Aucune migration implicite.

Les diagnostics de contenu et la vérification des imports sont des garde-fous de développement ; ils ne constituent ni un bac à sable pour du code tiers ni un dispositif anti-triche.

## Avant une fusion

- [ ] `npm run check` passe.
- [ ] Les fichiers de niveau, fixtures et critères correspondent à la même révision.
- [ ] Les instructions de test manuel et les limites connues figurent dans la fiche.
- [ ] Le diff ne contient pas de `node_modules`, de build, de sauvegarde personnelle ou de secrets.
- [ ] Un changement de contrat partagé a été annoncé et ses consommateurs mis à jour.
- [ ] Les modifications de design sont répercutées dans la fiche et le README lorsqu’elles changent la vision commune.
