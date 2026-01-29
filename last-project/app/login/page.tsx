"use client";

import { useState, useEffect } from "react";
import { Lock, User, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // Redirect if user is already logged in
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      router.push("/");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        await Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: data.message || "Invalid credentials",
          confirmButtonColor: "#0F172A",
        });
        setLoading(false);
        return;
      }

      // Decode JWT to check role
      const token = data.access_token;
      const payload = JSON.parse(atob(token.split('.')[1]));

      // Check if user is admin
      if (payload.role !== "admin") {
        await Swal.fire({
          icon: "error",
          title: "Access Denied",
          text: "Only administrators can access this portal",
          confirmButtonColor: "#0F172A",
        });
        setLoading(false);
        return;
      }

      // Store token and user data in localStorage
      localStorage.setItem("access_token", token);
      localStorage.setItem("userToken", payload.token.toString());
      localStorage.setItem("userRole", payload.role);
      localStorage.setItem("userName", payload.name);
      localStorage.setItem("userEmail", payload.email);

      await Swal.fire({
        icon: "success",
        title: "Welcome Admin!",
        text: "Access granted successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      // Redirect to admin dashboard or questions page
      router.push("/questions");
    } catch (error) {
      console.error("Login error:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred. Please try again.",
        confirmButtonColor: "#0F172A",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
      {/* Minimalist Pattern Overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      <div className="w-full max-w-[400px] z-10">
        {/* Subtle Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white mb-4 shadow-xl shadow-slate-200">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Seekers Admin</h1>
          <p className="text-slate-400 text-xs mt-1 uppercase tracking-[0.2em] font-semibold">Management Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-10 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Identity</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={18} />
                <input 
                  type="email"
                  required
                  placeholder="Admin Email"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-900 outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Passkey</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={18} />
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-900 outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm hover:bg-black transition-all flex items-center justify-center gap-2 mt-4 disabled:bg-slate-200 disabled:text-slate-400"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Authorize Access"
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center mt-8 text-[10px] text-slate-400 font-medium uppercase tracking-widest">
          Secure Session • 2026 Internal System
        </p>
      </div>
    </div>
  );
}