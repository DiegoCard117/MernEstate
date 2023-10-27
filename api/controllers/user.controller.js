import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from '../utils/error.js';

export const test = (_request, response) => {
  response.json({
    message: "Is Working!!",
  });
};

export const updateUser = async (request, response, next) => {
  if (request.user.id !== request.params.id)
    return next(errorHandler(401, "You can only update your own account!"));
  try {
    if (request.body.password) {
      request.body.password = bcryptjs.hashSync(request.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      request.params.id,
      {
        $set: {
          username: request.body.username,
          password: request.body.password,
          email: request.body.email,
          avatar: request.body.avatar,
        },
      },
      { new: true }
    );

    const {password, ...rest} = updatedUser._doc

    response.status(200).json(rest)
  } catch (error) {
    next(error);
  }
};
