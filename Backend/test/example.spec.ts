describe('Backend Sample Unit Test', () => {
  it('should verify basic math operation', () => {
    const sum = (a: number, b: number) => a + b;
    expect(sum(2, 3)).toBe(5);
  });

  it('should verify sample backend logic', () => {
    const isServiceRunning = true;
    expect(isServiceRunning).toBeTruthy();
  });
});
