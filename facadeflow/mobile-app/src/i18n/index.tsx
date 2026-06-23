import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type AppLanguage = 'en' | 'bg';
export type AppCurrency = 'USD' | 'EUR' | 'BGN';

type LanguageOption = {
  code: AppLanguage;
  label: string;
  nativeLabel: string;
};

type CurrencyOption = {
  code: AppCurrency;
  label: string;
  nativeLabel: string;
  symbol: string;
};

type I18nContextValue = {
  language: AppLanguage;
  languages: LanguageOption[];
  setLanguage: (language: AppLanguage) => Promise<void>;
  currency: AppCurrency;
  currencies: CurrencyOption[];
  setCurrency: (currency: AppCurrency) => Promise<void>;
  t: (text: string) => string;
};

const LANGUAGE_STORAGE_KEY = 'facadeflow.language';
const CURRENCY_STORAGE_KEY = 'facadeflow.currency';

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'bg', label: 'Bulgarian', nativeLabel: 'Български' },
];

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: 'USD', label: 'US Dollar', nativeLabel: 'Щатски долар', symbol: '$' },
  { code: 'EUR', label: 'Euro', nativeLabel: 'Евро', symbol: '€' },
  { code: 'BGN', label: 'Bulgarian Lev', nativeLabel: 'Български лев', symbol: 'лв.' },
];

let activeLanguage: AppLanguage = 'en';
let activeCurrency: AppCurrency = 'USD';

