const fs = require("fs").promises
const soapedClientsJSON = require("./soap/clients.json")
const indexedClients = require("./indexing/indexedClients.json")
const finishedClients = require("./uploading/finishedClients.json")

function generateNotUploaded() {

	let notUploaded = []

	Object.values(indexedClients).map(client => {
		if (!finishedClients.includes(client.link)) notUploaded.push(client)
	})

	return notUploaded
}

function sanatizedClients(clientsObj) {
	let newClientsObj = {}

	Object.entries(clientsObj).forEach((obj) => {
		const key = obj[0]
		const data = obj[1]

		console.log(key, data)

		newClientsObj[key] = {
			name: data.name.trim(),
			subject: data.subject.trim(),
			objectives: data.objectives.trim(),
			action: data.action.trim(),
			plan: data.plan.trim(),
			date: data.date,
		}
	})

	return newClientsObj
}

function sortClients(clientsObj) {

	const newArr = Object.values(clientsObj).sort((a, b) => {
		return new Date(a.date).getTime() - new Date(b.date).getTime()
	})

	return newArr
}

function matchClients() {
	let matches = []

	Object.values(soapedClientsJSON).map((sClient) => {
		Object.values(indexedClients).map((iClient) => {
			if (iClient.date == sClient.date) {
				if (iClient.name.toLowerCase().includes(sClient.name.toLowerCase())) {
					//we've found a match

					let match = sClient

					delete match.name
					delete match.date

					match = {
						...match,
						...iClient,
					}

                    matches.push(match)
				}
			}
		})
	})

    return matches
}

module.exports = {
	sanatizedClients,
	sortClients,
	matchClients,
	generateNotUploaded
};
