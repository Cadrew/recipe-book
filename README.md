# Site cadeau — *Mes recettes personnelles*

Ce zip contient un mini site statique (HTML/CSS/JS) :

- `index.html` : page de présentation / landing (style portfolio)
- `reader.html` : lecteur “flipbook” (page séparée)
- `book.pdf` : le manuscrit (à remplacer si besoin)

## Lancer en local

Comme c’est un site statique, le plus simple :

### Option A — Python
```bash
cd recettes-birthday-site-v2
python -m http.server 8000
```
Puis ouvre `http://localhost:8000`.

### Option B — Node
```bash
npx serve .
```

## Personnalisation rapide

- Message : `index.html` (sections HERO / “Bon anniversaire”)
- Prénom (optionnel) : ajoute `?to=Prénom` à l’URL (ça personnalise le titre et le texte cadeau)
- Remplacer le PDF : écrase `book.pdf` (garde le même nom).
  - Astuce : si tu changes le PDF, tu peux aussi mettre à jour l’aperçu dans `assets/` (images).

## Reader (flipbook)

Le lecteur utilise :
- **pdf.js** (rendu du PDF en canvas)
- **StPageFlip** (page turning)

Le mode **1 page** est un vrai mode “portrait” via `updateOrientation('portrait')` (pas un simple crop).
