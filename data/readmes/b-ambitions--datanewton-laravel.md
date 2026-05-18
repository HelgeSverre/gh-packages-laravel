# Datanewton Laravel Package

Laravel пакет для работы с API Datanewton - сервиса проверки контрагентов.

## Установка

```bash
composer require b-ambitions/datanewton-laravel
```
## Конфигурация
### Опубликуйте конфигурационный файл:
```bash
php artisan vendor:publish --tag=datanewton-config
```
### Добавьте в .env:
```injectablephp
DATANEWTON_API_KEY=your-api-key
DATANEWTON_BASE_URL=https://api.datanewton.ru
DATANEWTON_CACHE_TTL=3600
DATANEWTON_LOGGING_ENABLED=true
```
## Использование

### Базовое использование
```php
use BAmbitions\Datanewton\Facades\Datanewton;

// Получить информацию о контрагенте
$company = Datanewton::counterparty()->get(inn: '7707083893');

// Или через ОГРН
$company = Datanewton::counterparty()->get(ogrn: '1027700132195');

// С дополнительными фильтрами
$company = Datanewton::counterparty()->getWithFilters(
    inn: '7707083893',
    filters: ['OWNER_BLOCK', 'MANAGER_BLOCK', 'CONTACT_BLOCK']
);
// Поиск контрагентов
$suggestions = Datanewton::suggestions()->search('Датаномика');

// Поиск только ЮЛ
$companies = Datanewton::suggestions()->search('ООО', type: 'ul');

// Поиск только действующих
$active = Datanewton::suggestions()->search('Транспорт', isActive: true);

// Поиск по домену
$byDomain = Datanewton::suggestions()->searchByDomain('datanewton.ru');

// Поиск по адресу (массовость)
$byAddress = Datanewton::suggestions()->searchByAddress(
    'Москва, Ленинский проспект',
    limit: 50
);
// Предпросмотр (до 20 компаний)
$preview = Datanewton::filters()->preview([
    'okveds' => ['62.01'],
    'region_codes' => ['77'],
    'only_active' => true,
]);

// Полная выборка по фильтрам
$companies = Datanewton::filters()->search([
    'okveds' => ['62.01', '62.02'],
    'region_codes' => ['77', '78'],
    'only_active' => true,
    'income_from' => 100000,
    'income_to' => 10000000,
], limit: 100, offset: 0);

// Поиск по ОКВЭД
$byOkved = Datanewton::filters()->searchByOkveds(
    okveds: ['62.01'],
    onlyActive: true,
    onlyMainOkveds: true
);

// Поиск по выручке
$byIncome = Datanewton::filters()->searchByIncome(
    incomeFrom: 1000000,
    incomeTo: 50000000,
    onlyActive: true
);

// Поиск МСП
$msp = Datanewton::filters()->searchMsp(
    mspCategories: ['1', '2'], // микро и малые
    onlyActive: true
);

// Поиск с контактами
$withContacts = Datanewton::filters()->searchWithContacts(
    withPhones: true,
    withEmails: true,
    operator: 'AND' // должны быть и телефон, и email
);

// Поиск по вакансиям
$withVacancies = Datanewton::filters()->searchByVacancies([
    'has_vacancies' => true,
    'salary_min' => 100000,
    'text' => 'программист',
    'source' => 'ALL'
]);

// Поиск по контрактам
$withContracts = Datanewton::filters()->searchByContracts([
    'role' => 'SUPPLIER',
    'contract_type' => 'FZ44',
    'has_contracts' => true,
    'min_price' => 1000000,
]);
```
### Пакетные операции
```injectablephp
// Получить данные по списку ИНН/ОГРН (до 5000)
$cards = Datanewton::batch()->getCards([
    '7707083893',
    '1027700132195',
    '7728212268',
]);

// Обработка большого списка по частям
$largeList = [...]; // массив из 10000 ИНН

foreach (Datanewton::batch()->getCardsInChunks($largeList, 1000) as $chunk) {
    // Обработка каждой части по 1000 записей
    foreach ($chunk['data'] as $company) {
        // ...
    }
}
```

### Мониторинг изменений

