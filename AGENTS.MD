# AGENTS.md — Visionneuse (front)

## Doctrine générale

- **Front/back** : les règles métier vivent côté back (back = source de vérité,
  front = présentation). Déployer back d'abord, front ensuite (le back reste
  tolérant : champs nouveaux ignorés par l'ancien front).
- **Mesurer avant d'optimiser** : aucun chantier de performance sans relevé avant.
- Ne pas « corriger » un choix délibéré documenté sans le signaler explicitement.

## Sources : trois identifiants, une grammaire

- `nom` : nom canonique, immuable, clé de tous les rattachements. Le renommage
  d'usage (`nomUsage`) est PUREMENT cosmétique : il ne touche ni les médias, ni
  le rang de « dernière utilisée ». Ne jamais « réparer » cette cosméticité en
  propageant le nom d'usage dans les médias ou la base.
- `nomUsage` : l'alias d'affichage seulement. 
- `alias[]` : autres graphies admissibles.
- « Dernière source utilisée » = un usage réel (ajout) — la CONSULTATION n'est
  PAS un usage : l'œil de GestionSources patrouille, il ne consomme pas. Les
  handlers `consulte/` ne touchent jamais le rang ni la coche d'association.
- La coche « associer à la source » vit dans le store (survit au démontage de
  ZoneAjout pendant l'upload/comparateur) ; un usage réel la re-coche, une
  décoche manuelle tient jusqu'au prochain usage réel.

## Conventions de code

- **Tags** : tri alphabétique sur `nomFormate` (pas `nom`) — sur une COPIE, jamais
  en mutant le state ou la réponse du back.
- **Commits** : préfixe en minuscules selon la nature (`fix`, `refactor`,
  `feat`...), en français, concis et descriptif.
- **Composants** : découpage dans `src/components/` (annexes de Galerie dans
  `src/components/galerie/`), composant = présentation pure quand c'est
  possible, l'état reste chez le parent orchestrateur.
- **CSS** : tous les CSS vivent dans `src/styles/` (minuscules), importés par le
  composant qui les utilise. Tout nouveau style de bouton doit être préfixé
  (ex. `.contenu .enteteFiltre input[type='button']`) pour dominer la passe
  globale `.contenu input[type='button']` (spécificité 0,2,1).

## Points de vigilance front

- Les actionsRedux restent pures : fetch et effets dans `createAsyncThunk` lu
  dans l'état, déclenché par un effet ; jamais de promesse testée dans un reducer.
- Toute ref montée/démontée (branches conditionnelles) doit figurer dans les
  dépendances de l'effet qui l'utilise.
- Donner le focus à un input fraîchement déplié : dans un `useEffect` post-rendu,
  jamais dans le `onClick` (l'input n'existe pas encore au moment du setState).
- Un filtre de recherche est un outil, pas un état : après l'action qu'il
  servait à accomplir (clic sur la pilule trouvée), l'affichage revient par défaut.
- La sélection (tags, sources) appartient à l'OBJET, pas à sa coordonnée :
  après renommage, suivre la pilule (repérer l'index dans la réponse fraîche
  `rep.res.categories` du `.then`, pas dans un state périmé) ; après
  déplacement, vider la sélection plutôt que sélectionner un autre tag.
- Les compteurs (tags, catégories) sont exacts PAR LE BACK : le front n'écrit
  jamais un compteur, il lit ceux que le back tient.
- Un enfant flex qui doit scroller a besoin de `min-height: 0` — sinon il
  s'étire à la taille de son contenu et c'est la page entière qui défile, pas
  lui (la zone des tags d'un album en a fait les frais).
- Un sélecteur d'images scopé au CONTENEUR capture aussi les icônes
  (`img.icone`) : viser les zones de contenu (`.album img`, `.couv`), jamais
  le conteneur entier.
- Le scroll ne vit pas toujours dans `window` : quand une vue met le défilement
  dans un conteneur interne (`overflow-y: auto`), une remontée en haut vise ce
  conteneur via une ref (posée dans un effet), pas `window.scroll`.
- Les colonnes de miniatures sont en float : tout élément après elles a besoin
  de `clear: both` (le flottement a déjà mordu deux fois).

## Marqueurs de galerie (styles des cartes)

- Un marqueur de type se pose sur un COIN de la carte (jamais au centre),
  petit, avec `pointer-events: none` (le clic traverse).
- Son attribut `title` dit CE QUE L'ACTION FAIT, pas ce que l'icône est
  (ex. « marquer comme consulté », pas « consulter »).
- Un marqueur perd son pouvoir à mesure de sa fréquence : sur une population
  majoritaire, préférer un marqueur léger (badge play des vidéos) à un marqueur
  fort (cadre décoratif) — le fort attend un usage rare et signant.
- Toute icône d'action naît avec son `title`.
