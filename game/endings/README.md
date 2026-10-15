# Fins de Chrono-IIE

`content.json` est la source éditoriale des quatre fins et des neuf engagements. Le [TASK](TASK.md) conserve le script et la recette. Les textes restent des chaînes simples, jamais du HTML.

## Modifier une fin

Changer `variants.lucidite`, `sobriete`, `partage` ou `horizon-commun`. L’ouverture et la clôture sont communes ; seule la variable `{equipe}` de clôture est remplacée. Les neuf engagements sont indexés par `questionId` et `optionId` et suivent l’ordre C1–C3, puis Lucidité/Sobriété/Partage.

Lors d’une modification d’engagement, corriger aussi `game/levels/fut-c/level.json`, sa révision et sa fiche. Le validateur compare les deux catalogues. Les engagements affichés sont uniquement ceux des réponses effectivement enregistrées ; les données de fin ne créent aucun choix manquant.

La frise référence le registre de sources partagé. 2068 reste une projection séparée des quatre dates historiques. `npm run check:content` refuse un identifiant de source absent, une fin manquante ou une divergence entre les neuf engagements et le Conseil.

## Séparation des responsabilités

- Le moteur détermine l’ouverture et le thème : `ending(session, catalog)`.
- L’application compose le bilan et relie carnet, accueil, contribution et export.
- La vue commune reçoit uniquement données et callbacks.
- Le message privé vit dans un stockage local séparé par partie ; aucun serveur ne le reçoit. L’export du souvenir est un fichier texte local, distinct de l’export JSON de progression.

Le chronomètre, les photos de terrain et le cache hors ligne restent dans leurs chantiers respectifs.
