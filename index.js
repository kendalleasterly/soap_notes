const fs = require("fs/promises")

const { parse } = require("./soap/parse-soap");
const {startSession} = require("./puppeteer/puppeteer")
const {indexClients} = require("./indexing/index-clients")

startSession(indexClients)

// const readline = require("readline").createInterface({
// 	input: process.stdin,
// 	output: process.stdout,
// });

// async function getInput() {
// 	return new Promise((resolve, reject) => {
// 		readline.question("", (input) => {
//             resolve(input);
            
// 			readline.close();
// 		});
// 	});
// }

// getInput().then(async stuff => {

// 	if (stuff == "index") {
		
// 	} else {
// 		const notes = await parse(stuff);
// 		console.log(notes);
		
		
// 		//make sure the parsing file puts this into the database
// 	}
// })