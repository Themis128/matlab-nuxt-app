/**
 * Phone Domain Service
 *
 * Contains business logic for phones
 */

import type { Phone } from '../models/phone.model';
import { PhoneSchema } from '../validators/phone.schema';

export class PhoneService {
  /**
   * Validate phone data
   */
  validatePhone(data: unknown): boolean {
    try {
      PhoneSchema.parse(data);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Calculate value score (0-10)
   */
  calculateValueScore(phone: Phone): number {
    if (!phone.specs.price || !phone.specs.ram || !phone.specs.battery) {
      return 0;
    }

    // Simple value calculation based on specs per dollar
    const ramPerDollar = (phone.specs.ram || 0) / phone.specs.price;
    const batteryPerDollar = (phone.specs.battery || 0) / phone.specs.price;

    // Normalize to 0-10 scale (adjust multipliers based on typical values)
    const score = Math.min(10, (ramPerDollar * 1000 + batteryPerDollar * 0.1) / 2);

    return Math.round(score * 10) / 10;
  }

  /**
   * Compare two phones
   */
  comparePhones(
    phone1: Phone,
    phone2: Phone
  ): {
    better: Phone | null;
    differences: Record<string, { phone1: unknown; phone2: unknown }>;
  } {
    const differences: Record<string, { phone1: unknown; phone2: unknown }> = {};

    // Compare key specs
    const specs = ['price', 'ram', 'battery', 'storage', 'screenSize', 'camera'] as const;

    for (const spec of specs) {
      const val1 = phone1.specs[spec];
      const val2 = phone2.specs[spec];

      if (val1 !== val2) {
        differences[spec] = { phone1: val1, phone2: val2 };
      }
    }

    // Determine which is better based on value score
    const score1 = this.calculateValueScore(phone1);
    const score2 = this.calculateValueScore(phone2);

    const better = score1 > score2 ? phone1 : score2 > score1 ? phone2 : null;

    return { better, differences };
  }

  /**
   * Filter phones by criteria
   */
  filterPhones(
    phones: Phone[],
    criteria: {
      minPrice?: number;
      maxPrice?: number;
      minRam?: number;
      brands?: string[];
    }
  ): Phone[] {
    return phones.filter((phone) => {
      if (criteria.minPrice && (phone.specs.price || 0) < criteria.minPrice) {
        return false;
      }
      if (criteria.maxPrice && (phone.specs.price || 0) > criteria.maxPrice) {
        return false;
      }
      if (criteria.minRam && (phone.specs.ram || 0) < criteria.minRam) {
        return false;
      }
      if (criteria.brands && criteria.brands.length > 0) {
        if (!criteria.brands.includes(phone.specs.brand.toLowerCase())) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Sort phones
   */
  sortPhones(
    phones: Phone[],
    sortBy: 'price' | 'ram' | 'battery' | 'value',
    order: 'asc' | 'desc' = 'asc'
  ): Phone[] {
    const sorted = [...phones].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'price':
          comparison = (a.specs.price || 0) - (b.specs.price || 0);
          break;
        case 'ram':
          comparison = (a.specs.ram || 0) - (b.specs.ram || 0);
          break;
        case 'battery':
          comparison = (a.specs.battery || 0) - (b.specs.battery || 0);
          break;
        case 'value':
          comparison = this.calculateValueScore(a) - this.calculateValueScore(b);
          break;
      }

      return order === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }
}
