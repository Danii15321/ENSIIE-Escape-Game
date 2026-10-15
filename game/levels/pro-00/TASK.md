# PRO-00 — Le Signal : fiche de réalisation

**Statut :** prototype révision 2, dialogues intégrés ; recette humaine à faire. **Responsable :** à attribuer. **Relecteur :** autre membre du binôme.

Cette fiche reprend la conception du README au 15 octobre 2026. Les textes et solutions ci-dessous sont la référence éditoriale du niveau ; `level.json` est sa version exécutée. Lors d’un changement de design, mettre à jour ces deux fichiers et signaler toute divergence avec le [README principal](../../../README.md). La fiche n’est pas chargée par le jeu.

## Livraison phase 1 — contenu et interface

Les répliques sont intégrées dans `level.json` et dans le fichier optionnel `presentation.json` (retours d’erreur contextualisés). Voir le [bilan de phase 1](../../../docs/implementation/PHASE-1-TEAMMATE.md) pour le format et la recette. La présence des répliques originales est vérifiée par les tests ; les cases de recette humaine restent à réaliser.

Le bouton de PRO.03 conserve le nom courant de l’équipe. La saisie d’un autre nom attend une commande moteur dédiée.

## Périmètre et autonomie

- Modifier `game/levels/pro-00/` : contenu, dialogues, règles déclaratives, fixtures, critères et ressources.
- Prévisualiser avec `npm run dev`, puis `http://localhost:5173/?level=pro-00`.
- L’atelier injecte les entrées simulées de `fixtures.json`. Il ne modifie jamais la sauvegarde de campagne.
- Prérequis dans la vraie campagne : **Aucun**. Points attribués : **0**.
- Ne pas importer un niveau voisin. Ne pas modifier les contrats, les widgets communs ou les bindings de campagne en parallèle sans convenir d’un propriétaire temporaire.
- Briques : Aucune brique bloquante. Dialogue linéaire et choix de retour déjà disponibles.

## Fichiers à prendre en charge

| Fichier | Travail attendu |
|---|---|
| `level.json` | Supports, graphe de dialogue, trois indices pour les puzzles, étapes, validation et sorties |
| `fixtures.json` | Fragments simulés typés pour jouer sans les autres niveaux |
| `acceptance.json` | Une réponse complète par étape, site de référence, cas de recette |
| `TASK.md` | Suivi de cette fiche, décisions et changements de design |
| `assets/README.md` | Inventaire des médias locaux, droits et alternatives ; pas de dépendance obligatoire à une page externe |

## Contrats à respecter

### Entrées

| Port | Type | Origine pendant le développement |
|---|---|---|
| Aucun | — | Niveau indépendant des fragments précédents |

### Sorties

| Port | Type | Preuve conservée |
|---|---|---|
| Aucun | — | Aucune récompense de fragment |

Le moteur attribue les sorties après la réussite de **toutes** les étapes. Le widget ne donne jamais de points. Le schéma 1 sait produire des sorties statiques ; les sorties calculées depuis le site nécessitent le chantier commun 03/05 avant activation du niveau concerné.

## Travail restant dans l’ordre

1. Intégrer les répliques PRO.01 à PRO.NEXT sans supprimer les branches secondaires.
2. Ajouter le nom d’équipe dans l’accueil via une commande dédiée, limité à 24 caractères.
3. Afficher les six lettres encadrées avec du balisage accessible ; le texte brut est provisoire.

## Recette à cocher

- [ ] Chaque consigne et chaque document nécessaire est lisible dans le niveau.
- [ ] Les dialogues d’entrée, de question, d’erreur, d’indice, de réussite et de retour ci-dessous sont intégrés, ou une simplification est explicitement acceptée dans cette fiche.
- [ ] La solution nominale passe ; une réponse fausse et une réponse proche ne terminent pas le niveau.
- [ ] Les preuves et sous-objectifs sont exigés, pas seulement le mot de sortie.
- [ ] Une interruption après saisie conserve le brouillon et les étapes validées en campagne.
- [ ] Les indices et l’aide complète permettent de reprendre sans retirer de points (sauf Conseil narratif : aucune bonne/mauvaise réponse).
- [ ] Les références documentaires sont enregistrées dans le registre partagé et leur identifiant existe.
- [ ] Le niveau fonctionne au clavier et sans glisser-déposer ; aucun sens transmis seulement par la couleur.
- [ ] Les variantes de site utiles sont testées, sans déclarer les repères fictifs réels.
- [ ] Une seconde validation ne duplique ni récompense ni points.
- [ ] `npm run check:content -- pro-00` puis `npm run check` passent.
- [ ] Une autre personne joue la prévisualisation sans explication orale du concepteur.
- [ ] Le statut passe de `draft` à `prototype`, puis à `ready` après recette et dialogues complets. Augmenter `revision` si le contenu joué change.

