const finishedClients = require("../uploading/finishedClients.json")
const indexedClients = require("./indexedClients.json")
const fs = require("fs").promises

async function indexClients() {

	let newIndexedClients = {}

	indexedClients.map(client => {

		const id = client.name.split(" ")[0] + "-" + client.date
		
		newIndexedClients[id] = client

	})

	await fs.writeFile(
		"./indexing/indexedClients.json",
		JSON.stringify(newIndexedClients, null, 2)
	);

}

async function setUnfinishedClients(page, i, stop) {
	await page.goto(url + "?page=" + i);
	let clients = await getClients(page);
	console.log(clients[0]);

	if (finishedClients.includes(clients[0].link)) {

		let newClients = []

		clients.map(client => {
			if (!finishedClients.includes(client.link)) newClients.push(client)
		})

		return clients //may include new, go through in next
	} else if (i == stop) {
		return clients;
	} else {
		const clientsOnPages = await setUnfinishedClients(page, i + 1, stop);

		clients = clients.concat(clientsOnPages);

		return clients;
	}

	//she can create the note on the day of the client or any day after the client was seen
}


//MARK: Helper Functions

async function getClients(page) {
	let clients = [];

	const clientsElements = await page.$$("li");

	const promises = clientsElements.map(async (clientElement) => {
		const name = await clientElement.$eval("div.text-sm > a", (element) => {
			let text = element.textContent;
			return text.replace(/$\s+/gm, "");
		});

		const date = await clientElement.$eval(
			"div.mt-2.text-gray-500",
			(element) => {
				let text = element.textContent;
				text = text.replace(/$\s+/gm, "");
				let date = text.split(",")[0];
				let dateObj = new Date(date);
				dateObj.setFullYear(new Date().getFullYear());
				return dateObj.toISOString().split("T")[0];
			}
		);

		const link = await clientElement.$eval("a.text-gray-800", (element) =>
			element.getAttribute("href")
		);
		clients.push({name, date, link});
	});

	await Promise.all(promises);

	return clients;
}

module.exports = {indexClients};