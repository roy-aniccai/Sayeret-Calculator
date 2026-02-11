/**
 * Simplified retry utilities for API calls
 * Provides circuit breaker pattern and retry logic
 */

// Simple circuit breaker states
type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

class CircuitBreaker {
    private state: CircuitState = 'CLOSED';
    private failures = 0;
    private readonly maxFailures: number;
    private readonly resetTimeMs: number;
    private lastFailureTime = 0;

    constructor(maxFailures = 5, resetTimeMs = 30000) {
        this.maxFailures = maxFailures;
        this.resetTimeMs = resetTimeMs;
    }

    async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime > this.resetTimeMs) {
                this.state = 'HALF_OPEN';
            } else {
                throw new Error('Circuit breaker is open');
            }
        }

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    private onSuccess() {
        this.failures = 0;
        this.state = 'CLOSED';
    }

    private onFailure() {
        this.failures++;
        this.lastFailureTime = Date.now();
        if (this.failures >= this.maxFailures) {
            this.state = 'OPEN';
        }
    }

    getState(): CircuitState {
        return this.state;
    }

    getFailures(): number {
        return this.failures;
    }
}

// Shared instances
export const apiCircuitBreaker = new CircuitBreaker(5, 30000);
export const firebaseCircuitBreaker = new CircuitBreaker(3, 60000);

/**
 * Retry a function with exponential backoff
 */
async function retry<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    baseDelayMs = 500
): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (attempt < maxRetries) {
                const delay = baseDelayMs * Math.pow(2, attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
}

/**
 * Execute with retry and circuit breaker
 */
export async function withRobustExecution<T>(
    fn: () => Promise<T>,
    options: {
        circuitBreaker: CircuitBreaker;
        timeoutMs?: number;
        operationName?: string;
    }
): Promise<T> {
    const { circuitBreaker, timeoutMs = 10000, operationName = 'unknown' } = options;

    return circuitBreaker.execute(async () => {
        return retry(async () => {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), timeoutMs);

            try {
                return await fn();
            } finally {
                clearTimeout(timeout);
            }
        });
    });
}

/**
 * Retry wrapper for API calls
 */
export async function withApiRetry<T>(fn: () => Promise<T>): Promise<T> {
    return withRobustExecution(fn, {
        circuitBreaker: apiCircuitBreaker,
        operationName: 'api_call'
    });
}

/**
 * Retry wrapper for Firebase operations
 */
export async function withFirebaseRetry<T>(fn: () => Promise<T>): Promise<T> {
    return withRobustExecution(fn, {
        circuitBreaker: firebaseCircuitBreaker,
        operationName: 'firebase_call'
    });
}
