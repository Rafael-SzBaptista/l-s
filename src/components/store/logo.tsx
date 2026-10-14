import { cn } from "@/lib/utils";

export function Logo({
  className,
  size = "md",
}: {
  className?: string;
  size?: "md" | "lg";
}) {
  return (
    <span className={cn("inline-flex flex-col items-center text-ink", className)}>
      <span
        className={cn(
          "font-script normal-case",
          size === "lg" ? "text-[4.5rem]" : "text-[2.15rem]",
        )}
      >
        Lés
      </span>
      <span className="eyebrow -mt-1 text-[0.52rem] text-ink/80">By Sabongi</span>
    </span>
  );
}
