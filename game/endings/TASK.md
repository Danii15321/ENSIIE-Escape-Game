# END — La capsule ouverte

**Responsable :** lot Teammate. **Statut :** écran intégré ; recette humaine à faire.

## Périmètre

Cet écran consomme la réussite de SYN-03 et les choix facultatifs du Conseil. Aucun point supplémentaire, aucun blocage si le Conseil est ignoré. Créer un modèle de fin dans `game/endings/` et une vue commune ; l’ouverture dépend de `campaign.finalLevel`, jamais d’une saisie directe de 2068.

## Réalisation

1. Définir les quatre textes et neuf engagements comme données, en conservant les textes exacts ci-dessous.
2. Calculer le thème depuis la dernière réponse à chacune des trois questions ; majorité, sinon Horizon commun.
3. Présenter l’ouverture commune, la variante et les engagements dans l’ordre C1, C2, C3.
4. Ajouter la contribution privée facultative, conservée localement et jamais envoyée.
5. Afficher les savoirs retenus et permettre de consulter le carnet.
6. Figer les choix lorsque la capsule est ouverte ; prévoir une reprise après rechargement.

## Recette

- [x] Quatre fins accessibles ; égalité, zéro choix et choix partiels testés.
- [x] Changer une réponse la remplace sans accumuler de votes.
- [x] Ignorer FUT-C permet de terminer le jeu.
- [x] Aucune ouverture avant SYN-03 réussi ou accompagné.
- [x] Texte libre privé, correctement échappé par React et conservé après reprise.
- [x] Animation facultative et fin compréhensible sans son ni mouvement.

## Textes à intégrer

### Ouverture commune

**END.01 — ARIIE :** « 2068. Identité restaurée. Chronologie vérifiée. Transmission prête. »

Animation de deux secondes maximum, ou apparition immédiate si animations réduites.

**END.02 — Nora :** « Vous n’avez pas seulement retrouvé des réponses. Vous avez appris à relier des traces, à demander des preuves et à travailler avec les informations des autres. »

**END.03 — ARIIE :** « La capsule peut s’ouvrir. Voici l’avenir que votre équipe a choisi d’imaginer. »

### Les quatre variantes complètes

**Fin Lucidité — Une école qui explique**

Nora : « Dans votre projection de 2068, les systèmes numériques doivent rendre leurs sources, leurs limites et leurs décisions compréhensibles. Les élèves apprennent autant à interroger un résultat qu’à le produire. »

ARIIE : « Je conserverai aussi mes incertitudes. Une mémoire utile n’a pas besoin de prétendre tout savoir. »

**Fin Sobriété — Une école qui fait durer**

Nora : « Dans votre projection de 2068, on commence par examiner les besoins, les usages et les ressources disponibles. On entretient, on répare et on mesure pour choisir ce qui mérite d’être développé. »

ARIIE : « Je transmettrai les connaissances avec les moyens nécessaires, en laissant aux suivants de quoi faire durer le dispositif. »

**Fin Partage — Une école qui transmet**

Nora : « Dans votre projection de 2068, l’école relie les générations, les compétences et les manières d’apprendre. Les projets sont documentés pour que d’autres puissent les comprendre, les reprendre et les transformer. »

ARIIE : « Ma mémoire restera ouverte aux contributions. Aucun dossier ne remplacera la communauté qui le fait vivre. »

**Fin Horizon commun — Une école à construire ensemble**

Nora : « Votre équipe laisse plusieurs voies ouvertes. Comprendre, économiser les ressources et partager ne se résument pas à une seule priorité. L’avenir restera un travail de discussion et de choix. »

ARIIE : « Je conserverai vos questions avec vos réponses. Les prochaines générations auront leur mot à dire. »

### Composition exacte de l’écran final

Dans cet ordre : titre de la variante ; texte de Nora ; texte d’ARIIE ; engagements effectivement choisis au Conseil dans l’ordre C1–C3 ; frise réelle ; bilan de partie ; contribution facultative.

