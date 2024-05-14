import { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import CRM from "../../crm";
import { FiCalendar } from "react-icons/fi";
import { GrLocation } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import EventCard from "../components/EventCard";

// The specific volunteer event activity type name to get
const eventActivityTypeName = "volunteer event";
// The custom field set name that is used under the volunteer event activity type
const eventDetailsCustomFieldSetName = "event_details";

export default function Events() {
    const navigate = useNavigate();
    const [events, setEvents] = useState<[] | null>();

    // Fetching all events via activity type name, and returning certain default fields and custom fields under specific set name
    useEffect(() => {
        (async () => {
            const response = await CRM("Activity", "get", {
                select: [
                    "activity_type_id:name",
                    `${eventDetailsCustomFieldSetName}.*`,
                    "subject",
                    "location",
                    "activity_date_time",
                    "duration"
                ],
                where: [["activity_type_id:name", "=", eventActivityTypeName]],
            });
            setEvents(response.data);
            console.log(response.data);
        })();
    }, []);

    return <Wrapper>
        {!events ? <>
            <h1 className="font-semibold text-lg">Loading events...</h1>
        </> : <div className="p-4 mb-12">
            <div className="max-w-[1200px]">
                {/* Event cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 px-0 md:px-6">
                    {events.map((event: any) => <EventCard className="flex justify-center" event={event} />)}
                </div>
            </div>
        </div>}
    </Wrapper>
}