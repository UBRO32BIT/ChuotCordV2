export class ReconnectManager {
    private attempts: number = 0;
    private maxAttempts: number = 5;
    private baseDelay: number = 1000;
    private maxDelay: number = 30000;
    private timeoutId: NodeJS.Timeout | null = null;

    public reset() {
        this.attempts = 0;
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    public getDelay(): number {
        const delay = Math.min(
            this.maxDelay,
            this.baseDelay * Math.pow(2, this.attempts)
        );
        this.attempts = Math.min(this.attempts + 1, this.maxAttempts);
        return delay;
    }

    public canRetry(): boolean {
        return this.attempts < this.maxAttempts;
    }

    public getAttempts(): number {
        return this.attempts;
    }
}