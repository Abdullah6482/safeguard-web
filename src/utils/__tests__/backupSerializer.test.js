import { createBackupPayload, validateBackupPayload } from '../backupSerializer';

describe('Backup Serializer', () => {
  test('creates structured backup payload with metadata', () => {
    const backup = createBackupPayload([{ id: 1 }], [{ id: 'c1' }]);
    expect(backup.version).toBe('1.0');
    expect(backup.reportsCount).toBe(1);
    expect(validateBackupPayload(backup)).toBe(true);
  });

  test('rejects malformed backup payloads', () => {
    expect(validateBackupPayload({})).toBe(false);
  });
});
