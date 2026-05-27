# Métricas de Evaluación de SOM

Presentación interactiva sobre métricas de evaluación de **Mapas Autoorganizados de Kohonen (SOM)**, desarrollada para el curso de Inteligencia Artificial — Corte 3, Universidad Popular del Cesar 2026-I.

## Vista previa

La presentación cubre 17 diapositivas organizadas en tres partes:

| Parte | Contenido |
|-------|-----------|
| **Parte 1** | Contexto y mapa de métricas |
| **Parte 2** | QE · Distorsión · Error Topográfico · Producto Topográfico · Clasificación · Pureza · Entropía · Matriz de Confusión |
| **Parte 3** | Ejemplo numérico completo · Demo en vivo de entrenamiento SOM |

## Tecnologías

- **React 18** + **Vite 6**
- **Framer Motion** — transiciones y animaciones
- **Tailwind CSS** — estilos
- **KaTeX** — fórmulas matemáticas
- **D3.js** — visualizaciones interactivas
- **Canvas 2D API** — fondo animado y portada

## Instalación y uso local

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/som-presentation.git
cd som-presentation

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en el navegador.

## Controles de navegación

| Tecla / Acción | Función |
|----------------|---------|
| `→` / `Espacio` | Siguiente diapositiva |
| `←` | Diapositiva anterior |
| `L` | Activar / desactivar puntero láser |
| `P` | Modo presentador (notas) |
| `Esc` | Cerrar láser / notas |
| Clic en dots | Ir a diapositiva directa |

## Build para producción

```bash
npm run build
```

El resultado queda en la carpeta `dist/` listo para desplegar en Vercel, Netlify o cualquier servidor estático.

## Autor

**David Santiago Barceló Terán** — Grupo 03  
Universidad Popular del Cesar · 2026-I
