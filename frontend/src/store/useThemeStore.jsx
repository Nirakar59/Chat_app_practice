import { create } from "zustand";

export const useThemeStore = create((set)=> (
    {
        theme: localStorage.getItem("color-theme")||"fantasy",

        setTheme: (theme)=>{
             localStorage.setItem("color-theme", theme)
             set({theme})
        }
    }
))