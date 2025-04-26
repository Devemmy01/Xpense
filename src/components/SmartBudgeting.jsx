import React from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import useManageBudgets from "../hooks/useManageBudgets";
import { toast } from "react-toastify";
import useGetUserInfo from "../hooks/useGetUserInfo";

const SmartBudgeting = ({ transactions, onNotification }) => {
  const { budgets, loading, updateBudget } = useManageBudgets();
  const userInfo = useGetUserInfo();
  const [isAddBudgetOpen, setIsAddBudgetOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [budgetAmount, setBudgetAmount] = React.useState("");

  const categories = [
    "food",
    "transportation",
    "housing",
    "utilities",
    "entertainment",
    "healthcare",
    "education",
    "shopping",
    "general",
  ];

  // Calculate current spending for each category
  const calculateCategorySpending = (category) => {
    return transactions
      .filter((t) => t.category === category && t.transactionType === "expense")
      .reduce((sum, t) => sum + Number(t.transactionAmount), 0);
  };

  // Calculate budget usage percentage
  const calculateBudgetUsage = (category) => {
    const spending = calculateCategorySpending(category);
    const budget = budgets[category] || 0;
    return budget === 0 ? 0 : (spending / budget) * 100;
  };

  // Check budget status and generate notifications
  React.useEffect(() => {
    if (!transactions || !budgets) return;

    const newNotifications = [];
    
    Object.entries(budgets).forEach(([category, budget]) => {
      if (!budget) return; // Skip if no budget is set
      
      const spending = calculateCategorySpending(category);
      const usage = (spending / budget) * 100;
      
      if (usage > 100) {
        newNotifications.push({
          id: Date.now() + Math.random(),
          message: `You've exceeded your ${category} budget by ${(usage - 100).toFixed(1)}%! (₦${spending.toLocaleString()} / ₦${budget.toLocaleString()})`,
          type: "error",
          category,
          timestamp: new Date(),
        });
      } else if (usage >= 80) {
        newNotifications.push({
          id: Date.now() + Math.random(),
          message: `You've used ${usage.toFixed(1)}% of your ${category} budget. (₦${spending.toLocaleString()} / ₦${budget.toLocaleString()})`,
          type: "warning",
          category,
          timestamp: new Date(),
        });
      }
    });

    if (newNotifications.length > 0) {
      onNotification?.(newNotifications);
    }
  }, [transactions, budgets]);

  const handleAddBudget = async (e) => {
    e.preventDefault();
    if (!selectedCategory || !budgetAmount) return;

    const success = await updateBudget(selectedCategory, budgetAmount);
    
    if (success) {
      toast.success(`Budget for ${selectedCategory} has been updated!`);
      setIsAddBudgetOpen(false);
      setSelectedCategory("");
      setBudgetAmount("");
    } else {
      toast.error("Failed to update budget. Please try again.");
    }
  };

  if (!userInfo?.userID) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-40">
          <div className="text-center text-muted-foreground">
            Please sign in to manage your budgets
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-40">
          <div className="h-8 w-8 border-t-2 border-r-2 border-primary rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Smart Budgeting</CardTitle>
            <CardDescription>
              Set and monitor your spending limits
            </CardDescription>
          </div>
          <Dialog open={isAddBudgetOpen} onOpenChange={setIsAddBudgetOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Set Budget</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set Budget Limit</DialogTitle>
                <DialogDescription>
                  Choose a category and set your monthly budget
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddBudget} className="space-y-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category}
                          value={category}
                          className="capitalize"
                        >
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Budget Amount</Label>
                  <Input
                    type="number"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">Set Budget</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category) => {
            const usage = calculateBudgetUsage(category);
            const isOverBudget = usage > 100;
            const isNearLimit = usage >= 80;
            const spending = calculateCategorySpending(category);
            const budget = budgets[category] || 0;

            return (
              <div
                key={category}
                className={`p-4 rounded-lg ${
                  budget === 0
                    ? "bg-muted/30"
                    : isOverBudget
                    ? "bg-red-500/10"
                    : isNearLimit
                    ? "bg-yellow-500/10"
                    : "bg-muted/50"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium capitalize">{category}</span>
                  <span className="text-sm">
                    ₦{spending.toLocaleString()} {budget > 0 && `/ ₦${budget.toLocaleString()}`}
                  </span>
                </div>
                {budget > 0 ? (
                  <>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          isOverBudget
                            ? "bg-red-500"
                            : isNearLimit
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min(usage, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span
                        className={
                          isOverBudget
                            ? "text-red-500"
                            : isNearLimit
                            ? "text-yellow-500"
                            : "text-green-500"
                        }
                      >
                        {usage.toFixed(1)}% used
                      </span>
                      {isOverBudget && (
                        <span className="text-red-500">Over budget!</span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground mt-2">
                    No budget set. Click "Set Budget" to add one.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

SmartBudgeting.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      category: PropTypes.string,
      transactionType: PropTypes.string,
      transactionAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ).isRequired,
  onNotification: PropTypes.func,
};

export default SmartBudgeting; 