import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CRM from "../../crm";
import axios from "axios";

export default function Home() {
    const [volunteeredActivities, setVolunteeredActivities] = useState([]);
    useEffect(() => {
        const win = window as any;
        const email = win.email ?? "mjlee2605@gmail.com";

        (async function () {
            const response = await CRM("ActivityContact", "get", {
                select: [
                    "activity_id.duration",
                    "activity_id.subject",
                    "activity_id.activity_date_time",
                    "activity_id.status_id:name",
                    "contact_id",
                    "activity_id",
                    "contact_id.email_primary.email"
                ],
                where: [["contact_id.email_primary.email", "=", email]],
                order: [["id", "ASC"]],
                limit: 7,
            });
            setVolunteeredActivities(response.data);
            console.log(response.data);
        })();
    }, [])

    return <>
        <h1>Home Page</h1>
        <Link to="/profile">Go to profile page</Link>
        <h1>Volunteered Activities</h1>
        {volunteeredActivities.length > 0 && <pre>{JSON.stringify(volunteeredActivities, null, 2)}</pre>}
        <h1>Upcoming Activities</h1>
    </>
}