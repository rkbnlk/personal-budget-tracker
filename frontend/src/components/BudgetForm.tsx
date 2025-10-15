import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Budget } from "@/lib/api";

interface BudgetFormProps {
  initialData?: Budget;
  onSubmit: (data: {
    category: string;
    amount: number;
    type: "income" | "expense";
    date: string;
    description: string;
  }) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Salary",
  "Freelance",
  "Investments",
  "Other",
];

export default function BudgetForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: BudgetFormProps) {
  const [formData, setFormData] = useState({
    category: initialData?.category || "",
    amount: initialData?.amount?.toString() || "",
    type: initialData?.type || ("expense" as "income" | "expense"),
    date: initialData?.date ? new Date(initialData.date) : new Date(),
    description: initialData?.description || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category) {
      toast.error("Category is required. Please select one before saving.");
      return;
    }

    onSubmit({
      ...formData,
      date: formData.date.toISOString(),
      amount: parseFloat(formData.amount),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 p-6 rounded-2xl bg-card/40 backdrop-blur-md border border-border/50 shadow-xl
             max-h-[80vh] overflow-y-auto
             [scrollbar-width:none] [-ms-overflow-style:none]
             [&::-webkit-scrollbar]:hidden"
    >
      {/* Row 1: Type + Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Type */}
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value: "income" | "expense") =>
              setFormData({ ...formData, type: value })
            }
          >
            <SelectTrigger id="type" className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">
            Category <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              setFormData({ ...formData, category: value })
            }
          >
            <SelectTrigger id="category" className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2: Amount + Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount ($)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            required
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            placeholder="0.00"
            className={cn(
              "transition-all",
              formData.type === "income"
                ? "border-green-500/40 focus:border-green-500 focus:ring-green-500/40"
                : "border-red-500/40 focus:border-red-500 focus:ring-red-500/40"
            )}
          />
        </div>

        {/* Date Picker */}
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.date ? format(formData.date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.date}
                onSelect={(date) => date && setFormData({ ...formData, date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Add notes about this transaction..."
          rows={3}
        />
      </div>

      {/* Buttons */}
      <div className="bg-card/60 backdrop-blur-md pt-4 pb-2 flex gap-4 border-t border-border/40">
        <Button type="submit" className="flex-1 btn-glow" disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : initialData
            ? "Update Budget"
            : "Add Budget"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
