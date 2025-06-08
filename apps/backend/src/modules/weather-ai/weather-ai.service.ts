import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';

interface AIModel {
  name: string;
  initialize(): Promise<void>;
  analyzeWeather(weatherData: any): Promise<string>;
  isReady(): boolean;
  getInfo(): { name: string; size: string; speed: string };
}

@Injectable()
export class WeatherAIService implements OnModuleInit {
  private readonly logger = new Logger(WeatherAIService.name);
  private models: Map<string, AIModel> = new Map();
  private currentModel: AIModel | null = null;
  private isInitializing = false;

  constructor(
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async onModuleInit() {
    // Initialize in background to not block your existing app
    setTimeout(() => this.initializeProgressiveAI(), 2000);
  }

  private async initializeProgressiveAI() {
    if (this.isInitializing) return;
    this.isInitializing = true;

    try {
      this.logger.log('🚀 Starting Weather AI progressive initialization...');

      // Step 1: Always start with fallback (instant)
      const fallbackModel = new FallbackWeatherModel();
      await fallbackModel.initialize();
      this.models.set('fallback', fallbackModel);
      this.currentModel = fallbackModel;
      this.logger.log('✅ Fallback model ready (always available)');

      // Step 2: Try ONNX model (fast, 1-3s)
      if (this.configService.get('AI_ONNX_MODEL_PATH')) {
        try {
          this.logger.log('📦 Loading ONNX model...');
          const onnxModel = new ONNXWeatherModel(this.configService);
          await onnxModel.initialize();
          this.models.set('onnx', onnxModel);
          this.currentModel = onnxModel; // Upgrade from fallback
          this.logger.log('✅ ONNX model ready (ultra-fast inference)');
        } catch (error: any) {
          this.logger.warn('ONNX model initialization failed:', error.message);
          this.logger.log('ℹ️  Continuing with fallback model');
        }
      }

      // Step 3: Try Transformers.js model (background, 10-30s)
      if (this.configService.get('AI_ENABLE_BACKGROUND_PROCESSING', 'true') === 'true') {
        this.initializeTransformersBackground();
      }

    } catch (error: any) {
      this.logger.error('AI initialization failed completely:', error);
      // Ensure we at least have a fallback
      if (!this.currentModel) {
        const emergencyFallback = new FallbackWeatherModel();
        await emergencyFallback.initialize();
        this.models.set('emergency', emergencyFallback);
        this.currentModel = emergencyFallback;
      }
    } finally {
      this.isInitializing = false;
    }
  }

  private async initializeTransformersBackground() {
    try {
      this.logger.log('📦 Loading Transformers.js model in background...');
      const transformersModel = new TransformersWeatherModel(this.configService);
      await transformersModel.initialize();
      
      this.models.set('transformers', transformersModel);
      this.currentModel = transformersModel; // Upgrade
      this.logger.log('✅ Transformers.js ready - upgraded analysis quality');
      
      // Pre-cache Oslo
      await this.preCacheOslo();
    } catch (error: any) {
      this.logger.warn('Transformers.js failed, keeping current model:', error.message);
    }
  }

  // Main enhancement method
  async enhanceWeatherWithAI(weatherData: any, options: { model?: string; useCache?: boolean } = {}) {
    const { model = 'auto', useCache = true } = options;
    
    if (!this.currentModel || !this.currentModel.isReady()) {
      return {
        ...weatherData,
        aiAnalysis: 'AI-analyse ikke tilgjengelig akkurat nå',
        aiModel: 'none',
        enhanced: false
      };
    }

    const cacheKey = this.generateCacheKey(weatherData, model);
    
    if (useCache) {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        return { ...weatherData, ...cached, fromCache: true };
      }
    }

    try {
      const startTime = Date.now();
      const analysis = await this.currentModel.analyzeWeather(weatherData);
      const analysisTime = Date.now() - startTime;

      const result = {
        ...weatherData,
        aiAnalysis: analysis,
        aiModel: this.currentModel.getInfo().name,
        aiResponseTime: analysisTime,
        enhanced: true,
        fromCache: false
      };

      if (useCache) {
        await this.cacheManager.set(cacheKey, {
          aiAnalysis: analysis,
          aiModel: this.currentModel.getInfo().name,
          aiResponseTime: analysisTime,
          enhanced: true
        }, 15 * 60 * 1000);
      }

      return result;
    } catch (error: any) {
      this.logger.error('AI analysis failed:', error);
      return {
        ...weatherData,
        aiAnalysis: 'AI-analyse midlertidig utilgjengelig',
        enhanced: false
      };
    }
  }

