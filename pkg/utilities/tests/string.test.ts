import {describe, it, expect} from 'vitest';

import {
  capitalize,
  // escapeStringRegexp,
  kebabToPascal,
  splitRetain,
} from '../string';

describe('string utilities', () => {
  describe('capitalize()', () => {
    it('capitalizes only the first letter', async () => {
      const result = capitalize('hello world');
      expect(result).toBe('Hello world');
    });
  });

  describe('escapeStringRegexp()', () => {
    // TODO: Determine the best way to get around these escape characters.
    // const result = escapeStringRegexp('start | \ { } ( ) [ ] ^ $ + * ? . - end');
    // expect(result).toBe('start \| \\ \{ \} \( \) \[ \] \^ \$ \+ \* \? \. \- end');
    it.todo(
      'returns a string with an escape character in front of each special character',
    );
  });

  describe('kebabToPascal()', () => {
    it('converts the provided slug', async () => {
      const result = kebabToPascal('hello-world-foo-bar');
      expect(result).toBe('HelloWorldFooBar');
    });
  });

  describe('splitRetain()', () => {
    it('splits the string by match', async () => {
      const result = splitRetain('Hello world foo bar Earwurm', 'world');
      expect(result).toStrictEqual(['Hello ', 'world', ' foo bar Earwurm']);
    });
  });
});
