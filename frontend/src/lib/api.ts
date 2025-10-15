const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export async function post(path, body) {
  const res = await fetch(API_BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw { status: res.status, ...data };
  return data;
}

export async function get(path, token) {
  const headers = {};
  if (token) headers["Authorization"] = "Bearer " + token;
  const res = await fetch(API_BASE + path, { headers });
  const data = await res.json();
  if (!res.ok) throw { status: res.status, ...data };
  return data;
}

export function saveToken(token) {
  if (typeof window !== "undefined")
    localStorage.setItem("bt_access_token", token);
}

export function loadToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("bt_access_token");
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("bt_access_token");
}

// === Common HTTP Utilities ===
async function request(
  method: string,
  path: string,
  body?: any,
  auth: boolean = true
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (auth) {
    const token = loadToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface BudgetInsert {
  user_id: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  description?: string;
}

export interface BudgetUpdate {
  category?: string;
  amount?: number;
  type?: "income" | "expense";
  date?: string;
  description?: string;
}

export const getCurrentUser = async () => {
  try {
    const data = await request("GET", "/api/auth/me");
    return data.user;
  } catch {
    return null;
  }
};

export const getBudgets = async (): Promise<Budget[]> => {
  const data = await request("GET", "/api/budgets");
  return data.map((b: any) => ({
    id: b._id,
    user_id: b.userId,
    ...b,
  }));
};

export const createBudget = async (budget: BudgetInsert): Promise<Budget> => {
  const data = await request("POST", "/api/budgets", budget);
  return { id: data._id, user_id: data.userId, ...data };
};

export const updateBudget = async (
  id: string,
  updates: BudgetUpdate
): Promise<Budget> => {
  const data = await request("PUT", `/api/budgets/${id}`, updates);
  return { id: data._id, user_id: data.userId, ...data };
};

export const deleteBudget = async (id: string): Promise<void> => {
  await request("DELETE", `/api/budgets/${id}`);
};

export const calculateTotals = (budgets: Budget[]) => {
  const income = budgets
    .filter((b) => b.type === "income")
    .reduce((sum, b) => sum + Number(b.amount), 0);
  const expenses = budgets
    .filter((b) => b.type === "expense")
    .reduce((sum, b) => sum + Number(b.amount), 0);

  return {
    income,
    expenses,
    balance: income - expenses,
  };
};

export const getExpensesByCategory = (budgets: Budget[]) => {
  const expenses = budgets.filter((b) => b.type === "expense");
  const categories = expenses.reduce((acc, budget) => {
    const existing = acc.find((c) => c.category === budget.category);
    if (existing) {
      existing.amount += Number(budget.amount);
    } else {
      acc.push({
        category: budget.category,
        amount: Number(budget.amount),
      });
    }
    return acc;
  }, [] as { category: string; amount: number }[]);

  return categories.sort((a, b) => b.amount - a.amount);
};
