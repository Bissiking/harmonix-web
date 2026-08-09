# Harmonix — Bibliothèque musicale

## Direction

Harmonix est une bibliothèque personnelle pour héberger, organiser et écouter des musiques créées avec Suno. L'interface doit évoquer une collection musicale soignée, jamais une station de radio, une diffusion ou une plateforme de podcasts. Les pochettes, les titres et l'écoute restent au premier plan.

## Principes visuels

- Employer une base bleu-noir (`--bg-dark`, `--bg-surface`, `--bg-elevated`) et réserver `--gold` / `--gold-light` aux états actifs et aux actions prioritaires.
- Construire la profondeur avec des changements de surface et des filets d'un pixel. Éviter les cartes molles, les grands arrondis et les ombres décoratives.
- Utiliser `Saira Condensed` pour les titres et les libellés compacts ; utiliser `Saira` pour le texte courant et les contrôles.
- Garder une hiérarchie franche : titres condensés, métadonnées discrètes mais lisibles et pochettes carrées dominantes.
- Les graduations et visualisations sont des détails liés à la lecture audio. Ne pas employer de vocabulaire ou de symboles de diffusion comme « station », « antenne », « émission » ou « ON AIR ».

## Mise en page

- Desktop : navigation fixe à gauche, recherche en haut et lecteur persistant en bas.
- Mobile : navigation hors-canvas, contenu bord à bord et lecteur compact sur deux rangées. Les commandes précédent/suivant et le volume restent accessibles.
- Les listes sont prioritaires pour parcourir rapidement une grande bibliothèque ; la grille sert à explorer les pochettes.
- L'accueil met en avant le morceau en cours, les écoutes récentes et l'ensemble de la bibliothèque.

## Composants et états

- Bouton principal : fond or, texte presque noir, forme rectangulaire compacte.
- Bouton secondaire : surface élevée et filet discret.
- Cartes de pochette : couverture carrée, coins repérés et actions superposées. Sur appareil tactile, les actions sont toujours visibles et mesurent au moins 44 px.
- Lecture active : indicateur or, ligne courante rehaussée et titre accentué.
- Les états utilisent le vocabulaire de la bibliothèque : « En lecture », « En pause », « Prêt à écouter », « Écoutés récemment ».
- Tous les contrôles iconographiques ont un nom accessible, un focus visible et une cible tactile confortable.

## Marque

- En-tête : « Harmonix » et « V3.0.0 ».
- Pied de navigation : « Harmonix: V3.0.0 » puis « Propulsé par Sonora ».
- La création avec Suno peut être explicitée comme contexte produit, sans suggérer que ChatGPT héberge ou diffuse les morceaux.

## Mouvement

Les transitions sont brèves et fonctionnelles : survol d'une ligne ou d'une pochette, progression de lecture et ouverture du panneau mobile. Respecter `prefers-reduced-motion` et éviter les animations d'entrée répétitives.

## Contraintes durables

Ne pas remplacer l'identité or/noir, la terminologie française, le lecteur persistant ni la parité mobile/desktop. Les nouveaux écrans doivent réutiliser les tokens et les primitives `hx-*` avant d'introduire une exception locale.
