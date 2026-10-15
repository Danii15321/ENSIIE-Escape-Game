# PAS-02 — Le nom perdu : fiche de réalisation

**Statut :** prototype révision 3, dialogues et profil réel intégrés ; recette humaine à faire. **Responsable :** à attribuer. **Relecteur :** autre membre du binôme.

Cette fiche reprend la conception du README au 15 octobre 2026. Les textes et solutions ci-dessous sont la référence éditoriale du niveau ; `level.json` est sa version exécutée. Lors d’un changement de design, mettre à jour ces deux fichiers et signaler toute divergence avec le [README principal](../../../README.md). La fiche n’est pas chargée par le jeu.

## Livraison phase 1 — contenu et interface

Les répliques sont intégrées dans `level.json` et dans le fichier optionnel `presentation.json` (retours d’erreur contextualisés). Voir le [bilan de phase 1](../../../docs/implementation/PHASE-1-TEAMMATE.md) pour le format et la recette. La présence des répliques originales est vérifiée par les tests ; les cases de recette humaine restent à réaliser.

P2.GO est intégrée dans `realText` du nœud P2.DEMO et utilise le profil Évry 2026. Les cartes DEMO conservent leur propre réplique. Voir la [fiche Évry 2026](../../sites/evry-2026/README.md).

## Périmètre et autonomie

- Modifier `game/levels/pas-02/` : contenu, dialogues, règles déclaratives, fixtures, critères et ressources.
- Prévisualiser avec `npm run dev`, puis `http://localhost:5173/?level=pas-02`.
- L’atelier injecte les entrées simulées de `fixtures.json`. Il ne modifie jamais la sauvegarde de campagne.
- Prérequis dans la vraie campagne : **PRO-00**. Points attribués : **10**.
- Ne pas importer un niveau voisin. Ne pas modifier les contrats, les widgets communs ou les bindings de campagne en parallèle sans convenir d’un propriétaire temporaire.
- Briques : ObservationCard DEMO et validation César disponibles. Roue graphique et profil réel à ajouter.

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
| `name` | `NomHistorique` | IIE : Institut d’informatique d’entreprise. |

Le moteur attribue les sorties après la réussite de **toutes** les étapes. Le widget ne donne jamais de points. Le schéma 1 sait produire des sorties statiques ; les sorties calculées depuis le site nécessitent le chantier commun 03/05 avant activation du niveau concerné.

## Travail restant dans l’ordre

1. Créer CaesarWheel comme présentation commune avec une alternative clavier, sans changer la validation.
2. Raccorder le profil réel seulement après le chantier 05-terrain ; ne pas réutiliser les valeurs DEMO comme observations réelles.
3. Ajouter le secours terrain et sa provenance dans la session ; la résolution accompagnée globale existe déjà.
4. Intégrer toutes les répliques P2 et vérifier les décalages 1 à 9.

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
- [ ] `npm run check:content -- pas-02` puis `npm run check` passent.
- [ ] Une autre personne joue la prévisualisation sans explication orale du concepteur.
- [ ] Le statut passe de `draft` à `prototype`, puis à `ready` après recette et dialogues complets. Augmenter `revision` si le contenu joué change.

## Conception, supports, dialogues et solutions

### PAS-02 — Le nom perdu

**Type :** terrain et César. **Accès :** acte I ouvert, indépendamment de PAS-01. **Source historique :** S05, S08. Le chiffrement est une invention du jeu.

#### Support et terrain

ARIIE donne la destination O1 du profil de site, avec question et photo de repérage. La réponse est un entier de 1 à 9. Le profil DEMO affiche seulement une carte fictive portant **3**.

Une note de méthode explique : « Pour stocker ce document, chaque lettre a été avancée de O1 positions dans l’alphabet A à Z. Z revient à A. Les espaces sont conservés. Pour lire le document, il faut revenir en arrière du même nombre de positions. »

Une roue alphabétique ou deux lignes d’alphabet permettent de manipuler le décalage. En DEMO, le texte chiffré exact est :

**LQVWLWXW LQIRUPDWLTXH HQWUHSULVH**

