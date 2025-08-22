exports.sendSuccess = (
  res,
  data = {},
  message = "Success",
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

exports.sendError = (res, error = "Something went wrong", statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message: error,
  });
};