```injectablephp
// Получить все изменения с определенной даты
$changes = Datanewton::monitoring()->getChanges(
    ogrns: ['1027700132195', '1207700223257'],
    startDate: '2024-01-01',
    includeHistory: true,
    paramTypes: ['ALL']
);

// Мониторинг конкретных параметров
$statusChanges = Datanewton::monitoring()->monitorStatus(
    ogrns: ['1027700132195'],
    startDate: '2024-01-01'
);

$managerChanges = Datanewton::monitoring()->monitorManagers(
    ogrns: ['1027700132195'],
    startDate: '2024-01-01',
    includeHistory: true
);

$ownerChanges = Datanewton::monitoring()->monitorOwners(
    ogrns: ['1027700132195'],
    startDate: '2024-01-01'
);

$addressChanges = Datanewton::monitoring()->monitorAddress(
    ogrns: ['1027700132195'],
    startDate: '2024-01-01'
);

$mspChanges = Datanewton::monitoring()->monitorMsp(
    ogrns: ['1027700132195'],
    startDate: '2024-01-01'
);

$reportChanges = Datanewton::monitoring()->monitorReports(
    ogrns: ['1027700132195'],
    startDate: '2024-01-01'
);
```

### Финансовые показатели
```injectablephp
// Получить все финансовые данные
$finance = Datanewton::finance()->get(inn: '7707083893');

// Получить только баланс
$balance = Datanewton::finance()->getBalance(inn: '7707083893');

// Получить финансовые результаты
$finResults = Datanewton::finance()->getFinancialResults(inn: '7707083893');

// Получить движение денежных средств
$cashFlow = Datanewton::finance()->getCashFlow(inn: '7707083893');

// Получить выручку за последний год
$revenue = Datanewton::finance()->getRevenue(inn: '7707083893');

// Получить чистую прибыль
$netIncome = Datanewton::finance()->getNetIncome(inn: '7707083893');

// Использование DTO
use BAmbitions\Datanewton\DTO\Finance\FinancialIndicators;

$financeData = Datanewton::finance()->get(inn: '7707083893');
$indicators = FinancialIndicators::fromArray($financeData);

$latestYear = $indicators->getLatestYear();
$revenue = $indicators->getRevenue($latestYear);
$netIncome = $indicators->getNetIncome($latestYear);
$assets = $indicators->getAssets($latestYear);
```
### Налоги

```injectablephp
// Полная информация о налогах
$taxInfo = Datanewton::tax()->getInfo(inn: '7707083893');

// Только уплаченные налоги
$paidTaxes = Datanewton::tax()->getPaidTaxes(inn: '7707083893');

// Проверить наличие задолженности
$hasDebt = Datanewton::tax()->hasDebt(inn: '7707083893');

// Получить сумму задолженности
$debtAmount = Datanewton::tax()->getTotalDebt(inn: '7707083893');
```
### Госконтракты

```injectablephp
// Все контракты
$contracts = Datanewton::contracts()->get(
    inn: '7707083893',
    types: ['ALL']
);

// Только ФЗ-44
$fz44 = Datanewton::contracts()->getFz44(inn: '7707083893');

// Только ФЗ-223
$fz223 = Datanewton::contracts()->getFz223(inn: '7707083893');

// Контракты как поставщик
$asSupplier = Datanewton::contracts()->getAsSupplier(
    inn: '7707083893',
    types: ['FZ44']
);

// Контракты как заказчик
$asCustomer = Datanewton::contracts()->getAsCustomer(inn: '7707083893');

// Поиск по сумме
$byPrice = Datanewton::contracts()->searchByPrice(
    priceFrom: 1000000,
    priceTo: 10000000,
    inn: '7707083893'
);

// Только активные
$active = Datanewton::contracts()->getActive(inn: '7707083893');

// Статистика
$stats = Datanewton::contracts()->getStatistics(
    ogrn: '1027700132195',
    type: 'FZ44'
);

// Получить список ОКПД
$okpdList = Datanewton::contracts()->getOkpdList(inn: '7707083893');
```
### Лизинг
```injectablephp
// Поиск договоров лизинга
$leases = Datanewton::leases()->search([
    'only_active' => true,
    'classifier_codes' => ['0106008'],
]);

// Активные договоры
$activeLeases = Datanewton::leases()->getActive(
    leaseStartFrom: '2020-01-01',
    leaseStartTo: '2024-12-31',
    classifierCodes: ['0106008']
);

// Поиск по ключевым словам
$byText = Datanewton::leases()->searchByText(
    searchText: 'автомобиль',
    onlyActive: true
);

// Поиск по регионам
$byRegion = Datanewton::leases()->searchByRegions(
    regionCodes: ['77', '78'],
    onlyActive: true
);
```
### Арбитражные дела
```injectablephp
// Получить все дела
$cases = Datanewton::arbitration()->getCases(
    inn: '7707083893',
    limit: 50
);

// Дела как ответчик
$asRespondent = Datanewton::arbitration()->getCasesAsRespondent(
    inn: '7707083893',
    status: 'CLOSE'
);

// Дела как истец
$asPlaintiff = Datanewton::arbitration()->getCasesAsPlaintiff(
    inn: '7707083893'
);

// Поиск по сумме иска
$bySum = Datanewton::arbitration()->searchBySum(
    sumFrom: 1000000,
    sumTo: 10000000
);

// Поиск по периоду
$byPeriod = Datanewton::arbitration()->searchByPeriod(
    startDateFrom: '2024-01-01',
    startDateTo: '2024-12-31'
);

// Batch поиск с фильтрами
$batchCases = Datanewton::arbitration()->batchSearch([
    'role' => 'RESPONDENT',
    'status' => '1',
    'dispute' => '3',
    'sum_from' => 500000,
], limit: 100);
```
### Проверки

