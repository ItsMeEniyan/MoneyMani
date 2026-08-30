export const INCOME_CATEGORIES = [
  "Salary",
  "Share Dividends",
  "Bond Repayments",
  "Freelance",
  "Other",
]

export const EXPENSE_CATEGORIES = [
  "Food",
  "Family",
  "Travel",
  "Petrol",
  "Rent",
  "Utilities",
  "Entertainment",
  "Healthcare",
  "Shopping",
  "Education",
  "Other",
]

export const SAVINGS_CATEGORIES = [
  "Stocks",
  "Mutual Funds",
  "Fixed Deposits",
  "Gold",
  "Other Savings",
]

export const INCOME_GROUPS: Record<string, string[]> = {
  "Earned Income": ["Salary", "Freelance"],
  "Portfolio Income": ["Share Dividends", "Bond Repayments"],
  "Passive Income": ["Other"],
}

export const CATEGORY_ICONS: Record<string, string> = {
  Salary: "💼",
  "Share Dividends": "📈",
  "Bond Repayments": "🏦",
  Freelance: "💻",
  Food: "🍽️",
  Family: "👨‍👩‍👧",
  Travel: "✈️",
  Petrol: "⛽",
  Rent: "🏠",
  Utilities: "💡",
  Entertainment: "🎬",
  Healthcare: "🏥",
  Shopping: "🛍️",
  Education: "📚",
  Stocks: "📊",
  "Mutual Funds": "💹",
  "Fixed Deposits": "🏛️",
  Gold: "🥇",
  Other: "📌",
  "Other Savings": "💰",
}
