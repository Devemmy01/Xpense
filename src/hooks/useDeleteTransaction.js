"use client"

import { db } from "../config/firebase-config"
import { deleteDoc, doc } from "firebase/firestore"
import { toast } from "react-toastify"
import useGetUserInfo from "./useGetUserInfo"

const useDeleteTransaction = () => {
  const userInfo = useGetUserInfo()
  
  const deleteTransaction = async (transactionId) => {
    if (!userInfo || !userInfo.userID) {
      toast.error("You must be logged in to delete transactions")
      return
    }
    
    try {
      const transactionRef = doc(db, "transactions", transactionId)
      await deleteDoc(transactionRef)
      toast.success("Transaction deleted successfully", {
        position: "top-right",
        style: { background: "#1E1E1E", color: "white", borderLeft: "4px solid #22c55e" },
      })
      return true
    } catch (error) {
      console.error("Error deleting transaction:", error)
      toast.error("Failed to delete transaction", {
        position: "top-right",
        style: { background: "#1E1E1E", color: "white", borderLeft: "4px solid #ef4444" },
      })
      return false
    }
  }

  return { deleteTransaction }
}

export default useDeleteTransaction
