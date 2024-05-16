import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CRM from "../../crm";
import Wrapper from "../components/Wrapper";
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

const custom_group_participation_details = 'participation_details';
const activity_type_event_participation = 'Volunteer Event Participation';

const custom_group_event_details = 'event_details';

export default function Home() {
    const [volunteeredActivities, setVolunteeredActivities] = useState<any[]>([]);
    const [volunteeredActivitiesDetails, setVolunteeredActivitiesDetails] = useState<VolunteerActivityDetails[]>([]);
    const [hoursVolunteered, setHoursVolunteered] = useState<number>(0);
    const [numEventsParticipated, setNumEventsParticipated] = useState<number>(0);

    useEffect(() => {
        const win = window as any;
        const email = win.email ?? "casuarina@octopus8.com";

        (async function () {
            const response1 = await CRM('Activity', 'get', {
                select: [
                    'status_id:name',
                    // custom_group_participation_details + '.*',
                    custom_group_participation_details + '.recorded_start',
                    custom_group_participation_details + '.recorded_end',
                    custom_group_participation_details + '.event_activity_id',
                ],
                join: [
                    ['ActivityContact AS activity_contact', 'LEFT', ['id', '=', 'activity_contact.activity_id']],
                ],
                where: [
                    ['activity_contact.contact_id.email_primary.email', '=', email],
                    ['activity_type_id:label', '=', activity_type_event_participation],
                ],
                order: [
                    ['id', 'ASC']
                ],
                limit: 0,
            });
            console.log(response1.data);

            setVolunteeredActivities(response1.data);

            // Create an array to hold promises for fetching details
            const detailPromises = response1.data.map(async (activity: any) => {
                const response2 = await CRM('Activity', 'get', {
                    select: [
                        'subject',
                        // 'details',
                        'location',
                        'activity_date_time',
                        // 'duration',
                        // custom_group_event_details + '.*',
                    ],
                    where: [
                        ['id', '=', activity[custom_group_participation_details + '.event_activity_id']]
                    ],
                    order: [
                        ["id", "ASC"]
                    ],
                    limit: 0,
                });
                console.log(response2.data[0]);

                return { status: activity, details: response2.data[0] };
                // return response2.data;
            });

            // Wait for all detail promises to resolve
            const allDetails = await Promise.all(detailPromises);
            console.log(allDetails);
            // const flattenedAllDetails = allDetails.flatMap(innerArray => innerArray);


            let hoursVolunteeredCalc = 0;
            let numEventsParticipatedCalc = 0;

            // Calculate hours and events participated
            allDetails.forEach(({ status, details }: any) => {
                if (status['status_id:name'] === 'Completed') {
                    let start = new Date(status[custom_group_participation_details + '.recorded_start']);
                    let end = new Date(status[custom_group_participation_details + '.recorded_end']);
                    let timeDifference = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                    hoursVolunteeredCalc += parseFloat(timeDifference.toFixed(1));

                    numEventsParticipatedCalc++;
                }
            });

            setVolunteeredActivitiesDetails(allDetails);
            setHoursVolunteered(hoursVolunteeredCalc);
            setNumEventsParticipated(numEventsParticipatedCalc);
        })();
    }, [])

    return <Wrapper>
        {/* <h1>Home Page</h1>
        <Link to="/profile">Go to profile page</Link> */}
        <h1><b>Volunteered Activities</b></h1>
        Number of Hours Volunteered: {hoursVolunteered}<br />
        Volunteering Events Participated: {numEventsParticipated}<br /><br />
        {volunteeredActivitiesDetails.map(({ status, details }: any, index) => (
            <div key={index}>
                <h2>Event Name: {details['subject']}</h2>
                <h3>Date, Time: {details['activity_date_time']}</h3>
                <h3>Status: {status['status_id:name']}</h3>
                <h3>Location: {details['location']}</h3>
                <br/>
            </div>
        ))}
    </Wrapper>
}