"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HTTP_BACKEND } from "@/config";

export function AuthPage({ isSignin }: { isSignin: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // required for signup
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  async function handleSubmit() {
    setError(null);

    if (!email || !password || (!isSignin && !name)) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      const endpoint = isSignin ? "/signin" : "/signup";

      const res = await fetch(`${HTTP_BACKEND}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isSignin
            ? { email, password } // SigninSchema
            : { email, password, name } // CreateUserSchema (backend expects name)
        ),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      if (isSignin) {
        // /signin → { token }
        if (data.token) {
          localStorage.setItem("token", data.token);
          // ⬅️ After sign in, go to join-room page
          router.push("/join-room");
        } else {
          setError("No token received from server.");
        }
      } else {
        // /signup → { userId }
        if (data.userId) {
          // After signup, go to signin
          router.push("/signin");
        } else {
          setError("Signup failed.");
        }
      }
    } catch (e) {
      console.error(e);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function goToOtherAuthPage() {
    if (isSignin) {
      router.push("/signup");
    } else {
      router.push("/signin");
    }
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-linear-to-br from-gray-900 to-black text-white">
      <div className="w-[90%] max-w-sm bg-white text-black rounded-2xl shadow-xl p-8">
        {/* Title */}
        <h1 className="text-2xl font-bold text-center mb-1">
          {isSignin ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="text-center text-sm text-gray-500 mb-6">
          {isSignin
            ? "Sign in to continue to your workspace."
            : "Sign up to start using the app."}
        </p>

        {/* Error message */}
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        {/* Name (only for signup) */}
        {!isSignin && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none"
            />
          </div>
        )}

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none"
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none"
          />
        </div>

        {/* Button */}
        <button
          className="w-full bg-black text-white font-medium py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading
            ? isSignin
              ? "Signing in..."
              : "Creating account..."
            : isSignin
            ? "Sign In"
            : "Sign Up"}
        </button>

        {/* Bottom text */}
        <div className="text-center text-sm mt-4">
          {isSignin ? (
            <p>
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={goToOtherAuthPage}
                className="text-blue-600 hover:underline"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={goToOtherAuthPage}
                className="text-blue-600 hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
