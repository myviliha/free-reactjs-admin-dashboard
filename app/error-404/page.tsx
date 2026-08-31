import { ErrorScreen } from "../error-screen";

export const metadata = { title: "404 Error" };

/** The sidebar's link to the not-found screen. Full width, outside the shell, as the reference has it. */
export default function Error404Page() {
  return <ErrorScreen />;
}
