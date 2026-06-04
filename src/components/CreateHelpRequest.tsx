/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { HelpRequest } from '../types';
import { darasaStorage } from '../utils/indexedDb';
import { MOCK_HUBS, MOCK_TUTORS } from '../data/mockData';
import { Save, AlertCircle, CheckCircle2, CloudLightning } from 'lucide-react';

interface CreateHelpRequestProps {
  onSuccess?: () => void;
  defaultUbuntuScore?: number;
}

export default function CreateHelpRequest({ onSuccess, defaultUbuntuScore = 6.2 }: CreateHelpRequestProps) {
  const [studentName, setStudentName] = useState('');
  const [requestType, setRequestType] = useState<'Mathematics' | 'Science' | 'CBC Project' | 'WiFi Access' | 'Device Access' | 'Mentorship'>('Mathematics');
  const [description, setDescription] = useState('');
  const [settlement, setSettlement] = useState<'Kibera' | 'Mathare' | 'Mukuru' | 'Kawangware'>('Mathare');
  const [location, setLocation] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentContact, setParentContact] = useState('');
  
  const [submitStatus, setSubmitStatus] = useState<{ status: 'idle' | 'success_online' | 'success_offline' | 'error'; msg: string }>({ status: 'idle', msg: '' });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!studentName || !description || !parentName || !parentContact || !location) {
      setSubmitStatus({ status: 'error', msg: 'Please fill in all requested fields mtaani so we can route you.' });
      return;
    }

    const newRequest: HelpRequest = {
      id: `req-${Date.now()}`,
      studentName,
      requestType,
      description,
      settlement,
      location,
      parentName,
      parentContact,
      ubuntuScore: defaultUbuntuScore,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Save using our offline-first storage
    const { savedOffline } = darasaStorage.saveRequest(newRequest);

    if (savedOffline) {
      setSubmitStatus({
        status: 'success_offline',
        msg: `📡 Saved Offline! No working 3G detected. Registered in transmission queue. Your request for ${studentName} will sync as soon as you connect to a community hub WiFi.`
      });
    } else {
      setSubmitStatus({
        status: 'success_online',
        msg: `🎉 Success Grid registered! Your request for ${studentName} has been synchronized. Tutors in ${settlement} have been notified.`
      });
    }

    // Reset fields
    setStudentName('');
    setDescription('');
    setLocation('');
    setParentName('');
    setParentContact('');

    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-xs" id="help-request-form">
      <div className="flex items-center gap-2 mb-4">
        <CloudLightning className="w-5 h-5 text-teal-600" />
        <h3 className="text-lg font-bold text-slate-900 font-sans tracking-tight">Request Student Support</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {submitStatus.status !== 'idle' && (
          <div className={`p-3.5 rounded-xl border text-xs flex gap-2 items-start ${
            submitStatus.status === 'error'
              ? 'bg-rose-50 border-rose-100 text-rose-800 font-bold'
              : submitStatus.status === 'success_offline'
              ? 'bg-amber-50 border-amber-100 text-amber-800 font-bold animate-pulse'
              : 'bg-emerald-50 border-emerald-100 text-emerald-800 font-bold'
          }`}>
            {submitStatus.status === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{submitStatus.msg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600 uppercase">Student's Full Name</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-teal-500 text-slate-800"
              placeholder="e.g. Amani Otieno"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600 uppercase">Need Type</label>
            <select
              value={requestType}
              onChange={(e: any) => setRequestType(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-teal-500 text-slate-800"
            >
              <option value="Mathematics">Mathematics Support</option>
              <option value="Science">Science Tutoring</option>
              <option value="CBC Project">CBC Project Guidance</option>
              <option value="WiFi Access">Safaricom Hub WiFi Access</option>
              <option value="Device Access">Shared Tablet/Device Booking</option>
              <option value="Mentorship">Career/Life Mentorship</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600 uppercase">Settlement</label>
            <select
              value={settlement}
              onChange={(e: any) => setSettlement(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-teal-500 text-slate-800"
            >
              <option value="Mathare">Mathare</option>
              <option value="Kibera">Kibera</option>
              <option value="Mukuru">Mukuru</option>
              <option value="Kawangware">Kawangware</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600 uppercase">Specific Area Detail</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-teal-500 text-slate-800"
              placeholder="e.g. Sector 4B, near Ruben Centre"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600 uppercase">Parent/Guardian Name</label>
            <input
              type="text"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-teal-500 text-slate-800"
              placeholder="e.g. Mary Atieno"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600 uppercase">M-pesa/Phone Contact</label>
            <input
              type="text"
              value={parentContact}
              onChange={(e) => setParentContact(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-teal-500 text-slate-800"
              placeholder="e.g. +254 722 000000"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-600 uppercase">Describe Learning Needs / Project Goals</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-teal-500 text-slate-800"
            placeholder="Describe the CBC project details or mathematics hurdles clearly..."
          />
        </div>

        <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100 flex items-center justify-between">
          <span className="text-xs text-amber-800 font-bold">Allocating Priority Score base:</span>
          <span className="text-sm font-extrabold text-amber-700 bg-white border border-amber-200 px-2 py-0.5 rounded-lg font-mono">
            {defaultUbuntuScore.toFixed(1)} UPS
          </span>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Queue to Community Learning Hub Ledger</span>
        </button>
      </form>
    </div>
  );
}
