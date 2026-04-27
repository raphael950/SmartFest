# Architecture GPX et Live Timing

## Structure des dossiers

```
project/
├── app/
│   ├── controllers/
│   │   └── live_timing_controller.ts      # Contrôleur pour charger et parser le GPX
│   └── services/
│       └── gpx_parser.ts                  # Service de parsing GPX
├── resources/
│   └── circuits/
│       ├── README.md                       # Documentation des circuits
│       └── circuit_du_mans.pgx                     # Fichier GPX du circuit (à ajouter)
├── inertia/
│   ├── pages/
│   │   └── live-timing.tsx                # Page React avec visualisation
│   └── types/
│       └── live-timing.types.ts           # Types TypeScript
└── start/
    └── routes.ts                          # Routes, utilise LiveTimingController
```

## Installation et utilisation

### 1. Installer la dépendance `xml2js`

```bash
npm install xml2js
```

### 2. Ajouter le fichier GPX

Placez votre fichier `circuit_du_mans.pgx` dans le dossier `resources/circuits/`.

La structure attendue du GPX:
```xml
<?xml version="1.0"?>
<gpx version="1.1">
  <trk>
    <trkseg>
      <trkpt lat="48.0123" lon="0.2456">
        <ele>120</ele>
      </trkpt>
      <!-- Plus de points... -->
    </trkseg>
  </trk>
</gpx>
```

### 3. Fonctionnement

#### Service `gpx_parser.ts`

- **`parseGpx(filePath)`**: Parse le fichier GPX et retourne un array de points {lat, lon, ele}
- **`gpxPointsToSvgPath(points, viewBoxWidth, viewBoxHeight)`**: Convertit les coordonnées GPS en chemin SVG valide

#### Contrôleur `live_timing_controller.ts`

- Charge le fichier GPX du Mans
- Le parse et le convertit en path SVG
- Passe le chemin à la page React via `circuitPath`
- Fallback sur un circuit de test si le fichier n'existe pas

#### Page React `live-timing.tsx`

- Reçoit le `circuitPath` du serveur
- Affiche le circuit via SVG
- Positionne les voitures sur le circuit avec animation
- Utilise `path.getPointAtLength()` pour positionner les marqueurs

## Flux de données

```
1. Route /live-timing
   ↓
2. LiveTimingController.index()
   ├─→ parseGpx('resources/circuits/circuit_du_mans.pgx')
   ├─→ gpxPointsToSvgPath(points)
   └─→ inertia.render('live-timing', { ..., circuitPath })
   ↓
3. Live Timing Page
   ├─→ Reçoit circuitPath
   ├─→ Affiche SVG circuit
   ├─→ Anime les voitures
   └─→ Scroll du tableau des pilotes
```

## Notes techniques

- Les coordonnées GPS sont normalisées pour s'adapter au viewBox SVG (400x300)
- Le padding est appliqué automatiquement pour centrer le circuit
- L'aspect ratio est préservé
- Les voitures se positionnent avec `getPointAtLength()` API SVG
- Fallback automatique si le GPX n'existe pas

## Prochaines étapes

- [ ] Placer le fichier `circuit_du_mans.pgx` dans `resources/circuits/`
- [ ] Exécuter `npm install xml2js`
- [ ] Tester la visualisation
- [ ] Ajouter d'autres circuits (ex: `monza.gpx`, `spa.gpx`)
