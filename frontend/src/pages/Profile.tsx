import { FormEvent, useEffect, useState } from "react";
import CRM from "../../crm";
import Wrapper from "../components/Wrapper";
import TextField from "../components/TextField";
import DropdownField from "../components/DropdownField";

import { FiEdit } from "react-icons/fi";
import { MdSaveAlt, MdOutlineLockReset } from "react-icons/md";
import { CustomField, CustomFieldOptions } from "../typings/types";

const customFieldSetName = "example";

export default function SecondProfile() {
    const [isEditing, setIsEditing] = useState(false);
    const [unsavedProfile, setUnsavedProfile] = useState<any>();
    const [profile, setProfile] = useState<any>();
    const [name, setName] = useState("");
    const [customFields, setCustomFields] = useState<{ [key: string]: CustomField }>();

    const handleProfile = (id: string, value: any) => {
        const newProfile = { ...profile };
        newProfile[id] = value;
        setProfile(newProfile);
    }

    // Responsible for switching the view
    const handleView = () => {
        setIsEditing(!isEditing);
        // If they were previously editing
        if (isEditing) {
            setName(`${unsavedProfile.first_name} ${unsavedProfile.last_name}`);
            setProfile(unsavedProfile);
        }
    }

    // Initializing pre-data
    useEffect(() => {
        // Currently hardcoded email variable to casuarina@octopus.8com
        // Remember to change it to be window.email from <scritp> in index.html
        const email = (window as any).email ?? "casuarina@octopus8.com";
        // Fetching default and custom field sets
        (async function () {
            // Fetching default fields
            let response = await CRM("Contact", "get", {
                select: [
                    "email_primary.email",
                    "address_primary.street_address",
                    "address_primary.postal_code",
                    "phone_primary.phone_numeric",
                    "gender_id",
                    "first_name",
                    "last_name",
                    `${customFieldSetName}.*`
                ],
                where: [["email_primary.email", "=", email]]
            });
            // After fetching from the contact database, populate default fields to set state
            const [profile] = response.data;
            setName(`${profile.first_name} ${profile.last_name}`);
            setProfile(profile);
            setUnsavedProfile(profile);

            // Fetching custom fields
            response = await CRM("CustomField", "get", {
                select: ["name", "label", "html_type", "option_group_id", "data_type"],
                where: [["custom_group_id:name", "=", customFieldSetName]]
            });
            // Getting the option group IDs to fetch field vlaues
            const optionGroupIds = response.data.map((field: any) => field.option_group_id).filter((id: any) => id);
            // Get all option values that has its group_id in optionGroupIds
            const optionValueResponse = await CRM("OptionValue", "get", {
                select: ["label", "value", "name", "option_group_id"],
                where: [["option_group_id", "IN", optionGroupIds]]
            });
            // Custom fields to be set in state
            const customFields: any = {};
            for (const field of response.data) {
                customFields[`${customFieldSetName}.${field.name}`] = {
                    label: field.label,
                    name: field.name,
                    htmlType: field.html_type,
                    dataType: field.data_type,
                    optionGroupId: field.option_group_id,
                    options: optionValueResponse.data.filter((opt: any) => opt.option_group_id == field.option_group_id)
                }
            }

            setCustomFields(customFields);
        })();
    }, []);

    const [isUpdating, setIsUpdating] = useState(false);
    // Saving changes
    const saveChanges = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsUpdating(true);

        const profileToUpdate = { ...profile };
        // This is only for name because it's a unique case, everything else should mostly be automatic
        profileToUpdate.first_name = name.split(" ")[0];
        profileToUpdate.last_name = name.split(" ").splice(1, name.split(" ").length).join(" ");

        await CRM("Contact", "update", {
            where: [["id", "=", profileToUpdate.id]],
            values: Object.keys(profileToUpdate).map((p: string) => ([p, profileToUpdate[p]]))
        });
        alert("Successfully updated profile.");
        
        setIsUpdating(false);
        setProfile(profileToUpdate);
        setUnsavedProfile(profileToUpdate);
        setIsEditing(false);
    }

    return <Wrapper>
        {!profile || !customFields ? <>
            <h1 className="font-bold text-lg">Loading profile...</h1>
        </> : <div className="p-4 mb-12">
            {/* Header */}
            <header>
                <h1 className="font-bold text-xl">{name}</h1>
                <h2 className="font-semibold text-lg">{profile['address_primary.street_address']}</h2>
            </header>
            {/* Form */}
            <form onSubmit={saveChanges} className="max-w-[1200px]">
                {/* Buttons */}
                <div className="flex justify-end mb-20">
                    <div className="flex gap-x-3">
                        {isEditing && <button type="submit" className={`text-white font-semibold text-sm rounded-md py-[6px] px-4 flex justify-between items-center gap-x-3 ${isUpdating ? "bg-primary/50" :"bg-primary"}`} disabled={isUpdating}>
                            <MdSaveAlt />
                            <span>{isUpdating ? "Updating..." : "Save Changes"}</span>
                        </button>}
                        {!isEditing && <button onClick={handleView} type="button" className="text-white font-semibold text-sm rounded-md py-[6px] px-4 bg-primary flex justify-between items-center gap-x-3">
                            <FiEdit />
                            <span>Edit</span>
                        </button>}
                        <button type="button" className="text-white font-semibold text-sm rounded-md py-[6px] px-4 bg-primary flex justify-between items-center gap-x-3">
                            <MdOutlineLockReset size={18} />
                            <span>Reset Password</span>
                        </button>
                    </div>
                </div>
                {/* Input fields */}
                <div className="grid grid-cols-1 gap-x-3 gap-y-6 md:gap-y-8 md:grid-cols-2">
                    {/* Email */}
                    <TextField className="flex justify-center" label="Email" id="email_primary.email" fields={profile} disabled={true} showInfo={isEditing} info="Please contact an administrator to have your Email changed" />
                    {/* Phone */}
                    <TextField className="flex justify-center" label="Phone" id="phone_primary.phone_numeric" fields={profile} disabled={true} showInfo={isEditing} info="Please contact an administrator to have your Contact Number changed" />
                    {/* Name */}
                    <TextField className="flex justify-center" label="Name" id="name" disabled={!isEditing} value={name} handleChange={e => setName(e.target.value)} />
                    {/* Address */}
                    <TextField className="flex justify-center" label="Address" id="address_primary.street_address" fields={profile} disabled={!isEditing} handleFields={handleProfile} />
                    {/* Postal Code */}
                    <TextField className="flex justify-center" label="Postal Code" id="address_primary.postal_code" fields={profile} disabled={!isEditing} handleFields={handleProfile} />
                    {/* Gender */}
                    <DropdownField className="flex justify-center" label="Gender" id="gender_id" placeholder="Please choose your gender" fields={profile} disabled={!isEditing} handleFields={handleProfile} options={[
                        { label: "Male", value: "2" },
                        { label: "Female", value: "1" },
                        { label: "Others", value: "0" },
                    ]} />

                    {/* Custom  fields */}
                    {customFields && Object.values(customFields).map((field: CustomField) => {
                        const id = `${customFieldSetName}.${field.name}`
                        switch (field.htmlType) {
                            case "Text":
                                return <TextField className="flex justify-center" label={field.label} id={id} fields={profile} disabled={!isEditing} handleFields={handleProfile} />
                            case "Radio":
                                return <DropdownField className="flex justify-center" label={field.label} id={id} fields={profile} disabled={!isEditing} handleFields={handleProfile} options={field.options as CustomFieldOptions[]} />
                        }
                    })}
                </div>
            </form>
        </div>}
    </Wrapper>
}