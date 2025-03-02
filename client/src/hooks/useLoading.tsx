import { createContext, useContext } from "react";
export const LoadingContext = createContext({
    isLoading: false,
    setIsLoading: (loading: boolean) => { console.log(loading); }
  });
export const useLoading = () => useContext(LoadingContext);