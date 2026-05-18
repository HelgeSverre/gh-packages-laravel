¡Tienes toda la razón! El paquete ha pasado de ser un simple filtro de fechas a un **motor de datos completo** para tablas "Lazy".

Aquí tienes el **README.md** actualizado con todas las nuevas "armas" que le pusimos (Búsqueda global, selección de columnas y el Trait):

---

# Time Laravel Package ⏱️

Este paquete es el puente inteligente entre tus modelos de Laravel y el componente **TiTableLazy**. Permite transformar cualquier consulta de base de datos en una API paginada, filtrable y optimizada con una configuración mínima.

## 🚀 Novedades: "Pro" Features

- **Búsqueda Global:** Configura múltiples columnas para buscar texto libre con una sola línea.

- **Selección Inteligente (`only`):** Optimiza el ancho de banda enviando solo las columnas necesarias.

- **Trait `InteractsWithTiTable`:** Limpieza absoluta en tus controladores.

- **Filtros de Tiempo:** Soporte nativo para `today`, `yesterday`, `this_week`, `this_month`.

---

## 🛠️ Instalación

### En Desarrollo (Local)

Vincula el paquete localmente en el `composer.json` de tu proyecto:

JSON

```
"repositories": [
    { "type": "path", "url": "../time-laravel-pkg" }
],
"require": {
    "time/laravel": "dev-main"
}
```

---

## 🛰️ Implementación Pro

Ahora puedes usar el **Trait** para mantener tus controladores limpios y legibles.

### 1. En el Controlador

Usa el método `tiTableResponse` y configura el comportamiento de la tabla mediante un callback:

PHP

```
namespace App\Http\Controllers\Api;

use App\Models\Log;
use Illuminate\Http\Request;
use Time\Laravel\InteractsWithTiTable;

class LogController extends Controller
{
    use InteractsWithTiTable;

    public function index(Request $request)    {
        // 1. Definimos la fuente de datos
        $query = Log::query();

        // 2. Configuramos y respondemos
        return $this->tiTableResponse($query, $request, function($table) {
            $table->only(['id', 'event_name', 'status', 'started_at']) // Optimización de columnas
                  ->searchable(['event_name', 'status']);               // Búsqueda global
        });
    }
}
```

---

## 🔍 API Query Guide

El motor procesa automáticamente los siguientes parámetros enviados desde el frontend:

| Parámetro   | Ejemplo                    | Acción                                                   |
| ----------- | -------------------------- | -------------------------------------------------------- |
| `search`    | `?search=error`            | Busca en todas las columnas definidas en `searchable()`. |
| `filters`   | `?filters[status]=success` | Filtra por valor exacto.                                 |
| `filters`   | `?filters[at]=today`       | Filtra usando atajos de tiempo dinámicos.                |
| `sortField` | `?sortField=id`            | Define la columna de ordenamiento.                       |
| `sortOrder` | `?sortOrder=-1`            | `-1` para DESC, `1` para ASC.                            |
| `rows`      | `?rows=50`                 | Define cuántos registros traer por página.               |

Exportar a Hojas de cálculo

---

## ⚙️ Estructura del JSON de Respuesta

El paquete siempre responde con el formato estándar que espera el componente de UI:

JSON

```
{
    "success": true,
    "data": [...],
    "total": 10500,
    "page": 1,
    "rows": 15
}
```

---

### 
