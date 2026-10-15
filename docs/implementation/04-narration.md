# 04 — Dialogues, Conseil et fins

**État :** Conseil complet et écran END intégrés ; recette humaine à compléter. **Propriétaire suggéré :** B. **Dépendance :** contrat narratif et calcul de fin existants réutilisés.

## Périmètre

Les textes de chaque niveau restent dans son dossier. Les composants et règles communes restent dans le moteur et la présentation. Les quatre fins sont décrites dans [END](../../game/endings/TASK.md).

## Étapes

1. Intégrer tous les nœuds des fiches TASK.md, avec identifiants stables et retours explicites. Le socle gère des choix menant à un nœud ou au puzzle ; il n’interprète aucune expression libre.
2. Ajouter des codes de retours de validation et une correspondance éditoriale par niveau. Conserver les données numériques contrôlées (budget, numéro d’instruction), sans HTML.
3. Ajouter des conditions déclaratives limitées si les scènes en ont besoin : réussite, étape, choix ; refuser un opérateur inconnu.
4. Introduire NarrativeChoice et la commande de remplacement d’une réponse.
5. Implémenter FUT-C avec trois questions, trois options chacune, aucun jugement vrai/faux ni pénalité.
6. Calculer les fins : majorité d’un thème, sinon Horizon commun. Les engagements restent dans l’ordre des questions et les questions ignorées n’inventent aucune phrase.
7. Implémenter l’ouverture après la réussite de SYN-03 via la configuration de campagne ; verrouiller les choix de fin.

## Tests

- [ ] Nœud absent, choix absent et boucle sans sortie sont diagnostiqués.
- [ ] Poser une question facultative revient correctement au choix ou au puzzle.
- [ ] Un dialogue ne peut pas attribuer une réussite ni un fragment.
- [ ] Cliquer dix fois sur un choix n’ajoute pas dix votes.
- [ ] Les quatre fins existent ; égalité, absence et réponses partielles ont une issue définie.
- [ ] Ignorer le Conseil n’empêche pas de terminer.
- [ ] La contribution finale est privée et ne fait aucun appel réseau.

**Livrables :** données narratives, tests de composition, écran de fin et mise à jour des fiches PRO/FUT-C/SYN-03/END.

## Phase 2 livrée

FUT-C contient trois questions avec trois options chacune ; les quatre fins et neuf engagements sont dans [`game/endings/content.json`](../../game/endings/content.json). Voir le [guide des fins](../../game/endings/README.md) pour les fichiers à modifier ensemble.

L’écran END s’ouvre après SYN-03, affiche les engagements ordonnés, une frise sourcée, le bilan et une contribution privée locale (500 caractères). Export texte du souvenir et retour au carnet/accueil disponibles. Le chronomètre reste à faire ; le bilan l’annonce sans inventer de durée. Le noyau de choix et de calcul des fins n’est pas modifié par ce lot.
