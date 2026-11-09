# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vue 3 / Vite pour le frontend uniquement, HTML Audio et Web Audio pour l’écoute.
Sonora est le seul backend : sessions Kyros, API et WebSockets. Le proxy Vite est
réservé au développement et à l’aperçu. Contrat Sonora `/api/harmonix/apps/v2`, commun avec
Harmonix Apps. Version du client : **5.0.0**.

## Users

Un cercle de proches qui écoute sa bibliothèque personnelle Sonora sur ordinateur
et téléphone, avec un compte Kyros. Les musiques sont notamment créées avec Suno.

## Product Purpose

Faire du web le client prioritaire de Harmonix : retrouver un morceau, l’écouter,
composer ses playlists et lire les paroles sans friction. L’application Flutter
évoluera ensuite ; son dépôt sert de référence fonctionnelle, sans être modifié.

## Positioning

Une bibliothèque personnelle et un lecteur musical, avec continuité d’écoute
entre les pages, favoris, playlists, albums et Rifts. Sonora reste la source de
vérité musicale ; Kyros reste le fournisseur d’identité.

## Operating Context

Desktop au clavier et mobile tactile, navigation web native. Un seul élément
audio existe pendant la session ; la lecture continue pendant la navigation.
Une reprise prépare le morceau et la position sans contourner le geste de lecture
requis par le navigateur. Les erreurs réseau proposent une nouvelle tentative.

## Capabilities and Constraints

- V5 : catalogue, recherche, albums, favoris, playlists éditables, file, lecture
  complète, paroles texte et LRC, volume, aléatoire, répétition et reprise Sonora.
- Rifts et SSO délégués à Sonora, avec session HttpOnly ; validation réelle encore nécessaire.
- Manifeste d’installation, icônes utilisateur et commandes Media Session selon
  le navigateur. Aucun cache audio hors ligne ni Service Worker à ce stade.
- Fichiers personnels, playlists mixtes, téléchargements et Night sont les étapes
  suivantes ; Android Auto et TV restent dans l’app native.
- Toutes les pages de musique exigent une session ; les jetons sont HttpOnly.
- La V5 ne renomme pas les versions des protocoles serveur.

## Brand Commitments

Moon Resonance, explicitement choisi par l’utilisateur : Midnight Navy #0A0F2B,
violet #7B5CFF, lavande #C8B4FF et cyan #5EE6FF. Utiliser les logos fournis à la
racine du projet. Interface française et nom Harmonix. Les variantes Night sont
réservées à cette fonctionnalité future.

## Evidence on Hand

Code Vue de ce dépôt ; backend dans `D:/DEV/NODEJS/sonora` ; source Flutter dans
`C:/Users/mathe/Documents/GitHub/harmonix-apps`, ses PRODUCT.md, DESIGN.md,
contrats API et captures ; implémentation Sonora dans `D:/DEV/NODEJS/sonora`.
Périmètre et limites documentés dans `DOCS/V5-MIGRATION.md`.

## Product Principles

1. Un clic mène au bon morceau ; un changement de page ne coupe pas la lecture.
2. Le contenu musical, les pochettes et les paroles portent l’interface.
3. Les pannes réseau ne sont pas présentées comme des listes vides ou une
   expiration d’identité confirmée.
4. Mobile et desktop sont des cibles équivalentes ; les commandes supplémentaires
   du mini-lecteur sont disponibles dans le lecteur complet.
5. Partager les contrats Sonora avec l’app native pour éviter deux logiques métier.

## Accessibility & Inclusion

Noms accessibles, clavier, focus visible, menu mobile inactif lorsqu’il est fermé,
retour et maintien du focus à l’ouverture du menu, zones tactiles et respect de
la réduction des mouvements. Les paroles restent du texte et ne sont pas annoncées
à chaque tick de lecture.
