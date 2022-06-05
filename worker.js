// requirements
import cryptoRandomString from 'crypto-random-string';
import TempMail from 'node-1smail';
import { readFileSync, appendFileSync } from 'fs';
import { execSync } from 'child_process';
const config = JSON.parse(readFileSync('./config.json'));

export default async (args) => {
	try {
		const [mail, type] = args;
		// create temp email
		const email = new TempMail();
		await email.createAddress(...mail);
		
		// register
		const randomString = Math.random().toString(36).substring(7);
		const name = `${config.prefix.name}${randomString}`;
		const password = cryptoRandomString({
			length: config.password.length,
			type: config.password.type
		});
		const output = execSync(`megatools reg --register --scripted -n "${name}" -e "${email.getAddress()}" -p "${password}"`, { encoding: 'utf-8', stdio: ["ignore", "pipe", "pipe"] });
		const verifyCommand = output.split("\n")[0].slice(0, -1);

		// verify
		const { messages } = await email.getMessages(10000);
		const { id } = messages[0];
		const message = await email.getOneMessage(id);
		const link = message.textBody.split("\n\n").find(part => part.includes("https")).trim();
		execSync(verifyCommand.replace("@LINK@", link), { stdio: "ignore" });
		appendFileSync(config.savePath, `${email.getAddress()}${type ? ";" : ":"}${password}\n`);
		return {
			'status': 'success',
			'message': `${email.getAddress()}${type ? ";" : ":"}${password}`
		};
	} catch (e) {
		return {
			'status': 'error',
			'message': e.message
		}
	};
};;