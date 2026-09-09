import { ETIQUETA_ESTADO, type Estado } from "@/lib/editorial";

export function EstadoNota({ estado }: { estado: Estado }) {
  return <span className={`admin-status admin-status-${estado}`}><span aria-hidden="true" />{ETIQUETA_ESTADO[estado]}</span>;
}
