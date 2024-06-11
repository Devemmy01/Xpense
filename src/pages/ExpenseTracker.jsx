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
  const navigate = useNavigate()

  const [description, setDescription] = useState("");
  const [transactionAmount, setTransactionAmount] = useState(0);
  const [transactionType, setTransactionType] = useState("expense");

  if (!transaction) {
    return <div>Loading...</div>; // or return some default component
  }

  const { addTransaction } = transaction;
  const { transactions, loading, transactionTotals } = useGetTransactions();
  const { displayName, PhotoURL, email } = useGetUserInfo();

  const { balance, income, expense } = transactionTotals;

  const onSubmit = (e) => {
    e.preventDefault();
    addTransaction({ description, transactionAmount, transactionType });

    setDescription("");
    setTransactionAmount("");
  };

  const signOut = async () => {
    try{
      await signOut(auth);
      localStorage.clear()
      navigate("/")
    } catch (err){
      console.error(err)
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
    <>
      <div>
        <div className="container">
          <h1>{displayName}'s Expense Tracker</h1>
          <div className="balance">
            <h3>Your Balance</h3>
            {balance >= 0 ? (
            <h2>₦ {balance}</h2>
            ) : (
            <h2>-₦ {balance * - 1}</h2>

            )}
          </div>
          <div className="summary">
            <div>
              <h4>Income</h4>
              <p>₦ {income}</p>
            </div>
            <div>
              <h3>Expenses</h3>
              <p>₦ {expense}</p>
            </div>
          </div>

          <form className="add_transaction" onSubmit={onSubmit}>
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
        <div className="profile">
          {PhotoURL ? (
            <div>
              <img src={PhotoURL} alt="Profile" />
              <p className="text-[#000] text-[15px] font-semibold">{email}</p>
            </div>
          ) : (
            <div>
              <div className="profile-fallback font-bold">{getInitials(displayName)}</div>
              <p className="text-[#000] text-[15px] font-semibold">{email}</p>
            </div>
          )}
          <Button className="signout" onClick={signOut}>
            Sign Out
          </Button>
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
                    ${transactionAmount} .{" "}
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
    </>
  );
};

export default ExpenseTracker;
