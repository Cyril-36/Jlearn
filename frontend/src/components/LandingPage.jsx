import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-900 text-white px-4">
      <section className="max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Welcome to <span className="text-blue-400">CodeArena</span>
        </h1>
        <p className="text-xl md:text-2xl mb-10">
          Practice Java programming challenges just like&nbsp;
          <span className="font-semibold">HackerRank</span>!
        </p>

        <Link
          to="/challenge/unit-i-introduction-to-java-1"
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition"
        >
          Get Started
        </Link>
      </section>
    </main>
  );
};

export default LandingPage;
