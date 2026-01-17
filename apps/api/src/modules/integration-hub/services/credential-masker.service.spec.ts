import { CredentialMaskerService } from './credential-masker.service';

describe('CredentialMaskerService', () => {
  const service = new CredentialMaskerService();

  it('masks sensitive keys', () => {
    const result = service.maskObject({ apiKey: 'secretvalue', nested: { password: 'pass12345' } });

    expect(result.apiKey).toContain('••••');
    expect((result as any).nested.password).toContain('••••');
  });

  it('passes through non-sensitive keys', () => {
    const result = service.maskObject({ name: 'ACME' });

    expect(result.name).toBe('ACME');
  });

  it('masks secret', () => {
    expect(service.maskSecret('abc')).toBe('••••••••');
  });
});
