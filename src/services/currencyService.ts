
import { CurrencyRates } from '../types/project';

class CurrencyService {
  private rates: CurrencyRates = { BRL: 1, USD: 5.5, EUR: 6.2 };
  private lastUpdate: Date = new Date();

  async updateRates(): Promise<void> {
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/BRL');
      const data = await response.json();
      
      this.rates = {
        BRL: 1,
        USD: 1 / data.rates.USD,
        EUR: 1 / data.rates.EUR
      };
      this.lastUpdate = new Date();
      console.log('Currency rates updated:', this.rates);
    } catch (error) {
      console.warn('Failed to update currency rates, using cached rates');
    }
  }

  getRates(): CurrencyRates {
    return this.rates;
  }

  convert(amount: number, fromCurrency: keyof CurrencyRates, toCurrency: keyof CurrencyRates): number {
    if (fromCurrency === toCurrency) return amount;
    
    const amountInBRL = amount / this.rates[fromCurrency];
    return amountInBRL * this.rates[toCurrency];
  }

  formatCurrency(amount: number, currency: keyof CurrencyRates): string {
    const symbols = { BRL: 'R$', USD: '$', EUR: '€' };
    return `${symbols[currency]} ${amount.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }

  getLastUpdate(): Date {
    return this.lastUpdate;
  }
}

export const currencyService = new CurrencyService();
