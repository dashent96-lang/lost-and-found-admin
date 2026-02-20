
import React from 'react';

interface AboutPageProps {
  onGetStarted: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onGetStarted }) => {
  const steps = [
    {
      title: "1. Log your Item",
      description: "Lost or found property on the AAU campus? Use our AI-enhanced form to provide clear details for the administration.",
      icon: (
        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    {
      title: "2. Official Review",
      description: "The AAU Security & Property Office reviews every entry to prevent spam and ensure the accuracy of the registry.",
      icon: (
        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: "3. Search Registry",
      description: "Browse verified items by category or location (e.g., Faculty of Arts, Library, Main Gate) to find what belongs to you.",
      icon: (
        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      title: "4. Secure Recovery",
      description: "Chat directly with the AAU administration to verify ownership and coordinate a safe pickup from the campus office.",
      icon: (
        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    }
  ];

  return (
    <div className="space-y-16 py-8">
      <section className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
          Recovering Ambrose Alli University <br />
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Property Together.</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          UniFound is the official AAU platform dedicated to reconnecting students and staff with their lost items on the Ekpoma campus.
        </p>
        <button 
          onClick={onGetStarted}
          className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
        >
          Get Started
        </button>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-indigo-50 rounded-xl flex items-center justify-center">
              {step.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
          </div>
        ))}
      </section>

      <section className="bg-white rounded-3xl border border-slate-100 p-8 md:p-12 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-bold text-slate-900">AAU Policy & Benefits</h2>
            <ul className="space-y-4">
              {[
                "Official @aauekpoma.edu.ng Email Login",
                "Centralized review by AAU Property Officers",
                "Secure coordination for item returns",
                "AI Assistance for clear reporting"
              ].map((benefit, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                  <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1">
            <div className="bg-indigo-600 rounded-2xl p-8 text-white">
              <h4 className="text-xl font-bold mb-4">Dedicated to Ekpoma</h4>
              <p className="text-indigo-100 leading-relaxed italic">
                "Our mission is to foster a culture of honesty and care within Ambrose Alli University by providing a modern tool for property recovery."
              </p>
              <p className="mt-4 text-sm font-bold opacity-80">— AAU Administration Office</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
