/**
 * Rune API Client for communicating with the Rune VCS backend
 */
export class RuneApiClient {
    private baseUrl = 'http://127.0.0.1:7420';

    async testConnection(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/v1/status`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async getStatus(): Promise<any> {
        return this.apiCall('/v1/status');
    }

    async getChanges(): Promise<any> {
        return this.apiCall('/v1/changes');
    }

    async getBranches(): Promise<any[]> {
        const result = await this.apiCall('/v1/branches');
        return Array.isArray(result) ? result : [];
    }

    async getHistory(): Promise<any[]> {
        const result = await this.apiCall('/v1/log');
        return Array.isArray(result) ? result : [];
    }

    async commit(message: string): Promise<boolean> {
        return this.apiPost('/v1/commit', { message });
    }

    async stageFile(path: string): Promise<boolean> {
        return this.apiPost('/v1/stage', { files: [path] });
    }

    async unstageFile(path: string): Promise<boolean> {
        return this.apiPost('/v1/unstage', { files: [path] });
    }

    async stageAll(): Promise<boolean> {
        return this.apiPost('/v1/stage-all', {});
    }

    async unstageAll(): Promise<boolean> {
        return this.apiPost('/v1/unstage-all', {});
    }

    async discardFile(path: string): Promise<boolean> {
        return this.apiPost('/v1/discard', { files: [path] });
    }

    async push(): Promise<boolean> {
        return this.apiPost('/v1/push', {});
    }

    async pull(): Promise<boolean> {
        return this.apiPost('/v1/pull', {});
    }

    private async apiCall(endpoint: string): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`);
            return response.ok ? await response.json() : null;
        } catch (error) {
            console.log(`API call failed: ${endpoint}`, error);
            return null;
        }
    }

    private async apiPost(endpoint: string, data: any): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return response.ok;
        } catch (error) {
            console.log(`API post failed: ${endpoint}`, error);
            return false;
        }
    }
}
