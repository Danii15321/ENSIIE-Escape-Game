# Phase 2 — Conseil et capsule finale

Livraison du 15 octobre 2026. Périmètre de la colonne Teammate : FUT-C et END. Le calcul existant `ending`/`outcome`, les contrats du moteur, les widgets de choix et les profils de site ne sont pas modifiés. Le cache hors ligne reste dans le chantier 07.

## Ce qui est jouable

FUT-C est un prototype narratif, révision 2, accessible après SYN-02. Ses trois questions possèdent chacune trois options. Les neuf répliques de Nora et les neuf engagements reprennent la fiche de conception. Chaque réponse est remplaçable ou retirable jusqu’au final. Le Conseil reste facultatif, sans bonne/mauvaise réponse, indice, point ou fragment.

END s’ouvre après le final configuré dans la campagne, réussi ou accompagné, et lors de la reprise d’une partie terminée. Les choix sont alors figés par le moteur existant. La fin contient l’ouverture commune, l’une des quatre variantes, les engagements effectivement choisis dans l’ordre C1–C3, la frise sourcée, le bilan et la contribution facultative.

## Fichiers et responsabilités

| Fichier | Responsabilité |
|---|---|
| `game/levels/fut-c/level.json` | Trois questions, neuf options, réponses immédiates et engagements ; graphe C.ENTER/C.SKIP |
| `game/endings/content.json` | Quatre fins, neuf engagements, ouverture/clôture, frise et libellés |
| `src/app/endingContent.ts` | Validation des données et cohérence avec les neuf options du Conseil |
| `src/app/endings.ts` | Composition depuis la session et le résultat du moteur ; texte du souvenir |
| `src/presentation/components/EndingView.tsx` | Présentation des données et formulaire privé, sans accès au stockage |
| `src/app/EndingPanel.tsx` | Assemblage des actions de navigation, stockage et téléchargement |
| `src/adapters/storage/capsule.ts` | Lecture/écriture/retrait du message privé, séparé par partie |
| `scripts/check-content.ts` | Vérification des fins lors du contrôle général de contenu |

Modifier un engagement impose de mettre à jour le Conseil et le catalogue des fins ensemble. Les tests refusent une divergence. Les dates historiques et les sources restent des données séparées de la fiction de 2068.

## Contribution et export

Le message est limité à 500 caractères et conservé seulement après action explicite sur le bouton. Aucun appel réseau n’est utilisé. La clé locale est `chrono-iie:capsule:v1:<sessionId>`. Une partie différente ne récupère pas le message de la précédente. « Ne rien ajouter » le retire pour la partie courante. En cas d’échec de stockage, l’écran annonce l’échec et conserve le brouillon affiché.

L’export « souvenir » est un fichier texte local. Il comprend l’équipe, la variante, les engagements, les repères historiques, le bilan et la contribution déjà conservée. L’export JSON de progression ne contient pas ce message privé. Un brouillon non conservé ne figure pas dans le souvenir.

## Vérifications effectuées

- `npm run check` : **107 tests**, frontières, contenu (13 prototypes, aucun draft) et build réussis.
- `npm run format:check` et `git diff --check` réussis.
- Quatre fins, absence, égalité et choix partiels ; les **64 combinaisons** possibles des trois questions (trois options ou aucune) sont couvertes.
- Remplacement/retrait des choix, reprise, final accompagné, gel, absence de blocage quand le Conseil est ignoré.
- Conservation/reprise/retrait du message, limite de 500 caractères, échappement du texte, panne de stockage et export du message conservé.
- Navigateur : import d’une partie de recette sur `localhost:4173`, fin Partage avec engagements C1–C3, conservation après rechargement et téléchargement du souvenir vérifiés. Les sauvegardes de développement sur `localhost:5173` restent distinctes de cette recette.
- Conseil et END testés aux viewports **360 / 390 / 768 / 1280 px** : pas de débordement horizontal ; boutons et cibles des options d’au moins 44 px.
- Le test UI existant du mur de mots dépasse parfois cinq secondes quand toutes les suites tournent ensemble : son délai est passé à 15 secondes, sans retirer d’assertion.

## Limites et suite

La durée active n’est pas encore mesurée ; le bilan l’indique. Les photos de terrain, la recette humaine indépendante et le cache hors ligne restent dans les chantiers prévus. Tous les niveaux sont désormais exécutables en prototype, ce qui ne remplace pas leur recette humaine.

Pour retravailler le Conseil : `/?level=fut-c`. Pour voir une fin en campagne : terminer SYN-03 ; deux réponses d’un même thème donnent sa variante, trois thèmes différents ou aucune réponse donnent Horizon commun. Le [guide des fins](../../game/endings/README.md) décrit les modifications éditoriales.

## Synchronisation avec la colonne noyau

Le commit `c2df892` du mode hors ligne est fusionné avec le lot Teammate. Les imports d’App et le tableau de suivi ont été réunis en conservant les deux fonctions. Le panneau hors ligne reste indépendant de la contribution privée et de la progression. Les résultats des 107 tests ci-dessus décrivent le lot Teammate avant cette fusion ; la recette intégrée est relancée après fusion.

Recette après fusion : **125 tests passent sur 19 fichiers**, contenu, frontières, build avec manifeste hors ligne, formatage et diff contrôlés. La concurrence Vitest est limitée à quatre processus pour éviter la saturation pendant les parcours UI complets ; aucune assertion métier n’est retirée. La validation en HTTPS final reste celle du chantier 07.
