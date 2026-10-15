# Tableau de travail — Chrono-IIE

Le README principal reste la vision du jeu. Ce dossier décrit le socle réellement livré et le travail à se répartir. Une fiche de niveau contient la conception, les supports, tous ses dialogues et les solutions, pour éviter de rechercher ces éléments dans le grand README.

## Démarrage

Dans un terminal **Ubuntu/WSL** :

```sh
cd /home/daniel/hackathon
npm ci
npm run dev
```

Node 22 recommandé (`.nvmrc`) ; Node 20.19+ compatible. Ouvrir http://localhost:5173. Ne pas mélanger une installation npm Windows et une installation WSL dans le même `node_modules`. Depuis un clone ailleurs, utiliser le chemin de ce clone.

`npm run check` vérifie les frontières, les données, les tests et le build. `npm run preview` sert le build déjà généré. Aucun backend ni variable secrète requis.

## Ce qui fonctionne

- Contrats TypeScript + validation Zod des paquets JSON, fragments, sites et campagne.
- Découverte automatique des paquets, contrôle des prérequis, types de ports et cycles.
- Moteur pur : brouillons par étape, validation, trois indices, assistance, dialogues, récompenses uniques et intégrité dérivée.
- Sauvegarde locale versionnée, export/import contrôlé, protection contre une écriture concurrente détectée et maintien en mémoire si le stockage échoue.
- Cinq mécaniques : formulaire, classement, appariement, sélection sous contraintes et programme sur grille. Documents, dialogues, aide, observations DEMO et carnet partagés.
- Atelier isolé utilisant les mêmes validateurs et composants, profils DEMO pair/impair et fixtures locales.
- Onze prototypes : PRO-00, PAS-01, PAS-02, PAS-03, SYN-01, PRE-01, PRE-02, SYN-02, FUT-01, FUT-02, SYN-03. Une campagne complète atteint 100 points. Les actes I et II fonctionnent en campagne, avec les profils DEMO pair et impair ; FUT-01 et FUT-02 s’ouvrent après CAPSULE.
- Briques de l’acte II : circuit typé (`circuit`), mur de mots (`wordgrid`), réponses attendues selon la parité d’une observation (`parityOf`), sorties dérivées du profil (`derive`), fixtures et réponses de recette par profil.

Le jeu complet n’est pas livré. Les deux paquets `draft` (FUT-C, EXT-EST) restent volontairement non jouables. Les dialogues exécutés sont encore abrégés : les fiches conservent le script complet à intégrer. Pas encore de service worker, de chronomètre, de terrain réel, de roue graphique ni d’écran de fin. Le Conseil a son contrat mais pas encore son contenu.

## Fiches des niveaux

Une personne réserve un dossier de niveau. L’autre peut travailler sur un autre dossier en utilisant ses propres fixtures. Les fichiers de données et de recette ne sont pas partagés entre niveaux.

