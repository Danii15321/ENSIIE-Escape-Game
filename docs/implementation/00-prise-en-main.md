# 00 — Prise en main à deux

**État :** socle livré, vérification sur vos deux machines à faire. **Propriétaire :** ensemble. **Dépendances :** aucune.

## Résultat attendu

Les deux personnes peuvent lancer le même projet, prévisualiser un niveau sans jouer les précédents et modifier leur propre paquet sans conflit.

## Étapes

1. Installer Node 22, cloner le dépôt et lancer `npm ci` dans le terminal choisi. Sous WSL, garder code, commandes et installation de dépendances dans Ubuntu.
2. Lancer `npm run check`, puis `npm run dev`.
3. Dans le parcours, résoudre PRO-00 ; recharger et vérifier la reprise.
4. Dans l’atelier, ouvrir SYN-01 directement : les trois fragments sont simulés. Résoudre la première étape et vérifier que l’annonce n’apparaît qu’après.
5. Ouvrir FUT-01 indépendamment et retrouver BCF.
6. Choisir chacun un dossier dans le tableau de travail, puis une branche. Noter le propriétaire dans sa fiche.
7. Convenir d’un propriétaire temporaire des contrats, de la campagne et du thème.

## Livrables

- Deux installations opérationnelles.
- Deux fiches réservées avec un périmètre clair.
- Un premier changement de contenu par personne, testé dans l’atelier.

## Acceptation

- [ ] Les deux machines passent `npm run check`.
- [ ] Le niveau de l’autre n’a pas besoin d’être lancé pour tester le sien.
- [ ] Les fixtures apparaissent dans l’atelier, jamais dans la sauvegarde du parcours.
- [ ] Le binôme sait distinguer `draft`, `prototype` et `ready`.

Ne pas attendre de disposer d’un éditeur visuel : les paquets JSON suffisent à commencer.
