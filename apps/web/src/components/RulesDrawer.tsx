import { NeonButton } from "./NeonButton";

const RULES = [
  "Picks a new singer on “Next”",
  "Avoids the last singer when possible",
  "Weighted toward players with more songs remaining",
  "Searches YouTube for “karaoke version”",
  "Queue persists until cleared",
];

export function RulesDrawer(props: {
  isOpen: boolean;
  onToggle: () => void;
  onClear: () => void;
}) {
  const { isOpen, onToggle, onClear } = props;

  return (
    <div className="fixed bottom-3 left-6 z-40">
     
      <div
        className={[
          "mt-3 w-[360px] max-w-[90vw] overflow-hidden rounded-3xl border border-white/10 bg-[#CDDC39]/60 backdrop-blur",
          "shadow-neon transition-all duration-200",
          isOpen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
        ].join(" ")}
      >
        <div className="border-b border-white/10 p-4">
          <div className="text-xs uppercase tracking-[0.25em] text-white/60">
            Rules
          </div>
          <div className="text-lg font-semibold">How the queue works</div>
        </div>
        <div className="p-4">
          <ul className="space-y-2 text-sm text-white/70">
            {RULES.map((rule) => (
              <li key={rule}>• {rule}</li>
            ))}
          </ul>
          <div className="mt-4">
            <button
              onClick={onClear}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm hover:bg-black/10"
            >
              Clear local storage + reset
            </button>
          </div>
        </div>
      </div>
       <div className="flex justify-start">
        <NeonButton className="bg-[#CDDC39]/60 lowercase" onClick={onToggle}>
          {isOpen ? "- Rules" : "+ Rules"}
        </NeonButton>
      </div>

    </div>
  );
}
