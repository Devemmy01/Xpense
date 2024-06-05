import React from "react";
import useAddTransaction from "@/hooks/useAddTransaction";

const ExpenseTracker = () => {
  const transaction = useAddTransaction();

  if (!transaction) {
    return <div>Loading...</div>; // or return some default component
  }

  const { addTransaction } = transaction;

  const onSubmit = (e) => {
    e.preventDefault();
    addTransaction({ description: "gamepad", amount: 6000, type: "expense" });
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
            <input type="text" placeholder="Description" required />
            <input type="number" placeholder="Amount" required />
            <input type="radio" id="expense" value="expense" />
            <label htmlFor="expense">Expense</label>
            <input type="radio" id="income" value="income" />
            <label htmlFor="income">Income</label>

            <button className="" type="submit">
              Add Transaction
            </button>
          </form>
        </div>
      </div>

      <div className="transactions"></div>
    </>
  );
};

export default ExpenseTracker;
