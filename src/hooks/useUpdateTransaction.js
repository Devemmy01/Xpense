"use client"

import { db } from "../config/firebase-config"
import { doc, updateDoc } from "firebase/firestore"
import { toast } from "react-toastify"
import useGetUserInfo from "./useGetUserInfo"

const useUpdateTransaction = () => {
  const userInfo = useGetUserInfo()
  
  const updateTransaction = async (transactionId, updatedData) => {
    if (!userInfo || !userInfo.userID) {
      toast.error("You must be logged in to update transactions")
      return
    }
    
    try {
      const transactionRef = doc(db, "transactions", transactionId)
      await updateDoc(transactionRef, updatedData)
      toast.success("Transaction updated successfully", {
        position: "top-right",
        style: { background: "#1E1E1E", color: "white", borderLeft: "4px solid #22c55e" },
      })
      return true
    } catch (error) {
      console.error("Error updating transaction:", error)
      toast.error("Failed to update transaction", {
        position: "top-right",
        style: { background: "#1E1E1E", color: "white", borderLeft: "4px solid #ef4444" },
      })
      return false
    }
  }

  return { updateTransaction }
}

export default useUpdateTransaction
