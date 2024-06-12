import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { auth, provider } from "../config/firebase-config";
import { signInWithPopup } from "firebase/auth";
import { useNavigate, Navigate } from "react-router-dom";
import Loader from "@/components/ui/loader";
import useGetUserInfo from "@/hooks/useGetUserInfo";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Img from "../assets/auth.png";
import logo from "../assets/log.png";

const Auth = () => {
  const navigate = useNavigate();
  const [isSigningIn, setIsSigningIn] = useState(false); // State to manage the popup request
  const { isAuth } = useGetUserInfo() || {};

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
      toast("Sign in successful! ✅", {
        style: { background: "black", color: "white" },
        progressStyle: { background: "orange" }
      });
      navigate("/expense_tracker");
    } catch (err) {
      toast("Sign in failed! ❌", {
        style: { background: "black", color: "white" },
        progressStyle: { background: "orange" }
      });
      console.error("Authentication error:", err);
    } finally {
      setIsSigningIn(false);
    }
  };

  if (isAuth) {
    return <Navigate to="/expense_tracker" />;
  }

  return (
    <div className="bg-[#09090b] h-screen pb-20 flex flex-col items-center justify-center">
      <img src={logo} className="w-[80px] h-[px] md:w-[100px] md:h-[60px] absolute hidden md:flex md:left-20 top-5" alt="logo" />
      <img src={Img} alt="auth_image" className="" />
      <div className="px-3 md:px-7 -mt-10 flex flex-col gap-2">
        <h1 className="text-white tracking-wider text-5xl md:text-[55px] leading-[3rem] font-Ojuju font-[900]">
          Never Lose Track of <span className="text">Expenses</span> Again
        </h1>
        <p className="text-white text-[16px] md:text-xl font-Mon">
          Your ultimate companion for hassle-free expense management
        </p>
      </div>
      <Button style={{
        background: 'linear-gradient(45deg, #ff0040, #ff9900)',
        color: 'transparent',
      }} className="p-8 w-[60px] rounded-full mt-7 absolute bottom-3 right-4 cursor-pointer md:bottom-7 md:right-12" disabled={isSigningIn} onClick={signInWithGoogle}>
        {isSigningIn ? <Loader /> : <i class='bx bx-right-arrow-alt -rotate-45 text-4xl text-black'></i>}
      </Button>
    </div>
  );
};

export default Auth;
