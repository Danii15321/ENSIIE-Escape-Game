# 02 — Moteur de session et sauvegarde

**État :** transitions et reprise livrées ; fonctionnalités complémentaires à faire. **Propriétaire suggéré :** A. **Dépendance :** contrat 1.

## Périmètre

`src/core/session/`, `src/core/ports/`, `src/adapters/storage/`, `src/app/useGame.ts`, `checks/scenarios/`.

## Déjà vérifié

Les actes imposent leurs prérequis ; l’ordre des missions du passé est libre. Les étapes d’une synthèse restent séquentielles. Les brouillons persistent. Réussite et assistance débloquent la progression. Une seconde validation ne donne aucun point supplémentaire. Une reprise incompatible préserve la donnée brute. Une erreur d’écriture laisse continuer en mémoire avec proposition d’export.

## Étapes restantes

1. Ajouter des préférences et une commande de nom d’équipe sans accès direct au stockage depuis une vue.
2. Ajouter un temps actif par une horloge injectée : pause explicite et onglet caché arrêtent le comptage. Tester avec une fausse horloge.
3. Ajouter les choix narratifs remplaçables, puis leur verrouillage à l’ouverture de la capsule.
4. Persister la provenance d’un secours terrain distinct de l’assistance complète.
5. Si nécessaire, renforcer la coordination multi-onglet avec un verrou navigateur et une reprise de contrôle explicite. Le socle détecte les changements de sauvegarde et refuse les écrasements constatés ; ce n’est pas une transaction atomique entre deux onglets qui écrivent au même instant.
6. Concevoir des migrations uniquement lorsqu’un besoin concret de compatibilité apparaît ; ne pas corriger silencieusement un vieux brouillon.

## Cas de recette

- [ ] Reprise à chaque étape d’une synthèse et après un indice.
- [ ] Les dix missions principales donnent exactement 100 points ; prologue, Conseil et extension donnent zéro.
- [ ] Un code final connu ne saute aucun prérequis.
- [ ] Un import malformé, d’une autre campagne ou d’une autre révision est refusé sans perte de l’original.
- [ ] Une sauvegarde impossible est annoncée et un export reste possible.
- [ ] Deux onglets ne présentent jamais une reprise silencieuse comme une synchronisation multijoueur.

**Sortie de tâche :** transitions pures, adaptateurs séparés, scénarios de reprise et documentation des limites.
