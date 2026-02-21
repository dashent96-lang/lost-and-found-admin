'use client';

import React, { useState } from 'react';
import { PostType } from '../types';
import { GeminiService } from '../services/geminiService';

interface PostFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const PostForm: React.FC<PostFormProps> = ({ onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    type: PostType.LOST,
    image: ''
  });
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhance = async () => {
    if (!formData.title || !formData.description) {
      alert("Please enter a title and some basic notes first.");
      return;
    }
    setIsEnhancing(true);
    const enhanced = await GeminiService.enhanceDescription(formData.title, formData.description);
    setFormData(prev => ({ ...prev, description: enhanced }));
    setIsEnhancing(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const inputClasses = "w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300";
  const labelClasses = "block text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2 ml-1";

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-8 md:p-12 bg-gradient-to-br from-indigo-50/50 to-white border-b border-slate-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Report AAU Property</h2>
            <p className="text-slate-500 font-medium text-sm">Official documentation for campus assets and verification.</p>
          </div>
        </div>
      </div>

      <form className="p-8 md:p-12 space-y-10" onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          <div className="space-y-8">
            <div>
              <label className={labelClasses}>Modality of Report</label>
              <div className="flex gap-3 p-1.5 bg-slate-100 rounded-[1.25rem] border border-slate-200/50">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: PostType.LOST })}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === PostType.LOST ? 'bg-white text-rose-600 shadow-md ring-1 ring-rose-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Item is Lost
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: PostType.FOUND })}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === PostType.FOUND ? 'bg-white text-emerald-600 shadow-md ring-1 ring-emerald-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Item was Found
                </button>
              </div>
            </div>

            <div>
              <label className={labelClasses}>Descriptive Title</label>
              <input
                required
                type="text"
                placeholder="e.g. AAU Student Identification Card"
                className={inputClasses}
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelClasses}>Verification Details</label>
                <button 
                  type="button" 
                  onClick={handleEnhance}
                  disabled={isEnhancing}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md active:scale-95"
                >
                  <svg className={`w-3 h-3 ${isEnhancing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  {isEnhancing ? 'Synthesizing...' : 'AI Enhance'}
                </button>
              </div>
              <textarea
                required
                rows={5}
                placeholder="Include color, brand, condition, and campus context..."
                className={`${inputClasses} resize-none`}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <label className={labelClasses}>Campus Coordinate / Location</label>
              <input
                required
                type="text"
                placeholder="e.g. Law Faculty Quadrangle, Ekpoma"
                className={inputClasses}
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClasses}>Date of Event</label>
              <input
                required
                type="date"
                className={inputClasses}
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClasses}>Visual Documentation (Optional)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-[2rem] relative overflow-hidden h-52 group transition-all hover:border-indigo-300 hover:bg-indigo-50/10">
                {formData.image ? (
                  <div className="absolute inset-0">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, image: ''})}
                      className="absolute top-4 right-4 bg-rose-500 text-white p-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4 group-hover:text-indigo-400 group-hover:scale-110 transition-all">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <label className="relative cursor-pointer">
                      <span className="text-sm font-black text-indigo-600 hover:text-indigo-700 underline underline-offset-4 uppercase tracking-widest">Select Image</span>
                      <input type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                    </label>
                    <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Maximum file size: 5MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t border-slate-50">
          <button
            type="button"
            onClick={onCancel}
            className="px-10 py-4 text-slate-400 text-xs font-black uppercase tracking-widest hover:text-slate-600 transition-colors"
          >
            Discard
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-12 py-4 bg-slate-900 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </>
            ) : 'Commit to Registry'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;