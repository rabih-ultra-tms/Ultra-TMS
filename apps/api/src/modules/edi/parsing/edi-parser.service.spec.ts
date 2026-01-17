import { EdiParserService } from './edi-parser.service';

describe('EdiParserService', () => {
  const service = new EdiParserService();

  it('parses JSON payloads', () => {
    const result = service.parse('{"foo": "bar"}');

    expect(result.foo).toBe('bar');
  });

  it('parses key=value payloads', () => {
    const result = service.parse('key=value\nother=two');

    expect(result.key).toBe('value');
    expect(result.other).toBe('two');
  });

  it('throws on unsupported payloads', () => {
    expect(() => service.parse('INVALID')).toThrow('Failed to parse EDI payload');
  });
});
