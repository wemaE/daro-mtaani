/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { MOCK_HUBS } from '../data/mockData';
import { Hub } from '../types';
import { Map, AlertTriangle, CheckCircle, Navigation, Radio, Compass, ShieldAlert } from 'lucide-react';

export default function HarambeeRouting() {
  const [settlement, setSettlement] = useState<'Kibera' | 'Mathare' | 'Mukuru' | 'Kawangware'>('Mathare');
  const [assetNeeded, setAssetNeeded] = useState<string>('WiFi');

  // Logic: 
  // 1. Find matching hubs in settlement
  // 2. Remove hubs above 80% capacity
  // 3. Sort by walking distance
  // 4. Return best match and runner ups
  const routingResult = useMemo(() => {
    // All hubs in selected settlement
    const inSettlement = MOCK_HUBS.filter(h => h.settlement === settlement);

    // Filter matching asset at all
    const withAsset = inSettlement.filter(h => h.availableAssets.includes(assetNeeded));

    // Split based on capacity threshold (> 80%) for visual simulation rules
    const belowCapacity = withAsset.filter(h => h.capacityStatus <= 80);
    const overloaded = withAsset.filter(h => h.capacityStatus > 80);

    // Sorted by proximity
    const sortedAvailable = [...belowCapacity].sort((a, b) => a.walkingDistanceMins - b.walkingDistanceMins);

    return {
      bestMatch: sortedAvailable[0] || null,
      alternatives: sortedAvailable.slice(1),
      filteredOverloaded: overloaded,
      totalFound: withAsset.length,
      allSettlementHubs: inSettlement
    };
  }, [settlement, assetNeeded]);

  const assetsList = [
    "WiFi",
    "Tablets",
    "Computers",
    "Electricity",
    "Science Lab",
    "Library",
    "STEM Mentor"
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs" id="harambee-routing-engine">
      <div className="flex items-center gap-2 mb-4">
        <Compass className="w-5 h-5 text-teal-600" />
        <h2 className="text-xl font-semibold text-slate-900 font-sans tracking-tight">Harambee Spatial Routing Engine</h2>
      </div>
      <p className="text-xs text-slate-500 mb-6">
        A real-time GIS spatial simulation mapping community resources across settlements. The routing grid filters out overloaded centers (&gt;80% capacity) to balance physical workloads dynamically.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input selectors */}
        <div className="lg:col-span-4 space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Select Settlement</label>
            <select
              value={settlement}
              onChange={(e) => setSettlement(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="Mathare">Mathare Settlement</option>
              <option value="Kibera">Kibera Settlement</option>
              <option value="Mukuru">Mukuru Settlement</option>
              <option value="Kawangware">Kawangware Settlement</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Asset Needed</label>
            <div className="grid grid-cols-1 gap-2">
              {assetsList.map((asset) => (
                <button
                  key={asset}
                  onClick={() => setAssetNeeded(asset)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
                    assetNeeded === asset
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-150 hover:bg-slate-100'
                  }`}
                >
                  <span>{asset}</span>
                  {assetNeeded === asset && <Radio className="w-3.5 h-3.5 animate-pulse" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* HUD Map representation & Routing explanation */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Spatial simulation MAP (SVG) */}
          <div className="bg-slate-900 h-64 rounded-xl relative overflow-hidden border border-slate-950 shadow-inner flex flex-col justify-between p-3 select-none">
            {/* Ambient map grid background */}
            <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
              backgroundImage: 'radial-gradient(circle, #22c55e 1px, transparent 1px)',
              backgroundSize: '16px 16px'
            }} />
            
            {/* Grid coordinate labels */}
            <div className="absolute top-2 right-2 text-[10px] font-mono text-emerald-500 bg-emerald-950/80 border border-emerald-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>GRID STABLE (3G)</span>
            </div>

            {/* Simulated GIS map pins */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 300 160">
                {/* Safe grid lines */}
                <path d="M 10,80 L 290,80" stroke="rgba(34, 197, 94, 0.08)" strokeWidth="1" strokeDasharray="5,5" />
                <path d="M 150,10 L 150,150" stroke="rgba(34, 197, 94, 0.08)" strokeWidth="1" strokeDasharray="5,5" />

                {/* Draw some roads / pathways */}
                <path d="M 30,30 Q 150,50 270,30" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="3" />
                <path d="M 50,130 Q 150,110 250,140" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="3" />
                
                {/* Student Request Origin Node */}
                <g transform="translate(60, 90)">
                  <circle r="4" className="fill-blue-500 animate-ping" />
                  <circle r="3" className="fill-blue-400" />
                  <text x="8" y="3" className="fill-blue-300 font-mono" style={{ fontSize: '8px' }}>MTAANI HUB ORIGIN</text>
                </g>

                {/* Routing Connection Line */}
                {routingResult.bestMatch && (
                  <path
                    d={`M 60,90 Q 140,40 220,60`}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                    className="stroke-emerald-400 animate-[dash_4s_linear_infinite]"
                    style={{
                      strokeDasharray: '5, 5',
                      animation: 'dash 1.5s linear infinite'
                    }}
                  />
                )}

                {/* Map Pins for all hubs in settlement */}
                {routingResult.allSettlementHubs.map((hub, idx) => {
                  const isBest = routingResult.bestMatch?.id === hub.id;
                  const isOverloaded = hub.capacityStatus > 80;
                  // Alternate spacing/pins
                  const x = 120 + (idx * 40);
                  const y = 30 + (idx * 25);
                  
                  return (
                    <g key={hub.id} transform={`translate(${x}, ${y})`}>
                      {isBest ? (
                        <>
                          <circle r="12" className="fill-emerald-500/20 stroke-emerald-500 animate-ping" strokeWidth="1" />
                          <circle r="6" className="fill-emerald-500" />
                          <text x="10" y="4" className="fill-emerald-400 font-bold" style={{ fontSize: '8px' }}>BEST MATCH</text>
                        </>
                      ) : isOverloaded ? (
                        <>
                          <circle r="6" className="fill-rose-500" />
                          <path d="M-4,-4 L4,4 M-4,4 L4,-4" stroke="#ffffff" strokeWidth="1.5" />
                          <text x="10" y="4" className="fill-rose-400 font-semibold" style={{ fontSize: '8px' }}> &gt;80% FULL</text>
                        </>
                      ) : (
                        <>
                          <circle r="4" className="fill-slate-500" />
                          <text x="8" y="2" className="fill-slate-400" style={{ fontSize: '7px' }}>{hub.name.split(' ')[0]}</text>
                        </>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Bottom HUD Legend */}
            <div className="z-10 flex gap-4 text-[9px] font-mono text-slate-400">
              <span className="flex items-center gap-1 text-blue-400">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> STUDENT (ORIGIN)
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> ROUTED (ONLINE)
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> OVERLOADED (BLOCKED)
              </span>
            </div>
          </div>

          {/* Text outputs & Best Match Cards */}
          <div className="space-y-3">
            {routingResult.bestMatch ? (
              <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-emerald-700 uppercase bg-emerald-100 px-2 py-0.5 rounded">
                      ⚡ TOP RESOURCE MATCH ROUTED
                    </span>
                    <h3 className="text-base font-bold text-slate-950 mt-1">{routingResult.bestMatch.name}</h3>
                    <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1">
                      <span>Proximity: </span>
                      <strong className="text-slate-800">{routingResult.bestMatch.walkingDistanceMins} mins walking distance</strong>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-500 block">Workload</span>
                    <span className="text-sm font-extrabold text-teal-700 font-mono">
                      {routingResult.bestMatch.capacityStatus}% Capacity
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {routingResult.bestMatch.availableAssets.map(asset => (
                    <span
                      key={asset}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        asset === assetNeeded
                          ? 'bg-teal-600 text-white font-bold'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {asset}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 bg-slate-50 border border-dashed border-slate-200 text-center rounded-xl flex flex-col items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
                <h4 className="text-sm font-bold text-slate-800">No matching open resources in {settlement}</h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  All hubs supporting "{assetNeeded}" in this sector are currently registered above the 80% grid capacity threshold or none exist.
                </p>
              </div>
            )}

            {/* Collapsed view to explain blocked resources */}
            {routingResult.filteredOverloaded.length > 0 && (
              <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-extrabold text-rose-800 tracking-tight uppercase">
                    Resource Throttling Protective Action ({routingResult.filteredOverloaded.length} Hubs Blocked)
                  </h4>
                  <p className="text-[11px] text-rose-700 leading-normal">
                    The following hubs have security-blocked queuing: {routingResult.filteredOverloaded.map(h => `${h.name} (${h.capacityStatus}%)`).join(', ')}. Tutors and students are redirected to nearby libraries to prevent overcrowding.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
