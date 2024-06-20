interface DashboardStatsProps {
    hours: number,
    events: number,
}

export default function DashboardStats(props: DashboardStatsProps) {
    return (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="relative bg-white p-6 rounded-lg shadow-md flex flex-col min-h-[120px]">
                <div className="absolute left-0 top-0 bottom-0 w-3 rounded-tl-lg rounded-bl-lg" style={{ backgroundColor: "#A9B7E0" }}></div>
                <div className="text-xl font-bold text-black-700 mb-2 mt-2 text-left pl-4">Number of Hours Volunteered</div>
                <div className="text-4xl font-semibold text-black flex justify-center items-center flex-grow">{props.hours}</div>
            </div>
            <div className="relative bg-white p-6 rounded-lg shadow-md flex flex-col min-h-[120px]">
                <div className="absolute left-0 top-0 bottom-0 w-3 rounded-tl-lg rounded-bl-lg" style={{ backgroundColor: "#A9B7E0" }}></div>
                <div className="text-xl font-bold text-black-700 mb-2 mt-2 text-left pl-4">Volunteering Events Participated</div>
                <div className="text-4xl font-semibold text-black flex justify-center items-center flex-grow">{props.events}</div>
            </div>
        </div>
    );
};
