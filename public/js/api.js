// API function calls
const User = require('../../models/user.model.js')
const Game = require('../../models/game.model.js')
const nodemailer = require('nodemailer')

async function addUser(username, password, email, res) {
    // Check if username or email is taken
    await User.findOne({$or: [
        {username: username},
        {email: email}
    ]}).then( async (user) => {
        // Username or email taken
        if (user) 
            res.json({status: "ERROR"})
        // Otherwise, create user and put in database
        else {
            await User.create({
                username: username,
                password: password,
                email: email,
                verified: false,
            })
            // Send verification link to email
            sendVerificationEmail(email)
            res.json({status: "OK"})
        }
    })
}

async function verifyUser(email, key, res) {
    // Verify key
    if (key == "abracadabra") {
        // Check if email exists
        await User.findOne({email: email})
        .then( async (user) => {
            // Doesn't exist
            if (!user) {
                res.json({status: "ERROR"})
            }
            // Exists
            else {
                // Change verification status
                await User.findOneAndUpdate({email: email}, {verified: true});
                res.json({status: "OK"})
            }
        })

    }
    // Wrong key
    else {
        res.json({status: "ERROR"})
    }
}

async function login(username, password, req, res) {
    // Verify credentials
    await User.findOne({$and: [
        {username: username},
        {password: password},
    ]}).then( (user) => {
        // Wrong credentials
        if (!user) {
            res.json({status: "ERROR"})
        }
        else {
            // Check if user is verified
            if (user.verified) {
                // Associate session with user
                req.session.userID = user.id;
                // Allow user to access /dashboard
                req.session.isAuth = true;
                res.json({status: "OK"})
            }
            else
                res.json({status: "ERROR"})
        }
    })
}

async function logout(req, res) {
    var user = await User.findOne({_id: req.session.userID})
    // User not logged in
    if (!user)
        res.json({status: "ERROR"})
    else {
        // Destroy session
        req.session.destroy((err) => {
            if (err)
                res.json({status: "ERROR"})
            else
                res.json({status: "OK"})
        })
    }
}

function sendVerificationEmail(email) {
     // Create transporter object
     let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465, // Secure SMTP port
        secure: true,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        }
    })
    // Send email
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

// Find unfinished game with this id, return the grid
async function checkIfGameExists(user_id) {
    const game = await Game.findOne({$and: [
        {user_id: user_id},
        {winner: ""}
        ]})
    // Game exists
    if (game)
        return game
    // Game doesn't exist
    else
        return null
}

async function createNewGame(user_id) {
    const game = await Game.create({
        user_id: user_id,
        start_date: new Date(),
        grid: [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        winner: "",
    })
    return game
}

async function getGameById(id) {
    const game = await Game.findOne({
        _id: id
    })
    return game
}

async function editGame(game_id, grid, winner) {
    await Game.findByIdAndUpdate(game_id, {
        grid: grid,
        winner: winner
    })
}

async function getAllGames(id) {
    const games = await Game.find({
        user_id: id
    })
    return games
}


module.exports = { addUser, verifyUser, login, logout, checkIfGameExists,
     createNewGame, getGameById, editGame, getAllGames }
