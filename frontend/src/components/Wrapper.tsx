import { PropsWithChildren } from "react";
import Navbar from "./Navbar";

export default function Wrapper(props: PropsWithChildren) {
    return <>
        <Navbar />
        <div className="ml-52">
            {props.children}
        </div>
    </>
}