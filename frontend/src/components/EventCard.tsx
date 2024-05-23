import moment from "moment";
import { useEffect, useState } from "react";
import { FiCalendar } from "react-icons/fi";
import { GrGroup, GrLocation } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import CRM from "../../crm";
import config from "../../../config";
import { CiFileOff } from "react-icons/ci";

interface EventCardProps {
    event: any;
    className?: string;
}

const customParticipationDetailsSetName = 'participation_details';

export default function EventCard(props: EventCardProps) {
    const [thumbnail, setThumbnail] = useState<string>();
    const [volunteers, setVolunteers] = useState(0);
    useEffect(() => {
        (async () => {
            const response = await CRM("ACtivityContact", "get", {
                select: ["contact_id.email_primary.email"],
                where: [[`activity_id.${customParticipationDetailsSetName}.event_activity_id`, "=", props.event.id]]
            });
            setVolunteers(response.data.length);

            // Getting thumbanil
            if (props.event[`${config.EventCustomFieldSetName}.thumbnail`]) {
                const response = await CRM("File", "get", {
                    select: ["uri"],
                    where: [["id", "=", props.event[`${config.EventCustomFieldSetName}.thumbnail`]]]
                });
                if (response.data[0]) setThumbnail(`${config.domain}/wp-content/uploads/civicrm/custom/${response.data[0].uri}`);
            }
        })();
    }, []);

    const navigate = useNavigate();

    return <div className={props.className}>
        <div className="bg-white w-full shadow-md rounded-md p-4 transition-transform duration-300 transform hover:scale-105 flex flex-col justify-between">
            <div>
                {/* Image */}
                <div className={"mb-4 h-[160px] rounded-lg relative bg-gray-200 cursor-pointer"} onClick={() => navigate(`/events/${props.event.id}`)}>
                    {thumbnail && <img src={thumbnail} className="w-full h-full object-cover rounded-lg" />}
                    {!thumbnail && <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <CiFileOff className="text-[80px] text-gray-500" />
                    </div>}
                </div>
                <h1 className="font-semibold mb-4">{props.event.subject}</h1>
                <div className="grid grid-rows-1 gap-y-2 text-black/70">
                    {/* Date and Time */}
                    <div className="gap-x-3 flex items-center">
                        <FiCalendar className="text-secondary" />
                        <span className="text-sm font-semibold">{moment(props.event.activity_date_time).format("D MMM YYYY, h:mma")}</span>
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
                </div>
            </div>
            {/* Read More */}
            <button className="text-white bg-secondary text-center w-full rounded-md text-sm mt-6 py-2" onClick={() => navigate(`/events/${props.event.id}`)}>
                Read More
            </button>
        </div>
    </div>
}