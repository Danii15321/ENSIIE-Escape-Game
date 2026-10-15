# 01 — Contrats de contenu et assemblage

**État :** version 1 livrée ; extensions à convenir. **Propriétaire suggéré :** A. **Dépendances :** prise en main.

## Fichiers concernés

`src/core/contracts/`, `src/core/content/`, `scripts/check-content.ts`, `game/campaigns/chrono-iie/`, `checks/contracts/`.

## Déjà disponible

Schémas de niveaux, mécaniques, fragments et profils ; chargement automatique ; diagnostics de types de ports, producteurs non garantis, cycles, nœuds sans destination, documents manquants et coordonnées hors grille.

## Étapes restantes

1. Avant PRE-02, définir une sortie dérivée du profil : une règle nommée produit la valeur observée et le sens de lecture. Conserver l’absence de code exécutable dans le paquet.
2. Avant FUT-C, séparer le paquet narratif des puzzles : aucune solution fausse ni indice requis ; les réponses sont des choix remplaçables.
3. Étendre les schémas pour ConnectionBoard, WordGrid et EvidenceChoice avec un propriétaire unique pendant la modification.
4. Ajouter les diagnostics propres à chaque mécanique : ports typés, segments hors grille, références de preuves absentes.
5. Ajouter une politique de médias (chemin local, provenance, droits, alternative) au moment d’intégrer les premières photos.
6. Versionner toute modification incompatible, sans modifier silencieusement les sessions en cours.

## Contrat d’intégration

Un consommateur ne dépend que du nom local et du type de son entrée. Le producteur exact est choisi dans la campagne. Les fixtures restent des fichiers indépendants ; elles ne doivent pas importer les sorties du producteur pour masquer une dépendance.

## Recette

- [ ] Un mauvais type et un producteur non acquis produisent des erreurs lisibles.
- [ ] Remplacer le producteur de NomHistorique ne nécessite aucun changement de SYN-01.
- [ ] Un niveau invalide est repéré avant publication par `check:content`.
- [ ] Les cas existants restent valides ou font l’objet d’une migration explicite.
- [ ] Le contrat et le guide d’auteur décrivent les mêmes champs.

**Sortie de tâche :** schéma, diagnostics, tests de contre-exemples, exemple minimal et mise à jour du guide d’auteur.
