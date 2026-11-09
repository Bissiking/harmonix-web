---
name: Harmonix Web V5 — Moon Resonance
description: Une bibliothèque personnelle nocturne, portée par les pochettes et la continuité d'écoute.
colors:
  accent: "#7b5cff"
  accent-light: "#c8b4ff"
  action-bg: "#7054ea"
  action-hover: "#674dd7"
  action-text: "#ffffff"
  cyan: "#5ee6ff"
  bg-dark: "#0a0f2b"
  bg-surface: "#141a38"
  bg-elevated: "#2c314c"
  bg-hover: "#272c48"
  text: "#f4f2ff"
  text-muted: "color-mix(in srgb, var(--text) 74%, var(--bg-dark))"
  text-faint: "color-mix(in srgb, var(--text) 66%, var(--bg-dark))"
  border: "color-mix(in srgb, var(--text) 12%, transparent)"
  danger: "#ffafb8"
  success: "#8de7bf"
typography:
  display:
    fontFamily: "Saira, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(26px, 3vw, 42px)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Saira, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(26px, 2.6vw, 36px)"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Saira, Segoe UI, system-ui, sans-serif"
    fontSize: "21px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Saira, Segoe UI, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Saira, Segoe UI, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 550
    lineHeight: 1.5
rounded:
  artwork-small: "8px"
  control: "10px"
  card: "12px"
  surface: "14px"
  login: "16px"
  circle: "50%"
spacing:
  compact: "8px"
  small: "12px"
  medium: "16px"
  section: "24px"
  large: "32px"
  page: "36px"
  separation: "40px"
components:
  button-primary:
    backgroundColor: "{colors.action-bg}"
    textColor: "{colors.action-text}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "10px 18px"
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
  button-secondary:
    backgroundColor: "{colors.bg-elevated}"
    textColor: "{colors.text}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "10px 18px"
  button-play:
    backgroundColor: "{colors.accent-light}"
    textColor: "{colors.bg-dark}"
    rounded: "{rounded.circle}"
    size: "44px"
  input:
    backgroundColor: "{colors.bg-elevated}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "11px 14px"
  navigation-item:
    textColor: "{colors.text-muted}"
    rounded: "{rounded.card}"
    padding: "12px 14px"
  user-chip:
    textColor: "{colors.text}"
  artwork-card:
    textColor: "{colors.text}"
    rounded: "{rounded.card}"
  listening-surface:
    backgroundColor: "{colors.bg-surface}"
    rounded: "{rounded.surface}"
    padding: "28px"
  lyric-line:
    textColor: "{colors.text-muted}"
    rounded: "{rounded.artwork-small}"
    padding: "6px 8px"
---

# Design System: Harmonix Web V5

## Overview

**Creative North Star: "Moon Resonance"**

Une bibliothèque personnelle nocturne, calme et immédiatement écoutable. Le bleu nuit installe la profondeur ; le violet et la lavande signalent les actions et les états de lecture. Les pochettes et les titres donnent à chaque morceau sa présence, dans une interface française à la densité maîtrisée.

La même voix typographique accompagne le catalogue, les commandes et les paroles. Des surfaces tonales, des angles adoucis et des filets discrets organisent la collection. Le lecteur persistant assure la continuité ; les paroles synchronisées suivent la position réelle et permettent de reprendre à un vers.

**Key Characteristics:**

- Une base nocturne et des accents Moon Resonance.
- Saira pour les titres, le texte et les commandes, en casse naturelle.
- Des pochettes carrées et des listes lisibles, avec une grille alternative.
- Des surfaces arrondies et une profondeur principalement tonale.
- Un lecteur continu et des paroles actives comme geste signature.

Cette documentation remplace la direction V3 or/noir selon le choix V5 confirmé. Sources : `web/src/assets/css/main.css`, `web/src/stores/theme.js` et composants Vue actuels. Les quatre PNG de `web/public/branding` proviennent des logos fournis par l'utilisateur : `favicon.png`, `Icon-192.png`, `Icon-512.png` et `Icon-maskable-512.png` ; leur provenance est inscrite dans les fichiers (4/4). Les variantes Night ne sont pas utilisées.

