import type { ReactNode } from 'react';

type TagName = 'b' | 'i' | 'ul' | 'li' | 'a';

type StackFrame = {
  tag: TagName;
  children: ReactNode[];
  attrs?: Record<string, string>;
};

export type AnchorAttrs = {
  href?: string;
  target?: string;
  rel?: string;
};

export type Renderers = {
  b?: (children: ReactNode[], key: string) => ReactNode;
  i?: (children: ReactNode[], key: string) => ReactNode;
  ul?: (children: ReactNode[], key: string) => ReactNode;
  li?: (children: ReactNode[], key: string) => ReactNode;
  a?: (attrs: AnchorAttrs, children: ReactNode[], key: string) => ReactNode;
  text?: (text: string) => ReactNode;
};

const DEFAULT_RENDERERS: Required<Renderers> = {
  b: (children, key) => <strong key={key}>{children}</strong>,
  i: (children, key) => <em key={key}>{children}</em>,
  ul: (children, key) => <ul key={key}>{children}</ul>,
  li: (children, key) => <li key={key}>{children}</li>,
  a: (attrs, children, key) => (
    <a key={key} href={attrs.href} target={attrs.target} rel={attrs.rel}>
      {children}
    </a>
  ),
  text: (text) => text,
};

/**
 * Parses a string of HTML attributes into a key-value object.
 * Supports double-quoted, single-quoted, and unquoted values.
 * @param input The attribute string to parse.
 * @returns An object containing the parsed attribute key-value pairs.
 * @internal
 */
function parseAttrString(input: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrRe =
    /\s+([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let m: RegExpExecArray | null;
  while ((m = attrRe.exec(input))) {
    const name = m[1].toLowerCase();
    const value = (m[2] ?? m[3] ?? m[4] ?? '').trim();
    attrs[name] = value;
  }
  return attrs;
}

/**
 * Parses a string with simple inline HTML markup into an array of React nodes.
 * Supports a limited set of tags: `<b>`, `<i>`, `<ul>`, `<li>`, `<a>`, and `<br>`.
 * This is not a full HTML parser; it is designed to be lightweight and forgiving
 * for simple, controlled content.
 * @param input The string containing the markup to parse.
 * @param keyPrefix A prefix to use for generating unique React keys.
 * @param renderers An optional object to provide custom rendering functions for tags.
 * @returns An array of React nodes representing the parsed content.
 */
export function parseInlineMarkup(
  input: string,
  keyPrefix = 'inline',
  renderers: Renderers = {}
): ReactNode[] {
  const nodes: ReactNode[] = [];
  const stack: StackFrame[] = [];
  const R = { ...DEFAULT_RENDERERS, ...renderers };
  const tagRe = /<\s*(\/)?\s*(b|i|ul|li|a|br)\b([^>]*)\s*(\/)?\s*>/gi;

  let lastIndex = 0;
  let key = 0;

  const currentTarget = () =>
    stack.length ? stack[stack.length - 1].children : nodes;

  const pushText = (text: string) => {
    if (!text) return;
    currentTarget().push(R.text(text));
  };

  const renderFrame = (frame: StackFrame, k: string): ReactNode => {
    switch (frame.tag) {
      case 'b':
        return R.b(frame.children, k);
      case 'i':
        return R.i(frame.children, k);
      case 'ul':
        return R.ul(frame.children, k);
      case 'li':
        return R.li(frame.children, k);
      case 'a': {
        const { href, target, rel } = (frame.attrs ?? {}) as AnchorAttrs;
        return R.a({ href, target, rel }, frame.children, k);
      }
      default:
        return frame.children as unknown as ReactNode;
    }
  };

  const attach = (node: ReactNode) => {
    currentTarget().push(node);
  };

  for (let match = tagRe.exec(input); match; match = tagRe.exec(input)) {
    const [full, slashOpen, rawTag, rawAttrs, selfClose] = match;
    const tag = rawTag.toLowerCase() as 'b' | 'i' | 'ul' | 'li' | 'a' | 'br';
    const isClosing = !!slashOpen;
    const isSelfClosing = tag === 'br' || !!selfClose;

    if (match.index > lastIndex) {
      pushText(input.slice(lastIndex, match.index));
    }
    lastIndex = match.index + full.length;

    if (!isClosing && isSelfClosing) {
      const k = `${keyPrefix}-br-${key++}`;
      attach(<br key={k} />);
      continue;
    }

    if (!isClosing) {
      const attrs = tag === 'a' ? parseAttrString(rawAttrs || '') : undefined;
      stack.push({ tag: tag as TagName, children: [], attrs });
      continue;
    }

    let foundIdx = -1;
    for (let i = stack.length - 1; i >= 0; i--) {
      if (stack[i].tag === tag) {
        foundIdx = i;
        break;
      }
    }

    if (foundIdx === -1) {
      continue;
    }

    while (stack.length - 1 > foundIdx) {
      const orphan = stack.pop()!;
      const k = `${keyPrefix}-${key++}`;
      attach(renderFrame(orphan, k));
    }

    const frame = stack.pop()!;
    const k = `${keyPrefix}-${key++}`;
    attach(renderFrame(frame, k));
  }

  if (lastIndex < input.length) {
    pushText(input.slice(lastIndex));
  }

  while (stack.length) {
    const frame = stack.pop()!;
    const k = `${keyPrefix}-${key++}`;
    attach(renderFrame(frame, k));
  }

  return nodes;
}

/**
 * Safely retrieves a nested value from an object using a dot-notation key path.
 * @param obj The object to query.
 * @param keyPath The dot-separated path to the desired value (e.g., 'a.b.c').
 * @returns The value at the specified path, or `undefined` if the path is invalid.
 * @template T The type of the object.
 * @template R The expected return type.
 */
export function getObjectValueByPath<T extends object, R>(
  obj: T,
  keyPath: string
): R | undefined {
  return keyPath.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj) as R | undefined;
}
