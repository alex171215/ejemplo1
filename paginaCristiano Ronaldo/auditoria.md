# AUDITORIA.md — WCAG 2.2 AA / UX / Responsive

**Fecha:** 2026-09-07
**Archivos auditados:** `index.html`, `styles.css`, `script.js`
**Normativa:** WCAG 2.2 Nivel AA
**Metodo:** Revision estatica del codigo fuente + comprobaciones automatizadas con Node.js v24.15.0 (calculo de ratios de contraste, analisis de estructura semantica, validacion de sintaxis JS/CSS)

---

## 1. Resumen ejecutivo

| Severidad | Encontrados |
|---|---|
| Criticos | 2 |
| Altos | 3 |
| Medios | 3 |
| Bajos | 2 |
| **Criterios cumplidos** | **10** |

El sitio tiene una base solida: estructura semantica correcta, jerarquia de encabezados sin saltos, contraste AA en todos los pares de color, imagenes con alt descriptivo y landmarks HTML5 bien formados. Los problemas se concentran en **accesibilidad de teclado** (timeline), **contenido dependiente de JavaScript** (fade-in), **etiquetas ARIA ausentes** y **ausencia de prefers-reduced-motion**.

---

## 2. Hallazgos

### 2.1 Criticos

#### C1 — Sin skip-to-content link (SC 2.4.1 Bypass Blocks)

- **Criterio WCAG:** 2.4.1 A (requerido para AA)
- **Archivo:** `index.html`
- **Evidencia:** No existe ningun enlace del tipo `<a href="#main-content">` ni ningun `<a>` cuyo href apunte al `<main>`. El `<nav>` fijo (linea 21, `position: fixed`) se repite en todas las paginas, pero no hay forma de saltarlo.
- **Impacto:** Los usuarios de teclado y lectores de pantalla deben presionar Tab en cada uno de los 4+ enlaces del nav antes de llegar al contenido.
- **Correccion:** Anadir un enlace oculto视觉mente al inicio del `<body>` que apunte a un `id` en `<main>` y se muestre solo al recibir foco:
  ```html
  <body>
    <a href="#contenido-principal" class="skip-link">Saltar al contenido</a>
    ...
    <main id="contenido-principal">
  ```

#### C2 — Timeline sin accesibilidad de teclado (SC 2.1.1 Keyboard, SC 4.1.2 Name/Role/Value)

- **Criterio WCAG:** 2.1.1 A + 4.1.2 A
- **Archivos:** `index.html:53-94`, `script.js:56-67`
- **Evidencia:**
  - Los 6 `<div class="timeline-item">` no tienen `tabindex`, por lo que **no son focusables** con Tab.
  - No existen handlers `keydown` en `script.js` — solo `mouseenter` (linea 57) y `click` (linea 63).
  - No tienen atributo `role` que indique su naturaleza interactiva.
  - `styles.css:119` define `:focus-visible` para `.nav-links a` pero **ninguna regla** para `.timeline-item`.
- **Impacto:** Un usuario que navega exclusivamente con teclado **no puede interactuar** con ninguno de los 6 items de la linea de tiempo.
- **Correccion:**
  1. Anadir `tabindex="0"` y `role="button"` a cada `.timeline-item` en HTML.
  2. Anadir listener `keydown` que responda a Enter (13) y Space (32).
  3. Anadir regla CSS `.timeline-item:focus-visible` con box-shadow visible.

---

### 2.2 Altos

#### A1 — Contenido invisible sin JavaScript (SC 1.3.3 Sensory Characteristics)

- **Criterio WCAG:** 1.3.3 A (consecuencia indirecta)
- **Archivos:** `styles.css:461-470`, `script.js:1-18`
- **Evidencia:**
  - `styles.css:461-462` define `.fade-in { opacity: 0; transform: translateY(30px); }`.
  - Las 4 secciones (`#biografia`, `#trayectoria`, `#estadisticas`, `#galeria`) tienen `class="fade-in"`.
  - Solo `script.js` (IntersectionObserver, lineas 5-16) agrega la clase `visible` que restaura `opacity: 1`.
  - **Sin JavaScript habilitado, el 100% del contenido debajo del hero es invisible.**
- **Impacto:** Usuarios con JS deshabilitado, navegadores con JS bloqueado, o situationes donde el script no carga (error de red, CDN bloqueado) ven una pagina casi vacia.
- **Correccion:** Usar una regla `@media (scripting: none)` que anule `.fade-in` a `opacity: 1; transform: none`, o aplicar fade-in solo via clase inicial desde el HTML en lugar de como defecto del CSS.

#### A2 — H3 utilizado para datos numericos, no encabezados (SC 1.3.1 Info and Relationships)

