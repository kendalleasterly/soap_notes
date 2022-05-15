const puppeteer = require("puppeteer")
const dotenv = require("dotenv")
const fs = require("fs").promises

dotenv.config()
const url = "https://rivernorthmassage.quickernotes2.com/app/unfinished-notes"

async function test() {
	const browser = await puppeteer.launch({
		headless: false,
		defaultViewport: null,
	})

	const page = await browser.newPage()
	
	await writeCookies(page)
	await page.goto(url, {
		waitUntil: "networkidle2",
	})

	// const cookies = await page.cookies()
	const cookiesString = await fs.readFile("./cookies.json")
	const cookies = JSON.parse(cookiesString)

	if (new Date().getTime() / 1000 >= cookies[1].expires) {
        await logIn(page)
	}

	const clients = await setUnfinishedClients(page, 8, 10)
	console.log(clients)

	const oldClientsString = await fs.readFile("./unfinishedClients.json")
	const oldClients = JSON.parse(oldClientsString)


	fs.writeFile("./unfinishedClients.json", JSON.stringify(clients.concat(oldClients), null, 2))

	
}

//MARK: Helper functions

async function setUnfinishedClients(page, i, stop) {
	await page.goto(url + "?page=" + (i))
	let clients = await getClients(page)
	console.log(clients[0])

	if (i == stop) {
		return clients
	} else {
		const clientsOnPages = await setUnfinishedClients(page, i + 1, stop)

		clients = clients.concat(clientsOnPages)

		return clients
	}
	
	//she can create the note on the day of the client or any day after the client was seen
}

async function getClients(page) {

	let clients = []

    const clientsElements = await page.$$("li")

    const promises = clientsElements.map(async (clientElement) => {
		const name = await clientElement.$eval("div.text-sm > a", (element) => {
			let text = element.textContent
			return text.replace(/$\s+/gm, "")
		})

		const date = await clientElement.$eval(
			"div.mt-2.text-gray-500",
			(element) => {
				let text = element.textContent
				text = text.replace(/$\s+/gm, "")
				let date = text.split(",")[0]
                let dateObj = new Date(date)
                dateObj.setFullYear(new Date().getFullYear())
				return dateObj.toISOString().split("T")[0]
			}
		)

		const link = await clientElement.$eval("a.text-gray-800", (element) => element.getAttribute("href"))
		clients.push({name, date, link})
	})

	await Promise.all(promises)

	return clients

}

async function logIn(page) {

	console.log("logging in")

	await page.type("[type=text]", "gabbyeasterly")
	await page.type("[type=password]", process.env.ACCOUNT_PASSWORD)

	await page.click("[type=submit]")
	await page.waitForSelector("ul")
	console.log("got selector, saving cookies")
	await saveCookies(page)

	
}

async function saveCookies(page) {
	const cookies = await page.cookies()
	console.log(cookies)

	await fs.writeFile("./cookies.json", JSON.stringify(cookies, null, 2))
}

async function writeCookies(page) {
	const cookiesString = await fs.readFile("./cookies.json")
	const cookies = JSON.parse(cookiesString)

	await page.setCookie(...cookies)
}

module.exports = { test }
