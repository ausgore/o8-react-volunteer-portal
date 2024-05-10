import { ChangeEvent, Dispatch } from "react";
import { MdInfoOutline } from "react-icons/md";

interface DefaultCustomFieldProps {
    id: string;
    name: string;
    info?: string;
    profile: any;
    handleProfile?: (id: string, value: any) => null;
    handleChange?: (...args: any[]) => void;
    disabled?: boolean;
    className?: string;
}

export default function DefaultField(props: DefaultCustomFieldProps) {
    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (props.handleChange) return props.handleChange(e);
        else if (props.handleProfile) return props.handleProfile(props.id, e.target.value);
    }

    return <div className={props.className}>
        <div className="w-full md:w-[300px]">
            {/* Label */}
            <div className="flex flex-row justify-between items-center mb-1">
                <label htmlFor={props.id} className={`font-semibold ${props.disabled ? "opacity-40" : ""}`}>{props.name}</label>
                {/* If it's currently editable, and there is more information to display */}
                {props.disabled && props.info?.length != 0 && <>
                    <div className="relative">
                        <MdInfoOutline className="text-secondary" />
                    </div>
                </>}
            </div>
            {/* Insert inputs here, currently text input by default */}
            <div className="relative">
                <input type="text" id={props.id} className="w-full py-2 px-4 rounded-[5px] disabled:bg-white" value={props.disabled ? "" : props.profile[props.id]} placeholder={props.profile[props.id]} disabled={props.disabled} onChange={onChange} />
            </div>
        </div>
    </div>
}