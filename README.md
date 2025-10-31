# BELOURA • Envíos (Vite + React + Tailwind)

## Variables
Crea un archivo `.env` en la raíz del proyecto con:
```
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/XXXXXXXXXXXX/exec
```

## Desarrollo
```bash
npm install
npm run dev
```

## Deploy (GitHub Pages con Actions)
1. Crea un repo en GitHub y sube este proyecto.
2. En `vite.config.ts`, si el sitio se publicará como `<usuario>.github.io/<repo>`, cambia:
   ```ts
   base: '/<repo>/'
   ```
3. En GitHub → Settings → Pages, selecciona **Build and deployment: GitHub Actions**.
4. Haz push a `main`. El workflow `Deploy Vite site to GitHub Pages` publicará `/dist`.

## Notas
- Asegúrate de desplegar tu Apps Script como Web App (Anyone/Anyone with link) y pegar su URL en `.env`.
- El formulario crea fila en Sheets y genera un PDF en tu carpeta de Drive; devuelve la URL pública del PDF.
