export const shortAddr = (addr: string) => {
	return `${addr.substring(0, 6)}...${addr.substring(addr.length - 6)}`;
};

export const debounce = (callback: any, wait: number) => {
	let timeoutId: any = null;
	return (...args: any) => {
		window.clearTimeout(timeoutId);
		timeoutId = window.setTimeout(() => {
			callback.apply(null, args);
		}, wait);
	};
};