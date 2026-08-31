/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function calculateMonthlyPayment(amount: number, months: number, annualRate: number): { monthly: number; totalCost: number; totalInterest: number } {
  if (amount <= 0 || months <= 0) return { monthly: 0, totalCost: 0, totalInterest: 0 };
  const monthlyRate = (annualRate / 100) / 12;
  
  let monthly = 0;
  if (monthlyRate === 0) {
    monthly = amount / months;
  } else {
    monthly = (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  }
  
  const totalCost = monthly * months;
  const totalInterest = totalCost - amount;
  
  return {
    monthly: Math.round(monthly * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100
  };
}
