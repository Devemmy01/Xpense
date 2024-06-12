import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import useAddTransaction from "@/hooks/useAddTransaction";
import useGetTransactions from "@/hooks/useGetTransactions";
import useGetUserInfo from "@/hooks/useGetUserInfo";
import Loader from "@/components/ui/loader";
import { auth } from "@/config/firebase-config";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


const ExpenseTracker = () => {
  const transaction = useAddTransaction();
  const navigate = useNavigate();

  const [description, setDescription] = useState("");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionType, setTransactionType] = useState("expense");

  if (!transaction) {
    return <div>Loading...</div>; // or return some default component
  }

  const { addTransaction } = transaction;
  const { transactions, loading, transactionTotals } = useGetTransactions();
  const { displayName, PhotoURL, email } = useGetUserInfo();

  const { balance, income, expense } = transactionTotals;

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

  const getShortTransactionType = (type) => {
    if (type === "expense") return "-";
    if (type === "income") return "+";
  }

  const onSubmit = (e) => {
    e.preventDefault();
    addTransaction({
      description,
      transactionAmount: parseFloat(transactionAmount),
      transactionType,
    });

    setDescription("");
    setTransactionAmount("");
    toast("Transaction added! ✅", {
      style: { background: "black", color: "white" },
      progressStyle: { background: "orange" }
    });
  };

  const signOut = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  const signOutButton = (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button
          style={{
            background: "linear-gradient(45deg, #ff0040, #ff9900)",
          }}
          className="signout"
        >
          <i className="bx bx-log-out text-xl"></i>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-[#09090b] border-none">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Are you sure you want to sign out?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will log you out of your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction style={{
            background: "linear-gradient(45deg, #ff0040, #ff9900)",
          }} onClick={signOut}>Sign Out</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );


  const getInitials = (name) => {
    if (!name) return "";
    const initials = name
      .split(" ")
      .map((word) => word[0])
      .join("");
    return initials.toUpperCase();
  };

  return (
    <div className="bg-[#09090b] pt-10 md:pt-7 px-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-[550px]">
        <div>
          <div className="flex justify-between">
            <div className="flex gap-3">
              {PhotoURL ? (
                <div>
                  <img src={PhotoURL} alt="Profile" />
                  <p className="text-white text-[17px] font-semibold">{email}</p>
                </div>
              ) : (
                <div>
                  <div className="profile-fallback font-bold">
                    {getInitials(displayName)}
                  </div>
                </div>
              )}
              <h1 className="text-white font-bold font-Mon flex items-center">
                Hello, {getFirstName(displayName)} 👋
              </h1>
            </div>

            {signOutButton}
            {/* <Button
              style={{
                background: "linear-gradient(45deg, #ff0040, #ff9900)",
              }}
              className="signout"
              onClick={signOut}
            >
              <i className="bx bx-log-out text-xl"></i>
            </Button> */}
          </div>
        </div>
        <div className="">
          <div
            style={{
              background: "linear-gradient(45deg, #ff0040, #ff9900)",
            }}
            className="balance w-full mt-10 rounded-[15px] h-[120px] text-center flex flex-col items-center justify-center"
          >
            <h3 className="text-white text-xl font-semibold">Balance</h3>
            {balance >= 0 ? (
              <h2 className="text-white text-4xl font-bold font-Mon">
                {formatCurrency(balance)}
              </h2>
            ) : (
              <h2 className="text-white text-4xl font-bold font-Mon">
                -{formatCurrency(balance * -1)}
              </h2>
            )}
          </div>
          <div className="flex gap-2 -mt-8">
            <div
              style={{
                background: "linear-gradient(45deg, #ff0040, #ff9900)",
              }}
              className="balance w-full mt-10 rounded-[15px] h-[120px] text-center flex flex-col items-center justify-center"
            >
              <h4 className="text-white text-xl font-semibold">Income</h4>
              <p className="text-white text-2xl md:text-4xl font-bold font-Mon">
                {formatCurrency(income)}
              </p>
            </div>
            <div
              style={{
                background: "linear-gradient(45deg, #ff0040, #ff9900)",
              }}
              className="balance w-full mt-10 rounded-[15px] h-[120px] text-center flex flex-col items-center justify-center"
            >
              <h3 className="text-white text-xl font-semibold">Expenses</h3>
              <p className="text-white text-2xl md:text-4xl font-bold font-Mon">
                {formatCurrency(expense)}
              </p>
            </div>
          </div>

          <form className="flex flex-col gap-5 mt-5" onSubmit={onSubmit}>
            <input
              className="bg-transparent text-white p-2 outline-none border rounded-[10px]"
              type="text"
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              value={description}
              required
            />
            <input
              className="bg-transparent text-white p-2 outline-none border rounded-[10px]"
              type="number"
              onChange={(e) => setTransactionAmount(e.target.value)}
              placeholder="Amount"
              value={transactionAmount}
              required
            />
            <div className="flex gap-8">
              <div className="flex gap-2">
                <label htmlFor="expense" className="text-white">
                  Expense
                </label>
                <input
                  type="radio"
                  onChange={(e) => setTransactionType(e.target.value)}
                  id="expense"
                  value="expense"
                  checked={transactionType === "expense"}
                />
              </div>
              <div className="flex gap-2">
                <label htmlFor="income" className="text-white">
                  Income
                </label>
                <input
                  type="radio"
                  onChange={(e) => setTransactionType(e.target.value)}
                  id="income"
                  value="income"
                  checked={transactionType === "income"}
                />
              </div>
            </div>

            <Button
              style={{ background: "linear-gradient(45deg, #ff0040, #ff9900)" }}
              className="text-xl "
              type="submit"
            >
              Add Transaction
            </Button>
            <ToastContainer />
          </form>
        </div>
      </div>

      <div className="w-full max-w-[550px] mt-10 mb-10">
        <h3 className="text-white text-[25px] font-Ojuju font-bold mb-2">
          Transactions
        </h3>
        {loading ? (
          <div className="w-full flex items-center justify-center mt-4 ">
            <Loader />
          </div>
        ) : (
          <ul className="h-[400px] overflow-scroll">
            {transactions.map((transaction) => {
              const {
                id,
                description,
                transactionAmount,
                transactionType,
                createdAt,
              } = transaction;
              const date = createdAt
                ? format(createdAt.toDate(), "MMMM d, yyyy h:mm a")
                : "Date not available";
              return (
                <li
                  key={id}
                  className="bg-gray-900 bg-opacity-20 p-4 rounded-lg mb-2 flex justify-between mt-3"
                >
                  <div className="flex flex-col">
                    <h4 className="text-white capitalize font-semibold"> {description} </h4>
                    <p className="text-gray-400 text-sm">{date}</p>
                  </div>

                  <p className="text-white flex gap-1 font-semibold">
                    {formatCurrency(parseFloat(transactionAmount))}
                    <label
                      style={{
                        color: transactionType === "expense" ? "red" : "green",
                      }}
                    >
                      {getShortTransactionType(transactionType)}
                    </label>
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ExpenseTracker;
