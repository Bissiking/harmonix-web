# Harmonix Web V5

## Architecture actuelle

Le dépôt `harmonix-web` contient uniquement le frontend Vue/Vite et ses tests.
Le backend est `D:/DEV/NODEJS/sonora`. Le dossier `server`, le relais WebSocket,
les cookies Harmonix, le code Kyros local, le banc Express et leurs dépendances
ont été retirés à la demande de l’utilisateur.

Vite fournit seulement le proxy de développement et d’aperçu local. En production,
une passerelle relie les mêmes chemins directement à Sonora. Les URL frontend
restent relatives ; Sonora reçoit ses cookies HttpOnly et contrôle les permissions.

## Socle V5

| Fonction | Contrat Sonora |
| --- | --- |
| Catalogue, recherche et albums | `/api/harmonix/apps/v2/catalog/*` |
| Lecture HTML Audio et Range | `/api/harmonix/apps/v2/stream/:id` |
| Favoris | `/api/harmonix/apps/v2/library/favorites*` |
| Playlists, renommage, ajouts et retraits | `/api/harmonix/apps/v2/playlists*` |
| Paroles texte et LRC synchronisées | `/api/harmonix/apps/v2/catalog/tracks/:id/lyrics` |
| Reprise et sauvegarde de position | `/api/harmonix/apps/v2/playback/*` |
| Session et déconnexion | `/auth/me`, `POST /auth/logout` |
| Écoute collaborative | `/api/rifts*`, WebSocket `/api/rifts/:id/ws` |

La version du client est **5.0.0** ; la version des contrats existants reste v2.
`web/src/api/library.js` normalise les réponses et les durées Sonora.
Le lecteur reste unique pendant la navigation. La reprise attend les métadonnées
et un geste utilisateur avant la lecture ; les paroles LRC permettent de chercher
un instant du morceau. Le shuffle conserve le titre manuel en cours et l’ancre
de sa liste principale.

## Adaptations dans Sonora

- Callback SSO commun au backend, configuré par `KYROS_REDIRECT_URI`. La destination
  frontend vient de la liste générique `CORS_ORIGINS` et reste liée à la transaction
  OAuth/PKCE. Un ticket de retour opaque de 90 secondes, à usage unique et lié au
  cookie state du frontend, permet à Sonora de poser sa session sur ce frontend.
  Les jetons ne sont pas transmis dans les URL. Studio et le relais natif restent
  pris en charge.
- Métadonnée publique `hasClientId` sur `/auth/config` pour afficher le bouton
  de connexion sans exposer les identifiants confidentiels.
- Protection des écritures par cookie pour les origines Studio et Harmonix
  configurées, sans accepter une origine arbitraire.
- Authentification Rift par session Sonora, avec contrôle d’Origin ; maintien
  des jetons Bearer pour les applications natives.
- Test `test/harmonix-web-session.test.js` dans Sonora couvrant le parcours.

Le `.env` local d’Harmonix a été conservé ; seuls `SONORA_URL` et
`HARMONIX_WEB_PORT` sont encore utilisés. L’origine du frontend est autorisée dans
`CORS_ORIGINS` de Sonora. Le callback Sonora déjà enregistré dans Kyros est
`http://localhost:6002/auth/callback` ; aucun callback par frontend n’est nécessaire.

## Identité et suite

Moon Resonance : Midnight Navy `#0A0F2B`, violet `#7B5CFF`, lavande `#C8B4FF`,
cyan `#5EE6FF`. Les logos utilisateur sont servis depuis `web/public/branding`.
Le thème conserve les presets et calcule le contraste des boutons. Les variantes
Night de la racine restent disponibles pour cette fonctionnalité future.

L’application Flutter a servi de référence fonctionnelle en lecture seule.
Night, fichiers personnels, playlists mixtes et audio hors ligne ne sont pas
portés dans ce socle. Le manifeste d’installation ne fournit pas de cache audio.
Les listes serveur sont intégralement chargées ; l’affichage des titres par lots
limite le DOM, mais une très grande bibliothèque demandera une pagination Sonora.

## Validation

Le frontend vérifie la logique du lecteur, les paroles, les sessions Sonora et le
proxy Vite avec un serveur HTTP éphémère de test : cookies, corps JSON, redirections
et réponses Range 206 sont transmis directement ; cookies et Origin restent
également transmis lors de l’upgrade WebSocket. Ces serveurs existent uniquement
dans les tests et ne sont pas des backends applicatifs.

Validation après retrait du backend local : `npm run check`, `npm run build` et
**14 tests frontend réussis** ; `npm run check` dans Sonora et **32 tests réussis**,
dont le nouveau parcours SSO / session / Rift par cookie. Aucun service réel
Sonora ou Kyros n’a été démarré ou reconfiguré à distance par ces tests. Un test
PAR réel a ensuite confirmé l’acceptation du callback Sonora existant par Kyros,
après diagnostic de `invalid_redirect_uri` sur les anciens callbacks frontend.

Les contrôles visuels Chrome desktop/mobile du socle V5 ont précédé le retrait du
backend. Cette migration ne modifie pas son identité visuelle. La connexion réelle
Kyros, les médias réels, Safari/iOS, les commandes sur écran verrouillé et Rift
entre appareils restent à vérifier sur les services configurés. Une erreur 502
Kyros avait été observée lors de la validation initiale.
