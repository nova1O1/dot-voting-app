"use client";

import { useState, useEffect } from "react";
import type { Contestant } from "@/lib/store";

const ADMIN_PASSWORD = "admin123";

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setPassword("");
      fetchContestants();
    } else {
      setMessage("Incorrect password");
    }
  };

  const fetchContestants = async () => {
    try {
      const res = await fetch("/api/contestants");
      const data = await res.json();
      setContestants(data.contestants || []);
    } catch (error) {
      console.error("Failed to fetch contestants", error);
    }
  };

  const handleAddContestant = async () => {
    if (!newName.trim()) {
      setMessage("Please enter a name");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contestants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      const data = await res.json();
      if (res.ok) {
        setContestants(data.contestants || []);
        setNewName("");
        setMessage("Contestant added!");
      } else {
        setMessage(data.message || "Failed to add contestant");
      }
    } catch (error) {
      setMessage("Error adding contestant");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveContestant = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/contestants", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok) {
        setContestants(data.contestants || []);
        setMessage("Contestant removed!");
      } else {
        setMessage(data.message || "Failed to remove contestant");
      }
    } catch (error) {
      setMessage("Error removing contestant");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold text-center mb-8">Admin Login</h1>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition"
            />
            {message && <p className="text-red-600 text-center">{message}</p>}
            <button
              onClick={handleLogin}
              className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Admin Panel</h1>

        {message && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
            {message}
          </div>
        )}

        <div className="mb-8 p-6 border border-gray-300 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Add Contestant</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Contestant name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition"
            />
            <button
              onClick={handleAddContestant}
              disabled={loading}
              className="px-6 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Add
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Contestants</h2>
          <div className="space-y-2">
            {contestants.length === 0 ? (
              <p className="text-gray-500">No contestants yet</p>
            ) : (
              contestants.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{c.name}</p>
                    <p className="text-sm text-gray-500">Votes: {c.votes}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveContestant(c.id)}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <button
          onClick={() => setIsLoggedIn(false)}
          className="mt-8 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