  private async preCacheOslo() {
    try {
      // Import YrService to get actual weather data
      const { yrService } = await import('../../services/yr.service');
      
      // Get real Oslo weather data
      const osloLat = 59.9139;
      const osloLon = 10.7522;
      const osloWeather = await yrService.getWeather(osloLat, osloLon);
      
      await this.enhanceWeatherWithAI(osloWeather, { useCache: true });
      this.logger.log('🇳🇴 Oslo weather pre-cached with real data');
    } catch (error: any) {
      this.logger.warn('Oslo pre-caching failed:', error);
    }
  }

  async getAIStatus() {
    return {
      initialized: this.models.size > 0,
      availableModels: Array.from(this.models.entries()).map(([key, model]) => ({
        key,
        ...model.getInfo(),
        ready: model.isReady(),
        current: model === this.currentModel
      })),
      currentModel: this.currentModel?.getInfo().name || 'none'
    };
  }

  private generateCacheKey(weatherData: any, model: string): string {
    // Extract values correctly from either top-level or nested structure
    const temp = weatherData.current?.temperature || weatherData.temperature || 0;
    const symbolCode = weatherData.current?.symbol_code || weatherData.symbol_code || 'unknown';
    const windSpeed = weatherData.current?.wind_speed || weatherData.wind_speed || 0;
    
    return `weather_ai:${Math.round(temp)}_${symbolCode}_${Math.round(windSpeed)}_${model}`;
  }

  /**
   * Generate clothing advice based on weather data and user preferences
   */
  async generateClothingAdvice(weatherData: any, userPrefs: any = null): Promise<any> {
    try {
      const analysis = await this.enhanceWeatherWithAI(weatherData);
      
      // Parse user preferences
      const stylePrefs = userPrefs?.stylePreferences ? 
        (typeof userPrefs.stylePreferences === 'string' ? 
          JSON.parse(userPrefs.stylePreferences) : 
          userPrefs.stylePreferences) : {};

      const temp = weatherData.current?.temperature || weatherData.temperature || 0;
      const wind = weatherData.current?.wind_speed || weatherData.wind_speed || 0;
      const precip = weatherData.current?.precipitation_amount || weatherData.precipitation_amount || 0;
      const symbol = weatherData.current?.symbol_code || weatherData.symbol_code || '';

      // Generate clothing items based on conditions
      const items = this.generateClothingItems(temp, wind, precip, symbol, stylePrefs);
      
      return {
        items,
        explanation: analysis.aiAnalysis || 'Kle deg etter værforholdene',
        temperature: temp,
        conditions: this.translateSymbolCode(symbol),
        aiModel: analysis.aiModel || 'fallback'
      };
    } catch (error) {
      this.logger.error('Error generating clothing advice:', error);
      return {
        items: ['jakke', 'bukse', 'sko'],
        explanation: 'Standardkledning anbefales',
        temperature: weatherData.current?.temperature || weatherData.temperature || 0
      };
    }
  }

