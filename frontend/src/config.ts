interface ConfigProps {
    domain: string;
    email: string;
    ProfileCustomFieldSetName: string;
    EventActivityTypeName: string;
    EventCustomFieldSetName: string;
    RegistrationActivityTypeName: string;
    RegistrationCustomFieldSetName: string;
    LoggingAttendanceActivityTypeName: string;
    LoggingAttendanceCustomFieldSetName: string;
}

const config: ConfigProps = {
    // Domain
    domain: "http://localhost/wordpress",
    // Test email
    email: "munjun@octopus8.com",
    // The custom field set used for the profile
    ProfileCustomFieldSetName: "example",

    // The activity type name for created events
    EventActivityTypeName: "Volunteer Event",
    // The custom field set used for the event
    EventCustomFieldSetName: "event_details",

    // The activity type name for registering for an event
    RegistrationActivityTypeName: "Volunteer Event Registration",
    // The custom field set used for registration
    RegistrationCustomFieldSetName: "participation_details",

    // The activity type name for logging your attendance in an event
    LoggingAttendanceActivityTypeName: "Volunteer Event Attendance",
    // The custom field set used for logging attendance
    LoggingAttendanceCustomFieldSetName: "attendance_details"
};

export default config;