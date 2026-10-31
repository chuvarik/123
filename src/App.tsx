import React from "react";
import { OFFICIAL_BEATS } from "./data/scriptData";
import { ReelPlayer } from "./components/ReelPlayer";

export default function App() {
  return (
    <div className="min-h-screen w-full bg-stone-950 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
      <main className="w-full flex items-center justify-center">
        <ReelPlayer beats={OFFICIAL_BEATS} />
      </main>
    </div>
  );
}
