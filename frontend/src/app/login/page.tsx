"use client";
import { useState } from "react";
// import { auth, GoogleAuthProvider, signInWithPopup } from "../../lib/firebase";
import { FaGoogle } from "react-icons/fa";
import { useAppDispatch } from "../../lib/hooks"; // Import the typed dispatch hook
import { loginSuccess } from "../../lib/features/auth/authSlice"; // Import the loginSuccess action
// import { useRouter } from 'next/navigation';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  // const router = useRouter(); 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Both username and password are required.");
      return;
    }
    
    setLoading(true);

    // const backendUrl = process.env.BACKEND_URL || "";
  
    fetch(`https://livelywalls.onrender.com/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to login");
        }
        return res.json();
      })
      .then((data) => {
        setLoading(false);
        console.log("Logged in user data:", data);
        setError(""); // Clear error if successful

        // Store the token in localStorage
        if (data.success && data.data.token) {
          localStorage.setItem("authToken", data.data.token);
          console.log("Token stored in localStorage:", localStorage.getItem("authToken"));

          // Dispatch the loginSuccess action to update Redux state
          dispatch(loginSuccess(data.data.token));

          // Optionally, redirect the user
          // router.push('/');
        } else {
          setError("Login successful, but token not received.");
          console.error("Token missing in login response:", data);
        }
      })
      .catch((error) => {
        setLoading(false);
        setError("Login failed, please try again.");
        console.error("Error logging in:", error);
      });
  };

  // Google login handler
  const handleGoogleLogin = async () => {
  //   try {
  //     // const provider = new GoogleAuthProvider();
  //     // const result = await signInWithPopup(auth, provider);
  //     const user = result.user;
  //     console.log("Google login successful:", user);
      
  //   } catch (error) {
  //     setError("Google login failed, please try again.");
  //     console.error("Error with Google login:", error);
  //   }
  };

  return (
    <div className="mt-6 flex justify-center">
      <div className="bg-white p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        {/* Normal Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="text"
              id="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className={`w-full py-2 px-4 ${
              loading ? "bg-gray-400" : "bg-blue-600"
            } text-white font-bold rounded-md hover:bg-blue-700`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Google Login Button */}
        <div className="mt-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full py-2 px-4 bg-blue-50 rounded-md hover:bg-blue-100 border border-blue-200 flex items-center justify-center gap-2"
            aria-label="Login with Google"
          >
            <FaGoogle />
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
