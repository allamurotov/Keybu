describe('Frontend Unit Tests', () => {
  describe('Matn va Formatlash Funksiyalari', () => {
    it('matnni to\'g\'ri formatlashi va bo\'shliqlarni olib tashlashi kerak', () => {
      const formatTitle = (text: string): string => {
        return text.trim().toUpperCase();
      };

      expect(formatTitle('   keybu platformasi   ')).toBe('KEYBU PLATFORMASI');
    });

    it('valyuta formatlash funksiyasini tekshiradi', () => {
      const formatCurrency = (amount: number): string => {
        return `${amount.toLocaleString()} UZS`;
      };

      expect(formatCurrency(150000)).toBe('150,000 UZS');
    });
  });

  describe('Frontend State boshqaruvi', () => {
    it('state o\'zgarishini to\'g\'ri amalga oshiradi', () => {
      const state = {
        theme: 'dark' as 'light' | 'dark',
        sidebarOpen: false,
      };

      const toggleSidebar = (current: typeof state) => ({
        ...current,
        sidebarOpen: !current.sidebarOpen,
      });

      const updated = toggleSidebar(state);
      expect(updated.sidebarOpen).toBe(true);
      expect(updated.theme).toBe('dark');
    });
  });
});
