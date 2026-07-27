import { getActiveLanguage } from '../i18n';

const canonicalBulgarian: Record<string, string> = {
  // Demo clients
  'Elena Petrova Residence': 'Домът на Елена Петрова',
  'Vitosha Office Park': 'Офис парк „Витоша“',
  'Studio Archline': 'Студио „Архлайн“',

  // Demo projects
  'Boyana Villa Curtain Wall': 'Окачена фасада на вила в Бояна',
  'Sofia Office Curtain Wall': 'Окачена фасада на офис в София',
  'Varna Residential Windows': 'Прозорци за жилищен обект във Варна',
  'Plovdiv Hotel Rainscreen': 'Вентилируема фасада на хотел в Пловдив',
  'Burgas Aluminium Door Package': 'Алуминиеви врати за обект в Бургас',

  // Canonical demo expenses
  'Aluminium composite panels deposit': 'Аванс за алуминиеви композитни панели',
  'Installation crew week 1': 'Монтажна бригада – седмица 1',
  'Scaffold and panel delivery': 'Доставка на скеле и панели',
  'Triple-glazed window package': 'Комплект прозорци с троен стъклопакет',
  'Final installation and sealing': 'Финален монтаж и уплътняване',
  'Low-E glass units deposit': 'Аванс за нискоемисионни стъклопакети',
  'Lift rental for second-floor installation': 'Наем на вишка за монтаж на втория етаж',

  // Generic demo vendor names
  'Facade Team 1': 'Фасадна бригада 1',
  'Facade Team 2': 'Фасадна бригада 2',
  'Varna Lift Hire': 'Вишки под наем – Варна',
};

const DEMO_PREFIX = 'Client Demo: ';
const BULGARIAN_DEMO_PREFIX = 'Клиентско демо: ';

/** Translate canonical seed data for display without mutating API records. */
export function translateCanonical(text: string | null | undefined): string {
  if (!text) return '';
  if (getActiveLanguage() !== 'bg') return text;

  if (text.startsWith(DEMO_PREFIX)) {
    const canonicalText = text.slice(DEMO_PREFIX.length);
    return `${BULGARIAN_DEMO_PREFIX}${canonicalBulgarian[canonicalText] || canonicalText}`;
  }

  return canonicalBulgarian[text] || text;
}
