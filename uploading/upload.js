const {matchClients} = require("../clients");
const fs = require("fs/promises")

async function matchAndUpload(page) {
	const matches = matchClients();

	const finishedClientsString = await fs.readFile("./uploading/finishedClients.json")
	const finishedClients = JSON.parse(finishedClientsString)

	let clientsToUpload = [];

	matches.map((match) => {
		if (!finishedClients.includes(match.link)) clientsToUpload.push(match);
	});

	await submitNotes(page, clientsToUpload)
}

async function submitNotes(page, clients) {
	//we take in the page because it's been logged in for us

	if (clients.length < 1) return;

	const client = clients.splice(0, 1)[0];

	console.log(client);

	await page.goto(client.link);

	const note = `
			<strong>Subjective:</strong>
			<p>${clean(client.subject)}</p>
			<p><br></p>
			
			<strong>Objective:</strong>
			<p>${clean(client.objectives)}</p>
			<p><br></p>

			<strong>Assessment:</strong>
			<p>${clean(client.action)}</p>
			<p><br></p>

			<strong>Plan:</strong>
			<p>${clean(client.plan)}</p>
			`;

	await page.$eval(
		"div.fr-wrapper div.fr-element.fr-view",
		(element, note) => {
			element.innerHTML = note;
		},
		note
	);

	await page.click("button.items-center.btn.btn-black");

	setTimeout(async () => {
		await page.click("button.items-center.btn.btn-black");
		console.log(`finished ${client.name}!`);

		const finishedClientsString = await fs.readFile("./uploading/finishedClients.json")
		const finishedClients = JSON.parse(finishedClientsString)

		const newFinished = [...finishedClients, client.link];
		await fs.writeFile(
			"./uploading/finishedClients.json",
			JSON.stringify(newFinished, null, 2)
		);
		await submitNotes(page, clients);
	}, 2500);
}

//MARK: Helper functions

function clean(string) {
	if (string.indexOf(",") == 0) {
		return string.substring(1).trim();
	} else {
		return string.trim();
	}
}

module.exports = {matchAndUpload};
