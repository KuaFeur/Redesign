# Primary Asset, portfolio Discord

Page statique (HTML/CSS/JS, sans build ni dépendance) : accueil, projets, bots & communautés,
résultats web et contact.

Identité affichée : **Primary Asset**, Discord `1156589290252419212`
→ https://discord.com/users/1156589290252419212

## Fichiers

| Fichier | Rôle |
|---|---|
| `content.js` | **Tout le contenu à modifier** : profil, carte Discord, projets, bios, bots, résultats |
| `index.html` | Structure de la page |
| `confidentialite.html` | Politique de confidentialité (RGPD) |
| `cookies.html` | Politique de cookies |
| `conditions.html` | Conditions générales d'utilisation |
| `app.js` | Affichage et interactions (à ne pas toucher pour changer les textes) |
| `styles.css` | Thème, mise en page, animations |
| `icon.svg` | Favicon |

## En ligne

Site publié sur **https://primary-asset.fr** (domaine principal) ; **https://primary-asset.com**
redirige en 301 vers le `.fr` via Cloudflare. L'ancienne adresse
`https://nojiri-frfr.github.io/Get-in-touch-with-PA/` redirige aussi vers le domaine.

Chaque `git push` sur `main` redéploie le site en une trentaine de secondes (source : branche
`main`, racine du dépôt). Le fichier `.nojekyll` évite tout traitement Jekyll.

Le mode `#edition` fonctionne aussi en ligne, mais il ne modifie que le navigateur : il faut
télécharger le `content.js` généré, le déposer dans le dossier local, puis commit + push pour que
la version publique change.

## Domaine et DNS

Les deux zones sont gérées chez Cloudflare (nameservers `carol` / `jack.ns.cloudflare.com`) :

| Enregistrement | Valeur | Proxy |
|---|---|---|
| `A @` (×4) | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` | DNS only |
| `AAAA @` (×4) | `2606:50c0:8000::153`, `...:8001::153`, `...:8002::153`, `...:8003::153` | DNS only |
| `CNAME www` | `nojiri-frfr.github.io` | DNS only |

Le proxy Cloudflare doit rester **désactivé** (nuage gris) sur le `.fr`, sinon GitHub Pages ne
peut pas générer son certificat HTTPS. Le `.com` est proxifié et sert uniquement une Redirect Rule
301 vers `https://primary-asset.fr` (chemin et query string conservés).

Le fichier `CNAME` du dépôt contient le domaine principal : c'est lui qui déclare le domaine
personnalisé dans GitHub Pages.

## Lancer en local

Double-clique sur `index.html` : tout fonctionne en local, sans serveur.

## Modifier une bio ou un projet

Tout est dans `content.js`. Une fiche projet = un bloc :

```js
{
  nom: "Eminium",
  bio: "Une phrase ou deux pour présenter le projet.",
  tags: ["Web", "Bot"],
  lien: "",            // vide = le bouton pointe vers ton profil Discord
},
```

Règles simples :

- `bio: ""` → la carte affiche **Bio à venir.** (tu peux donc ajouter un projet sans bio)
- `tags: []` → aucune étiquette affichée
- `lien: ""` → profil Discord ; sinon mets l'URL complète avec `https://`
- une virgule entre chaque bloc `{ ... },` et pas de virgule après le dernier ; en cas d'erreur
  de syntaxe, la page reste blanche (regarde la console du navigateur, F12)
- les compteurs (« Projets », « Bots & communautés »…) se recalculent tout seuls

Le bloc `profil` en haut contrôle le nom affiché, le pseudo, l'ID Discord, la phrase d'accueil et
la langue : tout le reste de la page (liens, badges, pied de page) suit cet ID.

Le bloc `carte` contrôle la carte « Profil Discord » : libellé, tag, rôle, serveur, membres,
statut, dernière connexion, et les chemins d'avatar / bannière. Les images sont stockées dans
`assets/discord/` (`avatar.gif`, `banner.gif`) : ton avatar et ta bannière Discord étant animés,
ce sont les GIF qui sont utilisés, sinon l'animation est perdue. La bannière pèse ~1,5 Mo et
n'est chargée qu'à l'approche de la carte. Pour les rafraîchir, récupère les fichiers sur le CDN
Discord (`.../avatars/<id>/<hash>.gif?size=256` et `.../banners/<id>/<hash>.gif?size=480`) et
écrase-les. Laisse le champ vide pour garder le dégradé par défaut.

## Mode édition dans le navigateur

