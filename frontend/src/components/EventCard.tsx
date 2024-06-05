import moment from "moment";
import { useEffect, useState } from "react";
import { FiCalendar } from "react-icons/fi";
import { GrGroup, GrLocation } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import CRM from "../../crm";
import config from "../../../config";
import { CiFileOff } from "react-icons/ci";
import { Spinner } from "flowbite-react";
import { IoBriefcaseOutline } from "react-icons/io5";

interface EventCardProps {
    event: any;
    className?: string;
}

export default function EventCard(props: EventCardProps) {
    const [loadingThumbnail, setLoadingThumbnail] = useState(true);
    const [loadingVolunteers, setLoadingVolunteers] = useState(true);
    const [thumbnail, setThumbnail] = useState<string>();
    const [volunteers, setVolunteers] = useState(0);

    useEffect(() => {
        (async () => {
            // Immmediately checking if there might be a thumbnail
            if (!props.event[`${config.EventCustomFieldSetName}.thumbnail`]) setLoadingThumbnail(false);
            // Getting the number of volunteers
            // const response = await CRM("ActivityContact", "get", {
            //     select: ["contact_id.email_primary.email"],
            //     where: [[`activity_id.${customParticipationDetailsSetName}.event_activity_id`, "=", props.event.id]]
            // });
            
            const response = await CRM("Activity", "get", {
                select: ['id',],
                where: [
                    ['participation_details.event_activity_id', '=', props.event.id],
                ],
            });
            setVolunteers(response.data.length);
            setLoadingVolunteers(false);

            // Getting thumbanil
            if (props.event[`${config.EventCustomFieldSetName}.thumbnail`]) {
                const response = await CRM("File", "get", {
                    select: ["uri"],
                    where: [["id", "=", props.event[`${config.EventCustomFieldSetName}.thumbnail`]]]
                });
                if (response.data[0]) setThumbnail(`${config.domain}/wp-content/uploads/civicrm/custom/${response.data[0].uri}`);
                setLoadingThumbnail(false);
            }
        })();
    }, []);

    const navigate = useNavigate();

    return <div className={props.className}>
        <div className="bg-white w-full shadow-md rounded-md p-4 transition-transform duration-300 transform hover:scale-105 flex flex-col justify-between">
            {props.event["status_id:name"] == "Cancelled" && <div className="bg-gray-500/50 w-full h-full absolute top-0 left-0 z-10 rounded-md" />}
            <div>
                {/* Image */}
                <div className={"mb-4 h-[160px] rounded-lg relative bg-gray-200 cursor-pointer"} onClick={() => navigate(`/events/${props.event.id}`)}>
                    {thumbnail && <img src={thumbnail} className="w-full h-full object-cover rounded-lg" />}
                    {!thumbnail && <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        {loadingThumbnail && <Spinner className="fill-secondary text-gray-300 w-[80px] h-[80px]" />}
                        {!loadingThumbnail && <CiFileOff className="text-[80px] text-gray-500" />}
                    </div>}
                </div>
                <h1 className="font-semibold mb-4">{props.event.subject}</h1>
                <div className="grid grid-rows-1 gap-y-2 text-black/70">
                    {/* Date and Time */}
                    <div className="flex items-center">
                        <FiCalendar className="text-secondary mr-3" />
                        <span className="text-sm font-semibold">
                            {moment(props.event.activity_date_time).format("D MMM YYYY, h:mma")}
                            <span className="text-sm mx-1">-</span>
                            {moment(new Date(props.event.activity_date_time).getTime() + (props.event.duration * 60 * 1000)).format("h:mma")}
                        </span>
                    </div>
                    {/* Location */}
                    <div className="gap-x-3 flex items-center">
                        <GrLocation className="text-secondary" />
                        <span className="text-sm font-semibold">{props.event.location}</span>
                    </div>
                    {/* Role */}
                    <div className="gap-x-3 flex items-center">
                        <IoBriefcaseOutline className="text-secondary" />
                        <span className="text-sm font-semibold">{props.event[`${config.EventCustomFieldSetName}.role:label`]}</span>
                    </div>
                    {/* People */}
                    <div className="gap-x-3 flex items-center">
                        <GrGroup className="text-secondary" />
                        <span className="text-sm font-semibold items-center">
                            {loadingVolunteers ? <Spinner className="w-[14px] h-[14px] fill-secondary mr-1" /> : volunteers}{props.event[`${config.EventCustomFieldSetName}.vacancy`] ? ` out of ${props.event[`${config.EventCustomFieldSetName}.vacancy`]} people` : " have joined"}
                        </span>
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