# Laravel Package MyFinance2

Laravel package for managing my finances

- account
- currency
- ledger
- funding
- watchlist
- trades
- positions
- cash
- dividends
- timeline


## Images

![Finance Dashboard](./images/finance_dashboard.png "Finance Dashboard")

![Funding](./images/funding.png "Funding")

![Watchlist](./images/watchlist.png "Watchlist")

![Open Positions](./images/open_positions.png "Open Positions")

![Create Trade](./images/trade_create.png "Create Trade")

More images in the [images folder](images).


## Installation instructions

```bash
sudo apt-get install php-intl php-dom php-mysql php-mbstring php-gd htop colordiff

mysql -uroot -p
    CREATE DATABASE [MYFINANCE2_DB_DATABASE];
    CREATE USER '[MYFINANCE2_DB_USERNAME]'@'localhost' IDENTIFIED WITH mysql_native_password BY '[MYFINANCE2_DB_PASSWORD]';
    GRANT ALL PRIVILEGES ON [MYFINANCE2_DB_DATABASE].* TO '[MYFINANCE2_DB_USERNAME]'@'localhost';

    -- For foreign key constraints
    GRANT SELECT ON [DB_DATABASE].users TO '[MYFINANCE2_DB_USERNAME]'@'localhost';
    GRANT REFERENCES ON [DB_DATABASE].users TO '[MYFINANCE2_DB_USERNAME]'@'localhost';
    FLUSH PRIVILEGES;

    exit

mysql -u[MYFINANCE2_DB_USERNAME] -p [MYFINANCE2_DB_DATABASE] # use [MYFINANCE2_DB_PASSWORD] set above


#NOTE Execute the following if the Database Migration was not already run in the main package
php artisan migrate --pretend
php artisan migrate
# php artisan migrate:rollback # If needed
```

### Get market status (used by /positions)

```bash
sudo chmod 775 src/scripts/market_status.py
sudo chown :www-data src/scripts/market_status.py

sudo apt-get update
sudo apt install python3-pip
# pip install pandas-market-calendars
sudo pip install pandas-market-calendars

# Test
./src/scripts/market_status.py 'LSE'
```

### Install curl-impersonate to avoid '429 Too Many Requests' responses

```bash
mkdir ~/curl-impersonate/
cd ~/curl-impersonate/
wget https://github.com/lwthiker/curl-impersonate/releases/download/v0.6.1/libcurl-impersonate-v0.6.1.x86_64-linux-gnu.tar.gz
tar -xf libcurl-impersonate-v0.6.1.x86_64-linux-gnu.tar.gz

sudo su
cd /usr/local/lib/
ln -s /home/$USER/curl-impersonate/libcurl-impersonate-chrome.so .
ls -la /usr/local/lib/libcurl-impersonate-chrome.so
```

### Prepare account overview and symbol charts

```bash
cd ~/Repositories/laravel-admin/storage/
sudo chown -R :www-data app
# sudo chmod -R 775 app/*
sudo chmod -R 775 app
```

### Get historical data

```bash
# Clear cache
sudo rm -rf storage/app/charts/*
sudo chown $USER:www-data -R storage/framework/
sudo chmod g+w -R storage/framework/
php artisan cache:clear && php artisan config:cache

# Purpose: Backfills raw historical stock prices, useful for charting or after adding new symbols
# For each symbol (stock ticker) in your portfolio:
# - Fetches historical price data (open, high, low, close) from Yahoo Finance
# - (Added) Fetches exchange rates
# - Persists raw daily price points to database via Stats::persistHistoricalData()
# Key difference:
# - --historical                  → fetches stock prices per symbol
# - --historical-account-overview → calculates account statistics per account/date
# (NOT in crontab)
sudo su - www-data -s /bin/bash -c "export LOG_CHANNEL=stdout; cd /home/$USER/Repositories/laravel-admin/ && php artisan app:finance-api-cron --historical --start=2026-01-08 --end=2026-01-18"

# Purpose: Maintains a complete week of historical account performance data for trend analysis and recovery after downtime
# For each historical date:
# - Recalculates account statistics as they were on that specific date
# - Persists: cost, market value, change, cash balance per account
# - Rebuilds historical chart data points
# NOTE This command expects data to be already in, so run the command from above
# NOTE If we use the same start & end dates for both commands, it may fail if there is no failover. To go around that, extend the first command to the left with a few days
sudo su - www-data -s /bin/bash -c "export LOG_CHANNEL=stdout; cd /home/$USER/Repositories/laravel-admin/ && php artisan app:finance-api-cron --historical-account-overview --start=$(date +%Y-%m-%d --date '-8 day') --end=$(date +%Y-%m-%d --date '-1 day')"
```


