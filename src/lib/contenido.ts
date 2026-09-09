import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

/** Markdown remains the storage format. Never compile MDX or execute raw HTML. */
export function renderizarContenido(markdown: string): string {
  return sanitizeHtml(marked.parse(markdown, { async: false, breaks: true }) as string, {
    allowedTags: ["p", "br", "h1", "h2", "h3", "h4", "h5", "h6", "strong", "em", "s", "del", "blockquote", "ul", "ol", "li", "a", "hr", "pre", "code", "img", "table", "thead", "tbody", "tr", "th", "td"],
    allowedAttributes: { a: ["href", "title", "rel"], img: ["src", "alt", "title"], ol: ["start"], code: ["class"] },
    allowedClasses: { code: [/^language-[\w-]+$/] },
    allowedSchemes: ["https", "http", "mailto"],
    allowedSchemesByTag: { img: ["https", "http"] },
    allowProtocolRelative: false,
    transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }) },
  });
}

export function urlEditorialValida(value: string, imagen = false): boolean {
  if (!imagen && /^\/(?!\/)/.test(value)) return !/[\s\\]/.test(value);
  try {
    const url = new URL(value);
    return (imagen ? ["https:", "http:"] : ["https:", "http:", "mailto:"]).includes(url.protocol);
  } catch { return false; }
}

/** Unsupported legacy structures stay in source mode to prevent lossy conversion. */
export function requiereModoFuente(value: string): boolean {
  return /<\/?[A-Za-z][^>]*>|^\s*(import|export)\s|^\s*\|.*\|\s*$|^\s*\[[^\]]+\]:|^\s*[-*+] \[[ xX]\]|^\s*\|?\s*:?-{3,}:?\s*\|/m.test(value) || /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.test(value);
}
