import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import StatsCard from "@/components/StatsCard";
import BudgetChart from "@/components/BudgetChart";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  getBudgets,
  calculateTotals,
  getExpensesByCategory,
  Budget,
} from "@/lib/api";
import { toast } from "sonner";

const Dashboard = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  const loadBudgets = async () => {
    try {
      const data = await getBudgets();
      setBudgets(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to load budgets");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const { income, expenses, balance } = calculateTotals(budgets);
  const expensesByCategory = getExpensesByCategory(budgets);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className={`flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 ${isMobile ? "" : "ml-64"}`}>
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
          <div className={isMobile ? "pt-12" : ""}>
            <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Track your income and expenses in real-time
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <StatsCard
              title="Total Income"
              value={`$${income.toFixed(2)}`}
              icon={TrendingUp}
              glowColor="secondary"
            />
            <StatsCard
              title="Total Expenses"
              value={`$${expenses.toFixed(2)}`}
              icon={TrendingDown}
              glowColor="accent"
            />
            <StatsCard
              title="Balance"
              value={`$${balance.toFixed(2)}`}
              icon={DollarSign}
              glowColor="primary"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="glass-card p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Expenses by Category</h2>
              <div className="min-h-[250px] sm:min-h-[300px]">
                <BudgetChart data={expensesByCategory} />
              </div>
            </div>

            <div className="glass-card p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Recent Transactions</h2>
              <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
                {budgets.slice(0, 5).map((budget) => (
                  <div
                    key={budget.id}
                    className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{budget.category}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {new Date(budget.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p
                        className={`font-semibold text-sm sm:text-base ${
                          budget.type === "income"
                            ? "text-secondary"
                            : "text-accent"
                        }`}
                      >
                        {budget.type === "income" ? "+" : "-"}$
                        {Number(budget.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {budget.type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
