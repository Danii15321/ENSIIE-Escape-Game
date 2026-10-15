# 05 — Profils de site et observation physique

**État :** DEMO pair et impair disponibles ; profil Évry 2026 intégré, avec trajets, secours textuels persistés et orientation dérivée ; photos et recette humaine à compléter. **Propriétaire suggéré :** A, relevé relu ensemble.

## Préparation

Ne pas inventer les observations du bâtiment. O1 doit donner un entier de 1 à 9. O2 est un entier dont la parité détermine l’orientation. Les deux zones doivent être accessibles et distinctes ; prévoir une solution lorsque l’une est fermée.

## Étapes

1. Relever le lieu, l’itinéraire, la question exacte, la réponse attendue, la date de relevé et l’auteur de la vérification.
2. Photographier le repère si autorisé, noter les droits et fournir un texte alternatif.
3. Vérifier le trajet à pied, y compris un itinéraire accessible ; mesurer la durée sans la supposer.
4. Étendre le schéma Site avec les descriptions et secours. Le booléen `verified` ne suffit pas à documenter un relevé réel.
5. Préparer le César avec O1 et le mur avec la parité d’O2 avant la partie ; les figer avec la révision du site.
6. Ajouter les sorties dérivées pour OrientationLecture ; l’actuel fragment DEMO de PRE-02 n’est qu’une réservation de port.
7. Enregistrer l’usage du secours dans la session et le fragment, sans pénaliser la progression.
8. Activer le profil réel seulement après contrôle des deux énigmes et des supports de secours.

## Recette

- [x] O1 de 1 à 9 produit un César qui se déchiffre exactement.
- [x] Un profil pair et un profil impair produisent tous deux CAPSULE.
- [x] Changer de profil ou de révision ne réinterprète pas une ancienne partie.
- [x] Une zone fermée n’empêche pas d’avancer avec le secours vérifié.
- [x] Un profil DEMO ne présente aucune direction comme réelle.
- [ ] Un relevé réel non vérifié empêche sa publication.

**Livrables :** profil documenté, ressources locales, preuves de relevé et scénarios pair/impair/fermeture.

## Relevé reçu — Évry 2026

Source : message du porteur du projet du 15 octobre 2026. [Fiche complète](../../game/sites/evry-2026/README.md).

- **O1 = 2** : nombre de baby-foot dans le foyer. Depuis l’entrée, tourner à droite pour accéder au foyer. Générer le César à +2.
- **O2 = 3** : nombre de salles de TP au premier étage. Depuis l’entrée, rejoindre le premier étage. Produire `observed: 3`, `direction: reverse` et préparer la grille impaire.
- Les deux lieux sont déclarés toujours accessibles. Les photos seront ajoutées plus tard ; un [secours textuel](../../game/sites/evry-2026/secours.md) est préparé avec les mêmes valeurs.
- La date exacte du comptage, les durées de marche et le trajet sans escalier ne sont pas précisés. Aucune vérification indépendante n’est prétendue.

L’absence de photos n’empêche pas de travailler avec ces données et les supports textuels. Le profil réel est activé dans le catalogue. Les cartes DEMO conservent leur mode fictif ; les données et les sauvegardes des profils restent séparées. Le parcours réel est testé jusqu’à 100 points avec et sans recours aux secours.

## Livraison technique du 15 octobre 2026

`Site.mode` distingue `real` de `demo` (valeur par défaut pour les anciens profils). Un site réel exige les deux `landmarks` (lieu, trajet, question, périmètre, accès et secours) et `testimony` (source, millésime, date de réception). Les réponses numériques restent dans `observations`.

La commande `fallback` ne s’applique qu’aux observations déclarées par un niveau sur un site réel. Elle ne donne ni point ni réussite, ne consomme pas d’indice et mémorise l’usage une seule fois. La restauration refuse un secours étranger au niveau ou à un profil DEMO. Le carnet ajoute cette provenance à ses cartes.

PAS-02 et PRE-02 passent en révision 3 pour leurs textes adaptés au site. Les anciennes révisions de sauvegarde restent refusées avec possibilité d’exporter l’original ; aucune donnée utilisateur n’est supprimée automatiquement. FUT-C reste à rédiger et l’écran END reste à construire.
