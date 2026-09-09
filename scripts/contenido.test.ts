import test from "node:test";
import assert from "node:assert/strict";
import { renderizarContenido, requiereModoFuente, urlEditorialValida } from "../src/lib/contenido";

test("renders existing Markdown headings, formatting, links and lists", () => {
  const html = renderizarContenido("## Ensayos\n\n**Elenco** y _dirección_.\n\n- Uno\n- Dos\n\n[Leer](https://example.com)");
  for (const fragment of ["<h2>Ensayos</h2>", "<strong>Elenco</strong>", "<em>dirección</em>", "<ul>", 'href="https://example.com"']) assert.ok(html.includes(fragment));
});

test("strips executable HTML, event handlers, unsafe URLs and embedded frames", () => {
  const html = renderizarContenido('<script>alert(1)</script><img src="javascript:alert(1)" onerror="alert(2)"><a href="javascript:alert(3)">Abrir</a><iframe src="https://example.com"></iframe><svg onload="alert(4)"></svg>');
  assert.doesNotMatch(html, /script|onerror|onload|javascript:|iframe|<svg/i);
  assert.match(html, /Abrir/);
});

test("rejects unsafe link and image schemes", () => {
  for (const value of ["javascript:alert(1)", "data:text/html,test", "//example.com", "/\\example.com", "vbscript:bad"]) assert.equal(urlEditorialValida(value), false, value);
  assert.equal(urlEditorialValida("https://example.com"), true);
  assert.equal(urlEditorialValida("/cartelera"), true);
  assert.equal(urlEditorialValida("mailto:redaccion@example.com"), true);
  assert.equal(urlEditorialValida("mailto:redaccion@example.com", true), false);
});

test("keeps legacy MDX, tables and checklists in source mode", () => {
  for (const value of ['<Componente nombre="x" />', "| A | B |\n|---|---|", "A | B\n--- | ---", "- [x] Hecho", "import Widget from './widget'", "---\ntitle: Nota\n---\nTexto"]) assert.equal(requiereModoFuente(value), true, value);
  for (const value of ["## Título\n\n**Texto**", "Texto\n\n---\n\nOtro párrafo"]) assert.equal(requiereModoFuente(value), false);
});
