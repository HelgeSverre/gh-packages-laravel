# Laravel To Upper

Um pacote Laravel que normaliza atributos de modelos para letras maiúsculas antes de persistir os dados. A trait `HasToUpper` integra-se ao pipeline padrão do Eloquent, respeitando mutators, casts e listas configuráveis de exceção.

---

## 🚀 Instalação

```bash
  composer require risetechapps/to-upper-for-laravel
```

Opcionalmente publique a configuração para personalizar o comportamento global:

```bash
  php artisan vendor:publish --provider="RiseTechApps\\ToUpper\\ToUpperServiceProvider" --tag=config
```

---

## ⚙️ Uso básico

```php
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use RiseTechApps\ToUpper\Traits\HasToUpper;

class Client extends Model
{
    use HasFactory, HasToUpper;
}
```

Atribuições de strings serão convertidas para maiúsculo (UTF-8 por padrão) antes de chegarem ao array interno de atributos do Eloquent:

```php
$client = new Client();
$client->name = 'joão silva';
$client->city = ' porto alegre ';

$client->name; // JOÃO SILVA
$client->city; // PORTO ALEGRE (trim aplicado por padrão)
```

---

## 🧩 Configuração avançada

### Listas de controle

No model, defina as propriedades abaixo para controlar quais atributos devem (ou não) ser normalizados. As listas são mescladas com os valores definidos em `config/to-upper.php`.

```php
class Client extends Model
{
    use HasToUpper;

    protected array $only_upper = ['code'];      // apenas estes atributos serão convertidos
    protected array $no_upper   = ['email'];     // estes atributos nunca serão convertidos
    protected array $ignore_upper = ['notes'];   // ignora atributos adicionais
}
```

Quando `only_upper` não estiver vazia, somente os atributos informados serão convertidos. Caso contrário, todos os atributos string serão normalizados, exceto aqueles presentes em `no_upper`, `ignore_upper` ou que representem relacionamentos morph (`*_type`, `*_id` por padrão).

### Casts do Eloquent

Atributos com casts que não são strings são automaticamente ignorados para evitar corromper dados:

```php
protected $casts = [
    'settings' => 'json',      // Ignorado - não converte
    'tags' => 'array',         // Ignorado - não converte
    'metadata' => 'object',    // Ignorado - não converte
    'name' => 'string',        // Convertido para maiúsculas
];
```

**Casts ignorados automaticamente:** `array`, `json`, `object`, `collection`, `encrypted`.

### Codificação e trim

Controle da codificação e do comportamento de `trim` por model:

```php
class Client extends Model
{
    use HasToUpper;

    protected string $uppercase_encoding = 'ISO-8859-1';
    protected bool $uppercase_trim = false; // mantém espaços ao redor
}
```

Ou ajuste globalmente via arquivo de configuração publicado:

```php
return [
    'encoding' => 'UTF-8',
    'trim' => true,
    'only_upper' => [],
    'no_upper' => [],
    'ignore_attributes' => ['id', 'password', 'remember_token'],
    'morph_suffixes' => ['_type', '_id'],
];
```

---

## 🔧 Comando Artisan

Normalize dados existentes em massa:

```bash
# Normalizar todas as colunas fillable
php artisan toupper:normalize Client

# Especificar colunas
php artisan toupper:normalize Client --columns=name,city,address

# Preview sem alterar (dry-run)
php artisan toupper:normalize Client --columns=name --dry-run

# Ajustar tamanho do chunk para grandes volumes
php artisan toupper:normalize Client --chunk=500
```

---

## 🔍 Scopes de Busca

Busca case-insensitive independente do collation do banco:

```php
// Busca por "joão" ou "JOÃO"
Client::whereUpper('name', 'joão')->get();

// Combinar com outros where
Client::where('active', true)
    ->whereUpper('name', 'joão')
    ->get();

// Ou condição
Client::whereUpper('name', 'joão')
    ->orWhereUpper('email', 'joao@example.com')
    ->get();
```

---

## 🎣 Callbacks de Transformação

Personalize a conversão com hooks no model:

```php
class Client extends Model
{
    use HasToUpper;

    protected function beforeToUpper(string $key, string $value): string
    {
        // Executa antes da conversão
        if ($key === 'email') {
            return strtolower($value); // Mantém e-mail minúsculo
        }
        return $value;
    }

    protected function afterToUpper(string $key, string $value): string
    {
        // Executa depois da conversão
        if ($key === 'name') {
            return str_replace('  ', ' ', $value); // Remove espaços duplos
        }
        return $value;
    }
}
```

---

## 🗄️ Macro no Query Builder

Atualize diretamente no banco de dados:

```php
use Illuminate\Support\Facades\DB;

// Query Builder
DB::table('clients')->toupper(['name', 'city']);

// Eloquent
Client::query()->toupper(['name', 'city']);

// Com condição
Client::where('active', true)->toupper(['name']);
```

**Nota:** O macro usa `UPPER()` nativo do banco, então não passa pelos callbacks do model.

## 🤝 Contribuição

1. Faça um fork do repositório
2. Crie uma branch (`feature/nova-funcionalidade`)
3. Faça commit das suas alterações
4. Envie um Pull Request

---

## 📜 Licença

Este projeto é distribuído sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

💡 **Desenvolvido por [Rise Tech](https://risetech.com.br)**
