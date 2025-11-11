/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KEYCLOAK_REALM?: string
  readonly VITE_KEYCLOAK_URL?: string
  readonly VITE_KEYCLOAK_CLIENT_ID?: string
  readonly VITE_KEYCLOAK_REDIRECT_URI?: string
  readonly VITE_KEYCLOAK_LOGOUT_URI?: string
  // Agregar más variables de entorno aquí según sea necesario
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

