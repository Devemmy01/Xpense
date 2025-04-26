import React from "react"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import Auth from "./pages/Auth"
import ExpenseTracker from "./pages/ExpenseTracker"

function App() {
  return (
    <div className="min-h-screen">
      <Router>
        <Routes>
          <Route path="/" exact element={<Auth />}/>
          <Route path="expense_tracker" element={<ExpenseTracker />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App