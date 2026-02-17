/**
 * Product Entity
 * Represents the core product data structure.
 */
export class Product {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.basePrice = data.basePrice;
        this.options = data.options;
        this.shipping = data.shipping;
    }

    /**
     * Creates a default selection state for this product's options.
     */
    getDefaultOptions() {
        if (!this.options) return {};

        return {
            internalDimensions: this.options.internalDimensions ? this.options.internalDimensions[0] : null,
            papers: this.options.papers ? this.options.papers[0] : null,
            print: this.options.print ? this.options.print[0] : null,
            surfaceFinish: 'none',
            uvLack: 'none',
            colorFoil: 'none',
            fileCheck: 'auto'
        };
    }

    static fromApi(data) {
        return new Product(data);
    }
}
