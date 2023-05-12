import 'dotenv/config';
import { Auth } from "../models";
import { uploadCloudinary } from "../lib/cloudinary"
import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";
const SECRET = process.env.SECRET

export function getSHA256ofString(text) {
    return crypto.createHash('sha256').update(text).digest('hex')
}

export async function getToken(data) {
    const { email, password } = data
    const hashedPassword = getSHA256ofString(password)

    try {
        const auth = await Auth.findOne({
            where: {
                email,
                password: hashedPassword
            }
        })
        console.log(auth);
        let token = null
        if (auth) {
            token = jwt.sign({ id: auth.get("myID") }, SECRET)
        }
        return token
    } catch (error) {
        throw error
    }
}

export async function updatePassword(newPassword, userId) {
    const hashedPassword = getSHA256ofString(newPassword)

    try {
        return await Auth.update({ password: hashedPassword }, {
            where: {
                myID: userId
            }
        })
    } catch (e) {
        throw e
    }
}
