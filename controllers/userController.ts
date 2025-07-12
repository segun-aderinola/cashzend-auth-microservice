import { Request, Response } from "express";
import User from "../models/userModel";
import DeletedUser from "../models/deletedUserModel";
import { paginated_result } from "../middlewares/requestPaginate";
import { getToken } from "../functions/token";

// User Individual Routes

export const get_all_users = async (req: Request, res: Response) => {
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const per_page = req.query.per_page
    ? parseInt(req.query.per_page as string)
    : 12;
  const startIndex = (page - 1) * per_page;

  try {
    const getParams = () => {
      const { userName, email, phoneNumber, accountType, verificationLevel } =
        req.query;
      const params: any = {};

      if (userName) {
        params.userName = { $regex: String(userName || "") };
      }
      if (email) {
        params.email = { $regex: String(email || "") };
      }
      if (phoneNumber) {
        params.phoneNumber = { $regex: String(phoneNumber || "") };
      }
      if (accountType) {
        params.accountType = { $regex: String(accountType || "") };
      }
      if (verificationLevel) {
        params.verificationLevel = verificationLevel;
      }
      return params;
    };

    console.log(getParams());

    const limiter = {
      userName: 1,
      firstName: 1,
      lastName: 1,
      email: 1,
      phoneNumber: 1,
      regType: 1,
      accountType: 1,
      verificationLevel: 1,
      user_role: 1,
      createdAt: 1,
      updatedAt: 1,
      FLWAccountRef: 1,
      account: 1,
    };
    const count = await User.count();
    const query = await User.find(getParams(), limiter)
      .sort({ createdAt: -1 })
      .limit(per_page)
      .skip(startIndex);
    res.send({
      success: true,
      message: "User fetched successfully",
      query: paginated_result(page, per_page, count, query),
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error?.message || "An error occured",
      error,
    });
  }
};

export const get_user = async (req: Request, res: Response) => {
  try {
    const user: any = await User.findById(req.params.id);

    if (user) {
      // Split user response
      const { password, loginPin, transactionPin, bvn, ...response } =
        user._doc;
      const userResponse = { ...response };

      res.send({
        message: "User details gotten successfully",
        user: userResponse,
      });
    } else {
      res.status(400).send({ success: false, message: "User doesn't exist" });
    }
  } catch (error) {
    res.send({ success: false, message: "Error fetching user", error });
  }
};

export const get_user_profile = async (req: Request, res: Response) => {
  const ID = getToken(req);
  console.log(ID);
  try {
    const user: any = await User.findById(ID);
    if (user) {
      // Split user response
      const { password, loginPin, transactionPin, bvn, ...response } =
        user._doc;
      const userResponse = { ...response };

      res.send({
        success: true,
        message: "User details gotten successfully",
        user: userResponse,
      });
    } else {
      res.status(400).send({ success: false, message: "User doesn't exist" });
    }
  } catch (error) {
    res
      .status(400)
      .send({ success: false, message: "Error fetching user", error });
  }
};

export const update_user_profile = async (req: Request, res: Response) => {
  if (Object.keys(req.body).length <= 0) {
    res.status(400).json({ errors: "No body sent in request for update" });
  } else if (!req.body.verificationLevel) {
    res.status(403).send({
      message: "Not allowed. Use the right path to upgrade tier-levels",
    });
  } else {
    const ID = getToken(req);
    const [user, reqUser] = await Promise.all([
      User.findById(req.params.id),
      User.findById(ID),
    ]);
    console.log({ user });
    console.log({ reqUser });
    if (
      user?._id.equals(ID as string) ||
      (reqUser && reqUser.userRole === "admin")
    ) {
      try {
        const updateUser = await User.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            useFindAndModify: false,
            new: true,
            select: { password: 0, loginPin: 0, transactionPin: 0 },
          }
        );

        res.status(200).send({
          message: "Profile successfully updated",
          user: updateUser,
        });
      } catch (error: any) {
        if (error.path == "_id") {
          res.status(400).json({ message: "invalid user ID sent" });
        } else {
          res.status(400).send({ message: "An error occured", error });
        }
      }
    } else {
      res.status(401).json({
        message: "You don't have access to update this user's profile",
      });
    }
  }
};

export const delete_user = async (req: Request, res: Response) => {
  const ID = getToken(req);
  const user = await User.findById(ID);
  const delUser = await DeletedUser.find({ email: user?.email });
  if (!delUser.length) {
    await DeletedUser.create({
      firstName: user?.firstName,
      lastName: user?.lastName,
      phoneNumber: user?.phoneNumber,
      email: user?.email,
      user_role: user?.userRole,
      plan: user?.plan,
    });
  }

  User.findByIdAndDelete(ID)
    .then((response: any) => {
      res.send({ message: "User account deleted successfully" });
    })
    .catch((error: any) => {
      res.send({ message: "Unable to delete account", error });
    });
};
