import { useNavigate, useParams } from "react-router-dom";
import Wrapper from "../components/Wrapper";
import { useEffect, useState } from "react";
import CRM from "../../crm";

// The specific volunteer event activity type name to get
const eventActivityTypeName = "volunteer event";
// The custom field set name that is used under the volunteer event activity type
const eventDetailsCustomFieldSetName = "event_details";

export default function Event() {
    const { id } = useParams();
    const [event, setEvent] = useState<any>();
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            const response = await CRM("Activity", "get", {
                select: [
                    "activity_type_id:name",
                    `${eventDetailsCustomFieldSetName}.*`,
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
            console.log(event);
            setEvent(event);
        })();
    }, [id]);
    
    return <Wrapper>
        {!event ? <>
            <h1>Loading Event...</h1>
        </> : <div>
            <p>Hello World</p>
        </div>}
    </Wrapper>
}