import { useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

interface DefaultDropdownFieldProps {
    id: string;
    fields: any;
    /** The actual code to update a specific field by its id */
    handleFields?: (id: string, value: any) => void;
    disabled?: boolean;
    className?: string;
    placeholder: string;
    options: { label: string, value: any }[];
    label: string;
}

export default function DefaultDropdownField(props: DefaultDropdownFieldProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const toggleDropdown = () => setIsMenuOpen(!isMenuOpen);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsMenuOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [dropdownRef]);


    return <div className={props.className}>
        <div className="w-full md:w-[300px]">
            {/* Label */}
            <label htmlFor={props.id} className={`font-semibold ${props.disabled ? "opacity-40" : ""}`}>{props.label}</label>
            <div className="relative mt-1" ref={dropdownRef}>
                {/* Input */}
                <div className="relative flex items-center">
                    <input type="text" id={props.id} placeholder={props.disabled ? props.options.find(o => o.value == props.fields[props.id])?.label ?? "" : props.placeholder} className={`w-full py-2 px-4 rounded-t-[5px] disabled:bg-white caret-transparent outline-none select-none ${!isMenuOpen ? "rounded-b-[5px]" : ""} cursor-pointer`} onClick={toggleDropdown} value={props.disabled ? "" : props.options.find(o => o.value == props.fields[props.id])?.label} disabled={props.disabled} />
                    {!props.disabled && <IoIosArrowDown className="text-secondary absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />}
                </div>
                {/* Dropdown menu */}
                {!props.disabled && isMenuOpen && <div className="absolute bg-white w-full rounded-b-[5px] flex flex-col py-2" role="menu" aria-orientation="vertical">
                    {props.options.map((opt: { label: string, value: any }) => {
                        return <div className="inline-block">
                            <input type="radio" className="hidden" name={props.id} value={opt.value} id={`${props.id}-${opt.value}`} defaultChecked={props.fields[props.id] == opt.value} onChange={e => props.handleFields ? props.handleFields(props.id, e.target.value) : null} />
                            <label htmlFor={`${props.id}-${opt.value}`} className={`px-4 py-2 text-sm cursor-pointer block w-full ${props.fields[props.id] == opt.value ? "bg-gray-100" : "hover:bg-gray-100"}`}>{opt.label}</label>
                        </div>
                    })}
                </div>}
            </div>
        </div>
    </div>
}