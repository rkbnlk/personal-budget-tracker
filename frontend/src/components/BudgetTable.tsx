import { Budget } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface BudgetTableProps {
  budgets: Budget[];
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

const BudgetTable = ({ budgets, onEdit, onDelete }: BudgetTableProps) => {
  const isMobile = useIsMobile();

  if (budgets.length === 0) {
    return (
      <div className="glass-card p-6 sm:p-8 text-center text-muted-foreground">
        <p>No budget entries yet. Add your first one!</p>
      </div>
    );
  }

  // Mobile card view
  if (isMobile) {
    return (
      <div className="space-y-3">
        {budgets.map((budget) => (
          <div
            key={budget.id}
            className="glass-card p-4 space-y-3 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base truncate">{budget.category}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(budget.date), "MMM dd, yyyy")}
                </p>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(budget)}
                  className="hover:bg-primary/10 hover:text-primary h-8 w-8 p-0"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-destructive/10 hover:text-destructive h-8 w-8 p-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="glass-card border-border/50 max-w-[90vw]">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this transaction? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(budget.id)}
                        className="bg-destructive text-white hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    budget.type === "income"
                      ? "bg-secondary/20 text-secondary"
                      : "bg-accent/20 text-accent"
                  }`}
                >
                  {budget.type}
                </span>
              </div>
              <p className="text-lg font-bold">
                ${Number(budget.amount).toFixed(2)}
              </p>
            </div>
            
            {budget.description && (
              <p className="text-xs text-muted-foreground pt-2 border-t border-border/30">
                {budget.description}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Desktop table view
  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Description</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map((budget) => (
              <tr
                key={budget.id}
                className="border-b border-border/30 hover:bg-muted/30 transition-colors"
              >
                <td className="p-4 text-sm">
                  {format(new Date(budget.date), "MMM dd, yyyy")}
                </td>
                <td className="p-4 text-sm font-medium">{budget.category}</td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      budget.type === "income"
                        ? "bg-secondary/20 text-secondary"
                        : "bg-accent/20 text-accent"
                    }`}
                  >
                    {budget.type}
                  </span>
                </td>
                <td className="p-4 text-sm font-semibold">
                  ${Number(budget.amount).toFixed(2)}
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {budget.description || "-"}
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    {/* ✏️ Edit Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(budget)}
                      className="hover:bg-primary/10 hover:text-primary"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>

                    {/* 🗑️ Delete Button with Confirmation */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass-card border-border/50">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this transaction? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(budget.id)}
                            className="bg-destructive text-white hover:bg-destructive/90"
                          >
                            Confirm Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BudgetTable;
