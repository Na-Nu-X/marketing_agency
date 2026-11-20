const eurFormatter = new Intl.NumberFormat('sk-SK', { maximumFractionDigits: 0 });

/** 12500 -> "12 500" (Slovak thousands separator). */
export function formatNumber(value: number): string {
  return eurFormatter.format(Math.round(value));
}

/** 12500 -> "12 500 €" */
export function formatEur(value: number): string {
  return `${formatNumber(value)} €`;
}

/** Decimal string from the API ("690.00") -> "od 690 € / mes." or individual pricing. */
export function formatMonthlyFee(fee: string | null): string {
  if (fee === null || fee === undefined || fee === '') return 'Cena na mieru';
  const value = Number(fee);
  return Number.isFinite(value) ? `od ${formatEur(value)} / mes.` : 'Cena na mieru';
}

/** Slovak plural forms: plural(3, ['služba', 'služby', 'služieb']) -> "služby". */
export function plural(count: number, forms: readonly [one: string, few: string, many: string]): string {
  if (count === 1) return forms[0];
  if (count >= 2 && count <= 4) return forms[1];
  return forms[2];
}
