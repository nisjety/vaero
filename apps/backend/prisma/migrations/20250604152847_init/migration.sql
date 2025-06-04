-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_prefs" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'metric',
    "timeFormat" TEXT NOT NULL DEFAULT '24h',
    "defaultLat" DOUBLE PRECISION,
    "defaultLon" DOUBLE PRECISION,
    "stylePreferences" JSONB,
    "notifTempBelow" DOUBLE PRECISION,
    "notifTempAbove" DOUBLE PRECISION,
    "notifRainProb" INTEGER,

    CONSTRAINT "user_prefs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "platform" TEXT NOT NULL,
    "pushToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weather_snapshots" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "currentTemp" DOUBLE PRECISION NOT NULL,
    "symbolCode" TEXT NOT NULL,
    "rawData" JSONB NOT NULL,

    CONSTRAINT "weather_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_histories" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "promptInput" TEXT NOT NULL,
    "aiResponse" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,

    CONSTRAINT "ai_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkUserId_key" ON "users"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "user_prefs_userId_key" ON "user_prefs"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "weather_snapshots_userId_key" ON "weather_snapshots"("userId");

-- AddForeignKey
ALTER TABLE "user_prefs" ADD CONSTRAINT "user_prefs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weather_snapshots" ADD CONSTRAINT "weather_snapshots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_histories" ADD CONSTRAINT "ai_histories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
