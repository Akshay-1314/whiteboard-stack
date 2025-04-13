import React from 'react'

function Loading({children}) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
            <p className="text-white text-lg animate-pulse">{children}</p>
        </div>
    );
}

export default Loading;