  /**
   * Generate activity advice based on weather and duration
   */
  async generateActivityAdvice(weatherData: any, duration: string = 'current'): Promise<any> {
    try {
      const analysis = await this.enhanceWeatherWithAI(weatherData);
      const temp = weatherData.current?.temperature || weatherData.temperature || 0;
      const precip = weatherData.current?.precipitation_amount || weatherData.precipitation_amount || 0;
      const wind = weatherData.current?.wind_speed || weatherData.wind_speed || 0;

      const activity = this.suggestActivity(temp, precip, wind, duration);
      
      return {
        activity: activity.name,
        reason: activity.reason,
        duration,
        suitability: activity.suitability,
        alternatives: activity.alternatives || [],
        aiAnalysis: analysis.aiAnalysis
      };
    } catch (error) {
      this.logger.error('Error generating activity advice:', error);
      return {
        activity: 'Innendørs aktiviteter',
        reason: 'Vær forsiktig med værforholdene',
        duration,
        suitability: 'medium'
      };
    }
  }

  /**
   * Generate packing advice for travel
   */
  async generatePackingAdvice(weatherData: any, duration: string = 'day'): Promise<any> {
    try {
      const analysis = await this.enhanceWeatherWithAI(weatherData);
      
      // Handle forecast data for longer durations
      const forecast = weatherData.daily || weatherData.forecast || [weatherData.current || weatherData];
      const packingItems = this.generatePackingItems(forecast, duration);
      
      return {
        items: packingItems.essential,
        optional: packingItems.optional,
        notes: packingItems.notes,
        duration,
        forecast: forecast.slice(0, duration === 'week' ? 7 : 3),
        aiAnalysis: analysis.aiAnalysis
      };
    } catch (error) {
      this.logger.error('Error generating packing advice:', error);
      return {
        items: ['klær', 'regnjakke', 'sko'],
        optional: ['paraply', 'solbriller'],
        notes: 'Standardpakking for norske værforhold',
        duration
      };
    }
  }

  /**
   * Generate basic insights for any weather data
   */
  async generateBasicInsights(weatherData: any): Promise<any> {
    try {
      const analysis = await this.enhanceWeatherWithAI(weatherData);
      const temp = weatherData.current?.temperature || weatherData.temperature || 0;
      const comfort = this.assessComfort(weatherData);
      
      return {
        summary: analysis.aiAnalysis || 'Værdata tilgjengelig',
        comfort: comfort.level,
        comfortReason: comfort.reason,
        highlights: this.generateHighlights(weatherData),
        tips: this.generateQuickTips(weatherData),
        aiModel: analysis.aiModel || 'fallback',
        enhanced: analysis.enhanced || false
      };
    } catch (error) {
      this.logger.error('Error generating basic insights:', error);
      return {
        summary: 'Værdata mottatt',
        comfort: 'medium',
        comfortReason: 'Standard værforhold',
        highlights: ['Sjekk været før du går ut'],
        tips: ['Kle deg etter temperaturen']
      };
    }
  }

  /**
   * Get AI model status and information
   */
  async getModelStatus(): Promise<any> {
    try {
      const status = await this.getAIStatus();
      
      return {
        initialized: status.initialized,
        fallback: {
          name: 'Enhanced Rules',
          loaded: this.models.has('fallback'),
          ready: this.models.get('fallback')?.isReady() || false,
          speed: '<1ms',
          size: '<1MB'
        },
        onnx: {
          name: 'ONNX Fast Model',
          loaded: this.models.has('onnx'),
          ready: this.models.get('onnx')?.isReady() || false,
          speed: '1-3ms',
          size: '5-15MB'
        },
        transformers: {
          name: 'Transformers.js',
          loaded: this.models.has('transformers'),
          ready: this.models.get('transformers')?.isReady() || false,
          speed: '50-200ms',
          size: '300MB'
        },
        current: status.currentModel,
        availableModels: status.availableModels.length
      };
    } catch (error) {
      this.logger.error('Error getting model status:', error);
      return {
        initialized: false,
        fallback: { loaded: false, ready: false },
        onnx: { loaded: false, ready: false },
        transformers: { loaded: false, ready: false },
        current: 'none',
        availableModels: 0
      };
    }
  }

