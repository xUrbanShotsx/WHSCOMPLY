/* eslint-disable @next/next/no-img-element */

/** The Assistant's character, drawn as pixel art, so it is never smoothed when it is scaled. */
export function Mascot({ className = "h-40 w-40" }: { className?: string }) {
  return (
    <img
      src="/assistant.png"
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`select-none object-contain [image-rendering:pixelated] ${className}`}
    />
  );
}

/** A round close-up of the face, for chat messages. */
export function MascotHead({
  className = "h-10 w-10",
}: {
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-block overflow-hidden rounded-full bg-accent/25 ring-1 ring-line ${className}`}
    >
      <img
        src="/assistant.png"
        alt=""
        draggable={false}
        className="absolute max-w-none select-none [image-rendering:pixelated]"
        style={{ width: "260%", left: "-62%", top: "-12%" }}
      />
    </span>
  );
}
