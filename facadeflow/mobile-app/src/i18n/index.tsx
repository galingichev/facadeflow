import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type AppLanguage = 'en' | 'bg';

type LanguageOption = {
  code: AppLanguage;
  label: string;
  nativeLabel: string;
};

type I18nContextValue = {
  language: AppLanguage;
  languages: LanguageOption[];
  setLanguage: (language: AppLanguage) => Promise<void>;
  t: (text: string) => string;
};

const STORAGE_KEY = 'facadeflow.language';

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'bg', label: 'Bulgarian', nativeLabel: 'Български' },
];

let activeLanguage: AppLanguage = 'en';

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
    'The app language is now Bulgarian.': 'Езикът на приложението вече е български.',
    'The app language is now English.': 'Езикът на приложението вече е английски.',
    'OK': 'ОК',
    'Cancel': 'Отказ',
    'Delete': 'Изтрий',
    'Search...': 'Търсене...',
    'No results found': 'Няма резултати',
    'Select an option': 'Изберете опция',
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
  },
};

const I18nContext = createContext<I18nContextValue | null>(null);

function translate(text: string, language = activeLanguage) {
  return translations[language][text] || text;
}

async function readStoredLanguage(): Promise<AppLanguage> {
  try {
    if (Platform.OS === 'web') {
      const stored = globalThis.localStorage?.getItem(STORAGE_KEY) as AppLanguage | null;
      return stored === 'bg' || stored === 'en' ? stored : 'en';
    }

    const stored = await SecureStore.getItemAsync(STORAGE_KEY);
    return stored === 'bg' || stored === 'en' ? stored : 'en';
  } catch {
    return 'en';
  }
}

async function writeStoredLanguage(language: AppLanguage) {
  try {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(STORAGE_KEY, language);
      return;
    }

    await SecureStore.setItemAsync(STORAGE_KEY, language);
  } catch {
    // Language still changes for the current session if persistence fails.
  }
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>('en');

  useEffect(() => {
    readStoredLanguage().then((stored) => {
      activeLanguage = stored;
      setLanguageState(stored);
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
    t: (text: string) => translate(text, language),
  }), [language]);

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