- **Criterio WCAG:** 1.3.1 A
- **Archivo:** `index.html:104, 108, 112, 116`
- **Evidencia:**
  ```html
  <h3 class="counter" data-target="900">0</h3>
  <h3 class="counter" data-target="5">0</h3>
  <h3 class="counter" data-target="5">0</h3>
  <h3 class="counter" data-target="130">0</h3>
  ```
  Estos son **numeros de estadistica**, no encabezados. Un lector de pantalla anuncia "encabezado nivel 3: 0", lo cual es confuso y rompe la jerarquia (H2 → H3 en estadisticas no es una subdivision logica).
- **Correccion:** Cambiar `<h3>` por `<p class="counter" data-target="900" role="status" aria-live="polite">0</p>` (o `<span>`) y ajustar la fuente con la regla CSS existente.

#### A3 — Footer links pierden outline visible en focus (SC 2.4.7 Focus Visible)

- **Criterio WCAG:** 2.4.7 AA
- **Archivo:** `styles.css:443-447`
- **Evidencia:**
  ```css
  footer a:hover,
  footer a:focus {
      text-decoration: underline;
      outline: none;   /* <-- elimina el outline del navegador */
  }
  ```
  A diferencia de `.nav-links a` y `.cta-btn`, que tienen reglas `:focus-visible` de respaldo (lineas 119-122 y 191-193), **el footer no tiene ninguna regla `:focus-visible`**. El outline se elimina y nunca se restaura.
- **Correccion:** Anadir `footer a:focus-visible` con un outline o box-shadow visible, o eliminar `outline: none` del estado `:focus` del footer.

---

### 2.3 Medios

#### M1 — Sin prefers-reduced-motion (SC 2.3.3 Animation from Interactions)

- **Criterio WCAG:** 2.3.3 AAA (recomendado para AA como buena practica)
- **Archivo:** `styles.css`
- **Evidencia:**
  - `styles.css:150`: animacion `slideUp` en `.hero-content`
  - `styles.css:461-470`: transiciones `opacity` y `transform` en `.fade-in`
  - `styles.css:92, 304, 346, 403`: multiples transiciones en hover/focus
  - Ninguna consulta `@media (prefers-reduced-motion: reduce)` en todo el archivo.
  - `script.js` tampoco verifica `matchMedia('(prefers-reduced-motion: reduce)')`.
- **Impacto:** Usuarios con vestibular disorders o sensibilidad al movimiento no pueden reducir las animaciones.
- **Correccion:**
  ```css
  @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
          animation-duration: 0.01ms !important;
          transition-duration: 0.01ms !important;
      }
      .fade-in { opacity: 1; transform: none; }
  }
  ```

#### M2 — Fechas en `<span>` sin semantica temporal (SC 1.3.1)

- **Criterio WCAG:** 1.3.1 A (mejora recomendada)
- **Archivo:** `index.html:56, 63, 70, 78, 85, 92`
- **Evidencia:** Las 6 fechas de la timeline usan `<span>`:
  ```html
  <span>2002 - 2003</span>
  ```
  El elemento `<time>` esta diseno para representar fechas/duraciones y permite a los lectores de pantalla interpretarlas correctamente.
- **Correccion:** Reemplazar por `<time>` o anadir `aria-label` con la fecha en formato legible.

#### M3 — Nav sin aria-label (SC 1.3.1)

- **Criterio WCAG:** 1.3.1 A
- **Archivo:** `index.html:21`
- **Evidencia:** `<nav id="navbar">` sin `aria-label`. Aunque solo hay un `<nav>` (lo cual tecnicamente no requiere label segun la spec), es buena practica anadirlo para que los lectores de pantalla anuncien "Navegacion principal" en lugar de solo "navegacion".
- **Correccion:** `<nav id="navbar" aria-label="Navegacion principal">`.

---

### 2.4 Bajos

#### B1 — pageYOffset deprecado (SC 4.1.1 Parsing / Code Quality)

- **Archivo:** `script.js:80`
- **Evidencia:** `if (pageYOffset >= ...)` — `window.pageYOffset` esta deprecado. Deberia usarse `window.scrollY`.
- **Correccion:** Reemplazar `pageYOffset` por `window.scrollY`.

#### B2 — Nav movil oculto sin alternativa (SC 2.1.1 Keyboard)

- **Archivo:** `styles.css:505-508`
- **Evidencia:**
  ```css
  @media screen and (max-width: 768px) {
      .nav-links { display: none; }
  ```
  Los links de navegacion se ocultan completamente sin proporcionar menu hamburguesa ni alternativa. La navegacion interna queda inaccesible en movil.
- **Impacto:** En pantallas < 768px no hay forma de navegar entre secciones (excepto scroll manual).
- **Correccion:** Aceptar para primera version. Implementar hamburger menu en futura iteracion.

---

