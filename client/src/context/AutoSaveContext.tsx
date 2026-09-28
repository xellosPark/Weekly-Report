import React, { createContext, useCallback, useContext, useRef } from "react";

type Getter = () => unknown | Promise<unknown> | null;

type AutoSaveContextType = {
    setGetter: (getter: Getter | null) => void;
    getSnapshot: () => Promise<unknown | null>;
};

const AutoSaveContext = createContext<AutoSaveContextType | null>(null);

export const AutoSaveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const getterRef = useRef<Getter | null>(null);

    const setGetter = useCallback((getter: Getter | null) => {
        getterRef.current = getter;
    }, []);

    const getSnapshot = useCallback(async () => {
        const g = getterRef.current;
        if (!g) return null;
        const v = g();
        return v instanceof Promise ? await v : v;
    }, []);

    return (
        <AutoSaveContext.Provider value={{ setGetter, getSnapshot }}>
            {children}
        </AutoSaveContext.Provider>
    );
};

export const useAutoSaveContext = () => {
    const ctx = useContext(AutoSaveContext);
    if (!ctx) throw new Error("useAutoSaveContext must be used within AutoSaveProvider");
    return ctx;
}