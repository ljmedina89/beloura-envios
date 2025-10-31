import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ⚠️ IMPORTANTE: Si publicas en GitHub Pages como <usuario>.github.io/<repo>,
// cambia `base` a '/<repo>/' (por ejemplo '/beloura-envios-app/').
export default defineConfig({
  plugins: [react()],
  base: '/', 
})
