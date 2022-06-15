const {startSession} = require("./puppeteer/puppeteer");
const {indexClients} = require("./indexing/index-clients");
const {parseAndAdd} = require("./soap/parse-soap");
const { sortClients, generateNotUploaded } = require("./clients");
const clients = require("./soap/clients.json")

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

// const text = "2022-05-12~Kyle: general\ntensed up during whole session, kept reminding to relax; HT/Tight: Traps esg QL (L+) glutes hamstrings quads calves \nFBDT\nN/A\n\nCarroll: whole body tension; took a trip recently, slept weird; neck, shoulders, and lower body \ntraps, rhomboids, esg, ql (R+), glutes (R+), hamstrings, calves, neck, pecs (L+)\nMed pressure full body\ncome back w/in two weeks \n\nTomas: SALT"

main()