import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { auth, provider } from "../config/firebase-config";
import { signInWithPopup } from "firebase/auth";
import { useNavigate, Navigate } from "react-router-dom";
import Loader from "@/components/ui/loader";
import useGetUserInfo from "@/hooks/useGetUserInfo";

const Auth = () => {
  const navigate = useNavigate();
  const [isSigningIn, setIsSigningIn] = useState(false); // State to manage the popup request
  const { isAuth } = useGetUserInfo();

  const signInWithGoogle = async () => {
    if (isSigningIn) return; // Prevent multiple popups
    setIsSigningIn(true); // Set the state to true to indicate a popup is in progress

    try {
      const results = await signInWithPopup(auth, provider);
      console.log(results);

      const authInfo = {
        displayName: results.user.displayName,
        email: results.user.email,
        photoURL: results.user.photoURL,
        userID: results.user.uid,
        isAuth: true,
      };
      localStorage.setItem("authInfo", JSON.stringify(authInfo));
      navigate("/expense_tracker");
    } catch (err) {
      console.error("Authentication error:", err);
    } finally {
      setIsSigningIn(false);
    }
  };

  if (isAuth) {
    return <Navigate to="/expense_tracker" />;
  }

  return (
    <div className="">
      {/* {loading && <Loader />} */}
      <Button className="" disabled={isSigningIn} onClick={signInWithGoogle}>
        {isSigningIn ? (
          <Loader />
        ) : (
          "Sign in with Google"
        )}
      </Button>
    </div>
  );
};

export default Auth;
