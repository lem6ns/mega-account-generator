import cryptoRandomString from 'crypto-random-string';

const create = (length, characters, prefix, suffix) => {
	const randomString = cryptoRandomString({
		length,
		characters,
	});
	const usernameArray = [
		prefix,
		randomString,
		suffix,
	];

	const username = usernameArray.join('');
	return username;
};

export default create;