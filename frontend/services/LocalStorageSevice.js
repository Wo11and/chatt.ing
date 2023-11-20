export class localStorageSevice {
	key = undefined;

	constructor(key) {
		this.key = key;
	}

	get() {
		return localStorage.getItem(this.key);
	}

	set(value) {
		localStorage.setItem(this.key, value);
	}
}
