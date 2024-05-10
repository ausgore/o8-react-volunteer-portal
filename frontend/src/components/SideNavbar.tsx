import { Link } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import { CgProfile } from "react-icons/cg";
import O8Logo from "../assets/O8Logo.png";

export default function SideNavbar() {
    return <nav className="h-full w-56 fixed bg-white">
        <div className="h-full flex flex-col">
            {/* Responsible for the image */}
            <div className="p-4 flex items-center">
                <img src={O8Logo} />
            </div>
            {/* Navigation */}
            <div className="mt-6">
                <Link to="/">
                    <div className="hover:bg-gray-100 flex pl-12 py-2 mb-2 items-center">
                        <RxDashboard />
                        <p className="ml-4">Dashboard</p>
                    </div>
                </Link>
                <Link to="/profile">
                    <div className="hover:bg-gray-100 flex pl-12 py-2 mb-2 items-center">
                        <CgProfile />
                        <p className="ml-4">Profile</p>
                    </div>
                </Link>
            </div>
        </div>
    </nav>
}