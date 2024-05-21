interface ConfigProps {
    email: string;
    ProfileCustomFieldSetName: string;
    EventActivityTypeName: string;
    EventCustomFieldSetName: string;
    MandatoryEventCustomFields: string[];
    RegistrationActivityTypeName: string;
    RegistrationCustomFieldSetName: string;
    LoggingAttendanceActivityTypeName: string;
    LoggingAttendanceCustomFieldSetName: string;
}

const config: ConfigProps = {
    // Test email
    email: "munjun@octopus8.com",
    // The custom field set used for the profile
    ProfileCustomFieldSetName: "example",

    // The activity type name for created events
    EventActivityTypeName: "Volunteer Event",
    // The custom field set used for the event
    EventCustomFieldSetName: "event_details",
    // MAndatory custom field names that must exist, DO NOT CHANGE HERE
    MandatoryEventCustomFields: ["registration_start", "registration_end", "vacancy"],

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