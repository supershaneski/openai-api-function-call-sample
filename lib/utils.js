export function getUniqueId() {
	return Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36);
}

export const isEven = (n) => {
    return n % 2 == 0;
}

export const trim_array = ( arr, max_length = 20 ) => {

    let new_arr = arr
    
    if(arr.length > max_length) {
        
        let cutoff = Math.ceil(arr.length - max_length)
        cutoff = isEven(cutoff) ? cutoff : cutoff + 1
        
        new_arr = arr.slice(cutoff)

    }

    return new_arr

}

export const wait = (delay) => {
    return new Promise((resolve) => setTimeout(resolve, delay))
}