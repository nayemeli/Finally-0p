export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export const TRANSLATIONS = {
  en: {
    title: 'HISAB.IO',
    subtitle: 'Personal Expense Architecture',
    totalBalance: 'Total Balance',
    income: 'Income',
    expense: 'Expense',
    settings: 'Settings',
    theme: 'Theme',
    currency: 'Currency',
    appearance: 'Appearance',
    dark: 'Dark',
    light: 'Light',
    language: 'Language',
    close: 'Close',
    edit: 'Edit',
    update: 'Update',
    day: 'Day',
    week: 'Week',
    month: 'Month',
    year: 'Year',
    newEntry: 'New Entry',
    flowLog: 'Flow Log',
    summary: 'Summary',
    entry: 'Entry',
    history: 'History',
    amount: 'Amount',
    category: 'Category',
    date: 'Date',
    notes: 'Notes',
    search: 'Search transactions...',
    save: 'Post Transaction',
    processing: 'Processing...',
    recentIncome: 'Income (আয়)',
    recentExpense: 'Expenses (ব্যয়)',
    noData: 'No Records Found',
    placeholder: 'Amount 0.00',
    export: 'Export CSV',
    additionalOp: 'Additional Op',
    dashboardShort: 'Dash',
    addShort: 'Post',
    historyShort: 'Logs',
    refreshing: 'Refreshing Data...',
    pullToRefresh: 'Pull to refresh'
  },
  bn: {
    title: 'হিসাব.আইও',
    subtitle: 'ব্যক্তিগত খরচের আর্কিটেকচার',
    totalBalance: 'মোট ব্যালেন্স',
    income: 'আয়',
    expense: 'ব্যয়',
    settings: 'সেটিংস',
    theme: 'থিম',
    currency: 'মুদ্রা',
    appearance: 'চেহারা',
    dark: 'ডার্ক',
    light: 'লাইট',
    language: 'ভাষা',
    close: 'বন্ধ করুন',
    edit: 'সম্পাদনা',
    update: 'হিসাব আপডেট করুন',
    day: 'দিন',
    week: 'সপ্তাহ',
    month: 'মাস',
    year: 'বছর',
    newEntry: 'নতুন হিসাব',
    flowLog: 'হিসাব তালিকা',
    summary: 'সারাংশ',
    entry: 'ইনপুট',
    history: 'ইতিহাস',
    amount: 'পরিমাণ',
    category: 'বিভাগ',
    date: 'তারিখ',
    notes: 'নোট',
    search: 'হিসাব খুঁজুন...',
    save: 'সেভ করুন',
    processing: 'প্রসেসিং...',
    recentIncome: 'আয় সমূহ',
    recentExpense: 'ব্যয় সমূহ',
    noData: 'কোনো তথ্য পাওয়া যায়নি',
    placeholder: 'পরিমাণ ০.০০',
    export: 'এক্সপোর্ট করুন',
    additionalOp: 'অতিরিক্ত অপশন',
    dashboardShort: 'ড্যাশ',
    addShort: 'পোস্ট',
    historyShort: 'লগ',
    refreshing: 'রিফ্রেশ হচ্ছে...',
    pullToRefresh: 'রিফ্রেশ করতে নিচে টানুন',
    quickPost: 'কুইক পোস্ট'
  }
};

export const PUBLIC_USER_ID = 'public-user-v1';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  note: string;
  userId: string;
  createdAt: any;
}

export const CATEGORIES = {
  [TransactionType.INCOME]: [
    'Salary (বেতন)',
    'Business (ব্যবসা)',
    'Freelancing (ফ্রিল্যান্সিং)',
    'Gift (উপহার)',
    'Others (অন্যান্য)'
  ],
  [TransactionType.EXPENSE]: [
    'Food (খাবার)',
    'Rent (ভাড়া)',
    'Transport (যাতায়াত)',
    'Shopping (কেনাকাটা)',
    'Health (স্বাস্থ্য)',
    'Education (শিক্ষা)',
    'Utilities (ইউটিলিটি)',
    'Others (অন্যান্য)'
  ]
};
