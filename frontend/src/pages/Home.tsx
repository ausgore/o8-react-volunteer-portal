import { useEffect, useState } from "react";
import CRM from "../../crm";
import Wrapper from "../components/Wrapper";
import config from "../config";

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

// Function to fetch event details
async function fetchEventDetails(eventId: string) {
    const eventDetail = await CRM('Activity', 'get', {
        select: [
            'subject',
            'location',
            'activity_date_time',
            'duration',
        ],
        where: [
            ['id', '=', eventId]
        ],
    });
    return eventDetail.data[0];
}

// Function to fetch event attendance
async function fetchEventAttendance(eventId: string) {
    const eventAttendance = await CRM('Activity', 'get', {
        select: [
            config.LoggingAttendanceCustomFieldSetName + '.event_activity_id',
            'duration',
        ],
        where: [
            [config.LoggingAttendanceCustomFieldSetName + '.event_activity_id', '=', eventId]
        ],
    });
    return eventAttendance.data[0];
}

export default function Home() {
    const [volunteeredActivitiesDetails, setVolunteeredActivitiesDetails] = useState<VolunteerActivityDetails[]>([]);
    const [hoursVolunteered, setHoursVolunteered] = useState<number>(0);
    const [numEventsParticipated, setNumEventsParticipated] = useState<number>(0);

    useEffect(() => {
        const email = (window as any).email as string ?? config.email;

        (async function () {
            const allEventRegistration = await CRM('Activity', 'get', {
                select: [
                    'status_id:name',
                    config.RegistrationCustomFieldSetName + '.event_activity_id',
                ],
                join: [
                    ['ActivityContact AS activity_contact', 'LEFT', ['id', '=', 'activity_contact.activity_id']],
                ],
                where: [
                    ['activity_contact.contact_id.email_primary.email', '=', email],
                    ['activity_type_id:label', '=', config.RegistrationActivityTypeName],
                ],
                order: [
                    ['id', 'ASC']
                ],
                limit: 0,
            });

            const unifiedPromises = allEventRegistration.data.map(async (activity: any) => {
                const eventId = activity[config.RegistrationCustomFieldSetName + '.event_activity_id'];
                const [eventDetail, eventAttendance] = await Promise.all([
                    fetchEventDetails(eventId),
                    fetchEventAttendance(eventId),
                ]);

                return { status: activity, details: eventDetail, attendance: eventAttendance };
            });

            // Wait for all detail promises to resolve
            const allDetails = await Promise.all(unifiedPromises);
            console.log(allDetails);
            // const flattenedAllDetails = allDetails.flatMap(innerArray => innerArray);


            let minsVolunteeredCalc = 0;
            let numEventsParticipatedCalc = 0;

            // Calculate minutes and events participated
            allDetails.forEach(({ status, details, attendance }: any) => {
                let eventStatus = "Upcoming";
                const eventDate = new Date(details['activity_date_time']);
                const now = new Date();

                if (status['status_id:name'] === 'Cancelled') {
                    eventStatus = "Cancelled";
                } else if (now < eventDate) {
                    eventStatus = "Upcoming";
                } else {
                    if (!attendance) {
                        eventStatus = "No Show";
                    } else {
                        eventStatus = "Completed";
                        minsVolunteeredCalc += attendance['duration'] ?? details['duration'];
                        numEventsParticipatedCalc++;
                    }
                }

                status['status_id:name'] = eventStatus;
            });

            let hoursVolunteered = minsVolunteeredCalc / 60;

            setVolunteeredActivitiesDetails(allDetails);
            setHoursVolunteered(hoursVolunteered);
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
                <h3>Duration: {details['duration']}</h3>
                <br />
            </div>
        ))}
    </Wrapper>
}