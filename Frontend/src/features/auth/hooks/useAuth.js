import { login, register, getMe, logout } from "../services/auth.api.js";
import { useContext } from "react";
import { AuthContext } from "../../../../src/auth.context.jsx";
import toast from "react-hot-toast";

export const useAuth = () => {
    const context = useContext(AuthContext);
    const { user, setUser, loading, setLoading } = context;

    async function handleLogin(email, password){
        try {
            setLoading(true);
            const data = await login(email, password);
            setUser(data.user);
            toast.success("Login successful!");
        } catch (error) {
            console.error("Login failed:", error.response?.data?.message || error.message);
            toast.error(error.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);  
        }
    }
    async function handleRegister(email, password, username){
        try {
            setLoading(true);
            await register(email, password, username);
            toast.success("User registered successfully...");
            return true;
        } catch (error) {
            console.error("Registration failed:", error.response?.data?.message || error.message);
            toast.error(error.response?.data?.message || "Registration failed");
            return false;
        } finally {
            setLoading(false);
        }
    }
    async function handleGetMe() {
       setLoading(true);
       const data = await getMe();
       setUser(data.user);
       setLoading(false);
    }
    async function handleLogout(){
        setLoading(true);
        await logout();
        setUser(null);  
        setLoading(false);
    }
    return {
        handleLogin,
        handleRegister,
        handleGetMe,
        handleLogout,
        user,
        loading,
        setLoading,
        setUser
    }
}   