### Refresh returns data

```bash
# Purpose: Pre-caches returns data for all years (MIN_YEAR to current year)
# For each year:
# - Past years (2016-2025): Checks if cache exists (marker: 'returns_year_YYYY_complete')
#   - If cache exists and is valid (4 weeks TTL): Skips processing, logs "cache is still valid"
#   - If cache doesn't exist or expired: Executes full returns flow, auto-caches for 4 weeks
# - Current year (2026): Always clears cache and refreshes (auto-caches for 1 hour)
# Benefits:
# - Faster page loads for /returns pages (data pre-cached)
# - Reduced API calls to Yahoo Finance
# - Maintains fresh data for current year
# (NOT in crontab - runs ad-hoc when needed or scheduled separately)
sudo su - www-data -s /bin/bash -c "export LOG_CHANNEL=stdout; cd /home/$USER/Repositories/laravel-admin/ && php artisan app:finance-api-cron --refresh-returns"

# With --force flag: Clears all cache markers and refreshes ALL years (including those with valid cache)
# Use this when you need to rebuild the entire cache (e.g., after config changes, price overrides, etc.)
sudo su - www-data -s /bin/bash -c "export LOG_CHANNEL=stdout; cd /home/$USER/Repositories/laravel-admin/ && php artisan app:finance-api-cron --refresh-returns --force"
```


### Enable finance-api-cron for better performance & maintaining a complete week of historical account data