const translations: Record<AppLanguage, Record<string, string>> = {
  en: {},
  bg: {
    'FacadeFlow Demo': 'FacadeFlow демо',
    'Client Demo': 'Клиентско демо',
    'Dashboard': 'Табло',
    'Projects': 'Проекти',
    'Clients': 'Клиенти',
    'Language': 'Език',
    'Choose language': 'Избор на език',
    'App language': 'Език на приложението',
    'Language changed': 'Езикът е сменен',
    'Currency': 'Валута',
    'Choose currency': 'Избор на валута',
    'Display currency': 'Валута за показване',
    'Currency changed': 'Валутата е сменена',
    'US Dollar': 'Щатски долар',
    'Euro': 'Евро',
    'Bulgarian Lev': 'Български лев',
    'The app language is now Bulgarian.': 'Езикът на приложението вече е български.',
    'The app language is now English.': 'Езикът на приложението вече е английски.',
    'OK': 'ОК',
    'Cancel': 'Отказ',
    'Delete': 'Изтрий',
    'Search...': 'Търсене...',
    'No results found': 'Няма резултати',
    'Select an option': 'Изберете опция',
    'Select a client': 'Изберете клиент',
    'Failed to fetch summary': 'Неуспешно зареждане на обобщението',
    'Failed to fetch projects': 'Неуспешно зареждане на проектите',
    'Unknown error': 'Неизвестна грешка',
    'New Project': 'Нов проект',
    'View Projects': 'Виж проекти',
    'Add Client': 'Добави клиент',
    'Run facade, window and door jobs with profit visible from day one.': 'Управлявайте фасадни, прозоречни и врати проекти с видима печалба от първия ден.',
    'FacadeFlow turns scattered client notes, budgets and expenses into a clean operating dashboard for contractors who need every project to stay on margin.': 'FacadeFlow превръща разпилени клиентски бележки, бюджети и разходи в ясно табло за изпълнители, които трябва да държат всеки проект на марж.',
    'Client demo storyline': 'Сценарий за клиентско демо',
    'Show the owner how a job moves from quote to expenses to profit report.': 'Покажете на собственика как проектът минава от оферта към разходи и отчет за печалба.',
    'Client and project created': 'Създадени клиент и проект',
    'Budget and contract recorded': 'Въведени бюджет и договор',
    'Expenses tracked by category': 'Разходи по категории',
    'At-risk jobs highlighted': 'Рисковите проекти са подчертани',
    'One-page profit report preview': 'Преглед на едностраничен отчет',
    'Contract value': 'Стойност по договор',
    'Budgeted cost': 'Бюджетирана себестойност',
    'Actual cost': 'Реална себестойност',
    'Actual profit': 'Реална печалба',
    'profitable projects': 'печеливши проекта',
    'loss projects': 'проекта на загуба',
    'expenses': 'разхода',
    'of': 'от',
    'Owner briefing': 'Кратък отчет за собственика',
    'What needs attention before the next site or client call.': 'Какво изисква внимание преди следващия обект или клиентски разговор.',
    'Profit Snapshot': 'Преглед на печалбата',
    'Dashboard summary: the client can understand portfolio health in under one minute.': 'Обобщение на таблото: клиентът разбира състоянието на проектите за под минута.',
    'Portfolio margin': 'Марж на портфолиото',
    'Projects with financials': 'Проекти с финанси',
    'Active projects': 'Активни проекти',
    'Revenue pipeline': 'Потенциален оборот',
    'At-risk projects': 'Рискови проекти',
    'Highlights jobs that need a quick owner decision.': 'Показва проекти, които искат бързо решение от собственика.',
    'No major margin or status risk in the current demo data.': 'Няма сериозен риск по марж или статус в текущите демо данни.',
    'High risk': 'Висок риск',
    'Watch': 'Наблюдение',
    'Recent expenses': 'Последни разходи',
    'The live feed that explains why profit changed.': 'Живият поток, който обяснява защо печалбата се промени.',
    'No expenses recorded yet.': 'Все още няма записани разходи.',
    'Report preview': 'Преглед на отчет',
    'Client-facing snapshot with the next financial action.': 'Клиентски преглед със следващото финансово действие.',
    'FacadeFlow Project Report': 'FacadeFlow отчет за проект',
    'Profit / margin': 'Печалба / марж',
    'Notes / next action: verify latest site costs, then send the owner-ready progress claim.': 'Бележки / следващо действие: проверете последните разходи по обекта, после изпратете готовия отчет.',
    'Active demo projects': 'Активни демо проекти',
    'Realistic sample work for client discussion.': 'Реалистични примерни проекти за клиентски разговор.',
    'Ready for a client walkthrough': 'Готово за клиентска демонстрация',
    'Use the demo data only. Show dashboard → at-risk project → expenses → report preview.': 'Използвайте само демо данните. Покажете табло → рисков проект → разходи → преглед на отчет.',
    'Contract': 'Договор',
    'Budget': 'Бюджет',
    'Budget vs actual': 'Бюджет срещу реално',
    'Last expense': 'Последен разход',
    'No expenses yet': 'Все още няма разходи',
    'No client': 'Няма клиент',
    'Demo portfolio': 'Демо портфолио',
    'Demo client': 'Демо клиент',
    'Job Health': 'Състояние на проекта',
    'Payment readiness': 'Готовност за плащане',
    'Recent cost movement': 'Последно движение на разходите',
    'Next owner decision': 'Следващо решение на собственика',
    'All active demo jobs look controlled.': 'Всички активни демо проекти изглеждат под контрол.',
    'No progress claim is ready yet.': 'Все още няма готов акт/искане за плащане.',
    'Projects that show profit, cost and progress.': 'Проекти, които показват печалба, разход и прогрес.',
    'Every facade job stays connected to its client, budget, expenses and live profitability.': 'Всеки фасаден проект остава свързан с клиент, бюджет, разходи и текуща печалба.',
    'Project pipeline': 'Проектна фуния',
    'demo projects loaded': 'демо проекта заредени',
    'No projects yet': 'Все още няма проекти',
    'progress': 'прогрес',
    'Ready for progress claim': 'Готов за акт/плащане',
    'Lead / Inquiry': 'Запитване',
    'Survey / Measurement': 'Оглед / мерки',
    'Quote Sent': 'Изпратена оферта',
    'Approved / Ordered': 'Одобрен / поръчан',
    'Fabrication / Installation': 'Производство / монтаж',
    'Waiting / On Hold': 'Изчакване / на пауза',
    'Handover Complete': 'Предаден',
    'Cancelled': 'Отказан',
    'Controlled': 'Под контрол',
    'Low margin': 'Нисък марж',
    'Over budget': 'Над бюджет',
    'Healthy': 'Здравословен',
    'Missing budget': 'Липсва бюджет',
    'Completed but unprofitable': 'Завършен, но непечеливш',
    'Check costs before invoicing': 'Проверете разходите преди фактуриране',
    'Ready for final invoice': 'Готов за финална фактура',
    'Review after quote approval': 'Преглед след одобрение на офертата',
    'Add budget to see margin risk.': 'Добавете бюджет, за да видите риска за маржа.',
    'Approved job has no costs recorded.': 'Одобреният проект няма записани разходи.',
    'Finished job closed below zero profit.': 'Завършеният проект е приключил под нулева печалба.',
    'Actual cost is above budget.': 'Реалната себестойност е над бюджета.',
    'Margin is below the demo target.': 'Маржът е под демо целта.',
    'Status needs owner follow-up.': 'Статусът изисква проследяване от собственика.',
    'Budget, costs and margin are under control.': 'Бюджетът, разходите и маржът са под контрол.',
    'Paused or cancelled status needs attention.': 'Проект на пауза или отказан проект изисква внимание.',
    'Owner review needed': 'Нужен е преглед от собственика',
    'project needs owner review.': 'проект се нуждае от преглед от собственика.',
    'projects need owner review.': 'проекта се нуждаят от преглед от собственика.',
    'job ready for progress claim.': 'проект е готов за акт/плащане.',
    'jobs ready for progress claim.': 'проекта са готови за акт/плащане.',
    'in latest recorded facade expenses.': 'в последните записани фасадни разходи.',
    'active project can continue as planned.': 'активен проект може да продължи по план.',
    'active projects can continue as planned.': 'активни проекта могат да продължат по план.',
    'over budget.': 'над бюджета.',
    'Margin at': 'Марж',
    'review pricing or expenses.': 'прегледайте цените или разходите.',
    'Clients, companies and project relationships in one place.': 'Клиенти, компании и проектни връзки на едно място.',
    'A cleaner client list helps the demo story start with the customer, then move into projects, expenses and profit.': 'Ясният списък с клиенти започва историята от клиента, после преминава към проекти, разходи и печалба.',
    'Client CRM': 'Клиентски CRM',
    'Linked projects': 'Свързани проекти',
    'project(s) connected to this client': 'проект(а), свързани с този клиент',
    'Client list': 'Списък с клиенти',
    'Search by person, company or email.': 'Търсене по човек, компания или имейл.',
    'Search clients...': 'Търси клиенти...',
    'No clients found': 'Няма намерени клиенти',
    'No email': 'Няма имейл',
    'Ready for project follow-up': 'Готов за проектно проследяване',
    'Confirm Client Delete': 'Потвърди изтриване на клиент',
    'Error': 'Грешка',
    'Retry': 'Опитай пак',
    'Loading dashboard': 'Зареждане на таблото',
    'Preparing the FacadeFlow client demo workspace.': 'Подготовка на FacadeFlow демо средата.',
    'Loading dashboard...': 'Зареждане на таблото...',
    'Dashboard unavailable': 'Таблото не е достъпно',
    'The demo backend did not respond.': 'Демо сървърът не отговори.',
    'Project not found': 'Проектът не е намерен',
    'This project may have been deleted or is no longer available.': 'Проектът може да е изтрит или вече да не е достъпен.',
    'Back to Projects': 'Назад към проекти',
    'Failed to delete project': 'Неуспешно изтриване на проекта',
    'Are you sure you want to delete this project?': 'Сигурни ли сте, че искате да изтриете този проект?',
    'Delete Project': 'Изтрий проект',
    'Delete expense': 'Изтрий разход',
    'Edit': 'Редактирай',
    'Overview': 'Преглед',
    'Profit': 'Печалба',
    'Expenses': 'Разходи',
    'Report Preview': 'Преглед на отчет',
    'Project Control Room': 'Контролна стая на проекта',
    'Project profit detail view for the client demo: contract value, budget, expenses, current margin and owner-ready report.': 'Детайлен изглед за печалбата: договор, бюджет, разходи, текущ марж и готов отчет за собственика.',
    'Profit detail view': 'Детайлен преглед на печалбата',
    'A simple explanation of whether this job is still on plan.': 'Кратко обяснение дали проектът още върви по план.',
    'Current margin': 'Текущ марж',
    'Contract value minus actual expenses. Budget variance updates as expenses are recorded.': 'Договорната стойност минус реалните разходи. Отклонението от бюджета се обновява при записване на разходи.',
    'This project is currently losing money.': 'Този проект в момента е на загуба.',
    'Profit is positive, but spending is above budget.': 'Печалбата е положителна, но разходите са над бюджета.',
    'This project is currently profitable and inside the demo control range.': 'Този проект е печеливш и в контролния диапазон на демото.',
    'Client': 'Клиент',
    'N/A': 'Няма данни',
    'Status': 'Статус',
    'Start Date': 'Начална дата',
    'End Date': 'Крайна дата',
    'Expense Count': 'Брой разходи',
    'Cost Variance': 'Отклонение от бюджета',
    'Created': 'Създаден',
    'Last Updated': 'Последно обновен',
    'Description': 'Описание',
    'Record costs and immediately show the client how profit changes.': 'Записвайте разходи и веднага показвайте на клиента как се променя печалбата.',
    'Actual Cost': 'Реална себестойност',
    'Actual Profit': 'Реална печалба',
    'Category': 'Категория',
    'Amount': 'Сума',
    'e.g. Aluminium profiles': 'напр. алуминиеви профили',
    'Vendor': 'Доставчик',
    'Optional': 'По избор',
    'Expense Date': 'Дата на разхода',
    'Add Expense': 'Добави разход',
    'Materials': 'Материали',
    'Labor': 'Труд',
    'Subcontractor': 'Подизпълнител',
    'Equipment': 'Оборудване',
    'Transport': 'Транспорт',
    'Permits': 'Разрешителни',
    'Overhead': 'Общи разходи',
    'Other': 'Други',
    'Recorded Expenses': 'Записани разходи',
    'Delete Expense': 'Изтрий разход',
    'Delete this expense?': 'Да се изтрие ли този разход?',
    'Expense description is required': 'Описание на разхода е задължително',
    'Amount is required and must be greater than 0.': 'Сумата е задължителна и трябва да е по-голяма от 0.',
    'Expense date is required': 'Дата на разхода е задължителна',
    'Failed to fetch project expenses': 'Неуспешно зареждане на разходите',
    'Failed to create project expense': 'Неуспешно създаване на разход',
    'Failed to delete project expense': 'Неуспешно изтриване на разход',
    'Brand-polished one-page PDF/report style for the client conversation.': 'Изчистен едностраничен отчет за клиентски разговор.',
    'Project Profit Report': 'Отчет за печалба по проект',
    'Owner summary': 'Обобщение за собственика',
    'This preview is designed to become the printable report/PDF styling in Phase 3.': 'Този преглед е основа за печатен отчет/PDF във Фаза 3.',
    'Project Name': 'Име на проекта',
    'Enter project name': 'Въведете име на проекта',
    'Create Project': 'Създай проект',
    'Select status': 'Изберете статус',
    'Contract Value': 'Стойност по договор',
    'Budgeted Cost': 'Бюджетирана себестойност',
    'Total payable by client': 'Обща сума за плащане от клиента',
    'Expected spend to complete': 'Очаквани разходи до завършване',
    'Draft': 'Чернова',
    'Inquired': 'Запитване',
    'Quoted': 'Офериран',
    'Approved': 'Одобрен',
    'In Progress': 'В процес',
    'On Hold': 'На пауза',
    'Completed': 'Завършен',
    'Project name is required.': 'Името на проекта е задължително.',
    'Client is required.': 'Клиентът е задължителен.',
    'Contract value must be a valid number.': 'Стойността по договор трябва да е валидно число.',
    'Budgeted cost must be a valid number.': 'Бюджетираната себестойност трябва да е валидно число.',
    'Start date must use YYYY-MM-DD format.': 'Началната дата трябва да е във формат YYYY-MM-DD.',
    'End date must use YYYY-MM-DD format.': 'Крайната дата трябва да е във формат YYYY-MM-DD.',
    'Project created. Opening project detail...': 'Проектът е създаден. Отваря се детайлният изглед...',
    'Failed to create project.': 'Неуспешно създаване на проект.',
    'Creating...': 'Създаване...',
    'Expense added. Project totals updated.': 'Разходът е добавен. Сумите по проекта са обновени.',
  },
};

