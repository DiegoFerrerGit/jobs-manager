# The Jobs Manager — marca

## Colores
- Verde acento (fondo claro): `#00A565`
- Verde acento (fondo oscuro): `#00D683`
- Tinta: `#0E1512`
- Fondo oscuro de la app: `#0B1310`
- Tipografía del wordmark: **Space Grotesk** 700

## Qué archivo usar

| Archivo | Para qué |
|---|---|
| `01b-mira-tres-arcos-claro.svg` / `-oscuro.svg` | **La marca principal.** Barra lateral, encabezados, cualquier lugar de 24px para arriba. |
| `01d-favicon-claro.svg` / `-oscuro.svg` | La misma marca simplificada, para 16–20px. |
| `favicon.svg` / `favicon-verde.svg` | Ícono con fondo propio: pestaña del navegador, PWA, app en el celular. |
| `lockup-horizontal-*.svg` | Marca + nombre, en fila. Barra lateral expandida, encabezado, firma de mail. |
| `lockup-apilado-*.svg` | Marca + nombre, apilado. Pantalla de login. |
| `01-mira-*.svg` | La versión original de cuatro conceptos (dos cortes en vez de tres arcos). |
| `02-embudo-*`, `03-columnas-*`, `04-lugar-validado-*` | Los otros tres conceptos, por si querés volver sobre alguno. |

Los `-claro` van sobre fondos blancos o claros; los `-oscuro` sobre el verde
oscuro de la app.

## Nota sobre los lockups
El nombre va como `<text>` con Space Grotesk. En el navegador se ve bien si la
fuente está cargada (ya la tenés por Google Fonts). Si vas a mandar el SVG a
una imprenta o a alguien que no tiene la fuente, convertí el texto a curvas
antes (en Figma: Outline Stroke / Flatten).

## Uso en Next.js
Los SVG de marca no llevan `fill` ni `stroke` hardcodeado en el contorno
exterior más allá de los colores de arriba, así que lo más simple es tener dos
componentes:

```tsx
// components/Logo.tsx
export function LogoMark({ size = 32, dark = false }) {
  const ink = dark ? '#F2F5F3' : '#0E1512';
  const accent = dark ? '#00D683' : '#00A565';
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} fill="none" aria-hidden>
      <g stroke={ink} strokeWidth={4} strokeLinecap="round">
        <path d="M24 6 A18 18 0 0 1 41.73 27.12" />
        <path d="M39.59 33 A18 18 0 0 1 12.43 37.79" />
        <path d="M8.41 33 A18 18 0 0 1 17.84 7.09" />
      </g>
      <circle cx="24" cy="24" r="8.5" stroke={ink} strokeWidth={4} />
      <circle cx="24" cy="24" r="3.6" fill={accent} />
    </svg>
  );
}
```

Para el favicon, poné `favicon.svg` en `/app/icon.svg` y Next lo sirve solo.

## Construcción
Todas las marcas viven en una grilla de 48 × 48 con trazo de 4 (5 en la
versión chica). Si dibujás algo nuevo para la familia, respetá eso y escala
parejo con el resto.
