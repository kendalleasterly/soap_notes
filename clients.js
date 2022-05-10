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
            date: data.date
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

module.exports = { sanatizedClients, sortClients }
