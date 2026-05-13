import { createBrowserRouter } from "react-router";
import Register from "./src/features/auth/pages/Register.jsx";
import Login from "./src/features/auth/pages/Login.jsx";
import Home from "./src/features/expression/pages/Home.jsx";
import Protected from "./src/features/auth/components/Protected.jsx";

const router = createBrowserRouter([
        {
            path: "/register",
            element: <Register/>
        },
        {
            path: "/login",
            element: <Login/>
        },
        {
            path: "/",
            element: (
                <Protected>
                    <Home />
                </Protected>
            ),
        }
    ]);

export default router;