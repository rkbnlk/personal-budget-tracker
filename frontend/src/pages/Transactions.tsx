import { useState, useEffect, useMemo } from "react";
import {
  PlusCircle,
  Search,
  Filter,
  Calendar as CalendarIcon,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import BudgetTable from "@/components/BudgetTable";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  getBudgets,
  deleteBudget,
  Budget,
  createBudget,
  getCurrentUser,
  updateBudget,
} from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BudgetForm from "@/components/BudgetForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

const Transactions = () => {
  const isMobile = useIsMobile();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const loadBudgets = async () => {
    try {
      const data = await getBudgets();
      setBudgets(data);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load budgets"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  // Get unique categories dynamically
  const uniqueCategories = useMemo(
    () => ["all", ...Array.from(new Set(budgets.map((b) => b.category)))],
    [budgets]
  );

  // Filtering logic
  const filteredBudgets = useMemo(() => {
    return budgets
      .filter((b) =>
        b.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((b) =>
        categoryFilter === "all" ? true : b.category === categoryFilter
      )
      .filter((b) => (typeFilter === "all" ? true : b.type === typeFilter))
      .filter((b) => {
        if (!dateRange?.from || !dateRange?.to) return true;

        const date = new Date(b.date);
        const from = new Date(dateRange.from);
        const to = new Date(dateRange.to);

        // Extend "to" date to end of the day
        to.setHours(23, 59, 59, 999);

        return date >= from && date <= to;
      });
  }, [budgets, searchTerm, categoryFilter, typeFilter, dateRange]);

  // Pagination
  const totalPages = Math.ceil(filteredBudgets.length / itemsPerPage);
  const paginatedBudgets = filteredBudgets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmit = async (data: Budget) => {
    setIsLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      await createBudget({ ...data, user_id: user.id });
      toast.success("Transaction added successfully!");
      setIsAddDialogOpen(false);
      loadBudgets();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add transaction"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBudget(id);
      toast.success("Transaction deleted");
      loadBudgets();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete transaction"
      );
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (data: Budget) => {
    if (!editingBudget) return;
    try {
      await updateBudget(editingBudget.id, data);
      toast.success("Transaction updated successfully");
      setIsEditDialogOpen(false);
      setEditingBudget(null);
      loadBudgets();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update transaction"
      );
    }
  };

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
      <main
        className={`flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 ${
          isMobile ? "" : "ml-64"
        }`}
      >
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
          {/* Header */}
          <div
            className={`flex items-center justify-between ${
              isMobile ? "pt-12" : ""
            }`}
          >
            <h2 className="text-2xl sm:text-3xl font-bold gradient-text">
              Transactions
            </h2>
            <Button
              variant="ghost"
              size={isMobile ? "sm" : "default"}
              onClick={() => setIsAddDialogOpen(true)}
              className="hover:bg-primary/10 hover:text-primary"
            >
              <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
              {!isMobile && <span>Add</span>}
            </Button>
          </div>

          {/* Filter Bar */}
          <Card className="p-3 sm:p-4 border border-border/50 glass-card">
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
              {/* Search */}
              <div className="flex items-center flex-1 sm:min-w-[200px] gap-2">
                <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <Input
                  placeholder="Search by category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-muted/40"
                />
              </div>

              {/* Date Range Picker */}
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <CalendarIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full sm:w-[220px] justify-start text-left font-normal text-xs sm:text-sm"
                    >
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    side="bottom"
                    className="p-0 w-[auto] overflow-auto"
                  >
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Category Filter */}
              <div className="flex items-center space-x-2 flex-1 sm:flex-initial">
                <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-full sm:w-[160px] text-xs sm:text-sm">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type Filter */}
              <div className="flex items-center space-x-2 flex-1 sm:flex-initial">
                <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[160px] text-xs sm:text-sm">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Table */}
          <BudgetTable
            budgets={paginatedBudgets}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Prev
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Dialogs */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="glass-card border-border/50">
          <DialogHeader>
            <DialogTitle className="text-2xl gradient-text">
              Add Transaction
            </DialogTitle>
          </DialogHeader>
          <BudgetForm onSubmit={handleSubmit} isLoading={isLoading} />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-card border-border/50">
          <DialogHeader>
            <DialogTitle className="text-2xl gradient-text">
              Edit Transaction
            </DialogTitle>
          </DialogHeader>
          {editingBudget && (
            <BudgetForm
              initialData={editingBudget}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transactions;
