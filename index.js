const {startSession} = require("./puppeteer/puppeteer");
const {indexClients} = require("./indexing/index-clients");
const {parseAndAdd} = require("./soap/parse-soap");
const { sortClients, generateNotUploaded } = require("./clients");
const clients = require("./soap/clients.json");
const { matchAndUpload } = require("./uploading/upload");

const readline = require("readline").createInterface({
	input: process.stdin,
	output: process.stdout,
});

async function main(givenInput) {
	const input = givenInput ? givenInput : await getInput();

	if (input == "index") {
		startSession(indexClients);
	} else if (input == "status") {

		const sortedClients = sortClients(clients)

		// console.log("~" + sortedClients[0].date)
		console.log("~" + sortedClients[sortedClients.length - 1].date) //production

	} else if (input == "upload") {

		await startSession(matchAndUpload)

	} else{
		await parseAndAdd(input);
	}
}

async function getInput() {

	return new Promise((resolve, reject) => {
		readline.question("", (input) => {
			resolve(input);

			readline.close();
		});
	});
}

main()