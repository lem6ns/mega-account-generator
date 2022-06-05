// requirements
import fetch from 'node-fetch';
import chalk from 'chalk';
import ora from 'ora';
import figlet from 'figlet-promises';
import chalkAnimation from 'chalk-animation';
import inquirer from 'inquirer';
import { readFileSync } from 'fs';
import Piscina from 'piscina';
const config = JSON.parse(readFileSync('./config.json'));
const availableDomains = await fetch(`https://www.1secmail.com/api/v1/?action=getDomainList`).then(r => r.json());
let domains = [];
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// intro
const Figlet = new figlet();
await Figlet.loadFonts();
const animation = chalkAnimation.rainbow(`${await Figlet.write("Snahp MEGA Generator", "standard")}
by lemons
`, 1);
await sleep(1500);
animation.stop();

// get domains
let spinner;
spinner = ora("Checking valid domains").start();
for (const domain of config.domains) {
	if (!availableDomains.includes(domain) && domain != "random") {
		spinner.warn(`${domain} is not available.`);
		continue;
	};

	if (domain == "random") {
		domains = availableDomains;
		continue;
	} else {
		domains.push(domain);
		continue;
	}
};
spinner.succeed(`Valid domains found: ${domains.join(', ')}`);

// create address and pick a random domain
async function getEmail() {
	const randomString = Math.random().toString(36).substring(7);
	return [`${config.prefix.email}-${randomString}`, domains[Math.floor(Math.random() * domains.length)]];
};

// prompt user
inquirer
	.prompt([{
		type: 'input',
		name: "amount",
		message: "How many accounts do you want to create?",
		validate(value) {
			if (isNaN(value)) {
				return "Please enter a number.";
			};

			return true;
		},
		default: 1
	}, {
		type: "confirm",
		name: "which",
		message: "Are you using Mimccann's MegaKeep?",
		default: false
	}])
	.then(async answers => {
		const pool = new Piscina({
			filename: './worker.js',
			maxQueue: config.concurrency,
		});
		const accountArray = [];
		const spinner2 = ora(`Creating account(s).\n\n`).start();
		for (let i = 0; i < answers.amount; i++) {
			while (pool.maxQueue == answers.amount) await sleep(100);
			accountArray.push(pool.run([await getEmail(), answers.which]));
		};

		spinner2.succeed(`Account(s) created.`);
	})