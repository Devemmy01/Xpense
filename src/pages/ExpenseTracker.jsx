import React, { useState } from "react";
import { Button } from '@/components/ui/button'
import useAddTransaction from "@/hooks/useAddTransaction";
import useGetTransactions from "@/hooks/useGetTransactions";

const ExpenseTracker = () => {
  const transaction = useAddTransaction();

  const [description, setDescription] = useState("");
  const [transactionAmount, setTransactionAmount] = useState(0);
  const [transactionType, setTransactionType] = useState("expense");

  if (!transaction) {
    return <div>Loading...</div>; // or return some default component
  }

  const { addTransaction } = transaction;
  const { transactions } = useGetTransactions()

  const onSubmit = (e) => {
    e.preventDefault();
    addTransaction({ description, transactionAmount, transactionType });
  };
  return (
    <>
      <div>
        <div className="container">
          <h1>Expense Tracker</h1>
          <div className="balance">
            <h2>Your Balance</h2>
            <h3>$0.00</h3>
          </div>
          <div className="summary">
            <div>
              <h4>Income</h4>
              <p>$0.00</p>
            </div>
            <div>
              <h3>Expenses</h3>
              <p>$0.00</p>
            </div>
          </div>

          <form className="add_transaction" onSubmit={onSubmit}>
            <input
              type="text"
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              required
            />
            <input
              type="number"
              onChange={(e) => setTransactionAmount(e.target.value)}
              placeholder="Amount"
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
        <ul>
          {transactions.map((transaction) => {
            const { description, transactionAmount, transactionType } = transaction;
            return (
              <li>
                <h4> { description } </h4>
                <p>
                  ${transactionAmount} . <label style={{color: transactionType === "expense" ? "red" : "green"}}>{transactionType}</label>
                </p>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  );
};

export default ExpenseTracker;
