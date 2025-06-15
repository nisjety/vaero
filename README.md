# Væro

**Væro – værinformasjon som gir deg ro i sjelen**

![Væro Logo](assets/logo.png)

Væro er din nye digitale værkompis som kombinerer pålitelige lokale værdata med smart AI-hjelp – helt gratis og alltid tilgjengelig. Spesielt utviklet for Norge og norske værforhold med fokus på nøyaktighet, hastighet og brukeropplevelse.

## 🌟 Hovedfunksjoner

### 🎯 Presis Værmelding
- **Yr.no Integration**: Oppdatert værdata fra Norges mest pålitelige værvarslingstjeneste
- **Intelligent Caching**: Redis-basert bufring for lynraskt oppslag (under 50ms for populære lokasjoner)
- **Lokasjonspesifikk**: Støtter alle norske byer og regioner med automatisk stedgjenkjenning
- **Sanntidsdata**: Oppdateres hver 10. minutt direkte fra Meteorologisk institutt

### 🤖 AI-Drevne Anbefalinger
- **Smarte Klesforslag**: Personlige anbefalinger basert på temperatur, nedbør, vind og dine preferanser
- **Aktivitetsplanlegging**: AI-genererte forslag til utendørs- og innendørsaktiviteter
- **Reiseplanlegging**: Pakkelister og værforhold for flere lokasjoner
- **Helseanbefalinger**: UV-indeks, pollenvarsel og luftkvalitetsvurderinger
- **Flere AI-modeller**: ONNX, Transformers.js og OpenAI GPT-4 for optimal ytelse

### 🔔 Intelligente Varsler
- **Proaktive Meldinger**: Automatiske varsler før dårlig vær
- **Tilpassbare Terskler**: Sett egne grenser for temperatur- og nedbørsvarsler
- **Multi-platform**: Push-varsler på web, iOS og Android via Expo
- **Smart Timing**: Varsler sendes på optimale tidspunkt basert på brukeratferd

### 📊 Avansert Væranalyse
- **Astronomiske Data**: Soloppgang, solnedgang, månefaser og polarnatt-informasjon
- **Atmosfæriske Forhold**: Lufttrykk, fuktighet, dugpunkt og skydekke
- **Vindanalyse**: Vindstyrke, vindretning og vindkast med norske beskrivelser
- **Nedbørsdetaljer**: Regn, snø, sludd med intensitet og varighet

### 📍 Lokasjonsfunksjoner
- **Favorittlokasjoner**: Lagre hjemme, hytta, jobb og andre viktige steder
- **GPS-integrasjon**: Automatisk stedgjenkjenning med høy nøyaktighet
- **Populære Destinasjoner**: Forhåndscachede data for alle store norske byer
- **Sammenligning**: Sammenlign værforhold mellom flere lokasjoner samtidig

## 💻 Teknisk Stack

### Backend
- **Runtime**: Node.js 18+ med TypeScript
- **Framework**: Express.js med moderne middleware
- **Database**: PostgreSQL med Prisma ORM v7
- **Cache**: Redis med ioredis for høytytelsescaching
- **Autentisering**: Clerk Express v1.5+ med JWT Session Tokens
- **AI/ML**: OpenAI GPT-4, ONNX Runtime, Transformers.js
- **Background Jobs**: BullMQ for notifikasjonsbehandling
- **Validering**: Zod for runtime type checking

### Frontend Web
- **Framework**: Next.js 15 med App Router
- **Språk**: TypeScript med streng type checking
- **Styling**: Tailwind CSS 4 med custom design system
- **State Management**: React Query v5 (TanStack Query)
- **3D Graphics**: Three.js for værbakgrunn og animasjoner
- **UI Components**: Radix UI + Headless UI
- **Autentisering**: Clerk Next.js SDK

### Mobile App
- **Platform**: Expo SDK 53 med Expo Router
- **Framework**: React Native 0.78
- **Styling**: NativeWind v4 (Tailwind for React Native)
- **Navigation**: Expo Router med native stack
- **Push Notifications**: Expo Push Notifications

### DevOps & Infrastruktur
- **Workspace**: pnpm workspaces for monorepo
- **Containerization**: Docker med multi-stage builds
- **Orchestration**: Docker Compose for development
- **CI/CD**: GitHub Actions
- **Monitoring**: Winston logging + performance metrics
- **Package Manager**: pnpm 10.x for rask installasjon

## 🚀 Kom i Gang

### Forutsetninger
- **Node.js**: Versjon 18 eller nyere
- **pnpm**: Versjon 10.x eller nyere
- **Docker**: For backend development og database
- **Git**: For kildekodeversjonering

### Rask Start

1. **Klon repoet**:
   ```bash
   git clone https://github.com/nisjety/vaero.git
   cd vaero
   ```

2. **Installer alle avhengigheter**:
   ```bash
   pnpm install
   ```

3. **Sett opp miljøvariabler**:
   ```bash
   cp .env.example .env
   # Rediger .env med dine API-nøkler og konfiguration
   ```

4. **Start backend med Docker**:
   ```bash
   docker-compose up -d postgres redis
   cd apps/backend && pnpm dev
   ```

5. **Start web-applikasjonen**:
   ```bash
   cd apps/web && pnpm dev
   ```

6. **Start mobile app** (valgfritt):
   ```bash
   cd apps/mobile && pnpm start
   ```

### Produksjonsoppsett

For produksjonsmiljø, bruk Docker Compose:

