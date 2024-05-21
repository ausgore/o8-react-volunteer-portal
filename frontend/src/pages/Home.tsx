import { useEffect, useState } from "react";
import CRM from "../../crm";
import Wrapper from "../components/Wrapper";
import config from "../../../config";
import { format } from "date-fns";

// Define the type for volunteered activity details
// interface VolunteerActivityDetails {
//     Title: string;
//     Tagline: string;
//     Description: string;
//     Responsibilities: string;
//     Requirements: string;
//     Location: string;
//     Event_Start_Date: string;
//     Event_End_Date: string;
//     Registration_Start_Date: string;
//     Registration_End_Date: string;
//     Max_Volunteers: string;
// }

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
            ['id', '=', eventId],
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
            [config.LoggingAttendanceCustomFieldSetName + '.event_activity_id', '=', eventId],
        ],
    });
    return eventAttendance.data[0];
}

// Fetch all unvolunteered & future events
async function getAllEvents(volunteeredActivitiesArr: number[]) {
    const now = new Date();
    const formattedNow = format(now, "yyyy-MM-dd HH:mm:ss");
    const allEvents = await CRM("Activity", "get", {
        select: [
            "subject",
            "location",
            "activity_date_time",
        ],
        where: [
            ["activity_type_id:name", "=", config.EventActivityTypeName],
            ['activity_date_time', '>', formattedNow],
            ['id', 'NOT IN', volunteeredActivitiesArr],
        ],
        order: [
            ['activity_date_time', 'ASC'],
        ],
        limit: 3,
    });

    // console.log(allEvents.data);
    return allEvents.data;
}

async function cancelEvent(registrationActivityId: number) {
    const cancel = await CRM("Activity", 'update', {
        values: [
            ['status_id:name', 'Cancelled'],
        ],
        where: [
            ['id', '=', registrationActivityId],
        ]
    });

    return cancel.data.length > 0
}

export default function Home() {
    const [volunteeredEvents, setVolunteeredEvents] = useState<any[]>([]);
    const [hoursVolunteered, setHoursVolunteered] = useState<number>(0);
    const [numEventsParticipated, setNumEventsParticipated] = useState<number>(0);
    const [upcomingUnvolunteeredEvents, setUpcomingUnvolunteeredEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const email = (window as any).email as string ?? config.email;

        (async function () {
            try {
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
                    let eventStatus = "";
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

                let hoursVolunteered = parseFloat((minsVolunteeredCalc / 60).toFixed(1));

                setVolunteeredEvents(allDetails);
                setHoursVolunteered(hoursVolunteered);
                setNumEventsParticipated(numEventsParticipatedCalc);

                // Extract IDs of volunteered activities
                const volunteeredActivitiesArr = allDetails.map((detail: any) => detail.details.id);

                // Fetch all unvolunteered & future events
                const allEvents = await getAllEvents(volunteeredActivitiesArr);

                // Filter upcoming unvolunteered events
                // const registeredEventIds = new Set(allDetails.map((detail: any) => detail.details.id));
                // const upcomingUnvolunteered = allEvents.filter((event: any) => {
                //     const eventDate = new Date(event['activity_date_time']);
                //     const now = new Date();
                //     return now < eventDate && !registeredEventIds.has(event.id);
                // });

                setUpcomingUnvolunteeredEvents(allEvents);
            } catch (error) {
                console.log('Error fetching data: ', error)
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return <Wrapper>
        {loading ? (
            <h1><b>Loading...</b></h1>
        ) : (
            <div>
                Number of Hours Volunteered: {hoursVolunteered}<br />
                Volunteering Events Participated: {numEventsParticipated}<br /><br />
                <h1><b>Volunteering Event Status</b></h1>
                {volunteeredEvents.map(({ status, details }: any, index) => (
                    <div key={index}>
                        <h2>Event Name: {details['subject']}</h2>
                        <h3>Date, Time: {details['activity_date_time']}</h3>
                        <h3>Status: {status['status_id:name']}</h3>
                        <h3>Location: {details['location']}</h3>
                        <h3>Duration: {details['duration']}</h3>
                        <button
                            type="button"
                            style={{
                                padding: "4px 20px",
                                backgroundColor: "#007bff",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer"
                            }}
                            onClick={async () => {
                                // cancel registration allowed only for upcoming/no show 
                                if (status['status_id:name'] === "Upcoming" || status['status_id:name'] === "No Show") {
                                    if (window.confirm("Are you sure you want to cancel this event?")) {
                                        const result = await cancelEvent(status['id']);
                                        if (result) {
                                            alert("Event has been cancelled");
                                            setVolunteeredEvents((prevEvents) =>
                                                prevEvents.map((event) =>
                                                    event.status.id === status['id']
                                                        ? { ...event, status: { ...event.status, 'status_id:name': "Cancelled" } }
                                                        // everything in event remain same (...event), but update status
                                                        // everything in event.status remain same (...event.status), but update status.id:name
                                                        : event
                                                )
                                            );
                                        }
                                    }
                                }
                                else if (status['status_id:name'] === "Cancelled" || status['status_id:name'] === "Completed") {
                                    alert("Sorry you cannot cancel this event");
                                }
                            }}>
                            Cancel
                        </button>
                        <br />
                        <br />
                    </div>
                ))}<br />
                <h1><b>Upcoming Events</b></h1>
                {upcomingUnvolunteeredEvents.map((event: any, index: number) => (
                    <div key={index}>
                        <h2>Event Name: {event['subject']}</h2>
                        <h3>Date, Time: {event['activity_date_time']}</h3>
                        <h3>Location: {event['location']}</h3>
                        <br />
                    </div>
                ))}
            </div>
        )}
    </Wrapper>
}