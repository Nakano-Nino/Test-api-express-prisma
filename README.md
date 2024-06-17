# Test API using ExpressJS, MySQL & Prisma

## Overview

Test API using ExpressJS, MySQL & Prisma

## Table of Contents

1. [Installation](#installation)
2. [Usage](#usage)
3. [Documentation](#documentation)

## Installation
```bash
git clone https://github.com/Nakano-Nino/Test-api-express-prisma.git
cd Test-api-express-prisma
npm install
```
rename .env.example to .env then fill the required variables 

migrate the model schema to database with:
```bash
npm run db:migrate
```

## Usage
```bash
npm start
```

## Documentation
### Base URL
localhost

### PORT
3000

### GET Endpoint
#### 1. /api/categories
Used to get a list of categories (No Authorization token required)
#### 2. /api/category/:id
Used to get a category based on category id parameter (No Authorization token required)
#### 3. /api/todos
Used to get a list of todos (No Authorization token required)
#### 4. /api/todouser
Used to get a list of todos based on logged user (Require Authorization token)
#### 5. /api/todocategory
Used to get a list of todos based on category (Require Authorization token)

request body :
```bash
{
  "categoryId": insert categoryId here (uuid)
}
```

### POST Endpoint
#### 1. /api/register
Used to register users so they can log into the application (No Authorization token required)

request body :
```bash
{
  "first_name": "user",
  "last_name": "user",
  "email": "user@mail.com",
  "phone": "6281234567890"
  "password": "abcdef1234"
}
```

#### 2. /api/login
Used to log in and get authentication in the form of JWT (Json Web Token) Cookies (No Authorization token required)

request body :
```bash
{
  "email": "user@mail.com",
  "password": "abcdef1234"
}
```

#### 3. /api/refresh
Used to refresh the Access Token using Refresh Token (No Authorization token required)


#### 4. /api/category
Used to create a new category (Require Authorization token)

request body : 
```bash
{
  "name": "Item 1"
}
```

#### 5. /api/todo
Used to create a new Todo (Require Authorization token)

request body : 
```bash
{
  "name": "Todo 1",
  "amount": 1,
  "categoryId": "106686eb-76af-4e40-a095-cd30cf68391a"
}
```

### PUT Endpoint
#### 1. /api/category/:id
Used to update a category name (Require Authorization token)

request body :
```bash
{
  "name": "Item 2"
}
```
#### 2. /api/todo/:id
Used to update a todo (Require Authorization token)

request body :
```bash
{
  "name": "Todo 2",
  "amount": 4,
}
```

### DELETE Endpoint
#### 1. /api/category/:id
Used to delete a category (Require Authorization token)
#### 1. /api/todo/:id
Used to delete a todo (Require Authorization token)