Le texte contient les trois mots importants du nom, sans articles ni prépositions. Il ne prétend pas être la transcription d’une lettre historique.

#### Consigne

« Relevez la valeur du repère indiqué. Réglez le décalage de lecture, déchiffrez les trois mots, puis formez le sigle avec leurs initiales. Validez le repère, le texte et le sigle. »

#### Solution

DEMO : O1 = **3**, déchiffrement par recul de trois lettres. Résultat : **INSTITUT INFORMATIQUE ENTREPRISE** ; initiales **IIE**. Le nom développé est ensuite présenté correctement : Institut d’informatique d’entreprise.

La validation demande le bon relevé, le décalage appliqué dans le bon sens et le sigle. Deviner IIE ne suffit pas à restaurer le texte. Pour un profil réel, le texte chiffré est préparé à partir du même texte clair et de son O1 vérifié ; il n’est pas conservé arbitrairement à +3.

#### Dialogues

| ID | Déclencheur | Texte |
|---|---|---|
| P2.ENTER | Ouverture | « Trois mots se sont décalés dans mon alphabet. La clé de lecture a été associée à un repère que vous pouvez encore observer. » |
| P2.GO | Terrain réel | « Rendez-vous dans {O1.lieu}. {O1.direction} Relevez ceci : {O1.question} Vous pouvez revenir à la mission sans perdre votre progression. » |
| P2.DEMO | Terrain simulé | « Nous sommes en démonstration : la carte fictive remplace l’observation. Elle ne décrit pas les locaux réels. » |
| P2.Q | Choix | « Explique le chiffrement. » → P2.A ; « Nous allons observer. » → terrain |
| P2.A | Explication | « Une lettre avance toujours du même nombre de positions. Pour déchiffrer, faites le trajet inverse. Les espaces ne changent pas. » Puis puzzle. |
| P2.OBSERROR | Relevé incorrect | « Ce relevé ne correspond pas au repère enregistré. Vérifiez le périmètre ou utilisez le secours textuel si le lieu est inaccessible. » |
| P2.ERROR | Déchiffrement incorrect | « Le sigle seul ne répare pas la page. Vérifiez le sens de rotation et les trois mots obtenus. » |
| P2.H1 | Indice 1 | « La valeur observée sert à déplacer l’alphabet, pas à compter les mots. » |
| P2.H2 | Indice 2 | « Le stockage a avancé les lettres. La lecture doit les faire reculer. » |
| P2.H3 | Indice 3 | « Avec le décalage observé, le premier mot devient INSTITUT. Les deux autres sont INFORMATIQUE et ENTREPRISE. Prenez les initiales. » |
| P2.OK | Réussite | « IIE. Mon ancien nom tient dans trois lettres, mais vous avez restauré les mots qui leur donnent un sens. » |
| P2.EXIT | Après capsule | « Je conserve le sigle et la page déchiffrée. Ma machine saura maintenant quelle archive chercher. » |

**K-P2 :** « L’ancienne école portait le nom d’Institut d’informatique d’entreprise. Le sigle IIE a été conservé dans ENSIIE. » **Récompense :** fragment IIE et texte restitué. **Reprise :** relevé et réglage conservés. **Secours terrain :** photo ou valeur vérifiée, jamais une valeur improvisée.

## Journal de décision

| Date | Décision | Auteur / relecture |
|---|---|---|
| 2026-10-15 | Contrats et dossier isolé créés ; statut ci-dessus | Socle initial |

| 2026-10-15 | Phase 1 : textes intégraux et retours contextualisés, révision 2 ; adaptations ci-dessus | Lot contenu/interface, relecture humaine à faire |

## Intégration terrain Évry 2026

Révision 3 : profil réel activé avec trajets et secours textuel persisté. O1 = 2 (baby-foot du foyer), O2 = 3 (salles de TP du premier étage). La réplique `realText` remplace celle de simulation uniquement sur un site réel. Les photos restent à ajouter. Prévisualiser avec `?level=pas-02&site=evry-2026` ; les variantes de recette utilisent les valeurs du profil réel.