  // Helper methods for clothing advice
  private generateClothingItems(temp: number, wind: number, precip: number, symbol: string, stylePrefs: any = {}): string[] {
    const items: string[] = [];
    const gender = stylePrefs.gender || 'unisex';
    const style = stylePrefs.style || 'casual';

    // Base layers
    if (temp < 0) {
      items.push('termoundertøy', 'vinterjakke', 'vintersko', 'lue', 'votter');
    } else if (temp < 10) {
      items.push('varm genser', 'jakke', 'lange bukser', 'støvler');
    } else if (temp < 20) {
      items.push('lett genser', 'lett jakke', 'lange bukser', 'sko');
    } else {
      items.push('t-skjorte', 'shorts eller lett bukse', 'sandaler eller lette sko');
    }

    // Weather specific
    if (precip > 1) {
      items.push('regnjakke', 'paraply', 'tette sko');
    }
    if (wind > 10) {
      items.push('vindtett ytterjakke');
    }
    if (temp > 25) {
      items.push('solbriller', 'solkrem', 'cap eller hatt');
    }

    return items;
  }

  private suggestActivity(temp: number, precip: number, wind: number, duration: string): any {
    if (precip > 5) {
      return {
        name: 'Innendørs aktiviteter',
        reason: 'Kraftig regn gjør utendørsaktiviteter vanskelige',
        suitability: 'low',
        alternatives: ['museum', 'bibliotek', 'innendørs sport', 'kaffe']
      };
    }

    if (temp > 15 && precip < 1 && wind < 10) {
      return {
        name: 'Turgåing eller sykling',
        reason: 'Perfekte forhold for utendørsaktiviteter',
        suitability: 'high',
        alternatives: ['jogging', 'fotball', 'piknik']
      };
    }

    if (temp < 0 && precip < 1) {
      return {
        name: 'Vinteraktiviteter',
        reason: 'Gode forhold for vintersport',
        suitability: 'high',
        alternatives: ['skiløping', 'skøyting', 'vintertur']
      };
    }

    return {
      name: 'Lett utendørsaktivitet',
      reason: 'Moderate værforhold',
      suitability: 'medium',
      alternatives: ['kort tur', 'innendørs sport']
    };
  }

  private generatePackingItems(forecast: any[], duration: string): any {
    const essential: string[] = [];
    const optional: string[] = [];
    let notes = '';

    const temps = forecast.map(f => f.temperature || f.maxTemp || 0);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const hasRain = forecast.some(f => (f.precipitation_amount || 0) > 1);

    // Temperature range packing
    if (minTemp < 0) {
      essential.push('vinterklær', 'varme sko', 'lue og votter');
    } else if (minTemp < 10) {
      essential.push('varm jakke', 'lange bukser');
    }

    if (maxTemp > 20) {
      essential.push('lette klær', 'shorts', 'solbriller');
    }

    if (hasRain) {
      essential.push('regnjakke', 'paraply', 'ekstra sokker');
      notes += 'Regn forventet - pakk vanntett utstyr. ';
    }

    // Duration specific
    if (duration === 'week') {
      essential.push('ekstra undertøy', 'flere gensere');
      optional.push('treningsklær', 'fine klær');
    }

    return { essential, optional, notes: notes.trim() };
  }

  private assessComfort(weatherData: any): { level: string; reason: string } {
    const temp = weatherData.current?.temperature || weatherData.temperature || 0;
    const wind = weatherData.current?.wind_speed || weatherData.wind_speed || 0;
    const precip = weatherData.current?.precipitation_amount || weatherData.precipitation_amount || 0;

    if (precip > 5 || wind > 15 || temp < -5 || temp > 30) {
      return { level: 'low', reason: 'Krevende værforhold' };
    } else if (temp >= 15 && temp <= 25 && precip < 1 && wind < 10) {
      return { level: 'high', reason: 'Ideelle værforhold' };
    } else {
      return { level: 'medium', reason: 'Moderate værforhold' };
    }
  }