const I18nContext = createContext<I18nContextValue | null>(null);

function translate(text: string, language = activeLanguage) {
  return translations[language][text] || text;
}

async function readStoredLanguage(): Promise<AppLanguage> {
  try {
    if (Platform.OS === 'web') {
      const stored = globalThis.localStorage?.getItem(LANGUAGE_STORAGE_KEY) as AppLanguage | null;
      return stored === 'bg' || stored === 'en' ? stored : 'en';
    }

    const stored = await SecureStore.getItemAsync(LANGUAGE_STORAGE_KEY);
    return stored === 'bg' || stored === 'en' ? stored : 'en';
  } catch {
    return 'en';
  }
}

async function readStoredCurrency(): Promise<AppCurrency> {
  try {
    if (Platform.OS === 'web') {
      const stored = globalThis.localStorage?.getItem(CURRENCY_STORAGE_KEY) as AppCurrency | null;
      return isAppCurrency(stored) ? stored : 'USD';
    }

    const stored = await SecureStore.getItemAsync(CURRENCY_STORAGE_KEY);
    return isAppCurrency(stored) ? stored : 'USD';
  } catch {
    return 'USD';
  }
}

async function writeStoredLanguage(language: AppLanguage) {
  try {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(LANGUAGE_STORAGE_KEY, language);
      return;
    }

    await SecureStore.setItemAsync(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Language still changes for the current session if persistence fails.
  }
}

