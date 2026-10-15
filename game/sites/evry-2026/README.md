# Évry 2026 — observations réelles O1 et O2

**État au 15 octobre 2026 : observations communiquées par le porteur du projet, textes prêts pour intégration.** Les valeurs, lieux et trajets ci-dessous proviennent de son message ; ils ne sont pas issus d’une visite effectuée par l’agent. Les deux zones sont indiquées comme toujours accessibles. Les photos seront ajoutées plus tard par le porteur du projet.

Aucun `site.json` réel n’est encore activé : le branchement des lieux, itinéraires et secours attend le chantier terrain commun. Les profils DEMO restent distincts et conservent leurs valeurs fictives.

## Synthèse pour le binôme

| Repère | Observation à l’ENSIIE en 2026 | Réponse | Effet dans le jeu |
|---|---|---|---|
| O1 | Nombre de baby-foot dans le foyer | **2** | Chiffrement César +2 ; déchiffrement −2 dans PAS-02 |
| O2 | Nombre de salles de TP au premier étage | **3** | Nombre impair ; lecture inverse dans SYN-02, après PRE-02 |

Référence temporelle : **2026**. Ne pas remplacer ce millésime par une mention dynamique « aujourd’hui » qui deviendrait fausse lors d’une utilisation ultérieure. La date exacte du comptage n’a pas été précisée ; le témoignage est reçu le 15 octobre 2026.

## O1 — les baby-foot du foyer

