export class localStorageSevice {
	key = undefined;
	value = undefined;

	constructor(key) {
		this.key = key;
		this.value = localStorage.getItem(key);
	}

	get() {
		return this.value;
	}

	set(value) {
		localStorage.setItem(this.key, value);
	}
}
