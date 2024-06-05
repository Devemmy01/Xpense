const useGetUserInfo = () => {
    const auth = localStorage.getItem("authInfo");
  
    if (!auth) {
      return null; // or return some default object
    }
  
    const { displayName, PhotoURL, userID, email, isAuth } = JSON.parse(auth);
  
    return { displayName, PhotoURL, userID, email, isAuth };
  };
  
  export default useGetUserInfo;