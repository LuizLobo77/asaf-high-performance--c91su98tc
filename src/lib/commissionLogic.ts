/**
 * Commission Calculation Engine
 * Contains logic to process order values into seller commissions using defined splits.
 */

/**
 * Calculates the total company commission and the specific seller commission based on split rules.
 *
 * @param orderValue Total value of the order (e.g., 100000 for R$ 100.000,00)
 * @param industryCommissionDecimal The standard commission percentage as a decimal (e.g., 0.05 for 5%)
 * @param sellerSplitPercent The split percentage assigned to the seller (e.g., 25 for 25%)
 * @returns Object with companyTotalCommission and sellerCommission
 */
export function calculateCommissions(
  orderValue: number,
  industryCommissionDecimal: number,
  sellerSplitPercent: number,
) {
  // Step 1: Calculate the Total Commission that Asaf receives from the Industry
  const companyTotalCommission = orderValue * industryCommissionDecimal

  // Step 2: Calculate the Final Seller Commission based on their split rule
  const sellerCommission = companyTotalCommission * (sellerSplitPercent / 100)

  return {
    companyTotalCommission,
    sellerCommission,
  }
}
