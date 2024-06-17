export const wait = async (seconds: number): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        const sec = seconds * 1000;
        setTimeout(() => resolve(true), sec)
    })
}