```injectablephp
// Получить проверки
$inspections = Datanewton::inspections()->get(
    inn: '7707083893',
    limit: 50
);

// Статистика по проверкам
$stats = Datanewton::inspections()->getStatistics(
    inn: '7707083893'
);

// Завершённые проверки
$completed = Datanewton::inspections()->getCompleted(
    inn: '7707083893'
);

// Поиск по типу надзора
$bySupervision = Datanewton::inspections()->searchBySupervision(
    supervision: 'FIRE',
    inn: '7707083893'
);

// Поиск по периоду
$byPeriod = Datanewton::inspections()->searchByPeriod(
    startDateFrom: '2024-01-01',
    startDateTo: '2024-12-31',
    inn: '7707083893'
);
```
### Скоринг и риски

```injectablephp
// Скоринг надёжности
$scoring = Datanewton::scoring()->get(inn: '7707083893');
$score = Datanewton::scoring()->getScore(inn: '7707083893'); // 1-5
$status = Datanewton::scoring()->getStatus(inn: '7707083893'); // LOW/MID/HIGH

// Проверки надёжности
$isHighReliability = Datanewton::scoring()->isHighReliability(inn: '7707083893');
$isLowReliability = Datanewton::scoring()->isLowReliability(inn: '7707083893');

// Риски
$risks = Datanewton::risks()->get(inn: '7707083893');

// Негативные списки
$negativeLists = Datanewton::risks()->getNegativeLists(inn: '7707083893');

// Признаки однодневки
$oneDayFlags = Datanewton::risks()->getOneDayCompanyFlags(inn: '7707083893');

// Проверка наличия рисков
$hasRisks = Datanewton::risks()->hasActiveRisks(inn: '7707083893');

// Количество рисков
$riskCount = Datanewton::risks()->countRisks(inn: '7707083893');
$negativeCount = Datanewton::risks()->countRisks(inn: '7707083893', color: 'NEGATIVE');
```
### СРО
```injectablephp
// Членство в СРО
$sro = Datanewton::sro()->getMembership(inn: '7707083893');

// Только НОСТРОЙ
$nostroy = Datanewton::sro()->getNostroy(inn: '7707083893');

// Только НОПРИЗ
$nopriz = Datanewton::sro()->getNopriz(inn: '7707083893');

// Проверить активное членство
$isActiveMember = Datanewton::sro()->hasActiveMembership(
    inn: '7707083893',
    type: 'НОСТРОЙ'
);
```

### Банкротство

```injectablephp
// Признаки банкротства
$bankruptcy = Datanewton::bankruptcy()->get(inn: '7707083893');

// Проверить наличие
$hasBankruptcy = Datanewton::bankruptcy()->hasBankruptcySigns(inn: '7707083893');

// Последнее сообщение
$latest = Datanewton::bankruptcy()->getLatest(inn: '7707083893');
```

### Корпоративные действия
```injectablephp
// Все корпоративные действия
$actions = Datanewton::corporateActions()->get(
    inn: '7707083893',
    limit: 50
);

// Изменения капитала
$capitalChanges = Datanewton::corporateActions()->getCapitalChanges(
    inn: '7707083893'
);

// Действия с реестром
$registerActions = Datanewton::corporateActions()->getRegisterActions(
    inn: '7707083893'
);

// Поиск по типу
$byType = Datanewton::corporateActions()->searchByType(
    type: 'FirmLiquidation',
    inn: '7707083893'
);

// Поиск по периоду
$byPeriod = Datanewton::corporateActions()->searchByPeriod(
    dateFrom: '2024-01-01',
    dateTo: '2024-12-31',
    inn: '7707083893'
);
```

