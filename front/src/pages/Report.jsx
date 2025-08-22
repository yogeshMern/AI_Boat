import Axios from "axios";
import { useState } from "react";
import {
  Mail,
  MessageSquare,
  AlertCircle,
  Send,
  CheckCircle,
  ArrowBigLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const Report = () => {
  const [reportData, setReportData] = useState({ email: "", message: "" });
  const [errors, setErrors] = useState({ email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReportData({ ...reportData, [name]: value });

    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setErrors((prev) => ({
        ...prev,
        email: !emailRegex.test(value) ? "Invalid email address" : "",
      }));
    }

    if (name === "message") {
      setErrors((prev) => ({
        ...prev,
        message: value.trim() === "" ? "Message is required" : "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !reportData.email ||
      !reportData.message ||
      errors.email ||
      errors.message
    ) {
      alert("Please fill out the form correctly.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSuccessMsg("");
      await Axios.post("https://ai-chat-bot-backend-ug3k.onrender.com/api/v1/report", reportData);
      setReportData({ email: "", message: "" });
      // setSuccessMsg("Report sent successfully!");
      toast.success("Report sent successfully!");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Error sending report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (
  //     !reportData.email ||
  //     !reportData.message ||
  //     errors.email ||
  //     errors.message
  //   ) {
  //     toast.error("Please fill out the form correctly.");
  //     return;
  //   }

  //   try {
  //     setIsSubmitting(true);
  //     setSuccessMsg("");

  //     const response = await Axios.post(
  //       "http://localhost:8000/api/v1/report",
  //       reportData
  //     );

  //     // Optional: you can show response.message from backend
  //     toast.success(response.data?.message || "Report sent successfully!");

  //     setReportData({ email: "", message: "" });
  //     navigate("/");
  //   } catch (err) {
  //     console.error(err);

  //     // Extract backend error message if available
  //     const errorMsg =
  //       err.response?.data?.message ||
  //       "Error sending report. Please try again.";
  //     toast.error(errorMsg);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 to-[#151e2e]/80 pb-10">
      {/* Header */}
      <div className="px-3 pt-8 sm:pt-12">
        <button
          className="flex items-center gap-2 mx-auto sm:mx-0 cursor-pointer focus:outline-none"
          onClick={() => navigate(-1)}
          aria-label="Go Back"
        >
          <ArrowBigLeft className="text-purple-600 w-7 h-7 sm:w-8 sm:h-8 transition" />
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent text-lg sm:text-2xl font-bold">
            Go Back
          </span>
        </button>
      </div>

      {/* Card */}
      <div className="bg-black/50 backdrop-blur-sm border border-gray-800/60 p-5 sm:p-8 rounded-xl shadow-lg w-[97vw] max-w-md mx-auto mt-8 sm:mt-12">
        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-5 flex items-center gap-2">
          <AlertCircle className="text-purple-400 w-6 h-6" />
          Report an Issue
        </h2>

        {/* Success Message */}
        {successMsg && (
          <div
            className="flex items-center gap-2 bg-green-900/30 border border-green-700/50 text-green-200 text-sm px-4 py-2 rounded mb-4"
            role="alert"
            aria-live="polite"
          >
            <CheckCircle size={20} className="text-green-400" />
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Email Input */}
          <div className="mb-5">
            <label
              htmlFor="email"
              className="flex items-center text-gray-200 text-sm font-medium mb-2 gap-1"
            >
              <Mail className="text-purple-400 w-5 h-5" />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={reportData.email}
              onChange={handleInputChange}
              className={`w-full bg-gray-800/50 border ${
                errors.email ? "border-red-500" : "border-gray-700"
              } rounded px-3 py-2 sm:py-3 text-white text-base focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent backdrop-blur-sm transition`}
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              aria-describedby="email-error"
              autoComplete="email"
            />
            {errors.email && (
              <p
                id="email-error"
                className="text-red-400 text-xs mt-1 flex items-center gap-1"
              >
                <AlertCircle size={14} className="mr-1" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Message Input */}
          <div className="mb-5">
            <label
              htmlFor="message"
              className="flex items-center text-gray-200 text-sm font-medium mb-2 gap-1"
            >
              <MessageSquare className="text-purple-400 w-5 h-5" />
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={reportData.message}
              onChange={handleInputChange}
              rows={5}
              className={`w-full bg-gray-800/50 border ${
                errors.message ? "border-red-500" : "border-gray-700"
              } rounded px-3 py-2 sm:py-3 text-white text-base focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent backdrop-blur-sm transition`}
              placeholder="Describe the issue..."
              aria-invalid={!!errors.message}
              aria-describedby="message-error"
              autoComplete="off"
            />
            {errors.message && (
              <p
                id="message-error"
                className="text-red-400 text-xs mt-1 flex items-center gap-1"
              >
                <AlertCircle size={14} className="mr-1" />
                {errors.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-2 sm:py-3 rounded flex items-center justify-center w-full cursor-pointer transition duration-300 text-base"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <svg
                className="animate-spin w-5 h-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
            ) : (
              <Send className="mr-2 w-5 h-5" />
            )}
            {isSubmitting ? "Sending..." : "Send Report"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Report;
