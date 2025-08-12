import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";

const storage = new CloudinaryStorage({
    cloudinary: cloudinaryUpload,
    params: {
        public_id: (req, file) => {
            //  my image.png => 345j44545f-ddg-my-image.png

            const fileName = file.originalname
                .toLowerCase()
                .replace(/\s+/g, "-") //empty space remove
                .replace(/\./g, "-")  // remove . replace -
                // eslint-disable-next-line no-useless-escape
                .replace(/[^a-z0-9\-\.]/g, "")  //non alpha numeric -- @ $

            const extension = file.originalname.split(".").pop()

            const uniqueFIleName = Math.random().toString(36).substring(2) + "-" + Date.now() + "-" + fileName + "." + extension

            return uniqueFIleName
        }
    }
});

export const multerUpload = multer({
    storage: storage
})