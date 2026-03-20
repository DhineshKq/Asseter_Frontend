import React, { useEffect } from 'react';


interface propsType {
    title: any;
}
export default function TabTitle({ title }: propsType) {
    useEffect(() => {

        document.title = title;
        return () => {
            document.title = 'Scan Pulse';
        };
    }, []);
    return (
        <div>
            {/* Your login page content goes here */}
        </div>
    );
};

