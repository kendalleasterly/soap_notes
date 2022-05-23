const { sanatizedClients, sortClients, matchClients } = require("./clients")
const {main} = require("./puppeteer")
let clients = require("./clients.json")


// console.log(Object.values(clients).length)

main()




// clients = sanatizedClients(clients)
// clients = sortClients(clients)
// console.log(clients)