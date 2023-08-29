const nodemailer = require("nodemailer")

module.exports = async(userEmail,subject,htmlTemplate)=>{
    try {
        const trensporter = nodemailer.createTransport({
            service:"gmail",
            auth:{
                user:process.env.APP_EMAIL_ADDRESS, //sender
                pass:process.env.APP_EMAIL_PASSWORD
            }
        });
        const mailOptions = {
            from:process.env.APP_EMAIL_ADDRESS, //sender,
            to:userEmail,
            subject:subject,
            html:htmlTemplate
        };
        const info = await trensporter.sendMail(mailOptions)
        console.log("email send" + info.response)
    } catch (error) {
        console.log(error)
        throw new Error("internel server error (nodemailer) ")
    }
}