Ouvre `index.html#edition` (ou ajoute `#edition` à l'URL) : un panneau permet de

- modifier le nom, le pseudo, l'ID Discord et la phrase d'accueil ;
- modifier / ajouter / retirer des projets, avec un champ bio par projet ;
- **Télécharger content.js** (ou copier le code), puis remplacer le `content.js` du dossier.

C'est le moyen le plus simple de remplir les bios sans écrire de code. Les listes « Bots » et
« Résultats » sont conservées telles quelles, elles se modifient directement dans `content.js`.
Le fichier généré est du code brut, sans commentaire : la documentation reste dans ce README.

## Thème

Clair/sombre via le bouton ◐ de l'en-tête, mémorisé dans `localStorage`, avec détection de
`prefers-color-scheme`. L'écran de chargement est ignoré si `prefers-reduced-motion` est actif.

## Détails

- Aucun tracker, aucun cookie, **aucune requête vers un tiers par défaut** : polices (`assets/fonts/`), avatar et bannière (`assets/discord/`) sont servis par le site lui-même. Le seul tiers contacté est l'API Lanyard (statut Discord en direct), et seulement si tu cliques sur le bouton « Activer le statut en direct » sur la carte.
- Responsive jusqu'à 360 px, navigation par ancres, lien d'évitement clavier.
- `prefers-reduced-motion` respecté partout.

## RGPD

Le site a été rendu conforme au RGPD / ePrivacy sans bandeau de consentement, parce qu'il ne pose
aucun cookie et n'appelle aucun service tiers :

| Point | Mise en œuvre |
|---|---|
| Polices | Space Grotesk et JetBrains Mono téléchargées et servies en local (`assets/fonts/fonts.css`) |
| Images de profil | Avatar et bannière hébergés dans `assets/discord/` |
| Cookies | Aucun. Pas de mesure d'audience, pas de pixel, pas de CDN externe |
| Hébergeur | GitHub Pages (GitHub, Inc., États-Unis) : journaux techniques avec IP, décrits dans la politique |
| Stockage local | Uniquement le thème choisi et l'activation du statut en direct, et seulement après un clic sur ◐ ou sur le bouton de la carte (aucune donnée personnelle) |
| Statut en direct (Lanyard) | L'API `api.lanyard.rest` n'est appelée que si le visiteur clique sur « Activer le statut en direct » ; consentement retirable à tout moment. Détail dans `confidentialite.html` |
| Information | Page `confidentialite.html` : responsable, finalités, base légale, transferts, durées, droits, CNIL, mentions légales |

Si tu ajoutes plus tard un service externe (police distante, carte, vidéo YouTube, statistiques,
formulaire), la conformité tombe : il faudra soit l'héberger en local, soit demander le
consentement avant chargement. `confidentialite.html` doit alors être mis à jour.

## Statut en direct via Lanyard

La carte Discord affiche par défaut les valeurs saisies à la main dans `content.js` (`statut`, `connexion`). Pour qu'elle affiche le vrai statut Discord en temps réel, il faut :

1. Rejoindre le serveur **discord.gg/lanyard** (le bot Lanyard doit pouvoir voir le statut du compte `1156589290252419212`).
2. Sur le site, cliquer sur « Activer le statut en direct » sur la carte Profil Discord.

Dès l'activation, le site interroge `https://api.lanyard.rest/v1/users/1156589290252419212` toutes les 30 secondes (pause quand l'onglet est en arrière-plan) et met à jour le statut, le point couleur et l'activité affichés (Spotify inclus). Le choix est mémorisé dans `localStorage` (clé `pa-live`) et peut être retiré à tout moment en recliquant sur le bouton. Aucune donnée personnelle n'est envoyée à Lanyard au-delà de l'ID Discord public et de l'adresse IP de la requête ; le détail figure dans `confidentialite.html`.

Sans cette activation, la page ne contacte aucun serveur tiers (pas de requête Lanyard, pas de cookie).

## Origine

Mise en page inspirée de [joynix28.me](https://joynix28.me/), refaite en HTML/CSS/JS simple et
adaptée à l'identité « Primary Asset ». Code, textes et assets propres à ce dépôt : aucun fichier
du site d'origine n'est copié.

## Changements de la v2

- **Robustesse** : `localStorage` protégé (le site ne plante plus si le navigateur le bloque) ; chaque bloc JS est isolé, une erreur n'empêche plus l'affichage du reste ; l'écran de chargement disparaît si JavaScript est désactivé.
- **Corrections** : balisage HTML cassé dans `confidentialite.html` (`<p>` non fermé) ; touche Échap de l'éditeur qui ne marchait qu'une fois ; fautes dans `content.js` (« connaît », « bêta », « Projet principal »).
- **Mobile** : la navigation ne disparaît plus sous 820 px, elle passe sur une ligne défilante.
- **Navigation** : section active surlignée, lien « Profil » ajouté, liens externes annoncés « nouvel onglet » aux lecteurs d'écran.
- **Listes** : les étiquettes des résultats sont séparées (plus de virgules dans un lien) ; les bots et communautés renvoient vers leur projet.
- **Thème** : appliqué avant l'affichage (plus de flash sombre pour les visiteurs en mode clair), `theme-color` clair/sombre.
- **SEO / partage** : `og:url`, `og:image` (`og-image.png`), cartes Twitter, JSON-LD, `404.html`, `sitemap.xml` mis à jour.
- **Dépôt** : `_gitignore` et `_nojekyll` renommés en `.gitignore` et `.nojekyll`.
- **Impression** : feuille de style dédiée.

## Design v3

Palette indigo nuit + accent violet (clair/sombre), carte Discord façon fenêtre de profil placée dans l'accueil, projets en grille à tailles variées (le premier projet de `content.js` est mis en avant : mets-y ton projet principal), pastilles de couleur générées depuis le nom du projet, domaine affiché sur chaque fiche. Le champ `label` de la carte n'est plus affiché.
