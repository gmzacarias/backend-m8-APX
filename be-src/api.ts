import express from 'express';
import 'dotenv/config'
import { createUser, checkMail, updateUser, getAllUsers } from "./controllers/users-controller"
import { getReports, createReport } from "./controllers/reports-controller"
import { getAllPets, petsAroundMe, createPet, updatePet, deletePetById, allPetsByUser, reportPetFound } from "./controllers/pets-controllers"
import { generateToken, getToken, resetPassword, sendResetPassword } from "./controllers/auth-controller"
import cors from "cors";
import * as path from "path"
import { authMiddleware, CheckMiddleware } from "./models/middlewares"
import "./types"

let app = express()
app.use(express.json({
    limit: "100mb"
}));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.options('*', cors())
app.use(cors());
const port = process.env.PORT || 3000

//verify email
app.get("/check-email", async (req, res) => {
    try {
        const { email } = req.query
        const emailExists = await checkMail(email)
        if (emailExists) {
            res.status(200).json({ message: "El correo electrónico existe en la base de datos" });
        } else {
            //
            res.status(302).json({ message: "El correo electrónico no existe en la base de datos" });
        }
    } catch (error) {
        res.status(400).json(error)
    }
})

//sign up
app.post("/auth", CheckMiddleware, async (req, res) => {
    try {
        const user = await createUser(req.body)
        res.status(201).json(user)
    } catch (error) {
        res.status(400).json(error)
    }

})

//sign in
app.post("/auth/token", CheckMiddleware, async (req, res) => {
    try {
        const token = await getToken(req.body)

        if (!token) {
            res.status(401).json({ error: "Error en la contraseña,acceso no autorizado" });
        } else {
            res.status(200).json(token)
        }

    } catch (error) {
        res.status(400).json(error)
    }
})


//update user data
app.put("/update-user", CheckMiddleware, authMiddleware, async (req, res) => {
    const { userId } = req.query
    try {
        const update = await updateUser(req.body, userId)
        res.status(200).json(update)
    } catch (error) {
        res.status(400).json(error)
    }
})

//reset password
app.post("/reset-password", async (req, res) => {
    const { email } = req.body;
    try {
        const token = generateToken(email)

        await sendResetPassword(email, token);

        res.status(200).json({ message: "Se ha enviado un correo electronico para restablecer la contraseña" })

    }
    catch (error) {
        console.error("Error al solicitar restablecer la contraseña", error)
        res.status(500).json({ error: "Ha ocurrido un error al solicitar restablecer la contraseña" })
    }
})

//reestablecer contraseña
app.post("reset-password/:token", async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        await resetPassword(token, newPassword)

        res.status(200).json({ message: "La contraseña se ha restablecido correctamente" })
    }
    catch (error) {
        console.error("Error al restablecer la contraseña", error)
        res.status(500).json({ error: "Ha ocurrido un error al restablecer la contraseña" })
    }
})



//get my pets
app.get("/user/pets", authMiddleware, async (req, res) => {
    const { userId } = req.query
    try {
        const data = await allPetsByUser(userId)
        res.status(200).json(data)
        console.log(data)
    } catch (error) {
        res.status(400).json(error)
    }
})



//Endpoints pets

//create pet
app.post("/create-pet", authMiddleware, async (req, res, user: any) => {
    const userId = req.user.id;
    try {
        const createNewPet = await createPet(req.body, userId)
        res.status(201).json(createNewPet)
    } catch (error) {
        res.status(400).json(error)
    }
})




//update pet
app.put("/update-pet", authMiddleware, async (req, res) => {
    const { petId } = req.query
    try {
        const data = await updatePet(req.body, petId)
        res.status(200).json(data)
    } catch (error) {
        res.status(400).json(error)
    }
})


// delete pet
app.delete("/pet", authMiddleware, async (req, res) => {
    const { petId } = req.query
    try {
        const data = await deletePetById(petId)
        res.status(200).json(data)
    } catch (error) {
        res.status(400).json(error)
    }
})

//Endpoints reports

//report pet
app.post("/report-pet", async (req, res) => {
    const { petId } = req.query
    try {
        const newReport = await createReport(petId, req.body)
        res.status(201).json(newReport)
    } catch (error) {
        res.status(400).json(error)
    }
})

//report pet found
app.put("/pet-found", authMiddleware, async (req, res) => {
    const { petId } = req.query
    try {

        const data = await reportPetFound(petId)
        res.status(200).json(data)
    } catch (error) {
        res.status(400)
        console.log(error)
    }
})

//gets pets near me
app.get("/pets-around-me", async (req, res) => {
    const { lat, lng } = req.query
    try {
        const hits = await petsAroundMe(lat, lng)
        res.status(200).json(hits);
    } catch (error) {
        res.status(400).json(error)
    }
});

//Endpoints get all data

//get all reports
app.get("/all-reports", async (req, res) => {
    const reports = await getReports()
    res.status(200).json(reports)
})

//get all pets
app.get("/all-pets", async (req, res) => {
    const allPets = await getAllPets()
    res.status(200).json(allPets)
})

//get all users
app.get("/all-users", async (req, res) => {
    const allUsers = await getAllUsers()
    res.status(200).json(allUsers)
})


const relativeRoute = path.resolve(__dirname, "../../dist");
app.use(express.static(relativeRoute))
app.get("*", function (req, res) {
    res.sendFile(relativeRoute + "/index.html");
})


app.listen(port, () => {
    console.log(`servidor OK, en el puerto ${port}`);
});



