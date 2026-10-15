> Archive de conception. Le [README consolidé de référence](../README.md) remplace cette proposition pour les décisions de game design et d’architecture.

# Préparer le prototype du hackathon

La première version doit permettre de jouer le parcours complet : six énigmes, leurs indices, leurs fragments et l’ouverture finale. Les documents fournissent la conception et les contenus ; la mise en page des supports, le logiciel et l’installation restent à réaliser.

## Périmètre conseillé

| Priorité | Élément | Critère de réalisation |
|---|---|---|
| Indispensable | Six étapes jouables | Tous les supports nécessaires sont disponibles, toutes les solutions sont acceptées |
| Indispensable | Parcours physique | Lieux repérés, déplacements testés, quatre balises d’observation installées |
| Indispensable | Indices et corrigés | L’animateur peut accompagner chaque étape sans improviser de règle |
| Indispensable | Progression et fragments | Une étape résolue donne son fragment et débloque la suivante |
| Indispensable | Final | La capsule s’ouvre après les six étapes, avec un message de conclusion |
| Indispensable | Crédits | Sources institutionnelles et archives accessibles, fiction identifiée |
| Souhaitable | Interface mobile | Grandes commandes, texte lisible, réponses simples, navigation claire |
| Souhaitable | Sauvegarde locale | Recharger ne fait pas perdre une partie ; remise à zéro volontaire |
| Souhaitable | QR et code de secours | Chaque QR possède aussi un repère tapable ou un accès manuel |
| Bonus | Énigme de Chamarande | Défi optionnel sans dépendance avec le parcours principal |
| Bonus | Habillage sonore et animation | Compréhension et progression restent possibles sans son |
| Ultérieur | Réalité augmentée, parcours à branches | Seulement après un parcours complet testé |

Pour une démonstration rapide, préparer un parcours guidé d’environ 7 minutes : introduction, exemple de classement E1, observation d’une balise E4, essai de sélection E5, aperçu E6 et ouverture finale. Les étapes sautées portent la mention « démonstration ». Cette présentation ne remplace pas un essai de la partie complète.

## Structure fonctionnelle du futur logiciel

Une petite application web à contenu local suffit. Éviter que la progression dépende d’un réseau social, d’une vidéo ou d’une archive externe. Les liens documentaires peuvent être consultés après la résolution.

| État ou action | Comportement attendu |
|---|---|
| Nouvelle partie | E1 ouverte, carnet vide, horloge démarrée si utilisée |
| Réponse correcte | Mémoriser la réussite, afficher le débrief et le fragment, ouvrir l’étape suivante |
| Réponse incorrecte | Expliquer ce qui peut être corrigé, garder la progression |
| Demande d’indice | Révéler le niveau suivant ; ne pas retirer de fragment |
| Retour à une étape résolue | Permettre la consultation, sans attribuer un second fragment |
| Rechargement | Restaurer les étapes et indices déjà consultés sur cet appareil |
| Code de lieu saisi | Ouvrir le support correspondant si l’étape est disponible ; ne pas valider sa solution |
| Fin de parcours | Exiger les six étapes avant la validation du mot final |

Les QR servent à rejoindre une page ou un support ; ils ne prouvent pas une présence physique. Le déplacement et l’observation sont portés par l’installation et les consignes. Une application sans serveur est adaptée à une découverte sans classement compétitif ; les réponses présentes dans son code ne seraient pas protégées contre un joueur qui les inspecte.

