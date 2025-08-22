import React, { useState, useEffect, useRef } from "react";
import { Info, Send, Sparkles, User } from "lucide-react";
import botConfigs from "../components/Botroles";
import Note from "../components/Note";

const Input = () => {
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  const [message, setMessage] = useState("");
  const [currentBotType, setCurrentBotType] = useState("default");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant ready to help with various topics. Choose a bot type or ask me anything!",
      isBot: true,
      timestamp: new Date(),
      botType: "default",
    },
  ]);

  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const formatInlineText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-bold text-purple-300">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const formatBotResponse = (text) => {
    if (typeof text !== "string") {
      console.warn("formatBotResponse received invalid input:", text);
      return [
        <p key="invalid-input" className="text-white leading-relaxed">
          Invalid response format.
        </p>,
      ];
    }

    const lines = text.split("\n").filter((line) => line.trim());
    const elements = [];
    let currentParagraph = [];
    let bulletPoints = [];
    let inBulletSection = false;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      const bulletMatch = trimmedLine.match(/^[-•]\s*(.*)/);
      const numberedMatch = trimmedLine.match(/^(\d+)\.\s*(.*)/);

      if (bulletMatch || numberedMatch) {
        if (currentParagraph.length > 0) {
          elements.push(
            <p
              key={`para-${index}`}
              className="text-white leading-relaxed mb-4"
            >
              {formatInlineText(currentParagraph.join(" "))}
            </p>
          );
          currentParagraph = [];
        }

        const content = bulletMatch ? bulletMatch[1] : numberedMatch[2];
        bulletPoints.push(
          <li key={`bullet-${index}`} className="mb-2">
            <span className="text-gray-200">{formatInlineText(content)}</span>
          </li>
        );
        inBulletSection = true;
      } else if (trimmedLine.startsWith("**") && trimmedLine.endsWith("**")) {
        if (inBulletSection && bulletPoints.length > 0) {
          elements.push(
            <ul
              key={`bullets-${index}`}
              className="list-disc list-inside space-y-2 mb-4 ml-4"
            >
              {bulletPoints}
            </ul>
          );
          bulletPoints = [];
          inBulletSection = false;
        }

        if (currentParagraph.length > 0) {
          elements.push(
            <p
              key={`para-${index}`}
              className="text-white leading-relaxed mb-4"
            >
              {formatInlineText(currentParagraph.join(" "))}
            </p>
          );
          currentParagraph = [];
        }

        const heading = trimmedLine.replace(/\*\*/g, "");
        elements.push(
          <h3
            key={`heading-${index}`}
            className="font-bold text-xl text-purple-300 mb-3 mt-4"
          >
            {heading}
          </h3>
        );
      } else if (trimmedLine) {
        if (inBulletSection && bulletPoints.length > 0) {
          elements.push(
            <ul
              key={`bullets-${index}`}
              className="list-disc list-inside space-y-2 mb-4 ml-4"
            >
              {bulletPoints}
            </ul>
          );
          bulletPoints = [];
          inBulletSection = false;
        }
        currentParagraph.push(trimmedLine);
      }
    });

    if (bulletPoints.length > 0) {
      elements.push(
        <ul
          key="final-bullets"
          className="list-disc list-inside space-y-2 mb-4 ml-4"
        >
          {bulletPoints}
        </ul>
      );
    }

    if (currentParagraph.length > 0) {
      elements.push(
        <p key="final-para" className="text-white leading-relaxed mb-4">
          {formatInlineText(currentParagraph.join(" "))}
        </p>
      );
    }

    return elements.length > 0
      ? elements
      : [
          <p key="default" className="text-white leading-relaxed">
            {formatInlineText(text)}
          </p>,
        ];
  };

  // const sendMessageToAPI = async (messageText, botType) => {
  //   try {
  //     const response = await fetch("http://localhost:8000/api/v1/chat", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ message: messageText, botType }),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(
  //         errorData.error || `HTTP error! status: ${response.status}`
  //       );
  //     }

  //     const data = await response.json();
  //     return data.reply;
  //   } catch (error) {
  //     console.error("API Error:", error);
  //     throw error;
  //   }
  // };

  const sendMessageToAPI = async (messageText, botType) => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: messageText, botType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data.data.reply; // ✅ Correctly access reply from nested `data`
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: message.trim(),
      isBot: false,
      timestamp: new Date(),
      botType: currentBotType,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);
    setError("");

    try {
      const botResponse = await sendMessageToAPI(
        userMessage.text,
        currentBotType
      );

      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        isBot: true,
        timestamp: new Date(),
        botType: currentBotType,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setError(error.message);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: `Sorry, I encountered an error: ${error.message}. Please try again.`,
          isBot: true,
          timestamp: new Date(),
          botType: currentBotType,
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleBotTypeChange = (newBotType) => {
    setCurrentBotType(newBotType);
    const config = botConfigs[newBotType];
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: `Switched to ${config.name}. How can I assist you in this mode?`,
        isBot: true,
        timestamp: new Date(),
        botType: newBotType,
      },
    ]);
  };

  const currentConfig = botConfigs[currentBotType];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute top-3/4 right-1/4 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-32 h-32 bg-green-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {<Note isOpen={isNoteOpen} onClose={() => setIsNoteOpen(false)} />}

      {/* Main UI */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <div className="bg-black/50 backdrop-blur-sm border-b border-gray-800/50 p-4">
          <div className="max-w-4xl mx-auto">
            {/* Bot Type Selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(botConfigs).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => handleBotTypeChange(type)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                    currentBotType === type
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                      : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
                  }`}
                >
                  {config.icon}
                  <span>{config.name}</span>
                </button>
              ))}
            </div>

            {/* Current Bot Display */}
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <div
                  className={`flex items-center justify-center w-12 h-12 bg-gradient-to-r ${currentConfig.color} rounded-full`}
                >
                  {currentConfig.icon}
                </div>
                <div>
                  <h1
                    className={`text-2xl font-bold bg-gradient-to-r ${currentConfig.color} bg-clip-text text-transparent`}
                  >
                    {currentConfig.name}
                  </h1>
                  <p className="text-gray-400 text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                    AI Assistant • {isLoading ? "Thinking..." : "Ready to help"}{" "}
                    <Info
                      onClick={() => setIsNoteOpen(true)}
                      className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 cursor-pointer"
                    />
                  </p>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-3 bg-red-900/50 border border-red-700/50 rounded-lg text-red-200 text-sm">
                <strong>Connection Error:</strong> {error}
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6 text-[13px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.isBot ? "justify-start" : "justify-end"
                }`}
              >
                <div className={`max-w-[80%] ${msg.isBot ? "" : "text-right"}`}>
                  {msg.isBot && (
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="flex items-center space-x-1">
                        {botConfigs[msg.botType]?.icon || (
                          <Sparkles className="w-4 h-4 text-purple-400" />
                        )}
                        <User className="w-4 h-4 text-gray-400" />
                      </div>
                      <span className="text-sm text-gray-300 font-medium">
                        {botConfigs[msg.botType]?.name || "AI Assistant"}
                      </span>
                      {msg.isError && (
                        <span className="text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded">
                          Error
                        </span>
                      )}
                    </div>
                  )}

                  <div
                    className={`${
                      msg.isBot
                        ? "bg-gray-800/30"
                        : "bg-gradient-to-r from-purple-600/20 to-blue-600/20"
                    } backdrop-blur-sm rounded-2xl p-4 border ${
                      msg.isBot ? "border-gray-700/50" : "border-purple-500/30"
                    }`}
                  >
                    <div className="prose prose-invert max-w-none">
                      {msg.isBot ? (
                        formatBotResponse(msg.text)
                      ) : (
                        <p className="text-white leading-relaxed">{msg.text}</p>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 mt-2 px-2">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-gray-400 text-sm">
                      AI is thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-black/50 backdrop-blur-sm border-t border-gray-800/50 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-4">
              <div className="flex-1 relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Ask ${currentConfig.name.toLowerCase()} about anything...`}
                  className="w-full bg-gray-800/50 border border-gray-600/50 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent backdrop-blur-sm resize-none min-h-[60px] max-h-32"
                  rows="1"
                  disabled={isLoading}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                  Press Enter to send
                </div>
              </div>
              <button
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white p-4 rounded-2xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg disabled:hover:scale-100"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Suggestions based on bot type */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {currentBotType === "career-coach" &&
                [
                  "💼 Career planning",
                  "📈 Skill development",
                  "📝 Resume tips",
                  "🤝 Interview prep",
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      setMessage(suggestion.split(" ").slice(1).join(" "))
                    }
                    className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30 text-gray-300 px-4 py-2 rounded-full text-sm transition-all duration-200 hover:border-purple-500/50 backdrop-blur-sm"
                    disabled={isLoading}
                  >
                    {suggestion}
                  </button>
                ))}

              {currentBotType === "mental-health" &&
                [
                  "🧘 Stress management",
                  "💭 Self-care tips",
                  "😌 Mindfulness",
                  "💪 Coping strategies",
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      setMessage(suggestion.split(" ").slice(1).join(" "))
                    }
                    className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30 text-gray-300 px-4 py-2 rounded-full text-sm transition-all duration-200 hover:border-purple-500/50 backdrop-blur-sm"
                    disabled={isLoading}
                  >
                    {suggestion}
                  </button>
                ))}

              {currentBotType === "study-buddy" &&
                [
                  "📚 Study techniques",
                  "⏰ Time management",
                  "🎯 Goal setting",
                  "📖 Learning tips",
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      setMessage(suggestion.split(" ").slice(1).join(" "))
                    }
                    className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30 text-gray-300 px-4 py-2 rounded-full text-sm transition-all duration-200 hover:border-purple-500/50 backdrop-blur-sm"
                    disabled={isLoading}
                  >
                    {suggestion}
                  </button>
                ))}

              {currentBotType === "default" &&
                [
                  "💡 General advice",
                  "🤔 Ask anything",
                  "🎯 Help me decide",
                  "📝 Explain topic",
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      setMessage(suggestion.split(" ").slice(1).join(" "))
                    }
                    className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30 text-gray-300 px-4 py-2 rounded-full text-sm transition-all duration-200 hover:border-purple-500/50 backdrop-blur-sm"
                    disabled={isLoading}
                  >
                    {suggestion}
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Input;
