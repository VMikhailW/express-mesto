const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const {
  getCards, createCard, deleteCardByID, likeCard, dislikeCard,
} = require("../controllers/cards");
const regExp = require("../regexp/regexp");

router.get("/cards", getCards);
router.post("/cards", celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    link: Joi.string().required().pattern(regExp),
  }),
}), createCard);
router.delete("/cards/:cardId", celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().length(24).hex(),
  }),
}), deleteCardByID);
router.put("/cards/:cardId/likes", celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().length(24).hex(),
  }),
}), likeCard);
router.delete("/cards/:cardId/likes", celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().length(24).hex(),
  }),
}), dislikeCard);

module.exports = router;