Les captures existantes de `.impeccable/review` montrent la composition avant le dernier lot de corrections. Le verdict `v5-fix-verdict.md` est SHIP pour les trois correctifs, avec preuve additionnelle partielle : les boutons corrigés et la récupération du sélecteur de playlists n'ont pas reçu de nouvelle validation visuelle complète. Le contrôle Windows s'est arrêté automatiquement faute de certitude sur l'URL active. Build/check et 15 tests réussis sont consignés dans `DOCS/V5-MIGRATION.md` ; cette documentation n'est pas une nouvelle passe de tests.

## Colors

Le frontmatter fixe les valeurs du thème Moon Resonance après initialisation ; les expressions CSS préservent la dérivation des textes et filets.

### Primary

- **Violet résonance — accent :** identité de marque et mélanges des fonds actifs.
- **Violet action — action-bg / action-hover :** boutons prioritaires. Le fond mélange l'accent avec 10 % du Midnight Navy fixe ; le texte est blanc si son ratio atteint 4,5:1, noir sinon. Le survol mélange ensuite 8 % de noir ou de blanc pour augmenter le contraste du texte retenu.
- **Lavande — accent-light :** liens, titres courants, vers actif, modes de lecture sélectionnés et bouton lecture circulaire.

### Secondary

- **Cyan lunaire — cyan :** focus visible, curseur de saisie, information d'écoute et survol du bouton lecture.

### Neutral

- **Midnight Navy — bg-dark :** toile générale et navigation inférieure mobile.
- **Bleu nuit de surface — bg-surface :** navigation latérale, lecteur, panneau d'écoute et états de contenu.
- **Bleu ardoise élevé — bg-elevated :** champs, boutons secondaires, avatars et notifications ; fond de surface éclairci par 10 % de blanc.
- **Bleu ardoise de survol — bg-hover :** états interactifs secondaires ; fond de surface éclairci par 8 % de blanc. Ce survol est légèrement plus sombre que la surface élevée dans le thème actuel.
- **Blanc lavande — text :** contenu principal. Les niveaux secondaires mélangent ce texte avec le fond général ; les filets l'utilisent à faible opacité.
- **Rose d'erreur — danger / menthe — success :** erreurs récupérables et état connecté des Rifts, avec libellés explicites.

**The Action Contrast Rule.** Réutiliser les couleurs d'action calculées pour les boutons principaux. Le violet de marque seul n'est pas leur fond de remplacement. Moon Resonance atteint 5,07:1 au repos et 5,80:1 au survol ; les huit presets ont été vérifiés à au moins 4,5:1. Cette preuve ne couvre pas toute couleur personnalisée possible.

Les propriétés historiques `--gold` et `--gold-light` sont des alias d'accent, pas une prescription d'or. Les presets historiques restent proposés dans les paramètres ; Moon Resonance est la valeur initiale et de réinitialisation, stockée sous une clé V5. Les fallbacks CSS des surfaces élevée et de survol diffèrent des valeurs calculées par le store : le frontmatter décrit le thème effectivement initialisé.

## Typography

**Display Font:** Saira, avec Segoe UI puis system-ui et sans-serif.

**Body Font:** la même famille, chargée par Google Fonts dans `web/index.html` avec fallbacks système.

La voix est compacte et lisible sans traitement d'affiche condensée. Les titres gardent la casse naturelle et un léger resserrement ; les temps utilisent des chiffres tabulaires.

### Hierarchy

