const User = require('./models/user.model.js')

async function addUser(username, password, email) {
    await User.create({
        username: username,
        password: password,
        email: email,
        disabled: true
    })
}

module.exports = { addUser }
