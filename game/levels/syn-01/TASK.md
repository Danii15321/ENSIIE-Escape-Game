# SYN-01 — La machine temporelle : fiche de réalisation

**Statut :** prototype jouable à enrichir. **Responsable :** à attribuer. **Relecteur :** autre membre du binôme.

Cette fiche reprend la conception du README au 15 octobre 2026. Les textes et solutions ci-dessous sont la référence éditoriale du niveau ; `level.json` est sa version exécutée. Lors d’un changement de design, mettre à jour ces deux fichiers et signaler toute divergence avec le [README principal](../../../README.md). La fiche n’est pas chargée par le jeu.

## Périmètre et autonomie

- Modifier `game/levels/syn-01/` : contenu, dialogues, règles déclaratives, fixtures, critères et ressources.
- Prévisualiser avec `npm run dev`, puis `http://localhost:5173/?level=syn-01`.
- L’atelier injecte les entrées simulées de `fixtures.json`. Il ne modifie jamais la sauvegarde de campagne.
- Prérequis dans la vraie campagne : **PAS-01, PAS-02, PAS-03**. Points attribués : **10**.
- Ne pas importer un niveau voisin. Ne pas modifier les contrats, les widgets communs ou les bindings de campagne en parallèle sans convenir d’un propriétaire temporaire.
- Briques : Deux étapes persistées, formulaires et injections de fragments disponibles ; SlotBoard graphique facultatif.

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
| `origin` | `OrigineHistorique` | fixture locale ; binding de campagne |
| `name` | `NomHistorique` | fixture locale ; binding de campagne |
| `transition` | `TransitionInstitutionnelle` | fixture locale ; binding de campagne |

### Sorties

| Port | Type | Preuve conservée |
|---|---|---|
| `announcement` | `ArchiveAnnonce` | Une capture de décembre 2004 conserve l’annonce du 21 janvier 2005. |

Le moteur attribue les sorties après la réussite de **toutes** les étapes. Le widget ne donne jamais de points. Le schéma 1 sait produire des sorties statiques ; les sorties calculées depuis le site nécessitent le chantier commun 03/05 avant activation du niveau concerné.

## Travail restant dans l’ordre

1. Conserver la lecture de l’annonce derrière la validation de la calibration.
2. Améliorer le dépôt de fragments avec une vue SlotBoard commune ; les champs actuels restent une alternative accessible.
3. Afficher le domaine assemblé iie.cnam.fr et la date de capture sans prétendre reconstituer toute l’URL.
4. Ajouter les erreurs spécifiques 1712 et 2005 ainsi que les transitions S1.OPEN et S1.EXIT.

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
- [ ] `npm run check:content -- syn-01` puis `npm run check` passent.
- [ ] Une autre personne joue la prévisualisation sans explication orale du concepteur.
- [ ] Le statut passe de `draft` à `prototype`, puis à `ready` après recette et dialogues complets. Augmenter `revision` si le contenu joué change.

## Conception, supports, dialogues et solutions

### SYN-01 — La machine temporelle

**Type :** assemblage de fragments puis lecture d’archive. **Prérequis :** trois missions du passé réussies ou accompagnées. **Sources :** S03, S05, S16.

#### Écran et paramètres

La machine affiche quatre zones : **Origine**, **Adresse historique**, **Capture recherchée**, **Transition**. Les fragments apparaissent dans un tiroir toujours visible.

| Zone | Action et valeur correcte |
|---|---|
| Origine | Déposer le fragment 1968 |
| Adresse historique | Assembler IIE + CNAM avec le gabarit « nom.hôte.fr » : `iie.cnam.fr` |
| Capture recherchée | Convertir la date affichée sur la fiche « capture du 17/12/2004 » en `20041217` |
| Transition | Déposer la date 01/08/2006 |

Les sous-domaines historiques ne sont pas devinés par le joueur. La machine utilise une correspondance éditoriale vers la capture précise de S16 : `20041217012944` pour la page Événements de l’ancien site `www3.iie.cnam.fr`. Le cadran jour ne prétend pas déterminer à lui seul toute l’URL.

