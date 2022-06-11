const osascript = require("node-osascript")

async function parse(text: string) {

    let note = ""
    text.split("\\n").map(line => note += line)

    let parsedNotes: SoapNote[] = []

    const clientNotes = note.split("\n\n")
    const promises = clientNotes.map(async (rawSubNote) => {
        const subNote = rawSubNote.replace(/^\s+|\s+$/g, "");
        const name = subNote.split(":")[0]

        let restOfNote = ""
        restOfNote = restOfNote.replace(/$\s+|\s+$/gm, "")

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

        for (let i = 1; i < splitByLines.length - 2; i++) {

            let current = clean(splitByLines[i])

            if (i != 1) {
                objectives += ", "
            }

            objectives += current
        }

        let plan = ""
        let action: any = ""

        const planWords = ["stretch", "come back", "N/A"]
        const actionWords = ["DT", "focus", "deep tissue", "worked on"]
        const shouldStretchWords = ["glute", "quad", "hamstring", "calve"]

        if (includes(last, planWords) || includes(secondToLast, actionWords)) {
            plan = last
            action = secondToLast
        } else if (includes(last, actionWords)) {
            objectives = updateObjectives(objectives, secondToLast)

            action = last

            //doesn't set plan

        } else {
            const result = await showMenu(last, secondToLast)

            if (result == last) {

                objectives = updateObjectives(objectives, secondToLast)

                action = last
                //doesn't set plan

            } else if (result == `${secondToLast} ('${last}' as plan)`) {
                action = secondToLast
                plan = last
            } else {
                objectives = updateObjectives(objectives, `${clean(secondToLast)}, ${clean(last)}`)

                action = "focus on problem areas"
                //doesn't set plan
            }
        }

        if (plan == "") {
            if (includes(objectives, shouldStretchWords)) {
                plan = "stretch"
            } else {
                plan = "N/A"
            }
        }
        
        parsedNotes.push({name, subject, objectives, action, plan})

    })

    await Promise.all(promises)

    return parsedNotes



    // const name = note.split(":")[0]

}

function updateObjectives(currentObjectives:string, string:string) {
    if (currentObjectives != "") {
        currentObjectives += ", "
    }

    return currentObjectives + clean(string)
}

function clean(text: string) {
    return text.replace(/^[-\s]+|\s+$/gm, "");
}

function includes(string: string, searches: string[]) {

    let doesInclude = false
    searches.map(search => {
        if (string.includes(search)) doesInclude = true
    })

    return doesInclude
}

function showMenu(last: string, secondToLast: string) {

    return new Promise((resolve, reject) => {
        osascript.execute('display dialog "Which is the Action?" buttons {op1, op2, op3}\nset DlogResult to result\n return result',
            {
                op1: last,
                op2: `${secondToLast} ('${last}' as plan)`,
                op3: "focus on problem areas"
            },
            function (err: any, result: any, raw: any) {
                if (err) return reject(err)
                let returnValue: string
                returnValue = result["button returned"]
                resolve(returnValue)
            });
    })
}

type SoapNote = {
    name: string;
    subject: string;
    objectives: string;
    action: string;
    plan: string;
}

module.exports = { parse }