import { useEffect, useState } from "react";
import {
  query,
  collection,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../config/firebase-config";
import useGetUserInfo from "./useGetUserInfo";

const useGetTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [transactionTotals, setTransactionTotals] = useState({
    balance: 0.0,
    income: 0.0,
    expense: 0.0
  });
  const [loading, setLoading] = useState(true);
  const transactionCollectionRef = collection(db, "transactions");
  const userInfo = useGetUserInfo();
  const userID = userInfo?.userID;

  const getTransactions = async () => {
    if (!userID) {
      setLoading(false);
      return;
    }

    let unsubscribe;
    try {
      const queryTransactions = query(
        transactionCollectionRef,
        where("userID", "==", userID),
        orderBy("createdAt")
      );

      unsubscribe = onSnapshot(queryTransactions, (snapshot) => {
        let docs = [];

        let totalIncome = 0;
        let totalExpense = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          const id = doc.id;

          docs.push({ ...data, id });

          if (data.transactionType === "expense"){
            totalExpense += Number(data.transactionAmount)
          } else{
            totalIncome += Number(data.transactionAmount)
          }
        });
        setTransactions(docs);

        let balance = totalIncome - totalExpense;

        setTransactionTotals({
          balance,
          income: totalIncome,
          expense: totalExpense
        });

        setLoading(false)
      });
    } catch (err) {
      console.error(err);
      setLoading(false)
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  };

  useEffect(() => {
    getTransactions();
  }, [userID]);

  return { transactions, loading, transactionTotals };
};

export default useGetTransactions;