import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Fixed port so that, if run one at a time on the same machine, this panel
// and the MediBook User panel share the same browser origin (and therefore
// the same localStorage data).
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: false },
})
