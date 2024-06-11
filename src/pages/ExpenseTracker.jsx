import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import useAddTransaction from "@/hooks/useAddTransaction";
import useGetTransactions from "@/hooks/useGetTransactions";
import useGetUserInfo from "@/hooks/useGetUserInfo";
import Loader from "@/components/ui/loader";
import { auth } from "@/config/firebase-config";
import { useNavigate } from "react-router-dom";

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
    if(!fullName) return "";
    return fullName.split(" ")[0];
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
      <div className="w-full md:w-[]">
        <div>
          <div className="flex justify-between">
            <div className="flex gap-3">
              {PhotoURL ? (
                <div>
                  <img src={PhotoURL} alt="Profile" />
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

            <Button style={{
              background: "linear-gradient(45deg, #ff0040, #ff9900)",
            }} className="signout" onClick={signOut}>
            <i className='bx bx-log-out text-xl'></i>
            </Button>
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

          <form className="flex flex-col" onSubmit={onSubmit}>
            <input
              type="text"
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              value={description}
              required
            />
            <input
              type="number"
              onChange={(e) => setTransactionAmount(e.target.value)}
              placeholder="Amount"
              value={transactionAmount}
              required
            />
            <input
              type="radio"
              onChange={(e) => setTransactionType(e.target.value)}
              id="expense"
              value="expense"
              checked={transactionType === "expense"}
            />
            <label htmlFor="expense">Expense</label>
            <input
              type="radio"
              onChange={(e) => setTransactionType(e.target.value)}
              id="income"
              value="income"
              checked={transactionType === "income"}
            />
            <label htmlFor="income">Income</label>

            <Button className="" type="submit">
              Add Transaction
            </Button>
          </form>
        </div>
      </div>

      <div className="transactions">
        <h3>Transactions</h3>
        {loading ? (
          <Loader />
        ) : (
          <ul>
            {transactions.map((transaction) => {
              const { id, description, transactionAmount, transactionType } =
                transaction;
              return (
                <li key={id}>
                  <h4> {description} </h4>
                  <p>
                    {formatCurrency(parseFloat(transactionAmount))}
                    <label
                      style={{
                        color: transactionType === "expense" ? "red" : "green",
                      }}
                    >
                      {transactionType}
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
