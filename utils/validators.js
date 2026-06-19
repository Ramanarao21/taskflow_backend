const isEmailDomain = (email, domain) => {
  return typeof email === "string" && email.toLowerCase().endsWith(`@${domain}`);
};
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

module.exports = { isEmailDomain, isValidEmail };
