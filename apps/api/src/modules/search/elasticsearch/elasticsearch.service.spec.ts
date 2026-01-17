jest.mock('@elastic/elasticsearch', () => {
  const mockClient = {
    search: jest.fn(),
    index: jest.fn(),
    delete: jest.fn(),
    reindex: jest.fn(),
    cluster: { health: jest.fn() },
    indices: { exists: jest.fn(), create: jest.fn() },
  };
  return { Client: jest.fn(() => mockClient) };
});

import { ElasticsearchService } from './elasticsearch.service';

const getClient = () => {
  const mock = (jest.requireMock('@elastic/elasticsearch') as any).Client;
  return mock.mock.results[mock.mock.results.length - 1].value;
};

describe('ElasticsearchService', () => {
  it('searches globally', async () => {
    const service = new ElasticsearchService();
    const client = getClient();
    client.search.mockResolvedValue({
      hits: { total: { value: 1 }, hits: [{ _id: '1', _index: 'ultra-orders-v1', _score: 1, _source: { title: 'A' } }] },
    });

    const result = await service.searchGlobal('a');

    expect(result.total).toBe(1);
    expect(result.items[0]?.entityType).toBe('orders');
  });

  it('searches entity', async () => {
    const service = new ElasticsearchService();
    const client = getClient();
    client.search.mockResolvedValue({
      hits: { total: 2, hits: [{ _id: '1', _score: 1, _source: { name: 'A' } }] },
    });

    const result = await service.searchEntity('companies', 'a', { status: 'ACTIVE' });

    expect(result.total).toBe(2);
  });

  it('returns suggestions', async () => {
    const service = new ElasticsearchService();
    const client = getClient();
    client.search.mockResolvedValue({ suggest: { name_suggest: [{ options: [{ text: 'Alpha' }] }] } });

    const result = await service.suggest('a');

    expect(result.suggestions).toEqual(['Alpha']);
  });

  it('indexes and deletes document', async () => {
    const service = new ElasticsearchService();
    const client = getClient();
    client.index.mockResolvedValue({});
    client.delete.mockResolvedValue({});

    const indexed = await service.indexDocument('orders', '1', { name: 'A' });
    const deleted = await service.deleteDocument('orders', '1');

    expect(indexed.success).toBe(true);
    expect(deleted.success).toBe(true);
  });

  it('ensures index', async () => {
    const service = new ElasticsearchService();
    const client = getClient();
    client.indices.exists.mockResolvedValue(false);
    client.indices.create.mockResolvedValue({});

    const result = await service.ensureIndex('orders');

    expect(result.created).toBe(true);
  });
});