```bash
# Bygg og start alle tjenester
docker-compose up --build -d

# Se logger
docker-compose logs -f web backend

# Stopp tjenester
docker-compose down
```

### Utvikling

#### Backend Development
```bash
cd apps/backend

# Database setup
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma seed

# Start development server
pnpm dev

# Kjør tester
pnpm test
```

#### Web Development
```bash
cd apps/web

# Start development server
pnpm dev

# Bygg for produksjon
pnpm build

# Start production server
pnpm start
```


## 🌊 API-dokumentasjon

Væro tilbyr en omfattende REST API med to hovedtilgangsnivåer:

### 🆓 Gratis Nivå
- **Endepunkter**: `/api/weather/*` og `/api/weather-ai/*`
- **Autentisering**: Ikke påkrevd
- **Ratebegrensning**: Ingen (fair use policy)
- **Funksjoner**: Full værdata og grunnleggende AI-analyse

### 💎 Premium Nivå gpt4 api key needed
- **Endepunkter**: `/api/ai/*` og `/api/users/*`
- **Autentisering**: Clerk JWT påkrevd
- **Ratebegrensning**: Sjenerøse daglige grenser
- **Funksjoner**: Personlige anbefalinger, avansert AI-analyse, reiseplanlegging

### Eksempel API-kall
```bash
# Hent current weather for Oslo
curl "http://localhost:3001/api/weather/current?lat=59.9139&lon=10.7522"

# Hent AI-forbedret væranalyse
curl "http://localhost:3001/api/weather-ai/enhanced?lat=59.9139&lon=10.7522"

# Hent personlige klesforslag (krever autentisering)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     "http://localhost:3001/api/ai/clothing?lat=59.9139&lon=10.7522"
```

## 🔧 Konfiguration

### Miljøvariabler

#### Backend (.env)
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/vaero"
REDIS_URL="redis://localhost:6379"

# Autentisering
CLERK_SECRET_KEY="sk_test_..."
CLERK_PUBLISHABLE_KEY="pk_test_..."

# AI-tjenester
OPENAI_API_KEY="sk-..."

# Yr.no API
YR_USER_AGENT="VaeroWeatherAPI/1.0 (contact@vaero.no)"
YR_FROM_EMAIL="contact@vaero.no"

# Notifikasjoner
EXPO_ACCESS_TOKEN="your_expo_token"
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

## 🧪 Testing

### Backend Testing
```bash
cd apps/backend

# Kjør alle tester
pnpm test

# Kjør tester med coverage
pnpm test:coverage

# Test spesifikk fil
pnpm test weather.controller.test.ts
```

### Frontend Testing
```bash
cd apps/web

# Kjør komponenttester
pnpm test

# Kjør E2E tester
pnpm test:e2e
```

## 📊 Monitorering og Ytelse

### Metrics
- **API responstid**: < 100ms for cachede forespørsler
- **Database queries**: Optimalisert med indekser og connection pooling
- **Cache hit rate**: > 95% for populære lokasjoner
- **Tilgjengelighet**: 99.9% uptime-mål

### Logging
```bash
# Se backend logger
docker-compose logs -f backend

# Se web logger
docker-compose logs -f web

# Filtrer etter loglevel
docker-compose logs backend | grep ERROR
```

## 🛡️ Sikkerhet

### Datasikkerhet
- **Kryptering**: All kommunikasjon over HTTPS/TLS
- **Autentisering**: Clerk-basert JWT med automatisk utløp
- **Database**: PostgreSQL med row-level security
- **API-nøkler**: Sikker håndtering av miljøvariabler

### Personvern
- **Minimal datainnsamling**: Kun nødvendige brukerdata
- **GDPR-kompatibel**: Rett til sletting og dataportabilitet
- **Anonymiserte metrics**: Ingen personidentifiserbar informasjon i analyser

## 🚨 Problemløsing

### Vanlige problemer

#### "Cannot connect to database"
```bash
# Sjekk at PostgreSQL kjører
docker-compose ps postgres

# Restart database
docker-compose restart postgres
```

#### "Redis connection failed"
```bash
# Sjekk Redis status
docker-compose ps redis

# Tøm Redis cache
docker-compose exec redis redis-cli FLUSHALL
```

#### "Yr.no API rate limit"
```bash
# Sjekk API-konfiguration
grep YR_USER_AGENT apps/backend/.env

# Verifiser at User-Agent er korrekt satt
```

#### "OpenAI API quota exceeded"
```bash
# Sjekk API-bruk på OpenAI dashboard
# Vurder å aktivere fallback til ONNX-modeller
```

### Debug-modus
```bash
# Start backend med debug logging
DEBUG=vaero:* pnpm --filter backend dev

# Start frontend med verbose logging
NEXT_PUBLIC_DEBUG=true pnpm --filter web dev
```

## 📈 Roadmap

### Kommende funksjoner
- 🌍 **Internasjonal støtte**: Værdata for flere land
- 📱 **Forbedret mobile app**: Nativ iOS og Android-app
- 🔮 **ML-forbedringer**: Egne værtrendmodeller
- 🏠 **Smart Home**: Integrasjon med HomeKit og Google Home
- 📊 **Historisk data**: Værhistorikk og trender
- 🌪️ **Værvarsel**: Avanserte varselsystemer
- 🎨 **Redesign**:  Ny dashboard side
- 🌐 **PWA**: Full Progressive Web App-støtte

---

**Væro v1.0**

*"Værmelding som gir deg ro i sjelen"*
