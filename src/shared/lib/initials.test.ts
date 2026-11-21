import { describe, expect, it } from 'vitest';
import { toInitials } from './initials';

describe('toInitials', () => {
  it('takes the first and last word, skipping Dutch prefixes', () => {
    expect(toInitials('Eline van den Test')).toBe('ET');
  });

  it('takes one letter for a single name', () => {
    expect(toInitials('zoë')).toBe('Z');
  });

  it('is undefined without a name', () => {
    expect(toInitials('  ')).toBeUndefined();
    expect(toInitials(undefined)).toBeUndefined();
  });
});