**Frise réelle, distincte de la projection :** 1968 origine au Cnam ; 1973 association des anciens ; 1984 installation à Évry ; 2006 passage à l’ENSIIE. Les sources sont accessibles sur chaque entrée. Un dernier panneau séparé affiche « 2068 — projection fictive de votre équipe ».

**Bilan :** durée active, nombre de missions accompagnées, indices consultés, observations assistées. Aucun classement public ni appréciation négative. Badges descriptifs possibles : **Mémoire restaurée** pour tous ; **Enquête documentée** après les cinq preuves ; **Archives de l’Est** si l’extension est résolue.

**END.MSG — Nora :** « Une dernière trace, si vous le souhaitez : quelle idée aimeriez-vous transmettre aux élèves de demain ? » Champ facultatif de 500 caractères, enregistré localement. Boutons **Conserver sur cet appareil**, **Ne rien ajouter**. Aucun envoi à l’école ou publication n’est effectué.

**END.CLOSE — ARIIE :** « Merci, {equipe}. Vous avez retrouvé d’où nous venons, observé ce qui nous rassemble et choisi comment transmettre. La mémoire peut continuer. »

Actions : **Relire le carnet**, **Exporter le souvenir**, **Revenir à l’accueil**. L’export est un document local de synthèse, avec les engagements et le nom d’équipe ; il n’est pas un diplôme officiel de l’école.

## Contrat disponible (2026-10-15)

`ending(session, catalog)` dans `src/core/session/engine.ts` renvoie `null` avant la réussite du final, puis `{ theme, commitments }`. `theme` vaut l’identifiant de thème des options du Conseil (`lucidite`, `sobriete`, `partage` si le Conseil utilise ces identifiants) ou `null` pour Horizon commun. `commitments` suit l’ordre C1 à C3. Les textes de fin restent des données à créer dans ce dossier.

## Livraison phase 2

- `content.json` porte les quatre variantes, l’ouverture, la clôture, les neuf engagements, la frise sourcée, le message et les libellés d’action.
- `src/app/endingContent.ts` vérifie ces données et les engagements contre le Conseil. `check:content` les valide également.
- `src/app/endings.ts` compose un modèle de présentation depuis `ending(session, catalog)` et les données de session ; aucune nouvelle règle de majorité dans la vue.
- `src/presentation/components/EndingView.tsx` présente le contenu ; `src/app/EndingPanel.tsx` relie les actions locales. Le moteur reste inchangé.
- La fin s’affiche à la réussite de SYN-03 et à la reprise d’une partie terminée. Une entrée « La capsule » permet de la relire. Le carnet et l’accueil restent accessibles.
- Contribution limitée à 500 caractères, enregistrée seulement sur action « Conserver sur cet appareil ». Stockage séparé par identifiant de partie (`chrono-iie:capsule:v1:<id>`), sans requête réseau. « Ne rien ajouter » retire la contribution de cette partie. Une panne de stockage est annoncée et conserve le brouillon affiché.
- L’export produit un fichier texte local, avec variante, engagements, frise, bilan et contribution déjà conservée. Un brouillon non conservé n’y est pas inclus. La sauvegarde JSON de progression reste distincte : elle ne contient pas le message privé.
- Le bilan compte les missions accompagnées, indices et secours réellement enregistrés. La durée active n’est pas instrumentée dans le socle ; elle est affichée « Non mesurée dans cette version ». Aucun temps fictif n’est inventé.
- L’apparition est immédiate, sans animation ni son requis. Le focus arrive sur le titre. Restent la recette humaine et la mesure réelle du temps dans un chantier ultérieur.

### Refaire la recette

`npm run check`, puis `/?level=fut-c` pour les neuf options. En campagne, choisir au Conseil après SYN-02, puis réussir SYN-03 (ou utiliser son assistance après les trois indices). L’écran de fin s’ouvre ; modifier les choix du Conseil est ensuite interdit. Tester sans Conseil donne Horizon commun. Pour chaque thème, donner ce thème à deux questions ; trois thèmes différents donnent Horizon commun.