- **Display :** titre du panneau d'écoute, selon l'échelle du frontmatter ; 24px sur petit écran.
- **Headline :** titres de page, selon l'échelle du frontmatter. Le lecteur complet a une borne basse de 24px ; la connexion utilise 48px pour la marque desktop et 30px pour le titre de carte.
- **Title :** sections du catalogue ; 20px sur petit écran. Les sous-sections de réglages et de file utilisent 17px.
- **Body :** texte courant ; les titres de ligne et de carte ont une graisse de 550.
- **Label :** boutons. Les métadonnées emploient généralement 12px, les informations compactes 11px et la navigation inférieure 10px.
- **Paroles :** échelle fluide de 20 à 28px, graisse 550 et interligne 1,6 ; 24px sur petit écran.

**The One Typeface Rule.** Conserver Saira pour la hiérarchie entière ; ne pas réintroduire Saira Condensed ni des titres systématiquement en capitales espacées.

## Layout

Le shell desktop associe une navigation gauche de 232px, un en-tête de 80px et un lecteur fixe d'au moins 104px. Le contenu défile dans son propre espace avec une largeur maximale de 1240px, des marges internes horizontales de 36px et une réserve basse pour le lecteur. L'en-tête contient la recherche et le compte.

Le catalogue privilégie la liste structurée ; la grille alternative utilise des colonnes automatiques d'au moins 160px espacées de 24px. Les lignes mesurent au moins 72px, avec des couvertures de 46px et des actions persistantes. Le lecteur complet place pochette et commandes à gauche, paroles à droite. Les espacements du frontmatter reflètent les valeurs récurrentes ; ils ne constituent pas une grille arithmétique stricte.

- **À 1200px et moins :** disparition de la colonne album, réduction des écarts et simplification du lecteur persistant.
- **À 900px et moins :** navigation hors-canvas avec voile sombre, en-tête de 72px, marges de contenu de 24px et lecteur sur toute la largeur. Le menu fermé est inerte ; le menu ouvert garde le focus puis le rend au bouton d'ouverture.
- **À 600px et moins :** en-tête de 68px, marges de contenu de 16px, liste compacte ou grille de deux colonnes. Navigation inférieure à quatre destinations ; mini-lecteur au-dessus avec précédent, lecture/pause, suivant et progression. Modes de lecture, volume et file restent accessibles dans le lecteur complet ou leurs pages. Le lecteur complet passe à une colonne suivie des paroles. Réserve basse du contenu : 208px plus safe area ; mini-lecteur placé à 61px plus safe area du bas.

La vue de validation mobile mesure 372 × 793px dans les captures Chrome natives. Le cadre Chrome, DevTools et le pointeur système ne font pas partie de l'interface.

## Elevation & Depth

La profondeur repose sur les tons de surface et les filets d'un pixel. Cartes et panneaux restent sans ombre décorative ; les pochettes apportent couleur et matière. Un voile sombre détache le menu hors-canvas du contenu.

### Shadow Vocabulary

- **Notification flottante** (`0 8px 24px #0004`) : ombre du toast uniquement, au-dessus du contenu.

**The Tonal Depth Rule.** Choisir une surface et un filet avant d'ajouter une ombre ; réserver l'ombre existante aux notifications flottantes.

## Shapes

Le panneau d'écoute et la pochette du lecteur complet portent l'arrondi de surface (14px). Cartes, navigation et panneaux d'état emploient l'arrondi carte (12px), boutons et champs l'arrondi contrôle (10px), petites pochettes et vers l'arrondi compact (8px). La carte de connexion utilise 16px ; son illustration de marque desktop a une exception à 20px.

Les pochettes sont carrées, recadrées avec `object-fit: cover`. Lecture et avatar sont circulaires. Les icônes reposent sur un trait de 1,8, des terminaisons arrondies et une boîte de 20px ; leur bouton est plus grand que le dessin.

## Components

### Buttons

Commandes directes et arrondies. Boutons texte : hauteur minimale de 44px, remplissage de 10px × 18px, graisse 550. Le principal consomme les couleurs d'action calculées ; le secondaire utilise la surface élevée puis la surface de survol. Les contrôles désactivés ont une opacité de 0,5. Les boutons iconographiques mesurent normalement 44px de côté ; certaines commandes compactes passent à 40px sur mobile.

