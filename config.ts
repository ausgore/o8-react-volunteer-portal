interface ConfigProps {
    domain: string;
    email: string;
    ProfileCustomFieldSetName: string;
    EventActivityTypeName: string;
    EventCustomFieldSetName: string;
    EventRoleActivityTypeName: string;
    EventRoleCustomFieldSetName: string;
    RegistrationActivityTypeName: string;
    RegistrationCustomFieldSetName: string;
    LoggingAttendanceActivityTypeName: string;
    LoggingAttendanceCustomFieldSetName: string;
}

const config: ConfigProps = {
    // Domain
    domain: "http://localhost/wordpress",
    // Test email
    email: "",
    // The custom field set used for the profile
    ProfileCustomFieldSetName: "volunteer_profile",

    // The activity type name for created events
    EventActivityTypeName: "Volunteer Event",
    // The custom field set used for the event
    EventCustomFieldSetName: "event_details",
    // The activity type name for event roles per event
    EventRoleActivityTypeName: "",
    // The custom field set used for the event role
    EventRoleCustomFieldSetName: "",

    // The activity type name for registering for an event
    RegistrationActivityTypeName: "Volunteer Event Participation",
    // The custom field set used for registration
    RegistrationCustomFieldSetName: "participation_details",

    // The activity type name for logging your attendance in an event
    LoggingAttendanceActivityTypeName: "Volunteer Event Attendance",
    // The custom field set used for logging attendance
    LoggingAttendanceCustomFieldSetName: "attendance_details"
};

export default config;
