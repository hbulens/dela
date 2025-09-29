interface WebhookData {
  [key: string]: any;
}

interface BlockQueueItem {
  [key: string]: any;
}

class ServerStore {
  private webhookData: WebhookData[] = [];
  private blockQueue: BlockQueueItem[] = [];

  async addWebhookData(data: WebhookData): Promise<void> {
    this.webhookData.push({
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  async addBlockToQueue(data: BlockQueueItem): Promise<void> {
    this.blockQueue.push({
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  getWebhookData(): WebhookData[] {
    return [...this.webhookData];
  }

  getBlockQueue(): BlockQueueItem[] {
    return [...this.blockQueue];
  }

  clearWebhookData(): void {
    this.webhookData = [];
  }

  clearBlockQueue(): void {
    this.blockQueue = [];
  }
}

// Export singleton instance
export const serverStore = new ServerStore();
