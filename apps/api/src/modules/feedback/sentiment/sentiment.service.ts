import { Injectable } from '@nestjs/common';

@Injectable()
export class SentimentService {
  private readonly positiveWords = ['great', 'excellent', 'love', 'amazing', 'helpful', 'awesome', 'good'];
  private readonly negativeWords = ['bad', 'terrible', 'hate', 'awful', 'frustrating', 'poor', 'slow'];

  analyze(text: string): 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' {
    if (!text) return 'NEUTRAL';
    const words = text.toLowerCase().split(/\s+/);

    let positiveCount = 0;
    let negativeCount = 0;

    for (const word of words) {
      if (this.positiveWords.includes(word)) positiveCount++;
      if (this.negativeWords.includes(word)) negativeCount++;
    }

    if (positiveCount > negativeCount) return 'POSITIVE';
    if (negativeCount > positiveCount) return 'NEGATIVE';
    return 'NEUTRAL';
  }
}
