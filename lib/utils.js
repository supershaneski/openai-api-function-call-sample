export function getUniqueId() {
	return Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36);
}

export const isEven = (n) => {
    return n % 2 == 0;
}
