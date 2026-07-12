describe('Theme Toggle Logic', () => {
  test('toggles between light and dark cleanly', () => {
    let current = 'light';
    const toggle = () => (current = current === 'light' ? 'dark' : 'light');
    toggle();
    expect(current).toBe('dark');
    toggle();
    expect(current).toBe('light');
  });
});
