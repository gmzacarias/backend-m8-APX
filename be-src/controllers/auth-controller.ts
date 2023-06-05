import 'dotenv/config';
import { Auth } from "../models";
import { sgMail } from "../lib/sendgrid"
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

//generar un token unico,que expira en un tiempo determinado.
export function generateToken(email) {
    const token = jwt.sign({ email }, SECRET, { expiresIn: "2h" })
    return token
}

export async function recoverPassword(email,token) {
    try {
        const user = await Auth.findOne({ where: { email } })
        if (!user) {
            throw new Error("no se encontro al usuario")
        }
     

        await sendResetPassword(email,token)
        return "se ha enviado un correo electronico con el token generado"
    }
    catch (error) {
        throw (error)
    }
}

export async function resetPassword(token, newPassword) {

    try {
        //verifica el token y obtiene el mail asociado
        const decoded = jwt.verify(token, SECRET)
        const email = decoded["email"]

        //buscar el usuario por su mail
        const user = await Auth.findOne({ where: { email } })
        if (!user) {
            throw new Error("no se encontro un usuario, con ese correo electronico")
        }

        //generar el hash de la nueva contraseña
        const hashedPassword = crypto.createHash("sha256").update(newPassword).digest("hex")

        //actualizar la contraseña del usuario
        await user.update({ password: hashedPassword });

        // Éxito en el restablecimiento de la contraseña
        return 'La contraseña se ha restablecido correctamente';

    }
    catch (error) {
        throw error
    }
}


export async function sendResetPassword(email, token) {
    const verifiedSender = "gastonmzacarias@gmail.com"
    const msg = {
        to: email,
        from: verifiedSender,
        subject: "Rstablecimiento de contraseña",
        html:
            `<p>Hola</p>
            <p>Recibiste este correo electrónico porque solicitaste restablecer tu contraseña.</p>
      <p>Por favor, haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="https://localhost:3000/reset-password?token=${token}">Restablecer contraseña</a>
      <p>Si no solicitaste restablecer tu contraseña, ignora este correo electrónico.</p>
      <p>Gracias.</p>
    `,
    }

    try {
        await sgMail.send(msg);
        console.log("Correo electronico de restablecimiento de contraseña enviado")
    }
    catch (error) {
        console.error("Error al enviar el correo de restablecimiento de contraseña")
        throw error
    }
}
