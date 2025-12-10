// The debounce function
export const debounce = (callback, delay) => {
    let timeoutId;
    return (...args) => {
        // Clear the previous timeout
        clearTimeout(timeoutId);
        // Set a new timeout
        timeoutId = setTimeout(() => {
            callback.apply(null, args);
        }, delay);
    };
};