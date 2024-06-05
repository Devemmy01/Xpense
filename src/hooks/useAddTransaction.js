import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/config/firebase-config";
import { useGetUserInfo } from "./useGetUserInfo";

const useAddTransaction = () => {
  const transactionCollectionRef = collection(db, "transactions");
  const { userID } = useGetUserInfo();

  const addTransaction = async ({ description, amount, type }) => {
    await addDoc(transactionCollectionRef, {
      userID,
      description,
      amount,
      type,
      createdAt: serverTimestamp(),
    });
  };

  return;
};

export default useAddTransaction;
