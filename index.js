// const { indexClients } = require("./indexing/index-clients")
// const { startSession } = require("./puppeteer/puppeteer")
// const {parse} = require("./soap/parse-soap")
// const { main } = require("./uploading/upload")
const clients = require("./soap/clients.json")
const fs = require("fs/promises")

// const text = "Wendy: rq full body w emphasis on traps and r side body \nHT/Tight: traps (L+), rhomboids (R+), Esg, QL (L+), glutes (L+), calves, TFL, pecs (L+)\nDT on back, glutes (med), tfl, and pecs\ncome back in one month \n\nTzivia: at music festival all weekend, drive 4 hours there and back; hips and low back irritated; rq work on tmj and jaw \nHT/Tight: traps, rhomboids, QL, glutes (med), calves, quads, feet, neck, masseter\nFBDT w focus on problem areas; used heat on glutes\ncome back soon\n\nKendall: runner who sits at desk frequently; has knee pain under patella tendon after running \nHT/Tight: calves, glute med, QL, esg, traps (R+), rhomboids, quads (adhesions and TPs in rec fem and vast lat)\nDT on problem areas, used heat on UB";

// startSession(main)

// indexClients()

async function doSth() {

    let newObj = {}

    Object.values(clients).map(client => {
        const id = client.name + "-" + client.date
        console.log(id)
        newObj[id] = client
    })

    await fs.writeFile("./soap/clients.json", JSON.stringify(newObj, null, 2))
}

doSth()