import { useState, useEffect } from "react";
import { db } from "../config/firebase-config";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import useGetUserInfo from "./useGetUserInfo";

const useManageBudgets = () => {
  const [budgets, setBudgets] = useState({});
  const [loading, setLoading] = useState(true);
  const userInfo = useGetUserInfo();
  const userID = userInfo?.userID;

  useEffect(() => {
    const fetchBudgets = async () => {
      if (!userID) {
        setLoading(false);
        return;
      }

      try {
        const budgetRef = doc(db, "budgets", userID);
        const budgetDoc = await getDoc(budgetRef);

        if (budgetDoc.exists()) {
          setBudgets(budgetDoc.data());
        } else {
          // Initialize with empty budgets if none exist
          await setDoc(budgetRef, {});
          setBudgets({});
        }
      } catch (error) {
        console.error("Error fetching budgets:", error);
        setBudgets({});
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets();
  }, [userID]);

  const updateBudget = async (category, amount) => {
    if (!userID) {
      console.error("Cannot update budget: User not authenticated");
      return false;
    }

    try {
      const budgetRef = doc(db, "budgets", userID);
      
      // If document doesn't exist, create it first
      const docSnap = await getDoc(budgetRef);
      if (!docSnap.exists()) {
        await setDoc(budgetRef, {});
      }
      
      await updateDoc(budgetRef, {
        [category]: Number(amount)
      });

      setBudgets(prev => ({
        ...prev,
        [category]: Number(amount)
      }));

      return true;
    } catch (error) {
      console.error("Error updating budget:", error);
      return false;
    }
  };

  return { budgets, loading, updateBudget };
};

export default useManageBudgets; 