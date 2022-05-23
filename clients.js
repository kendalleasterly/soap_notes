const fs = require("fs").promises
const soapedClientsJSON = require("./clients.json")
const unfinishedClients = require("./unfinishedClients.json")

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
	Object.keys(clientsObj).forEach((key) => console.log(key))

	const newArr = Object.values(clientsObj).sort((a, b) => {
		return new Date(a.date).getTime() - new Date(b.date).getTime()
	})

	return newArr.reverse()
}

function matchClients() {
	let matches = []

	Object.values(soapedClientsJSON).map((sClient) => {
		unfinishedClients.map((uClient) => {
			if (uClient.date == sClient.date) {
				if (uClient.name.toLowerCase().includes(sClient.name.toLowerCase())) {
					//we've found a match

					let match = sClient

					delete match.name
					delete match.date

					match = {
						...match,
						...uClient,
					}

                    matches.push(match)
				}
			}
		})
	})

    return matches
}

module.exports = { sanatizedClients, sortClients, matchClients }
