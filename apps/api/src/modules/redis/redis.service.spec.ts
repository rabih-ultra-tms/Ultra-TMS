import { RedisService } from './redis.service';

describe('RedisService', () => {
  let service: RedisService;
  let client: {
    ping: jest.Mock;
    keys: jest.Mock;
    del: jest.Mock;
    get: jest.Mock;
    set: jest.Mock;
    setex: jest.Mock;
    exists: jest.Mock;
    incr: jest.Mock;
    expire: jest.Mock;
  };

  beforeEach(() => {
    service = new RedisService({ get: jest.fn() } as any);
    client = {
      ping: jest.fn(),
      keys: jest.fn(),
      del: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
      setex: jest.fn(),
      exists: jest.fn(),
      incr: jest.fn(),
      expire: jest.fn(),
    };
    (service as any).client = client;
  });

  it('pings redis', async () => {
    client.ping.mockResolvedValue('PONG');

    const result = await service.ping();

    expect(result).toBe('PONG');
  });

  it('deletes by pattern using keys', async () => {
    client.keys.mockResolvedValue(['k1', 'k2']);
    client.del.mockResolvedValue(2);

    const result = await service.deleteByPattern('x:*');

    expect(result).toBe(2);
    expect(client.del).toHaveBeenCalledWith('k1', 'k2');
  });

  it('returns 0 when no keys match pattern', async () => {
    client.keys.mockResolvedValue([]);

    const result = await service.deleteByPattern('x:*');

    expect(result).toBe(0);
  });

  it('sets value with ttl', async () => {
    await service.setValue('k1', 'v1', 10);

    expect(client.set).toHaveBeenCalledWith('k1', 'v1', 'EX', 10);
  });

  it('sets value without ttl', async () => {
    await service.setValue('k1', 'v1');

    expect(client.set).toHaveBeenCalledWith('k1', 'v1');
  });

  it('gets JSON and returns null on parse error', async () => {
    client.get.mockResolvedValue('not-json');

    const result = await service.getJson('k1');

    expect(result).toBeNull();
  });

  it('gets JSON and parses successfully', async () => {
    client.get.mockResolvedValue('{"a":1}');

    const result = await service.getJson<{ a: number }>('k1');

    expect(result).toEqual({ a: 1 });
  });

  it('sets JSON', async () => {
    await service.setJson('k1', { a: 1 }, 5);

    expect(client.set).toHaveBeenCalledWith('k1', JSON.stringify({ a: 1 }), 'EX', 5);
  });

  it('sets with TTL helper', async () => {
    await service.setWithTTL('k1', 'v1', 5);

    expect(client.set).toHaveBeenCalledWith('k1', 'v1', 'EX', 5);
  });

  it('stores and reads session data', async () => {
    client.setex.mockResolvedValue('OK');
    client.get.mockResolvedValue('{"refreshTokenHash":"hash"}');

    await service.storeSession('u1', 's1', 'hash', 300);
    const result = await service.getSession('u1', 's1');

    expect(result).toEqual({ refreshTokenHash: 'hash' });
  });

  it('returns null when session missing', async () => {
    client.get.mockResolvedValue(null);

    const result = await service.getSession('u1', 's1');

    expect(result).toBeNull();
  });

  it('revokes a session', async () => {
    await service.revokeSession('u1', 's1');

    expect(client.del).toHaveBeenCalledWith('session:u1:s1');
  });

  it('revokes all sessions for user', async () => {
    client.keys.mockResolvedValue(['session:u1:s1', 'session:u1:s2']);
    client.del.mockResolvedValue(2);

    await service.revokeAllUserSessions('u1');

    expect(client.del).toHaveBeenCalledWith('session:u1:s1', 'session:u1:s2');
  });

  it('no-op when no sessions found', async () => {
    client.keys.mockResolvedValue([]);

    await service.revokeAllUserSessions('u1');

    expect(client.del).not.toHaveBeenCalled();
  });

  it('gets user sessions and counts', async () => {
    client.keys.mockResolvedValue(['session:u1:s1', 'session:u1:s2']);

    const sessions = await service.getUserSessions('u1');
    const count = await service.getUserSessionCount('u1');

    expect(sessions).toEqual(['s1', 's2']);
    expect(count).toBe(2);
  });

  it('checks token blacklist', async () => {
    client.exists.mockResolvedValue(1);

    const result = await service.isTokenBlacklisted('jti-1');

    expect(result).toBe(true);
  });

  it('blacklists token', async () => {
    await service.blacklistToken('jti-1', 60);

    expect(client.setex).toHaveBeenCalledWith('blacklist:jti-1', 60, '1');
  });

  it('consumes password reset token', async () => {
    client.exists.mockResolvedValue(1);
    client.del.mockResolvedValue(1);

    const result = await service.consumePasswordResetToken('u1', 'hash');

    expect(result).toBe(true);
    expect(client.del).toHaveBeenCalledWith('reset:u1:hash');
  });

  it('returns false when password reset token missing', async () => {
    client.exists.mockResolvedValue(0);

    const result = await service.consumePasswordResetToken('u1', 'hash');

    expect(result).toBe(false);
  });

  it('stores password reset token', async () => {
    await service.storePasswordResetToken('u1', 'hash', 60);

    expect(client.setex).toHaveBeenCalledWith('reset:u1:hash', 60, expect.any(String));
  });

  it('increments login attempts and sets expiry on first', async () => {
    client.incr.mockResolvedValue(1);

    const result = await service.incrementLoginAttempts('a@example.com');

    expect(result).toBe(1);
    expect(client.expire).toHaveBeenCalledWith('login_attempts:a@example.com', 900);
  });

  it('increments login attempts without expiring after first', async () => {
    client.incr.mockResolvedValue(2);

    const result = await service.incrementLoginAttempts('a@example.com');

    expect(result).toBe(2);
    expect(client.expire).not.toHaveBeenCalled();
  });

  it('returns login attempts count', async () => {
    client.get.mockResolvedValue('3');

    const result = await service.getLoginAttempts('a@example.com');

    expect(result).toBe(3);
  });

  it('returns 0 when no login attempts', async () => {
    client.get.mockResolvedValue(null);

    const result = await service.getLoginAttempts('a@example.com');

    expect(result).toBe(0);
  });

  it('resets login attempts', async () => {
    await service.resetLoginAttempts('a@example.com');

    expect(client.del).toHaveBeenCalledWith('login_attempts:a@example.com');
  });

  it('locks account and checks lock state', async () => {
    client.setex.mockResolvedValue('OK');
    client.exists.mockResolvedValue(1);

    await service.lockAccount('a@example.com', 60);
    const locked = await service.isAccountLocked('a@example.com');

    expect(locked).toBe(true);
  });

  it('stores email verification token', async () => {
    await service.storeEmailVerificationToken('u1', 'hash', 60);

    expect(client.setex).toHaveBeenCalledWith('email_verify:u1:hash', 60, expect.any(String));
  });

  it('consumes email verification token', async () => {
    client.exists.mockResolvedValue(1);
    client.del.mockResolvedValue(1);

    const result = await service.consumeEmailVerificationToken('u1', 'hash');

    expect(result).toBe(true);
    expect(client.del).toHaveBeenCalledWith('email_verify:u1:hash');
  });

  it('returns false when email verification token missing', async () => {
    client.exists.mockResolvedValue(0);

    const result = await service.consumeEmailVerificationToken('u1', 'hash');

    expect(result).toBe(false);
  });

  it('deletes keys helper', async () => {
    await service.deleteKeys(['k1', 'k2']);

    expect(client.del).toHaveBeenCalledWith('k1', 'k2');
  });

  it('no-op on deleteKeys when empty', async () => {
    await service.deleteKeys([]);

    expect(client.del).not.toHaveBeenCalled();
  });
});