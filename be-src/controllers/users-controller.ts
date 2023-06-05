import { User, Auth } from "../models"
import { getSHA256ofString, updatePassword } from "./auth-controller"
import { uploadCloudinary } from "../lib/cloudinary"

export async function createUser(data) {
    const { email, password, userName, profilePhoto } = data;
    let userPicture;

    const userPictureRes = await uploadCloudinary(profilePhoto);
    userPicture = userPictureRes.secure_url;

    try {
        const newUser = await User.create({
            email,
            userName,
            password,
            profilePhoto: userPicture 
        });

        

        await Auth.create({
            userName,
            email,
            password: getSHA256ofString(password),
            myID: newUser.get("id"),
            profilePhoto: userPicture
        });

        return newUser;
    } catch (error) {
        throw error;
    }
}

export async function updateUser(data, userId) {
    const updateData = {
        userName: data.userName,
        password: data.password,
        profilePhoto: data.profilePhoto
    };

    if (updateData.userName) {
        try {
            await User.update({ userName: updateData.userName }, {
                where: { id: userId }
            });
        } catch (error) {
            throw error;
        }
    }

    if (updateData.password) {
        try {
            await updatePassword(updateData.password, userId);
        } catch (error) {
            throw error;
        }
    }

    if (updateData.profilePhoto) {
        const userPictureRes = await uploadCloudinary(updateData.profilePhoto);
        const userPicture = userPictureRes.secure_url;

        try {
            await User.update({ profilePhoto: userPicture }, {
                where: { id: userId }
            });

            await Auth.update({ profilePhoto: userPicture }, {
                where: { myID: userId }
            });
        } catch (error) {
            throw error;
        }
    }

    return updateData;
}

export async function getAllUsers() {
    try {
        return await User.findAll({});
    } catch (error) {
        throw error;
    }
}

export async function checkMail(email) {
    try {
        return await User.findOne({
            where: { email }
        });
    } catch (error) {
        throw error;
    }
}
