import React, { useEffect, useState } from "react";
import { query, collection, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase-config";
import useGetUserInfo from "./useGetUserInfo";

const useGetTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const transactionCollectionRef = collection(db, "transactions");
  const { userID } = useGetUserInfo();

  const getTransactions = async () => {
    try {
      const queryTransactions = query(
        transactionCollectionRef,
        where("userID", "==", userID),
        orderBy("createdAt")
      );

      onSnapshot(queryTransactions, (snapshot) => {
        
      })
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getTransactions();
  }, []);

  return { transactions };
};

export default useGetTransactions;
