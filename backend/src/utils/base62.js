const characters =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const base62Encode = (num) => {
  let shortCode = "";
  const base = characters.length;

  while (num > 0) {
    shortCode = characters[num % base] + shortCode;
    num = Math.floor(num / base);
  }

  return shortCode || "0";
};

module.exports = base62Encode;
