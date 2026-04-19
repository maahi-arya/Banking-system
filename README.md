# 💳 Banking Ledger System (Backend API)

## 📌 Project Overview

This is a backend-only Banking Ledger System built using Node.js and Express.
It provides REST APIs for user authentication, account management, and money transfer operations.

There is no frontend UI. All APIs are tested using API testing tools.

---

## 🌐 Live Server

Hosted on Render:

```text id="a8k1ld"
https://banking-system-nk8f.onrender.com
```

---

## 🧪 Server Health Check

```
GET /
```

### Response:

```
Ledger service is up and running
```

---

## ⚙️ Tech Stack

* Node.js
* Express.js
* MongoDB
* JWT Authentication

---

## 🧪 API Testing

All APIs should be tested using Postman.

---

# 🔐 Authentication APIs

## ➤ Register User

```
POST /api/auth/register
```

### Request Body:

```
{
  "name": "Test User",
  "email": "test@gmail.com",
  "password": "123456"
}
```

---

## ➤ Login User

```
POST /api/auth/login
```

### Request Body:

```
{
  "email": "test@gmail.com",
  "password": "123456"
}
```

### Response:

```
{
  "token": "JWT_TOKEN_HERE"
}
```

---

# 🔑 Protected APIs

### Add this header for all protected routes:

```text id="i8k9ld"
Authorization: Bearer <your_token>
```

---

## ➤ Get All Accounts

```http id="j8k0ld"
GET /api/accounts
```

---

## ➤ Create Account

```
POST /api/accounts
```

### Request Body:

```
{
  "name": "New User",
  "balance": 1000
}
```

---

## ➤ Transfer Money

```
POST /api/transactions
```

### Request Body:

```
{
  "fromAccount": "ACCOUNT_ID_1",
  "toAccount": "ACCOUNT_ID_2",
  "amount": 500
}
```

---

## ⚠️ Error Handling

| Error           | Meaning                      |
| --------------- | ---------------------------- |
| Route not found | Wrong API URL or HTTP method |
| Unauthorized    | Missing or invalid JWT token |
| Server error    | Backend issue                |

---

## 🚨 Important Notes

* Browser supports only GET requests
* POST/PUT/DELETE must be tested using Postman
* Protected routes require JWT authentication
* First request on Render may take a few seconds (cold start)

---

## 🚀 Features

* User authentication (JWT)
* Account management
* Money transfer system
* Secure REST API design
* Cloud deployment on Render

---

## 🎯 Project Purpose

This project demonstrates backend development skills including REST API design, authentication, database handling, and deployment on cloud platforms.
