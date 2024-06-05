import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/config/firebase-config";
import useGetUserInfo from "@/hooks/useGetUserInfo";

const useAddTransaction = () => {
  const transactionCollectionRef = collection(db, "transactions");
  const userInfo = useGetUserInfo();

  if (!userInfo) {
    return { addTransaction: () => { throw new Error("User not authenticated"); } };
  }

  const { userID } = userInfo;

  const addTransaction = async ({ description, amount, type }) => {
    if (!userID) {
      throw new Error("User ID is missing");
    }

    await addDoc(transactionCollectionRef, {
      userID,
      description,
      amount,
      type,
      createdAt: serverTimestamp(),
    });
  };

  return { addTransaction };
};

export default useAddTransaction;
