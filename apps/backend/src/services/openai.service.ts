import OpenAI from 'openai';
import { env } from '../utils/env';
import { logger } from '../utils/logger';
import { prisma } from '../utils/database';
import { YrService, yrService, type WeatherData } from './yr.service';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export interface ClothingSuggestion {
  items: string[];
  explanation: string;
}

export interface ActivitySuggestion {
  activity: string;
  reason: string;
}

export interface PackingList {
  items: string[];
  notes: string;
}

export const generateClothingSuggestion = async (
  userId: number,
  weather: WeatherData,
  userPrefs?: any
): Promise<ClothingSuggestion> => {
  try {
    // Check if we already have a clothing suggestion for today
    const today = new Date().toDateString();
    const existing = await prisma.aIHistory.findFirst({
      where: {
        userId,
        type: 'clothingSuggestion',
        timestamp: {
          gte: new Date(today),
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    if (existing) {
      const metadata = existing.metadata as any;
      return {
        items: metadata.items || [],
        explanation: existing.aiResponse,
      };
    }

    const stylePrefs = userPrefs?.stylePreferences || { gender: 'unspecified', style: 'casual' };
    const current = weather.current;

    const prompt = `You are a clothing recommendation engine for Norwegian weather.
User style preferences: ${JSON.stringify(stylePrefs)}.
Current weather: ${current.temperature}°C, condition: ${current.symbol_code}, wind: ${current.wind_speed} m/s, precipitation probability: ${current.precip_prob ?? 0}%.
Location: Norway (consider Nordic climate).

Suggest practical clothing for this weather. Return JSON format:
{
  "items": ["item1", "item2", ...],
  "explanation": "Brief explanation of why these items are recommended"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    let parsed;
    try {
      parsed = JSON.parse(response);
    } catch (error) {
      // Fallback if JSON parsing fails
      parsed = {
        items: ['weather-appropriate clothing'],
        explanation: response,
      };
    }

    // Store in database
    await prisma.aIHistory.create({
      data: {
        userId,
        type: 'clothingSuggestion',
        promptInput: prompt,
        aiResponse: parsed.explanation,
        metadata: {
          items: parsed.items,
          temperature: current.temperature,
          condition: current.symbol_code,
          cacheKey: `clothing_${userId}_${today}`,
        },
      },
    });

    logger.info(`Clothing suggestion generated for user ${userId}`);
    return {
      items: parsed.items,
      explanation: parsed.explanation,
    };
  } catch (error) {
    logger.error('Failed to generate clothing suggestion:', error);
    throw error;
  }
};

export const generateDailySummary = async (
  lat: number,
  lon: number,
  userId: number
): Promise<string> => {
  try {
    const weather = await yrService.getWeather(lat, lon);
    const today = weather.daily[0];
    const tomorrow = weather.daily[1];

    const todayDate = new Date().toISOString().split('T')[0];
    const tomorrowDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const prompt = `You are a weather reporter for Norway. Provide a concise daily weather summary.
Today (${todayDate}): High ${today?.maxTemp || 'N/A'}°C, Low ${today?.minTemp || 'N/A'}°C, Condition: ${today?.symbol_code || 'unknown'}.
Tomorrow (${tomorrowDate}): High ${tomorrow?.maxTemp || 'N/A'}°C, Low ${tomorrow?.minTemp || 'N/A'}°C, Condition: ${tomorrow?.symbol_code || 'unknown'}.

Return JSON format: {"summary": "100-word summary suitable for Norwegian residents"}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 200,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    let parsed;
    try {
      parsed = JSON.parse(response);
    } catch (error) {
      parsed = { summary: response };
    }

    // Store in database
    await prisma.aIHistory.create({
      data: {
        userId,
        type: 'dailySummary',
        promptInput: prompt,
        aiResponse: parsed.summary,
        metadata: {
          lat,
          lon,
          todayHigh: today?.maxTemp,
          todayLow: today?.minTemp,
          tomorrowHigh: tomorrow?.maxTemp,
          tomorrowLow: tomorrow?.minTemp,
          cacheKey: `daily_summary_${lat}_${lon}_${todayDate}`,
        },
      },
    });

    logger.info(`Daily summary generated for user ${userId} at ${lat},${lon}`);
    return parsed.summary;
  } catch (error) {
    logger.error('Failed to generate daily summary:', error);
    throw error;
  }
};

export const generateActivitySuggestion = async (
  lat: number,
  lon: number,
  date: string,
  userId: number
): Promise<ActivitySuggestion> => {
  try {
    const weather = await yrService.getWeather(lat, lon);
    
    // Find weather for the specific date
    const targetDate = new Date(date);
    const dailyForecast = weather.daily.find((day: { date: string }) => {
      const forecastDate = new Date(day.date);
      return forecastDate.toDateString() === targetDate.toDateString();
    });

    if (!dailyForecast) {
      throw new Error('Weather data not available for the requested date');
    }

    const prompt = `You are a lifestyle advisor for Norway. Suggest an outdoor activity based on weather conditions.
Date: ${date}
Weather: High ${dailyForecast.maxTemp}°C, Low ${dailyForecast.minTemp}°C, Condition: ${dailyForecast.symbol_code}
Location: Norway (consider Norwegian culture and geography)

Suggest a suitable activity for this weather. Return JSON format:
{
  "activity": "specific activity name",
  "reason": "brief explanation why this activity is perfect for these conditions"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 200,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    let parsed;
    try {
      parsed = JSON.parse(response);
    } catch (error) {
      parsed = {
        activity: 'Indoor activities',
        reason: response,
      };
    }

    // Store in database
    await prisma.aIHistory.create({
      data: {
        userId,
        type: 'activitySuggestion',
        promptInput: prompt,
        aiResponse: parsed.reason,
        metadata: {
          lat,
          lon,
          date,
          activity: parsed.activity,
          maxTemp: dailyForecast.maxTemp,
          minTemp: dailyForecast.minTemp,
          condition: dailyForecast.symbol_code,
        },
      },
    });

    logger.info(`Activity suggestion generated for user ${userId} for ${date}`);
    return {
      activity: parsed.activity,
      reason: parsed.reason,
    };
  } catch (error) {
    logger.error('Failed to generate activity suggestion:', error);
    throw error;
  }
};

export const generatePackingList = async (
  lat: number,
  lon: number,
  startDate: string,
  endDate: string,
  userId: number
): Promise<PackingList> => {
  try {
    const weather = await yrService.getWeather(lat, lon);
    
    // Filter weather data for the date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const relevantDays = weather.daily.filter((day: { date: string }) => {
      const dayDate = new Date(day.date);
      return dayDate >= start && dayDate <= end;
    });

    if (relevantDays.length === 0) {
      throw new Error('No weather data available for the requested date range');
    }

    // Create weather summary for the period
    const weatherSummary = relevantDays.map((day: { date: string; maxTemp: number; minTemp: number; symbol_code: string }) => 
      `- ${day.date}: High ${day.maxTemp}°C, Low ${day.minTemp}°C, ${day.symbol_code}`
    ).join('\n');

    const prompt = `You are a packing advisor for travel in Norway. Create a packing list based on weather forecast.
Travel dates: ${startDate} to ${endDate}
Location: Norway (lat: ${lat}, lon: ${lon})

Weather forecast:
${weatherSummary}

Create a comprehensive packing list. Return JSON format:
{
  "items": ["item1", "item2", ...],
  "notes": "Additional packing tips and weather considerations"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 400,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    let parsed;
    try {
      parsed = JSON.parse(response);
    } catch (error) {
      parsed = {
        items: ['Weather-appropriate clothing', 'Rain protection'],
        notes: response,
      };
    }

    // Store in database
    await prisma.aIHistory.create({
      data: {
        userId,
        type: 'packingList',
        promptInput: prompt,
        aiResponse: parsed.notes,
        metadata: JSON.stringify({
          lat,
          lon,
          startDate,
          endDate,
          items: parsed.items,
          weatherSummary: relevantDays,
        }),
      },
    });

    logger.info(`Packing list generated for user ${userId} from ${startDate} to ${endDate}`);
    return {
      items: parsed.items,
      notes: parsed.notes,
    };
  } catch (error) {
    logger.error('Failed to generate packing list:', error);
    throw error;
  }
};

export const askAIQuestion = async (
  question: string,
  userId: number
): Promise<string> => {
  try {
    // Validate question length
    if (question.length > 500) {
      throw new Error('Question too long (max 500 characters)');
    }

    const prompt = `You are a weather expert and lifestyle advisor for Norway. 
User question: "${question}"

Provide a helpful, accurate answer. If the question is weather-related, include relevant Norwegian weather context.
Keep your response concise and practical.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Store in database
    await prisma.aIHistory.create({
      data: {
        userId,
        type: 'userQuestion',
        promptInput: question,
        aiResponse: response,
        metadata: {
          questionLength: question.length,
          timestamp: new Date().toISOString(),
        },
      },
    });

    logger.info(`AI question answered for user ${userId}`, {
      questionLength: question.length,
    });

    return response;
  } catch (error) {
    logger.error('Failed to process AI question:', error);
    throw error;
  }
};
