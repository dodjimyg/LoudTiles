# LOUDTILES // aggr0 drlft

Un « film » entièrement codé, temps réel, dans un univers 3D de jeu vidéo.
Esthétique inspirée de la période récente de **Harmony Korine**
(*Aggro Dr1ft*, *Baby Invasion*) : rue de motel californienne cramée, brume,
palmiers, voiture en feu, et un **héros accroupi** au premier plan (grosse
afro, lunettes blanches, camo, gilet tactique « BABY INVASION »), le tout sous
un **HUD de jeu vidéo** façon livestream FPS.

Tout est procédural et tient dans un seul fichier (`index.html`), en **WebGL
brut** — aucune dépendance, aucune connexion réseau. Ouvre le fichier dans un
navigateur.

> Le personnage est une **silhouette stylisée low-poly** construite à partir de
> primitives (boîtes + sphères), pas la reproduction photographique d'une
> personne réelle.

## Ce qu'il y a dedans

- **Décor 3D** : rue de motel (enseigne MOTEL / NO VACANCY néon), palmiers,
  bâtiments, mur, poteaux électriques, épave de voiture en feu, débris,
  asphalte mouillé avec reflets.
- **Héros stylisé** : corps accroupi, afro (grappe de sphères), lunettes
  blanches lumineuses, écharpe, tee camo, gilet plaque, bras tatoués, rangers.
- **Rendu** : lumière solaire à contre-jour + ambiance hémisphérique, brume
  atmosphérique, matériaux procéduraux (camo, peau + tatouages, béton,
  feuillage, métal brûlé, néon).
- **Feu & fumée** : systèmes de particules (billboards additifs pour les
  flammes, alpha pour la fumée qui monte).
- **Post-traitement** : bloom, aberration chromatique, grain, léger scanline,
  vignette, étalonnage filmique.
- **Mode thermique / infrarouge** (`T`) : bascule tout l'écran en palette
  « ironbow » façon *Aggro Dr1ft*.
- **HUD** : `/aggr0 drlft`, `UAV inbound`, minimap satellite, killfeed
  (`BABYINVASION` → User420 / KornDog / HarmonyKorine), timer `4:20`, score
  `68 / 19 WINNING`, arme `M4A1 30/90`, compas, grenades.
- **Réalisation** : caméra cinématique avec 6 cadrages (plan large, 3/4,
  contre-plongée, plongée, gros plan…) qui s'enchaînent en coupes franches,
  avec léger mouvement « caméra à l'épaule » et zoom lent.

## Utilisation

Ouvre `index.html` dans un navigateur récent (Chrome / Edge / Safari).

- **● Rec** — enregistre la scène et télécharge un fichier `.mp4`
  (ou `.webm` selon le navigateur). Reclique pour arrêter.
- **Photo** — capture une image `.png`.
- **Thermique [T]** — bascule la vision infrarouge (ou touche `T`).
- **Plein écran** — bascule en plein écran.
- Bouge la souris pour incliner légèrement le regard.

## Pistes d'extension

- Bande-son (drone / beat WebAudio synchronisé aux coupes, intégré au flux
  enregistré).
- Animation du personnage (respiration, léger idle, retournement de tête).
- Plus de personnages / masques, dialogues, sous-titres.
- Rendu offline image par image vers ffmpeg pour une qualité maîtrisée.
- Contrôle live (clavier / MIDI) pour jouer le film comme un set VJ.
