import { useEffect, useState } from "react";
import CRM from "../../crm";
import Wrapper from "../components/Wrapper";
import DashboardHeader from "../components/DashboardHeader";
import DashboardStats from "../components/DashboardStats";
import EventStatus from "../components/EventStatus";
import UpcomingEvents from "../components/UpcomingEvents";
import Loading from "../components/Loading";
import config from "../../../config";
import { format, parseISO } from "date-fns";
import ConfirmationModal from "../components/ConfirmationModal";
import CancelEvent from "../assets/undraw_cancel_re_pkdm.svg";
import swal from 'sweetalert';

async function fetchProfileDetails(email: string) {
    const response = await CRM("Contact", "get", {
        select: [
            "email_primary.email",
            "phone_primary.phone_numeric",
            "first_name",
            "last_name",
        ],
        where: [["email_primary.email", "=", email]]
    });

    let profile = response.data[0];
    return {
        name: profile["first_name"] + ' ' + profile["last_name"],
        email: profile["email_primary.email"],
        phone: profile["phone_primary.phone_numeric"],
        imageUrl: "",
    };
}

interface Profile {
    name: any;
    email: any;
    phone: any;
    imageUrl: string;
}

// Function to fetch event details
async function fetchEventDetails(eventId: string) {
    const eventDetail = await CRM('Activity', 'get', {
        select: [
            'subject',
            'location',
            'activity_date_time',
            'duration',
            'status_id:name',
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
async function getUnvolunteeredEvents(volunteeredActivitiesArr: number[]) {
    const now = new Date();
    const formattedNow = format(now, "yyyy-MM-dd HH:mm:ss");
    const allEvents = await CRM("Activity", "get", {
        select: [
            "subject",
            "location",
            "activity_date_time",
            "duration",
            config.EventCustomFieldSetName + ".vacancy",
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

    return cancel.data.length > 0;
}

export default function Home() {
    const [profile, setProfile] = useState<Profile | null>();
    const [volunteeredEvents, setVolunteeredEvents] = useState<any[]>([]);
    const [hoursVolunteered, setHoursVolunteered] = useState<number>(0);
    const [numEventsParticipated, setNumEventsParticipated] = useState<number>(0);
    const [upcomingUnvolunteeredEvents, setUpcomingUnvolunteeredEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [currentRegistrationId, setCurrentRegistrationId] = useState<number | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        const email = (window as any).email as string ?? config.email;

        (async function () {
            try {
                const profile = await fetchProfileDetails(email);
                setProfile(profile);

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
                        ['activity_type_id:name', '=', config.RegistrationActivityTypeName],
                    ],
                    order: [
                        ['id', 'ASC']
                    ],
                });

                // Remove duplicates based on status.id
                const uniqueStatuses = new Set();
                const filteredEventRegistration = allEventRegistration.data.filter((activity: any) => {
                    if (uniqueStatuses.has(activity.id)) {
                        return false;
                    } else {
                        uniqueStatuses.add(activity.id);
                        return true;
                    }
                });

                const unifiedPromises = filteredEventRegistration.map(async (activity: any) => {
                    const eventId = activity[config.RegistrationCustomFieldSetName + '.event_activity_id'];
                    const [eventDetail, eventAttendance] = await Promise.all([
                        fetchEventDetails(eventId),
                        fetchEventAttendance(eventId),
                    ]);

                    return { status: activity, details: eventDetail, attendance: eventAttendance };
                });

                const allDetails = await Promise.all(unifiedPromises);
                console.log(allDetails);

                let minsVolunteeredCalc = 0;
                let numEventsParticipatedCalc = 0;

                const transformedEvents = allDetails.map(({ status, details, attendance }: any) => {
                    let eventStatus = "";
                    const eventDate = new Date(details['activity_date_time']);
                    const duration = details['duration'];
                    const endDate = new Date(eventDate.getTime() + duration * 60000);
                    const now = new Date();

                    if (status['status_id:name'] === 'Cancelled') {
                        eventStatus = "Cancelled";
                    } else if (details['status_id:name'] === 'Cancelled') {
                        eventStatus = "Cancelled By Organiser";
                    } else if (now < eventDate) {
                        eventStatus = "Upcoming";
                    } else if (now >= eventDate && now <= endDate) {
                        if (!attendance) {
                            eventStatus = "Check In";
                        } else {
                            eventStatus = "Checked In";
                        }
                    } else if (now > endDate) {
                        if (!attendance) {
                            eventStatus = "No Show";
                        } else {
                            eventStatus = "Completed";
                            minsVolunteeredCalc += attendance['duration'] ?? details['duration'];
                            numEventsParticipatedCalc++;
                        }
                    }

                    return {
                        id: status['id'],  // Added this line to include the registration ID
                        name: details['subject'],
                        dateTime: details['activity_date_time'], // Store raw date time string for sorting
                        formattedDateTime: format(parseISO(details['activity_date_time']), "dd/MM/yyyy hh:mm a"), // Formatted date time for display
                        status: eventStatus,
                        location: details['location'],
                        eventId: details['id'],
                        duration: details['duration'],
                    };
                });

                let hoursVolunteered = parseFloat((minsVolunteeredCalc / 60).toFixed(1));

                console.log(transformedEvents);

                // Sort the events based on status and activity date time
                const sortedEvents = transformedEvents.sort((a, b) => {
                    const statusOrder = ["Check In", "Checked In", "Upcoming", "No Show", "Cancelled", "Cancelled By Organiser", "Completed"];
                    const statusComparison = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
                    if (statusComparison !== 0) {
                        return statusComparison;
                    }

                    if ((a.status === "Upcoming" && b.status === "Upcoming") || (a.status === "Check In" && b.status === "Check In") || (a.status === "Checked In" && b.status === "Checked In")) {
                        return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
                    }

                    return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
                });

                setVolunteeredEvents(sortedEvents);
                setHoursVolunteered(hoursVolunteered);
                setNumEventsParticipated(numEventsParticipatedCalc);

                const volunteeredActivitiesArr = allDetails.map((detail: any) => detail.details.id);
                const unvolunteeredEvents = await getUnvolunteeredEvents(volunteeredActivitiesArr);

                setUpcomingUnvolunteeredEvents(unvolunteeredEvents);
            } catch (error) {
                console.log('Error fetching data: ', error)
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleCancelConfirm = async () => {
        setIsCancelling(true);
        if (currentRegistrationId !== null) {
            const result = await cancelEvent(currentRegistrationId);
            if (result) {
                setShowCancelModal(false);
                swal("Event has been cancelled", {
                    icon: "success",
                });
                setIsCancelling(false);
                setVolunteeredEvents((prevEvents) =>
                    prevEvents.map((event) =>
                        event.id === currentRegistrationId ? { ...event, status: "Cancelled" } : event
                    )
                );
            } else {
                setShowCancelModal(false);
                swal("Event cancellation failed", {
                    icon: "error",
                });
                setIsCancelling(false);
            }
        }
    };

    return (
        <Wrapper>
            <div className="p-4 mb-12">
                <div className="w-full px-0 md:px-6">
                    {loading ? (
                        <Loading className="h-screen items-center" />
                    ) : (
                        <div>
                            <div className="mb-6 flex">
                                {profile && <DashboardHeader {...profile} />}
                            </div>

                            <DashboardStats {...{ hours: hoursVolunteered, events: numEventsParticipated }} />

                            <EventStatus
                                events={volunteeredEvents}
                                openCancelModal={(registrationId: number) => {
                                    setCurrentRegistrationId(registrationId);
                                    setShowCancelModal(true);
                                }}
                            />

                            <UpcomingEvents events={upcomingUnvolunteeredEvents} />
                        </div>
                    )}
                </div>
            </div>

            <ConfirmationModal
                showModal={showCancelModal}
                closeModal={() => setShowCancelModal(false)}
                image={CancelEvent}
                imageWidth="w-[260px]"
                imageHeight="h-[160px]"
                boxWidth="max-w-[400px]"
            >
                <h3 className="text-xl font-semibold text-center mb-4 text-gray-600">
                    Are you sure you want to cancel this event?
                </h3>
                <div className="flex flex-col items-center space-y-4">
                    <button className="w-[200px] py-4 text-lg bg-[#5A71B4] text-white rounded-md hover:bg-[#4a77ff]" onClick={handleCancelConfirm} disabled={isCancelling}>
                        {isCancelling ? "Cancelling..." : "Confirm"}
                    </button>
                    <button
                        className="w-[200px] py-4 text-lg text-gray-600 rounded-md hover:bg-gray-200"
                        onClick={() => setShowCancelModal(false)}
                    >
                        Cancel
                    </button>
                </div>
            </ConfirmationModal>
        </Wrapper>
    );
}