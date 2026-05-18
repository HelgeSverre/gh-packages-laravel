## لاراول Persian Faker

یک پکیج ساده برای اضافه کردن داده‌ساز فارسی به Faker در پروژه‌های لاراول و تست‌های PHP.

### نصب

```bash
composer require oveysrostami/laravel-persian-faker
```

پکیج از auto-discovery لاراول استفاده می‌کند و به صورت خودکار به `Faker\Generator` اضافه می‌شود.

### استفاده در لاراول

```php
// داخل تست‌ها، seeder یا factory
$faker = app(\Faker\Generator::class);

$faker->persianFirstName();      // حامد
$faker->persianLastName();       // کریمی
$faker->persianFullName('male'); // سینا مرادی
$faker->iranianMobile();         // 09121234567
$faker->iranianPhone();          // 02176543210
```

### استفاده خارج از لاراول

```php
use Faker\Factory;
use Oveysrostami\LaravelPersianFaker\PersianFakerProvider;

$faker = Factory::create('fa_IR');
$faker->addProvider(new PersianFakerProvider($faker));

echo $faker->persianFullName();
```

### متدهای فعلی

- `persianFirstName(?string $gender = null)` — نام کوچک (مقادیر `male` یا `female` برای جنسیت اختیاری است)
- `persianLastName()` — نام خانوادگی
- `persianFullName(?string $gender = null)` — نام و نام خانوادگی
- `iranianMobile()` — شماره موبایل معتبر 11 رقمی
- `iranianPhone()` — شماره ثابت شهری با کد پیش‌شماره
- `iranianNationalCode()` — تولید کد ملی معتبر با الگوریتم کنترل رقم دهم
  - متد کمکی: `PersianFakerProvider::validateIranianNationalCode($code)`
- `persianWord()`, `persianWords($nb = 3, $asText = false)`
- `persianSentence($nbWords = 6, $variableNbWords = true)`
- `persianSentences($nb = 3)`
- `persianParagraph($nbSentences = 3, $variableNbSentences = true)`
- `persianParagraphs($nb = 3)`
- `persianProvince()`, `persianCity($province = null)`, `persianStreet()`
- `persianAddress(array $options = [])` — به طور پیش‌فرض همه اجزا را دارد؛ می‌توانید اجزای زیر را `true/false` کنید یا `randomize_missing => true` بدهید تا تصادفی حذف/اضافه شوند:
  - `province`, `city`, `street`, `plaque`, `unit`, `postal_code`
- `persianPostalCode()` — کد پستی ۱۰ رقمی معتبر (بدون تکرار یکنواخت ارقام و بدون صفر در ابتدای کد)
- `persianCompanyName()` — نام شرکت ایرانی
- `persianBrandName()` — نام برند/محصول ایرانی
- `iranianBankName()` — نام بانک ایرانی
- `iranianCardNumber(?string $bankName = null)` — شماره کارت ۱۶ رقمی با الگوریتم لوهن. اگر `bankName` بدهید از BIN آن بانک استفاده می‌شود، در غیر این صورت به صورت تصادفی یکی انتخاب می‌شود.
- `iranianSheba(?string $bankName = null)` — شماره شبا ۲۶ کاراکتری (IR + ۲۴ رقم). اگر بانک مشخص شود از کد بانک استفاده می‌کند، در غیر این صورت تصادفی انتخاب می‌شود.
- `persianJobTitle()` — عنوان شغلی فارسی (مدیرعامل، معاون، سرتیپ، کارشناس، ...).
- `persianProfession()` — حرفه/شغل عمومی (پزشک، پرستار، کارگر، بنا، برنامه‌نویس، گرافیست، ...).

### مدیریت دیتاست

برای اضافه/حذف نام‌ها یا پیش‌شماره‌ها، فقط فایل‌های `resources/data/names.php` و `resources/data/phones.php` را ویرایش کنید. Provider داده‌ها را در زمان اجرا از این فایل‌ها می‌خواند.

### تست سریع (Smoke test)

یک اسکریپت ساده برای اطمینان از اتصال provider:

```bash
php tests/smoke.php
```
