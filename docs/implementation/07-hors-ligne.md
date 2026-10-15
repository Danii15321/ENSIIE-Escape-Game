# 07 — Préparation hors ligne

**État :** livré le 15 octobre 2026, à vérifier sur l’hébergement HTTPS final. La sauvegarde locale et la copie hors ligne sont indépendantes. **Propriétaire suggéré :** A. **Dépendances :** assets stabilisés et versions de campagne.

## Résultat attendu

Après une préparation explicite avec réseau, l’équipe peut traverser tous les niveaux essentiels sans dépendre d’un site externe. Le premier accès sans réseau n’est pas garanti.

## Étapes

1. Recenser shell, paquets, documents, polices et images indispensables ; distinguer vidéos et AR facultatives.
2. Définir un manifeste de ressources et une clé de cache versionnée.
3. Implémenter un adaptateur de cache/service worker ; garder le moteur indépendant du navigateur.
4. Afficher l’état de préparation, puis « Prêt hors ligne » uniquement après confirmation de la présence de toutes les ressources nécessaires.
5. Ne pas activer silencieusement un nouveau contenu incompatible au milieu d’une session.
6. Gérer échec de téléchargement, quota insuffisant, reprise et nouvelle tentative.
7. Vérifier le site statique en HTTPS, puis couper réellement le réseau pendant un parcours.

## Recette

- [x] Première visite non préparée : aucune fausse promesse de disponibilité hors ligne.
- [x] Préparation interrompue : statut incomplet et possibilité de reprendre.
- [x] Préparation complète : navigation vers les niveaux non encore ouverts fonctionne sans réseau.
- [x] Les archives historiques ont une transcription locale suffisante.
- [x] Une mise à jour n’altère pas une partie en cours.
- [x] Effacer la sauvegarde et effacer le cache restent deux opérations distinctes.

**Livrables :** adaptateur, manifeste, écran de préparation et scénario de recette réseau coupé.

## Livraison technique

- **Manifeste :** `scripts/offline-plugin.ts` écrit `offline-manifest.json` au build : tous les fichiers publiés (`index.html`, scripts, styles, données des niveaux incluses dans les scripts) et une version calculée sur leur contenu. Le script `sw.js` est construit à part, en un seul fichier autonome.
- **Préparation :** `src/adapters/offline/cache.ts` télécharge les fichiers dans le cache `chrono-iie-offline-<version>`, saute ceux déjà présents (reprise), vérifie leur présence puis écrit le manifeste comme marque de fin. « Prêt hors ligne » n’apparaît qu’avec cette marque et un service actif. Espace insuffisant, fichier introuvable et réseau coupé produisent un statut « interrompue » avec reprise possible.
- **Service :** `src/sw/strategy.ts` ne sert rien tant qu’aucune copie complète n’existe. Ensuite, la navigation et les fichiers viennent de la copie préparée, même en ligne ; seul le manifeste est demandé au réseau d’abord, pour détecter une nouvelle version. Une nouvelle version s’installe uniquement par « Mettre à jour la copie hors ligne », qui supprime ensuite l’ancienne copie. Les écritures, les autres origines et `sw.js` ne passent jamais par la copie.
- **Interface :** `src/app/OfflinePanel.tsx`, sur l’accueil du parcours. En développement (`npm run dev`), le panneau indique que le mode est indisponible : il faut `npm run build` puis `npm run preview`, ou la version publiée.
- **Archives :** les supports des niveaux sont des textes locaux ; les liens vers Légifrance, la Wayback Machine ou le site de l’école restent des compléments et ne sont pas mis en cache.

## Vérifications

- Tests automatiques : `checks/offline/` (première visite, reprise sans retéléchargement, quota, fichier manquant, manifeste hostile, service inactif, mise à jour explicite, effacement séparé, double clic, stratégie du service, manifeste de build, panneau).
- Essai réel le 15 octobre 2026 avec Chrome sans interface sur `npm run preview` : « Non préparé », préparation jusqu’à « Prêt hors ligne (4/4) », serveur arrêté, rechargement de l’application et ouverture de SYN-02 jamais visité. Reste à refaire sur l’hébergement HTTPS et sur un téléphone.
