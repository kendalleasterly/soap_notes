"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const osascript = require("node-osascript");
const { sortClients } = require("../clients");
const fs = require("fs").promises;
function parseAndAdd(text) {
    return __awaiter(this, void 0, void 0, function* () {
        const date = text.split("~")[0];
        const parsedNotes = yield parse(text.split("~")[1]);
        console.log({ parsedNotes });
        let newClients = {};
        parsedNotes.map((note) => {
            const id = note.name + "-" + date;
            newClients[id] = Object.assign(Object.assign({}, note), { date });
        });
        const existingClientsString = yield fs.readFile("./soap/clients.json");
        const existingClients = JSON.parse(existingClientsString);
        const totalClients = Object.assign(Object.assign({}, existingClients), newClients);
        yield fs.writeFile("./soap/clients.json", JSON.stringify(totalClients, null, 2));
    });
}
function parse(text) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log("TEXT")
        let note = "";
        // console.log(text)
        // console.log("NOTE")
        text.split(`\\n`).map((line) => (note += `\n` + line));
        note = note.replace(/^\s+|\s+$/g, "");
        // console.log(note)
        // console.log("end")
        let parsedNotes = [];
        const clientNotes = note.split("\n\n");
        const promises = clientNotes.map((rawSubNote) => __awaiter(this, void 0, void 0, function* () {
            const subNote = rawSubNote.replace(/^\s+|\s+$/g, "");
            const name = subNote.split(":")[0];
            let restOfNote = "";
            restOfNote = restOfNote.replace(/$\s+|\s+$/gm, "");
            if (subNote.toUpperCase().includes("SALT")) {
                const note = yield salt(name);
                note.plan = "come back as needed";
                delete note.date;
                parsedNotes.push(note);
            }
            else if (subNote.trim().split("\n").length <= 1) {
                console.log(subNote, "didn't have enough lines");
            }
            else if (!subNote.includes(":")) {
                console.log("didn't have colon");
            }
            else {
                const splitSections = subNote.split(":").slice(1);
                for (let i = 0; i < splitSections.length; i++) {
                    const current = splitSections[i];
                    restOfNote += current;
                    if (i != splitSections.length - 1) {
                        restOfNote += ":";
                    }
                }
                const splitByLines = restOfNote.split("\n");
                const subject = clean(splitByLines[0]);
                const last = splitByLines[splitByLines.length - 1];
                const secondToLast = splitByLines[splitByLines.length - 2];
                let objectives = "";
                let plan = "";
                let action = "";
                const planWords = ["stretch", "come back", "n/a"];
                const actionWords = ["dt", "focus", "deep tissue", "worked on"];
                for (let i = 1; i < splitByLines.length - 2; i++) {
                    let current = clean(splitByLines[i]);
                    if (includes(current, planWords)) {
                        plan = current;
                    }
                    else if (includes(current, actionWords)) {
                        action = current;
                    }
                    else {
                        if (i != 1) {
                            objectives += ", ";
                        }
                        objectives += current;
                    }
                }
                if (plan == "") {
                    if (includes(last, planWords)) {
                        plan = last;
                    }
                    else if (includes(secondToLast, planWords)) {
                        plan = secondToLast;
                    }
                }
                if (action == "") {
                    if (includes(last, actionWords)) {
                        action = last;
                    }
                    else if (includes(secondToLast, actionWords)) {
                        action = secondToLast;
                    }
                    else {
                        const result = yield showMenu(last, secondToLast);
                        if (result == last) {
                            objectives = updateObjectives(objectives, secondToLast);
                            action = last;
                            //doesn't set plan
                        }
                        else if (result == `${secondToLast} ('${last}' as plan)`) {
                            action = secondToLast;
                            plan = last;
                            //doesn't set plan
                        }
                        else {
                            objectives = updateObjectives(objectives, `${clean(secondToLast)}, ${clean(last)}`);
                            action = "focus on problem areas";
                        }
                    }
                }
                if (secondToLast != action && secondToLast != plan) {
                    console.log("secondToLast wasn't either");
                    objectives = updateObjectives(objectives, secondToLast);
                }
                if (last != action && last != plan) {
                    console.log("last wasn't either");
                    objectives = updateObjectives(objectives, last);
                }
                const shouldStretchWords = ["glute", "quad", "hamstring", "calve"];
                if (plan == "") {
                    if (includes(objectives, shouldStretchWords)) {
                        plan = "stretch";
                    }
                    else {
                        plan = "N/A";
                    }
                }
                parsedNotes.push({ name, subject, objectives, action, plan });
            }
        }));
        yield Promise.all(promises);
        return parsedNotes;
    });
}
function salt(name) {
    return __awaiter(this, void 0, void 0, function* () {
        const parsedClientsString = yield fs.readFile("./soap/clients.json");
        const parsedClients = JSON.parse(parsedClientsString);
        let matchedClients = [];
        Object.values(parsedClients).map((client) => {
            if (name.toLowerCase().includes(client.name.toLowerCase())) {
                matchedClients.push(client);
            }
        });
        return sortClients(matchedClients)[matchedClients.length - 1];
    });
}
function updateObjectives(currentObjectives, string) {
    if (currentObjectives != "") {
        currentObjectives += ", ";
    }
    return currentObjectives + clean(string);
}
function clean(text) {
    return text.replace(/^[-\s]+|\s+$/gm, "");
}
function includes(string, searches) {
    let doesInclude = false;
    searches.map((search) => {
        if (string.toLowerCase().includes(search))
            doesInclude = true;
    });
    return doesInclude;
}
function showMenu(last, secondToLast) {
    return new Promise((resolve, reject) => {
        osascript.execute('display dialog "Which is the Action?" buttons {op1, op2, op3}\nset DlogResult to result\n return result', {
            op1: last,
            op2: `${secondToLast} ('${last}' as plan)`,
            op3: "focus on problem areas",
        }, function (err, result, raw) {
            if (err)
                return reject(err);
            let returnValue;
            returnValue = result["button returned"];
            resolve(returnValue);
        });
    });
}
module.exports = { parseAndAdd };
