import { Injectable } from '@angular/core';

export type CardBrand =
  | 'VISA'
  | 'MASTERCARD'
  | 'AMEX'
  | 'DINERS'
  | 'JCB'
  | 'UNIONPAY'
  | 'BANCOLOMBIA'
  | 'UNKNOWN';

interface BrandRule {
  brand: CardBrand;
  pattern: RegExp;
  lengths: number[];
}

@Injectable({
  providedIn: 'root',
})
export class CardDetectionService {
  private rules: BrandRule[] = [
    { brand: 'VISA', pattern: /^4/, lengths: [16] },
    { brand: 'MASTERCARD', pattern: /^5[1-5]/, lengths: [16] },
    { brand: 'AMEX', pattern: /^3[47]/, lengths: [15] },
    { brand: 'DINERS', pattern: /^3(?:0[0-5]|[68])/, lengths: [14] },
    { brand: 'JCB', pattern: /^(?:2131|1800|35)/, lengths: [16] },
    { brand: 'UNIONPAY', pattern: /^62/, lengths: [16, 17, 18, 19] },
    { brand: 'BANCOLOMBIA', pattern: /^(5078|4099|5895)/, lengths: [16, 11] },
  ];

  cleanNumber(raw: string): string {
    return raw.replace(/\D/g, '');
  }

  detectBrand(number: string, accountType: string): CardBrand {
    for (const rule of this.rules) {
      if (rule.pattern.test(number)) {
        return rule.brand;
      }
    }

    if (number.length === 11 && (accountType === 'CHECKING' || accountType === 'SAVINGS')) {
      return 'BANCOLOMBIA';
    }

    return 'UNKNOWN';
  }

  maxLengthForBrand(brand: CardBrand): number {
    const rule = this.rules.find((r) => r.brand === brand);
    if (!rule) return 19;
    return Math.max(...rule.lengths);
  }

  isValid(number: string, brand: CardBrand): boolean {
    if (!number) return false;

    const rule = this.rules.find((r) => r.brand === brand);
    if (brand === 'BANCOLOMBIA' && number.length === 11) {
      return true;
    }

    if (rule && !rule.lengths.includes(number.length)) {
      return false;
    }

    if (number.length < 13) return false;

    return this.luhnCheck(number);
  }

  luhnCheck(num: string): boolean {
    let sum = 0;
    let shouldDouble = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let digit = Number(num.charAt(i));
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  }
}
