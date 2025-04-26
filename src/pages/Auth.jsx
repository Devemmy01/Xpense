import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { auth, provider } from "../config/firebase-config";
import { signInWithPopup } from "firebase/auth";
import { useNavigate, Navigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { ThemeProvider } from "../components/theme-provider";
import { ThemeToggle } from "../components/theme-toggle";
import logo from "../assets/log.png";
import useGetUserInfo from "../hooks/useGetUserInfo";

const Auth = () => {
  const navigate = useNavigate();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { isAuth } = useGetUserInfo() || {};

  const signInWithGoogle = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);

    try {
      const results = await signInWithPopup(auth, provider);

      const authInfo = {
        displayName: results.user.displayName,
        email: results.user.email,
        photoURL: results.user.photoURL,
        userID: results.user.uid,
        isAuth: true,
      };
      localStorage.setItem("authInfo", JSON.stringify(authInfo));
      toast.success("Sign in successful!", {
        position: "top-right",
        style: {
          background: "#1E1E1E",
          color: "white",
          borderLeft: "4px solid #22c55e",
        },
      });
      navigate("/expense_tracker");
    } catch (err) {
      toast.error("Sign in failed!", {
        position: "top-right",
        style: {
          background: "#1E1E1E",
          color: "white",
          borderLeft: "4px solid #ef4444",
        },
      });
      console.error("Authentication error:", err);
    } finally {
      setIsSigningIn(false);
    }
  };

  if (isAuth) {
    return <Navigate to="/expense_tracker" />;
  }

  return (
    <ThemeProvider defaultTheme="dark">
      <div className="p-4 max-w-6xl mx-auto flex items-center justify-between">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className=""
      >
        <img
          src={logo || "/placeholder.svg"}
          className="w-[60px] h-auto"
          alt="logo"
        />
      </motion.div>

      <ThemeToggle />
      </div>
      <div className="min-h-screen bg-background flex items-center justify-center transition-colors duration-300">
        <div className="w-full max-w-6xl flex flex-col px-6 gap-8">
          {/* Bento Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6"
          >
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-gradient-to-br from-blue-500/10 to-indigo-600/10 p-6 rounded-2xl border border-blue-500/20 shadow-lg relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-500 mb-4"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <h3 className="text-xl font-bold mb-2">Expense Tracking</h3>
              <p className="text-muted-foreground">
                Track all your expenses in one place with smart categorization
                and real-time updates.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-gradient-to-br from-indigo-500/10 to-purple-600/10 p-6 rounded-2xl border border-indigo-500/20 shadow-lg row-span-2 relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-xl"></div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-indigo-500 mb-4"
              >
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
              <h3 className="text-xl font-bold mb-2">Advanced Analytics</h3>
              <p className="text-muted-foreground mb-4">
                Gain valuable insights with interactive charts and detailed
                spending analysis.
              </p>

              <div className="mt-4 p-2 bg-background/60 rounded-lg flex items-center justify-between text-sm">
                <div>Monthly Savings</div>
                <div className="font-bold text-green-500">+24%</div>
              </div>
              <div className="mt-2 p-2 bg-background/60 rounded-lg flex items-center justify-between text-sm">
                <div>Budget Adherence</div>
                <div className="font-bold text-blue-500">92%</div>
              </div>
              <div className="mt-2 p-2 bg-background/60 rounded-lg flex items-center justify-between text-sm">
                <div>Top Category</div>
                <div className="font-bold">Groceries</div>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 p-6 rounded-2xl border border-purple-500/20 shadow-lg relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl"></div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-purple-500 mb-4"
              >
                <path d="M2 9h20M9 21V9M15 21V9" />
                <path d="M5 6V3h14v3" />
              </svg>
              <h3 className="text-xl font-bold mb-2">Smart Budgeting</h3>
              <p className="text-muted-foreground">
                Create custom budgets and get notifications when you're
                approaching limits.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 p-6 rounded-2xl border border-green-500/20 shadow-lg relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/10 rounded-full blur-xl"></div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-500 mb-4"
              >
                <path d="M12 2v8M12 22v-8M4.93 10.93l6.36 6.36M18.36 7.64l-4.95 4.95" />
              </svg>
              <h3 className="text-xl font-bold mb-2">Financial Goals</h3>
              <p className="text-muted-foreground">
                Set and achieve your financial goals with progress tracking and
                recommendations.
              </p>
            </motion.div>
          </motion.div>

          {/* Sign In Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="bg-gradient-to-br from-blue-500/10 to-indigo-600/10 p-4 md:p-8 rounded-2xl border border-blue-500/20 shadow-lg relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-xl"></div>
            <div className="flex flex-col items-center text-center">
              <h3 className="text-2xl font-bold mb-2">Ready to Get Started?</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Sign in with your Google account to start managing your expenses
                with our powerful tools.
              </p>
              <Button
                onClick={signInWithGoogle}
                disabled={isSigningIn}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 text-white px-8 py-6 rounded-xl text-lg font-medium flex items-center gap-3 transition-all"
              >
                {isSigningIn ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <>
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
                      className="lucide lucide-log-in"
                    >
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                      <polyline points="10 17 15 12 10 7" />
                      <line x1="15" x2="3" y1="12" y2="12" />
                    </svg>
                    Sign in with Google
                  </>
                )}
              </Button>
            </div>
          </motion.div>

          <ToastContainer />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Auth;
