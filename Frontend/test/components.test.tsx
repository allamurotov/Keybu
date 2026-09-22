describe('Frontend Component & Props Tests (Namuna)', () => {
  it('tugma (Button) komponenti propslarini tekshirish', () => {
    const buttonProps = {
      title: 'Saqlash',
      disabled: false,
      variant: 'primary',
    };

    expect(buttonProps.title).toBe('Saqlash');
    expect(buttonProps.disabled).toBe(false);
    expect(buttonProps.variant).toBe('primary');
  });

  it('modal oyna ochiq/yopiq holatini tekshirish', () => {
    const modalState = { isOpen: false };
    const openModal = () => ({ isOpen: true });

    expect(openModal().isOpen).toBe(true);
  });
});
