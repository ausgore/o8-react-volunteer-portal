import { KeyboardEvent, useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import CRM, { ComparisonOperator } from "../../crm";
import EventCard from "../components/EventCard";
import config from "../../../config";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { createSearchParams, useSearchParams } from "react-router-dom";
import Loading from "../components/Loading";
import Dropdown from "../components/Dropdown";
import { FiCalendar, FiClock } from "react-icons/fi";
import "react-datepicker/dist/react-datepicker.css";
import ReactDatePicker from "react-datepicker";
import moment from "moment";

export default function Events() {
    const [events, setEvents] = useState<any[] | null>();
    const [search, setSearch] = useState("");
    const [regions, setRegions] = useState<any[]>();
    const [categories, setCategories] = useState<any[]>();
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        (async () => {
            // Getting the custom group id for category
            let response = await CRM("CustomField", "get", {
                select: ["option_group_id"],
                where: [
                    ["name", "=", "category"],
                    ["custom_group_id:name", "=", config.EventCustomFieldSetName]
                ]
            });
            let optionGroupId = response.data[0]["option_group_id"];
            response = await CRM("OptionValue", "get", {
                select: ["label", "value"],
                where: [["option_group_id", "=", optionGroupId]]
            });
            setCategories(response.data);

            response = await CRM("CustomField", "get", {
                select: ["option_group_id"],
                where: [
                    ["name", "=", "region"],
                    ["custom_group_id:name", "=", config.EventCustomFieldSetName]
                ]
            });
            optionGroupId = response.data[0]["option_group_id"];
            response = await CRM("OptionValue", "get", {
                select: ["label", "value"],
                where: [["option_group_id", "=", optionGroupId]]
            });
            setRegions(response.data);
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
        const categories: number[] = JSON.parse(searchParams.get("categories") ?? "[]");
        if (categories.length) where.push([`${config.EventCustomFieldSetName}.category`, "IN", categories]);
        const regions: number[] = JSON.parse(searchParams.get("regions") ?? "[]");
        if (regions.length) where.push([`${config.EventCustomFieldSetName}.region`, "IN", regions]);

        if (searchParams.has("date")) {
            const date = new Date(JSON.parse(searchParams.get("date") as string));
            if (searchParams.has("startTime")) {
                if (searchParams.has("startTime")) {
                    const startTime = moment(searchParams.get("startTime") as string).format("HH:mm:ss");
                    where.push(["activity_date_time", ">=", `${moment(date).format("YYYY-MM-DD")} ${startTime}`]);
                }
            }
            where.push(["activity_date_time", ">=", `${moment(date).format("YYYY-MM-DD")} 00:00:00`]);
            date.setDate(date.getDate() + 1);
            where.push(["activity_date_time", "<", `${moment(date).format("YYYY-MM-DD")} 00:00:00`]);
        }


        // Fetch all events
        let response = await CRM("Activity", "get", {
            select: [
                "activity_type_id:name",
                `${config.EventCustomFieldSetName}.*`,
                "subject",
                "location",
                "activity_date_time",
                "duration"
            ],
            where,
        });
        const events = (response.data as any[])
            .filter(e => {
                let afterStartingTime = true;
                if (!searchParams.has("date") && searchParams.has("startTime")) {
                    const date = new Date(e.activity_date_time);
                    console.log(date);
                }
                return afterStartingTime;
            });
        setEvents(events);
    }

    const updateSelection = (selection: string, option: any) => {
        const selected: number[] = JSON.parse(searchParams.get(selection) ?? "[]");
        if (!selected.includes(parseInt(option.value))) selected.push(parseInt(option.value));
        else selected.splice(selected.indexOf(parseInt(option.value)), 1);

        if (!selected.length) searchParams.delete(selection);
        else searchParams.set(selection, JSON.stringify(selected));
        setSearchParams(searchParams);
    }

    const minTime = new Date();
    minTime.setHours(0, 0, 0, 999);
    const maxTime = new Date();
    maxTime.setHours(23, 59, 59, 999);
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
        <div className="p-4 mb-12">
            <div className="max-w-[1200px] px-0 md:px-6">
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-center gap-y-3 lg:gap-x-6">
                    {/* Search function */}
                    <div className="relative flex items-center">
                        <input type="text" placeholder="Search" className="py-2 px-4 pr-12 rounded-lg w-full outline-none" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={handleSearch} />
                        <FaMagnifyingGlass className="text-gray-500 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                    </div>
                    <div className="col-span-2 flex flex-col md:grid md:grid-cols-2 lg:flex lg:flex-row justify-between lg:justify-normal gap-3">
                        <Dropdown label="Category">
                            <div className="absolute bg-white shadow-md rounded-md w-full min-w-[200px] mt-2 z-20">
                                {categories?.map(category => {
                                    return <div className="inline-block px-4 py-2 items-center gap-x-3 cursor-pointer hover:bg-gray-100 w-full" onClick={() => updateSelection("categories", category)}>
                                        <input type="checkbox" id={`${category.id}-${category.value}`} className="pointer-events-none" checked={JSON.parse(searchParams.get("categories") ?? "[]").includes(parseInt(category.value))} />
                                        <label htmlFor={`${category.id}-${category.value}`} className="text-sm w-full text-gray-600 ml-4 cursor-pointer pointer-events-none">{category.label}</label>
                                    </div>
                                })}
                            </div>
                        </Dropdown>
                        <Dropdown label="Date & Time">
                            <div className="absolute bg-white shadow-md rounded-md w-max min-w-full mt-2 p-4 z-20 right-0">
                                <div className="flex flex-col md:flex-row gap-3 gap-x-4">
                                    <div className="flex flex-row items-center text-gray-600">
                                        <FiCalendar className="mr-3 sm:text-xl" />
                                        <ReactDatePicker
                                            selected={searchParams.get("date") ? new Date(JSON.parse(searchParams.get("date") as string)) : undefined}
                                            onChange={d => handleDateChange("date", d)}
                                            dateFormat="d MMMM, yyyy"
                                            className="mt-1 block px-4 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm focus:outline-none sm:text-sm w-[160px] text-center text-sm"
                                        />
                                    </div>
                                    <div className="flex flex-row items-center text-gray-600">
                                        <FiClock className="mr-3 sm:text-xl" />
                                        {/* Starting Time */}
                                        <ReactDatePicker
                                            showTimeSelect
                                            showTimeSelectOnly
                                            timeIntervals={15}
                                            dateFormat="h:mm aa"
                                            disabled={searchParams.has("date")}
                                            minTime={searchParams.get("endTime") ? minTime : undefined}
                                            maxTime={searchParams.get("endTime") ? new Date(JSON.parse(searchParams.get("endTime") as string)) : undefined}
                                            selected={searchParams.get("startTime") ? new Date(JSON.parse(searchParams.get("startTime") as string)) : undefined}
                                            onChange={d => handleDateChange("startTime", d)}
                                            className="mt-1 block px-4 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm focus:outline-none sm:text-sm w-[90px] text-center text-sm"
                                        />
                                        {/* <span className="mx-3">-</span> */}
                                        {/* Ending Time */}
                                        {/* <ReactDatePicker
                                            showTimeSelect
                                            showTimeSelectOnly
                                            timeIntervals={15}
                                            dateFormat="h:mm aa"
                                            minTime={searchParams.get("startTime") ? new Date(JSON.parse(searchParams.get("startTime") as string)) : undefined}
                                            maxTime={searchParams.get("startTime") ? maxTime : undefined}
                                            selected={searchParams.get("endTime") ? new Date(JSON.parse(searchParams.get("endTime") as string)) : undefined}
                                            onChange={d => handleDateChange("endTime", d)}
                                            className="mt-1 block px-4 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm focus:outline-none sm:text-sm w-[90px] text-center text-sm"
                                        /> */}
                                    </div>
                                </div>
                                {(searchParams.has("date") || searchParams.has("startTime") || searchParams.has("endTime")) &&
                                    <button className="text-sm text-secondary mt-3" onClick={() => clearDateAndTimeFilters(["date", "startTime", "endTime"])}>Clear Date & Time Filters </button>}

                            </div>
                        </Dropdown>
                        <Dropdown label="Location" className="col-span-1 md:col-span-2 lg:col-span-2">
                            <div className="absolute bg-white shadow-md rounded-md w-full min-w-[200px] mt-2 z-20 right-0">
                                {regions?.map(region => {
                                    return <div className="inline-block px-4 py-2 items-center gap-x-3 cursor-pointer hover:bg-gray-100 w-full" onClick={() => updateSelection("regions", region)}>
                                        <input type="checkbox" id={`${region.id}-${region.value}`} className="pointer-events-none" checked={JSON.parse(searchParams.get("regions") ?? "[]").includes(parseInt(region.value))} />
                                        <label htmlFor={`${region.id}-${region.value}`} className="text-sm w-full text-gray-600 ml-4 cursor-pointer pointer-events-none">{region.label}</label>
                                    </div>
                                })}
                            </div>
                        </Dropdown>
                    </div>
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
        </div>
    </Wrapper>
}