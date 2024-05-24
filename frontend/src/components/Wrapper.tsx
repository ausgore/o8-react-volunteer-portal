import { PropsWithChildren } from "react";
import Navbar from "./Navbar";

export default function Wrapper(props: PropsWithChildren) {
    return <>
        <Navbar className="w-52 hidden sm:flex" />
        <div className="sm:ml-52">
            {props.children}
        </div>
    </>
}