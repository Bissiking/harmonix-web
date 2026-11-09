# Harmonix Web V5

Frontend **Vue 3 / Vite** pour le backend Sonora situé dans
`D:/DEV/NODEJS/sonora`. Ce dépôt ne contient plus de serveur applicatif.
Sonora gère les sessions Kyros, les autorisations, les médias et les Rifts.

## Démarrer

Configurer `.env` avec les deux réglages de `.env.example` :

```dotenv
SONORA_URL=http://localhost:6002
HARMONIX_WEB_PORT=5174
```

Les anciens réglages `HARMONIX_PORT`, `HARMONIX_BASE_URL`,
`HARMONIX_SESSION_*`, `HARMONIX_COOKIE_*` et `HARMONIX_KYROS_*` ne sont plus
consommés. Le fichier `.env` local existant a été conservé.

Lancer Sonora, puis le frontend :

```powershell
# Dans D:/DEV/NODEJS/sonora
npm start

# Dans D:/DEV/NODEJS/harmonix-web, autre terminal
npm install
npm run dev
```

Vite relaie `/auth`, `/api` et `/covers` vers `SONORA_URL`, y compris les
WebSockets et les requêtes Range audio. Il n’échange ni ne conserve de jetons.

## Connexion

Dans la configuration **Sonora** :

```dotenv
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
KYROS_REDIRECT_URI=http://localhost:6002/auth/callback
```

`CORS_ORIGINS` est la liste générique des origines autorisées : conserver les
autres frontends déjà configurés. Aucune variable dédiée à Harmonix n’est requise.
`KYROS_REDIRECT_URI` désigne uniquement le callback du **backend Sonora**,
indépendamment du frontend utilisé. **Redémarrer Sonora** après les changements
de code ou de configuration.

Dans l’environnement local, `http://localhost:6002/auth/callback` est déjà
enregistré dans le client Kyros de Sonora. Aucun callback Harmonix sur `5174`
n’est nécessaire. Sonora crée la session sur le frontend de départ grâce à un
ticket court à usage unique ; les jetons restent sur Sonora.
Voir [le parcours SSO](DOCS/sso-guide.md).

## Vérifier et construire

```powershell
npm run check
npm test
npm run build
npm run preview
```

Le build statique se trouve dans `web/dist`. `npm start` lance également l’aperçu
Vite local. L’ancien banc Express et ses scripts ont été retirés.

## Hébergement

Servir `web/dist` sous une origine autorisée dans `CORS_ORIGINS` de Sonora. La passerelle
HTTP doit relayer `/auth/*`, `/api/*` et `/covers/*` directement à Sonora, autoriser
l’upgrade WebSocket pour les Rifts et conserver cookies, Origin et en-têtes Range.
Les autres routes du frontend utilisent le fallback vers `index.html`.

Les appels restent sous la même origine, avec le cookie HttpOnly de Sonora.
Configurer HTTPS et `COOKIE_SECURE=true` **dans Sonora** pour le déploiement.
`KYROS_REDIRECT_URI` doit alors être l’URL HTTPS du callback du backend,
enregistrée une seule fois dans Kyros pour Sonora.

## Fonctionnalités

Catalogue, recherche, albums, favoris, playlists éditables, lecteur persistant,
file manuelle, aléatoire, répétition, reprise et paroles texte/LRC synchronisées.
Identité Moon Resonance et logos fournis par l’utilisateur. Le manifeste web et
les commandes Media Session sont présents ; Night, fichiers locaux et cache
audio hors ligne restent des étapes futures.

Voir [la migration V5](DOCS/V5-MIGRATION.md) pour le périmètre et les validations.
