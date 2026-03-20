
export function formatDateTimeAsSlash(date: any) {
    if (date && (new Date(date).toDateString() !== 'Invalid Date')) {
 
        let dateTime = new Date(date) 
        const day = String(dateTime.getDate()).padStart(2, '0');
        const month = String(dateTime.getMonth() + 1).padStart(2, '0');
        const year = dateTime.getFullYear();
        const hours = String(dateTime.getHours()).padStart(2, '0');
        const minutes = String(dateTime.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`; 
    } else {
        return "";
    }

}
export function formatDateAsSlash(date: any) {
    if (date || !(date instanceof Date)) {

        let dateTime = new Date(date)
        const day = String(dateTime.getDate()).padStart(2, '0');
        const month = String(dateTime.getMonth() + 1).padStart(2, '0');
        const year = dateTime.getFullYear();
        const hours = String(dateTime.getHours()).padStart(2, '0');
        const minutes = String(dateTime.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year}`;
    } else {
        return "";
    }

}

export function formatDateMonth(date: any) {
    if (date) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        let dateTime = new Date(date)
        const day = String(dateTime.getDate()).padStart(2, '0');
        const monthIndex = dateTime.getMonth();
        const month = months[monthIndex];
        const year = dateTime.getFullYear();

        return `${day} ${month} ${year}`;
    } else {
        return "";
    }
}

export function formatTime(date: any) {
    if (date) {

        let dateTime = new Date(date)
        const day = String(dateTime.getDate()).padStart(2, '0');
        const month = String(dateTime.getMonth() + 1).padStart(2, '0');
        const year = dateTime.getFullYear();
        const hours = String(dateTime.getHours()).padStart(2, '0');
        const minutes = String(dateTime.getMinutes()).padStart(2, '0');
        return ` ${hours}:${minutes}`;
    } else {
        return "";
    }

}

export function formatTimeWithAmOrPm(date: any) {
    if (date) {
        let dateTime = new Date(date);
        const day = String(dateTime.getDate()).padStart(2, '0');
        const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const month = monthNames[dateTime.getMonth()];
        const year = dateTime.getFullYear();
        let hours = dateTime.getHours();
        const ampm = hours >= 12 ? 'pm' : 'am'; // Determine if it's AM or PM
        hours = hours % 12;
        hours = hours ? hours : 12; // Convert hour 0 to 12
        const formattedHours = String(hours).padStart(2, '0');
        const minutes = String(dateTime.getMinutes()).padStart(2, '0');
        return `${formattedHours}:${minutes} ${ampm} on ${month} ${day}th`;
    } else {
        return "";
    }
}
export function formatOnlyTimeWithAmOrPm(createdAt: any): string {
    if (createdAt) {
        let dateTime = new Date(createdAt); // Convert to Date object if not already
        let hours = dateTime.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM'; // Determine if it's AM or PM
        hours = hours % 12;
        hours = hours ? hours : 12; // Convert hour 0 to 12
        const formattedHours = String(hours).padStart(2, '0');
        const minutes = String(dateTime.getMinutes()).padStart(2, '0');
        return `${formattedHours}:${minutes} ${ampm}`;
    } else {
        return "";
    }
}


// Function to check if a date is today
const isToday = (createdAt: any) => {
    if (!(createdAt instanceof Date)) {
        return false; // Return false if createdAt is not a valid Date object
    }
    const today = new Date();
    const messageDate = new Date(createdAt);
    return (
        today.getFullYear() === messageDate.getFullYear() &&
        today.getMonth() === messageDate.getMonth() &&
        today.getDate() === messageDate.getDate()
    );
};

// Function to format date
const formatDate = (createdAt: any) => {
    if (!(createdAt instanceof Date)) {
        return ""; // Return empty string if createdAt is not a valid Date object
    }
    const date = new Date(createdAt);
    // Format the date as needed, e.g., MM/DD/YYYY
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};