**Consigne 1 :** « Placez les fragments dans les quatre zones. Pour la capture, écrivez année, mois et jour : AAAAMMJJ. »

Une fois la machine calibrée, elle ouvre une **reconstitution locale lisible** de la page Événements. Un bouton séparé donne accès à la vraie archive si le réseau fonctionne. Le jeu ne dépend pas de son chargement.

#### Contenu intégral nécessaire de l’archive locale

**En-tête :** « Site de l’IIE — Événements. Capture conservée le 17 décembre 2004. »

**Annonce reformulée :** « La remise des diplômes de la promotion 2004 est annoncée pour le 21 janvier 2005 au château de Chamarande. »

**Note :** « La date de capture décrit la conservation de la page. La date de promotion désigne le groupe diplômé. La date de l’annonce désigne le rendez-vous prévu. » Cette note se trouve dans l’aide documentaire, visible sur demande ; le titre et l’annonce suffisent à résoudre.

**Consigne 2 :** « Retrouvez le jour et le mois du rendez-vous annoncé pour la promotion 2004. Saisissez-les au format JJMM et sélectionnez le lieu. » Choix de lieu : **Château de Chamarande**, **Paris**, **Évry**.

#### Solution

Clé **2101**, lieu **Château de Chamarande**, année du rendez-vous **2005**. L’année n’est pas saisie dans le cadenas JJMM mais apparaît dans le débrief. Le résultat prouve ce que la page annonçait, pas à lui seul que la cérémonie a eu lieu.

| ID | Déclencheur | Texte |
|---|---|---|
| S1.ENTER | Ouverture | « Nous avons une origine, un nom et une transition. Placez-les dans la machine. J’ai gardé l’étiquette de la capture ; elle nous permettra de retrouver une page précise. » |
| S1.SLOT | Assemblage erroné | « Au moins un fragment est dans la mauvaise zone. Une année d’origine n’est pas une date de capture. » |
| S1.DATE | Capture mal formatée | « Pour cette zone, la machine lit année, mois, jour. Le 17 décembre 2004 doit garder les quatre chiffres de l’année. » |
| S1.OPEN | Calibration réussie | « Destination retrouvée. Voici ce que le site annonçait à cette date. Cherchez le rendez-vous de la promotion 2004. » |
| S1.NEAR1 | 1712 | « Vous avez choisi la date de capture. Je cherche le rendez-vous annoncé dans la page. » |
| S1.NEAR2 | 2005 | « L’année convient au rendez-vous, mais le cadenas attend son jour et son mois. » |
| S1.ERROR | Autre erreur | « Relisez l’annonce : la promotion, la capture et le rendez-vous n’ont pas le même rôle. » |
| S1.H1 | Indice 1 | « Associez les étiquettes de la machine aux fragments, puis ouvrez la rubrique Événements. » |
| S1.H2 | Indice 2 | « La capture est en décembre 2004 ; le rendez-vous annoncé se déroule en janvier de l’année suivante. » |
| S1.H3 | Indice 3 | « L’annonce donne le 21 janvier 2005 au château de Chamarande. Le cadenas attend seulement JJMM. » |
| S1.OK | Réussite | « 2101. Le rendez-vous est retrouvé. Une archive peut conserver une annonce de demain au milieu des traces d’hier. » |
| S1.EXIT | Fin d’acte | « Le passé tient de nouveau debout. Regardons maintenant ce que l’école permet d’apprendre et de faire ensemble. » |

**K-S1 :** « Une capture de décembre 2004 conserve une annonce pour janvier 2005 concernant la promotion 2004. Lire une archive suppose de distinguer ces dates. » **Récompense :** clé 2101 et ouverture de l’acte II. Les saisies de calibration persistent si la lecture de la source externe interrompt la partie.

## Journal de décision

| Date | Décision | Auteur / relecture |
|---|---|---|
| 2026-10-15 | Contrats et dossier isolé créés ; statut ci-dessus | Socle initial |
