/**
 * El logotipo: el nombre del dominio encerrado en una marquesina de teatro.
 *
 * Los dos puntos del dominio NO son puntos tipograficos: son lamparas ambar,
 * iguales a las del marco. Es el unico recurso conceptual de la marca y lo que
 * evita que la direccion se lea como una URL escrita al pasar.
 *
 * Ver docs/brief-identidad.md
 */

type Props = {
  /** Cuerpo tipografico del nombre. Todo lo demas escala en proporcion. */
  size?: number;
  /** Lamparas por hilera. Impar, para que una quede en el eje central. */
  bulbs?: number;
  className?: string;
};

export function Marquesina({ size = 40, bulbs = 11, className = "" }: Props) {
  const border = Math.max(1.5, size * 0.048);
  const bulb = size * 0.17;
  const gap = size * 0.43 - bulb;
  const padY = size * 0.22;
  const padX = size * 0.62;

  const row = (
    <span className="flex justify-center" style={{ gap, paddingInline: padX }}>
      {Array.from({ length: bulbs }, (_, i) => (
        <span
          key={i}
          className="block shrink-0 rounded-full bg-bombilla"
          style={{ width: bulb, height: bulb }}
        />
      ))}
    </span>
  );

  return (
    <span
      className={`inline-flex flex-col items-stretch ${className}`}
      style={{ border: `${border}px solid currentColor`, paddingBlock: padY }}
      aria-label="Musicales.com.ar"
      role="img"
    >
      {row}
      <span
        className="whitespace-nowrap text-center font-display uppercase"
        style={{
          fontSize: size,
          lineHeight: 1,
          letterSpacing: "0.02em",
          fontVariationSettings: '"wdth" 78, "wght" 800',
          paddingBlock: size * 0.26,
          paddingInline: padX,
        }}
      >
        Musicales
        <Lampara size={size} />
        com
        <Lampara size={size} />
        ar
      </span>
      {row}
    </span>
  );
}

/** El punto del dominio, como lampara. */
function Lampara({ size }: { size: number }) {
  return (
    <span
      className="inline-block rounded-full bg-bombilla align-baseline"
      style={{
        width: size * 0.15,
        height: size * 0.15,
        marginInline: size * 0.09,
        marginBottom: size * 0.06,
      }}
    />
  );
}

/** Version chica: la inicial en el marco. El nombre completo no se lee bajo 160 px. */
export function Isotipo({ size = 64 }: { size?: number }) {
  const border = Math.max(1.5, size * 0.031);
  const bulb = size * 0.078;

  const row = (
    <span className="flex justify-center" style={{ gap: bulb * 1.2 }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="block rounded-full bg-bombilla"
          style={{ width: bulb, height: bulb }}
        />
      ))}
    </span>
  );

  return (
    <span
      className="inline-flex flex-col justify-center"
      style={{
        width: size,
        height: size,
        border: `${border}px solid currentColor`,
        gap: size * 0.09,
        paddingBlock: size * 0.11,
      }}
      aria-label="Musicales.com.ar"
      role="img"
    >
      {row}
      <span
        className="text-center font-display"
        style={{
          fontSize: size * 0.44,
          lineHeight: 1,
          fontVariationSettings: '"wdth" 80, "wght" 900',
        }}
      >
        M
      </span>
      {row}
    </span>
  );
}
