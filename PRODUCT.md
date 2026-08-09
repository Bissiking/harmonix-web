# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vue 3 + Vite (frontend) / Express (serveur de proxy SSO Kyros + WebSocket Rifts). Vite sert le dev sur `HARMONIX_WEB_PORT`, l'API sur `HARMONIX_PORT`, proxy vers Sonora (médiathèque + streaming).

## Users

Un petit cercle proche (famille / amis proches) qui partage la même bibliothèque musicale générée Suno & ChatGPT. Chacun s'identifie via Kyros (SSO) et écoute sur son propre appareil — desktop et mobile de manière équivalente.

## Product Purpose

Harmonix est le client web de la médiathèque Sonora : explorer la bibliothèque, rechercher, créer/écouter des playlists et albums, gérer ses favoris et la file d'attente, et écouter ensemble via les Rifts. Le succès, c'est retrouver un morceau en quelques secondes et écouter sans friction, sur n'importe quel écran.

## Positioning

Le rôle de « lecteur privilégié » de la bibliothèque : pas un simple admin de fichiers, mais une vitrine audio haut de gamme qui valorise une bibliothèque personnelle faite main, avec une expérience d'écoute collaborative (Rifts) en plus de l'écoute individuelle.

## Operating Context

- Sessions Kyros obligatoires : chaque page (y compris l'accueil) redirige vers la connexion si non authentifié.
- Contexte d'écoute continu : le player reste visible en bas d'écran pendant la navigation (mini-player → player complet), la lecture se poursuit d'une vue à l'autre.
- Actions récurrentes : lecture immédiate d'une piste, lecture d'une liste (playlist, album, favoris, recherche), ajout à la file, favoris, navigation vers le détail d'un album/morceau.
- Streaming audio via le proxy Harmonix→Sonora (URL `/api/tracks/stream/:id`) ; couvertures via `/covers/...`.
- Rifts : session d'écoute collaborative en temps réel (WebSocket relayé par Harmonix).

## Capabilities and Constraints

- Bibliothèque (grille/liste), recherche, favoris, playlists, albums, file d'attente, paramètres (thèmes or/noir, lecture), Rifts.
- Thème piloté par variables CSS (`--gold`, `--gold-light`, `--bg-dark`, `--bg-surface`, `--text`) avec presets + couleurs personnalisables ; les couleurs or/noir sont un engagement durable.
- Constraintes API : Sonora exige un token Kyros sur tout `/api/*` ; les routes `auth/*`, le streaming et les couvertures sont gérées par le serveur Express.
- Terminologie métier : morceau (track), album, playlist, favoris, file d'attente, Rift, Kyros, Sonora.

## Brand Commitments

- Nom : Harmonix. Version affichée : « Harmonix: V3.0.0 ». Signature technique : « Propulsé par Sonora ».
- Harmonix héberge la bibliothèque personnelle de musiques créées avec Suno ; ce n'est ni une radio ni une plateforme de podcasts.
- Palette or/noir avec presets (Nuit dorée, Classique, Violet dusk, Minuit bleu, Aube rose, Forêt, Cendre) — ne pas bouleverser les couleurs, seulement l'expression.
- Interface en français (labels, états vides, toasts).

## Evidence on Hand

- Implémentation frontend complète (composants, vues, stores, CSS) sous `web/src`.
- Serveur Express (auth Kyros, proxy, WS Rifts) sous `server/`.
- Sonora (API réelle) dans `D:\DEV\NODEJS\sonora`, studio dans `D:\DEV\NODEJS\sonoraStudio`.
- Aucun DESIGN.md ni capture approuvée : la refonte est libre sur l'expression tant qu'elle respecte l'or/noir et le mobile.

## Product Principles

1. L'écoute d'abord : réduire le bruit pour que le morceau et la bibliothèque respirent.
2. Haut de gamme discret : précision, espace, détails soignés plutôt que décoration.
3. Hiérarchie évidente : l'œil sait où regarder et quoi faire en une seconde.
4. Mobile et desktop sont des cibles égales, pas un mode dégradé.
5. La continuité de lecture guide la navigation (le player reste accessible partout).

## Accessibility & Inclusion

- Contraste or sur noir suffisant pour les textes essentiels et les états actifs.
- Cibles tactiles confortables sur mobile, navigation clavier sur desktop.
- Thème sombre unique assumé (pas de mode clair à ce stade).
