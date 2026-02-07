import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/auth";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isEmailInvalid = email && !emailRegex.test(email);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // ❌ Stop submission if email invalid
    if (isEmailInvalid) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await registerUser(fullName, email, password);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-96 bg-white p-8 rounded-xl shadow-md border border-gray-200">
        <h1 className="text-3xl font-bold text-center mb-2">
          ChatApp
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Create a new account
        </p>

        <form onSubmit={handleRegister}>
          {/* Full Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter your full name"
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="mb-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className={`w-full border p-2.5 rounded-lg focus:outline-none ${
                isEmailInvalid
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500"
              }`}
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Email popup */}
          {isEmailInvalid && (
            <p className="text-xs text-red-500 mb-3">
              ⚠ Invalid email format
            </p>
          )}

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full border border-gray-300 p-2.5 rounded-lg pr-12 focus:outline-none focus:border-blue-500"
                placeholder="Create a password"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm mb-3">
              {error}
            </p>
          )}

          {/* Register Button with hover popup */}
          <div className="relative group">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition
                ${
                  loading
                    ? "bg-gray-700 text-white cursor-not-allowed"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? "Registering..." : "Register"}
            </button>

            {/* Hover popup */}
            {isEmailInvalid && (
              <div className="absolute left-1/2 -translate-x-1/2 -top-9 hidden group-hover:block bg-black text-white text-xs px-3 py-1 rounded">
                Enter a valid email to continue
              </div>
            )}
          </div>
        </form>

        {/* Login */}
        <p className="text-sm text-center text-gray-500 mt-5">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-medium hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
