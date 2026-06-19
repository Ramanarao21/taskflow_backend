const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let msg = err.message || "Something went wrong";

  
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue)[0];
    msg = `${field} already taken`;
  }

  if (err.name === "ValidationError") {
    status = 400;
    msg = Object.values(err.errors).map((e) => e.message).join(", ");
  }

  
  if (err.name === "CastError") {
    status = 404;
    msg = "Not found";
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    status = 401;
    msg = "Invalid or expired token";
  }

  res.status(status).json({ message: msg });
};

module.exports = { errorHandler };
