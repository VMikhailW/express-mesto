const mongoose = require("mongoose");
const { isURL } = require("validator");

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: [2, "Минимальная длина поля 'name' - 2 символа."],
    maxlength: [30, "Максимальная длина поля 'name' - 30 символов."],
    required: [true, "Поле 'name' должно быть заполнено."],
  },
  link: {
    type: String,
    required: [true, "Поле 'link' должно быть заполнено."],
    validate: {
      validator: (v) => isURL(v),
      message: "Поле 'link' не соответствует требуемому формату URL",
    },
  },
  owner: {
    type: mongoose.ObjectId,
    ref: "user",
    required: [true, "Поле 'owner' должно быть заполнено."],
  },
  likes: [{
    type: mongoose.ObjectId,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { versionKey: false });

module.exports = mongoose.model("card", cardSchema);
