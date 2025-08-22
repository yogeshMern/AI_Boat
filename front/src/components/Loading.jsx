import React, { useState, useEffect } from "react";
import Input from "../pages/Input";

const LoadingPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // 2 second

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Updated Subtle Purple Light */}
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse drop-shadow-[0_0_20px_rgba(128,0,255,0.2)]"></div>

          {/* Other Lights */}
          <div
            className="absolute top-3/4 right-1/4 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 w-32 h-32 bg-green-600/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        {/* Loading Content */}
        <div className="relative z-10 flex flex-col h-screen justify-center items-center">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z" />
              </svg>
            </div>
            <div>
              {/* Updated Heading */}
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                AI Career Coach, Mental Health Bot
              </h1>
            </div>
          </div>

          {/* Bot Types */}
          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            {[
              { name: "Career Coach", color: "from-blue-400 to-cyan-400" },
              { name: "Mental Health Bot", color: "from-red-400 to-pink-400" },
              { name: "Study Buddy", color: "from-green-400 to-emerald-400" },
              {
                name: "General Assistant",
                color: "from-purple-400 to-blue-400",
              },
            ].map((bot, index) => (
              <div
                key={index}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm transition-all duration-200 bg-gradient-to-r ${bot.color} text-white`}
              >
                <span>{bot.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  } else {
    return <Input />;
  }
};

export default LoadingPage;
