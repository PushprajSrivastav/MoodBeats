import { createContext, useState, useEffect } from "react";
import { getMe } from "./features/auth/services/auth.api.js";

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getMe()
                setUser(data.user)
            } catch (error) {
                // Ignore 401 errors, as they just mean the user is not logged in
                if (error.response && error.response.status !== 401) {
                    console.log(error)
                }
            } finally {
                setLoading(false)
            }
        }
        fetchUser()
    }, [])

    return (
        <AuthContext.Provider value={{
            user, setUser, loading, setLoading

        }}>
            {children}
        </AuthContext.Provider>
    )
}   