| Champ | Donnée retenue |
|---|---|
| Lieu | Foyer de l’ENSIIE |
| Repère et périmètre | Tous les baby-foot présents dans le foyer ; compter les tables, pas les joueurs ni les barres |
| Question joueur | « En 2026, combien de baby-foot se trouvent dans le foyer de l’ENSIIE ? » |
| Réponse attendue | **2** |
| Trajet depuis l’entrée | « Entrez dans l’école, tournez à droite et rejoignez le foyer. » |
| Accès | Toujours accessible, selon le porteur du projet |
| Source | Information donnée par le porteur du projet le 15 octobre 2026 |
| Photo | À ajouter plus tard ; aucun fichier ni droit de diffusion reçu pour le moment |
| Secours textuel | [Fiche de secours O1](secours.md#o1--foyer) : valeur communiquée **2** |

### Réplique prête pour PAS-02

**P2.GO, variante Évry 2026 :** « Rendez-vous dans le foyer de l’ENSIIE. Entrez dans l’école, tournez à droite et rejoignez le foyer. Relevez ceci : en 2026, combien de baby-foot se trouvent dans le foyer ? Vous pouvez revenir à la mission sans perdre votre progression. »

Cette réplique doit être activée uniquement pour le profil réel, jamais sur les cartes DEMO. La réponse n’est pas affichée dans la consigne de recherche.

### Support chiffré à préparer

Texte clair : `INSTITUT INFORMATIQUE ENTREPRISE`.

Avec O1 = **2**, avancer chaque lettre de deux positions donne :

```text
KPUVKVWV KPHQTOCVKSWG GPVTGRTKUG
```

Le joueur relève **2**, recule de deux lettres et retrouve le texte clair, puis le sigle **IIE**. L’aller-retour du chiffrement a été vérifié. Ne pas réutiliser le texte chiffré du profil DEMO à +3.

## O2 — les salles de TP du premier étage

| Champ | Donnée retenue |
|---|---|
| Lieu | Premier étage de l’ENSIIE |
| Repère et périmètre | Les salles de travaux pratiques du premier étage ; ne pas compter les autres types de salles |
| Question joueur | « En 2026, combien de salles de TP se trouvent au premier étage de l’ENSIIE ? » |
| Réponse attendue | **3** |
| Parité | **Impair** |
| Trajet depuis l’entrée | « Entrez dans l’école et rejoignez le premier étage. » |
| Accès | Toujours accessible, selon le porteur du projet |
| Source | Information donnée par le porteur du projet le 15 octobre 2026 |
| Photo | À ajouter plus tard ; aucun fichier ni droit de diffusion reçu pour le moment |
| Secours textuel | [Fiche de secours O2](secours.md#o2--premier-etage) : valeur communiquée **3** |

La position de l’escalier ou de l’ascenseur, les numéros de salles et leurs panneaux ne sont pas fournis : ne pas les inventer. Lors de l’ajout des photos, préciser si besoin comment un visiteur reconnaît une salle de TP. Le trajet direct du foyer au premier étage n’a pas été décrit ; les consignes fournies prennent l’entrée de l’école comme point de départ.

### Réplique prête pour PRE-02

**R2.GO, variante Évry 2026 :** « Destination : le premier étage de l’ENSIIE. Depuis l’entrée de l’école, rejoignez le premier étage. Relevez : en 2026, combien de salles de TP se trouvent à cet étage ? »

Après le relevé, demander si le nombre est pair ou impair. **3 est impair** : le fragment OrientationLecture doit porter `observed: 3` et `direction: reverse`.

### Conséquence pour SYN-02

La lecture est **du bas vers le haut et de droite à gauche**. Dans les sept positions résiduelles du mur, listées dans l’ordre normal, préparer **E, L, U, S, P, A, C**. La lecture inverse restitue **CAPSULE**. Les mots à retrouver restent inchangés. La grille et le fragment doivent être préparés ensemble ; inverser seulement le sens de lecture de la grille DEMO pair donnerait le mauvais résultat.

## Accès et secours

Les deux lieux sont **toujours accessibles selon le porteur du projet** : aucun scénario habituel de fermeture n’est annoncé. Une [fiche textuelle de secours](secours.md) est néanmoins prête pour un empêchement exceptionnel ou une partie à distance, sans attendre les photos. Elle donne explicitement les valeurs du témoignage ; elle n’est pas présentée comme une observation faite par le joueur.

L’interface devra proposer ce secours sur demande et conserver les mêmes valeurs **2 et 3**, sans pénalité. L’enregistrement de son usage dans la session relève du chantier 05 et reste à implémenter. Les durées de marche et l’itinéraire sans escalier n’ont pas été précisés ; « toujours accessible » décrit ici l’accès déclaré, pas une vérification d’accessibilité motrice.

## Photos à ajouter plus tard

Déposer les fichiers dans `assets/`, puis compléter le [registre des médias](assets/README.md). Pour O1, privilégier une vue permettant de compter les deux baby-foot. Pour O2, une vue d’ensemble ou plusieurs vues légendées doivent permettre d’identifier les trois salles de TP sans compter deux fois la même salle.

Le texte alternatif sera rédigé d’après les photos effectivement reçues. Les questions, réponses et supports textuels sont déjà disponibles pour travailler avant leur ajout.

## État d’intégration

- [x] Valeurs O1 = 2 et O2 = 3 reçues du porteur du projet.
- [x] Deux lieux distincts et trajets depuis l’entrée documentés.
- [x] Accès déclaré permanent aux deux lieux consigné.
- [x] Questions joueur et répliques de déplacement rédigées.
- [x] Chiffrement +2 et ordre inverse des sept lettres vérifiés.
- [x] Secours textuel préparé à partir des valeurs communiquées.
- [ ] Photos reçues, légendées et droits documentés (ajout ultérieur prévu).
- [ ] Recette par une seconde personne : repérage, comptage et compréhension des consignes.
- [ ] Schéma Site et interface enrichis pour les lieux, trajets et secours.
- [ ] PRE-02 produit l’orientation depuis O2 ; SYN-02 exploite la variante impaire.
- [ ] Profil réel versionné et activé après vérification du parcours et de la reprise.

Voir [le chantier terrain](../../../docs/implementation/05-terrain.md). Les informations du relevé sont désormais disponibles ; le travail restant porte sur leur intégration et la recette, ainsi que sur l’ajout différé des photos.
