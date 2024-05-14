import moment from "moment";
import { useEffect, useState } from "react";
import { FiCalendar } from "react-icons/fi";
import { GrGroup, GrLocation } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import CRM from "../../crm";

interface EventCardProps {
    event: any;
    className?: string;
}

export default function EventCard(props: EventCardProps) {
    const [volunteers, setVolunteers] = useState(0);
    useEffect(() => {
        (async () => {
            const response = await CRM("ActivityContact", "get", {
                select: ["id"],
                where: [["activity_id", "=", props.event.id]]
            });
            setVolunteers(response.data.length);
        })();
    }, []);

    const navigate = useNavigate();

    return <div className={props.className}>
        <div className="bg-white w-full shadow-md rounded-md p-4 transition-transform duration-300 transform hover:scale-105">
            <h1 className="font-semibold mb-4 text-lg">{props.event.subject}</h1>
            <div className="grid grid-rows-1 gap-y-2 text-black/70">
                {/* Date and Time */}
                <div className="gap-x-3 flex items-center">
                    <FiCalendar className="text-secondary" />
                    <span className="text-sm font-semibold">{moment(props.event.activity_date_time).format("D MMMM YYYY, h:mma")}</span>
                </div>
                {/* Location */}
                <div className="gap-x-3 flex items-center">
                    <GrLocation className="text-secondary" />
                    <span className="text-sm font-semibold">{props.event.location}</span>
                </div>
                {/* People */}
                <div className="gap-x-3 flex items-center">
                    <GrGroup className="text-secondary" />
                    <span className="text-sm font-semibold">{volunteers}{props.event["event_details.vacancy"] ? ` out of ${props.event["event_details.vacancy"]} people` : " have joined"}</span>
                </div>
                {/* Read More */}
                <button className="text-white bg-primary text-center w-full rounded-md text-sm mt-6 p-1" onClick={() => navigate(`/events/${props.event.id}`)}>
                    Read More
                </button>
            </div>
        </div>
    </div>
}