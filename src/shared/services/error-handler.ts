// Generic error types for API integrations
export enum ApiErrorType {
  RATE_LIMIT = 'rate_limit',
  NETWORK_ERROR = 'network_error',
  API_KEY_INVALID = 'api_key_invalid',
  UNKNOWN = 'unknown',
}

export interface ApiError {
  type: ApiErrorType;
  message: string;
  statusCode?: number;
  retryAfter?: number;
}

// Generic error handler for API integrations
export class ApiErrorHandler {
  static parseError(error: unknown): ApiError {
    // Type guard for axios-like errors
    const isAxiosError = (err: unknown): err is { response?: { status: number; headers: Record<string, string> } } => {
      return typeof err === 'object' && err !== null && 'response' in err;
    };

    // Type guard for network errors
    const isNetworkError = (err: unknown): err is { code: string } => {
      return typeof err === 'object' && err !== null && 'code' in err;
    };

    // Type guard for errors with message
    const hasMessage = (err: unknown): err is { message: string } => {
      return typeof err === 'object' && err !== null && 'message' in err;
    };

    // Handle rate limit errors
    if (isAxiosError(error) && error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      const result: ApiError = {
        type: ApiErrorType.RATE_LIMIT,
        message: 'Rate limit exceeded',
        statusCode: 429,
      };
      if (retryAfter) {
        result.retryAfter = parseInt(retryAfter);
      }
      return result;
    }

    // Handle authentication errors
    if (isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
      return {
        type: ApiErrorType.API_KEY_INVALID,
        message: 'Invalid API key or insufficient permissions',
        statusCode: error.response.status,
      };
    }

    // Handle network errors
    if (isNetworkError(error) && (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT')) {
      return {
        type: ApiErrorType.NETWORK_ERROR,
        message: 'Network connection failed',
      };
    }

    // Handle unknown errors
    const result: ApiError = {
      type: ApiErrorType.UNKNOWN,
      message: hasMessage(error) ? error.message : 'An unknown error occurred',
    };
    
    if (isAxiosError(error) && error.response?.status) {
      result.statusCode = error.response.status;
    }
    
    return result;
  }

  static shouldRetry(error: ApiError): boolean {
    return error.type === ApiErrorType.RATE_LIMIT ||
           error.type === ApiErrorType.NETWORK_ERROR;
  }

  static getRetryDelay(error: ApiError, attempt: number): number {
    if (error.type === ApiErrorType.RATE_LIMIT && error.retryAfter) {
      return error.retryAfter * 1000; // Convert to milliseconds
    }
    
    // Exponential backoff for other retryable errors
    return Math.min(1000 * Math.pow(2, attempt), 30000);
  }
}

// Generic retry logic for API calls
export class RetryHelper {
  private maxRetries = 3;

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: string = 'API call'
  ): Promise<T> {
    let lastError: ApiError | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = ApiErrorHandler.parseError(error);
        
        if (attempt === this.maxRetries || !ApiErrorHandler.shouldRetry(lastError)) {
          throw lastError;
        }

        const delay = ApiErrorHandler.getRetryDelay(lastError, attempt);
        console.log(`${context} failed (attempt ${attempt}/${this.maxRetries}), retrying in ${delay}ms...`);
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 