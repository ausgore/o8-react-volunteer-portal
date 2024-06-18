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
    ProfileCustomFieldSetName: "",

    // The activity type name for created events
    EventActivityTypeName: "",
    // The custom field set used for the event
    EventCustomFieldSetName: "",
    // The activity type name for event roles per event
    EventRoleActivityTypeName: "",
    // The custom field set used for the event role
    EventRoleCustomFieldSetName: "",

    // The activity type name for registering for an event
    RegistrationActivityTypeName: "",
    // The custom field set used for registration
    RegistrationCustomFieldSetName: "",

    // The activity type name for logging your attendance in an event
    LoggingAttendanceActivityTypeName: "",
    // The custom field set used for logging attendance
    LoggingAttendanceCustomFieldSetName: ""
};

export default config;
