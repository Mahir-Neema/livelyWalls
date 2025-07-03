"use client";
import { useState, useEffect } from "react";
import { auth, provider, signInWithPopup } from "@/lib/firebase";
import { FaGoogle } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { loginSuccess } from "@/lib/features/auth/authSlice";
import { useRouter } from "next/navigation";

const Login = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isUserRegistered, setIsUserRegistered] = useState<null | boolean>(
    null
  );
  const [continueClicked, setContinueClicked] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const checkUserRegistration = async () => {
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        "https://livelywalls.onrender.com/auth/is-user-registered",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const resData = await res.json();
      setLoading(false);

      if (!res.ok) {
        throw new Error("User check failed");
      }

      setIsUserRegistered(resData.data.isUserRegistered === "true");
      setName(resData.data.name || "");
      setContinueClicked(true);
    } catch (err) {
      console.error("Check registration failed:", err);
      setError("Could not verify user. Please try again.");
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("https://livelywalls.onrender.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("authToken", data.data.token);
      dispatch(loginSuccess(data.data.token));
    } catch (err) {
      console.error(err);
      setError("Login failed. Check your password.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      setLoading(false);
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    try {
      const res = await fetch("https://livelywalls.onrender.com/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      localStorage.setItem("authToken", data.data.token);
      dispatch(loginSuccess(data.data.token));
    } catch (err) {
      console.error(err);
      setError("Signup failed. Try again. err");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const res = await fetch("https://livelywalls.onrender.com/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Google login failed");

      localStorage.setItem("authToken", data.token);
      dispatch(loginSuccess(data.token));
    } catch (error) {
      setError("Google login failed, please try again.");
      console.error("Error with Google login:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 flex justify-center">
      <div className="bg-white p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        {!continueClicked ? (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border rounded-md"
              required
            />
            <button
              onClick={checkUserRegistration}
              disabled={loading || !email}
              className={`w-full py-2 px-4 font-bold rounded-md ${
                !email || loading
                  ? "bg-slate-700 text-white cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {loading ? "Checking..." : "Continue"}
            </button>
          </div>
        ) : isUserRegistered ? (
          // Returning user
          <form onSubmit={handleLogin} className="space-y-4">
            <h3 className="text-xl font-semibold">Welcome Back, {name}!</h3>
            <p className="text-sm text-gray-600">{email}</p>

            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border rounded-md"
              required
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          // New user
          <form onSubmit={handleSignup} className="space-y-4">
            <h3 className="text-xl font-semibold">Hi, Please Sign Up</h3>
            <p className="text-sm text-gray-600">
              Your Home, Just a Click Away.
            </p>

            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border rounded-md"
              required
            />

            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border rounded-md"
              required
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-green-600 text-white font-bold rounded-md hover:bg-green-700"
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>
        )}

        {/* Google Login */}
        <div className="mt-6">
          <button
            onClick={handleGoogleLogin}
            className="w-full py-2 px-4 bg-slate-900 rounded-md hover:bg-slate-800 border flex items-center justify-center gap-2 text-white"
            aria-label="Login with Google"
          >
            {/* <FaGoogle /> */}
            <img src="/google.svg" alt="Google logo" width={18} height={18} />
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
