import type {
  CustomAtRules,
  CustomAtRuleDefinition,
  Visitor,
} from 'lightningcss';

type MixinCustomAtRules = {
  mixin: CustomAtRuleDefinition;
  apply: CustomAtRuleDefinition;
};

// Based on the SCSS mixin pattern:
// https://lightningcss.dev/transforms.html#custom-at-rules
export const mixinVisitorMap = new Map();

export const mixinAtRules: CustomAtRules = {
  mixin: {
    prelude: '<custom-ident>',
    body: 'style-block',
  },
  apply: {
    prelude: '<custom-ident>',
  },
};

export const mixinVisitor: Visitor<MixinCustomAtRules> = {
  Rule: {
    custom: {
      mixin(rule) {
        mixinVisitorMap.set(rule.prelude.value, rule.body.value);
        return [];
      },
      apply(rule) {
        return mixinVisitorMap.get(rule.prelude.value);
      },
    },
  },
};

// Based on a deprecated `--mixin {}` spec:
// https://github.com/parcel-bundler/lightningcss/blob/master/node/test/visitor.test.mjs#L292
export const applyVisitorMap = new Map();

export const applyVisitor: Visitor<CustomAtRules> = {
  Rule: {
    style(rule) {
      for (const selector of rule.value.selectors) {
        if (
          selector.length === 1 &&
          selector[0].type === 'type' &&
          selector[0].name.startsWith('--')
        ) {
          applyVisitorMap.set(selector[0].name, rule.value.declarations);
          return {type: 'ignored', value: null};
        }
      }

      rule.value.rules = rule.value.rules.filter((child) => {
        if (child.type === 'unknown' && child.value.name === 'apply') {
          for (const token of child.value.prelude) {
            if (
              token.type === 'dashed-ident' &&
              applyVisitorMap.has(token.value)
            ) {
              const value = applyVisitorMap.get(token.value);
              const declarations = rule.value.declarations;

              declarations.declarations.push(...value.declarations);
              declarations.importantDeclarations.push(
                ...value.importantDeclarations,
              );
            }
          }

          return false;
        }

        return true;
      });

      return rule;
    },
  },
};
