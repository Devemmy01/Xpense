import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { Button } from "../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { ScrollArea } from "../components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import useAddTransaction from "../hooks/useAddTransaction";
import useGetTransactions from "../hooks/useGetTransactions";
import useGetUserInfo from "../hooks/useGetUserInfo";
import useDeleteTransaction from "../hooks/useDeleteTransaction";
import useUpdateTransaction from "../hooks/useUpdateTransaction";
import { ThemeProvider } from "../components/theme-provider";
import { ThemeToggle } from "../components/theme-toggle";
import { auth } from "../config/firebase-config";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SmartBudgeting from "../components/SmartBudgeting";

const ExpenseTracker = () => {
  const transaction = useAddTransaction();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isEditTransactionOpen, setIsEditTransactionOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [description, setDescription] = useState("");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionType, setTransactionType] = useState("expense");
  const [transactionCategory, setTransactionCategory] = useState("general");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const { transactions, loading, transactionTotals } = useGetTransactions();
  const userInfo = useGetUserInfo();
  const { deleteTransaction } = useDeleteTransaction();
  const { updateTransaction } = useUpdateTransaction();
  const [budgetNotifications, setBudgetNotifications] = useState([]);

  const { addTransaction } = transaction;
  const { displayName, photoURL, email } = userInfo || {};
  const { balance, income, expense } = transactionTotals || {};

  // Categories for transactions
  const categories = {
    expense: [
      "food",
      "transportation",
      "housing",
      "utilities",
      "entertainment",
      "healthcare",
      "education",
      "shopping",
      "general",
    ],
    income: ["salary", "freelance", "investments", "gifts", "other"],
  };

  // Colors for charts - updated with more modern palette
  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#6366f1",
    "#ec4899",
    "#8b5cf6",
    "#14b8a6",
  ];

  useEffect(() => {
    if (transactions) {
      let filtered = [...transactions];

      // Apply time filter
      const now = new Date();
      if (filterPeriod === "week") {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(
          (t) => t.createdAt && t.createdAt.toDate() >= oneWeekAgo
        );
      } else if (filterPeriod === "month") {
        const oneMonthAgo = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate()
        );
        filtered = filtered.filter(
          (t) => t.createdAt && t.createdAt.toDate() >= oneMonthAgo
        );
      } else if (filterPeriod === "year") {
        const oneYearAgo = new Date(
          now.getFullYear() - 1,
          now.getMonth(),
          now.getDate()
        );
        filtered = filtered.filter(
          (t) => t.createdAt && t.createdAt.toDate() >= oneYearAgo
        );
      }

      // Sort transactions by date and time in descending order
      filtered.sort((a, b) => {
        const dateA = a.createdAt ? a.createdAt.toDate() : new Date(0);
        const dateB = b.createdAt ? b.createdAt.toDate() : new Date(0);
        return dateB - dateA;
      });

      setFilteredTransactions(filtered);
    }
  }, [transactions, filterPeriod]);

  if (!transaction || !userInfo) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="h-10 w-10 border-t-2 border-r-2 border-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // Prepare data for charts
  const prepareChartData = () => {
    // Group transactions by date for the area chart
    const dateMap = new Map();

    filteredTransactions.forEach((t) => {
      if (!t.createdAt) return;

      const date = format(t.createdAt.toDate(), "MMM dd");
      const amount = Number.parseFloat(t.transactionAmount);

      if (!dateMap.has(date)) {
        dateMap.set(date, { date, income: 0, expense: 0 });
      }

      const entry = dateMap.get(date);
      if (t.transactionType === "income") {
        entry.income += amount;
      } else {
        entry.expense += amount;
      }
    });

    // Convert to array and sort by date
    const result = Array.from(dateMap.values());
    result.sort((a, b) => {
      const dateA = new Date(`${a.date} 2023`);
      const dateB = new Date(`${b.date} 2023`);
      return dateA - dateB;
    });

    return result;
  };

  const prepareCategoryData = () => {
    const categoryMap = new Map();

    filteredTransactions.forEach((t) => {
      if (!t.category || t.transactionType !== "expense") return;

      const category = t.category;
      const amount = Number.parseFloat(t.transactionAmount);

      if (!categoryMap.has(category)) {
        categoryMap.set(category, { name: category, value: 0 });
      }

      const entry = categoryMap.get(category);
      entry.value += amount;
    });

    return Array.from(categoryMap.values());
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      currencyDisplay: "symbol",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("₦", "₦ ");
  };

  const getFirstName = (fullName) => {
    if (!fullName) return "";
    return fullName.split(" ")[0];
  };

  const getInitials = (name) => {
    if (!name) return "";
    const initials = name
      .split(" ")
      .map((word) => word[0])
      .join("");
    return initials.toUpperCase();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const success = await addTransaction({
        description,
        transactionAmount: Number.parseFloat(transactionAmount),
        transactionType,
        category: transactionCategory,
      });

      if (success) {
        setDescription("");
        setTransactionAmount("");
        setIsAddTransactionOpen(false);
      }
    } catch (error) {
      console.error("Error submitting transaction:", error);
    }
  };

  const handleEditTransaction = (transaction) => {
    setCurrentTransaction(transaction);
    setDescription(transaction.description);
    setTransactionAmount(transaction.transactionAmount.toString());
    setTransactionType(transaction.transactionType);
    setTransactionCategory(
      transaction.category ||
        (transaction.transactionType === "expense" ? "general" : "salary")
    );
    setIsEditTransactionOpen(true);
  };

  const handleUpdateTransaction = async (e) => {
    e.preventDefault();

    const updatedData = {
      description,
      transactionAmount: Number.parseFloat(transactionAmount),
      transactionType,
      category: transactionCategory,
    };

    const success = await updateTransaction(currentTransaction.id, updatedData);

    if (success) {
      setIsEditTransactionOpen(false);
      setCurrentTransaction(null);
      setDescription("");
      setTransactionAmount("");
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    await deleteTransaction(transactionId);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  const chartData = prepareChartData();
  const categoryData = prepareCategoryData();

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border p-3 rounded-lg shadow-lg">
          <p className="font-medium text-black dark:text-white">
            {new Date(label).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
          {payload.map((entry, index) => (
            <p
              key={`item-${index}`}
              className="text-sm text-black dark:text-white"
            >
              <span style={{ color: entry.color }}>{entry.name}:</span>{" "}
              {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for pie chart
  const PieChartTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border p-3 rounded-lg shadow-lg">
          {payload.map((entry, index) => (
            <p
              key={`item-${index}`}
              className="text-sm text-black dark:text-white"
            >
              <span style={{ color: entry.color }}>{entry.name}:</span>{" "}
              {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleBudgetNotification = (notifications) => {
    setBudgetNotifications((prev) => [...notifications, ...prev]);
  };

  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen bg-background transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* SmartBudgeting Component - Moved outside tabs */}
          <div className="hidden">
            <SmartBudgeting 
              transactions={transactions} 
              onNotification={handleBudgetNotification}
            />
          </div>
          {/* Header */}
          <header className="py-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-10 w-10 border-2 border-primary cursor-pointer">
                      <AvatarImage src={photoURL || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px] ml-4">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => setActiveTab("dashboard")}
                    >
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => setActiveTab("transactions")}
                    >
                      Transactions
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => setActiveTab("analytics")}
                    >
                      Analytics
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-500 cursor-pointer"
                      onClick={handleSignOut}
                    >
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div>
                  <h2 className="text-foreground font-medium">
                    Hi, {getFirstName(displayName)} 👋
                  </h2>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <ThemeToggle />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-foreground relative"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-bell"
                      >
                        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                      </svg>
                      {budgetNotifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                          {budgetNotifications.length}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[350px]">
                    <div className="flex items-center justify-between p-2 border-b">
                      <h4 className="font-medium">Notifications</h4>
                      {budgetNotifications.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setBudgetNotifications([])}
                          className="h-8 px-2 text-sm"
                        >
                          Clear all
                        </Button>
                      )}
                    </div>
                    {budgetNotifications.length > 0 ? (
                      <div className="max-h-[350px] overflow-y-auto">
                        {/* Group notifications by category */}
                        {Object.entries(
                          budgetNotifications.reduce((acc, notification) => {
                            if (!acc[notification.category]) {
                              acc[notification.category] = [];
                            }
                            acc[notification.category].push(notification);
                            return acc;
                          }, {})
                        ).map(([category, notifications]) => (
                          <div key={category} className="border-b last:border-0">
                            <div className="p-2 bg-muted/50">
                              <span className="font-medium capitalize">{category}</span>
                            </div>
                            {notifications.map((notification) => (
                              <DropdownMenuItem
                                key={notification.id}
                                className={`p-3 cursor-default ${
                                  notification.type === "error"
                                    ? "text-red-500 bg-red-500/5"
                                    : "text-yellow-500 bg-yellow-500/5"
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  {notification.type === "error" ? (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="mt-0.5"
                                    >
                                      <circle cx="12" cy="12" r="10" />
                                      <line x1="12" y1="8" x2="12" y2="12" />
                                      <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                  ) : (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="mt-0.5"
                                    >
                                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                      <line x1="12" y1="9" x2="12" y2="13" />
                                      <line x1="12" y1="17" x2="12.01" y2="17" />
                                    </svg>
                                  )}
                                  <div className="flex-1">
                                    <p className="text-sm">{notification.message}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {new Date(notification.timestamp).toLocaleString()}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setBudgetNotifications(
                                        budgetNotifications.filter((n) => n.id !== notification.id)
                                      );
                                    }}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="14"
                                      height="14"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <line x1="18" y1="6" x2="6" y2="18" />
                                      <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                  </Button>
                                </div>
                              </DropdownMenuItem>
                            ))}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        No new notifications
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="py-4 sm:py-6 lg:py-8">
            <Tabs
              defaultValue="dashboard"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                {/* Desktop Add Transaction Button */}
                <div className="hidden sm:block ml-auto">
                  <Dialog
                    open={isAddTransactionOpen}
                    onOpenChange={setIsAddTransactionOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-90">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2"
                        >
                          <line x1="12" x2="12" y1="5" y2="19" />
                          <line x1="5" x2="19" y1="12" y2="12" />
                        </svg>
                        Add Transaction
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add New Transaction</DialogTitle>
                        <DialogDescription>
                          Enter the details of your transaction below.
                        </DialogDescription>
                      </DialogHeader>

                      <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What was this transaction for?"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount</Label>
                          <Input
                            id="amount"
                            type="number"
                            value={transactionAmount}
                            onChange={(e) =>
                              setTransactionAmount(e.target.value)
                            }
                            placeholder="0.00"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Transaction Type</Label>
                          <RadioGroup
                            value={transactionType}
                            onValueChange={setTransactionType}
                            className="flex flex-wrap gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="expense" id="expense" />
                              <Label htmlFor="expense">Expense</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="income" id="income" />
                              <Label htmlFor="income">Income</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={transactionCategory}
                            onValueChange={setTransactionCategory}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories[transactionType].map((category) => (
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

                        <DialogFooter>
                          <Button
                            type="submit"
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-90 w-full"
                          >
                            Add Transaction
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Mobile Floating Action Button */}
                <div className="fixed right-4 bottom-4 sm:hidden z-50">
                  <Dialog
                    open={isAddTransactionOpen}
                    onOpenChange={setIsAddTransactionOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="icon"
                        className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-90 shadow-lg"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="12" x2="12" y1="5" y2="19" />
                          <line x1="5" x2="19" y1="12" y2="12" />
                        </svg>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add New Transaction</DialogTitle>
                        <DialogDescription>
                          Enter the details of your transaction below.
                        </DialogDescription>
                      </DialogHeader>

                      <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What was this transaction for?"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount</Label>
                          <Input
                            id="amount"
                            type="number"
                            value={transactionAmount}
                            onChange={(e) =>
                              setTransactionAmount(e.target.value)
                            }
                            placeholder="0.00"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Transaction Type</Label>
                          <RadioGroup
                            value={transactionType}
                            onValueChange={setTransactionType}
                            className="flex flex-wrap gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="expense" id="expense" />
                              <Label htmlFor="expense">Expense</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="income" id="income" />
                              <Label htmlFor="income">Income</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={transactionCategory}
                            onValueChange={setTransactionCategory}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories[transactionType].map((category) => (
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

                        <DialogFooter>
                          <Button
                            type="submit"
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-90 w-full"
                          >
                            Add Transaction
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <TabsContent value="dashboard" className="mt-0 p-0">
                {/* Mobile Swiper Cards */}
                <div className="md:hidden mb-6">
                  <Swiper
                    modules={[Autoplay]}
                    spaceBetween={16}
                    slidesPerView={1}
                    centeredSlides={false}
                    loop={true}
                    className="h-[180px]"
                  >
                    <SwiperSlide>
                      <Card className="h-full w-full bg-gradient-to-br from-blue-500/10 to-indigo-600/10 border-blue-500/20">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="space-y-4">
                              <div>
                                <CardTitle className="text-lg text-blue-500">
                                  Total Balance
                                </CardTitle>
                                <CardDescription>
                                  Your current balance
                                </CardDescription>
                                <div className="text-2xl font-bold text-blue-500 mt-2">
                                  {balance >= 0
                                    ? formatCurrency(balance)
                                    : `-${formatCurrency(Math.abs(balance))}`}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <div
                                  className={`flex items-center ${
                                    balance >= 0
                                      ? "text-green-500"
                                      : "text-red-500"
                                  }`}
                                >
                                  {balance >= 0 ? (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                      className="w-4 h-4"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042.814a.75.75 0 01-.919-.53z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  ) : (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                      className="w-4 h-4"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M1.22 5.222a.75.75 0 011.06 0L7 9.942l3.768-3.769a.75.75 0 011.113.058 20.908 20.908 0 013.813 7.254l1.574-2.727a.75.75 0 011.3.75l-2.475 4.286a.75.75 0 01-1.025.275l-4.287-2.475a.75.75 0 01.75-1.3l2.71 1.565a19.422 19.422 0 00-3.013-6.024L7.53 11.533a.75.75 0 01-1.06 0l-5.25-5.25a.75.75 0 010-1.06z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  )}
                                  <span className="ml-1">
                                    {Math.abs(
                                      ((balance - expense) / expense) * 100
                                    ).toFixed(1)}
                                    % {balance >= 0 ? "up" : "down"}
                                  </span>
                                </div>
                                <span className="text-muted-foreground">
                                  from last month
                                </span>
                              </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-blue-500"
                              >
                                <rect
                                  width="20"
                                  height="14"
                                  x="2"
                                  y="5"
                                  rx="2"
                                />
                                <line x1="2" x2="22" y1="10" y2="10" />
                              </svg>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    </SwiperSlide>
                    <SwiperSlide>
                      <Card className="h-full w-full bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="space-y-4">
                              <div>
                                <CardTitle className="text-lg text-green-500">
                                  Total Income
                                </CardTitle>
                                <CardDescription>
                                  Money coming in
                                </CardDescription>
                                <div className="text-2xl font-bold text-green-500 mt-2">
                                  {formatCurrency(income)}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <div className="flex items-center text-green-500">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className="w-4 h-4"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042.814a.75.75 0 01-.919-.53z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <span className="ml-1">
                                    {(
                                      (income / (income + expense)) *
                                      100
                                    ).toFixed(1)}
                                    % of total
                                  </span>
                                </div>
                                <span className="text-muted-foreground">
                                  this month
                                </span>
                              </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-green-500"
                              >
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                              </svg>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    </SwiperSlide>
                    <SwiperSlide>
                      <Card className="h-full w-full bg-gradient-to-br from-red-500/10 to-rose-600/10 border-red-500/20">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="space-y-4">
                              <div>
                                <CardTitle className="text-lg text-red-500">
                                  Total Expenses
                                </CardTitle>
                                <CardDescription>
                                  Money going out
                                </CardDescription>
                                <div className="text-2xl font-bold text-red-500 mt-2">
                                  {formatCurrency(expense)}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <div className="flex items-center text-red-500">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className="w-4 h-4"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M1.22 5.222a.75.75 0 011.06 0L7 9.942l3.768-3.769a.75.75 0 011.113.058 20.908 20.908 0 013.813 7.254l1.574-2.727a.75.75 0 011.3.75l-2.475 4.286a.75.75 0 01-1.025.275l-4.287-2.475a.75.75 0 01.75-1.3l2.71 1.565a19.422 19.422 0 00-3.013-6.024L7.53 11.533a.75.75 0 01-1.06 0l-5.25-5.25a.75.75 0 010-1.06z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <span className="ml-1">
                                    {(
                                      (expense / (income + expense)) *
                                      100
                                    ).toFixed(1)}
                                    % of total
                                  </span>
                                </div>
                                <span className="text-muted-foreground">
                                  this month
                                </span>
                              </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-red-500"
                              >
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                              </svg>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    </SwiperSlide>
                  </Swiper>
                </div>

                {/* Desktop Cards */}
                <div className="hidden md:grid grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="h-full w-full bg-gradient-to-br from-blue-500/10 to-indigo-600/10 border-blue-500/20">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="space-y-4">
                            <div>
                              <CardTitle className="text-lg text-blue-500">
                                Total Balance
                              </CardTitle>
                              <CardDescription>
                                Your current balance
                              </CardDescription>
                              <div className="text-2xl font-bold text-blue-500 mt-2">
                                {balance >= 0
                                  ? formatCurrency(balance)
                                  : `-${formatCurrency(Math.abs(balance))}`}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <div
                                className={`flex items-center ${
                                  balance >= 0
                                    ? "text-green-500"
                                    : "text-red-500"
                                }`}
                              >
                                {balance >= 0 ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className="w-4 h-4"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042.814a.75.75 0 01-.919-.53z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className="w-4 h-4"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M1.22 5.222a.75.75 0 011.06 0L7 9.942l3.768-3.769a.75.75 0 011.113.058 20.908 20.908 0 013.813 7.254l1.574-2.727a.75.75 0 011.3.75l-2.475 4.286a.75.75 0 01-1.025.275l-4.287-2.475a.75.75 0 01.75-1.3l2.71 1.565a19.422 19.422 0 00-3.013-6.024L7.53 11.533a.75.75 0 01-1.06 0l-5.25-5.25a.75.75 0 010-1.06z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                                <span className="ml-1">
                                  {Math.abs(
                                    ((balance - expense) / expense) * 100
                                  ).toFixed(1)}
                                  % {balance >= 0 ? "up" : "down"}
                                </span>
                              </div>
                              <span className="text-muted-foreground">
                                from last month
                              </span>
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-blue-500"
                            >
                              <rect width="20" height="14" x="2" y="5" rx="2" />
                              <line x1="2" x2="22" y1="10" y2="10" />
                            </svg>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Card className="h-full w-full bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="space-y-4">
                            <div>
                              <CardTitle className="text-lg text-green-500">
                                Total Income
                              </CardTitle>
                              <CardDescription>Money coming in</CardDescription>
                              <div className="text-2xl font-bold text-green-500 mt-2">
                                {formatCurrency(income)}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="flex items-center text-green-500">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  className="w-4 h-4"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042.814a.75.75 0 01-.919-.53z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span className="ml-1">
                                  {(
                                    (income / (income + expense)) *
                                    100
                                  ).toFixed(1)}
                                  % of total
                                </span>
                              </div>
                              <span className="text-muted-foreground">
                                this month
                              </span>
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-green-500"
                            >
                              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Card className="h-full w-full bg-gradient-to-br from-red-500/10 to-rose-600/10 border-red-500/20">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="space-y-4">
                            <div>
                              <CardTitle className="text-lg text-red-500">
                                Total Expenses
                              </CardTitle>
                              <CardDescription>Money going out</CardDescription>
                              <div className="text-2xl font-bold text-red-500 mt-2">
                                {formatCurrency(expense)}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="flex items-center text-red-500">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  className="w-4 h-4"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M1.22 5.222a.75.75 0 011.06 0L7 9.942l3.768-3.769a.75.75 0 011.113.058 20.908 20.908 0 013.813 7.254l1.574-2.727a.75.75 0 011.3.75l-2.475 4.286a.75.75 0 01-1.025.275l-4.287-2.475a.75.75 0 01.75-1.3l2.71 1.565a19.422 19.422 0 00-3.013-6.024L7.53 11.533a.75.75 0 01-1.06 0l-5.25-5.25a.75.75 0 010-1.06z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span className="ml-1">
                                  {(
                                    (expense / (income + expense)) *
                                    100
                                  ).toFixed(1)}
                                  % of total
                                </span>
                              </div>
                              <span className="text-muted-foreground">
                                this month
                              </span>
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-red-500"
                            >
                              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </motion.div>
                </div>

                <div className="mt-6 sm:mt-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm md:text-base">
                        Recent Transactions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="flex justify-center py-8">
                          <div className="h-8 w-8 border-t-2 border-r-2 border-primary rounded-full animate-spin"></div>
                        </div>
                      ) : filteredTransactions.length > 0 ? (
                        <ScrollArea className="h-[250px] sm:h-[300px]">
                          <div className="space-y-4">
                            {filteredTransactions
                              .slice(0, 5)
                              .map((transaction) => {
                                const {
                                  id,
                                  description,
                                  transactionAmount,
                                  transactionType,
                                  category,
                                  createdAt,
                                } = transaction;

                                const date = createdAt
                                  ? format(createdAt.toDate(), "MMM d, yyyy")
                                  : "Date not available";

                                return (
                                  <motion.div
                                    key={id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex items-center justify-between p-2 md:p-4 rounded-lg bg-muted/50"
                                  >
                                    <div className="flex items-center space-x-2 md:space-x-4">
                                      <div
                                        className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
                                          transactionType === "expense"
                                            ? "bg-red-500/20"
                                            : "bg-green-500/20"
                                        }`}
                                      >
                                        {transactionType === "expense" ? (
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke={
                                              transactionType === "expense"
                                                ? "#ef4444"
                                                : "#22c55e"
                                            }
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="md:w-5 md:h-5"
                                          >
                                            <line
                                              x1="12"
                                              x2="12"
                                              y1="5"
                                              y2="19"
                                            />
                                            <polyline points="19 12 12 19 5 12" />
                                          </svg>
                                        ) : (
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke={
                                              transactionType === "expense"
                                                ? "#ef4444"
                                                : "#22c55e"
                                            }
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="md:w-5 md:h-5"
                                          >
                                            <line
                                              x1="12"
                                              x2="12"
                                              y1="19"
                                              y2="5"
                                            />
                                            <polyline points="5 12 12 5 19 12" />
                                          </svg>
                                        )}
                                      </div>
                                      <div>
                                        <h4 className="text-sm md:text-base font-medium capitalize">
                                          {description}
                                        </h4>
                                        <div className="flex items-center space-x-2">
                                          <span className="text-xs md:text-sm text-muted-foreground">
                                            {date}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 md:gap-4">
                                      <div
                                        className={`font-medium text-sm md:text-base ${
                                          transactionType === "expense"
                                            ? "text-red-500"
                                            : "text-green-500"
                                        }`}
                                      >
                                        {transactionType === "expense"
                                          ? "-"
                                          : "+"}
                                        {formatCurrency(
                                          Number.parseFloat(transactionAmount)
                                        )}
                                      </div>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 md:h-8 md:w-8"
                                          >
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              width="14"
                                              height="14"
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              className="md:w-4 md:h-4"
                                            >
                                              <circle cx="12" cy="12" r="1" />
                                              <circle cx="12" cy="5" r="1" />
                                              <circle cx="12" cy="19" r="1" />
                                            </svg>
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem
                                            onClick={() =>
                                              handleEditTransaction(transaction)
                                            }
                                          >
                                            Edit
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                            className="text-red-500"
                                            onClick={() =>
                                              handleDeleteTransaction(id)
                                            }
                                          >
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </motion.div>
                                );
                              })}
                          </div>
                        </ScrollArea>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No transactions found for the selected period
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-4">
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-sm md:text-base">
                          Income & Expenses
                        </CardTitle>
                        <Select
                          value={filterPeriod}
                          onValueChange={setFilterPeriod}
                        >
                          <SelectTrigger className="w-[110px]">
                            <SelectValue placeholder="Filter" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                      <div className="h-[250px] sm:h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={chartData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient
                                id="colorIncome"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="#3b82f6"
                                  stopOpacity={1.0}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="#3b82f6"
                                  stopOpacity={0.1}
                                />
                              </linearGradient>
                              <linearGradient
                                id="colorExpense"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="#ef4444"
                                  stopOpacity={0.8}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="#ef4444"
                                  stopOpacity={0.1}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="var(--border)"
                              opacity={0.3}
                            />
                            <XAxis
                              dataKey="date"
                              stroke="hsl(var(--foreground))"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              tick={{
                                fill: "hsl(var(--foreground))",
                                fontSize: 12,
                              }}
                              tickFormatter={(value) => {
                                const date = new Date(value);
                                return date.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                });
                              }}
                              height={30}
                              hide={window.innerWidth < 768}
                            />
                            <YAxis
                              stroke="hsl(var(--foreground))"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              tick={{
                                fill: "hsl(var(--foreground))",
                                fontSize: 12,
                              }}
                              tickFormatter={(value) => {
                                if (value >= 1000000) {
                                  return `${(value / 1000000).toFixed(1)}M`;
                                } else if (value >= 1000) {
                                  return `${(value / 1000).toFixed(0)}K`;
                                }
                                return value;
                              }}
                              width={45}
                              hide={window.innerWidth < 768}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                              type="natural"
                              dataKey="income"
                              stroke="#3b82f6"
                              strokeWidth={2}
                              fillOpacity={1}
                              fill="url(#colorIncome)"
                              name="Income"
                            />
                            <Area
                              type="natural"
                              dataKey="expense"
                              stroke="#ef4444"
                              strokeWidth={2}
                              fillOpacity={1}
                              fill="url(#colorExpense)"
                              name="Expense"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm md:text-base">
                        Expense Categories
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[250px] sm:h-[300px] flex items-center justify-center">
                        {categoryData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                              >
                                {categoryData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                  />
                                ))}
                              </Pie>
                              <Tooltip content={<PieChartTooltip />} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="text-muted-foreground text-center">
                            No category data available
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="transactions" className="mt-0">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm md:text-base">
                        All Transactions
                      </CardTitle>
                      <Select
                        value={filterPeriod}
                        onValueChange={setFilterPeriod}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="week">This Week</SelectItem>
                          <SelectItem value="month">This Month</SelectItem>
                          <SelectItem value="year">This Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="h-8 w-8 border-t-2 border-r-2 border-primary rounded-full animate-spin"></div>
                      </div>
                    ) : filteredTransactions.length > 0 ? (
                      <ScrollArea className="h-[600px]">
                        <div className="space-y-4">
                          <AnimatePresence>
                            {filteredTransactions.map((transaction) => {
                              const {
                                id,
                                description,
                                transactionAmount,
                                transactionType,
                                category,
                                createdAt,
                              } = transaction;

                              const date = createdAt
                                ? format(createdAt.toDate(), "MMMM d, yyyy")
                                : "Date not available";

                              return (
                                <motion.div
                                  key={id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ duration: 0.3 }}
                                  className="flex items-center justify-between p-2 md:p-4 rounded-lg bg-muted/50"
                                >
                                  <div className="flex items-center space-x-4">
                                    <div
                                      className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
                                        transactionType === "expense"
                                          ? "bg-red-500/20"
                                          : "bg-green-500/20"
                                      }`}
                                    >
                                      {transactionType === "expense" ? (
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke={
                                            transactionType === "expense"
                                              ? "#ef4444"
                                              : "#22c55e"
                                          }
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="md:w-5 md:h-5"
                                        >
                                          <line
                                            x1="12"
                                            x2="12"
                                            y1="5"
                                            y2="19"
                                          />
                                          <polyline points="19 12 12 19 5 12" />
                                        </svg>
                                      ) : (
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke={
                                            transactionType === "expense"
                                              ? "#ef4444"
                                              : "#22c55e"
                                          }
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="md:w-5 md:h-5"
                                        >
                                          <line
                                            x1="12"
                                            x2="12"
                                            y1="19"
                                            y2="5"
                                          />
                                          <polyline points="5 12 12 5 19 12" />
                                        </svg>
                                      )}
                                    </div>
                                    <div>
                                      <h4 className="font-medium capitalize text-sm md:text-base">
                                        {description}
                                      </h4>
                                      <div className="text-xs md:text-sm flex items-center space-x-2">
                                        <span className="text-xs md:text-sm text-muted-foreground">
                                          {date}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 md:gap-4">
                                    <div
                                      className={`font-medium text-sm md:text-base ${
                                        transactionType === "expense"
                                          ? "text-red-500"
                                          : "text-green-500"
                                      }`}
                                    >
                                      {transactionType === "expense"
                                        ? "-"
                                        : "+"}
                                      {formatCurrency(
                                        Number.parseFloat(transactionAmount)
                                      )}
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 md:h-8 md:w-8"
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="md:w-4 md:h-4"
                                          >
                                            <circle cx="12" cy="12" r="1" />
                                            <circle cx="12" cy="5" r="1" />
                                            <circle cx="12" cy="19" r="1" />
                                          </svg>
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleEditTransaction(transaction)
                                          }
                                        >
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          className="text-red-500"
                                          onClick={() =>
                                            handleDeleteTransaction(id)
                                          }
                                        >
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </AnimatePresence>
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No transactions found for the selected period
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-sm md:text-base">
                          Expense Breakdown
                        </CardTitle>
                        <Select
                          value={filterPeriod}
                          onValueChange={setFilterPeriod}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Filter" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        {categoryData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                              >
                                {categoryData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                  />
                                ))}
                              </Pie>
                              <Tooltip content={<PieChartTooltip />} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            No category data available
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm md:text-base">
                        Monthly Spending
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={chartData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient
                                id="colorIncome"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="#3b82f6"
                                  stopOpacity={0.8}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="#3b82f6"
                                  stopOpacity={0.1}
                                />
                              </linearGradient>
                              <linearGradient
                                id="colorExpense"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="#ef4444"
                                  stopOpacity={0.8}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="#ef4444"
                                  stopOpacity={0.1}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="var(--border)"
                              opacity={0.3}
                            />
                            <XAxis
                              dataKey="date"
                              stroke="hsl(var(--foreground))"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              tick={{
                                fill: "hsl(var(--foreground))",
                                fontSize: 12,
                              }}
                              tickFormatter={(value) => {
                                const date = new Date(value);
                                return date.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                });
                              }}
                              height={30}
                              hide={window.innerWidth < 768}
                            />
                            <YAxis
                              stroke="hsl(var(--foreground))"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              tick={{
                                fill: "hsl(var(--foreground))",
                                fontSize: 12,
                              }}
                              tickFormatter={(value) => {
                                if (value >= 1000000) {
                                  return `${(value / 1000000).toFixed(1)}M`;
                                } else if (value >= 1000) {
                                  return `${(value / 1000).toFixed(0)}K`;
                                }
                                return value;
                              }}
                              width={45}
                              hide={window.innerWidth < 768}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar
                              dataKey="income"
                              name="Income"
                              fill="url(#colorIncome)"
                              radius={[4, 4, 0, 0]}
                              barSize={20}
                            />
                            <Bar
                              dataKey="expense"
                              name="Expense"
                              fill="url(#colorExpense)"
                              radius={[4, 4, 0, 0]}
                              barSize={20}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 mb-8">
                  <SmartBudgeting 
                    transactions={transactions} 
                    onNotification={handleBudgetNotification}
                  />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm md:text-base">
                      Spending Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">Highest Expense</h3>
                        {filteredTransactions.filter(
                          (t) => t.transactionType === "expense"
                        ).length > 0 ? (
                          <div>
                            {(() => {
                              const highestExpense = [...filteredTransactions]
                                .filter((t) => t.transactionType === "expense")
                                .sort(
                                  (a, b) =>
                                    Number.parseFloat(b.transactionAmount) -
                                    Number.parseFloat(a.transactionAmount)
                                )[0];

                              return (
                                <>
                                  <p className="text-2xl font-bold text-red-500">
                                    {formatCurrency(
                                      Number.parseFloat(
                                        highestExpense.transactionAmount
                                      )
                                    )}
                                  </p>
                                  <p className="text-muted-foreground capitalize">
                                    {highestExpense.description}
                                  </p>
                                </>
                              );
                            })()}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            No expense data
                          </p>
                        )}
                      </div>

                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">Highest Income</h3>
                        {filteredTransactions.filter(
                          (t) => t.transactionType === "income"
                        ).length > 0 ? (
                          <div>
                            {(() => {
                              const highestIncome = [...filteredTransactions]
                                .filter((t) => t.transactionType === "income")
                                .sort(
                                  (a, b) =>
                                    Number.parseFloat(b.transactionAmount) -
                                    Number.parseFloat(a.transactionAmount)
                                )[0];

                              return (
                                <>
                                  <p className="text-2xl font-bold text-green-500">
                                    {formatCurrency(
                                      Number.parseFloat(
                                        highestIncome.transactionAmount
                                      )
                                    )}
                                  </p>
                                  <p className="text-muted-foreground capitalize">
                                    {highestIncome.description}
                                  </p>
                                </>
                              );
                            })()}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            No income data
                          </p>
                        )}
                      </div>

                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">Savings Rate</h3>
                        {income > 0 ? (
                          <div>
                            <p className="text-2xl font-bold">
                              {Math.round(((income - expense) / income) * 100)}%
                            </p>
                            <p className="text-muted-foreground">
                              of income saved
                            </p>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            No income data
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>

        {/* Edit Transaction Dialog */}
        <Dialog
          open={isEditTransactionOpen}
          onOpenChange={setIsEditTransactionOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
              <DialogDescription>
                Update the details of your transaction.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleUpdateTransaction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What was this transaction for?"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-amount">Amount</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Transaction Type</Label>
                <RadioGroup
                  value={transactionType}
                  onValueChange={setTransactionType}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expense" id="edit-expense" />
                    <Label htmlFor="edit-expense">Expense</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="income" id="edit-income" />
                    <Label htmlFor="edit-income">Income</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={transactionCategory}
                  onValueChange={setTransactionCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories[transactionType].map((category) => (
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

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditTransactionOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-90"
                >
                  Update Transaction
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <ToastContainer />
      </div>
    </ThemeProvider>
  );
};

export default ExpenseTracker;
