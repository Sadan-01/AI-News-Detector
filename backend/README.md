# AI Fake News Detection System Backend

Production-ready FastAPI backend for an AI Fake News Detection System. It includes JWT authentication, SQLite persistence through SQLAlchemy, request validation with Pydantic, standardized API responses, logging, and a replaceable AI prediction boundary.

## Tech Stack

- Python 3.11+
- FastAPI
- SQLite
- SQLAlchemy ORM
- Pydantic
- JWT authentication
- Passlib bcrypt password hashing
- python-dotenv

## Folder Structure

```text
backend/
  app/
    core/           Configuration, security, auth dependencies
    database/       SQLAlchemy engine and sessions
    models/         ORM models
    schemas/        Pydantic request/response schemas
    crud/           Data access functions
    services/       Business logic and AI adapter
    routes/         API routers
    middleware/     Request middleware
    dependencies/   Dependency exports
    exceptions/     Custom exceptions and handlers
    utils/          Logging helpers
  logs/             Runtime logs
  model/            Future trained ML model artifacts
  requirements.txt
  .env.example
```

## Installation

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment:

```bash
# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS/Linux
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a local environment file:

```bash
cp .env.example .env
```

Update `SECRET_KEY` in `.env` before production use.

Recommended production settings:

```text
ENVIRONMENT="production"
SECRET_KEY="<long-random-secret>"
CORS_ORIGINS="https://your-frontend-domain.com"
```

## Run

```bash
uvicorn app.main:app --reload
```

The API will be available at:

- API root: `http://127.0.0.1:8000`
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive a JWT token
- `GET /api/auth/me` - Get the current authenticated user

### Users

- `GET /api/users/profile` - Get authenticated user profile
- `PUT /api/users/profile` - Update authenticated user profile

### Predictions

- `POST /api/predict` - Submit news text for fake-news prediction
- `GET /api/predictions` - List authenticated user's predictions
- `DELETE /api/predictions/{id}` - Delete a prediction

## Authentication

Protected endpoints require an Authorization header:

```text
Authorization: Bearer <access_token>
```

Tokens expire according to `ACCESS_TOKEN_EXPIRE_MINUTES`.

## AI Integration

The prediction boundary is isolated in `app/services/ai_service.py`. When a trained model is ready, replace the implementation of `AIService.predict()` and keep the route, service, and persistence layers unchanged.

## Database

SQLite tables are created automatically on application startup. The default database path is controlled by `DATABASE_URL` in `.env`.
