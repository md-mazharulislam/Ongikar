const notFound = (req, res, next) => {
  res.status(404).json({ message: `রুট পাওয়া যায়নি — ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return res.status(409).json({ message: `এই ${field} ইতিমধ্যে ব্যবহৃত হয়েছে।` });
  }

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(", ") });
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || "সার্ভারে একটি ত্রুটি ঘটেছে।",
  });
};

module.exports = { notFound, errorHandler };
