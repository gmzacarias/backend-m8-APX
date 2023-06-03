import { sequelize } from "./models/sequelize";
import "./models"

sequelize.sync({ alter: true }).then((res) => console.log(res));