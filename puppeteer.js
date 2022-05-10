const puppeteer = require("puppeteer")
const dotenv = require("dotenv")
const fs = require("fs").promises

dotenv.config()

async function test() {
	const browser = await puppeteer.launch({
		headless: false,
		defaultViewport: null,
	})

	const page = await browser.newPage()
	const url = "https://rivernorthmassage.quickernotes2.com/app/unfinished-notes"
	await writeCookies(page)
	await page.goto(url, {
		waitUntil: "networkidle2",
	})

	// const cookies = await page.cookies()
	const cookiesString = await fs.readFile("./cookies.json")
	const cookies = JSON.parse(cookiesString)

	console.log(new Date().getTime() / 1000, cookies[1].expires)

	if (new Date().getTime() / 1000 >= cookies[1].expires) {
        await logIn(page)
	}

    const clients = await getClients(page)

    console.log(clients)

	
}

//MARK: Helper functions

async function getClients(page) {

    const clientsElements = await page.$$("li")

    let clients = []

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
	setTimeout(() => saveCookies(page), 10 * 1000)
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
