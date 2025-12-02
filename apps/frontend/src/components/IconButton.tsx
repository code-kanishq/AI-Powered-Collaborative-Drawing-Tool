import { ReactNode } from "react";

export function IconButton({
    icon, onClick, activated
}: {
    icon: ReactNode,
    onClick: () => void,
    activated: boolean
}) {
    return <div className={`pointer rounded border p-2 bg-black hover:bg-gray-500 ${activated? "text-red-400" : "text-white"}`} 
    onClick={onClick}>
        {icon}
    </div>
}