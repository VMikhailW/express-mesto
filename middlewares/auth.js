const jwt = require("jsonwebtoken");
const UnauthorizedError = require("../errors/unauthorized-err");

const extractBearerToken = (header) => header.replace("Bearer ", "");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    next(new UnauthorizedError("Необходима авторизация"));
  }

  const token = extractBearerToken(authorization);
  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    next(new UnauthorizedError("Необходима авторизация"));
  }

  req.user = payload;

  next();
};
