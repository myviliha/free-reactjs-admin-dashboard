import { ErrorScreen } from "./error-screen";

/** Whatever Next could not match. Same screen as `/error-404`, from the same file. */
export default function NotFound() {
  return <ErrorScreen />;
}
