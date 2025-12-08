/**
 * Phone Domain Model
 *
 * Represents a mobile phone in the domain layer.
 */

export interface PhoneSpecs {
  brand: string;
  model: string;
  price?: number;
  ram?: number;
  storage?: number;
  battery?: number;
  screenSize?: number;
  camera?: number;
  processor?: string;
  os?: string;
  releaseDate?: string;
  [key: string]: unknown;
}

export interface PhoneImage {
  url: string;
  alt?: string;
  thumbnail?: string;
}

export class Phone {
  constructor(
    public readonly id: string | number,
    public readonly specs: PhoneSpecs,
    public readonly image?: PhoneImage,
    public readonly metadata?: {
      source?: string;
      lastUpdated?: string;
      popularity?: number;
      valueScore?: number;
    }
  ) {}

  /**
   * Get full name (brand + model)
   */
  getFullName(): string {
    return `${this.specs.brand} ${this.specs.model}`.trim();
  }

  /**
   * Get display price
   */
  getDisplayPrice(): string {
    if (!this.specs.price) return 'Price not available';
    return `$${this.specs.price.toLocaleString()}`;
  }

  /**
   * Check if phone has all essential specs
   */
  hasEssentialSpecs(): boolean {
    return !!(
      this.specs.brand &&
      this.specs.model &&
      this.specs.price &&
      this.specs.ram &&
      this.specs.battery
    );
  }

  /**
   * Get value score (0-10)
   */
  getValueScore(): number {
    return this.metadata?.valueScore ?? 0;
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      id: this.id,
      specs: this.specs,
      image: this.image,
      metadata: this.metadata,
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(data: any): Phone {
    return new Phone(data.id, data.specs || data, data.image, data.metadata);
  }
}
