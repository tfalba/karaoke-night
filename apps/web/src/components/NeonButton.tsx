import type { ButtonHTMLAttributes } from "react";

export function NeonButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", disabled, ...rest } = props;

  return (
    <button
      {...rest}
      disabled={disabled}
      className={[
        "rounded-2xl px-4 py-2 font-semibold",
        "border border-white/15 bg-white/5 hover:bg-white/10",
        "shadow-neon transition active:translate-y-[1px]",
        disabled ? "cursor-not-allowed opacity-50 hover:bg-white/5" : "",
        className,
      ].join(" ")}
    />
  );
}
