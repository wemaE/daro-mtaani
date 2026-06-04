/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { UbuntuScore } from '../types';
import { Sparkles, ShieldAlert, Award, HelpCircle } from 'lucide-react';

interface UbuntuEngineProps {
  onScoreChange?: (score: number) => void;
}

export default function UbuntuEngine({ onScoreChange }: UbuntuEngineProps) {
  const [timePoverty, setTimePoverty] = useState<number>(6);
  const [materialDeficit, setMaterialDeficit] = useState<number>(7);
  const [examRisk, setExamRisk] = useState<number>(5);
  const [disabilitySupport, setDisabilitySupport] = useState<number>(2);
  const [householdPressure, setHouseholdPressure] = useState<number>(6);

  const calculatedScoreDetails = useMemo<UbuntuScore>(() => {
    const rawScore =
      timePoverty * 0.30 +
      materialDeficit * 0.25 +
      examRisk * 0.20 +
      disabilitySupport * 0.15 +
      householdPressure * 0.10;
    
    const roundedScore = Math.round(rawScore * 10) / 10;

    let tier: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
    let recommendation = '';

    if (roundedScore < 3.0) {
      tier = 'Low';
      recommendation = "✅ Student is stable but would benefit from weekly hub access and participating in peer STEM study circles to construct community projects.";
    } else if (roundedScore < 6.0) {
      tier = 'Medium';
      recommendation = "⚠️ Secondary grid queue. Assigned to regular science & mathematics learning hub classes. Free tablet study allocations are recommended twice a week.";
    } else if (roundedScore < 8.0) {
      tier = 'High';
      recommendation = "🚨 High Priority Allocation. Guaranteed immediate physical tutor assignment. Reached threshold for device sharing scheme and sponsored school-break CBC kits.";
    } else {
      tier = 'Critical';
      recommendation = "🔥 Critical Priority Routing. Direct dispatch of personalized tutor-home visits. Sponsored cellular data token and UNICEF home learning materials automatically assigned.";
    }

    return {
      timePoverty,
      materialDeficit,
      examRisk,
      disabilitySupport,
      householdPressure,
      score: roundedScore,
      priorityTier: tier,
      recommendation,
    };
  }, [timePoverty, materialDeficit, examRisk, disabilitySupport, householdPressure]);

  const onScoreChangeRef = useRef(onScoreChange);
  useEffect(() => {
    onScoreChangeRef.current = onScoreChange;
  }, [onScoreChange]);

  const currentScore = calculatedScoreDetails.score;
  useEffect(() => {
    if (onScoreChangeRef.current) {
      onScoreChangeRef.current(currentScore);
    }
  }, [currentScore]);

  const tierColors = {
    Low: { bg: 'bg-emerald-500/10', text: 'text-emerald-700', border: 'border-emerald-500/20', stroke: '#10b981' },
    Medium: { bg: 'bg-amber-500/10', text: 'text-amber-700', border: 'border-amber-500/20', stroke: '#f59e0b' },
    High: { bg: 'bg-orange-500/10', text: 'text-orange-700', border: 'border-orange-500/20', stroke: '#f97316' },
    Critical: { bg: 'bg-rose-500/10', text: 'text-rose-700', border: 'border-rose-500/20', stroke: '#f43f5e' },
  };

  const currentTierColor = tierColors[calculatedScoreDetails.priorityTier];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs" id="ubuntu-score-calculator">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-teal-600" />
        <h2 className="text-xl font-semibold text-slate-900 font-sans tracking-tight">Ubuntu Priority Score Engine</h2>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        An algorithmic priority index designed to allocate local volunteers and hubs to students facing high socio-economic or learning pressures. We honor equity over equal distribution.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Area */}
        <div className="lg:col-span-7 space-y-5">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-700">
              <span className="flex items-center gap-1">Time Poverty (30% Weight) <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" title="Time parents work long shifts with zero homework teaching availability." /></span>
              <span className="text-teal-700 font-mono font-bold bg-teal-50 px-1.5 py-0.5 rounded">{timePoverty}/10</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={timePoverty}
              onChange={(e) => setTimePoverty(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-700">
              <span className="flex items-center gap-1">Material Deficit (25% Weight) <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" title="Lack of revision materials, learning devices, power connectivity or high-speed grid access." /></span>
              <span className="text-teal-700 font-mono font-bold bg-teal-50 px-1.5 py-0.5 rounded">{materialDeficit}/10</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={materialDeficit}
              onChange={(e) => setMaterialDeficit(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-700">
              <span className="flex items-center gap-1">Exam & Dropout Risk (20% Weight) <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" title="Indicators of school absenteeism, pending national CBC transition milestone hurdles." /></span>
              <span className="text-teal-700 font-mono font-bold bg-teal-50 px-1.5 py-0.5 rounded">{examRisk}/10</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={examRisk}
              onChange={(e) => setExamRisk(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-700">
              <span className="flex items-center gap-1">Disability Support (15% Weight) <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" title="Visual, sensory, or movement conditions requiring specific, specialized educator attention." /></span>
              <span className="text-teal-700 font-mono font-bold bg-teal-50 px-1.5 py-0.5 rounded">{disabilitySupport}/10</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={disabilitySupport}
              onChange={(e) => setDisabilitySupport(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-700">
              <span className="flex items-center gap-1">Household Size Pressure (10% Weight) <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" title="High density of children and dependents housed in standard single-room spaces." /></span>
              <span className="text-teal-700 font-mono font-bold bg-teal-50 px-1.5 py-0.5 rounded">{householdPressure}/10</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={householdPressure}
              onChange={(e) => setHouseholdPressure(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
          </div>
        </div>

        {/* Visual score display */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-150">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG circle gauge */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="62"
                className="stroke-slate-200 fill-none"
                strokeWidth="10"
              />
              <circle
                cx="72"
                cy="72"
                r="62"
                className="fill-none transition-all duration-300"
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 62}`}
                strokeDashoffset={`${2 * Math.PI * 62 * (1 - calculatedScoreDetails.score / 10)}`}
                stroke={currentTierColor.stroke}
                strokeLinecap="round"
              />
            </svg>
            <div className="text-center z-10">
              <span className="block text-4xl font-extrabold font-mono text-slate-900 leading-none">
                {calculatedScoreDetails.score}
              </span>
              <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                UPS INDEX
              </span>
            </div>
          </div>

          <div className="mt-4 text-center">
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${currentTierColor.bg} ${currentTierColor.text} ${currentTierColor.border} border mb-2`}>
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{calculatedScoreDetails.priorityTier} Priority Tier</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xs mt-1">
              {calculatedScoreDetails.recommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Metric Breakdown Progress bars */}
      <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100/80">
          <span className="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase">TIME WEIGHT</span>
          <span className="text-xs font-mono font-semibold text-slate-700">{(timePoverty * 0.30).toFixed(2)} pts</span>
        </div>
        <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100/80">
          <span className="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase">MATERIAL W</span>
          <span className="text-xs font-mono font-semibold text-slate-700">{(materialDeficit * 0.25).toFixed(2)} pts</span>
        </div>
        <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100/80">
          <span className="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase">EXAM W</span>
          <span className="text-xs font-mono font-semibold text-slate-700">{(examRisk * 0.20).toFixed(2)} pts</span>
        </div>
        <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100/80">
          <span className="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase">DISABILITY W</span>
          <span className="text-xs font-mono font-semibold text-slate-700">{(disabilitySupport * 0.15).toFixed(2)} pts</span>
        </div>
        <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100/80">
          <span className="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase">HOUSEHOLD W</span>
          <span className="text-xs font-mono font-semibold text-slate-700">{(householdPressure * 0.10).toFixed(2)} pts</span>
        </div>
      </div>
    </div>
  );
}
