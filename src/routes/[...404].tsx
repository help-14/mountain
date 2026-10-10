import { A } from "@solidjs/router";
import { HttpStatusCode } from "@solidjs/start";

export default function NotFound() {
  return (
    <main class="flex h-dvh flex-col items-center justify-center gap-4 bg-900 p-6 text-center">
      <HttpStatusCode code={404} />
      <p class="font-mono text-6xl font-light text-active">404</p>
      <p class="text-sm text-menu">This page doesn't exist.</p>
      <A href="/" class="btn btn-primary">
        Back to files
      </A>
    </main>
  );
}
