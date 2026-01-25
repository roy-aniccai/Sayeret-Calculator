/**
 * Retry Utility Functions
 * 
 * Provides robust retry logic for Firebase operations and API calls
 * with exponential backoff and error handling.
 * 
 * Requirements: 10 (System Monitoring and Validation)
 */

/**
 * Retry Configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBase: number;
  retryableErrors: string[];
}

/**
 * Default Retry Configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  exponentialBase: 2,
  retryableErrors: [
    'network',
    'timeout',
    'unavailable',
    'internal',
    'rate-limit',
    'connection'
  ]
};

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any, config: RetryConfig = DEFAULT_RETRY_CONFIG): boolean {
  if (!error) return false;
  
  const errorMessage = (error.message || error.toString()).toLowerCase();
  
  return config.retryableErrors.some(retryableError => 
    errorMessage.includes(retryableError)
  );
}

/**
 * Calculate delay for retry attempt
 */
export function calculateDelay(attempt: number, config: RetryConfig = DEFAULT_RETRY_CONFIG): number {
  const delay = config.baseDelay * Math.pow(config.exponentialBase, attempt - 1);
  return Math.min(delay, config.maxDelay);
}

/**
 * Sleep utility function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry wrapper for async functions
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  operationName: string = 'operation'
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      const result = await operation();
      
      // Log successful retry if it wasn't the first attempt
      if (attempt > 1) {
        console.log(`✅ ${operationName} succeeded on attempt ${attempt}`);
      }
      
      return result;
      
    } catch (error) {
      lastError = error;
      
      // Log the error
      console.warn(`❌ ${operationName} failed on attempt ${attempt}:`, error);
      
      // Check if we should retry
      if (attempt === config.maxAttempts) {
        console.error(`🚫 ${operationName} failed after ${config.maxAttempts} attempts`);
        break;
      }
      
      if (!isRetryableError(error, config)) {
        console.error(`🚫 ${operationName} failed with non-retryable error:`, error);
        break;
      }
      
      // Calculate delay and wait
      const delay = calculateDelay(attempt, config);
      console.log(`⏳ Retrying ${operationName} in ${delay}ms (attempt ${attempt + 1}/${config.maxAttempts})`);
      await sleep(delay);
    }
  }
  
  throw lastError;
}

/**
 * Retry wrapper specifically for Firebase operations
 */
export async function withFirebaseRetry<T>(
  operation: () => Promise<T>,
  operationName: string = 'Firebase operation'
): Promise<T> {
  const firebaseConfig: RetryConfig = {
    ...DEFAULT_RETRY_CONFIG,
    retryableErrors: [
      ...DEFAULT_RETRY_CONFIG.retryableErrors,
      'firestore',
      'firebase',
      'unavailable',
      'deadline-exceeded',
      'resource-exhausted'
    ]
  };
  
  return withRetry(operation, firebaseConfig, operationName);
}

/**
 * Retry wrapper for API calls
 */
export async function withApiRetry<T>(
  operation: () => Promise<T>,
  operationName: string = 'API call'
): Promise<T> {
  const apiConfig: RetryConfig = {
    ...DEFAULT_RETRY_CONFIG,
    retryableErrors: [
      ...DEFAULT_RETRY_CONFIG.retryableErrors,
      '500',
      '502',
      '503',
      '504',
      'fetch'
    ]
  };
  
  return withRetry(operation, apiConfig, operationName);
}

/**
 * Circuit Breaker Pattern Implementation
 */
export class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private failureThreshold: number = 5,
    private recoveryTimeout: number = 60000, // 1 minute
    private operationName: string = 'operation'
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
        console.log(`🔄 Circuit breaker for ${this.operationName} entering HALF_OPEN state`);
      } else {
        throw new Error(`Circuit breaker for ${this.operationName} is OPEN`);
      }
    }
    
    try {
      const result = await operation();
      
      // Success - reset circuit breaker
      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED';
        this.failures = 0;
        console.log(`✅ Circuit breaker for ${this.operationName} reset to CLOSED state`);
      }
      
      return result;
      
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();
      
      if (this.failures >= this.failureThreshold) {
        this.state = 'OPEN';
        console.error(`🚫 Circuit breaker for ${this.operationName} opened after ${this.failures} failures`);
      }
      
      throw error;
    }
  }
  
  getState(): string {
    return this.state;
  }
  
  getFailures(): number {
    return this.failures;
  }
  
  reset(): void {
    this.state = 'CLOSED';
    this.failures = 0;
    this.lastFailureTime = 0;
    console.log(`🔄 Circuit breaker for ${this.operationName} manually reset`);
  }
}

/**
 * Global circuit breakers for common operations
 */
export const firebaseCircuitBreaker = new CircuitBreaker(5, 60000, 'Firebase operations');
export const apiCircuitBreaker = new CircuitBreaker(3, 30000, 'API calls');

/**
 * Enhanced retry with circuit breaker
 */
export async function withRetryAndCircuitBreaker<T>(
  operation: () => Promise<T>,
  circuitBreaker: CircuitBreaker,
  retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG,
  operationName: string = 'operation'
): Promise<T> {
  return circuitBreaker.execute(async () => {
    return withRetry(operation, retryConfig, operationName);
  });
}

/**
 * Batch operation with retry
 */
export async function batchWithRetry<T, R>(
  items: T[],
  operation: (item: T) => Promise<R>,
  batchSize: number = 10,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    const batchPromises = batch.map(item => 
      withRetry(() => operation(item), config, `batch operation ${i + 1}-${i + batch.length}`)
    );
    
    const batchResults = await Promise.allSettled(batchPromises);
    
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error(`Batch item ${i + index + 1} failed:`, result.reason);
      }
    });
  }
  
  return results;
}

/**
 * Timeout wrapper
 */
export async function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
  operationName: string = 'operation'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`${operationName} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  
  return Promise.race([operation, timeoutPromise]);
}

/**
 * Combined retry, circuit breaker, and timeout wrapper
 */
export async function withRobustExecution<T>(
  operation: () => Promise<T>,
  options: {
    retryConfig?: RetryConfig;
    circuitBreaker?: CircuitBreaker;
    timeoutMs?: number;
    operationName?: string;
  } = {}
): Promise<T> {
  const {
    retryConfig = DEFAULT_RETRY_CONFIG,
    circuitBreaker,
    timeoutMs = 30000, // 30 seconds default
    operationName = 'operation'
  } = options;
  
  const executeWithRetry = () => withRetry(operation, retryConfig, operationName);
  
  let promise: Promise<T>;
  
  if (circuitBreaker) {
    promise = circuitBreaker.execute(executeWithRetry);
  } else {
    promise = executeWithRetry();
  }
  
  if (timeoutMs > 0) {
    promise = withTimeout(promise, timeoutMs, operationName);
  }
  
  return promise;
}