
class CurrencyService {
  private rates: { [key: string]: number } = {
    BRL: 1,
    USD: 5.50, // Default fallback rates
    EUR: 6.20
  };

  async updateRates() {
    try {
      // Using a free currency API
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/BRL');
      const data = await response.json();
      
      if (data.rates) {
        this.rates = {
          BRL: 1,
          USD: 1 / data.rates.USD,
          EUR: 1 / data.rates.EUR
        };
        console.info('Currency rates updated:', this.rates);
      }
    } catch (error) {
      console.warn('Failed to update currency rates, using fallback values');
    }
  }

  convert(amount: number, fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) return amount;
    
    // Convert to BRL first, then to target currency
    const amountInBRL = fromCurrency === 'BRL' ? amount : amount / this.rates[fromCurrency];
    return toCurrency === 'BRL' ? amountInBRL : amountInBRL * this.rates[toCurrency];
  }

  formatCurrency(amount: number, currency: 'BRL' | 'USD' | 'EUR'): string {
    const locale = currency === 'BRL' ? 'pt-BR' : currency === 'EUR' ? 'de-DE' : 'en-US';
    const currencyCode = currency;
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2
    }).format(amount);
  }

  // Parse currency input (starting from cents)
  parseCurrencyInput(input: string): number {
    const numbersOnly = input.replace(/\D/g, '');
    return numbersOnly ? parseInt(numbersOnly) / 100 : 0;
  }

  // Format input as user types (showing currency format)
  formatCurrencyInput(value: number, currency: 'BRL' | 'USD' | 'EUR'): string {
    return this.formatCurrency(value, currency);
  }
}

export const currencyService = new CurrencyService();
