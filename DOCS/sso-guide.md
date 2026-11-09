# Connexion des frontends via Sonora

Sonora est le seul backend OAuth. Les frontends n’ont pas de client Kyros propre,
de secret, ni de callback à enregistrer chacun dans Kyros.

## Configuration

Dans Sonora :

```dotenv
KYROS_REDIRECT_URI=http://localhost:6002/auth/callback
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

Le premier réglage est le callback de **Sonora**, déjà enregistré dans Kyros pour
l’environnement local. Le second est la liste générique des origines frontend
autorisées, utilisée pour CORS, les mutations par cookie et les retours de connexion.
Un joker `*` n’autorise jamais une destination SSO arbitraire.

Harmonix conserve uniquement son adresse de backend et son port :

```dotenv
SONORA_URL=http://localhost:6002
HARMONIX_WEB_PORT=5174
```

## Parcours

1. Le frontend ouvre `/auth/login?return_to=<son origine>` via sa passerelle.
2. Sonora vérifie cette origine, mémorise la destination et le callback dans la
   transaction OAuth, et pose un cookie state HttpOnly sur le frontend de départ.
3. Sonora initialise PAR/PKCE avec **son callback commun**, jamais celui du frontend.
4. Kyros revient directement à Sonora. Sonora vérifie l’issuer, la transaction et
   PKCE, puis conserve les jetons côté serveur.
5. Le navigateur est renvoyé vers `<frontend>/auth/complete?ticket=...`. Ce ticket
   opaque de 90 secondes ne contient aucun jeton. La passerelle transmet cette
   route à Sonora, qui vérifie le cookie state du frontend et consomme le ticket
   une seule fois avant de poser son cookie de session HttpOnly sur cette origine.
6. Le frontend lit `/auth/me`. Les API, médias et WebSockets utilisent la session
   Sonora. La déconnexion appelle `POST /auth/logout`.

Un state incorrect ne consomme pas le ticket, mais ne crée aucune session.
Un ticket expiré ou rejoué est refusé. Les clients natifs conservent leur relais
SSO et leur authentification Bearer.

En production, le callback commun doit être l’URL HTTPS publique de Sonora.
Les frontends servent leur build statique et relaient `/auth`, `/api` et `/covers`
vers Sonora sous leur propre origine. Leurs URL sont simplement ajoutées à la liste
d’origines autorisées ; aucun nouveau callback Kyros n’est requis pour chacun.

## Diagnostic

`invalid_redirect_uri` signifie que le callback envoyé par Sonora ne correspond
pas à celui enregistré pour son client Kyros. Les ports `5173` et `5174` étaient
la cause du refus constaté ; `http://localhost:6002/auth/callback` est accepté.
Redémarrer Sonora après modification de son `.env`, puis relancer la connexion.

L’écran Harmonix accepte aussi l’ancien contrat `/auth/config` de Sonora sans
champ `hasClientId`. Une réponse ancienne n’est plus présentée comme une panne Kyros.
