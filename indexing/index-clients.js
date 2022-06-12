const { sortClients } = require("../clients");
const { url } = require("../puppeteer/puppeteer");
const indexedClients = require("./indexedClients.json")
const fs = require("fs").promises

async function indexClients(page) {
	const rawClients = await setUnfinishedClients(page, 1, 4)

	let clients = {}
	rawClients.map(rawClient => {
		const id = rawClient.name.split(" ")[0] + "-" + rawClient.date
		clients[id] = rawClient
	})
	
	console.log(clients);

	const totalList = {
		...indexedClients,
		...clients
	}

	await fs.writeFile("./indexing/indexedClients.json", JSON.stringify(totalList, null, 2))
}

async function setUnfinishedClients(page, i, stop) {
	await page.goto(url + "?page=" + i);
	let clients = await getClients(page);
	clients = sortClients(clients)

	const first = clients[0]; //also the earliest one after sorting
	const firstID = first.name.split(" ")[0] + "-" + first.date
	console.log(firstID, first);

	if (Object.keys(indexedClients).includes(firstID)) {
		console.log("found outdated")
		let newClients = [];

		clients.map((client) => {
			if (!Object.keys(indexedClients).includes(client.name.split(" ")[0] + "-" + client.date)) newClients.push(client);
		});

		return newClients; //may include new, go through in next
	} else if (i == stop) {
		console.log("reached stop");
		return clients;
	} else {
		console.log("neither")
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