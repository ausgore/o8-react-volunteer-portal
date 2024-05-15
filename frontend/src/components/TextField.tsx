import { ChangeEvent, useState } from "react";
import { MdInfoOutline } from "react-icons/md";

interface TextFieldProps {
    id: string;
    label: string;
    /** The info message if there's any */
    info?: string;
    /** If this is not provided, it will automatically used fieldsObj[id] */
    value?: string;
    /** The fields object to use provided there's also an id, otherwise, use value parameter */
    fields?: any;
    /** The actual code to update a specific field by its id */
    handleFields?: (id: string, value: any) => void;
    /** If there is no handleFields parameter, use handleChange to handle when onChange event is listened */
    handleChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    showInfo?: boolean;
    className?: string;
}

export default function TextField(props: TextFieldProps) {
    const [isHovering, setIsHovering] = useState(false);
    const handleHovering = () => setIsHovering(!isHovering);
    

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (props.handleChange) return props.handleChange(e);
        else if (props.handleFields) return props.handleFields(props.id, e.target.value);
    }

    return <div className={props.className}>
        <div className="w-full md:w-[300px]">
            {/* Label */}
            <div className="flex flex-row justify-between items-center mb-1">
                <label htmlFor={props.id} className={`font-semibold ${props.disabled ? "opacity-40" : ""}`}>{props.label}</label>
                {/* If it's currently editable, and there is more information to display */}
                {props.disabled && props.showInfo && props.info?.length != 0 && <>
                    <div className="relative" onMouseEnter={handleHovering} onMouseLeave={handleHovering}>
                        <MdInfoOutline className="text-secondary cursor-pointer" />
                        {/* Information block */}
                        {isHovering && <div className="absolute w-[240px] top-5 right-0 bg-white p-1 rounded-lg shadow-md text-center text-[12px] z-[1]">
                            <p className="text-secondary font-semibold text-[12px]">{props.info}</p>
                        </div>}
                    </div>
                </>}
            </div>  
            {/* Text Input */}
            <div className="relative">
                <input type="text" id={props.id} className="w-full py-2 px-4 rounded-[5px] disabled:bg-white disabled:cursor-not-allowed outline-none" value={props.disabled ? "" : props.value != undefined ? props.value : props.fields[props.id]} placeholder={props.value != undefined ? props.value : props.fields[props.id]} disabled={props.disabled} onChange={onChange} />
            </div>
        </div>
    </div>
}