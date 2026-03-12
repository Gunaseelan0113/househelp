/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { 
  Users, 
  LayoutDashboard, 
  Plus, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar, 
  IndianRupee, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Bell,
  ArrowLeft,
  Trash2,
  Edit2,
  Languages
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, isAfter, isBefore, addDays, startOfMonth, endOfMonth, getDay, getDate, getMonth, getYear } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Worker, Payment, Language, translations } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Layout = ({ children, lang, setLang }: { children: React.ReactNode, lang: Language, setLang: (l: Language) => void }) => {
  const t = translations[lang];
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans pb-20">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10 px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tight text-emerald-800">HouseHelp</h1>
        <button 
          onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 text-sm font-medium hover:bg-stone-200 transition-colors"
        >
          <Languages size={16} />
          {lang === 'en' ? 'தமிழ்' : 'English'}
        </button>
      </header>
      
      <main className="max-w-md mx-auto p-4">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-6 py-3 flex justify-around items-center z-20 max-w-md mx-auto">
        <Link to="/" className="flex flex-col items-center gap-1 text-stone-500 hover:text-emerald-600 transition-colors">
          <LayoutDashboard size={24} />
          <span className="text-[10px] font-medium uppercase tracking-wider">{t.dashboard}</span>
        </Link>
        <Link to="/workers" className="flex flex-col items-center gap-1 text-stone-500 hover:text-emerald-600 transition-colors">
          <Users size={24} />
          <span className="text-[10px] font-medium uppercase tracking-wider">{t.workers}</span>
        </Link>
        <Link to="/add" className="flex flex-col items-center gap-1 -mt-8 bg-emerald-600 text-white p-3 rounded-full shadow-lg hover:bg-emerald-700 transition-transform active:scale-95">
          <Plus size={28} />
        </Link>
        <Link to="/reminders" className="flex flex-col items-center gap-1 text-stone-500 hover:text-emerald-600 transition-colors">
          <Bell size={24} />
          <span className="text-[10px] font-medium uppercase tracking-wider">{t.reminders}</span>
        </Link>
      </nav>
    </div>
  );
};

