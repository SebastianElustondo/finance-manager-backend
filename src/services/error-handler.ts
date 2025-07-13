export enum PolygonErrorType {
  RATE_LIMIT = 'rate_limit',
  API_KEY_INVALID = 'api_key_invalid',
  NETWORK_ERROR = 'network_error',
  NO_DATA = 'no_data',
  UNKNOWN = 'unknown'
}

export interface PolygonError {
  type: PolygonErrorType;
  message: string;
  originalError: Error | any;
  statusCode?: number;
  retryAfter?: number;
}

export class PolygonErrorHandler {
  static parseError(error: any): PolygonError {
    const errorMessage = error.message || error.toString();
    
    // Check for rate limiting errors
    if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
      const retryAfter = this.parseRetryAfter(error);
      const result: PolygonError = {
        type: PolygonErrorType.RATE_LIMIT,
        message: 'API rate limit exceeded',
        originalError: error,
        statusCode: 429
      };
      if (retryAfter !== undefined) {
        result.retryAfter = retryAfter;
      }
      return result;
    }
    
    // Check for authentication errors
    if (errorMessage.includes('401') || errorMessage.includes('unauthorized') || errorMessage.includes('api key')) {
      return {
        type: PolygonErrorType.API_KEY_INVALID,
        message: 'Invalid or missing API key',
        originalError: error,
        statusCode: 401
      };
    }
    
    // Check for network errors
    if (errorMessage.includes('ECONNRESET') || 
        errorMessage.includes('ENOTFOUND') || 
        errorMessage.includes('timeout') ||
        errorMessage.includes('network')) {
      return {
        type: PolygonErrorType.NETWORK_ERROR,
        message: 'Network connection error',
        originalError: error
      };
    }
    
    // Check for no data errors
    if (errorMessage.includes('no data') || 
        errorMessage.includes('not found') ||
        errorMessage.includes('404')) {
      return {
        type: PolygonErrorType.NO_DATA,
        message: 'No data available for the requested symbol',
        originalError: error,
        statusCode: 404
      };
    }
    
    // Default to unknown error
    return {
      type: PolygonErrorType.UNKNOWN,
      message: errorMessage,
      originalError: error
    };
  }
  
  static shouldRetry(error: PolygonError): boolean {
    switch (error.type) {
      case PolygonErrorType.RATE_LIMIT:
      case PolygonErrorType.NETWORK_ERROR:
        return true;
      case PolygonErrorType.API_KEY_INVALID:
      case PolygonErrorType.NO_DATA:
        return false;
      case PolygonErrorType.UNKNOWN:
        return error.statusCode ? error.statusCode >= 500 : true;
      default:
        return false;
    }
  }
  
  static getRetryDelay(error: PolygonError, attempt: number): number {
    switch (error.type) {
      case PolygonErrorType.RATE_LIMIT:
        return error.retryAfter || Math.min(1000 * Math.pow(2, attempt), 30000); // Exponential backoff, max 30s
      case PolygonErrorType.NETWORK_ERROR:
        return Math.min(1000 * attempt, 10000); // Linear backoff, max 10s
      default:
        return Math.min(1000 * Math.pow(2, attempt), 15000); // Exponential backoff, max 15s
    }
  }
  
  private static parseRetryAfter(error: any): number | undefined {
    // Try to extract retry-after header from response
    if (error.response?.headers?.['retry-after']) {
      const retryAfter = parseInt(error.response.headers['retry-after']);
      if (!isNaN(retryAfter)) {
        return retryAfter * 1000; // Convert to milliseconds
      }
    }
    return undefined;
  }
}

export class RetryableOperation {
  private maxRetries: number;
  private operation: () => Promise<any>;
  
  constructor(operation: () => Promise<any>, maxRetries: number = 3) {
    this.operation = operation;
    this.maxRetries = maxRetries;
  }
  
  async execute(): Promise<any> {
    let lastError: PolygonError;
    
    for (let attempt = 1; attempt <= this.maxRetries + 1; attempt++) {
      try {
        return await this.operation();
      } catch (error) {
        lastError = PolygonErrorHandler.parseError(error);
        
        console.warn(`API call attempt ${attempt} failed:`, lastError.message);
        
        // Don't retry on the last attempt or if error shouldn't be retried
        if (attempt > this.maxRetries || !PolygonErrorHandler.shouldRetry(lastError)) {
          throw lastError;
        }
        
        // Wait before retrying
        const delay = PolygonErrorHandler.getRetryDelay(lastError, attempt);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }
} 