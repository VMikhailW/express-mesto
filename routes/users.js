const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const {
  getUsers, getUserByID, updateProfile, updateAvatar, getMyInfo,
} = require("../controllers/users");
const regExp = require("../regexp/regexp");

router.get("/users", getUsers);
router.get("/users/me", getMyInfo);
router.get("/users/:userId", celebrate({
  params: Joi.object().keys({
    userId: Joi.string().length(24).hex(),
  }),
}), getUserByID);
router.patch("/users/me", celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), updateProfile);
router.patch("/users/me/avatar", celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().pattern(regExp),
  }),
}), updateAvatar);

module.exports = router;
