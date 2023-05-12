import express from 'express';
import 'dotenv/config'
import { createUser, checkMail, updateUser } from "./controllers/users-controller"
import { getReports, createReport } from "./controllers/reports-controller"
import { getAllPets, petsAroundMe, createPet, updatePet, deletePetById, allPetsByUser, reportPetFound } from "./controllers/pets-controllers"
import { getToken } from "./controllers/auth-controller"
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
//sign up
app.post("/auth", CheckMiddleware, async (req, res) => {
    try {
        const user = await createUser(req.body)
        res.json(user)
    } catch (error) {
        res.status(400).json(error)
    }

})

//verify email
app.get("/check-email", async (req, res) => {
    try {
        const userEmail = await checkMail(req.query.email)
        res.json(userEmail)
    } catch (error) {
        res.status(400).json(error)
    }
})

//login
app.post("/auth/token", CheckMiddleware, async (req, res) => {
    try {
        const token = await getToken(req.body)
        res.json(token)
        res.json({
            original: req.body,
            hash: token
        })
    } catch (error) {
        res.status(400).json(error)
    }
})


//update user data
app.put("/update-user", CheckMiddleware, authMiddleware, async (req, res) => {
    const { userId } = req.query
    try {
        const update = await updateUser(req.body, userId)
        res.json(update)
    } catch (error) {
        res.status(400).json(error)
    }
})

//get my pets
app.get("/user/pets", authMiddleware, async (req, res) => {
    const { userId } = req.query
    try {
        const data = await allPetsByUser(userId)
        res.json(data)
        console.log(data)
    } catch (error) {
        res.status(400).json(error)
    }
})



//Endpoints pets

//create pet
app.post("/create-pet", authMiddleware, async (req, res,user:any) => {
    const userId = req.user.id;
    try {
        const createNewPet = await createPet(req.body,userId)
        res.json(createNewPet)
    } catch (error) {
        res.status(400).json(error)
    }
})




//update pet
app.put("/update-pet", authMiddleware, async (req, res) => {
    const { petId } = req.query
    try {
        const data = await updatePet(req.body, petId)
        res.json(data)
    } catch (error) {
        res.status(400).json(error)
    }
})


// delete pet
app.delete("/pet", authMiddleware, async (req, res) => {
    const { petId } = req.query
    try {
        const data = await deletePetById(petId)
        res.json(data)
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
        res.json(newReport)
    } catch (error) {
        res.status(400).json(error)
    }
})

//report pet found
app.put("/pet-found", authMiddleware, async (req, res) => {
    const { petId } = req.query
    try {

        const data = await reportPetFound(petId)
        res.json(data)
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
        res.json(hits);
    } catch (error) {
        res.status(400).json(error)
    }
});

//Endpoints get all data

//get all reports
app.get("/all-reports", async (req, res) => {
    const reports = await getReports()
    res.json(reports)
})

//get all pets
app.get("/all-pets", async (req, res) => {
    const allPets = await getAllPets()
    res.json(allPets)
})



const relativeRoute = path.resolve(__dirname, "../../dist");
app.use(express.static(relativeRoute))
app.get("*", function (req, res) {
    res.sendFile(relativeRoute + "/index.html");
})


app.listen(port, () => {
    console.log(`servidor OK, en el puerto ${port}`);
});



