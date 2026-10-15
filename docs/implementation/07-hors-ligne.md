# 07 — Préparation hors ligne

**État :** à réaliser. La sauvegarde locale fonctionne mais ne met pas l’application en cache. **Propriétaire suggéré :** A. **Dépendances :** assets stabilisés et versions de campagne.

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

- [ ] Première visite non préparée : aucune fausse promesse de disponibilité hors ligne.
- [ ] Préparation interrompue : statut incomplet et possibilité de reprendre.
- [ ] Préparation complète : navigation vers les niveaux non encore ouverts fonctionne sans réseau.
- [ ] Les archives historiques ont une transcription locale suffisante.
- [ ] Une mise à jour n’altère pas une partie en cours.
- [ ] Effacer la sauvegarde et effacer le cache restent deux opérations distinctes.

**Livrables :** adaptateur, manifeste, écran de préparation et scénario de recette réseau coupé.
