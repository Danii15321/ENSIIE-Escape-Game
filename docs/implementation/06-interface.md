# 06 — Interface commune et direction artistique

**État :** cartes communes, focus d’ouverture/retour et contrôles responsive livrés en phase 1 ; recette humaine et contrastes à compléter. **Propriétaire suggéré :** B. **Dépendance :** contrats des composants.

## Direction

Le README définit un carnet d’archives scientifique, avec fond ardoise et accents ambre/cyan/lavande. Le thème initial reprend ces couleurs et la police système. Garder les textes lisibles ; le glitch n’est jamais une condition de résolution.

## Fichiers

`src/presentation/theme/`, `src/presentation/components/`, `src/presentation/widgets/`. L’assemblage application et ses adaptateurs restent dans `src/app/`.

## Étapes

1. Tester 360, 390, 768 et 1280 px ; réduire les colonnes plutôt que les tailles de contrôle.
2. Ajouter une navigation au dossier ouvert qui place le focus sur son titre ; garder le retour à la carte explicite.
3. Extraire des tokens plus détaillés si plusieurs composants en ont besoin : espacements, rayons, styles de badge et états.
4. Remplacer les supports bruts par des cartes sans déplacer les actions au fil des dialogues.
5. Compléter le lecteur de documents et les fragments en privilégiant les textes pédagogiques aux objets JSON dans la vue joueur.
6. Ajouter les variantes d’avatar et les transitions après stabilisation du parcours ; honorer la réduction des animations.
7. Ajouter le son seulement comme option, avec réglage et équivalent visuel.

## Recette

- [ ] Les actions principales sont utilisables avec Tab, Entrée et Espace.
- [ ] Les contrôles disposent d’un nom accessible et d’un focus visible.
- [ ] Aucun contrôle tactile utile inférieur à 44 px ; aucun glisser-déposer obligatoire.
- [ ] Les erreurs sont textuelles, annoncées une seule fois et proches de l’étape.
- [ ] Les documents sont lisibles sans réseau après la préparation future du cache.
- [ ] Les couleurs réellement assemblées sont mesurées ; le statut ne dépend jamais seulement de la couleur.
- [ ] Une personne extérieure comprend ce qui est fiction, source ou reconstitution.

**Livrables :** thème consolidé, composants communs et relevé de recette mobile/clavier. Éviter des CSS propres à chaque mission.

## Relevé phase 1

Les changements UI sont limités à `theme/`, `components/` et `src/app/App.tsx`. Les widgets restent inchangés. Voir [les composants et la recette détaillée](PHASE-1-TEAMMATE.md).

| Largeur du viewport | EXT-EST, formulaire et documents ouverts |
|---|---|
| 360 px | Pas de débordement horizontal ; boutons ≥ 44 px |
| 390 px | Pas de débordement horizontal ; boutons ≥ 44 px |
| 768 px | Pas de débordement horizontal ; boutons ≥ 44 px |
| 1280 px | Pas de débordement horizontal ; boutons ≥ 44 px |

Le titre reçoit le focus à l’ouverture ; une saisie ne le déplace pas. Les cartes de campagne rendent leur état en texte et désactivent les dossiers verrouillés. Les vérifications automatisées ne remplacent pas une recette au lecteur d’écran ni les essais humains prévus ci-dessus.
