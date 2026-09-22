describe('Frontend Sample Unit Test', () => {
  it('should validate string formatting utility', () => {
    const formatName = (name: string) => name.trim().toUpperCase();
    expect(formatName('  keybu  ')).toBe('KEYBU');
  });
});
