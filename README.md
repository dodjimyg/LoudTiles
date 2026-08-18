# LOUDTILES — un film temps réel dans un moteur de jeu

Un « film » entièrement codé, qui tourne dans un univers 3D temps réel façon
jeu vidéo. Esthétique inspirée de la période récente de **Harmony Korine**
(*Aggro Dr1ft*, *Baby Invasion*) : imagerie **thermique / infrarouge** +
**HUD de livestream FPS**.

Tout est procédural et tient dans un seul fichier (`index.html`), en **WebGL
brut** — aucune dépendance, aucune connexion réseau. Ouvre le fichier dans un
navigateur et regarde.

## Ce qu'il y a dedans

- **Rendu 3D temps réel** : un corridor urbain infini généré procéduralement,
  traversé par une caméra à la première personne qui dérive (drift, bob,
  micro-shake).
- **Filtre thermique** (shader) : palette « ironbow » du noir-bleu froid au
  blanc chaud, brume atmosphérique IR, corps humains qui « brûlent » en clair.
- **Post-traitement** : aberration chromatique, bloom, scanlines, grain,
  vignette.
- **HUD de jeu vidéo / livestream** : indicateur LIVE + compteur de viewers,
  killfeed, minimap radar avec balayage, crosshair, barre de vie + bouclier,
  compteur de munitions, timecode caméra, donations qui défilent.
- **Structure de « film »** : cinq actes séquencés dans le temps (vitesse,
  intensité, palette et titres à l'écran changent d'un acte à l'autre), puis
  boucle.

## Utilisation

Ouvre `index.html` dans un navigateur récent (Chrome/Edge/Safari).

- **● Rec** — enregistre la scène (vidéo) et télécharge un fichier `.mp4`
  (ou `.webm` selon le navigateur). Reclique pour arrêter.
- **Photo** — capture une image `.png` de l'instant.
- **Plein écran** — bascule en plein écran.
- Bouge la souris pour incliner légèrement le regard.

L'export vidéo utilise `MediaRecorder` + `canvas.captureStream`. Pour un rendu
image par image parfaitement fluide (au lieu d'une capture en temps réel), on
peut brancher un enregistreur frame-by-frame — voir les pistes ci-dessous.

## Pistes d'extension

- Bande-son (drone WebAudio synchronisé aux actes, intégrée au flux enregistré).
- Personnages/masques générés, scénario, sous-titres.
- Rendu offline frame-by-frame vers ffmpeg pour une qualité maîtrisée.
- Contrôle live (clavier/MIDI) pour jouer le film comme un set VJ.
