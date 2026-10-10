import { clientOnly } from "@solidjs/start";

const Explorer = clientOnly(() => import("~/components/Explorer"));

function Splash() {
  return (
    <div class="flex h-dvh items-center justify-center bg-900">
      <div class="flex flex-col items-center gap-4 animate-fade-in">
        <svg viewBox="0 0 32 32" class="size-12" aria-hidden="true">
          <rect width="32" height="32" rx="8" fill="#2c3337" />
          <path d="M5 24 L13 11 L17.5 17.5 L20.5 13.5 L27 24 Z" fill="#a7c080" />
        </svg>
        <div class="h-1 w-24 overflow-hidden rounded-full bg-line">
          <div class="h-full w-full origin-left animate-progress bg-active" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return <Explorer fallback={<Splash />} />;
}
