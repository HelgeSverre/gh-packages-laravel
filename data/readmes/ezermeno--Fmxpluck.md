
# Fmxpluck

Un **scope para Eloquent** que permite generar arrays tipo `pluck` concatenando múltiples columnas, incluyendo campos de relaciones (`belongsTo`) usando notación `relacion.campo`.

## 🚀 Instalación

En tu proyecto Laravel:

```bash
composer require ezermeno/fmxpluck
```

## 📦 Agregar a Model

En tu Model (ejemplo  con modelo `User`):

```php
use Ezermeno\Fmxpluck\Fmxpluck;

class User extends Authenticatable
{
    use  Fmxpluck;
   ....
}

```


## 📦 Uso básico

En tu Controller (ejemplo  con modelo `User`):

```php
$usuarios = User::fmxPluck(['name','email'],'id',':');
```

Esto devolverá un array con el `id` como clave y el valor concatenado:

```php
[
    1 => "Juan Pérez:juan@correo.com",
    2 => "María López:maria@correo.com",
]
```

## 🔗 Uso con relaciones

Puedes incluir campos de relaciones `belongsTo` usando notación `relacion.campo`:

```php
$usuarios = User::fmxPluck(['name','email','puesto.nombre'],'id',':');
```

Esto generará:

```php
[
    1 => "Juan Pérez:juan@correo.com:Gerente",
    2 => "María López:maria@correo.com:Analista",
]
```

También puedes usar directamente nombres de tabla:

```php
$usuarios = User::fmxPluck(['users.name','users.email','puestos.nombre'],'users.id',':');
```

## ⚙️ Parámetros

```php
fmxPluck(array $columnas, string $id, string $separador = " ")
```

- **$columnas** → columnas del modelo o relaciones (`['name','email','puesto.nombre']`)  
- **$id** → columna que será la clave del array (ej. `'id'`)  
- **$separador** → texto que separa cada columna concatenada (ej. `':'`)

## 📌 Notas

- Las relaciones deben ser de tipo `belongsTo` y la FK debe estar en el modelo principal (ej. `users.puesto_id`).  
- Puedes usar directamente nombres de tabla (`puestos.nombre`) si prefieres control total.  
- El scope soporta ambos estilos: notación de relación (`puesto.nombre`) y tabla directa (`puestos.nombre`).  

## 📝 Ejemplo completo

```php
// En tu controlador
public function index()
{
    $usuarios = User::fmxPluck(['users.name','users.email','puestos.nombre'],'users.id',':');

    return view('usuarios.index', compact('usuarios'));
}
```

---

## 📄 Licencia

Este paquete se distribuye bajo la licencia MIT.