### Связи
```injectablephp
// Получить граф связей (до 2 уровня)
$links = Datanewton::links()->get(ogrn: '1027700132195', level: 2);

// Только первый уровень
$firstLevel = Datanewton::links()->getFirstLevel(ogrn: '1027700132195');

// Получить узлы графа
$nodes = Datanewton::links()->getNodes(ogrn: '1027700132195');

// Получить связи
$edges = Datanewton::links()->getEdges(ogrn: '1027700132195');

// Связанные компании
$relatedCompanies = Datanewton::links()->getRelatedCompanies(
    ogrn: '1027700132195'
);

// Связанные физлица
$relatedPersons = Datanewton::links()->getRelatedPersons(
    ogrn: '1027700132195'
);
```
### Блокировки счетов
```injectablephp
use BAmbitions\Datanewton\Services\BlockedAccountService;

$blockedAccounts = app(BlockedAccountService::class);

// Получить информацию о блокировках
$blockages = $blockedAccounts->get(inn: '7707083893');

// Проверить наличие блокировок
$hasBlockages = $blockedAccounts->hasBlockages(inn: '7707083893');

// Количество блокировок
$count = $blockedAccounts->getBlockagesCount(inn: '7707083893');
```
### Реестр НКО
```injectablephp
use BAmbitions\Datanewton\Services\NkoService;

$nko = app(NkoService::class);

// Получить информацию
$nkoInfo = $nko->get(inn: '7707531513');

// Проверить является ли НКО
$isNko = $nko->isNko(inn: '7707531513');

// Получить статус
$status = $nko->getStatus(inn: '7707531513');
```
###
```injectablephp
// Регионы
$regions = Datanewton::dictionary()->getRegions();

## // ОКВЭД
$okveds = Datanewton::dictionary()->getOkveds();

## // ОКПД2
$okpd2 = Datanewton::dictionary()->getOkpd2();

// Лицензии
$licenses = Datanewton::dictionary()->getLicenses();

// Классификатор лизингов
$leaseClassifier = Datanewton::dictionary()->getLeaseClassifier();

// Арбитражные суды
$courts = Datanewton::dictionary()->getArbitrationCourts();

// Типы документов арбитражных дел
$docTypes = Datanewton::dictionary()->getArbitrationDocumentTypes();

// Категории споров
$disputes = Datanewton::dictionary()->getArbitrationDisputes();

// Получить регион по коду
$region = Datanewton::dictionary()->getRegionByCode('77');
```
### Статус самозанятого
```injectablephp
// Проверить статус самозанятых
$statuses = Datanewton::taxpayer()->getStatuses([
    '123456789012',
    '987654321098',
]);
```
### Использование с DTO
```injectablephp
use BAmbitions\Datanewton\DTO\Counterparty\CompanyInfo;

$data = Datanewton::counterparty()->getWithFilters(inn: '7707083893');
$company = CompanyInfo::fromArray($data);

// Удобный доступ к данным
echo $company->shortName;
echo $company->fullName;
echo $company->inn;
echo $company->ogrn;

// Проверки
if ($company->isActiveCompany()) {
    echo "Компания действует";
}

if ($company->hasNegativeFlags()) {
    echo "Есть негативные признаки";
}

// Получить основной ОКВЭД
$mainOkved = $company->getMainOkved();

// Контакты
$emails = $company->getEmails();
$phones = $company->getPhones();
$websites = $company->getWebsites();
```
### Обработка ошибок
```injectablephp
use BAmbitions\Datanewton\Exceptions\DatanewtonException;

try {
    $company = Datanewton::counterparty()->get(inn: '1234567890');
} catch (DatanewtonException $e) {
    // Код ошибки API
    $code = $e->getCode();
    
    // Сообщение об ошибке
    $message = $e->getMessage();
    
    // Исходные параметры запроса
    $source = $e->getSource();
    
    Log::error('Datanewton API Error', [
        'code' => $code,
        'message' => $message,
        'source' => $source,
    ]);
}
```
### Кэширование

Пакет поддерживает автоматическое кэширование GET-запросов:
```injectablephp
// В config/datanewton.php или .env
'cache' => [
    'enabled' => true,
    'ttl' => 3600, // 1 час
    'prefix' => 'datanewton',
],
```
Очистка кэша:

```injectablephp
use Illuminate\Support\Facades\Cache;

// Очистить весь кэш Datanewton
Cache::flush();

// Или с префиксом
Cache::tags(['datanewton'])->flush();
```
### Логирование

Включите логирование для отладки:

```injectablephp
// В .env
DATANEWTON_LOGGING_ENABLED=true
DATANEWTON_LOG_CHANNEL=stack
```
## License
MIT License.

## Author
Mikhail Solovian - mikhail.s1990@gmail.com