Le focus global est un contour cyan de 2px décalé de 4px. La lecture est circulaire, lavande sur fond sombre et cyan au survol : 44px sur desktop, 40px dans la barre mobile, 60px dans le lecteur complet.

### Cards / Containers

Les cartes du catalogue présentent une pochette, un titre puis un artiste, sans cadre ni ombre ajoutée ; la pochette s'éclaircit légèrement au survol. Le panneau d'écoute a un remplissage de 28px desktop, 18px sur petit écran. Les raccourcis récents sont des lignes compactes sur fond de surface ; leurs textes peuvent être tronqués.

### Inputs / Fields

Champs et sélecteurs natifs : surface élevée, filet discret, arrondi contrôle et remplissage de 11px × 14px. Curseur de saisie cyan, placeholder au niveau de texte faible. La recherche réunit champ et bouton dans une surface de rayon 12px ; son focus de groupe est lavande. Les curseurs audio emploient l'accent lavande.

### Navigation

Icône et libellé naturel dans des lignes latérales d'au moins 48px. L'état actif combine texte lavande et violet à 18 % sur la surface ; le survol utilise la surface dédiée. Le compte est un lien avec avatar circulaire. La navigation inférieure apparaît au breakpoint téléphone. Réutiliser les logos fournis pour la marque et le manifeste.

### Persistent player

La barre conserve titre, pochette, progression et commandes pendant la navigation ; son lien principal ouvre le lecteur complet. Un échec audio affiche un message et une nouvelle tentative au-dessus de la barre. La reprise prépare le titre et sa position ; la lecture attend un geste de l'utilisateur.

### Lyrics

Les paroles texte restent des paragraphes. Les vers LRC sont des boutons horodatés : le vers actif combine texte lavande et fond violet à 12 %, avec défilement lié à la position audio. Un clic déplace la lecture du morceau courant. Aucun live region ne récite chaque changement de vers.

### Loading, empty and error states

Surface tonale, message français explicite et action « Réessayer » en cas d'échec récupérable. Une panne de playlists n'est pas une collection vide : choix temporairement désactivé, erreur et nouvelle tentative locale ; la consigne de création suit uniquement une réponse vide réussie. Les toasts complètent les états locaux.

Le mouvement reste fonctionnel : fond de bouton en 180ms, teinte des paroles et translation du menu en 220ms, apparition du toast en 200ms. `prefers-reduced-motion` supprime animations et transitions ; les paroles défilent alors immédiatement.

## Do's and Don'ts

### Do:

- **Do** réutiliser les tokens CSS et les primitives existantes avant une exception locale.
- **Do** laisser les pochettes, titres et paroles porter la hiérarchie.
- **Do** conserver les libellés français, noms accessibles et focus visibles.
- **Do** préserver l'accès aux commandes complètes depuis le mini-lecteur mobile.
- **Do** distinguer chargement, erreur récupérable et résultat vide réussi.
- **Do** utiliser les quatre logos livrés avec leur provenance et garder les variantes Night pour leur futur périmètre.

### Don't:

- **Don't** rétablir l'or/noir V3 comme identité par défaut ni employer l'alias historique gold comme justification visuelle.
- **Don't** remplacer les fonds d'action calculés par le violet de marque seul.
- **Don't** réintroduire des titres condensés en capitales espacées.
- **Don't** transformer la bibliothèque en station de radio, émission ou plateforme de podcasts.
- **Don't** présenter les captures antérieures aux corrections comme une approbation visuelle fraîche de ces corrections.
- **Don't** afficher comme livrés Night, Cast, fichiers locaux, cache audio hors ligne ou Service Worker : ils ne font pas partie de ce socle. Le manifeste ne garantit pas l'écoute hors connexion ; la version client V5 conserve l'API Sonora v2.
