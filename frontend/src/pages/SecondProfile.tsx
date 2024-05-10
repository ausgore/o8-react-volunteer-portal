import { ChangeEvent, useEffect, useState } from "react";
import CRM from "../../crm";
import Wrapper from "../components/Wrapper";
import DefaultField from "../components/DefaultField";

const customFieldSetName = "example";

export default function SecondProfile() {
    const [isEditing, setIsEditing] = useState(true);
    const [profile, setProfile] = useState<any>();
    const [name, setName] = useState("");

    const handleProfile = (id: string, value: any) => {
        const newProfile = {...profile};
        newProfile[id] = value;
        setProfile(newProfile);
    }
    
    // Initializing pre-data
    useEffect(() => {
        // Currently hardcoded email variable to casuarina@octopus.8com
        // Remember to change it to be window.email from <scritp> in index.html
        const email = (window as any).email ?? "casuarina@octopus8.com";
        // Fetching default and custom field sets
        (async function () {
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
        })();
    }, []);

    return <Wrapper>
        {!profile ? <>
            <h1 className="font-bold text-lg">Loading profile...</h1>
        </> : <div className="p-4">
            {/* Header */}
            <header className="mb-6">
                <h1 className="font-bold text-xl">{profile.first_name} {profile.last_name}</h1>
                <h2 className="font-semibold text-lg">{profile['address_primary.street_address']}</h2>
            </header>
            {/* Form */}
            <div className="grid grid-cols-1 gap-x-3 gap-y-3 md:gap-y-8 md:grid-cols-2 max-w-[1200px]">
                <DefaultField className="flex justify-center" name="Email" id="email_primary.email" profile={profile} disabled={true} />
                <DefaultField className="flex justify-center" name="Phone" id="phone_primary.phone_numeric" profile={profile} disabled={true} />
                {/* Name is unique because it's actually using two fields, do not change this unless you know what you're doing */}
                <div className="flex justify-center">
                    <div className="w-full md:w-[300px]">
                        <label htmlFor="name" className={`font-semibold mb-1 ${isEditing ? "" : "opacity-40"}`}>Name</label>
                        <div className="relative">
                            <input type="text" id="name" placeholder={name} value={isEditing ? `${name}` : ""} className="w-full py-2 px-4 rounded-[5px] outline-none disabled:bg-white" disabled={!isEditing} onChange={e => setName(e.target.value)} />
                        </div>
                    </div>
                </div>
                {/* Name is unique because it's actually using two fields, do not change this unless you know what you're doing */}
            </div>
        </div>}
    </Wrapper>
}