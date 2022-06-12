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
function parse(text) {
    return __awaiter(this, void 0, void 0, function* () {
        let note = "";
        text.split("\\n").map(line => note += "\n" + line);
        let parsedNotes = [];
        const clientNotes = note.split("\n\n");
        const promises = clientNotes.map((rawSubNote) => __awaiter(this, void 0, void 0, function* () {
            const subNote = rawSubNote.replace(/^\s+|\s+$/g, "");
            const name = subNote.split(":")[0];
            let restOfNote = "";
            restOfNote = restOfNote.replace(/$\s+|\s+$/gm, "");
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
            for (let i = 1; i < splitByLines.length - 2; i++) {
                let current = clean(splitByLines[i]);
                if (i != 1) {
                    objectives += ", ";
                }
                objectives += current;
            }
            let plan = "";
            let action = "";
            const planWords = ["stretch", "come back", "N/A"];
            const actionWords = ["DT", "focus", "deep tissue", "worked on"];
            const shouldStretchWords = ["glute", "quad", "hamstring", "calve"];
            if (includes(last, planWords) || includes(secondToLast, actionWords)) {
                plan = last;
                action = secondToLast;
            }
            else if (includes(last, actionWords)) {
                objectives = updateObjectives(objectives, secondToLast);
                action = last;
                //doesn't set plan
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
                }
                else {
                    objectives = updateObjectives(objectives, `${clean(secondToLast)}, ${clean(last)}`);
                    action = "focus on problem areas";
                    //doesn't set plan
                }
            }
            if (plan == "") {
                if (includes(objectives, shouldStretchWords)) {
                    plan = "stretch";
                }
                else {
                    plan = "N/A";
                }
            }
            parsedNotes.push({ name, subject, objectives, action, plan });
        }));
        yield Promise.all(promises);
        return parsedNotes;
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
    searches.map(search => {
        if (string.includes(search))
            doesInclude = true;
    });
    return doesInclude;
}
function showMenu(last, secondToLast) {
    return new Promise((resolve, reject) => {
        osascript.execute('display dialog "Which is the Action?" buttons {op1, op2, op3}\nset DlogResult to result\n return result', {
            op1: last,
            op2: `${secondToLast} ('${last}' as plan)`,
            op3: "focus on problem areas"
        }, function (err, result, raw) {
            if (err)
                return reject(err);
            let returnValue;
            returnValue = result["button returned"];
            resolve(returnValue);
        });
    });
}
module.exports = { parse };
