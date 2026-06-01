# Inventory & Order Management System

A minimalist, submission-focused Full Stack Inventory & Order Management System. Built exactly to specifications with a **Python (FastAPI)** backend, a **React (Vite + JavaScript)** frontend, and a **PostgreSQL** database, fully orchestrated using **Docker** and **Docker Compose**.

This application implements clean components, direct backend validation rules, and proper HTTP status code structures without any out-of-scope bloat.

---

## 📂 Project Structure

```
inventory-order-management/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py        # FastAPI routes & CORS setup
│   │   ├── config.py      # Pydantic environment configurations
│   │   ├── database.py    # SQLAlchemy engine & session factory
│   │   ├── models.py      # SQLAlchemy ORM models (Product, Customer, Order, OrderItem)
│   │   ├── schemas.py     # Pydantic validation schemas
│   │   └── crud.py        # Database operations & transaction logic
│   ├── Dockerfile         # Python slim production image
│   ├── .dockerignore
│   └── requirements.txt   # Backend package dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx            # Standard metric display & Low stock indicators
│   │   │   ├── ProductManagement.jsx    # Add, List, Update, Delete Products
│   │   │   ├── CustomerManagement.jsx   # Add, List, Delete Customers
│   │   │   └── OrderManagement.jsx      # Create multi-item orders & detail modal view
│   │   ├── App.jsx                      # Main React orchestrator & API service
│   │   ├── main.jsx                     # Vite index mount script
│   │   ├── App.css                      # Minimalist structural layout stylesheet
│   │   └── index.css                    # Custom HSL design tokens & variables
│   ├── nginx.conf                       # Production routing configuration for SPA
│   ├── Dockerfile                       # Multi-stage production Nginx serve
│   ├── .dockerignore
│   ├── package.json
│   └── vite.config.js                   # Vite React build settings
├── docker-compose.yml                   # Container orchestration (frontend, backend, db)
├── .env.example                         # Environment configuration template
├── .gitignore
└── README.md                            # Setup and execution guide
```

---

## 🛠️ Environment Variables

The project loads configurations through environment variables. A template is provided in [.env.example](.env.example). 

| Service | Variable Name | Default Value | Description |
| :--- | :--- | :--- | :--- |
| **Backend** | `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/postgres` | PostgreSQL connection string |
| **Frontend** | `VITE_API_URL` | `http://localhost:8000` | Publicly accessible URL of the FastAPI backend |
| **Database** | `POSTGRES_USER` | `postgres` | Superuser username |
| **Database** | `POSTGRES_PASSWORD` | `postgres` | Superuser password |
| **Database** | `POSTGRES_DB` | `postgres` | Database name |

---

## 🐳 Docker Setup (Recommended Quickstart)

To run the entire suite using Docker Compose, you only need **Docker** and **Docker Compose** installed.

### 1. Configure Settings
Copy the env template to an active configuration file:
```bash
cp .env.example .env
```

### 2. Launch Services
Run the following orchestrator command from the root directory:
```bash
docker-compose up --build
```

This command will:
1. Launch the **PostgreSQL** database and perform database initialization checks.
2. Spin up the **FastAPI** backend container (exposed on port `8000`), waiting for the database to report healthy before starting, and auto-creating all tables on startup.
3. Build and host the compiled React app served via **Nginx** (exposed on port `3000`).

