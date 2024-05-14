import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CRM from "../../crm";
import axios from "axios";

// Define the type for volunteered activity details
interface VolunteerActivityDetails {
    Title: string;
    Tagline: string;
    Description: string;
    Responsibilities: string;
    Requirements: string;
    Location: string;
    Event_Start_Date: string;
    Event_End_Date: string;
    Registration_Start_Date: string;
    Registration_End_Date: string;
    Max_Volunteers: string;
}

export default function Home() {
    const [volunteeredActivities, setVolunteeredActivities] = useState<any[]>([]);
    const [volunteeredActivitiesDetails, setVolunteeredActivitiesDetails] = useState<VolunteerActivityDetails[]>([]);
    const [hoursVolunteered, setHoursVolunteered] = useState<number>(0);
    const [numEventsParticipated, setNumEventsParticipated] = useState<number>(0);

    useEffect(() => {
        const win = window as any;
        const email = win.email ?? "mjlee2605@gmail.com";

        (async function () {
            const response1 = await CRM('Activity', 'get', {
                select: [
                    'Volunteer_Event_Participation.Event_Activity_ID',
                    'Volunteer_Event_Participation.Status:label',
                    'Volunteer_Event_Participation.Recorded_Start_Date',
                    'Volunteer_Event_Participation.Recorded_End_Date',
                    'Volunteer_Event_Participation.Hours_Volunteered',
                    'activity_contact.contact_id.email_primary.email',
                ],
                join: [
                    ['ActivityContact AS activity_contact', 'LEFT', ['id', '=', 'activity_contact.activity_id']],
                ],
                where: [
                    ['activity_contact.contact_id.email_primary.email', '=', email],
                    ['activity_type_id:label', '=', 'Volunteering Event Sign-Up'],
                ],
                order: [
                    ["id", "ASC"]
                ],
                limit: 0,
            });
            console.log(response1.data);

            setVolunteeredActivities(response1.data);

            let hoursVolunteeredCalc = 0;
            let numEventsParticipatedCalc = 0;

            // Create an array to hold promises for fetching details
            const detailPromises = response1.data.map(async (activity: any) => {
                const response2 = await CRM('Activity', 'get', {
                    select: [
                        'Volunteer_Event_Details.Title',
                        'Volunteer_Event_Details.Tagline',
                        'Volunteer_Event_Details.Description',
                        'Volunteer_Event_Details.Responsibilities',
                        'Volunteer_Event_Details.Requirements',
                        'Volunteer_Event_Details.Location',
                        'Volunteer_Event_Details.Event_Start_Date',
                        'Volunteer_Event_Details.Event_End_Date',
                        'Volunteer_Event_Details.Registration_Start_Date',
                        'Volunteer_Event_Details.Registration_End_Date',
                        'Volunteer_Event_Details.Max_Volunteers',
                    ],
                    where: [
                        ['id', '=', activity['Volunteer_Event_Participation.Event_Activity_ID']]
                    ],
                    order: [
                        ["id", "ASC"]
                    ],
                    limit: 0,
                });
                console.log(response2.data);

                return response2.data;
            });

            // Wait for all detail promises to resolve
            const allDetails = await Promise.all(detailPromises);

            const flattenedAllDetails = allDetails.flatMap(innerArray => innerArray)

            setVolunteeredActivitiesDetails(flattenedAllDetails);

            // Calculate hours and events participated
            response1.data.forEach((activity: any) => {
                hoursVolunteeredCalc += activity['Volunteer_Event_Participation.Hours_Volunteered'];

                if (activity['Volunteer_Event_Participation.Status:label'] === 'Completed') {
                    numEventsParticipatedCalc++;
                }
            });

            setHoursVolunteered(hoursVolunteeredCalc);
            setNumEventsParticipated(numEventsParticipatedCalc);
        })();
    }, [])

    return <>
        <h1>Home Page</h1>
        <Link to="/profile">Go to profile page</Link>
        <h1>Volunteered Activities</h1>
        Number of Hours Volunteered: {hoursVolunteered}<br />
        Volunteering Events Participated: {numEventsParticipated}<br />
        Volunteering Status
        {volunteeredActivities.length > 0 && <pre>{JSON.stringify(volunteeredActivities, null, 2)}</pre>}<br />
        Volunteering Event
        {volunteeredActivitiesDetails.length > 0 && <pre>{JSON.stringify(volunteeredActivitiesDetails, null, 2)}</pre>}
        <h1>Upcoming Activities</h1>
    </>
}