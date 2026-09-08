/**
 * Tipos de la base de datos.
 *
 * ESTE ARCHIVO SE GENERA. No editarlo a mano: se sobrescribe con
 *
 *   npx supabase gen types typescript --local > src/types/database.ts
 *
 * o, contra el proyecto remoto una vez vinculado,
 *
 *   npx supabase gen types typescript --linked > src/types/database.ts
 *
 * Hay que regenerarlo despues de cada migracion. Este contenido es un marcador
 * para que TypeScript compile antes de la primera generacion.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = Record<string, unknown>;
