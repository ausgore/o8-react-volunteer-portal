import { KeyboardEvent, useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import CRM, { ComparisonOperator } from "../../crm";
import EventCard from "../components/EventCard";
import config from "../../../config";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { createSearchParams, useSearchParams } from "react-router-dom";
import Loading from "../components/Loading";
import Dropdown from "../components/Dropdown";
import "react-datepicker/dist/react-datepicker.css";
import ReactDatePicker from "react-datepicker";
import moment from "moment";

const mandatoryFilters = ["region", "category", "role"];

export default function Events() {
    const [events, setEvents] = useState<any[] | null>();
    const [search, setSearch] = useState("");
    const [searchParams, setSearchParams] = useSearchParams();

    const [customFields, setCustomFields] = useState<any>();

    const email = (window as any).email ?? config.email;

    useEffect(() => {
        (async () => {
            let response = await CRM("CustomField", "get", {
                select: ["name", "label", "html_type", "option_group_id"],
                where: [["custom_group_id:name", "=", config.EventCustomFieldSetName]]
            });
            const eventCustomFields = response.data;
            // Getting the option group IDs to fetch field vlaues
            const optionGroupIds = eventCustomFields.map((field: any) => field.option_group_id).filter((id: any) => id);
            // Get all option values that has its group_id in optionGroupIds
            const optionGroupValues = await CRM("OptionValue", "get", {
                select: ["label", "value", "name", "option_group_id"],
                where: [["option_group_id", "IN", optionGroupIds]]
            });
            
            // Getting user custom fields with optionGroupId
            response = await CRM("CustomField", "get", {
                select: ["name", "html_type", "option_group_id"],
                where: [["custom_group_id:name", "=", config.ProfileCustomFieldSetName]]
            });
            const contactCustomFields = response.data;
            // Geting custom field values from user
            response = await CRM("Contact", "get", {
                select: [`${config.ProfileCustomFieldSetName}.*`],
                where: [["email_primary.email", "=", email]]
            });
            const contactCustomFieldValues = response.data[0];

            // For each contact's custom field data, if they have an option group id in one of the events' option group ids
            // Its main purpose is to compare both custom field sets have custom fields which share the same set of options
            let updateSearchParams = false;
            for (const fieldData of contactCustomFields) {
                if (fieldData.option_group_id && optionGroupIds.includes(fieldData.option_group_id)) {
                    const eventCustomField = eventCustomFields.find((e: any) => e.option_group_id == fieldData.option_group_id);
                    const preContactCustomFieldValue = contactCustomFieldValues[`${config.ProfileCustomFieldSetName}.${fieldData.name}`];
                    // If there are values to set and there aren't pre values in the query string when they refresh
                    if (preContactCustomFieldValue?.length && !searchParams.get(`${config.EventCustomFieldSetName}.${eventCustomField.name}`)) {
                        updateSearchParams = true;
                        searchParams.set(`${config.EventCustomFieldSetName}.${eventCustomField.name}`, JSON.stringify(preContactCustomFieldValue));
                    }
                }
            }
            if (updateSearchParams) setSearchParams(searchParams);


            // Getting and setting the custom fields which have options
            const customFields: any = {};
            for (const field of eventCustomFields) {
                if (field.option_group_id) {
                    customFields[`${config.EventCustomFieldSetName}.${field.name}`] = {
                        label: field.label,
                        name: field.name,
                        htmlType: field.html_type,
                        optionGroupId: field.option_group_id,
                        options: optionGroupValues.data.filter((opt: any) => opt.option_group_id == field.option_group_id)
                    }

                }
            }
            setCustomFields(customFields);
        })();
    }, []);

    const handleSearch = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key == "Enter") {
            setSearch("");
            if (search.length) searchParams.set("search", search);
            else searchParams.delete("search");
            setSearchParams(searchParams);
        }
    }

    // Update the database each time the searchParams is affected, this includes the first time the page is affected and every other time you select a category
    useEffect(() => {
        updateEvents();
    }, [searchParams]);
    // The actual function to update itself 
    const updateEvents = async () => {
        setEvents(null);

        const where: [string, ComparisonOperator, any?][] = [["activity_type_id:name", "=", config.EventActivityTypeName]];
        const search = searchParams.get("search");
        if (search) where.push(["subject", "CONTAINS", search]);

        let startDate, endDate;
        if (searchParams.has("date")) startDate = new Date(JSON.parse(searchParams.get("date") as string));
        if (searchParams.has("endDate")) endDate = new Date(JSON.parse(searchParams.get("endDate") as string));

        if (startDate) {
            where.push(["activity_date_time", ">=", `${moment(startDate).format("YYYY-MM-DD")} 00:00:00`]);
            if (endDate) where.push(["activity_date_time", "<=", `${moment(endDate).format("YYYY-MM-DD")} 23:59:59`]);
            else where.push(["activity_date_time", "<=", `${moment(startDate).format("YYYY-MM-DD")} 23:59:59`]);
        }
        else if (endDate) where.push(["activity_date_time", "<=", `${moment(endDate).format("YYYY-MM-DD")} 23:59:59`]);

        for (const key of searchParams.keys())
            if (key.startsWith(config.EventCustomFieldSetName))
                where.push([key, "IN", JSON.parse(searchParams.get(key) ?? "[]")])


        // Fetch all events
        let response = await CRM("Activity", "get", {
            select: [
                "activity_type_id:name",
                `${config.EventCustomFieldSetName}.*`,
                "subject",
                "location",
                "activity_date_time",
                "duration",
                "status_id:name"
            ],
            where,
        });
        const events = response.data;
        setEvents(events);
    }

    const updateSelection = (selection: string, option: any) => {
        const selected: string[] = JSON.parse(searchParams.get(selection) ?? "[]").map((v: any) => `${v}`);
        if (!selected.includes(option.value)) selected.push(option.value);
        else selected.splice(selected.indexOf(option.value), 1);

        if (!selected.length) searchParams.delete(selection);
        else searchParams.set(selection, JSON.stringify(selected));
        setSearchParams(searchParams);
    }

    const handleDateChange = (type: string, date: Date | null) => {
        if (date) searchParams.set(type, JSON.stringify(date));
        else searchParams.delete(type);
        setSearchParams(searchParams);
    }

    const clearDateAndTimeFilters = (keys: string[]) => {
        for (const key of keys) searchParams.delete(key);
        setSearchParams(searchParams);
    }

    const clearFilters = () => {
        const searchParams = createSearchParams();
        setSearchParams(searchParams);
    }

    return <Wrapper>
        {!customFields ? <Loading className="h-screen items-center" /> : <div className="p-4 mb-12">
            <div className="max-w-[1200px] px-0 md:px-6">
                <div className="mb-6">
                    {/* Search function and mandatory filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-center gap-y-3 lg:gap-x-6">
                        {/* Search function */}
                        <div className="relative flex items-center">
                            <input type="text" placeholder="Search" className="py-2 px-4 pr-12 rounded-lg w-full outline-none" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={handleSearch} />
                            <FaMagnifyingGlass className="text-gray-500 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                        </div>
                        <div className="col-span-2 flex flex-col md:grid md:grid-cols-2 lg:flex lg:flex-row justify-between lg:justify-normal gap-3">
                            {/* Date and Time */}
                            <Dropdown label="Date">
                                <div className="absolute bg-white shadow-md rounded-md w-max min-w-full mt-2 p-4 z-20">
                                    <div className="flex flex-col md:flex-row gap-3 gap-x-4">
                                        <div>
                                            <label htmlFor="date" className="text-sm text-gray-600">Starting Date</label>
                                            <div className="flex flex-row items-center text-gray-600">
                                                <ReactDatePicker
                                                    id="date"
                                                    selected={searchParams.get("date") ? new Date(JSON.parse(searchParams.get("date") as string)) : undefined}
                                                    onChange={d => handleDateChange("date", d)}
                                                    dateFormat="d MMMM, yyyy"
                                                    className="mt-1 block px-4 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm focus:outline-none sm:text-sm w-[160px] text-center text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="endDate" className="text-sm text-gray-600">Ending Date</label>
                                            <div className="flex flex-row items-center text-gray-600">
                                                <ReactDatePicker
                                                    id="endDate"
                                                    selected={searchParams.get("endDate") ? new Date(JSON.parse(searchParams.get("endDate") as string)) : undefined}
                                                    onChange={d => handleDateChange("endDate", d)}
                                                    dateFormat="d MMMM, yyyy"
                                                    className="mt-1 block px-4 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm focus:outline-none sm:text-sm w-[160px] text-center text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {(searchParams.has("date") || searchParams.has("endDate")) &&
                                        <button className="text-sm text-secondary mt-3" onClick={() => clearDateAndTimeFilters(["date", "endDate"])}>Clear Date Filters </button>}

                                </div>
                            </Dropdown>
                            {/* Mandatory Custom Fields */}
                            {customFields && mandatoryFilters.map((name, index) => {
                                const field = customFields[`${config.EventCustomFieldSetName}.${name}`];
                                return <Dropdown label={field.label.charAt(0).toUpperCase() + field.label.slice(1)}>
                                    <div className={`absolute bg-white shadow-md rounded-md w-full min-w-[200px] mt-2 z-20 ${index == mandatoryFilters.length - 1 ? "right-0" : "left-0"}`}>
                                        {/* For ecah option */}
                                        {field.options.map((opt: any) => <div className="in-line px-4 py-2 items-center gapx-3 cursor-pointer hover:bg-gray-100" onClick={() => updateSelection(`${config.EventCustomFieldSetName}.${name}`, opt)}>
                                            <input type="checkbox" id={`${opt.id}.${opt.value}`} className="pointer-events-none" checked={JSON.parse(searchParams.get(`${config.EventCustomFieldSetName}.${name}`) ?? "[]").includes(opt.value)} />
                                            <label htmlFor={`${opt.id}.${opt.value}`} className="text-sm w-full text-gray-600 ml-4 cursor-pointer pointer-events-none">{opt.label}</label>
                                        </div>)}
                                    </div>
                                </Dropdown>
                            })}
                        </div>
                    </div>
                    {/* For other custom selectable custom fields because i don't know how to deal with this */}
                    {/* If there are more filters that isn't just the search in the search param */}
                    {Array.from(searchParams.keys()).length > 0
                        && <button onClick={clearFilters} className="text-sm text-secondary text-left">Clear Filters</button>}
                </div>
                {/* Event cards */}
                {!events ? <Loading className="items-center h-full mt-20" /> : <>
                    {searchParams.get("search") && <h1 className="text-xl font-semibold text-gray-600">Results for: {searchParams.get("search")}</h1>}
                    {events.length == 0 && <p className="text-lg text-gray-500">Looks like there aren't any events</p>}
                    {events.length > 0 && <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
                        {events.map((event: any) => <EventCard className="flex justify-center" event={event} />)}
                    </div>}
                </>}
            </div>
        </div>}
    </Wrapper>
}