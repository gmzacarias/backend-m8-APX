import { Report, Pet, User } from "../models"
import { sgMail } from "../lib/sendgrid"


export async function getReports() {
  return Report.findAll({})
}

export async function createReport(petId, data) {
  try {
    const petReport = await Pet.findByPk(petId)
    let userIdFromPet = petReport.get("userId") as any
    let userFromPet = await User.findByPk(userIdFromPet)
    console.log(userFromPet);
    const recipient = userFromPet.get("email");
    const verifiedSender= "gastonmzacarias@gmail.com"
    console.log(recipient)
    const createdReport = await Report.create({
      petId,
      name_reporter: petReport.get("name"),
      phone_number: data.phoneNumber,
      pet_info: data.pet_info,
    })
  
    const msg = {
      to: `${recipient}`, // Change to your recipient
      from: `${verifiedSender}`, // Change to your verified sender
      subject: `Se ha reportado informacion de ${data.petName}!`,
      text:
        `De: ${data.reporterName}
         Telefono: ${data.phone_number}
         Informacion: ${data.pet_info}
        `,
    }
    sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent')
      })
      .catch((error) => {
        console.error(error)
      })

  } catch (error) {
    throw error
  }

}

