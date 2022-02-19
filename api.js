// API function calls
const User = require('./models/user.model.js')
const nodemailer = require('nodemailer')

async function addUser(username, password, email, res) {
    // Check if username or email is taken
    await User.findOne({$or: [
        {username: username},
        {email: email}
    ]}).then( async (user) => {
        // Username or email taken
        if (user) 
            res.send("Username or email taken")
        // Create user and put in database
        else {
            await User.create({
                username: username,
                password: password,
                email: email,
                verified: false,
            })
            sendVerificationEmail(email)
            res.send("registered!")
        }
    })
}

async function verifyUser(email, key, res) {
    // Verify key
    if (key == "abracadabra") {
        // Check if email exists
        await User.findOne({email: email})
        .then( async (user) => {
            if (!user) {
                res.status(404).send("Email does not exist")
            }
            else {
                // Change verification status
                await User.findOneAndUpdate({email: email}, {verified: true});
                res.send(`
                    ${email} verified!
                `);
            }
        })

    }
    // Wrong key
    else {
        res.status(401).send("Wrong key")
    }
}

async function login(username, password, res) {
    await User.findOne({$and: [
        {username: username},
        {password: password},
    ]}).then( (user) => {
        if (!user)
            res.status(401).send("Incorrect credentials")
        else {
            if (user.verified) {
                res.send(`Logged in as ${username}`)
            }
            else {
                res.status(403).send("This user has not been verified")
            }
        }
    })
}

function sendVerificationEmail(email) {
     // User added to database, send a verification email
     let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465, // Secure SMTP port
        secure: true,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        }
    })
    transporter.sendMail({
        from: '"Hot Pink" <team.hotpink.inc@gmail.com>',
        to: email,
        subject: "Verify Email Address",
        html: `
        <body>
        Thanks for registering for an account! Before we get started, 
        we just need to confirm that this is you. <br><br>
        Click below to verify your email address: <br><br>
        <a href="http://localhost:8080/verify?email=${email}&key=abracadabra">
        Verify</a><br><br>
        ${new Date()}
        </body>
        `,
    })
}

module.exports = { addUser, verifyUser, login }
