import { Link } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import { CgProfile } from "react-icons/cg";
import O8Logo from "../assets/O8Logo.png";
import { PiSignOutBold } from "react-icons/pi";

export default function SideNavbar() {
    return <nav className="h-full w-56 fixed bg-white">
        <div className="h-full flex flex-col">
            {/* Responsible for the image */}
            <div className="p-4 flex items-center">
                <img src={O8Logo} />
            </div>
            {/* Navigation */}
            <div className="mt-6 flex flex-col justify-between h-full">
                <div>
                    <Link to="/">
                        <div className="hover:bg-primary/30 text-secondary hover:text-secondary/90 border-l-[5px] border-l-transparent hover:border-l-secondary/70 font-semibold flex pl-12 py-2 mb-2 items-center gap-x-4">
                            <RxDashboard />
                            <span>Dashboard</span>
                        </div>
                    </Link>
                    <Link to="/profile">
                        <div className="hover:bg-primary/30 text-secondary hover:text-secondary/90 border-l-[5px] border-l-transparent hover:border-l-secondary/70 font-semibold flex pl-12 py-2 mb-2 items-center gap-x-4">
                            <CgProfile />
                            <span>Profile</span>
                        </div>
                    </Link>
                </div>
                <Link to="/">
                    <div className="hover:bg-primary/30 text-secondary hover:text-secondary/90 border-l-[5px] border-l-transparent hover:border-l-secondary/70 font-semibold flex pl-12 py-2 mb-2 items-center gap-x-4">
                        <PiSignOutBold />
                        <span>Sign Out</span>
                    </div>
                </Link>
            </div>
        </div>
    </nav>
}