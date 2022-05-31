// requirements
import fetch from 'node-fetch';
import TempMail from 'node-1smail';
import cryptoRandomString from 'crypto-random-string';
import chalk from 'chalk';
import ora from 'ora';
import figlet from 'figlet-promises';
import chalkAnimation from 'chalk-animation';
import inquirer from 'inquirer';
import { readFileSync, appendFileSync } from 'fs';
import { execSync } from 'child_process';
const config = JSON.parse(readFileSync('./config.json'));
const availableDomains = await fetch(`https://www.1secmail.com/api/v1/?action=getDomainList`).then(r => r.json());
const domains = [];
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// intro
const Figlet = new figlet();
await Figlet.loadFonts();
const animation = chalkAnimation.rainbow(`${await Figlet.write("Snahp MEGA Generator", "standard")}
by lemons`);
await sleep(3000);
animation.stop();

// actual stuff
let spinner;
spinner = ora("Checking valid domains").start();
// check valid domains
for (const domain of config.domains) {
	if (!availableDomains.includes(domain) && domain != "random") {
		spinner.warn(`${domain} is not available.`);
		continue;
	};

	if (domain == "random") {
		domains.push(availableDomains[Math.floor(Math.random() * availableDomains.length)]);
		continue;
	} else {
		domains.push(domain);
		continue;
	}
};
spinner.succeed(`Valid domains found: ${domains.join(', ')}`);

// create temp mail
async function getEmail() {
	const randomString = Math.random().toString(36).substring(7);
	const mail = new TempMail();
	await mail.createAddress(`${config.prefix.email}-${randomString}`, domains[Math.floor(Math.random() * domains.length)]);
	return mail;
};

// register and verify mega account
async function register() {
	try {
		// register
		const randomString = Math.random().toString(36).substring(7);
		const name = `${config.prefix.name}${randomString}`;
		const email = await getEmail();
		const password = cryptoRandomString({
			length: config.password.length,
			type: config.password.type
		});
		const output = execSync(`megatools reg --register --scripted -n "${name}" -e "${email.getAddress()}" -p "${password}"`, { encoding: 'utf-8', stdio: ["ignore", "pipe", "pipe"] });
		const verifyCommand = output.split("\n")[0].slice(0, -1);
		
		// verify
		spinner = ora("Registering and Verifying MEGA Account").start();
		const { messages } = await email.getMessages(10000);
		const { id } = messages[0];
		const message = await email.getOneMessage(id);
		const link = message.textBody.split("\n\n").find(part => part.includes("https")).trim();
		execSync(verifyCommand.replace("@LINK@", link), { stdio: "ignore" });
		appendFileSync(config.savePath, `${email.getAddress()}:${password}\n`);
	} catch (e) {
		spinner.fail(`Account creation/verification failed. (${e})`);
	};
	spinner.succeed(`Account created & verified! Saved details to ${config.savePath}.`);
}

inquirer
	.prompt([{
		type: 'input',
		name: "amount",
		message: "How many accounts do you want to create?",
	}])
	.then(async answers => {
		const spinner = ora("Creating accounts\n\n").start();
		for (let i = 0; i < answers.amount; i++) {
			console.log(`${chalk.green("?")} Creating account ${chalk.bold(chalk.blueBright(i+1))} of ${answers.amount}`);
			await register();
		};
		spinner.succeed(`Accounts created!`);
	})