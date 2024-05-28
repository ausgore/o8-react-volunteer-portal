import { AiOutlinePhone, AiOutlineMail } from "react-icons/ai";
import { FiEdit } from "react-icons/fi";
import { Link } from "react-router-dom"; // Import Link from react-router-dom

interface DashboardHeaderProps {
    name: string;
    email: string;
    phone: string;
    imageUrl: string;
}

export default function DashboardHeader(/*{ name, email, phone, imageUrl }*/props: DashboardHeaderProps) {
    return (
        <div
            className="relative p-6 md:p-10 shadow-md flex flex-col md:flex-row justify-between items-center rounded-lg w-full"
            style={{ backgroundColor: "rgba(169, 183, 224, 0.31)" }}
        >
            <div className="flex flex-col md:flex-row items-center w-full">
                <div className="mb-4 md:mb-0">
                    <img
                        src={props.imageUrl || "https://th.bing.com/th/id/R.d995d728def36a40a261e36bab9f9bfe?rik=LDZuJgLPtIzgZw&riu=http%3a%2f%2fromanroadtrust.co.uk%2fwp-content%2fuploads%2f2018%2f01%2fprofile-icon-png-898.png&ehk=WfpwpBbTdOcQK51xzwmVamkbadbdbzi2tYDYnK8V2hM%3d&risl=&pid=ImgRaw&r=0"}
                        alt="Profile"
                        className="w-24 h-24 md:w-[100px] md:h-[100px] rounded-full bg-white overflow-hidden"
                    />
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center w-full">
                    <h1 className="font-semibold text-2xl md:text-5xl mb-2 md:mb-0 md:ml-10">
                        {props.name}
                    </h1>
                    <div className="flex flex-col items-start md:ml-auto md:mr-20 mt-2 md:mt-0">
                        <p className="text-xl md:text-2xl flex items-center mb-2 font-semibold">
                            <AiOutlineMail className="text-2xl md:text-3xl mr-2 text-[#5A71B4] hover:text-[#495b92] cursor-pointer" />
                            {props.email}
                        </p>
                        <p className="text-xl md:text-2xl flex items-center font-semibold">
                            <AiOutlinePhone className="text-2xl md:text-3xl mr-2 text-[#5A71B4] hover:text-[#495b92] cursor-pointer" />
                            {props.phone}
                        </p>
                    </div>
                </div>
            </div>
            <div className="absolute top-5 right-5">
                <Link to="/profile">
                    <button className="text-[#5A71B4] hover:text-[#495b92]">
                        <FiEdit className="w-6 h-6 md:w-8 md:h-8" />
                    </button>
                </Link>
            </div>
        </div>
    );
}
