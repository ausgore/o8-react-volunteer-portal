import { PropsWithChildren, useState } from "react";
import config from "../../../config";
import CRM from "../../crm";
import swal from "sweetalert";

interface RegistrationButtonProps extends PropsWithChildren {
    event: any;
    volunteers: any[];
    updateVolunteers: () => Promise<any[]>;
}

export default function RegistrationButton(props: RegistrationButtonProps) {
    console.log(props.event, props.volunteers)
    const email = (window as any).email as string ?? config.email;
    const [isLoading, setIsLoading] = useState(false);
    const handleClick = async () => {
        setIsLoading(true);
        let response = await CRM("Contact", "get", {
            select: ["id"],
            where: [["email_primary.email", "=", email]]
        });
        const { id } = response.data[0];

        // Creating the Participation Activity
        response = await CRM("Activity", "create", {
            values: [
                ["activity_type_id:name", config.RegistrationActivityTypeName],
                ["target_contact_id", [id]], 
                ["source_contact_id", id],
                ["subject", props.event.subject],
                [`${config.RegistrationCustomFieldSetName}.event_activity_id`, props.event.id]
            ]
        });

        const volunteers = await props.updateVolunteers();

        if (volunteers.find(v => v["contact.email_primary.email"] == email)) {
            swal(`You have registered for ${props.event.subject}!`, {
                icon: "success",
            })
        }
        else {
            swal("Some error occurred while registering.\nPlease contact an administrator.", {
                icon: "error"
            },)
        }
        setIsLoading(false);
    }

    const registered = props.volunteers.find(v => v["contact.email_primary.email"] == email) ?? null;
    const withinRegistration = Date.now() >= new Date(props.event[`${config.EventCustomFieldSetName}.registration_start`]).getTime() && Date.now() <= new Date(props.event[`${config.EventCustomFieldSetName}.registration_end`]).getTime();
    const hasSpace = /*props.event[`${config.EventCustomFieldSetName}.vacancy`] ? */props.volunteers >= props.event[`${config.EventCustomFieldSetName}.vacancy`] ? false : true;
    console.log(registered, withinRegistration, hasSpace);
    // If the user already registrered
    // if (props.volunteers.map(v => v["contact.email_primary.email"]))

    return <button className="text-white font-semibold bg-secondary rounded-md w-full py-[6px] px-2 mb-2 disabled:bg-primary" onClick={handleClick} disabled={isLoading || !(!registered) || !withinRegistration || !hasSpace}>
        {/* {!(!registered) && (registered["status_id:name"] == "Cancelled" ? "Cancelled" : "Registered")}
        {!registered && (!withinRegistration || !hasSpace) && "Closed"} */}
        {isLoading ? "Loading..." : registered
            ? (registered["status_id:name"] === "Cancelled" ? "Cancelled" : "Registered")
            : (!withinRegistration || !hasSpace ? "Closed" : "Sign Up")}
    </button>
}