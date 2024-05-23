import { KeyboardEvent, useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import CRM, { ComparisonOperator } from "../../crm";
import EventCard from "../components/EventCard";
import config from "../../../config";
import { IoIosArrowDown } from "react-icons/io";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useSearchParams } from "react-router-dom";

export default function Events() {
    const [events, setEvents] = useState<any[] | null>();
    const [search, setSearch] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
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
            const optionGroupId = response.data[0]["option_group_id"];
            response = await CRM("OptionValue", "get", {
                select: ["label", "value"],
                where: [["option_group_id", "=", optionGroupId]]
            });
            setCategories(response.data);
        })();
    }, []);

    const handleSearch = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key == "Enter") {
            const params: any = {};
            if (search.length) params.search = search;
            setSearch("");
            setSearchParams(params);
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
        if (search) where.push(["subject", "CONTAINS", search])

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
        const events = response.data;
        setEvents(events);
    }

    const [showDropmenu, setShowDropmenu] = useState(false);
    const handleDropmenu = () => setShowDropmenu(!showDropmenu);
    const updateSelectedCategories = (categoryId: number) => {
        if (selectedCategories.includes(categoryId)) setSelectedCategories(selectedCategories.filter(c => c != categoryId));
        else {
            const newSelectedCategories = [...selectedCategories];
            newSelectedCategories.push(categoryId);
            setSelectedCategories(newSelectedCategories);
        }
    }

    useEffect(() => console.log(selectedCategories), [selectedCategories]);

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
                        {/* Category */}
                        <div className="relative w-full lg:w-[200px]">
                            {/* Button */}
                            <button className="bg-secondary text-white flex justify-between px-4 py-2 rounded-md items-center w-full" onClick={handleDropmenu}>
                                <span>Category</span>
                                <IoIosArrowDown />
                            </button>
                            {/* Dropmenu */}
                            {showDropmenu && <div className="absolute bg-white shadow-md rounded-md w-full mt-2 z-20">
                                {categories?.map(category => {
                                    return <div className="inline-block px-4 py-2 items-center gap-x-3 cursor-pointer hover:bg-gray-100 w-full" onClick={() => updateSelectedCategories(category.id)}>
                                        <input type="checkbox" id={`${category.id}-${category.value}`} checked={selectedCategories.includes(category.id)} className="pointer-events-none" />
                                        <label htmlFor={`${category.id}-${category.value}`} className="text-sm w-full text-gray-600 ml-4 cursor-pointer pointer-events-none">{category.label}</label>
                                    </div>
                                })}
                            </div>}
                        </div>

                        {/* Date and Time is Cringe */}
                        <button className="bg-secondary text-white flex justify-between px-4 py-2 rounded-md items-center w-full lg:w-[200px]">
                            <span>Date & Time</span>
                            <IoIosArrowDown />
                        </button>
                        {/* This is even more cringe */}
                        <button className="bg-secondary text-white flex justify-between px-4 py-2 rounded-md items-center w-full lg:w-[200px]">
                            <span>Location</span>
                            <IoIosArrowDown />
                        </button>
                    </div>
                </div>
                {/* Event cards */}
                {!events ? <>
                    <h1>Loading events...</h1>
                </> : <>
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