import * as fc from 'fast-check';

describe('Setup Verification', () => {
    it('should run basic Jest test', () => {
        expect(true).toBe(true);
    });

    it('should run fast-check property test', () => {
        fc.assert(
            fc.property(fc.integer(), (n) => {
                return n === n;
            }),
            { numRuns: 100 }
        );
    });
});
