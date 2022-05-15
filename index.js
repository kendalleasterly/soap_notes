const { sanatizedClients, sortClients } = require("./clients")
const {test} = require("./puppeteer")
let clients = require("./clients.json")


// test()




clients = sanatizedClients(clients)
clients = sortClients(clients)
console.log(clients)