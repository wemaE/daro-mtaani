/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { MOCK_BADGES } from '../data/mockData';
import { Badge } from '../types';
import { Award, CheckCircle, Download, FileText, Lock, Sparkles, User, Users, Calendar } from 'lucide-react';

export default function Volunteers() {
  const [selectedBadge, setSelectedBadge] = useState<Badge>(MOCK_BADGES.find(b => b.certificateUnlocked) || MOCK_BADGES[0]);
  const [userName, setUserName] = useState<string>("Ephraim Omondi");
  
  const handlePrintCertificate = () => {
    // Elegant standard printing window triggers
    const printContent = document.getElementById('certificate-print-frame');
    if (!printContent) return;
    
    const originalContent = document.body.innerHTML;
    const printHtml = printContent.innerHTML;
    
    // Create popup or inject for clear focus printing
    const win = window.open('', '', 'height=650,width=900');
    if (win) {
      win.document.write('<html><head><title>DarasaMtaani Certificate Download</title>');
      win.document.write('<style>');
      win.document.write('@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@400;700&display=swap");');
      win.document.write('body { font-family: "Inter", sans-serif; margin: 0; padding: 20px; text-align: center; background: #fafafa; }');
      win.document.write('.cert-box { border: 12px double #0f766e; padding: 40px; background: #fff; max-width: 800px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }');
      win.document.write('.title { font-family: "Playfair Display", serif; font-size: 34px; color: #0f766e; margin-bottom: 20px; font-weight: bold; }');
      win.document.write('.subtitle { font-size: 14px; letter-spacing: 2px; text-transform: uppercase; color: #64748b; margin-bottom: 30px; }');
      win.document.write('.name { font-family: "Playfair Display", serif; font-size: 28px; font-weight: bold; border-bottom: 2px solid #e2e8f0; display: inline-block; padding-bottom: 5px; margin-bottom: 20px; color: #0f172a; }');
      win.document.write('.text { max-width: 600px; margin: 0 auto 30px; font-size: 14px; line-height: 1.6; color: #475569; }');
      win.document.write('.footer { display: flex; justify-content: space-between; margin-top: 50px; border-top: 1px dashed #cbd5e1; padding-top: 20px; }');
      win.document.write('.sig { font-family: "Playfair Display", serif; font-style: italic; font-weight: bold; color: #0f766e; }');
      win.document.write('</style></head><body>');
      win.document.write(printHtml);
      win.document.write('</body></html>');
      win.document.close();
      win.focus();
      setTimeout(() => {
        win.print();
        win.close();
      }, 500);
    }
  };

  return (
    <div className="space-y-6" id="volunteer-portfolio-system">
      <div className="bg-gradient-to-r from-teal-800 to-teal-950 rounded-2xl p-6 text-white border border-teal-800 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="bg-teal-700/55 px-2.5 py-0.5 rounded-full inline-block text-[10px] uppercase font-mono tracking-widest font-extrabold mb-2">
              VOLUNTEER PORTFOLIO ENGINE
            </div>
            <h2 className="text-2xl font-black font-sans tracking-tight">Gamified Impact Achievements</h2>
            <p className="text-xs text-teal-200/90 mt-1 max-w-xl">
              Track volunteer service hours, verify dynamic digital badges, and export verified, PDF-printable certificates for your professional CV and NGO portfolio.
            </p>
          </div>
          
          <div className="bg-teal-900/40 p-3 rounded-xl border border-teal-700/30 flex gap-4 text-center shrink-0">
            <div>
              <span className="block text-[10px] text-teal-300 font-mono">SERVED HOURS</span>
              <span className="text-xl font-black text-white font-mono">35 Hours</span>
            </div>
            <div className="w-px bg-teal-800" />
            <div>
              <span className="block text-[10px] text-teal-300 font-mono">KIDS IMPACTED</span>
              <span className="text-xl font-black text-white font-mono">12 Students</span>
            </div>
            <div className="w-px bg-teal-800" />
            <div>
              <span className="block text-[10px] text-teal-300 font-mono">BADGES OWNED</span>
              <span className="text-xl font-black text-white font-mono">2 / 5 UNLOCKED</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Badges and requirements */}
        <div className="lg:col-span-5 space-y-3">
          <span className="block text-xs font-bold text-slate-600 uppercase tracking-widest px-1">Tutor Achievement Grid</span>
          
          <div className="space-y-2.5">
            {MOCK_BADGES.map((badge) => {
              const isSelected = selectedBadge.id === badge.id;
              const isUnlocked = badge.progress >= 100;
              
              return (
                <button
                  key={badge.id}
                  onClick={() => setSelectedBadge(badge)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left transition ${
                    isSelected
                      ? 'bg-teal-50 border-teal-500 border-2'
                      : 'bg-white border-slate-150 border hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      isUnlocked
                        ? 'bg-amber-100/80 text-amber-600'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      <Award className={`w-5.5 h-5.5 ${isUnlocked ? 'animate-pulse' : ''}`} />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">{badge.name}</h4>
                      <p className="text-[10px] text-slate-500 leading-normal max-w-xs truncate lines-1 mt-0.5">
                        {badge.description}
                      </p>
                      
                      {/* Simple progress bar */}
                      <div className="mt-2 flex items-center gap-1.5 w-40">
                        <div className="h-1 bg-slate-100 rounded-full flex-grow overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isUnlocked ? 'bg-amber-500' : 'bg-teal-600'}`}
                            style={{ width: `${badge.progress}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-mono font-bold text-slate-500">{badge.progress}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 pl-1">
                    {isUnlocked ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-100" />
                    ) : (
                      <Lock className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic certificate preview and download */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-150 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-teal-700 uppercase bg-teal-50 px-2 py-0.5 rounded">
                  {selectedBadge.progress >= 100 ? '⭐ RECORD COMPLETED' : '🔒 ACTIVE GOAL'}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{selectedBadge.name} Certificate Status</h3>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 font-bold">Holder Name:</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-slate-50 focus:outline-teal-500 font-bold text-slate-800"
                  placeholder="Your Name"
                />
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              To unlock this verified credential, you must complete the specified metrics mtaani:
            </p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 mb-5 space-y-2">
              {selectedBadge.requirements.map((req, id) => (
                <div key={id} className="flex items-center gap-2 text-xs">
                  <div className={`w-1.5 h-1.5 rounded-full ${selectedBadge.progress >= 100 ? 'bg-teal-600 animate-ping' : 'bg-slate-400'}`} />
                  <span className="text-slate-700 font-medium">{req}</span>
                </div>
              ))}
            </div>

            {/* Certificate Template Preview */}
            <div className="bg-white border-2 border-slate-150 rounded-xl p-6 shadow-inner relative overflow-hidden" id="certificate-print-frame">
              <div className="border-[8px] border-double border-teal-800 p-6 bg-[#fffcf5] text-center max-w-lg mx-auto relative z-10">
                {/* Vintage Badge Stamp Background Vector representation */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none">
                  <Award className="w-64 h-64 text-teal-900" />
                </div>

                <span className="block text-[8px] tracking-widest font-black text-slate-400 uppercase">
                  DARASAMTAANI GRID ALLIANCE
                </span>
                
                <h2 className="text-xl font-bold font-serif text-teal-900 mt-2 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Certificate of Excellence
                </h2>
                <div className="w-16 h-px bg-amber-500 mx-auto my-2" />
                
                <span className="block text-[10px] text-slate-500 italic font-medium">
                  This community credential certifies that
                </span>

                <div className="my-2.5">
                  <span className="text-base font-extrabold text-slate-900 underline underline-offset-4 decoration-amber-500 font-serif" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {userName || "Your Name"}
                  </span>
                </div>

                <p className="text-[10px] text-slate-600 max-w-sm mx-auto leading-relaxed">
                  has served honorably as an active community volunteer and tutor inside Kenya's informal settlement learning grids, fulfilling the requirements for the **{selectedBadge.name}** badge by delivering high-impact CBC and STEM support.
                </p>

                <div className="mt-4 flex justify-between items-end border-t border-dashed border-slate-200 pt-3">
                  <div className="text-left font-sans text-[8px] text-slate-400">
                    <span className="block font-bold text-slate-500">KID RECORDS</span>
                    <span>Served: {selectedBadge.studentsImpactedRequired || 3}+ Learners</span>
                  </div>
                  <div className="text-center font-serif text-[10px] font-bold text-teal-800">
                    <span className="block italic">Darasa Alliance</span>
                    <span>Board Verified</span>
                  </div>
                  <div className="text-right font-sans text-[8px] text-slate-400">
                    <span className="block font-bold text-slate-500">TIME SERVED</span>
                    <span>Hours: {selectedBadge.hoursRequired || 10}+ Hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex self-end gap-3 w-full border-t border-slate-100 pt-3">
            {selectedBadge.progress >= 100 ? (
              <button
                type="button"
                onClick={handlePrintCertificate}
                className="w-full flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Printable PDF Certificate</span>
              </button>
            ) : (
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-400 py-2.5 rounded-xl text-xs font-bold leading-normal border cursor-not-allowed"
              >
                <Lock className="w-4 h-4" />
                <span>Certificate Locked (Complete 100%)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
