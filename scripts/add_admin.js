require('./init_mongoose')
const User = require('../api/models/User')
const Constants = require('../api/utils/Constants');
const Helper = require('../api/utils/Helper')
const Inquirer = require('inquirer')
const questions = [
    { type: 'input', name: 'name', message: 'Name:' },
    { type: 'input', name: 'email', message: 'Email address:' },
    { type: 'input', name: 'mobile', message: 'Mobile number:' },
    { type: 'input', name: 'pwd', message: 'Password:' },
]

addAdmin()

async function addAdmin() {
    let data = await Inquirer.prompt(questions)
    data.password = Helper.getHashedPassword(data.pwd)
    data.role = Constants.ROLE_ADMIN
    data.country_code = "91"
    let user = await new User(data).save()
    console.log("Admin added successfully!!!")
    process.exit(0)
}