import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const Note = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4 text-white"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="notice-title"
    >
      <div
        className="border border-gray-700/50 rounded-lg p-4 sm:p-6 md:p-8 lg:p-10 max-w-lg w-full shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="notice-title" className="text-xl font-bold mb-4">
          Important Notice
        </h2>
        <p className="mb-3 text-sm">
          This application utilizes a free version of a Large Language Model,
          which has limitations on the number of tokens it can process.
        </p>
        <p className="mb-3 text-sm">
          If you encounter issues or the app stops working, please report it.
          This will help us consider upgrading to a paid plan or using
          alternative models.
        </p>
        <p className="mb-3 text-sm">
          We appreciate your understanding and support.
        </p>
        <div className="flex items-center gap-4">
          <button
            className="mt-4 text-[15px] bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full sm:w-auto cursor-pointer"
            onClick={onClose}
          >
            Acknowledge
          </button>

          <Link to="/report">
            <button className="mt-4 text-[15px] bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full sm:w-auto cursor-pointer">
              Report here
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Note;
