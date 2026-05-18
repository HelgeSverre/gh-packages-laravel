<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

# 🎁 Reward System

A scalable Laravel-based platform that allows users to purchase credit packages, earn bonus points, and redeem them for exclusive products in the Offer Pool. Admins can fully manage the system via API.

---

# 💡 Business Requirements Understanding:
The goal is to build a robust credit/reward system where users can:

Purchase credit packages (that include bonus points)

Redeem points for special products

Be rewarded for their activity

Admins need full control to manage packages, products, and monitor transactions. The system should be modular and scalable, allowing easy integration with payment gateways like Paymob, and supporting AI-powered product recommendations in the future.

---

# 🌟 Feature Suggestion
AI-Powered Product Recommendations: Use OpenAI to suggest products based on user points and history. This adds a smart layer to improve user engagement and satisfaction.

---

# ✨ Features
**User Authentication**: Register/login/logout via API using Laravel Sanctum.

**Credit Packages**: Users can browse and purchase packages that include credits and bonus points.

**Point Transactions**: All point changes (purchase, redemption) are logged with type and related IDs.

**Product Redemption**: Users can use points to redeem products from the Offer Pool.

**Admin Management**:

Create/update/delete packages and products

Toggle product offer status

**Search & Filter**:

Search products by name, description, category

Filter by category or Offer Pool

**Redis Caching** Speeds up product listing with custom cache keys.

**Payment Gateway Integration**:

Strategy Pattern used to integrate Paymob (or other gateways in future)

Support for mock or real transactions

**CI/CD Pipeline with Github Action**

**(Bonus) AI Recommendations**:

**Uses OpenAI API** to suggest a product based on point balance and preferences

---

## 📈 Scalability & Clean Architecture

- Service-based architecture
- Uses Laravel’s service container and dependency injection
- Supports additional strategies (PayPal, Stripe) using Strategy Pattern
- Caching and Redis for performance
- CI/CD Pipeline
---

## ⚙️ Requirements

- PHP >= 8.2
- Laravel 11
- MySQL (tested on 5.7+)
- Redis
- Composer
- Docker & Docker Compose

---

## 🛠️ Installation & Setup

### 📦 Clone the Repository

```bash
git clone git@github.com:mohamedkaram400/rewards-system.git
cd rewards-system
```

## ⚙️ Setup Environment
```bash
cp .env.example .env
```

## 🐳 Docker Setup
```bash
docker compose up --build
```

## ⚡ Run Migrations and generate key
```bash
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --seed
```
### Endpoints


## Add Purchase

This endpoint allows users to create a new purchase by submitting a POST request.

### Endpoint

`POST localhost:8000/api/purchases`


### 1- Request Body

| Field             | Type    | Required | Description                                       |
|------------------|---------|----------|---------------------------------------------------|
| `credit_package_id` | integer | ✅        | ID of the credit package the user wants to buy.   |
| `payment_type`     | string  | ✅        | Payment method name (e.g., `paymob`).             |

### ✅ Example Request

```json
{
    "credit_package_id": 1,
    "payment_type": "paymob"
}
```

### Expected Response

Upon a successful request, the server will return a response indicating the status of the purchase. The response format will typically include details such as:

- Confirmation of the purchase
    
```bash
{
    "message": "Purchase data sent to payment successfully.",
    "status_code": 200,
    "data": "https://accept.paymob.com/standalone/?ref=i_LRR2QWk4d1dXakU4..."
}
```
## 2- Make Redemption

This endpoint allows users to create a new redemption for a specified product. By sending a POST request to `localhost:8000/api/redemptions`, users can initiate the redemption process for the product identified by the `product_id` query parameter.

### Request Parameters

- **Query Parameter:**
    
    - `product_id` (required): The unique identifier of the product for which the redemption is being created.
        

### Expected Input

The request body can include the following parameters:

- **product_id**: (type: text)

### Response Structure

Upon a successful request, the server will return a response containing the details of the created redemption. The response structure typically includes:

- **redemption_id**: The unique identifier for the newly created redemption.
    
- **status**: The current status of the redemption.
    
- **message**: A message indicating the result of the redemption creation process.
    

### Example Response

``` json
{
    "message": "Product redeemed successfully.",
    "status_code": 200,
    "data": {
        "new_points_balance": 49
    }
}
 ```

## 3- AI-Powered Product Recommendation (with ChatGPT)

This endpoint uses OpenAI GPT to recommend a product based on the user's point balance and available Offer Pool items.

### Endpoint

`POST localhost:8000/api/redemptions/ai`

### Response Example

```json
{
  "message": "Recommended product generated successfully.",
  "data": {
    "recommended_product": {
      "name": "Smart Watch",
      "points_required": 50
    },
    "reason": "This product fits your current points balance and is trending among similar users."
  }
}
```


## 4- Product Search

`GET /api/products/search`

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| query | string | No | Search term |
| category | integer | No | Filter by category ID |
| offer_pool | boolean | No | Only show redeemable products |
| page | integer | No | Pagination page (default: 1) |

### Response
```json
{
  "data": [
    {
      "id": 1,
      "name": "Premium Widget",
      "points_cost": 100,
      "in_offer_pool": true
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 45
  }
}
```

## Endpoint Collection
The full list of API endpoints is included in the project’s main directory for easy reference and testing.