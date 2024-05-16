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
const eventDetailsSetName = "event_details";
// Mandatory custom fields
const mandatoryCustomFieldNames = ["registration_start", "registration_end", "vacancy"];
// The custom field set name that is used under the participation activity type
const participationDetailsSetName = 'participation_details';
// The name of the activity type
const participationActivityType = 'Volunteer Event Participation';

export default function Event() {
    const { id } = useParams();
    const navigate = useNavigate();
    const email = (window as any).email as string ?? "casuarina@octopus8.com";

    const [event, setEvent] = useState<any>();
    const [volunteers, setVolunteers] = useState<any[]>([]);
    const [isVolunteering, setIsVolunteering] = useState(false);
    const [customFields, setCustomFields] = useState<{ [key: string]: CustomField }>();

    // Getting event details
    useEffect(() => {
        (async () => {
            let response = await CRM("Activity", "get", {
                select: [
                    "activity_type_id:name",
                    `${eventDetailsSetName}.*`,
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
                where: [["custom_group_id:name", "=", eventDetailsSetName]]
            });

            const customFields: any = {};
            for (const field of response.data) {
                if (!mandatoryCustomFieldNames.includes(field.name) && event[`${eventDetailsSetName}.${field.name}`]?.length > 0) {
                    customFields[`${eventDetailsSetName}.${field.name}`] = {
                        label: field.label,
                        name: field.name
                    }
                }
            }

            await updateVolunteers();
            setCustomFields(customFields);
            setEvent(event);
        })();
    }, [id]);

    // Getting volunteers for this event
    const updateVolunteers = async () => {
        const response = await CRM("ActivityContact", "get", {
            select: ["contact_id.email_primary.email"],
            where: [[`activity_id.${participationDetailsSetName}.event_activity_id`, "=", id]]
        });
        setVolunteers(response.data);
    }

    // Signing the volunteer up for the event
    const signUp = async () => {
        setIsVolunteering(true);
        // Getting the user's ID
        // TOOD: UseContext
        let response = await CRM("Contact", "get", {
            select: ["id"],
            where: [["email_primary.email", "=", email]]
        });
        const { id } = response.data[0];

        // Creating the Participation Activity
        response = await CRM("Activity", "create", {
            values: [
                ["activity_type_id:name", participationActivityType],
                ["source_contact_id", id],
                ["subject", event.subject],
                [`${participationDetailsSetName}.event_activity_id`, event.id]
            ]
        });

        await updateVolunteers();
        alert(`You have volunteered for ${event.subject}`);
        setIsVolunteering(false);
    }

    return <Wrapper>
        {!event ? <>
            <h1>Loading Event...</h1>
        </> : <div className="p-4">
            <h1>Event Details</h1>
            <div className="bg-white rounded-md mt-4 py-6 px-4 max-w-[1200px]">
                <div className="flex flex-row justify-between w-full gap-x-4">
                    <header className="flex-grow">
                        <h2 className="text-2xl text-secondary font-bold">{event.subject}</h2>
                        {event.details?.length > 0 && <div className="max-w-[800px] mt-6 text-black/70" dangerouslySetInnerHTML={{ __html: event.details }} />}
                    </header>
                    <div className="text-center max-w-[180px]">
                        {/* Sign up */}
                        {/* Can't sign up if they already volunteered OR if they are no longer within the registratino date */}
                        {volunteers.map(v => v["contact_id.email_primary.email"]).includes(email) || !(Date.now() >= new Date(event[`${eventDetailsSetName}.registration_start`]).getTime() && Date.now() <= new Date(event[`${eventDetailsSetName}.registration_end`]).getTime()) || (event[`${eventDetailsSetName}.vacancy`] && volunteers.length >= event[`${eventDetailsSetName}.vacancy`]) ? <>
                            {/* Disabled */}
                            <button className="text-white font-semibold bg-primary rounded-md w-full py-[6px] px-2 mb-2 cursor-not-allowed" disabled={true}>
                                {volunteers.map(v => v["contact_id.email_primary.email"]).includes(email) ? "Volunteered" : "Closed"}
                            </button>
                        </> : <>
                            {/* Enabled */}
                            <button onClick={signUp} className="text-white font-semibold bg-secondary rounded-md w-full py-[6px] px-2 mb-2 disabled:bg-primary" disabled={isVolunteering}>
                                {isVolunteering ? "Please wait..." : "Sign Up"}
                            </button>
                        </>}
                        {/* Registration deadline */}
                        <p className="text-xs">Registration: {moment(event[`${eventDetailsSetName}.registration_start`]).format("DD MMMM")} - {moment(event[`${eventDetailsSetName}.registration_end`]).format("DD MMMM")}</p>
                    </div>
                </div>
                {/* Informations */}
                <div className="grid grid-cols-2 lg:flex lg:flex-row gap-3 w-full mt-6 max-w-[800px]">
                    {/* People attending */}
                    <div className="bg-primary/30 min-w-[135px] text-secondary rounded-md py-2 px-3">
                        <h3 className="text-xs font-semibold mb-2">People Attending</h3>
                        <div className="flex flex-row items-center gap-x-3 font-bold text-lg">
                            <MdPeopleAlt size={22} />
                            <span>{volunteers.length}</span>
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
                            <span>
                                {moment(event.activity_date_time).format("D MMM YYYY, h:mm A")}
                                <span className="font-normal mx-4">-</span>
                                {moment(new Date(event.activity_date_time).getTime() + (event.duration * 60 * 1000)).format("D MMM YYYY, h:mm A")}
                            </span>
                        </div>
                    </div>
                </div>
                {/* Custom Fields */}
                <div className="mt-6">
                    {customFields && Object.values(customFields).map(field => {
                        return <div className="mb-6">
                            <h1 className="font-bold mb-2 text-black/70">{field.label}</h1>
                            <p className="text-black/70">{event[`${eventDetailsSetName}.${field.name}`]}</p>
                        </div>
                    })}
                </div>
            </div>
        </div>}
    </Wrapper>
}