### 3. Access the System
- **Frontend SPA**: [http://localhost:3000](http://localhost:3000)
- **FastAPI API Root**: [http://localhost:8000](http://localhost:8000)
- **FastAPI Interactive Swagger docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 💻 Running Locally (Manual Development Mode)

If you prefer to run the applications directly on your host machine:

### 1. PostgreSQL Database
Ensure a local PostgreSQL instance is running on port `5432`. Create a database named `postgres` (or as configured in your `.env` file).

### 2. Backend FastAPI Server
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the development server using Uvicorn:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### 3. Frontend React Client (Vite)
1. Navigate to the `frontend/` directory:
   ```bash
   cd ../frontend
   ```
2. Install Node.js packages:
   ```bash
   npm install
   ```
3. Run the hot-reloading development server:
   ```bash
   npm run dev
   ```
   *The React client will run on port `3000` and communicate with the backend on `http://localhost:8000`.*

---

## 🚀 Live Deployment Instructions

The final application is designed to be easily deployable on free-tier platforms.

### Backend Deployment (Render / Railway / Fly.io)

For the FastAPI backend (e.g., on **Render**):
1. **Repository**: Push the codebase to your GitHub repository.
2. **Web Service**: Create a new Web Service on Render and link your repository.
3. **Configurations**:
   - **Root Directory**: `backend`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. **Environment Variables**:
   - Create a PostgreSQL Database on Render (free tier).
   - In your Web Service settings, add the environment variable `DATABASE_URL` and paste the connection string generated by the Render database.
5. **Auto-Table Creation**: The application will automatically create all tables (`products`, `customers`, `orders`, `order_items`) upon startup.

### Frontend Deployment (Vercel / Netlify)

For the React frontend (e.g., on **Vercel**):
1. **Project**: Create a new Project on Vercel and link your GitHub repository.
2. **Build Settings**:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite` (Vercel automatically detects this)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **Environment Variables**:
   - Add a vital environment variable `VITE_API_URL` containing the public URL of your deployed backend (e.g. `https://your-backend.onrender.com`).
4. **Deploy**: Hit Deploy. The build process will compile the files with the live API address embedded.

---

## 📜 API Reference Guide

### Product Management
- `POST /products`: Creates a new product.
  - *Payload*: `{"name": "string", "sku": "string", "price": float, "quantity_in_stock": int}`
  - *Validations*: Unique SKU, Non-negative Price, Non-negative Stock.
- `GET /products`: Returns list of all products.
- `GET /products/{id}`: Returns a product by ID (404 if missing).
- `PUT /products/{id}`: Updates product. Performs SKU uniqueness and value checks.
- `DELETE /products/{id}`: Deletes product (returns 400 if product belongs to active orders).

### Customer Management
- `POST /customers`: Creates a new customer.
  - *Payload*: `{"full_name": "string", "email_address": "string", "phone_number": "string"}`
  - *Validations*: Unique email address, standard formatting.
- `GET /customers`: Returns list of all customers.
- `GET /customers/{id}`: Returns a customer by ID (404 if missing).
- `DELETE /customers/{id}`: Deletes customer (returns 400 if customer has active orders).

### Order Management
- `POST /orders`: Places an order and reduces product stock in a single transaction.
  - *Payload*:
    ```json
    {
      "customer_id": 1,
      "items": [
        { "product_id": 10, "quantity": 3 },
        { "product_id": 12, "quantity": 1 }
      ]
    }
    ```
  - *Business Logic*:
    - Confirms customer and products exist.
    - Verifies `quantity_in_stock >= ordered_quantity`.
    - Automatically deducts stock from product record.
    - Automatically calculates total amount as `sum(product.price * quantity)`.
- `GET /orders`: Returns all orders.
- `GET /orders/{id}`: Returns detailed invoice details containing nested customer and product data.
- `DELETE /orders/{id}`: Deletes the order record.

---

## 🎯 Verification Test Checklist

To verify that the application satisfies all requirements, you can run the following test cases on the UI or API docs:

1. **Verify SKU Uniqueness (Business Rule 1)**:
   - Create a product: name=`Mouse`, SKU=`PROD-MOU`, price=`20.0`, stock=`10`. (Should succeed)
   - Try to create another product with SKU=`PROD-MOU`. (Should fail with `400 Bad Request` "SKU already exists")
2. **Verify Email Uniqueness (Business Rule 2)**:
   - Create a customer: name=`Alice`, email=`alice@test.com`, phone=`555-0100`. (Should succeed)
   - Try to create another customer with email=`alice@test.com`. (Should fail with `400 Bad Request` "Email address already registered")
3. **Verify Non-Negative Stock (Business Rule 3)**:
   - Try to create a product with stock=`-5` or price=`-10.0`. (Should fail with `422/400 validation error`)
4. **Verify Inventory Constraints (Business Rule 4, 5, 6)**:
   - Create product `Keyboard`, SKU=`PROD-KEY`, price=`50.0`, stock=`5`.
   - Place an order for customer `Alice` with `Keyboard` quantity `6`. (Should fail with `400 Bad Request` "Insufficient stock")
   - Place an order for `Keyboard` quantity `3`.
     - *Verify Success*: Order details show Total Amount = `$150.00` calculated automatically.
     - *Verify Stock Reduction*: Dashboard and Product list immediately reflect `Keyboard` quantity as `2`.
     - *Verify Low Stock Indicator*: Dashboard displays `Keyboard` in the "Low Stock Alert Board" since its stock is less than 10.