| Ordre | Étape du jeu | État | Responsable | Dépendance de brique |
|---|---|---|---|---|
| 01 | [PRO-00 — Le Signal](../../game/levels/pro-00/TASK.md) | Prototype | À attribuer | Aucune brique bloquante. Dialogue linéaire et choix de retour déjà disponibles. |
| 02 | [PAS-01 — Les archives déclassées](../../game/levels/pas-01/TASK.md) | Prototype | À attribuer | OrderBoard et AnswerForm disponibles. |
| 03 | [PAS-02 — Le nom perdu](../../game/levels/pas-02/TASK.md) | Prototype | À attribuer | ObservationCard DEMO et validation César disponibles. Roue graphique et profil réel à ajouter. |
| 04 | [PAS-03 — Le décret aux trois dates](../../game/levels/pas-03/TASK.md) | Prototype | À attribuer | AnswerForm date et sélection de preuves disponibles. |
| 05 | [SYN-01 — La machine temporelle](../../game/levels/syn-01/TASK.md) | Prototype | À attribuer | Deux étapes persistées, formulaires et injections de fragments disponibles ; SlotBoard graphique facultatif. |
| 06 | [PRE-01 — L’atelier des compétences](../../game/levels/pre-01/TASK.md) | Prototype | gitvonBS | MatchBoard avec retour éditorial et ConnectionBoard (`circuit`) disponibles. |
| 07 | [PRE-02 — Les yeux d’ARIIE](../../game/levels/pre-02/TASK.md) | Prototype | gitvonBS | Formulaire avec parité (`parityOf`) et sortie `orientation` dérivée du profil disponibles. |
| 08 | [SYN-02 — Le mur des mots](../../game/levels/syn-02/TASK.md) | Prototype | gitvonBS | WordGrid (`wordgrid`) et extraction orientée disponibles ; pair et impair testés. |
| 09 | [FUT-01 — Le campus sous contraintes](../../game/levels/fut-01/TASK.md) | Prototype | À attribuer | ConstraintSelector disponible avec totaux en direct et liste ordonnée des contraintes. |
| 10 | [FUT-02 — Le protocole incomplet](../../game/levels/fut-02/TASK.md) | Prototype | À attribuer | GridProgram disponible, trace et première erreur calculées par le moteur. |
| 11 | [FUT-C — Le Conseil du futur](../../game/levels/fut-c/TASK.md) | À réaliser | À attribuer | Contrat `narrative`, commande `choose` et calcul de l’issue disponibles ; contenu à saisir. |
| 12 | [SYN-03 — Le contrôle du centenaire](../../game/levels/syn-03/TASK.md) | Prototype | gitvonBS | Brique `evidence` et pièges de saisie (`traps`) disponibles. |
| 13 | [EXT-EST — L’antenne de l’Est](../../game/levels/ext-est/TASK.md) | À réaliser | À attribuer | AnswerForm et DocumentReader disponibles. Extension indépendante de la victoire. |
| 14 | [END — Capsule et fins](../../game/endings/TASK.md) | À réaliser | À attribuer | `ending(session, catalog)` disponible ; écran et textes à réaliser. |

## Chantiers communs

Prendre une fiche entière ou ses sous-tâches. Les propriétaires ci-dessous sont des suggestions de répartition, pas une attribution imposée.

| Fiche | Résultat | Suggestion |
|---|---|---|
| [00 — Prise en main](00-prise-en-main.md) | Deux machines exécutent le socle et le même contrat | Ensemble |
| [01 — Contrats](01-contrats.md) | Données valides, fixtures et diagnostics | A |
| [02 — Moteur et sauvegarde](02-moteur.md) | Progression, reprise, propriétés de session | A |
| [03 — Briques d’interaction](03-briques.md) | Catalogue extensible, circuit et grille de mots | A/B, une brique chacun |
| [04 — Narration et fins](04-narration.md) | Graphes complets, Conseil et écran END | B |
| [05 — Terrain](05-terrain.md) | Profils vérifiés, secours et sorties dérivées | A |
| [06 — Interface et DA](06-interface.md) | Thème, navigation, lisibilité mobile | B |
| [07 — Hors ligne](07-hors-ligne.md) | Cache réel et compatibilité des versions | A |
| [08 — Intégration](08-integration.md) | Campagne complète et recette à deux | Ensemble |

## Contrat de collaboration

1. Choisir un dossier et noter le propriétaire dans la fiche avant de travailler.
2. Créer une branche dédiée, par exemple `level/pre-01` ou `shared/word-grid`. Les noms sont des exemples ; aucune branche n’est créée automatiquement.
3. Lire [le guide de contribution](../../CONTRIBUTING.md) et [le contrat d’auteur](../../src/authoring/README.md).
4. Ne modifier qu’un paquet tant que les primitives existantes suffisent.
5. Pour une primitive nouvelle, convenir d’un contrat avant de travailler de part et d’autre. Une seule personne modifie le schéma commun à la fois.
6. Relier ou modifier les bindings de campagne à un point de synchronisation. Changer un producteur ne change pas le consommateur si le type de fragment reste identique.
7. Faire relire puis fusionner une étape qui passe ses cas d’acceptation ; ne pas attendre que l’autre ait terminé son acte.

## Ordre conseillé pour la suite immédiate

- Fait : acte II (PRE-01, PRE-02, SYN-02) et ses briques communes, sur la branche `level/act-2`.
- Sans conflit avec le code commun : EXT-EST (contenu seul), dialogues complets de l’acte I dans chaque `level.json`, thème et navigation (chantier 06), hors ligne (chantier 07).
- Fait : SYN-03 (brique `evidence`), contrat narratif (`narrative`, `choose`) et calcul de l’issue (`ending`).
- Ensuite : contenu de FUT-C et écran END, puis terrain réel et cache.

Les actes I et II fournissent le modèle à suivre, et l’atelier permet d’avancer sans attendre la campagne complète.
