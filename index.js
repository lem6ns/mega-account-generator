// requirements
import fetch from 'node-fetch';
import chalk from 'chalk';
import ora from 'ora';
import figlet from 'figlet-promises';
import chalkAnimation from 'chalk-animation';
import inquirer from 'inquirer';
import Piscina from 'piscina';
import { readFileSync } from 'fs';
const config = JSON.parse(readFileSync('./config.json'));
const availableDomains = await fetch(`https://www.1secmail.com/api/v1/?action=getDomainList`).then(r => r.json());
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let domains = [];

// intro
const Figlet = new figlet();
await Figlet.loadFonts();
const animation = chalkAnimation.rainbow(`${await Figlet.write("MEGA Account Generator", "standard")}
by lemons
`, 100);
await sleep(1000);
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
		const spinner2 = ora(`Creating account ${chalk.bold(chalk.blueBright(1))} of ${answers.amount}\n\n`).start();
		let accounts = 0;
		for (let i = 0; i < answers.amount; i++) {
			while (pool.queueSize == config.concurrency) {
				await sleep(100);
			}
			pool.run([await getEmail(), answers.which])
				.then(() => {
					accounts++;
					if (accounts == answers.amount) return spinner2.succeed(`Created ${answers.amount == 1 ? "an account." : `all ${answers.amount} accounts.`}\n\n`);
					spinner2.text = `Creating account ${chalk.bold(chalk.blueBright(accounts))} of ${answers.amount}\n\n`;
				})
		};
	})