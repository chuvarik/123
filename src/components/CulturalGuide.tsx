import React, { useState } from "react";
import { Coffee, Flame, Heart, Zap, Globe, Sparkles } from "lucide-react";
import { CULTURAL_INSIGHTS } from "../data/scriptData";

export const CulturalGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const keyPillars = [
    {
      title: "Zero Calories & Fitness",
      description: "Unlike lattes or sugary syrups, an Americano is just espresso and water, clocking in at virtually 5 to 10 calories. In health-conscious Korea, it serves as the guilt-free daily hydration.",
      icon: Zap
    },
    {
      title: "Extreme Affordability",
      description: "Korean budget chains (Mega MGC Coffee, Compose, Paik's Coffee, Mammoth) serve giant 24oz iced americanos for 1,500 to 2,000 KRW (~$1.15 to $1.50 USD), making multiple cups a day painless.",
      icon: Heart
    },
    {
      title: "Every Corner Availability",
      description: "Seoul is renowned for having more coffee shops per capita than Seattle or Paris. You can grab an iced cup at subway exits, convenience stores, and kiosks within 30 seconds of walking.",
      icon: Globe
    },
    {
      title: "Chugability & Quick Reset",
      description: "Hot drinks must be sipped delicately. In fast-paced Korea (Ppalli-ppalli culture), people want instant cooling refreshment and quick caffeine delivery without waiting.",
      icon: Flame
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-8">
      {/* Editorial Header */}
      <div className="max-w-2xl">
        <div className="flex items-center gap-2 text-xs text-amber-700 font-semibold mb-1">
          <span>Cultural Deep Dive</span>
          <span aria-hidden="true">·</span>
          <span>Seoul Coffee Lifestyle</span>
        </div>
        <h3 className="text-2xl font-bold font-display text-stone-900 tracking-tight">
          Why Iced Americano (&ldquo;Ah-Ah&rdquo;) Conquered South Korea
        </h3>
        <p className="text-sm text-stone-600 mt-2 leading-relaxed">
          To understand modern South Korean daily life, you have to look into the translucent plastic cups in almost every commuter&apos;s hand. Here is why the iced americano became the unofficial national beverage.
        </p>
      </div>

      {/* The 4 Core Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyPillars.map((pillar, idx) => {
          const Icon = pillar.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-stone-50 border border-stone-100 flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-stone-900 font-display mb-1.5">
                  {pillar.title}
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cultural Insights Tabs */}
      <div className="pt-4 border-t border-stone-200">
        <h4 className="text-base font-bold text-stone-900 font-display mb-3">
          Essential Korean Coffee Expressions &amp; Habits
        </h4>

        {/* Tab Controls (Functional Buttons) */}
        <div className="flex flex-wrap gap-1 p-1 bg-stone-100 rounded-xl mb-4">
          {CULTURAL_INSIGHTS.map((insight, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === idx
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              {insight.korean} ({insight.romanization})
            </button>
          ))}
        </div>

        {/* Active Insight Card */}
        <div className="bg-stone-50 rounded-xl p-5 border border-stone-100">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold text-stone-900 font-korean">
              {CULTURAL_INSIGHTS[activeTab].korean}
            </span>
            <span className="text-sm font-semibold text-amber-800">
              {CULTURAL_INSIGHTS[activeTab].romanization}
            </span>
            <span className="text-xs text-stone-400 sm:ml-auto">
              {CULTURAL_INSIGHTS[activeTab].summary}
            </span>
          </div>
          <p className="text-sm text-stone-700 leading-relaxed mt-2">
            {CULTURAL_INSIGHTS[activeTab].details}
          </p>
        </div>
      </div>
    </div>
  );
};
