export function compoundInterest(
  principal: number,
  rate: number,
  years: number,
  compoundsPerYear: number = 12
): number {
  return principal * Math.pow(1 + rate / 100 / compoundsPerYear, compoundsPerYear * years);
}

export function futureValue(
  periodicPayment: number,
  rate: number,
  periods: number,
  compoundsPerYear: number = 12
): number {
  const r = rate / 100 / compoundsPerYear;
  return periodicPayment * ((Math.pow(1 + r, periods) - 1) / r);
}

export function loanPayment(
  principal: number,
  annualRate: number,
  months: number
): number {
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / months;
  return principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

export function debtPayoffMonths(
  balance: number,
  monthlyPayment: number,
  annualRate: number
): number {
  const r = annualRate / 100 / 12;
  if (r === 0) return Math.ceil(balance / monthlyPayment);
  return Math.ceil(
    Math.log(monthlyPayment / (monthlyPayment - r * balance)) / Math.log(1 + r)
  );
}

export function totalInterestPaid(
  balance: number,
  monthlyPayment: number,
  annualRate: number,
  months: number
): number {
  return monthlyPayment * months - balance;
}

export function emergencyFundMonths(
  monthlyExpenses: number,
  savings: number
): number {
  if (monthlyExpenses === 0) return 0;
  return savings / monthlyExpenses;
}

export function netWorth(
  assets: number,
  liabilities: number
): number {
  return assets - liabilities;
}

export function savingsRate(
  income: number,
  expenses: number
): number {
  if (income === 0) return 0;
  return ((income - expenses) / income) * 100;
}

export function debtToIncomeRatio(
  totalDebtPayments: number,
  monthlyIncome: number
): number {
  if (monthlyIncome === 0) return 0;
  return (totalDebtPayments / monthlyIncome) * 100;
}

export function investmentAllocation(
  totalAmount: number,
  percentages: number[]
): number[] {
  return percentages.map((p) => (totalAmount * p) / 100);
}

export function taxEstimate(
  income: number,
  brackets: { min: number; max: number; rate: number }[]
): number {
  let tax = 0;
  for (const bracket of brackets) {
    if (income > bracket.min) {
      const taxable = Math.min(income, bracket.max) - bracket.min;
      tax += taxable * (bracket.rate / 100);
    }
  }
  return tax;
}

export function inflationAdjustedValue(
  currentValue: number,
  inflationRate: number,
  years: number
): number {
  return currentValue * Math.pow(1 + inflationRate / 100, years);
}

export function yearsToFinancialFreedom(
  currentSavings: number,
  monthlySavings: number,
  annualReturn: number,
  annualExpenses: number
): number {
  if (annualExpenses <= 0) return 0;
  const target = annualExpenses * 25;
  let savings = currentSavings;
  const monthlyReturn = annualReturn / 100 / 12;
  let years = 0;
  const maxYears = 100;

  while (savings < target && years < maxYears) {
    savings = savings * (1 + monthlyReturn) + monthlySavings;
    years++;
  }

  return years >= maxYears ? -1 : years;
}

export function sipReturns(
  monthlyInvestment: number,
  annualReturn: number,
  years: number
): number {
  const months = years * 12;
  const r = annualReturn / 100 / 12;
  return monthlyInvestment * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
}
