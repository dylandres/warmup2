const User = require('./models/user.model.js')

async function addUser(username, password, email) {
    await User.create({
        username: username,
        password: password,
        email: email,
        verified: false,
    })
}

async function verifyUser(email) {
    await User.findOneAndUpdate({email: email}, {verified: true});
}

module.exports = { addUser, verifyUser }
