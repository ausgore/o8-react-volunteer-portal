import { PropsWithChildren } from "react";
import SideNavbar from "./SideNavbar";

export default function Wrapper(props: PropsWithChildren) {
    return <>
        <SideNavbar />
        <div className="ml-56">
            {props.children}
        </div>
    </>
}