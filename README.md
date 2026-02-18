# Rent Car API - Sistema de Gerenciamento de Aluguel de Carros

Sistema completo de gerenciamento de locadora de veículos desenvolvido com CodeIgniter 4, incluindo API REST e dashboard web com Bootstrap, jQuery e Ajax.

## Funcionalidades

- **Gestão de Clientes**: Cadastro com dados pessoais, CPF e CNH
- **Gestão de Categorias**: Tipos de veículos com preços (diário, semanal, mensal)
- **Gestão de Veículos**: Frota com controle de status (disponível, alugado, manutenção)
- **Gestão de Aluguéis**: Reservas, retiradas, devoluções com cálculo automático de multas
- **Dashboard**: Visão geral com estatísticas em tempo real

---

## Setup com Docker (Recomendado)

**Pré-requisito**: [Docker](https://www.docker.com/products/docker-desktop/)

```bash
# 1. Clone o repositório
git clone https://github.com/MatheusAndreiczuk/rent-cars-ci4
cd rent-car-api-ci4

# 2. Suba os containeres
docker compose up -d --build

# 3. Execute migrations e seeds
docker compose exec app php spark migrate
docker compose exec app php spark db:seed DatabaseSeeder

# 4. Acesse
# App:        http://localhost:8080
# phpMyAdmin: http://localhost:8888
```

### Credenciais padrão do principal admin
- **Email**: admin@locadora.com
- **Senha**: admin123

### Parar containers
```bash
docker compose down         # Desce os containers
docker compose down -v      # Desce e apaga o banco de dados
```

---

## Setup Local (Sem Docker)

```bash
# 1. Instale as dependências
composer install

# 2. Configure o .env
cp .env.example .env

# 3. Edite o .env com suas credenciais MySQL

# 4. Rode as migrations
php spark migrate

# 5. Rode os seeds
php spark db:seed DatabaseSeeder

# 6. Inicie o servidor
php spark serve
```

Acesse: **http://localhost:8080**

---

## Endpoints da API

### Autenticação
- `POST /login` - Fazer login

### Usuários
- `GET /users` - Listar todos (admin)
- `GET /users/:id` - Buscar por ID
- `POST /cadastro` - Registrar novo
- `PUT /users/:id` - Atualizar
- `DELETE /users/:id` - Deletar (admin)

### Categorias
- `GET /categories` - Listar todas
- `GET /categories/:id` - Buscar por ID
- `POST /categories` - Criar (admin)
- `PUT /categories/:id` - Atualizar (admin)
- `DELETE /categories/:id` - Deletar (admin)

### Veículos
- `GET /vehicles` - Listar todos
- `GET /vehicles/:id` - Buscar por ID
- `POST /vehicles` - Criar (admin)
- `PUT /vehicles/:id` - Atualizar (admin)
- `DELETE /vehicles/:id` - Deletar (admin)

### Aluguéis
- `GET /rentals` - Listar todos (admin)
- `GET /rentals/:id` - Buscar por ID
- `GET /rentals/my` - Meus aluguéis (cliente)
- `POST /rentals` - Criar reserva
- `PUT /rentals/:id/start` - Iniciar locação (admin)
- `PUT /rentals/:id/finish` - Finalizar locação (admin)
- `PUT /rentals/:id/cancel` - Cancelar reserva

---

## Stacks utilizadas

- **Backend**: CodeIgniter 4 (PHP 8.2)
- **Frontend**: Bootstrap 5, jQuery, Ajax
- **Database**: MySQL 8
- **Authentication**: JWT (Firebase/PHP-JWT)
- **Docker**: Apache + PHP + MySQL

---

## Estrutura do Projeto

```
app/
├── Controllers/      # Controladores da API
├── Models/           # Models com validações
├── Filters/          # Autenticação e autorização
├── Config/           # Configurações e rotas
└── Views/            # Dashboard web

public/               # Document root (Apache)
├── js/               # jQuery, JS e Ajax para construção das views
```

---

## Notas Técnicas

- Validações impedem conflitos de reservas
- Cálculo automático de multas por atraso (valor diário x 2)
- Veículos mudam de status automaticamente
- JWT para proteção de endpoints

---

**Desenvolvido para aprendizado e aperfeiçoamento nas referidas stacks**