## 3. Criterios WCAG 2.2 AA cumplidos

| # | Criterio | Evidencia |
|---|---|---|
| 1 | **1.1.1 No-texto** — Todas las imagenes tienen `alt` descriptivo | 4/4 imagenes verificadas (lineas 43, 128, 131, 134). Ratios: todos presentes y descriptivos. |
| 2 | **1.3.1 Info — Estructura semantica** | DOCTYPE, `lang="es"`, `<main>`, `<nav>`, `<header>`, `<footer>`, `<section>` con IDs correctos. |
| 3 | **1.3.1 Info — Jerarquia de encabezados** | H1(linea 15) → H2(lineas 36,51,101,125) → H3(lineas 55,62,69,76,83,90). Sin saltos de nivel. |
| 4 | **1.4.3 Contraste (minimo)** | 12 pares de color verificados automaticamente. Minimo 5.71:1 (text-secondary on card-bg), maximo 19.28:1 (text-primary on bg-darker). Todos superan 4.5:1 para texto normal y 3:1 para texto grande. |
| 5 | **1.4.4 Resize text** — Unidades relativas (rem) usadas en tipografia. Sin fijos en px para tamanos de fuente. |
| 6 | **2.4.2 Page Titled** — `<title>Cristiano Ronaldo | Leyenda del Futbol</title>` (linea 7). |
| 7 | **2.4.4 Link Purpose** — Todos los enlaces tienen texto descriptivo: "Biografia", "Trayectoria", "Estadisticas", "Galeria", "Descubre su historia", "Volver arriba". |
| 8 | **3.1.1 Language of Page** — `<html lang="es">` (linea 2). |
| 9 | **3.1.2 Language of Parts** — Todo el contenido esta en espanol. No hay fragments en otro idioma. |
| 10 | **4.1.2 Name/Role/Value** — Landmarks HTML5 correctos: `<nav>`, `<main>`, `<header>`, `<footer>` proporcionan roles implicitos. |

---

## 4. Evidencia concreta — Archivos y lineas afectadas

| Hallazgo | Archivo | Linea(s) | Elemento / Regla |
|---|---|---|---|
| C1 — Sin skip link | `index.html` | 11 (despues de `<body>`) | No existe `<a href="#...">Saltar al contenido` |
| C2 — Timeline sin tabindex | `index.html` | 53, 60, 67, 74, 81, 88 | `<div class="timeline-item">` sin tabindex ni role |
| C2 — Timeline sin keydown | `script.js` | 56-67 | Solo `mouseenter` y `click` |
| C2 — Timeline sin focus-visible | `styles.css` | — | No existe regla `.timeline-item:focus-visible` |
| A1 — fade-in opacity:0 | `styles.css` | 461-462 | `.fade-in { opacity: 0; transform: translateY(30px); }` |
| A1 — Sin media scripting:none | `styles.css` | — | No existe `@media (scripting: none)` |
| A2 — h3 para datos | `index.html` | 104, 108, 112, 116 | `<h3 class="counter">0</h3>` |
| A3 — footer outline:none | `styles.css` | 446 | `footer a:focus { outline: none; }` |
| A3 — Sin footer focus-visible | `styles.css` | — | No existe regla `footer a:focus-visible` |
| M1 — Sin reduced-motion | `styles.css` | — | No existe `@media (prefers-reduced-motion)` |
| M2 — span para fechas | `index.html` | 56, 63, 70, 78, 85, 92 | `<span>2002 - 2003</span>` |
| M3 — Nav sin aria-label | `index.html` | 21 | `<nav id="navbar">` |
| B1 — pageYOffset | `script.js` | 80 | `pageYOffset` (deprecado) |
| B2 — Nav oculto en movil | `styles.css` | 506-508 | `display: none` sin alternativa |

---

## 5. Recomendaciones de correccion (por prioridad)

### Prioridad 1 — Criticos

**C1: Skip link**
```html
<!-- Como primer hijo de <body>, antes del header -->
<a href="#contenido-principal" class="skip-link">Saltar al contenido</a>
```
```css
.skip-link {
    position: absolute;
    top: -100%;
    left: 0;
    padding: 1rem 2rem;
    background: var(--accent-gold);
    color: var(--bg-darker);
    z-index: 10000;
    font-weight: 600;
    text-decoration: none;
}
.skip-link:focus {
    top: 0;
}
```
Y anadir `id="contenido-principal"` al `<main>`.

**C2: Timeline accesible**
```html
<!-- En cada .timeline-item -->
<div class="timeline-item" data-team="sporting" tabindex="0" role="button" aria-label="Sporting CP, 2002 - 2003">
```
```js
// En script.js, dentro del forEach de timelineItems:
item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        timelineItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
    }
});
```
```css
.timeline-item:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--accent-gold);
    border-radius: 15px;
}
```

