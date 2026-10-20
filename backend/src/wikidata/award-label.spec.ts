import { deriveAwardCategory, deriveAwardName } from './award-label';

describe('award label helpers', () => {
  it('splits the award name and the category', () => {
    expect(
      deriveAwardName('Academy Award for Best Actress in a Supporting Role'),
    ).toBe('Academy Award');
    expect(
      deriveAwardCategory(
        'Academy Award for Best Actress in a Supporting Role',
      ),
    ).toBe('Best Actress in a Supporting Role');
  });

  it('returns the whole label when it has no category', () => {
    expect(deriveAwardName('Kennedy Center Honors')).toBe(
      'Kennedy Center Honors',
    );
    expect(deriveAwardCategory('Kennedy Center Honors')).toBeNull();
  });

  it('keeps the first separator only', () => {
    expect(deriveAwardName('Award for Something for Another')).toBe('Award');
    expect(deriveAwardCategory('Award for Something for Another')).toBe(
      'Something for Another',
    );
  });
});
