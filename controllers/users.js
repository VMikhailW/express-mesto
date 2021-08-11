const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const BadRequestError = require("../errors/bad-request-err");
const NotFoundError = require("../errors/not-found-err");
const ConflictError = require("../errors/conflict-err");

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      res.status(200).send(users);
    })
    .catch(next);
};

module.exports.getUserByID = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(new Error("IncorrectID"))
    .then((user) => { res.status(200).send(user); })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequestError("Переданы некорректные данные."));
      } else if (err.message === "IncorrectID") {
        next(new NotFoundError(`Карточка с указанным _id: ${req.params.userId} не найдена.`));
      } else {
        next(err);
      }
    });
};

module.exports.getMyInfo = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => { res.status(200).send(user); })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequestError("Переданы некорректные данные."));
      } else {
        next(err);
      }
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  User.findOne({ email }).then((usr) => {
    if (usr) {
      throw new ConflictError("Пользователь с таким email уже существует");
    }
    bcrypt.hash(password, 10)
      .then((hash) => User.create({
        name, about, avatar, email, password: hash,
      }))
      .then((user) => {
        const userDoc = user._doc;
        delete userDoc.password;
        res.status(200).send(user);
      })
      .catch((err) => {
        if (err.name === "ValidationError") {
          next(new BadRequestError(`${Object.values(err.errors).map((error) => error.message).join(" ")}`));
        } else {
          next(err);
        }
      });
  }).catch(next);
};

module.exports.updateProfile = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id,
    { name, about },
    {
      new: true,
      runValidators: true,
      upsert: false,
    })
    .orFail(new Error("IncorrectID"))
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.message === "IncorrectID") {
        next(new NotFoundError("Пользователь с указанным _id не найден."));
      } else if (err.name === "ValidationError") {
        next(new BadRequestError(`${Object.values(err.errors).map((error) => error.message).join(" ")}`));
      } else {
        next(err);
      }
    });
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;

  if (!avatar) {
    throw new BadRequestError("Поле 'avatar' должно быть заполнено");
  } else {
    User.findByIdAndUpdate(req.user._id,
      { avatar },
      {
        new: true,
        runValidators: true,
        upsert: false,
      })
      .orFail(new Error("IncorrectID"))
      .then((user) => { res.status(200).send(user); })
      .catch((err) => {
        if (err.message === "IncorrectID") {
          next(new NotFoundError("Пользователь с указанным _id не найден."));
        } else if (err.name === "ValidationError") {
          next(new BadRequestError(`${Object.values(err.errors).map((error) => error.message).join(" ")}`));
        } else {
          next(err);
        }
      });
  }
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email }).select("+password")
    .orFail(new Error("IncorrectEmail"))
    .then((user) => {
      bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            next(new BadRequestError("Указан некорректный Email или пароль."));
          } else {
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
            res.status(201).send({ token });
          }
        });
    })
    .catch((err) => {
      if (err.message === "IncorrectEmail") {
        next(new BadRequestError("Указан некорректный Email или пароль."));
      } else {
        next(err);
      }
    });
};
