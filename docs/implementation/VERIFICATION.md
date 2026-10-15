# Vérification du socle — 15 octobre 2026

## Contrôles automatisés

`npm run check` regroupe :

- Vérification des imports entre couches et de l’absence de code exécutable dans `game/`.
- Validation des 13 paquets, des bindings de campagne, des fixtures et des réponses nominales des 7 prototypes.
- Tests de prérequis, ordre libre des missions, reprise multi-étapes, non-duplication des récompenses, assistance et sauvegardes incompatibles.
- Tests des dates, des décalages César de 1 à 9, des 20 combinaisons de projets et des 16 couples d’instructions.
- Tests de composants pour une saisie erronée puis correcte et le parcours d’assistance.
- Vérification TypeScript et construction de production.

Les paquets `draft` sont contrôlés structurellement ; leur résolution n’est pas prétendue implémentée. Le contrôle des frontières est une vérification statique des imports, pas un dispositif de sécurité.

## Essais dans le navigateur

- PRO-00 résolu dans le parcours ; rechargement : prologue restauré et les trois missions du passé disponibles.
- SYN-01 ouvert directement dans l’atelier ; fragments simulés présents ; calibration puis annonce ; résolution 2101 / Chamarande.
- FUT-01 essayé à 390 px de largeur : sélection BCF, totaux et validation. Aucun débordement horizontal relevé.
- Console du navigateur : aucune erreur ni avertissement relevé sur ces parcours.

## Limites

La campagne complète, les trois fins thématiques, la fin par défaut, le terrain réel et le hors-ligne ne sont pas encore implémentés. Pas de test avec une équipe de joueurs ni sur téléphone physique. Le socle ne revendique pas de synchronisation multijoueur ni d’atomicité des écritures entre onglets simultanés.
