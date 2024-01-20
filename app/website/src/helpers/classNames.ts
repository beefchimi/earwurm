interface Variants {
  [key: string]: string | number | boolean | null | undefined;
}

type ClassNameArgs = (Variants | string | undefined)[];

function convertVariantsToNames(variants?: Variants) {
  return variants
    ? Object.keys(variants).filter((key) => Boolean(variants[key]))
    : [];
}

export function classNames(baseName: string, ...args: ClassNameArgs) {
  const additionalNames = args.length
    ? args.flatMap((addition) =>
        typeof addition === 'string'
          ? addition
          : convertVariantsToNames(addition),
      )
    : [];

  return [baseName, ...additionalNames.filter(Boolean)].join(' ');
}

export function variationName(
  prefix: string,
  variant?: string,
  styles?: CSSModuleClasses,
) {
  if (!variant) return '';

  const firstLetter = variant.charAt(0).toUpperCase();
  const className = `${prefix.toLowerCase()}${firstLetter}${variant.slice(1)}`;

  return styles ? styles[className] : className;
}
