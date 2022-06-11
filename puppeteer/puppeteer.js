const puppeteer = require("puppeteer")
const dotenv = require("dotenv")
const fs = require("fs").promises

dotenv.config()
const url = "https://rivernorthmassage.quickernotes2.com/app/unfinished-notes"

async function main(func) {
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
		// await logIn(page)
	}

	func(page)
}

//MARK: Helper functions

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

module.exports = { main }