Si une caméra est intégrée, le sujet recommande HTTPS et un code court de secours. Un QR lu avec l’appareil photo habituel du téléphone et ouvrant un lien peut suffire ; un scanner intégré n’est pas nécessaire à la première version. [Sujet officiel](https://hackathon.ensiie.fr/escape-game/)

## Préparation matérielle

| Lot | Contenu |
|---|---|
| Accueil et conclusion | Une fiche d’introduction, une boîte ou capsule, un plateau de final, une carte d’idée d’avenir |
| E1 | Quatre cartes d’événements et quatre notices, une enveloppe |
| E2 | Trois pièces documentaires ; calendrier en aide facultative |
| E3 | Quatre fiches de compétences, quatre missions, un rail avec quatre positions |
| E4 | Quatre panneaux A4 avec les formes et libellés BALISE / INVENTAIRE ; un exemplaire de secours |
| E5 | Six cartes de projets, huit jetons et une feuille de calcul |
| E6 | Une grille, un programme, un pion et une feuille de trace |
| Récompenses | Six cartes de fragments, préparées d’après le tableau de corrigés |
| Animation | Fiches de solutions, d’indices et feuille de suivi des équipes |
| Commun | Crayons, ruban de fixation autorisé, téléphone et chargeur |

Ne pas imprimer les deux fiches d’E6 au recto et au verso d’une même feuille : elles doivent être distribuées séparément. Ne pas imprimer le corrigé à la suite des supports joueurs dans le même livret. Conserver les fragments avec l’animateur ou les révéler après validation.

## Repérage à faire avec l’équipe

Ce sont des vérifications de terrain, pas des questions qui empêchent la conception documentaire.

1. Confirmer avec le référent les espaces accessibles et les endroits où fixer les panneaux.
2. Associer P0 à P4 aux lieux réels ; noter leurs noms, accès et temps de marche. La mention de C33 au sIIEnext dans le sujet ne fournit pas de plan intérieur.
3. Choisir au moins deux déplacements qui montrent des espaces distincts ; vérifier que la vie étudiante peut être présentée dans le lieu retenu.
4. Contrôler la visibilité des quatre panneaux d’E4, y compris sans différencier les couleurs.
5. Prévoir une solution accessible pour les escaliers éventuels, le déplacement et la lecture des petits caractères.
6. Faire le tour sans les concepteurs : les directions doivent être compréhensibles par une personne qui découvre l’école.

La conformité finale de l’implantation physique dépend de ce repérage. Les documents n’affirment pas que les panneaux ou les associations se trouvent déjà à des emplacements précis.

## Répartition possible du travail

Pour trois personnes : une personne réalise l’interface et la progression ; une prépare les supports et l’installation ; une s’occupe de l’intégration des contenus, de l’animation et des essais. À quatre ou cinq, séparer les essais et la direction visuelle. Toute l’équipe joue ensuite une partie complète.

Ordre conseillé pendant le temps disponible :

1. **Repérage et partie papier courte** : vérifier que les mécanismes sont compris avant de les intégrer.
2. **Parcours logiciel complet minimal** : enchaîner les étapes, accepter les solutions et atteindre le final.
3. **Supports et installation** : mettre en page, imprimer, placer les balises et ajouter les liens ou QR utiles.
4. **Essai avec une équipe extérieure** : noter les incompréhensions et corriger le vocabulaire ou les indices.
5. **Préparation de la présentation** : ouvrir la démonstration sur le matériel prévu et conserver une version papier.

Réserver le vendredi avant 15 h 30 pour stabiliser et préparer la présentation. Le programme officiel indique aussi une conférence jeudi à 16 h 30 ; tenir compte du temps effectivement disponible plutôt que prévoir un développement continu sur deux journées entières.

## Vérifications des énigmes

Les vérifications de conception effectuées le 15 octobre portent sur :

- E1 : quatre dates distinctes ; un ordre unique de cartes, donnant 7319.
- E2 : le premier jour du mois suivant la publication de juillet donne 01082006.
- E3 : les quatre définitions fournies déterminent les quatre associations attendues ; les recouvrements entre disciplines sont explicités.
- E4 : l’ordre d’activités et le libellé BALISE donnent 7294 ; aucun besoin de connaître les noms au préalable.
- E5 : énumération des vingt groupes de trois projets, puis application des cinq contraintes ; BCF est l’unique solution, avec les totaux 8, 4 et 9.
- E6 : simulation de chaque déplacement ; aucune sortie de grille, cinq arrivées donnant OUVRE.
- Final : les six fragments rangés donnent AVENIR.

Ces contrôles ne mesurent ni la difficulté perçue ni la durée réelle. Aucun essai avec des joueurs n’a encore été réalisé.

## Protocole d’essai avec des joueurs

Faire jouer au moins une équipe qui n’a pas lu les solutions. L’animateur observe d’abord sans reformuler les consignes ; sinon les défauts du support restent invisibles.

| Mesure | Ce qu’il faut noter | Ajustement possible |
|---|---|---|
| Durée par étape | Lecture, réflexion et déplacement séparément | Réduire le texte ou rapprocher les supports |
| Moment du premier blocage | Mot incompris, support manquant, mauvais ordre, règle cachée | Corriger la consigne ou le premier indice |
| Participation | Qui lit, manipule et explique ? | Distribuer autrement les informations |
| Qualité de la découverte | Un fait de l’école restitué après chaque chapitre | Améliorer le débrief ou le lien avec le lieu |
| Usage des indices | Niveau utilisé et effet réel | Réécrire un indice qui répète la consigne |
| Continuité | Retour arrière, rechargement, panneau absent, caméra indisponible | Ajouter les solutions de secours prévues |

Critères de sortie du prototype : une équipe peut finir sans que l’animateur invente une règle, chaque étape reste résoluble avec ses indices, les trois époques sont identifiables et le final fonctionne sur le matériel de présentation.

## Crédits et distinction entre faits et fiction

Reprendre les liens du registre documentaire dans une page « Sources ». Les textes pédagogiques sont reformulés. Les cartes, missions, grilles et données de simulation ont été conçues pour ce projet.

Le jeu doit signaler clairement que 2068, la capsule et ses projets sont imaginaires. Les éventuelles images ajoutées plus tard devront avoir leurs propres crédits et conditions de réutilisation vérifiés.
