/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { CBC_DICTIONARY, MOCK_TUTORS, MOCK_HUBS, getRecommendations } from '../data/mockData';
import { Camera, Volume2, Search, Sliders, CheckSquare, BrainCircuit, GraduationCap, ChevronRight, User } from 'lucide-react';

export default function AIAssistants() {
  // Homework Scanner State
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'completed'>('idle');
  const [selectedScannerImage, setSelectedScannerImage] = useState<string | null>(null);

  // Parent Translator State
  const [selectedWord, setSelectedWord] = useState<string>(CBC_DICTIONARY[0].term);
  const [translationLang, setTranslationLang] = useState<'English' | 'Swahili' | 'Sheng'>('Swahili');

  // Custom Recommendations State
  const [studentAge, setStudentAge] = useState<number>(10);
  const [studentGrade, setStudentGrade] = useState<number>(4);
  const [selectedStruggles, setSelectedStruggles] = useState<string[]>(["Mathematics"]);
  const [customUbuntuScore, setCustomUbuntuScore] = useState<number>(7.2);
  const [isCalculated, setIsCalculated] = useState<boolean>(true);

  // Mock Homework templates to pretend they scanned them!
  const homeworkSamples = [
    {
      label: "Math Patterns Task",
      text: "CBC Math Grade 3: Complete consecutive number sequence pattern: 3, 9, 27, ___. State the operational rule applied.",
      subject: "Mathematics",
      imageText: "3, 9, 27, ___"
    },
    {
      label: "Science Soil drainage experiment",
      text: "Environmental Studies Inquiry: Draw a diagram showing drainage rate differences between Clay, Loam, and Sand. Identify the best soil for maize planting.",
      subject: "Science",
      imageText: "Soil Drainage Sample"
    }
  ];

  const handleStruggleToggle = (sub: string) => {
    if (selectedStruggles.includes(sub)) {
      setSelectedStruggles(selectedStruggles.filter(s => s !== sub));
    } else {
      setSelectedStruggles([...selectedStruggles, sub]);
    }
  };

  const startMockScan = (sample: typeof homeworkSamples[0]) => {
    setSelectedScannerImage(sample.label);
    setScanState('scanning');
    setTimeout(() => {
      setScanState('completed');
    }, 1800);
  };

  const activeTermObject = CBC_DICTIONARY.find(term => term.term === selectedWord) || CBC_DICTIONARY[0];

  // Recommendations calculated on-the-fly
  const recommendationsList = getRecommendations(
    studentAge,
    studentGrade,
    selectedStruggles,
    customUbuntuScore
  );

  return (
    <div className="space-y-8" id="ai-assistants-panel">
      {/* SECTION 1: Homework Scanner (Mock Photo scan and smart analysis) */}
      <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-xs">
        <div className="flex items-center gap-2.5 mb-2">
          <BrainCircuit className="w-5.5 h-5.5 text-teal-600" />
          <h2 className="text-xl font-bold font-sans tracking-tight text-slate-900">Mtaani Homework Scanner</h2>
        </div>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Low-resource camera extraction. Take a photo of the math sequence or CBC inquiry assignment page to extract text, identify core subjects, and link with nearby volunteer resources immediately.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Homework selection / upload zone */}
          <div className="lg:col-span-5 space-y-4">
            <span className="block text-xs font-bold text-slate-600 uppercase tracking-widest">Select Mock Assignment Template</span>
            
            <div className="grid grid-cols-1 gap-2.5">
              {homeworkSamples.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => startMockScan(sample)}
                  disabled={scanState === 'scanning'}
                  className={`flex flex-col items-start p-3 bg-slate-50 border rounded-xl text-left transition-all ${
                    selectedScannerImage === sample.label
                      ? 'border-teal-500 ring-2 ring-teal-500/10'
                      : 'border-slate-150 hover:bg-slate-100/70'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900">{sample.label}</span>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 truncate w-full">{sample.text}</span>
                </button>
              ))}

              <div className="border border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50/50 transition cursor-pointer flex flex-col items-center justify-center">
                <Camera className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-800">Launch Mobile Device Camera</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Capture handwriting on textbook sheet</span>
              </div>
            </div>
          </div>

          {/* Scanner Process screen & recommendation output */}
          <div className="lg:col-span-7 bg-slate-50 rounded-2xl border border-slate-150 p-5 flex flex-col justify-between min-h-64">
            {scanState === 'idle' && (
              <div className="my-auto text-center py-8">
                <BrainCircuit className="w-10 h-10 text-slate-300 mx-auto mb-2 animate-bounce" />
                <span className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Awaiting Textbook Canvas</span>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                  Choose a homework template or tap files to trigger the computer-vision layout extractor.
                </p>
              </div>
            )}

            {scanState === 'scanning' && (
              <div className="my-auto py-8 text-center space-y-4">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 border-4 border-slate-250 rounded-full" />
                  <div className="absolute inset-0 border-4 border-teal-600 rounded-full border-t-transparent animate-spin" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-teal-700 tracking-widest uppercase block animate-pulse">Scanning handprints...</span>
                  <span className="text-[10px] text-slate-500 font-mono font-bold block mt-1">Applying OCR text blocks under 3G throttling limit...</span>
                </div>
              </div>
            )}

            {scanState === 'completed' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start border-b border-slate-200/80 pb-3">
                  <div>
                    <span className="text-[9px] font-bold tracking-widest text-emerald-700 uppercase bg-emerald-100 px-2 py-0.5 rounded mr-1">
                      OCR EXTRACTION OK
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1.5">
                      Sample: {homeworkSamples.find(h => h.label === selectedScannerImage)?.label}
                    </h4>
                  </div>
                  <button
                    onClick={() => setScanState('idle')}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Reset Check
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Extracted block */}
                  <div className="p-3 bg-white border border-slate-150 rounded-lg">
                    <span className="block text-[9px] text-slate-400 font-mono font-bold uppercase mb-1">Extracted Homework Text</span>
                    <p className="text-xs text-slate-700 font-medium font-sans leading-relaxed italic">
                      "{homeworkSamples.find(h => h.label === selectedScannerImage)?.text}"
                    </p>
                  </div>

                  {/* Recommendation pairing block */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Handed Tutor */}
                    <div className="p-2.5 bg-sky-50/50 border border-sky-100 rounded-lg">
                      <span className="block text-[9px] text-sky-700 font-bold uppercase tracking-wider">Matched Speciality Tutor</span>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                          {homeworkSamples.find(h => h.label === selectedScannerImage)?.subject === 'Mathematics' ? 'AO' : 'JM'}
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-slate-900">
                            {homeworkSamples.find(h => h.label === selectedScannerImage)?.subject === 'Mathematics' ? 'Amina Omondi' : 'John Mwangi'}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Within {homeworkSamples.find(h => h.label === selectedScannerImage)?.subject === 'Mathematics' ? '0.6' : '1.1'} km walking distance
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Handed hub */}
                    <div className="p-2.5 bg-teal-50/50 border border-teal-100 rounded-lg">
                      <span className="block text-[9px] text-teal-800 font-bold uppercase tracking-wider">Top Recommended Study Hub</span>
                      <span className="block font-bold text-xs text-slate-900 mt-1">
                        {homeworkSamples.find(h => h.label === selectedScannerImage)?.subject === 'Mathematics' ? 'SHOFCO Kibera Empowerment' : 'Mathare Community Library'}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {homeworkSamples.find(h => h.label === selectedScannerImage)?.subject === 'Mathematics' ? '8 mins walking distance' : '5 mins walking distance'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: Swahili & Sheng CBC Dictionary Translator */}
      <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-xs" id="parent-translator">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5.5 h-5.5 text-teal-600" />
            <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">Parent-Friendly CBC Glossary</h2>
          </div>
          
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {(["English", "Swahili", "Sheng"] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setTranslationLang(lang)}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                  translationLang === lang
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Parents are key partners in CBC, but curriculum jargon can be intimidating. Select terminology below for immediate, friendly explanations in Sheng, Swahili, and English complete with home reading guides.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Term Select List */}
          <div className="md:col-span-4 space-y-2">
            {CBC_DICTIONARY.map((term) => (
              <button
                key={term.term}
                onClick={() => setSelectedWord(term.term)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left text-xs transition-all border ${
                  selectedWord === term.term
                    ? 'bg-teal-600 border-teal-600 hover:bg-teal-700 text-white font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-150 hover:bg-slate-100 text-slate-800 font-semibold'
                }`}
              >
                <span>{term.term}</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </button>
            ))}
          </div>

          {/* Translation Viewer with Audio button */}
          <div className="md:col-span-8 bg-slate-50 rounded-2xl border border-slate-150 p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start border-b border-slate-200 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-sans tracking-tight">{activeTermObject.term}</h3>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
                    {translationLang === 'English' ? 'Standard English Definition' : translationLang === 'Swahili' ? activeTermObject.swahiliTranslation : activeTermObject.shengTranslation}
                  </span>
                </div>
                
                {/* Simulated Audio Pronunciation Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    const phrase = translationLang === 'Swahili' ? activeTermObject.definitionSw : translationLang === 'Sheng' ? activeTermObject.definitionSheng : activeTermObject.definitionEn;
                    const speech = new SpeechSynthesisUtterance(phrase);
                    speech.lang = translationLang === 'English' ? 'en-US' : 'sw-KE';
                    window.speechSynthesis.speak(speech);
                  }}
                  className="p-2 bg-teal-50 border border-teal-100 rounded-lg hover:bg-teal-100 text-teal-700 transition"
                  title="Speak explanation aloud"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Dynamic text translation content inline */}
              <div className="space-y-3.5">
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Current Explanation</span>
                  <p className="text-sm text-slate-800 font-medium leading-relaxed font-sans">
                    {translationLang === 'English' && activeTermObject.definitionEn}
                    {translationLang === 'Swahili' && activeTermObject.definitionSw}
                    {translationLang === 'Sheng' && activeTermObject.definitionSheng}
                  </p>
                </div>

                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">In-School Practical Instances</span>
                  <ul className="list-disc pl-4 text-xs text-slate-600 space-y-0.5">
                    {activeTermObject.examples.map((ex, id) => (
                      <li key={id}>{ex}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-200/80 bg-teal-50/50 p-3 rounded-xl border border-teal-100">
              <span className="text-[10px] font-bold text-teal-800 tracking-wider uppercase block">👨‍👩‍👦 MTAANI PARENTS STUDY GUIDE TIP</span>
              <p className="text-xs text-teal-700 mt-0.5 leading-relaxed font-semibold">
                {activeTermObject.readingGuide}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Smart learning recommendations engine */}
      <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-xs" id="learning-recommendations">
        <div className="flex items-center gap-2 mb-2">
          <Sliders className="w-5.5 h-5.5 text-teal-600" />
          <h2 className="text-xl font-bold font-sans tracking-tight text-slate-900">Custom Recommendations</h2>
        </div>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Input student age, grade thresholds, subject areas, and their priority Ubuntu Score metrics. The algorithm generates customized actionable instructions aligned with available settlements resources.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sliders and struggles selection */}
          <div className="lg:col-span-5 space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-700 uppercase">
                <span>Student Age</span>
                <span className="text-teal-700 font-mono">{studentAge} Years</span>
              </div>
              <input
                type="range"
                min="5"
                max="18"
                value={studentAge}
                onChange={(e) => setStudentAge(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-700 uppercase">
                <span>Student Grade Level</span>
                <span className="text-teal-700 font-mono">CBC Grade {studentGrade}</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                value={studentGrade}
                onChange={(e) => setStudentGrade(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-bold text-slate-700 uppercase">Current Subject Struggles</span>
              <div className="grid grid-cols-2 gap-2">
                {["Mathematics", "Science", "CBC Project", "Mentorship"].map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => handleStruggleToggle(sub)}
                    className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border text-left transition ${
                      selectedStruggles.includes(sub)
                        ? 'bg-teal-50 border-teal-500 text-teal-900'
                        : 'bg-slate-50 border-slate-150 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <CheckSquare className={`w-3.5 h-3.5 ${selectedStruggles.includes(sub) ? 'fill-teal-600 text-white' : 'text-slate-400'}`} />
                    <span>{sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-700 uppercase">
                <span>Direct Ubuntu Score (UPS)</span>
                <span className="text-amber-700 font-mono font-bold bg-amber-50 px-1.5 rounded">{customUbuntuScore.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={customUbuntuScore}
                onChange={(e) => setCustomUbuntuScore(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
            </div>
          </div>

          {/* Recommendations list display */}
          <div className="lg:col-span-7 bg-slate-50 rounded-2xl border border-slate-150 p-5">
            <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 mb-3">
              <span className="text-xs font-extrabold tracking-wider text-slate-700 uppercase">
                GRID ALGORITHMIC ADVICE PLAN
              </span>
            </div>

            <div className="space-y-2.5">
              {recommendationsList.map((rec, id) => {
                const isAlert = rec.startsWith("🚨");
                return (
                  <div
                    key={id}
                    className={`p-3 rounded-lg border text-xs leading-relaxed font-medium transition ${
                      isAlert
                        ? 'bg-rose-50 border-rose-100 text-rose-800 font-bold'
                        : 'bg-white border-slate-150 text-slate-700'
                    }`}
                  >
                    {rec}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
