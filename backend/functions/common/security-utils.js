
const alphanum = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

/**
 * 
 * @returns {string} unique id
 */
export const generateId = () => {
    let id = (Date.now() * 1000).toString(16)
    for (let i = 0; i < 5; i++) {
        id += alphanum[Math.floor(Math.random() * alphanum.length)]
    }
    return id
}