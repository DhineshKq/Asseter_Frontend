export function parseCoordinates(coordinates: string | any) {
    // Split the coordinates into latitude and longitude parts
    const [latPart, longPart] = coordinates.split('/');
    // Extract latitude components
    const latDegrees = parseInt(latPart.substring(0, 2));
    const latMinutes = parseInt(latPart.substring(3, 5));
    const latDirection = latPart.substring(5);
    // Calculate latitude in decimal degrees
    const latitude = latDegrees + latMinutes / 60 * (latDirection === 'N' ? 1 : -1);

    // Extract longitude components 
    const longDegrees = parseInt(longPart.substring(0, 3));
    const longMinutes = parseInt(longPart.substring(4, 6));
    const longDirection = longPart.substring(6);

    // Calculate longitude in decimal degrees
    const longitude = longDegrees + longMinutes / 60 * (longDirection === 'E' ? 1 : -1);

    return { latitude, longitude };
}

export function parseCoordinatesalt(coordinates: string | any) {
    // Split the coordinates into latitude and longitude parts
    const [latPart, longPart] = coordinates.split('/');
    // Extract latitude components
    const [latDegrees, latMinutesWidthdirection] = latPart.split('-');
    const latMinutes = parseInt(latMinutesWidthdirection.substring(0, latMinutesWidthdirection.length - 1));
    const latDirection = latMinutesWidthdirection.substring(latMinutesWidthdirection.length - 1, latMinutesWidthdirection.length);

    // Extract longitude components
    const latitude = parseInt(latDegrees) + latMinutes / 60 * (latDirection === 'N' ? 1 : -1);
    const [longDegrees, longMinutesWidthdirection] = longPart.split('-');
    const longMinutes = parseInt(longMinutesWidthdirection.substring(0, longMinutesWidthdirection.length - 1));
    const longDirection = longMinutesWidthdirection.substring(longMinutesWidthdirection.length - 1, longMinutesWidthdirection.length);
   
    // Calculate longitude in decimal degrees
    const longitude = parseInt(longDegrees) + longMinutes / 60 * (longDirection === 'E' ? 1 : -1);

    return { latitude, longitude }; 
}
