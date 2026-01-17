import { SentimentService } from './sentiment.service';

describe('SentimentService', () => {
  let service: SentimentService;

  beforeEach(() => {
    service = new SentimentService();
  });

  it('returns neutral for empty text', () => {
    expect(service.analyze('')).toBe('NEUTRAL');
  });

  it('detects positive sentiment', () => {
    expect(service.analyze('Great awesome helpful')).toBe('POSITIVE');
  });

  it('detects negative sentiment', () => {
    expect(service.analyze('bad awful poor')).toBe('NEGATIVE');
  });

  it('returns neutral for tie', () => {
    expect(service.analyze('good bad')).toBe('NEUTRAL');
  });
});