```bash
cd ~/Repositories/laravel-admin/
>storage/logs/finance-api-cron.log
chown :www-data storage/logs/finance-api-cron.log
ls -la storage/logs/finance-api-cron.log
tail -f storage/logs/finance-api-cron.log

sudo apt install cpulimit

sudo su
crontab -e

#############
# Purpose: Keeps your portfolio data fresh with live market prices
# - refreshQuotes(): Fetches current market prices for all symbols (stocks) in your trades, dividends, and watchlist
# - refreshExchangeRates(): Fetches current exchange rates for all currency pairs used in multi-currency trades
# - refreshAccountOverview(): Calculates and persists current account statistics (total cost, market value, change, cash balance) and builds real-time charts

* * * * * ( sleep 5; su - www-data -s /bin/bash -c "export LOG_CHANNEL=stdout; export LD_PRELOAD=/usr/local/lib/libcurl-impersonate-chrome.so; export CURL_IMPERSONATE=chrome116; cd [USER_HOME]/Repositories/laravel-admin/ && cpulimit -l 50 -- php artisan app:finance-api-cron >> [USER_HOME]/Repositories/laravel-admin/storage/logs/finance-api-cron.log 2>&1" )

# Uncomment the next line if you want to have twice-per-minute updates
#* * * * * ( sleep 35; su - www-data -s /bin/bash -c "export LOG_CHANNEL=stdout; export LD_PRELOAD=/usr/local/lib/libcurl-impersonate-chrome.so; export CURL_IMPERSONATE=chrome116; cd [USER_HOME]/Repositories/laravel-admin/ && cpulimit -l 50 -- php artisan app:finance-api-cron >> [USER_HOME]/Repositories/laravel-admin/storage/logs/finance-api-cron.log 2>&1" )
#############

#############
# Purpose: Maintains a complete week of historical account performance data for trend analysis and recovery after downtime
# For each historical date:
# - Recalculates account statistics as they were on that specific date
# - Persists: cost, market value, change, cash balance per account
# - Rebuilds historical chart data points

# Run the job every day at 06:01 => get the past week
HISTORICAL_START=$(date +%Y-%m-%d --date '-8 day')
HISTORICAL_END=$(date +%Y-%m-%d --date '-1 day')

01 06 * * * su - www-data -s /bin/bash -c "export LOG_CHANNEL=stdout; export LD_PRELOAD=/usr/local/lib/libcurl-impersonate-chrome.so; export CURL_IMPERSONATE=chrome116; cd [USER_HOME]/Repositories/laravel-admin/ && cpulimit -l 50 -- php artisan app:finance-api-cron --historical-account-overview --start=${HISTORICAL_START} --end=${HISTORICAL_END} >> [USER_HOME]/Repositories/laravel-admin/storage/logs/finance-api-cron.log 2>&1"

# Run the job 150s after reboot
@reboot sleep 150 && su - www-data -s /bin/bash -c "export LOG_CHANNEL=stdout; export LD_PRELOAD=/usr/local/lib/libcurl-impersonate-chrome.so; export CURL_IMPERSONATE=chrome116; cd [USER_HOME]/Repositories/laravel-admin/ && cpulimit -l 50 -- php artisan app:finance-api-cron --historical-account-overview --start=${HISTORICAL_START} --end=${HISTORICAL_END} >> [USER_HOME]/Repositories/laravel-admin/storage/logs/finance-api-cron.log 2>&1"
#############

#############
# Purpose: Pre-caches returns data for all years to ensure fast page loads
# - Past years (2016-2025): Only refreshes if cache expired (4 weeks TTL), otherwise skips
# - Current year (2026): Always refreshes (1 hour TTL)
# Benefits:
# - Users get instant page loads when viewing /returns
# - Minimizes Yahoo Finance API calls by leveraging long-term cache for historical data
# - Ensures current year data stays fresh with hourly updates

# Run the job every hour at minute 24
24 * * * * su - www-data -s /bin/bash -c "export LOG_CHANNEL=stdout; export LD_PRELOAD=/usr/local/lib/libcurl-impersonate-chrome.so; export CURL_IMPERSONATE=chrome116; cd [USER_HOME]/Repositories/laravel-admin/ && cpulimit -l 50 -- php artisan app:finance-api-cron --refresh-returns >> [USER_HOME]/Repositories/laravel-admin/storage/logs/finance-api-cron.log 2>&1"

# Run the job 250s after reboot
@reboot sleep 250 && su - www-data -s /bin/bash -c "export LOG_CHANNEL=stdout; export LD_PRELOAD=/usr/local/lib/libcurl-impersonate-chrome.so; export CURL_IMPERSONATE=chrome116; cd [USER_HOME]/Repositories/laravel-admin/ && cpulimit -l 50 -- php artisan app:finance-api-cron --refresh-returns >> [USER_HOME]/Repositories/laravel-admin/storage/logs/finance-api-cron.log 2>&1"
#############

#############
# Purpose: Pre-caches watchlist symbol performance tags (gains, windows, metrics) for all users
# - Clears and rebuilds the 2-hour performance cache for every user
# - Ensures /watchlist-symbols page loads instantly without on-the-fly gain computation
# - Cache TTL: 2 hours; cron re-warms it hourly

# Run the job every hour at minute 54 (staggered from --refresh-returns at :24)
54 * * * * su - www-data -s /bin/bash -c "export LOG_CHANNEL=stdout; export LD_PRELOAD=/usr/local/lib/libcurl-impersonate-chrome.so; export CURL_IMPERSONATE=chrome116; cd [USER_HOME]/Repositories/laravel-admin/ && cpulimit -l 50 -- php artisan app:finance-api-cron --refresh-symbol-performance >> [USER_HOME]/Repositories/laravel-admin/storage/logs/finance-api-cron.log 2>&1"

# Run the job 400s after reboot (after stats-cron at 350s)
@reboot sleep 400 && su - www-data -s /bin/bash -c "export LOG_CHANNEL=stdout; export LD_PRELOAD=/usr/local/lib/libcurl-impersonate-chrome.so; export CURL_IMPERSONATE=chrome116; cd [USER_HOME]/Repositories/laravel-admin/ && cpulimit -l 50 -- php artisan app:finance-api-cron --refresh-symbol-performance >> [USER_HOME]/Repositories/laravel-admin/storage/logs/finance-api-cron.log 2>&1"
#############
```


