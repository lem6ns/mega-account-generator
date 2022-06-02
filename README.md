# lemons' private mega gen
a private account generator for mega, powered by megatools.

# prerequisites
- [nodejs](https://nodejs.org/en/)
- [megatools](https://megatools.megous.com/) (will be downloaded automatically if not found)

# documentation
## user documentation
### usage
fill out the config, then do the following steps:
- `npm i`
- `node index.js`

### config
#### paths
- log: folder, will save logs to this folder
- accounts: 
	- path: file, will save accounts to this file.
	- separator: string, will use this string to separate accounts in the file. (*ex: email`;`password*)

#### account
- name: string, will use this string to name the account. if blank, will use a random name.
- password:
	- length: number, will use this number to generate the length of the password.
	- characters: string, will use these characters when generating password. (note, can break if you use special characters. the program will not escape them.)

#### email
- provider: array of strings, will use these providers for temp-mail. allowed values are [`mail`](https://mail.tm), [`1s`](https://1secmail.com), and [`devmail`](https://developermail.com).
- username: (this field will be ignored if the domain doesn't support it)
	- prefix: string, will use this string to prefix the email username.
	- suffix: string, will use this string to suffix the email username.
	- length: number, will use this number to generate the length of the email username.
	- characters: string, will use these characters when generating username. (note, special characters are **not** allowed.)
## developer documentation
### config
```json
{
	"paths": {
		"log": "log.txt",
		"accounts": {
			"path": "accounts.txt",
			"separator": ";"
		},
	},
	"account": {
		"name": "",
		"password": {
			"length": 16,
			"characters": "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
		}
	},
	"email": {
		"provider": [
			"mail",
			"1s",
			"devmail"
		],
		"username": {
			"prefix": "",
			"suffix": "",
			"length": 16,
			"characters": "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
		}
	}
}
```

### mail
#### functions
- generate:
	- object, must have an `email` field. can contain anything.
- getMessagesList:
```json
[{
	id: 1,
	subject: "Email",
}]
```
- getMessage:
```json
{
	id: 1,
	subject: "Email",
	body: "<h1>HTML body</h1>"
}
```

refer to provider.js.example for more info.