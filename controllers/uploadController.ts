import { Request, Response } from "express";
import ImageKit from "imagekit";
import uuid from "uuid";
import User from "../models/userModel";
import { getToken } from "../functions/token";
import { FileType } from "../types/models";

const imagekitInstance = new ImageKit({
  publicKey: (process.env.IMAGEKIT_PUBLIC_KEY as string) || "",
  privateKey: (process.env.IMAGEKIT_PRIVATE_KEY as string) || "",
  urlEndpoint: (process.env.IMAGEKIT_URL_ENDPOINT as string) || "",
});

export const get_auth = (req: Request, res: Response) => {
  try {
    const token = (req.query?.token as string) || (uuid.v4() as string);
    const expiration = Number(req.query.expire) || Date.now() / 1000 + 60 * 10; // Default expiration in 10 mins

    const signatureObj = imagekitInstance.getAuthenticationParameters(
      token,
      expiration
    );

    res.status(200).send({ message: "Authenticated", id: signatureObj });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "An error occured", error });
  }
};

export const delete_file = (req: Request, res: Response) => {
  const ID = getToken(req);
  const { fileType } = req.body;

  if (
    fileType === "nationalID" ||
    fileType === "cacDoc" ||
    fileType === "profilePicture"
  ) {
    imagekitInstance.deleteFile(req.params.fileid, function (error, result) {
      if (error) {
        res.send({ message: "Error deleting image", error });
        console.log(error);
      } else {
        const fileReset: FileType = {
          fileId: "",
          filename: "",
          url: "",
          thumbnailUrl: "",
          fileType: "",
        };

        const dataUpdate: any = {};
        // Delete Profile Image
        const deleteProfileImage = async () => {
          //
          dataUpdate.profilePicture = fileReset;
        };

        // Delete CAC Doc
        const deleteCacDoc = async () => {
          //
          dataUpdate.cacDoc = fileReset;
        };

        // Delete National ID
        const deleteNationaID = async () => {
          //
          dataUpdate.nationalID = fileReset;
        };

        switch (fileType) {
          case "nationalID":
            deleteNationaID();
            break;

          case "cacDoc":
            deleteCacDoc();

            break;

          case "profilePicture":
            deleteProfileImage();

            break;

          default:
            res.status(400).send({ message: "Media type doesn't exist" });
            break;
        }

        User.findByIdAndUpdate(ID, dataUpdate, {
          useFindAndModify: false,
          new: true,
          select: { password: 0 },
        })
          .then((response: any) => {
            const { password, ...userResponse } = response._doc;
            res.status(200).send({
              message: "Image deleted Successfully",
              user: userResponse,
            });
          })
          .catch((error) => {
            if (error.path == "_id") {
              res.status(400).json({ message: "invalid user ID sent" });
            }
            res.status(400).send(error);
          });
      }
    });
  } else {
    res.send({ message: "File type not sent or invalid" });
  }
};

module.exports = {
  get_auth,
  delete_file,
};
