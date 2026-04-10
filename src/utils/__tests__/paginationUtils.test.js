import { paginate } from '../paginationUtils';

describe('Pagination Math Tests', () => {
  test('calculates correct slices and total pages', () => {
    const list = Array.from({ length: 25 }, (_, i) => i);
    const page1 = paginate(list, 1, 10);
    expect(page1.totalPages).toBe(3);
    expect(page1.data.length).toBe(10);
    expect(page1.data[0]).toBe(0);

    const page3 = paginate(list, 3, 10);
    expect(page3.data.length).toBe(5);
  });
});
