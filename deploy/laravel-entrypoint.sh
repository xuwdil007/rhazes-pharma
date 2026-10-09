#!/bin/sh
set -eu

mkdir -p backend/data storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
touch backend/data/site.db
chown -R www-data:www-data backend/data storage bootstrap/cache

php artisan migrate --force
php artisan config:cache
php artisan view:cache

exec "$@"
