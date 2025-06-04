# Væro

**Væro – værinformasjon som gir deg ro i sjelen**

![Væro Logo](assets/logo.png)

Væro er din nye digitale værkompis som kombinerer pålitelige lokale værdata med smart AI-hjelp – helt gratis og alltid tilgjengelig.

## 🌟 Hovedfunksjoner

### 🎯 Presis Værmelding
- Oppdatert værdata fra Yr (Norges ledende værvarslingstjeneste)
- Bufret for raskt oppslag
- Lokasjonbasert værinformasjon

### 👕 AI-Drevne Klesforslag
- Personlige anbefalinger basert på:
  - Temperatur
  - Nedbør
  - Vindforhold
  - Dine preferanser

### 🔔 Smarte Varsler
- Temperaturvarsler under frysepunktet
- Nedbørsvarsler basert på dine preferanser
- Push-varsler på mobil og nettleser
- Proaktive værvarsler

### 📅 Daglig Oppsummering
- Konsis morgenoversikt
- Værforhold for dagen og morgendagen
- Aktivitetsanbefalinger tilpasset været
  - Turer
  - Trening
  - Kafébesøk
  - Innendørsaktiviteter

### 📍 Favorittlokasjoner
- Lagre viktige steder:
  - Hjemme
  - Hytta
  - Jobb
- Rask veksling mellom lokasjoner
- Automatisk stedgjenkjenning

## 💻 Teknisk Stack

- **Backend**: Node.js, Express, Prisma 7, Redis, Clerk v2, OpenAI
- **Web**: Next.js 15, TypeScript, Tailwind CSS 4, React Query v5
- **Mobile**: Expo SDK 53, React Native 0.78, NativeWind v4
- **Infrastruktur**: pnpm workspaces, Docker, GitHub Actions

## 🚀 Kom i Gang

### Forutsetninger
- Node.js 18 eller nyere
- pnpm 10.x eller nyere
- Docker (for backend utvikling)

### Installasjon

1. Klon repoet:
   \`\`\`bash
   git clone https://github.com/nisjety/vaero.git
   cd vaero
   \`\`\`

2. Installer avhengigheter:
   \`\`\`bash
   pnpm install
   \`\`\`

3. Sett opp miljøvariabler:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

4. Start utviklingsmiljøet:
   \`\`\`bash
   # Backend
   pnpm --filter backend dev

   # Web
   pnpm --filter web dev

   # Mobile
   pnpm --filter mobile start
   \`\`\`

## 🤝 Bidra

Vi setter pris på alle bidrag! Se [CONTRIBUTING.md](.github/CONTRIBUTING.md) for retningslinjer.

## 📄 Lisens

Dette prosjektet er lisensiert under MIT-lisensen - se [LICENSE](LICENSE) filen for detaljer.

## 🙏 Takk til

- [Yr/Met.no](https://www.yr.no/) for værdatatilgang
- [OpenAI](https://openai.com/) for AI-funksjonalitet
- Alle bidragsytere og brukere

---

Laget med ❤️ i Norge 🇳🇴
