import { RouterProvider } from "react-router";
import router from "../app.routes.jsx";
import "./features/shared/styles/global.scss";
import { AuthProvider } from "./auth.context";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <AuthProvider>
        <Toaster position="top-center" reverseOrder={false} />
        <RouterProvider router={router} />
      </AuthProvider>
    </>
  )
}

export default App
