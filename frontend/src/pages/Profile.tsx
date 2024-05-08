import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CRM from "../../crm";

interface CustomFieldProps {
    name: string;
    label: string;
    htmlType: string;
    value: any;
    optionGroupId?: number;
    options?: {
        name: string;
        label: string;
        value: string;
    }[]
}
const customFieldSet = "example";

export default function SecondProfile() {
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    // Default values
    const [id, setId] = useState<number | null>();
    const [address, setAddress] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [gender, setGender] = useState<number | null>();
    const [name, setName] = useState("");
    // Custom field vlaues
    const [customFields, setCustomFields] = useState<Map<string, CustomFieldProps>>(new Map());

    useEffect(() => {
        const win = window as any;
        const email = win.email ?? "casuarina@octopus8.com";
        (async function () {
            let response = await CRM("Contact", "get", {
                select: [
                    "email_primary.email",
                    "address_primary.street_address",
                    "address_primary.postal_code",
                    "gender_id",
                    "first_name",
                    "last_name",
                    `${customFieldSet}.*`
                ],
                where: [["email_primary.email", "=", email]]
            });
            
            const contact = response.data[0];
            // Normal fields
            setId(contact["id"]);
            setAddress(contact["address_primary.street_address"])
            setPostalCode(contact["address_primary.postal_code"]);
            setGender(contact["gender_id"]);
            setName(`${contact["first_name"]} ${contact["last_name"]}`);

            // Use this for custom fields
            // Getting value types of custom field names
            response = await CRM("CustomField", "get", {
                select: ["name", "label", "html_type", "option_group_id"],
                where: [
                    ["custom_group_id:name", "=", customFieldSet],
                    ["option_group_id", "IS NOT NULL"]
                ]
            });
            const customField: Map<string, CustomFieldProps> = new Map(response.data.map((field: any) => (
                [`${customFieldSet}.${field.name}`, { 
                    label: field.label,
                    name: field.name,
                    htmlType: field.html_type,
                    value: contact[`${customFieldSet}.${field.name}`],
                    optionGroupId: field.option_group_id
                }]
            ) as [string, CustomFieldProps]));
            // Getting the option group IDs to fetch field vlaues
            const optionGroupIds = response.data.map((field: any) => field.option_group_id);
            // Get all option values that has its group_id in optionGroupIds
            response = await CRM("OptionValue", "get", {

            });

            setIsLoading(false);
        })();
    }, []);

    const updateProfile = async () => {
        setIsUpdating(true);
        await CRM("Contact", "update", {
            where: [
                ["id", "=", id]
            ],
            values: [
                ["address_primary.street_address", address],
                ["address_primary.postal_code", postalCode],
                ["gender_id", gender],
                ["first_name", name.split(" ").splice(0, name.split(" ").length - 1).join(" ")],
                ["last_name", name.split(" ")[name.split(" ").length - 1]]
            ]
        })
        setIsUpdating(false);
    }


    return <>
        <h1>Profile Page</h1>
        <Link to="/home">Go to home page</Link>
        {isLoading ? <p>Loading...</p> : <>
            <div style={{ gap: 2 }}>
                <div style={{ marginBottom: 6 }}>
                    <label>Name </label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div style={{ marginBottom: 6 }}>
                    <label>Address </label>
                    <input type="text" value={address} onChange={e => setAddress(e.target.value)} />
                </div>
                <div style={{ marginBottom: 6 }}>
                    <label>Postal Code </label>
                    <input type="text" value={postalCode} onChange={e => setPostalCode(e.target.value)} />
                </div>
                <div style={{ marginBottom: 6 }}>
                    <p>Gender</p>
                    <input type="radio" id="male" name="gender" value={0} defaultChecked={gender == 0} onClick={() => setGender(0)} />
                    <label htmlFor="male">Male</label>
                    <input type="radio" id="female" name="gender" value={1} defaultChecked={gender == 1} onClick={() => setGender(1)} />
                    <label htmlFor="female">Female</label>
                    <input type="radio" id="others" name="gender" value={2} defaultChecked={gender == 2} onClick={() => setGender(2)} />
                    <label htmlFor="others">Others</label>
                </div>
                {/* Custom values */}
               
                <button style={{ marginTop: 12, paddingLeft: 4, paddingRight: 4, paddingTop: 2, paddingBottom: 2 }} onClick={updateProfile}>
                    {isUpdating ? "Updating..." : "Update" }
                </button>
            </div>
        </>}
    </>
}