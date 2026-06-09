import { buildCustomCsv } from '../csvBuilder';

describe('Custom CSV Builder', () => {
  test('projects selected columns only', () => {
    const data = [{ id: 1, title: 'Fire alarm', secretNote: 'Ignore' }];
    const cols = [{ key: 'id', label: 'ID' }, { key: 'title', label: 'Title' }];
    const csv = buildCustomCsv(data, cols);
    expect(csv).toContain('ID,Title');
    expect(csv).not.toContain('secretNote');
  });
});
