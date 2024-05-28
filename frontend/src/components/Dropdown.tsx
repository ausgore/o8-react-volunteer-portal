import { PropsWithChildren, useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io"

interface DropdownFilterProps extends PropsWithChildren {
    label: string;
    className?: string;
}
export default function Dropdown(props: DropdownFilterProps) {
    const [showDropdown, setDropdown] = useState(false);
    const handleDropdown = () => setDropdown(!showDropdown);

    const dropdownRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdown(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [dropdownRef]);


    return <>
        {/* Category */}
        <div className={`relative w-full lg:w-[200px] ${props.className}`} ref={dropdownRef}>
            {/* Button */}
            <button className="bg-secondary text-white flex justify-between px-4 py-2 rounded-md items-center w-full" onClick={handleDropdown}>
                <span>{props.label}</span>
                <IoIosArrowDown />
            </button>
            {/* Dropmenu */}
            {showDropdown && props.children}
        </div>
    </>
}