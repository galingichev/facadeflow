import type { Project, ProjectExpense } from '../types';

export type InsightTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

export type JobHealth = {
  label: string;
  tone: InsightTone;
  reason: string;
};

export const getIndustryStageLabel = (status: string): string => {
  const labels: Record<string, string> = {
    draft: 'Lead / Inquiry',
    inquired: 'Survey / Measurement',
    quoted: 'Quote Sent',
    approved: 'Approved / Ordered',
    in_progress: 'Fabrication / Installation',
    on_hold: 'Waiting / On Hold',
    completed: 'Handover Complete',
    cancelled: 'Cancelled',
  };
  return labels[status] || status;
};

export const getJobHealth = (project: Project): JobHealth => {
  const financials = project.financials;
  const budget = financials?.budgeted_cost ?? project.budget ?? null;
  const contract = financials?.contract_value ?? project.contract_value ?? null;
  const actualCost = financials?.actual_cost ?? 0;
  const expenseCount = financials?.expense_count ?? project.expenses?.length ?? 0;
  const actualProfit = financials?.actual_profit ?? (contract == null ? null : contract - actualCost);
  const margin = financials?.actual_margin ?? (actualProfit == null || contract == null || contract <= 0 ? null : actualProfit / contract);
  const variance = financials?.cost_variance ?? (budget == null ? null : budget - actualCost);

  if (budget == null || budget <= 0) {
    return { label: 'Missing budget', tone: 'warning', reason: 'Add budget to see margin risk.' };
  }
  if (expenseCount === 0 && project.status !== 'draft' && project.status !== 'inquired' && project.status !== 'quoted') {
    return { label: 'No expenses yet', tone: 'info', reason: 'Approved job has no costs recorded.' };
  }
  if (project.status === 'completed' && actualProfit != null && actualProfit < 0) {
    return { label: 'Completed but unprofitable', tone: 'danger', reason: 'Finished job closed below zero profit.' };
  }
  if (variance != null && variance < 0) {
    return { label: 'Over budget', tone: 'danger', reason: 'Actual cost is above budget.' };
  }
  if (margin != null && margin < 0.18) {
    return { label: 'Low margin', tone: 'warning', reason: 'Margin is below the demo target.' };
  }
  if (project.status === 'on_hold' || project.status === 'cancelled') {
    return { label: 'Watch', tone: 'warning', reason: 'Status needs owner follow-up.' };
  }
  return { label: 'Healthy', tone: 'success', reason: 'Budget, costs and margin are under control.' };
};

export const getPaymentReadiness = (project: Project): { label: string; tone: InsightTone } => {
  const health = getJobHealth(project);
  if (health.label === 'Missing budget') return { label: 'Missing budget', tone: 'warning' };
  if (health.tone === 'danger' || health.label === 'Low margin') return { label: 'Check costs before invoicing', tone: 'warning' };
  if (project.status === 'completed') return { label: 'Ready for final invoice', tone: 'success' };
  if (project.status === 'in_progress' || project.status === 'approved') return { label: 'Ready for progress claim', tone: 'success' };
  return { label: 'Review after quote approval', tone: 'info' };
};

export const getBudgetActualPercent = (project: Project): number => {
  const budget = project.financials?.budgeted_cost ?? project.budget ?? null;
  const actualCost = project.financials?.actual_cost ?? 0;
  if (budget == null || budget <= 0) return 0;
  return Math.min(100, Math.round((actualCost / budget) * 100));
};

export const getLastExpense = (project: Project): ProjectExpense | null => {
  const expenses = project.expenses || [];
  if (expenses.length === 0) return null;
  return [...expenses].sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime())[0];
};

export const formatMarginPercent = (value: number | null | undefined): string => {
  if (value == null) return '—';
  return `${Math.round(value * 1000) / 10}%`;
};
