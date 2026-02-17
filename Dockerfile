FROM php:8.2-apache

# Dependências do sistema
RUN apt-get update && apt-get install -y \
    libicu-dev libzip-dev libonig-dev libxml2-dev \
    libcurl4-openssl-dev libpng-dev libjpeg-dev \
    zip unzip curl git \
    && rm -rf /var/lib/apt/lists/*

# Extensões PHP necessárias para o CodeIgniter 4
RUN docker-php-ext-configure intl \
    && docker-php-ext-configure gd --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        intl mbstring mysqli pdo pdo_mysql xml dom zip opcache gd curl exif

# Habilita mod_rewrite do Apache
RUN a2enmod rewrite headers

# Configura o VirtualHost apontando para /public
RUN echo '<VirtualHost *:80>\n\
    DocumentRoot /var/www/html/public\n\
    <Directory /var/www/html/public>\n\
        AllowOverride All\n\
        Require all granted\n\
    </Directory>\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf

# Configurações do PHP
RUN echo 'date.timezone = America/Sao_Paulo\n\
upload_max_filesize = 20M\n\
post_max_size = 20M\n\
memory_limit = 256M\n\
intl.default_locale = pt_BR' > /usr/local/etc/php/conf.d/app.ini

WORKDIR /var/www/html

# Instala o Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Instala dependências do projeto
COPY composer.json composer.lock* ./
RUN composer install --optimize-autoloader --no-interaction --no-progress

# Copia a aplicação
COPY . .

# Usa o .env.example como .env (contém os valores corretos para Docker)
RUN cp .env.example .env

# Permissões da pasta writable
RUN chown -R www-data:www-data /var/www/html/writable \
    && chmod -R 775 /var/www/html/writable

EXPOSE 80

CMD ["apache2-foreground"]