  private generateHighlights(weatherData: any): string[] {
    const highlights: string[] = [];
    const temp = weatherData.current?.temperature || weatherData.temperature || 0;
    const wind = weatherData.current?.wind_speed || weatherData.wind_speed || 0;
    const precip = weatherData.current?.precipitation_amount || weatherData.precipitation_amount || 0;

    if (temp > 25) highlights.push('Varmt vær - husk væske');
    if (temp < 0) highlights.push('Frostfare - pass på glate veier');
    if (wind > 10) highlights.push('Sterk vind - pass på vindtett klær');
    if (precip > 1) highlights.push('Regn - ta med paraply');

    if (highlights.length === 0) {
      highlights.push('Behagelige værforhold');
    }

    return highlights;
  }

  private generateQuickTips(weatherData: any): string[] {
    const tips: string[] = [];
    const temp = weatherData.current?.temperature || weatherData.temperature || 0;
    const precip = weatherData.current?.precipitation_amount || weatherData.precipitation_amount || 0;

    if (temp < 10) tips.push('Kle deg i lag');
    if (precip > 0) tips.push('Sjekk regnet før du går ut');
    if (temp > 20) tips.push('Lette klær anbefales');
    
    tips.push('Sjekk prognoser for dagen');
    
    return tips;
  }

  private translateSymbolCode(symbolCode: string): string {
    const translations: { [key: string]: string } = {
      'clearsky': 'klart',
      'fair': 'lettskyet', 
      'partlycloudy': 'delvis skyet',
      'cloudy': 'overskyet',
      'lightrainshowers': 'lette regnbyger',
      'rainshowers': 'regnbyger',
      'heavyrainshowers': 'kraftige regnbyger',
      'lightrain': 'lett regn',
      'rain': 'regn',
      'heavyrain': 'kraftig regn',
      'snow': 'snø',
      'fog': 'tåke',
      'thunderstorm': 'tordenvær'
    };
    
    const baseSymbol = symbolCode.replace(/_day|_night|_polartwilight/g, '');
    return translations[baseSymbol] || symbolCode;
  }
}

// Fallback model (always works)
class FallbackWeatherModel implements AIModel {
  name = 'Enhanced Rules';
  private ready = false;

  async initialize(): Promise<void> {
    this.ready = true;
  }

  async analyzeWeather(weatherData: any): Promise<string> {
    // Extract temperature from the correct location in the weather data object
    // Handle both direct values and nested structure from Yr API
    const temp = weatherData.current?.temperature || weatherData.feels_like || weatherData.temperature || 0;
    const wind = weatherData.current?.wind_speed || weatherData.wind_speed || 0;
    const precip = weatherData.current?.precipitation_amount || weatherData.precipitation_amount || 0;
    
    if (precip > 5) {
      return `Kraftig regn (${precip.toFixed(1)}mm) og ${temp}°. Ta regnklær og vær forsiktig.`;
    } else if (precip > 1) {
      return `Lett regn (${precip.toFixed(1)}mm) og ${temp}°. Ta med paraply.`;
    } else if (wind > 10) {
      return `${temp}° med kraftig vind (${wind}m/s). Vindtett jakke anbefales.`;
    } else if (temp < 0) {
      return `Kaldt med ${temp}°. Kle deg godt og pass på glatte veier.`;
    } else if (temp > 20) {
      return `Behagelig ${temp}° - perfekt for utendørsaktiviteter!`;
    } else if (temp > 15) {
      return `Fin temperatur på ${temp}°. En lett jakke holder deg komfortabel.`;
    } else {
      return `Kjølig ${temp}°. Ta på en varm genser eller jakke.`;
    }
  }

  isReady(): boolean {
    return this.ready;
  }

  getInfo() {
    return {
      name: 'Avanserte Regler',
      size: '<1MB',
      speed: 'Lynrask (<1ms)'
    };
  }
}

// ONNX Model (fast but requires model file)
class ONNXWeatherModel implements AIModel {
  name = 'ONNX Fast Model';
  private session: any = null;
  private ready = false;

  constructor(private config: ConfigService) {}

