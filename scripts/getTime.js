export default function getCurrentTime() {
    const date = new Date();
    const hour = date.getHours();
    const min = date.getMinutes();
    return {
        hour,
        min,
    }
}