### Setup stats-cron for cleanup

```bash
cd ~/Repositories/laravel-admin/
>storage/logs/stats-cron.log
chown :www-data storage/logs/stats-cron.log
ls -la storage/logs/stats-cron.log
tail -f storage/logs/stats-cron.log

sudo su
crontab -e

#############
# Prevents accumulation of stale real-time statistics, maintains clean database
# - cleanupStatsToday(): Deletes old rows from stats_today table (rows in stats_today with data from yesterday or before)

# Run the job every hour at minute 42
42 * * * * su - www-data -s /bin/bash -c "export LOG_CHANNEL=stdout; cd [USER_HOME]/Repositories/laravel-admin/ && cpulimit -l 50 -- php artisan app:stats-cron >> [USER_HOME]/Repositories/laravel-admin/storage/logs/stats-cron.log 2>&1"

# Run the job 350s after reboot
@reboot sleep 350 && su - www-data -s /bin/bash -c "export LOG_CHANNEL=stdout; cd [USER_HOME]/Repositories/laravel-admin/ && cpulimit -l 50 -- php artisan app:stats-cron >> [USER_HOME]/Repositories/laravel-admin/storage/logs/stats-cron.log 2>&1"
#############
```


### Running tests

NOTE That there are 2 types of tests, in 2 locations:
- Unit tests (in this package project)
- Feature tests (in the root project, because these need the context of the full laravel application)

```bash
# Running unit tests (in this package project)
# php vendor/bin/phpunit --filter ChartsBuilderMetrics --testdox --debug
php vendor/bin/phpunit --testdox
```


### Others

```bash
#NOTE If there were database entries that didn't have user_id before, execute the following

mysql -u[MYFINANCE2_DB_USERNAME] -p [MYFINANCE2_DB_DATABASE] # use [MYFINANCE2_DB_PASSWORD] set above
    select * from `[DB_DATABASE]`.`users`;

    update `cash_balances` set user_id = [USER_ID] where user_id is null;
    update `dividends` set user_id = [USER_ID] where user_id is null;
    update `ledger_transactions` set user_id = [USER_ID] where user_id is null;
    update `trades` set user_id = [USER_ID] where user_id is null;
    update `watchlist_symbols` set user_id = [USER_ID] where user_id is null;

    -- Optional (add currency exchanges to avoid warnings)
    insert into stats_historical (date, symbol, unit_price, currency_iso_code) values ('2025-01-01', 'EURGBP=X', '0.8268', 'GBP');
    insert into stats_historical (date, symbol, unit_price, currency_iso_code) values ('2025-01-01', 'EURUSD=X', '1.0352', 'USD');
    insert into stats_historical (date, symbol, unit_price, currency_iso_code) values ('2024-12-31', 'EURGBP=X', '0.8268', 'GBP');
    insert into stats_historical (date, symbol, unit_price, currency_iso_code) values ('2024-12-31', 'EURUSD=X', '1.0352', 'USD');
    insert into stats_historical (date, symbol, unit_price, currency_iso_code) values ('2024-12-30', 'EURGBP=X', '0.8268', 'GBP');
    insert into stats_historical (date, symbol, unit_price, currency_iso_code) values ('2024-12-30', 'EURUSD=X', '1.0352', 'USD');
    select * from stats_historical where date = '2025-01-01' and symbol like '%=X';
```

