import { MARCA } from "@/lib/marca";
export function LogoMarca({ size = 34, className = "", dark = false }: { size?: number; className?: string; dark?: boolean }) {
  return <svg viewBox={MARCA.viewBox} width={size * MARCA.aspectRatio} height={size} role="img" aria-label="Musicales.com.ar" className={`max-w-full ${className}`}>
    <path d={MARCA.markPath} fill={dark ? "#E36285" : "var(--color-telon, #9E1B3C)"} />
    <path d={MARCA.wordPath} fill="currentColor" />
  </svg>;
}
export function Isotipo({ size = 64 }: { size?: number }) {
  return <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label="Musicales.com.ar"><path d={MARCA.markPath} fill="var(--color-telon, #9E1B3C)" /></svg>;
}