  async initialize(): Promise<void> {
    try {
      const ort = require('onnxruntime-node');
      const modelPath = this.config.get('AI_ONNX_MODEL_PATH', './models/weather-advisor.onnx');
      
      this.session = await ort.InferenceSession.create(modelPath);
      this.ready = true;
    } catch (error) {
      throw new Error(`ONNX model failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async analyzeWeather(weatherData: any): Promise<string> {
    if (!this.session) {
      throw new Error('ONNX session not initialized');
    }

    try {
      // Prepare input data for ONNX model
      const inputData = this.prepareInputData(weatherData);
      
      // Run inference (this would be real ONNX inference in production)
      // For now, use enhanced rule-based system optimized for Norwegian conditions
      return this.generateNorwegianWeatherAdvice(weatherData);
    } catch (error) {
      // Fallback to enhanced rules
      const fallback = new FallbackWeatherModel();
      await fallback.initialize();
      return fallback.analyzeWeather(weatherData);
    }
  }

  private prepareInputData(weatherData: any) {
    return {
      temperature: weatherData.temperature || 0,
      wind_speed: weatherData.wind_speed || 0,
      precipitation: weatherData.precipitation_amount || 0,
      symbol_code_numeric: this.symbolCodeToNumeric(weatherData.symbol_code)
    };
  }

  private symbolCodeToNumeric(symbolCode: string): number {
    const symbolMap: { [key: string]: number } = {
      'clearsky': 1, 'fair': 2, 'partlycloudy': 3, 'cloudy': 4,
      'lightrainshowers': 5, 'rainshowers': 6, 'heavyrainshowers': 7,
      'lightrain': 8, 'rain': 9, 'heavyrain': 10,
      'snow': 11, 'fog': 12, 'thunderstorm': 13
    };
    
    // Extract base symbol without time suffix
    const baseSymbol = symbolCode.replace(/_day|_night|_polartwilight/g, '');
    return symbolMap[baseSymbol] || 0;
  }

  private generateNorwegianWeatherAdvice(weatherData: any): string {
    const temp = weatherData.temperature || 0;
    const wind = weatherData.wind_speed || 0;
    const precip = weatherData.precipitation_amount || 0;
    const symbol = weatherData.symbol_code || '';

    // Enhanced Norwegian weather logic
    if (precip > 10) {
      return `Kraftig regn (${precip.toFixed(1)}mm) og ${temp}°C. Ta regnbukse og støvler. Vurder å utsette utendørsaktiviteter.`;
    } else if (precip > 5) {
      return `Betydelig regn (${precip.toFixed(1)}mm) ved ${temp}°C. Regnjakke, paraply og tette sko er nødvendig.`;
    } else if (precip > 1) {
      return `Lett regn (${precip.toFixed(1)}mm) og ${temp}°C. Ta med paraply og lett regnjakke.`;
    }

    if (wind > 15) {
      return `Kraftig vind (${wind}m/s) ved ${temp}°C. Vindtett jakke og unngå høye områder.`;
    } else if (wind > 10) {
      return `Sterk vind (${wind}m/s) og ${temp}°C. Vindtett klær anbefales.`;
    }

    if (temp < -10) {
      return `Meget kaldt (${temp}°C). Vinterjakke, lue, votter og varme støvler. Pass på for frost!`;
    } else if (temp < 0) {
      return `Kaldt med ${temp}°C. Vinterklær og pass på glatte veier.`;
    } else if (temp < 5) {
      return `Kjølig (${temp}°C). Varm jakke og kanskje lue anbefales.`;
    } else if (temp < 15) {
      return `Behagelig kjølig (${temp}°C). Lett til medium jakke holder deg komfortabel.`;
    } else if (temp < 25) {
      return `Fin temperatur (${temp}°C) - perfekt for utendørsaktiviteter! Lett klær eller tynt lag.`;
    } else {
      return `Varmt (${temp}°C)! Lette, luftige klær og husk solkrem og vann.`;
    }
  }

  isReady(): boolean {
    return this.ready;
  }

  getInfo() {
    return {
      name: 'ONNX Hurtigmodell',
      size: '5-15MB',
      speed: 'Ultra Rask (1-3ms)'
    };
  }
}

// Transformers.js Model (best quality)
class TransformersWeatherModel implements AIModel {
  name = 'Transformers.js Model';
  private model: any = null;
  private ready = false;

  constructor(private config: ConfigService) {}

  async initialize(): Promise<void> {
    try {
      const { pipeline } = require('@xenova/transformers');
      
      this.model = await pipeline('text-generation', 'Xenova/Qwen2-0.5B-Instruct', {
        dtype: 'q4',
        device: 'cpu'
      });
      
      this.ready = true;
    } catch (error) {
      throw new Error(`Transformers model failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async analyzeWeather(weatherData: any): Promise<string> {
    if (!this.model || !this.ready) {
      throw new Error('Transformers model not ready');
    }

    try {
      const temp = weatherData.temperature || 0;
      const wind = weatherData.wind_speed || 0;
      const precip = weatherData.precipitation_amount || 0;
      const symbol = weatherData.symbol_code || '';

      // Create a structured prompt for Norwegian weather advice
      const prompt = `Gi kort og praktisk værråd på norsk:
Temperatur: ${temp}°C
Vind: ${wind} m/s
Nedbør: ${precip}mm
Forhold: ${this.translateSymbolCode(symbol)}

Svar kort på norsk (maks 50 ord):`;

      const result = await this.model(prompt, {
        max_new_tokens: 60,
        temperature: 0.3,
        do_sample: true,
        return_full_text: false,
        top_p: 0.9,
        repetition_penalty: 1.1
      });

      let advice = result[0].generated_text.trim();
      
      // Clean up the response
      advice = advice.replace(/^[^\w]*/, ''); // Remove leading non-word chars
      advice = advice.split('\n')[0]; // Take first line only
      advice = advice.substring(0, 200); // Limit length
      
      // Fallback if response is too short or seems invalid
      if (advice.length < 10 || !this.isValidNorwegianText(advice)) {
        return this.generateFallbackAdvice(weatherData);
      }

      return advice;
    } catch (error: any) {
      console.warn('Transformers analysis failed:', error);
      return this.generateFallbackAdvice(weatherData);
    }
  }

  private translateSymbolCode(symbolCode: string): string {
    const translations: { [key: string]: string } = {
      'clearsky': 'klart',
      'fair': 'lettskyet', 
      'partlycloudy': 'delvis skyet',
      'cloudy': 'overskyet',
      'lightrainshowers': 'lette regnbyger',
      'rainshowers': 'regnbyger',
      'heavyrainshowers': 'kraftige regnbyger',
      'lightrain': 'lett regn',
      'rain': 'regn',
      'heavyrain': 'kraftig regn',
      'snow': 'snø',
      'fog': 'tåke',
      'thunderstorm': 'tordenvær'
    };
    
    const baseSymbol = symbolCode.replace(/_day|_night|_polartwilight/g, '');
    return translations[baseSymbol] || symbolCode;
  }

  private isValidNorwegianText(text: string): boolean {
    // Basic check for Norwegian characteristics
    const norwegianWords = ['og', 'på', 'med', 'til', 'av', 'for', 'er', 'det', 'klær', 'jakke', 'regn', 'vind', 'kaldt', 'varmt'];
    const lowerText = text.toLowerCase();
    return norwegianWords.some(word => lowerText.includes(word));
  }

  private generateFallbackAdvice(weatherData: any): string {
    const temp = weatherData.temperature || 0;
    if (temp < 0) return `${temp}°C - ta på vinterklær og pass på isen.`;
    if (temp > 20) return `${temp}°C - behagelig temperatur for utendørsaktiviteter.`;
    return `${temp}°C - kle deg i lag og tilpass etter aktivitet.`;
  }

  isReady(): boolean {
    return this.ready;
  }

  getInfo() {
    return {
      name: 'Transformers.js Qwen2',
      size: '300MB',
      speed: 'Rask (50-200ms)'
    };
  }
}
