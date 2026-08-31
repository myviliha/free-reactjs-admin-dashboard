import { Link } from "react-router";

/**
 * The router, handed to the design system as a prop.
 *
 * `AppShell` takes a `Link` component rather than importing one, because `packages/react` is sold to
 * Vue, Angular, HTML and Laravel buyers and must not gain a React router. Its contract is an `href`,
 * which is what an anchor takes and what `next/link` took; react-router spells the same thing `to`,
 * so this adapter is the whole of the difference.
 */
export function RouterLink({
  href,
  ...rest
}: { href: string } & Omit<React.ComponentProps<typeof Link>, "to">) {
  return <Link to={href} {...rest} />;
}
