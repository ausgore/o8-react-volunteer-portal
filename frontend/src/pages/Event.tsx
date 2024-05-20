import { useNavigate, useParams } from "react-router-dom";
import Wrapper from "../components/Wrapper";
import { useEffect, useState } from "react";
import CRM from "../../crm";
import sanitizeHtml from "sanitize-html";
import { MdPeopleAlt } from "react-icons/md";
import { GrLocation } from "react-icons/gr";
import { FiCalendar } from "react-icons/fi";
import moment from "moment";
import { CustomField } from "../typings/types";

// The specific volunteer event activity type name to get
const eventActivityTypeName = "volunteer event";
// The custom field set name that is used under the volunteer event activity type
const customFieldSetName = "event_details";
// Mandatory custom fields
const mandatoryCustomFieldNames = ["registration_start", "registration_end", "vacancy"];

export default function Event() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState<any>();
    const [customFields, setCustomFields] = useState<{ [key: string]: CustomField }>();

    useEffect(() => {
        (async () => {
            let response = await CRM("Activity", "get", {
                select: [
                    "activity_type_id:name",
                    `${customFieldSetName}.*`,
                    "subject",
                    "details",
                    "location",
                    "activity_date_time",
                    "duration"
                ],
                where: [
                    ["id", "=", id],
                    ["activity_type_id:name", "=", eventActivityTypeName]
                ]
            });

            const [event] = response.data;
            if (!event) return navigate("/events");
            event.details = sanitizeHtml(event.details)

            // Custom fields to be set in state
            response = await CRM("CustomField", "get", {
                select: ["name", "label"],
                where: [["custom_group_id:name", "=", customFieldSetName]]
            });

            const customFields: any = {};
            for (const field of response.data) {
                if (!mandatoryCustomFieldNames.includes(field.name) && event[`${customFieldSetName}.${field.name}`]?.length > 0) {
                    customFields[`${customFieldSetName}.${field.name}`] = {
                        label: field.label,
                        name: field.name
                    }
                }
            }

            setCustomFields(customFields);
            setEvent(event);
        })();
    }, [id]);

    const [volunteers, setVolunteers] = useState(0);
    useEffect(() => {
        (async () => {
            const response = await CRM("ActivityContact", "get", {
                select: ["id"],
                where: [["activity_id", "=", id]]
            });
            setVolunteers(response.data.length);
        })();
    }, [id]);

    return <Wrapper>
        {!event ? <>
            <h1>Loading Event...</h1>
        </> : <div className="p-4">
            <h1>Event Details</h1>
            <div className="bg-white rounded-md mt-4 py-6 px-4 max-w-[1200px]">
                <div className="flex flex-row justify-between w-full gap-x-4">
                    <div>
                        {/* Title */}
                        <h2 className="text-2xl text-secondary font-bold">{event.subject}</h2>
                        {/* Details */}
                        {event.details?.length > 0 && <div className="max-w-[650px] my-6 text-black/70" dangerouslySetInnerHTML={{ __html: event.details }} />}
                        {/* Informations */}
                        <div className="grid grid-cols-2 lg:flex lg:flex-row gap-3 w-full">
                            {/* People attending */}
                            <div className="bg-primary/30 min-w-[135px] text-secondary rounded-md py-2 px-3">
                                <h3 className="text-xs font-semibold mb-2">People Attending</h3>
                                <div className="flex flex-row items-center gap-x-3 font-bold text-lg">
                                    <MdPeopleAlt size={22} />
                                    <span>{volunteers}</span>
                                </div>
                            </div>
                            {/* Location */}
                            <div className="bg-primary/30 text-secondary rounded-md py-2 px-3">
                                <h3 className="text-xs font-semibold mb-2">Location</h3>
                                <div className="flex flex-row items-center gap-x-3 font-bold text-sm">
                                    <GrLocation size={22} />
                                    <span>{event.location}</span>
                                </div>
                            </div>
                            {/* Duration */}
                            <div className="bg-primary/30 text-secondary rounded-md py-2 px-3 flex-grow col-span-2">
                                <h3 className="text-xs font-semibold mb-2">Event Duration</h3>
                                <div className="flex flex-row items-center gap-x-3 font-bold text-sm">
                                    <FiCalendar size={22} />
                                    <span>{moment(event.activity_date_time).format("D MMMM YYYY, h:mm A")} <span className="font-normal">-</span> {moment(new Date(event.activity_date_time).getTime() + (event.duration * 60 * 1000)).format("D MMMM YYYY, h:mm A")}</span>
                                </div>
                            </div>
                        </div>
                        {/* Custom Fields */}
                        <div className="mt-6">
                            {customFields && Object.values(customFields).map(field => {
                                return <div className="mb-6">
                                    <h1 className="font-bold mb-2 text-black/70">{field.label}</h1>
                                    <p className="text-black/70">{event[`${customFieldSetName}.${field.name}`]}</p>
                                </div>
                            })}
                        </div>
                    </div>
                    <div className="text-center">
                        {/* Sign up */}
                        <button className="text-white font-semibold bg-secondary rounded-md w-full py-[6px] px-2 mb-2">Sign Up</button>
                        {/* Registration deadline */}
                        <p className="text-xs">Registration: 20 Apr - 29 Apr</p>
                    </div>
                </div>
            </div>
        </div>}
    </Wrapper>
}