/**
 * Puntaje de 1 a 5 con medias estrellas.
 *
 * Se dibuja con dos capas superpuestas y un recorte por ancho: una fila gris
 * completa y encima la misma fila en color, cortada al porcentaje. Asi una
 * media estrella es media estrella de verdad y no un icono aparte.
 */
export function Estrellas({
  puntaje,
  tamano = 16,
}: {
  puntaje: number;
  tamano?: number;
}) {
  const porcentaje = Math.max(0, Math.min(100, (puntaje / 5) * 100));
  const fila = "★★★★★";

  return (
    <span
      className="inline-flex items-center gap-2"
      role="img"
      aria-label={`${puntaje.toLocaleString("es-AR")} de 5 estrellas`}
    >
      <span
        className="relative inline-block select-none leading-none"
        style={{ fontSize: tamano, letterSpacing: "0.08em" }}
        aria-hidden="true"
      >
        <span className="text-[var(--line)]">{fila}</span>
        <span
          className="absolute left-0 top-0 overflow-hidden whitespace-nowrap text-[var(--bombilla)]"
          style={{ width: `${porcentaje}%` }}
        >
          {fila}
        </span>
      </span>
      <span
        className="font-display text-[0.95em] leading-none"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {puntaje.toLocaleString("es-AR")}
      </span>
    </span>
  );
}
