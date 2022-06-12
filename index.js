const {startSession} = require("./puppeteer/puppeteer");
const {indexClients} = require("./indexing/index-clients");
const {parseAndAdd} = require("./soap/parse-soap");
const { generateNotUploaded, sortClients } = require("./clients");
const clients = require("./soap/clients.json")

const readline = require("readline").createInterface({
	input: process.stdin,
	output: process.stdout,
});

async function main() {
	const input = await getInput();

	if (input == "index") {
		startSession(indexClients);
	} else {
		await parseAndAdd(input);

		//make sure the parsing file puts this into the database
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


// main()

const notUploaded = generateNotUploaded()

console.log(sortClients(clients))