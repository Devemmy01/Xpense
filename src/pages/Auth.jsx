import React from 'react'
import { Button } from '@/components/ui/button'
import { auth, provider } from "../config/firebase-config"
import { signInWithPopup } from "firebase/auth"
import { useNavigate } from 'react-router-dom'

const Auth = () => {
  const navigate = useNavigate()

  const signInWithGoogle = async () => {
    const results = await signInWithPopup(auth, provider)
    console.log(results)

    const authInfo = {
      displayName: results.user.displayName,
      email: results.user.email,
      photoURL: results.user.photoURL,
      userID: results.user.uid,
      isAuth: true
    }
    localStorage.setItem("authInfo", JSON.stringify(authInfo))
    navigate("/expense_tracker")
  }

  return (
    <div className="">
      <Button className="" onClick={signInWithGoogle}>Sign in with Google</Button>
    </div>
  )
}

export default Auth