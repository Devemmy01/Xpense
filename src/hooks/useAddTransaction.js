import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase-config";
import useGetUserInfo from "./useGetUserInfo";
import { toast } from "react-toastify";

const useAddTransaction = () => {
  const transactionCollectionRef = collection(db, "transactions");
  const userInfo = useGetUserInfo();

  if (!userInfo) {
    return { addTransaction: () => { throw new Error("User not authenticated"); } };
  }

  const { userID } = userInfo;

  const addTransaction = async ({ description, transactionAmount, transactionType, category }) => {
    if (!userID) {
      toast.error("You must be logged in to add transactions", {
        position: "top-right",
        style: { background: "#1E1E1E", color: "white", borderLeft: "4px solid #ef4444" },
      });
      return;
    }

    try {
      await addDoc(transactionCollectionRef, {
        userID,
        description,
        transactionAmount,
        transactionType,
        category,
        createdAt: serverTimestamp(),
      });

      toast.success("Transaction added successfully!", {
        position: "top-right",
        style: { background: "#1E1E1E", color: "white", borderLeft: "4px solid #22c55e" },
      });
      return true;
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Failed to add transaction", {
        position: "top-right",
        style: { background: "#1E1E1E", color: "white", borderLeft: "4px solid #ef4444" },
      });
      return false;
    }
  };

  return { addTransaction };
};

export default useAddTransaction;