async function writeStoredCurrency(currency: AppCurrency) {
  try {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(CURRENCY_STORAGE_KEY, currency);
      return;
    }

    await SecureStore.setItemAsync(CURRENCY_STORAGE_KEY, currency);
  } catch {
    // Currency still changes for the current session if persistence fails.
  }
}

function isAppCurrency(value: unknown): value is AppCurrency {
  return value === 'USD' || value === 'EUR' || value === 'BGN';
}

export function getActiveLanguage() {
  return activeLanguage;
}

export function getActiveCurrency() {
  return activeCurrency;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>('en');
  const [currency, setCurrencyState] = useState<AppCurrency>('USD');

  useEffect(() => {
    Promise.all([readStoredLanguage(), readStoredCurrency()]).then(([storedLanguage, storedCurrency]) => {
      activeLanguage = storedLanguage;
      activeCurrency = storedCurrency;
      setLanguageState(storedLanguage);
      setCurrencyState(storedCurrency);
    });
  }, []);

  const value = useMemo<I18nContextValue>(() => ({
    language,
    languages: LANGUAGE_OPTIONS,
    setLanguage: async (nextLanguage: AppLanguage) => {
      activeLanguage = nextLanguage;
      setLanguageState(nextLanguage);
      await writeStoredLanguage(nextLanguage);
    },
    currency,
    currencies: CURRENCY_OPTIONS,
    setCurrency: async (nextCurrency: AppCurrency) => {
      activeCurrency = nextCurrency;
      setCurrencyState(nextCurrency);
      await writeStoredCurrency(nextCurrency);
    },
    t: (text: string) => translate(text, language),
  }), [currency, language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used inside I18nProvider');
  }
  return context;
}

export function translateInstant(text: string) {
  return translate(text);
}
