# LOUDTILES // aggr0 drlft

Un « film » entièrement codé, temps réel, dans un univers 3D de jeu vidéo.
Esthétique inspirée de la période récente de **Harmony Korine**
(*Aggro Dr1ft*, *Baby Invasion*) : rue de motel californienne cramée, brume,
palmiers, voiture en feu, et un **héros accroupi** au premier plan (grosse
afro, lunettes blanches, camo, gilet tactique « BABY INVASION »), le tout sous
un **HUD de jeu vidéo** façon livestream FPS.

Tout est procédural, en **WebGL brut** — aucune dépendance, aucune connexion
réseau. Ouvre les fichiers dans un navigateur.

## Fichiers

- **`scene.html`** — **« Rencontre avec Koffi »**, un court-métrage scénarisé
  et joué en temps réel : POV du protagoniste au sol, trois soldats qui
  approchent, **Koffi** qui surgit et les abat un par un (**killfeed façon
  Call of Duty** + bandeau `KOFFI — n KILLS`), puis qui s'approche, tend la
  main et relève le protagoniste avant de repartir. Sous-titres de la
  narration à chaque plan, letterbox cinéma, flashs de tir, fumée, mode
  thermique, boucle, **Rejouer** et export vidéo.
- **`index.html`** — le film/VJ loop temps réel (rue de motel + héros + HUD).
- **`character.html`** — le **visualiseur 3D du personnage principal** :
  orbite à la souris (glisser = tourner, molette = zoom), **sélecteur de
  pose** (bouton *Pose ▸*), rotation automatique, mode **fil de fer**, mode
  **thermique**, **export `.OBJ` + `.MTL`** de la pose courante (pour ouvrir
  le modèle dans Blender / tout logiciel 3D), et photo.
- **`world.js`** — le **décor** partagé (rue de motel, enseigne, palmiers,
  voiture en feu, etc.), utilisé par le film et par la scène.
- **`hero.js`** — le **modèle 3D du héros** et les primitives partagées
  (source unique utilisée par le film et par le visualiseur), plus le GLSL des
  matériaux. Le personnage y est construit à partir de boîtes et de sphères :
  tête (mâchoire, nez), afro volumineuse, lunettes blanches (monture + verres
  teintés + branches), shemagh, tee camo à manches, gilet plaque avec pouches,
  sac à dos + antenne radio, avant-bras tatoués, pantalon cargo à genouillères,
  rangers. Le personnage est **articulé par pose** : chaque pose est un jeu de
  positions d'articulations (pieds, genoux, hanches, bassin, torse, épaules,
  coudes, mains, tête) que l'assembleur transforme en modèle complet.

  **6 poses** (d'après les planches de référence) :
  `crouch_fists` (accroupi, poings aux joues), `crouch_rest` (accroupi, avant-
  bras sur le genou), `sit_fists` (assis, poings aux joues), `grip_scarf`
  (debout, mains sur l'écharpe), `stand_profile` (debout de profil), et
  `prone_aim` (allongé en visée, avec fusil).

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
- **Réalisation** : caméra cinématique avec 6 cadrages qui s'enchaînent en
  coupes franches (léger mouvement « caméra à l'épaule » + zoom lent), et le
  **héros change de pose à chaque plan** (accroupi, assis, debout, allongé en
  visée…) — le cadrage s'adapte automatiquement à la taille de la pose.

## Utilisation

**La scène « Rencontre avec Koffi »** — ouvre `scene.html`. Elle se joue toute
seule (~40 s) et boucle ; boutons **Rejouer**, **● Rec** (export vidéo),
**Thermique [T]**, **Plein écran**.

**Le film** — ouvre `index.html` dans un navigateur récent (Chrome / Edge / Safari).

- **● Rec** — enregistre la scène et télécharge un fichier `.mp4`
  (ou `.webm` selon le navigateur). Reclique pour arrêter.
- **Photo** — capture une image `.png`.
- **Thermique [T]** — bascule la vision infrarouge (ou touche `T`).
- **Plein écran** — bascule en plein écran.
- Bouge la souris pour incliner légèrement le regard.

**Le modèle 3D** — ouvre `character.html` : glisse pour tourner autour du
personnage, molette pour zoomer, et **Export .OBJ** pour récupérer le modèle
(`.obj` + `.mtl`) et l'ouvrir dans Blender, Cinema 4D, Unity, etc.

## Pistes d'extension

- Bande-son (drone / beat WebAudio synchronisé aux coupes, intégré au flux
  enregistré).
- Animation du personnage (respiration, léger idle, retournement de tête).
- Plus de personnages / masques, dialogues, sous-titres.
- Rendu offline image par image vers ffmpeg pour une qualité maîtrisée.
- Contrôle live (clavier / MIDI) pour jouer le film comme un set VJ.
