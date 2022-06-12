const fs = require("fs/promises")

const { parse } = require("./soap/parse-soap");

// startSession(main)

// indexClients()

const readline = require("readline").createInterface({
	input: process.stdin,
	output: process.stdout,
});

async function getInput() {
	return new Promise((resolve, reject) => {
		readline.question("", (input) => {
            resolve(input);
            
			readline.close();
		});
	});
}

getInput().then(async stuff => {
    const notes = await parse(stuff)
    console.log(notes)
    fs.writeFile("./output.json", JSON.stringify(notes, null, 2))
    
})