## Conception, supports, dialogues et solutions

### PRO-00 — Le Signal

**But :** lire un indice, saisir une réponse, comprendre la fiction. Réponse : `ENSIIE`.

Les identifiants de réplique servent à l’écriture, pas à l’interface. Une question secondaire revient au choix indiqué ; les textes entre guillemets sont prêts à intégrer.

| ID | Voix ou choix | Texte et suite |
|---|---|---|
| PRO.01 | ARIIE | « Signal reçu. Année de votre terminal : 2026. Année de mon archive : 2068. Ce décalage est… plus important que prévu. » |
| PRO.02 | ARIIE | « Je suis ARIIE, l’Archive Intelligente de l’IIE. Je dois ouvrir une capsule de mémoire. Mais mes souvenirs ont mélangé les époques. » |
| PRO.Q | Choix | « Qui t’a créée ? » → PRO.A1 ; « Pourquoi nous ? » → PRO.A2 ; « Comment t’aider ? » → PRO.03 |
| PRO.A1 | ARIIE | « Dans cette histoire, je conserve la mémoire de l’école. Mon existence et la capsule sont fictives ; les documents historiques sont sourcés. » Retour PRO.Q. |
| PRO.A2 | ARIIE | « Vous êtes dans les locaux que je ne peux plus observer. Vous pouvez vérifier ce que je raconte. C’est exactement la compétence qui me manque. » Retour PRO.Q. |
| PRO.03 | ARIIE | « Choisissez un nom d’équipe, ou gardez Équipe Chrono. » |
| PRO.04 | ARIIE | « Merci, {equipe}. Je peux me tromper dans mes souvenirs. Mes consignes et mes indices resteront fiables. Si une affirmation vous paraît douteuse, cherchez une preuve. » |
| PRO.05 | ARIIE | « Pour rétablir le canal, recopiez les six lettres encadrées ci-dessous. Elles restent visibles : aucune vitesse particulière n’est nécessaire. » |

**Support :** `[E]nquête [N]umérique — [S]ouvenirs [I]ncomplets, [I]dentité [E]ffacée.` Les crochets deviennent des cadres fixes.

**Consigne :** « Lisez les lettres encadrées de gauche à droite et saisissez le nom obtenu. »

| Situation | Réplique |
|---|---|
| Erreur | « Regardez seulement les lettres encadrées. Leur ordre est celui de la lecture. » |
| Indice 1 | « Les autres lettres servent à former la phrase. » |
| Indice 2 | « Le résultat commence par E, N, S. » |
| Indice 3 | « Ajoutez I, I, E : vous avez les six lettres. » |
| PRO.OK | « ENSIIE. Canal restauré. Le nom complet est École nationale supérieure d’informatique pour l’industrie et l’entreprise. » |
| PRO.NEXT | « Nous allons commencer avant ce nom. Trois dossiers vous attendent. Choisissez leur ordre ; nous aurons besoin des trois pour redémarrer ma machine temporelle. » |

**Capsule K-PRO :** « Le nom ENSIIE reprend les lettres IIE de l’ancien nom. Le parcours va relier ces deux identités. » Sources S04, S08. Action : **Ouvrir le passé**.

## Journal de décision

| Date | Décision | Auteur / relecture |
|---|---|---|
| 2026-10-15 | Contrats et dossier isolé créés ; statut ci-dessus | Socle initial |

| 2026-10-15 | Phase 1 : textes intégraux et retours contextualisés, révision 2 ; adaptations ci-dessus | Lot contenu/interface, relecture humaine à faire |
