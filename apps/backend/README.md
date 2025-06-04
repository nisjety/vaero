# Vaero Backend

Node.js + TypeScript + Express + Prisma + Redis + Clerk v2 + OpenAI backend for the Vaero weather application.

## Features

- **Weather API**: Integration with Yr.no (Norwegian Meteorological Institute)
- **AI Services**: OpenAI GPT-4 for clothing suggestions, daily summaries, activity recommendations
- **Authentication**: Clerk v2 with JWT Session Tokens
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis for weather data and rate limiting
- **Push Notifications**: Expo Push and Web Push for weather alerts
- **Real-time Jobs**: BullMQ for background notification processing

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM v7
- **Cache**: Redis with ioredis
- **Authentication**: Clerk v2
- **AI**: OpenAI GPT-4
- **Queue**: BullMQ
- **Validation**: Zod
- **Testing**: Jest + Supertest

## Quick Start

### 1. Prerequisites

- Node.js 18+
- pnpm
- Docker & Docker Compose (for databases)

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your actual values:
# - CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY from clerk.com
# - OPENAI_API_KEY from openai.com
# - Other values can use defaults for development
```

### 3. Start Development Databases

```bash
# From project root
pnpm dev:db
```

This starts PostgreSQL and Redis in Docker containers.

### 4. Database Setup

```bash
# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:migrate

# (Optional) Open Prisma Studio to view data
pnpm db:studio
```

### 5. Start Development Server

```bash
# From project root
pnpm dev:backend

# Or from backend directory
cd apps/backend
pnpm dev
```

The server will start on http://localhost:4000

## API Endpoints

### Authentication
All endpoints require Clerk authentication via `Authorization: Bearer <token>` header.

### Weather
- `GET /api/weather?lat={lat}&lon={lon}` - Get weather with AI clothing suggestions

### AI Services
- `GET /api/ai/daily-summary?lat={lat}&lon={lon}` - Daily weather summary
- `GET /api/ai/activity?lat={lat}&lon={lon}&date={YYYY-MM-DD}` - Activity suggestions
- `POST /api/ai/packing-list` - Travel packing list
- `POST /api/ai/ask` - Free-form weather questions

### User Management
- `GET /api/users/me/prefs` - Get user preferences
- `PUT /api/users/me/prefs` - Update user preferences
- `POST /api/users/me/device` - Register device for notifications
- `DELETE /api/users/me/device/:deviceId` - Unregister device

### Health Check
- `GET /health` - Server health status

## Database Schema

### Core Models
- **User**: Clerk user mapping with preferences
- **UserPrefs**: Units, time format, location defaults, notification thresholds
- **Device**: Push notification tokens (iOS/Android/Web)
- **WeatherSnapshot**: Latest weather data for comparison
- **AIHistory**: Cache for AI responses

### Key Relationships
- User → UserPrefs (1:1)
- User → Devices (1:N)
- User → AIHistory (1:N)
- User → WeatherSnapshot (1:1)

## Background Jobs

### Notification Job
Runs every hour to check weather thresholds:
- Temperature alerts (below/above user thresholds)
- Rain probability alerts
- Sends push notifications via Expo/Web Push
- Updates WeatherSnapshot for comparison

## Development

### Project Structure
```
src/
├── controllers/     # Route handlers
├── middleware/      # Express middleware
├── routes/         # Route definitions
├── services/       # Business logic
├── jobs/           # Background jobs
├── utils/          # Utilities and configuration
└── types/          # TypeScript type definitions
```

### Scripts
```bash
# Development
pnpm dev              # Start with hot reload
pnpm build            # Build TypeScript
pnpm start            # Start production build

# Database
pnpm prisma generate  # Generate Prisma client
pnpm prisma migrate dev # Create and apply migration
pnpm prisma studio    # Open database GUI

# Testing
pnpm test            # Run tests
pnpm test:watch      # Run tests in watch mode

# Code Quality
pnpm lint            # Lint code
pnpm format          # Format code
```

## Deployment

### Docker
```bash
# Build image
docker build -t vaero-backend .

# Run with Docker Compose (includes databases)
docker-compose up -d
```

### Environment Variables (Production)
```bash
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
OPENAI_API_KEY="sk-..."
YR_USER_AGENT="Vaero Weather App v1.0.0 (your-email@domain.com)"
YR_FROM_EMAIL="your-email@domain.com"
NODE_ENV="production"
PORT="4000"
ALLOWED_ORIGIN="https://your-frontend-domain.com"
```

### Production Considerations
- Use connection pooling for PostgreSQL
- Configure Redis persistence
- Set up proper logging (structured JSON)
- Enable rate limiting
- Use HTTPS reverse proxy (nginx/Traefik)
- Monitor with Sentry/DataDog

## Configuration

### Weather Data
- **Source**: Yr.no (Norwegian Meteorological Institute)
- **Cache Duration**: 10 minutes
- **Rate Limiting**: Respects Yr.no guidelines

### AI Services
- **Model**: GPT-4
- **Cache Duration**: 24 hours (summaries), 1 hour (clothing)
- **Rate Limiting**: 5 requests/minute per user for Q&A

### Notifications
- **Frequency**: Hourly checks
- **Platforms**: iOS (Expo Push), Android (Expo Push), Web (Web Push)
- **Deduplication**: Once per day per threshold type

## API Examples

### Get Weather with Clothing Suggestions
```bash
curl -X GET "http://localhost:4000/api/weather?lat=59.91&lon=10.75" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

### Update User Preferences
```bash
curl -X PUT "http://localhost:4000/api/users/me/prefs" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "unit": "metric",
    "timeFormat": "24h",
    "notifTempBelow": -5,
    "notifRainProb": 60,
    "stylePreferences": {
      "gender": "female",
      "style": "casual"
    }
  }'
```

### Ask AI a Question
```bash
curl -X POST "http://localhost:4000/api/ai/ask" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Should I bring an umbrella tomorrow?"
  }'
```

## Troubleshooting

### Common Issues

1. **Prisma Client not found**
   ```bash
   pnpm prisma generate
   ```

2. **Database connection failed**
   ```bash
   # Check if databases are running
   pnpm dev:db
   
   # Verify connection string in .env
   ```

3. **Redis connection failed**
   ```bash
   # Check Redis container
   docker ps | grep redis
   
   # Restart databases
   pnpm dev:db:down && pnpm dev:db
   ```

4. **Clerk authentication errors**
   - Verify CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY in .env
   - Check token format in requests
   - Ensure Clerk project is properly configured

### Logs
```bash
# View application logs
docker-compose logs backend

# View database logs
docker-compose logs postgres

# View Redis logs
docker-compose logs redis
```

## Contributing

1. Follow TypeScript strict mode
2. Use Zod for input validation
3. Write tests for new endpoints
4. Follow the existing code structure
5. Update this README for new features
