// const { Report } = require("../models/reportModel");
// const { sendSuccess, sendError } = require("../utils/response");
// const { sendReportConfirmationEmail } = require("../utils/mailer");
// const disposableDomains = require("disposable-email-domains");
// const dns = require("dns");

// // ✅ Utility: Check email format
// function isValidEmailFormat(email) {
//   const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   return re.test(email);
// }

// // ✅ Utility: Check if email is from a disposable service
// function isDisposableEmail(email) {
//   const domain = email.split("@")[1];
//   return disposableDomains.includes(domain.toLowerCase());
// }

// // ✅ Utility: Check if domain has valid MX records
// function hasValidMX(email) {
//   return new Promise((resolve) => {
//     const domain = email.split("@")[1];
//     dns.resolveMx(domain, (err, addresses) => {
//       if (err || !addresses || addresses.length === 0) {
//         return resolve(false);
//       }
//       resolve(true);
//     });
//   });
// }

// // ✅ Final Report Controller
// exports.report = async (req, res) => {
//   const { email, message } = req.body;

//   if (!email || typeof email !== "string" || !email.trim()) {
//     return sendError(
//       res,
//       "Email is required and must be a non-empty string.",
//       400
//     );
//   }

//   if (!message || typeof message !== "string" || !message.trim()) {
//     return sendError(
//       res,
//       "Message is required and must be a non-empty string.",
//       400
//     );
//   }

//   const trimmedEmail = email.trim();

//   // ✅ Format check
//   if (!isValidEmailFormat(trimmedEmail)) {
//     return sendError(res, "Email format is invalid.", 400);
//   }

//   // ✅ Disposable check
//   if (isDisposableEmail(trimmedEmail)) {
//     return sendError(
//       res,
//       "Disposable or temporary email addresses are not allowed.",
//       400
//     );
//   }

//   // ✅ MX record check (async)
//   const hasMX = await hasValidMX(trimmedEmail);
//   if (!hasMX) {
//     return sendError(
//       res,
//       "Email domain cannot receive mail (invalid MX records).",
//       400
//     );
//   }

//   // ✅ Save report and send confirmation
//   try {
//     const report = await Report.create({
//       email: trimmedEmail,
//       message: message.trim(),
//     });

//     sendReportConfirmationEmail(trimmedEmail, message.trim())
//       .then(() => console.log(`📧 Confirmation sent to ${trimmedEmail}`))
//       .catch((err) =>
//         console.error("❌ Failed to send confirmation email:", err)
//       );

//     return sendSuccess(
//       res,
//       {
//         reportId: report._id,
//         timestamp: report.createdAt,
//       },
//       "Report submitted successfully."
//     );
//   } catch (error) {
//     console.error("❌ Report submission error:", error);
//     return sendError(
//       res,
//       "Failed to submit report. Please try again later.",
//       500
//     );
//   }
// };

const { Report } = require("../models/reportModel");
const { sendSuccess, sendError } = require("../utils/response");
const { sendReportConfirmationEmail } = require("../utils/mailer");
const disposableDomains = require("disposable-email-domains");
const dns = require("dns");
const emailExistence = require("email-existence");

// ✅ Utility: Validate email format
function isValidEmailFormat(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// ✅ Utility: Check for disposable email domain
function isDisposableEmail(email) {
  const domain = email.split("@")[1];
  return disposableDomains.includes(domain.toLowerCase());
}

// ✅ Utility: Check for valid MX DNS record
function hasValidMX(email) {
  return new Promise((resolve) => {
    const domain = email.split("@")[1];
    dns.resolveMx(domain, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        return resolve(false);
      }
      resolve(true);
    });
  });
}

// ✅ Utility: Check if email actually exists (SMTP handshake)
function verifyEmailAddress(email) {
  return new Promise((resolve) => {
    emailExistence.check(email, function (err, result) {
      if (err) {
        console.error("❌ SMTP check failed:", err);
        return resolve(false);
      }
      resolve(result); // true = email exists, false = fake
    });
  });
}

// ✅ Final Report Controller
exports.report = async (req, res) => {
  const { email, message } = req.body;

  // Validate input
  if (!email || typeof email !== "string" || !email.trim()) {
    return sendError(
      res,
      "Email is required and must be a non-empty string.",
      400
    );
  }

  if (!message || typeof message !== "string" || !message.trim()) {
    return sendError(
      res,
      "Message is required and must be a non-empty string.",
      400
    );
  }

  const trimmedEmail = email.trim();

  // ✅ Format check
  if (!isValidEmailFormat(trimmedEmail)) {
    return sendError(res, "Email format is invalid.", 400);
  }

  // ✅ Disposable check
  if (isDisposableEmail(trimmedEmail)) {
    return sendError(
      res,
      "Disposable or temporary email addresses are not allowed.",
      400
    );
  }

  // ✅ MX record check
  const hasMX = await hasValidMX(trimmedEmail);
  if (!hasMX) {
    return sendError(
      res,
      "Email domain cannot receive mail (invalid MX records).",
      400
    );
  }

  // ✅ SMTP-level check (does the email exist?)
  const exists = await verifyEmailAddress(trimmedEmail);
  if (!exists) {
    return sendError(
      res,
      "Email address does not exist or cannot be verified.",
      400
    );
  }

  // ✅ Save and notify
  try {
    const report = await Report.create({
      email: trimmedEmail,
      message: message.trim(),
    });

    sendReportConfirmationEmail(trimmedEmail, message.trim())
      .then(() => console.log(`📧 Confirmation sent to ${trimmedEmail}`))
      .catch((err) =>
        console.error("❌ Failed to send confirmation email:", err)
      );

    return sendSuccess(
      res,
      {
        reportId: report._id,
        timestamp: report.createdAt,
      },
      "Report submitted successfully."
    );
  } catch (error) {
    console.error("❌ Report submission error:", error);
    return sendError(
      res,
      "Failed to submit report. Please try again later.",
      500
    );
  }
};
