import { DocuSignService } from './docusign.service';

describe('DocuSignService', () => {
  let service: DocuSignService;

  beforeEach(() => {
    service = new DocuSignService();
  });

  it('returns envelope info', async () => {
    const result = await service.sendEnvelope('c1', 'Subject', ['a@example.com']);

    expect(result.envelopeId).toContain('env-c1-');
    expect(result.status).toBe('sent');
    expect(result.sentAt).toBeInstanceOf(Date);
  });
});
