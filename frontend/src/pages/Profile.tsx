import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CRM from "../../crm";
import { CustomField } from "../typings/types";

const customFieldSet = "example";

export default function Profile() {
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    // Default values
    const [id, setId] = useState<number | null>();
    const [address, setAddress] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [gender, setGender] = useState<number | null>();
    const [name, setName] = useState("");

    // Custom field values
    const [customFields, setCustomFields] = useState<Map<string, CustomField>>(new Map());
    // Responsible for dynamically updating a field value under custom field map
    const updateCustomField = (customFieldName: string, value: any) => {
        const updatedFields = new Map(customFields);
        const field = updatedFields.get(`${customFieldSet}.${customFieldName}`);
        if (field) {
            field.value = value;
            customFields.set(`${customFieldSet}.${customFieldName}`, field);
            setCustomFields(updatedFields);
        }
    }

    // useEffect to initialize values, DO NOT change
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
                select: ["name", "label", "html_type", "option_group_id", "data_type"],
                where: [["custom_group_id:name", "=", customFieldSet]]
            });
            // Getting the option group IDs to fetch field vlaues
            const optionGroupIds = response.data.map((field: any) => field.option_group_id).filter((id: any) => id);
            // Get all option values that has its group_id in optionGroupIds
            const optionValueResponse = await CRM("OptionValue", "get", {
                select: ["label", "value", "name", "option_group_id"],
                where: [["option_group_id", "IN", optionGroupIds]]
            });
            // Custom fields to be set in state
            const customFields: Map<string, CustomField> = new Map(response.data.map((field: any) => (
                [`${customFieldSet}.${field.name}`, {
                    label: field.label,
                    name: field.name,
                    htmlType: field.html_type,
                    dataType: field.data_type,
                    value: contact[`${customFieldSet}.${field.name}`],
                    optionGroupId: field.option_group_id,
                    options: optionValueResponse.data.filter((opt: any) => opt.option_group_id == field.option_group_id)
                }]
            ) as [string, CustomField]));
            setCustomFields(customFields);

            setIsLoading(false);
        })();
    }, []);

    // what happens after clicking on update button
    const updateProfile = async () => {
        setIsUpdating(true);
        console.log(customFields);
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
                {/* Values before can be hardcoded */}
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
                {/* Values above can be hardcoded */}


                {/* Custom values */}
                {[...customFields.values()].map((customField) => {
                    const props = { customField, updateCustomField };
                    return <div style={{ marginBottom: 6 }}>
                        {customField.htmlType.toLowerCase() == "checkbox" && <>
                            {customField.options?.map(option => <>
                                <label style={{ marginRight: 6 }}>{customField.label}</label>
                                <label htmlFor={`${customField.name}-${option.name}`}>{option.label}</label>
                                <input type="checkbox" id={`${customField.name}-${option.name}`} value={option.value} onClick={() => updateCustomField(customField.name, [...customField.value?.length ? customField.value : [null], option.value].filter(v => v))} />
                            </>)}
                        </>}
                    </div>
                })}

                <button style={{ marginTop: 12, paddingLeft: 4, paddingRight: 4, paddingTop: 2, paddingBottom: 2 }} onClick={updateProfile}>
                    {isUpdating ? "Updating..." : "Update"}
                </button>
            </div>
        </>}
    </>
}