### Prioridad 2 — Altos

**A1: Contenido sin JS**
```css
@media (scripting: none) {
    .fade-in {
        opacity: 1 !important;
        transform: none !important;
        transition: none !important;
    }
}
```

**A2: h3 para datos**
```html
<!-- Cambiar -->
<h3 class="counter" data-target="900">0</h3>
<!-- Por -->
<p class="counter" data-target="900" role="status" aria-live="polite" aria-label="900 goles oficiales">0</p>
```
Ajustar la regla CSS `.stat-card h3` para que aplique tambien a `.stat-card .counter`.

**A3: Footer focus-visible**
```css
footer a:focus-visible {
    outline: 2px solid var(--accent-gold);
    outline-offset: 2px;
    border-radius: 2px;
}
```

### Prioridad 3 — Medios

**M1: Reduced motion**
```css
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
    .fade-in {
        opacity: 1 !important;
        transform: none !important;
    }
}
```

**M2: Fechas semanticas**
```html
<!-- Cambiar <span> por <time> -->
<time>2002 - 2003</time>
```

**M3: Nav aria-label**
```html
<nav id="navbar" aria-label="Navegacion principal">
```

### Prioridad 4 — Bajos

**B1:** Reemplazar `pageYOffset` por `window.scrollY` en `script.js:80`.

**B2:** Implementar menu hamburguesa en iteracion futura.

---

## 6. Pruebas a repetir despues de corregir

| # | Prueba | Herramienta / Metodo |
|---|---|---|
| 1 | Skip link aparece al presionar Tab en la primera interaccion | Abrir pagina, presionar Tab una vez, verificar que aparece "Saltar al contenido" |
| 2 | Timeline navegable con Tab y activacion con Enter/Espacio | Presionar Tab hasta llegar al primer `.timeline-item`, verificar focus visible, presionar Enter |
| 3 | Contenido visible con JS deshabilitado | Abrir pagina con JS bloqueado (DevTools > Disable JS) y verificar que las secciones son visibles |
| 4 | Jerarquia de encabezados con NVDA/VoiceOver | Escuchar anuncio de encabezados y verificar que los contadores no se anuncian como "encabezado nivel 3" |
| 5 | Footer link visible al hacer focus con teclado | Tab hasta "Volver arriba" y verificar que tiene outline visible |
| 6 | Animaciones respetan prefers-reduced-motion | En DevTools > Rendering > Emulate CSS media: prefers-reduced-motion: reduce |
| 7 | Contraste se mantiene tras correcciones | Re-ejecutar script de calculo de ratios de contraste |
| 8 | Responsive a 320px, 390px, 768px, escritorio | Verificar que no hay overflow horizontal y que el layout se adapta |
| 9 | Navegacion completa con Tab en todos los breakpoints | Verificar focus visible en cada enlace interactivo |
| 10 | Scroll smooth funciona en todos los enlaces internos | Clic en cada link del nav y verificar scroll suave |
| 11 | Contadores se animan al llegar a estadisticas | Scroll hasta la seccion y verificar que los numeros cuentan |
| 12 | Lectura con screen reader completa | NVDA (Windows) o VoiceOver (macOS): navegar por landmarks, headings, y links |

---

## 7. Metodologia de verificacion

| Comprobacion | Metodo | Resultado |
|---|---|---|
| Carga de styles.css y script.js | Busqueda de `<link>` y `<script>` en HTML | OK |
| Enlaces internos | Regex sobre href="#..." cruzado con id="..." | 6/6 OK |
| Imagenes con alt | Regex sobre `<img>` tags | 4/4 OK |
| Contraste de color | Script Node.js con formula WCAG (luminancia relativa) | 12/12 pares OK (min 5.71:1) |
| Jerarquia de encabezados | Extraccion de `<h1>`-`<h6>` con su nivel | H1→H2→H3 sin saltos |
| Landmarks | Conteo de `<nav>`, `<main>`, `<header>`, `<footer>`, `<section>` | Correctos |
| Sintaxis JS | `new Function()` parse con Node.js | Sin errores |
| Sintaxis CSS | Verificacion de balance de llaves | OK |
| tabindex en timeline | Busqueda de `tabindex` en HTML | 0 encontrados (6 items) |
| keydown en timeline | Busqueda de `keydown` en JS | No encontrado |
| prefers-reduced-motion | Busqueda en CSS | No encontrado |
| pageYOffset | Busqueda en JS | Encontrado (deprecado) |
| outline:none sin focus-visible | Cruce de reglas `outline: none` con reglas `:focus-visible` | Footer sin respaldo |

---

*Informe generado mediante revision estatica del codigo. Las pruebas con screen reader, navegadores reales y dispositivos moviles quedan pendientes de validacion manual (seccion 6).*
