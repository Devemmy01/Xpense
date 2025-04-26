import { useEffect, useState } from "react"

const useGetUserInfo = () => {
  const [userInfo, setUserInfo] = useState(null)

  useEffect(() => {
    try {
      const storedAuthInfo = localStorage.getItem("authInfo")
      if (storedAuthInfo) {
        const authInfo = JSON.parse(storedAuthInfo)
        setUserInfo(authInfo)
      } else {
        setUserInfo({
          displayName: null,
          photoURL: null,
          email: null,
          userID: null,
          isAuth: false,
        })
      }
    } catch (error) {
      console.error("Error parsing auth info:", error)
      setUserInfo({
        displayName: null,
        photoURL: null,
        email: null,
        userID: null,
        isAuth: false,
      })
    }
  }, [])

  return userInfo
}

export default useGetUserInfo;
