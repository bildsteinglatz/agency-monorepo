import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center relative">
      <div className="hud-overlay" />
      <main className="z-10 flex flex-col items-center gap-8 text-center">
        <h1 className="text-4xl font-mono font-bold tracking-tighter text-phd-emerald">
          PH.D. OPERATING SYSTEM
        </h1>
        <div className="flex gap-4 font-mono text-sm">
          <div className="border border-white/20 p-4 rounded hover:border-phd-purple transition-colors cursor-pointer">
            [ ATMOSPHERE ]
          </div>
          <div className="border border-white/20 p-4 rounded hover:border-phd-purple transition-colors cursor-pointer">
            [ FORENSIC ATLAS ]
          </div>
          <div className="border border-white/20 p-4 rounded hover:border-phd-purple transition-colors cursor-pointer">
            [ INTERVENTION LAB ]
          </div>
        </div>
        <p className="max-w-md text-zinc-500 font-mono text-xs mt-8">
          SYSTEM STATUS: ONLINE
          <br />
          VERSION: 0.1.0-ALPHA
        </p>
      </main>
    </div>
  );
}
