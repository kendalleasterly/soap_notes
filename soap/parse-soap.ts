const osascript = require("node-osascript")
const {sortClients} = require("../clients")
const fs = require("fs").promises

async function parseAndAdd(text: string) {
	const date = text.split("~")[0]

	const parsedNotes = await parse(text.split("~")[1])
    console.log({parsedNotes})

	let newClients: any = {}

	parsedNotes.map((note) => {
		const id = note.name + "-" + date
		newClients[id] = {
			...note,
			date,
		}
	})

	const existingClientsString = await fs.readFile("./soap/clients.json")
	const existingClients = JSON.parse(existingClientsString)

	const totalClients = {
		...existingClients,
		...newClients,
	}

	await fs.writeFile(
		"./soap/clients.json",
		JSON.stringify(totalClients, null, 2)
	)
}

async function parse(text: string) {
	let note = ""
	text.split("\\n").map((line) => (note += "\n" + line))
	note = note.trim()

	let parsedNotes: SoapNote[] = []

	const clientNotes = note.split("\n\n")
	const promises = clientNotes.map(async (rawSubNote) => {
		const subNote = rawSubNote.replace(/^\s+|\s+$/g, "")
		const name = subNote.split(":")[0]

		let restOfNote = ""
		restOfNote = restOfNote.replace(/$\s+|\s+$/gm, "")

		if (!subNote.toUpperCase().includes("SALT")) {
			const splitSections = subNote.split(":").slice(1)
			for (let i = 0; i < splitSections.length; i++) {
				const current = splitSections[i]

				restOfNote += current

				if (i != splitSections.length - 1) {
					restOfNote += ":"
				}
			}

			const splitByLines = restOfNote.split("\n")
			const subject = clean(splitByLines[0])

			const last = splitByLines[splitByLines.length - 1]
			const secondToLast = splitByLines[splitByLines.length - 2]

			let objectives = ""

			let plan = ""
			let action: any = ""

			const planWords = ["stretch", "come back", "n/a"]
			const actionWords = ["dt", "focus", "deep tissue", "worked on"]

			for (let i = 1; i < splitByLines.length - 2; i++) {
				let current = clean(splitByLines[i])

				if (includes(current, planWords)) {
					plan = current
				} else if (includes(current, actionWords)) {
					action = current
				} else {
					if (i != 1) {
						objectives += ", "
					}

					objectives += current
				}
			}

			if (plan == "") {
				if (includes(last, planWords)) {
					plan = last
				} else if (includes(secondToLast, planWords)) {
					plan = secondToLast
				}
			}

			if (action == "") {
				if (includes(last, actionWords)) {
					action = last
				} else if (includes(secondToLast, actionWords)) {
					action = secondToLast
				} else {
					const result = await showMenu(last, secondToLast)

					if (result == last) {
						objectives = updateObjectives(objectives, secondToLast)

						action = last
						//doesn't set plan
					} else if (result == `${secondToLast} ('${last}' as plan)`) {
						action = secondToLast
						plan = last
						//doesn't set plan
					} else {
						objectives = updateObjectives(
							objectives,
							`${clean(secondToLast)}, ${clean(last)}`
						)

						action = "focus on problem areas"
					}
				}
			}

			if (secondToLast != action && secondToLast != plan) {
				console.log("secondToLast wasn't either")
				objectives = updateObjectives(objectives, secondToLast)
			}

			if (last != action && last != plan) {
				console.log("last wasn't either")
				objectives = updateObjectives(objectives, last)
			}

			const shouldStretchWords = ["glute", "quad", "hamstring", "calve"]

			if (plan == "") {
				if (includes(objectives, shouldStretchWords)) {
					plan = "stretch"
				} else {
					plan = "N/A"
				}
			}

			parsedNotes.push({ name, subject, objectives, action, plan })
		} else {
            const note:any = await salt(name)
            note.plan = "come back as needed"
            delete note.date
            parsedNotes.push(note)
		}
	})

	await Promise.all(promises)

	return parsedNotes
}

async function salt(name: string) { //Same As Last Time
    const parsedClientsString = await fs.readFile("./soap/clients.json")
    const parsedClients = JSON.parse(parsedClientsString)

    let matchedClients:any[] = []

    Object.values(parsedClients).map((client:any) => {
        if (name.toLowerCase().includes(client.name.toLowerCase())) {
            matchedClients.push(client)
        }
    })

    return sortClients(matchedClients)[matchedClients.length - 1]
}

function updateObjectives(currentObjectives: string, string: string) {
	if (currentObjectives != "") {
		currentObjectives += ", "
	}

	return currentObjectives + clean(string)
}

function clean(text: string) {
	return text.replace(/^[-\s]+|\s+$/gm, "")
}

function includes(string: string, searches: string[]) {
	let doesInclude = false
	searches.map((search) => {
		if (string.toLowerCase().includes(search)) doesInclude = true
	})

	return doesInclude
}

function showMenu(last: string, secondToLast: string) {
	return new Promise((resolve, reject) => {
		osascript.execute(
			'display dialog "Which is the Action?" buttons {op1, op2, op3}\nset DlogResult to result\n return result',
			{
				op1: last,
				op2: `${secondToLast} ('${last}' as plan)`,
				op3: "focus on problem areas",
			},
			function (err: any, result: any, raw: any) {
				if (err) return reject(err)
				let returnValue: string
				returnValue = result["button returned"]
				resolve(returnValue)
			}
		)
	})
}

type SoapNote = {
	name: string
	subject: string
	objectives: string
	action: string
	plan: string
}

module.exports = { parseAndAdd }
