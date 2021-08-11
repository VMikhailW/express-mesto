const Card = require("../models/card");

const BadRequestError = require("../errors/bad-request-err");
const ForbiddenError = require("../errors/forbidden-err");
const NotFoundError = require("../errors/not-found-err");

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => {
      res.status(200).send(cards);
    })
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      res.status(200).send(card);
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(new BadRequestError(`${Object.values(err.errors).map((error) => error.message).join(" ")}`));
      } else {
        next(err);
      }
    });
};

module.exports.deleteCardByID = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail(new Error("IncorrectCardID"))
    .then((card) => {
      if (card.owner.toString() === req.user._id.toString()) {
        card.remove();
        res.status(200).send({ message: `Карточка c _id: ${req.params.cardId} успешно удалена.` });
      } else {
        next(new ForbiddenError(`Карточку c _id: ${req.params.cardId} создал другой пользователь. Невозможно удалить.`));
      }
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequestError("Переданы некорректные данные."));
      } else if (err.message === "IncorrectCardID") {
        next(new NotFoundError(`Карточка с указанным _id: ${req.params.cardId} не найдена.`));
      } else {
        next(err);
      }
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error("IncorrectCardID"))
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequestError("Переданы некорректные данные для постановки лайка."));
      } else if (err.message === "IncorrectCardID") {
        next(new NotFoundError(`Карточка с указанным _id: ${req.params.cardId} не найдена.`));
      } else {
        next(err);
      }
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error("IncorrectCardID"))
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequestError("Переданы некорректные данные для снятия лайка."));
      } else if (err.message === "IncorrectCardID") {
        next(new NotFoundError(`Карточка с указанным _id: ${req.params.cardId} не найдена.`));
      } else {
        next(err);
      }
    });
};