const Dashboard = ({ lang }: { lang: Language }) => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const t = translations[lang];

  useEffect(() => {
    fetch('/api/workers').then(res => res.json()).then(setWorkers);
    fetch('/api/payments').then(res => res.json()).then(setPayments);
  }, []);

  const stats = useMemo(() => {
    const currentMonth = getMonth(new Date()) + 1;
    const currentYear = getYear(new Date());
    
    const paidThisMonth = payments.filter(p => p.month === currentMonth && p.year === currentYear && p.status === 'paid').length;
    const totalDueThisMonth = workers.length;
    
    return {
      totalWorkers: workers.length,
      paid: paidThisMonth,
      unpaid: totalDueThisMonth - paidThisMonth
    };
  }, [workers, payments]);

  const upcoming = useMemo(() => {
    const today = getDate(new Date());
    return workers
      .filter(w => w.payment_day >= today && w.payment_day <= today + 7)
      .sort((a, b) => a.payment_day - b.payment_day);
  }, [workers]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1">{t.totalWorkers}</p>
          <p className="text-3xl font-bold text-stone-900">{stats.totalWorkers}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1">{t.status}</p>
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-bold">{stats.paid} {t.paid}</span>
            <span className="text-stone-300">|</span>
            <span className="text-rose-500 font-bold">{stats.unpaid} {t.unpaid}</span>
          </div>
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="text-emerald-600" size={20} />
          <h2 className="font-bold text-emerald-900">{t.upcomingPayments}</h2>
        </div>
        <div className="space-y-3">
          {upcoming.length > 0 ? upcoming.map(w => (
            <div key={w.id} className="flex justify-between items-center bg-white/50 p-3 rounded-xl border border-emerald-100">
              <div>
                <p className="font-semibold text-stone-800">{w.name}</p>
                <p className="text-xs text-stone-500">{t.salaryDueSoon} {w.payment_day}</p>
              </div>
              <Link to={`/worker/${w.id}`} className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-full transition-colors">
                <ChevronRight size={20} />
              </Link>
            </div>
          )) : (
            <p className="text-sm text-stone-500 italic">{t.noUpcoming}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-bold text-lg px-1">{t.workers}</h2>
        <div className="space-y-3">
          {workers.slice(0, 3).map(w => (
            <WorkerCard key={w.id} worker={w} lang={lang} />
          ))}
          {workers.length > 3 && (
            <Link to="/workers" className="block text-center py-3 text-sm font-semibold text-emerald-600 hover:text-emerald-700">
              View All Workers
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const WorkerCard: React.FC<{ worker: Worker, lang: Language }> = ({ worker, lang }) => {
  const t = translations[lang];
  return (
    <Link to={`/worker/${worker.id}`} className="block bg-white p-4 rounded-2xl border border-stone-200 shadow-sm hover:border-emerald-200 transition-colors group">
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 font-bold text-xl">
            {worker.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-stone-900 group-hover:text-emerald-700 transition-colors">{worker.name}</h3>
            <p className="text-sm text-stone-500 flex items-center gap-1">
              <Briefcase size={14} />
              {t.roles[worker.role as keyof typeof t.roles] || worker.role}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-emerald-600">₹{worker.salary.toLocaleString()}</p>
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">{t.paymentDay}: {worker.payment_day}</p>
        </div>
      </div>
    </Link>
  );
};

const WorkerList = ({ lang }: { lang: Language }) => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const t = translations[lang];

  useEffect(() => {
    fetch('/api/workers').then(res => res.json()).then(setWorkers);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold">{t.workers}</h2>
        <Link to="/add" className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700">
          <Plus size={20} />
        </Link>
      </div>
      <div className="space-y-3">
        {workers.map(w => (
          <WorkerCard key={w.id} worker={w} lang={lang} />
        ))}
      </div>
    </motion.div>
  );
};

const WorkerForm = ({ lang, mode = 'add' }: { lang: Language, mode?: 'add' | 'edit' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const t = translations[lang];
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    role: 'cleaning',
    joining_date: format(new Date(), 'yyyy-MM-dd'),
    salary: 0,
    payment_day: 1
  });

  useEffect(() => {
    if (mode === 'edit' && id) {
      fetch(`/api/workers`).then(res => res.json()).then(data => {
        const worker = data.find((w: Worker) => w.id === parseInt(id));
        if (worker) setFormData(worker);
      });
    }
  }, [id, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = mode === 'add' ? '/api/workers' : `/api/workers/${id}`;
    const method = mode === 'add' ? 'POST' : 'PUT';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    navigate('/workers');
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-stone-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold">{mode === 'add' ? t.addWorker : t.edit}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div className="space-y-1">
          <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">{t.name}</label>
          <input 
            required
            type="text" 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">{t.phone}</label>
            <input 
              type="tel" 
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">{t.role}</label>
            <select 
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {Object.keys(t.roles).map(role => (
                <option key={role} value={role}>{t.roles[role as keyof typeof t.roles]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">{t.address}</label>
          <textarea 
            value={formData.address}
            onChange={e => setFormData({...formData, address: e.target.value})}
            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">{t.salary}</label>
            <input 
              required
              type="number" 
              value={formData.salary}
              onChange={e => setFormData({...formData, salary: parseFloat(e.target.value)})}
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">{t.paymentDay}</label>
            <input 
              required
              type="number" 
              min="1" max="31"
              value={formData.payment_day}
              onChange={e => setFormData({...formData, payment_day: parseInt(e.target.value)})}
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">{t.joiningDate}</label>
          <input 
            type="date" 
            value={formData.joining_date}
            onChange={e => setFormData({...formData, joining_date: e.target.value})}
            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="pt-4 flex gap-3">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-4 text-stone-500 font-bold hover:bg-stone-100 rounded-2xl transition-colors"
          >
            {t.cancel}
          </button>
          <button 
            type="submit"
            className="flex-[2] py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95"
          >
            {t.save}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

const WorkerProfile = ({ lang }: { lang: Language }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const t = translations[lang];
  const [worker, setWorker] = useState<Worker | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (id) {
      fetch(`/api/workers`).then(res => res.json()).then(data => {
        const w = data.find((item: Worker) => item.id === parseInt(id));
        setWorker(w);
      });
      fetch(`/api/workers/${id}/payments`).then(res => res.json()).then(setPayments);
    }
  }, [id]);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this worker?')) {
      await fetch(`/api/workers/${id}`, { method: 'DELETE' });
      navigate('/workers');
    }
  };

  const markPaid = async () => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    
    // Check if already paid for this month
    const alreadyPaid = payments.find(p => p.month === month && p.year === year && p.status === 'paid');
    if (alreadyPaid) {
      alert('Salary already marked as paid for this month.');
      return;
    }

    await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        worker_id: id,
        month,
        year,
        amount: worker?.salary,
        status: 'paid',
        payment_date: format(today, 'yyyy-MM-dd')
      })
    });
    
    // Refresh payments
    fetch(`/api/workers/${id}/payments`).then(res => res.json()).then(setPayments);
  };

  if (!worker) return <div className="p-10 text-center">Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-stone-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <div className="flex gap-2">
          <Link to={`/edit/${worker.id}`} className="p-2 text-stone-500 hover:bg-stone-100 rounded-full">
            <Edit2 size={20} />
          </Link>
          <button onClick={handleDelete} className="p-2 text-rose-500 hover:bg-rose-50 rounded-full">
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="text-center space-y-2">
        <div className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-700 font-bold text-4xl mx-auto shadow-inner">
          {worker.name.charAt(0)}
        </div>
        <h2 className="text-2xl font-bold text-stone-900">{worker.name}</h2>
        <p className="text-stone-500 font-medium flex items-center justify-center gap-1">
          <Briefcase size={16} />
          {t.roles[worker.role as keyof typeof t.roles] || worker.role}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">{t.salary}</p>
          <p className="text-xl font-bold text-emerald-600">₹{worker.salary.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">{t.paymentDay}</p>
          <p className="text-xl font-bold text-stone-900">{worker.payment_day}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <Phone className="text-stone-400 mt-1" size={18} />
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{t.phone}</p>
            <p className="font-medium">{worker.phone || 'N/A'}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <MapPin className="text-stone-400 mt-1" size={18} />
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{t.address}</p>
            <p className="font-medium">{worker.address || 'N/A'}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Calendar className="text-stone-400 mt-1" size={18} />
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{t.joiningDate}</p>
            <p className="font-medium">{worker.joining_date}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-lg">{t.history}</h3>
          <button 
            onClick={markPaid}
            className="text-xs font-bold bg-emerald-600 text-white px-3 py-1.5 rounded-full hover:bg-emerald-700 transition-colors"
          >
            {t.markAsPaid}
          </button>
        </div>
        
        <div className="space-y-3">
          {payments.length > 0 ? payments.map(p => (
            <div key={p.id} className="bg-white p-4 rounded-2xl border border-stone-200 flex justify-between items-center">
              <div>
                <p className="font-bold text-stone-800">{format(new Date(p.year, p.month - 1), 'MMMM yyyy')}</p>
                <p className="text-xs text-stone-400">{p.payment_date}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-stone-900">₹{p.amount.toLocaleString()}</p>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-1 justify-end">
                  <CheckCircle2 size={10} />
                  {t.paid}
                </span>
              </div>
            </div>
          )) : (
            <p className="text-center text-stone-400 py-4 italic text-sm">No payment history yet</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Reminders = ({ lang }: { lang: Language }) => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const t = translations[lang];

  useEffect(() => {
    fetch('/api/workers').then(res => res.json()).then(setWorkers);
  }, []);

  const today = getDate(new Date());
  
  const dueNow = workers.filter(w => w.payment_day === today);
  const dueSoon = workers.filter(w => w.payment_day > today && w.payment_day <= today + 5);
  const overdue = workers.filter(w => w.payment_day < today);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <h2 className="text-2xl font-bold">{t.reminders}</h2>

      {dueNow.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-rose-600 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
            <Bell size={16} />
            Due Today
          </h3>
          {dueNow.map(w => (
            <Link key={w.id} to={`/worker/${w.id}`} className="block bg-rose-50 border border-rose-100 p-4 rounded-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-rose-900">{w.name}</p>
                  <p className="text-xs text-rose-700">Salary payment due today!</p>
                </div>
                <IndianRupee className="text-rose-400" size={24} />
              </div>
            </Link>
          ))}
        </div>
      )}

      {overdue.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-amber-600 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
            <Bell size={16} />
            Pending / Past Due
          </h3>
          {overdue.map(w => (
            <Link key={w.id} to={`/worker/${w.id}`} className="block bg-amber-50 border border-amber-100 p-4 rounded-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-amber-900">{w.name}</p>
                  <p className="text-xs text-amber-700">Payment date was {w.payment_day}th of the month</p>
                </div>
                <ChevronRight className="text-amber-300" size={20} />
              </div>
            </Link>
          ))}
        </div>
      )}

      {dueSoon.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-emerald-600 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
            <Calendar size={16} />
            Coming Up
          </h3>
          {dueSoon.map(w => (
            <Link key={w.id} to={`/worker/${w.id}`} className="block bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-emerald-900">{w.name}</p>
                  <p className="text-xs text-emerald-700">Due in {w.payment_day - today} days (Date: {w.payment_day})</p>
                </div>
                <ChevronRight className="text-emerald-300" size={20} />
              </div>
            </Link>
          ))}
        </div>
      )}

      {dueNow.length === 0 && dueSoon.length === 0 && (
        <div className="text-center py-20 space-y-4">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-300">
            <CheckCircle2 size={40} />
          </div>
          <p className="text-stone-500 font-medium">{t.noUpcoming}</p>
        </div>
      )}
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [lang, setLang] = useState<Language>('en');

  return (
    <Router>
      <Layout lang={lang} setLang={setLang}>
        <Routes>
          <Route path="/" element={<Dashboard lang={lang} />} />
          <Route path="/workers" element={<WorkerList lang={lang} />} />
          <Route path="/add" element={<WorkerForm lang={lang} mode="add" />} />
          <Route path="/edit/:id" element={<WorkerForm lang={lang} mode="edit" />} />
          <Route path="/worker/:id" element={<WorkerProfile lang={lang} />} />
          <Route path="/reminders" element={<Reminders lang={lang} />} />
        </Routes>
      </Layout>
    </Router>
  );
}
