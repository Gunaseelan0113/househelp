export interface Worker {
  id: number;
  name: string;
  phone: string;
  address: string;
  role: string;
  joining_date: string;
  salary: number;
  payment_day: number;
}

export interface Payment {
  id: number;
  worker_id: number;
  worker_name?: string;
  month: number;
  year: number;
  amount: number;
  status: 'paid' | 'unpaid';
  payment_date?: string;
}

export type Language = 'en' | 'ta';

export const translations = {
  en: {
    dashboard: 'Dashboard',
    workers: 'Workers',
    addWorker: 'Add Worker',
    totalWorkers: 'Total Workers',
    upcomingPayments: 'Upcoming Payments',
    paid: 'Paid',
    unpaid: 'Unpaid',
    name: 'Name',
    phone: 'Phone Number',
    address: 'Address',
    role: 'Role',
    joiningDate: 'Joining Date',
    salary: 'Monthly Salary',
    paymentDay: 'Payment Day of Month',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    profile: 'Profile',
    history: 'Payment History',
    markAsPaid: 'Mark as Paid',
    status: 'Status',
    amount: 'Amount',
    date: 'Date',
    reminders: 'Reminders',
    salaryDueSoon: 'Salary due soon for',
    noUpcoming: 'No upcoming payments this week',
    roles: {
      cook: 'Cook',
      cleaning: 'Cleaning',
      driver: 'Driver',
      security: 'Security',
      gardener: 'Gardener',
      other: 'Other'
    }
  },
  ta: {
    dashboard: 'டாஷ்போர்டு',
    workers: 'பணியாளர்கள்',
    addWorker: 'பணியாளரைச் சேர்',
    totalWorkers: 'மொத்த பணியாளர்கள்',
    upcomingPayments: 'வரவிருக்கும் கொடுப்பனவுகள்',
    paid: 'செலுத்தப்பட்டது',
    unpaid: 'செலுத்தப்படவில்லை',
    name: 'பெயர்',
    phone: 'தொலைபேசி எண்',
    address: 'முகவரி',
    role: 'பணி',
    joiningDate: 'சேர்ந்த தேதி',
    salary: 'மாதச் சம்பளம்',
    paymentDay: 'சம்பளத் தேதி',
    save: 'சேமி',
    cancel: 'ரத்து செய்',
    edit: 'திருத்து',
    delete: 'நீக்கு',
    profile: 'சுயவிவரம்',
    history: 'கொடுப்பனவு வரலாறு',
    markAsPaid: 'செலுத்தப்பட்டதாகக் குறிக்கவும்',
    status: 'நிலை',
    amount: 'தொகை',
    date: 'தேதி',
    reminders: 'நினைவூட்டல்கள்',
    salaryDueSoon: 'சம்பளம் விரைவில் வழங்கப்பட வேண்டும்:',
    noUpcoming: 'இந்த வாரம் வரவிருக்கும் கொடுப்பனவுகள் இல்லை',
    roles: {
      cook: 'சமையல்காரர்',
      cleaning: 'சுத்தம் செய்தல்',
      driver: 'ஓட்டுநர்',
      security: 'பாதுகாப்பு',
      gardener: 'தோட்டக்காரர்',
      other: 'மற்றவை'
    }
  }
};
