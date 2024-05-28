import EventCard from "../components/EventCard";
import { useNavigate } from "react-router-dom";


interface Event {
  name: string,
  dateTime: string,
  status: string,
  location: string,
}

interface UpcomingEventsProps {
  events: Event[];
}

export default function UpcomingEvents({ events }: UpcomingEventsProps) {
  const navigate = useNavigate();

  return (
    <div className="mt-8 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold">Upcoming Events!</h2>
        <a className="text-blue-500 hover:text-blue-700 text-lg font-medium cursor-pointer" onClick={()=>{navigate('/events')}}>View All Events &gt;</a>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {events.map((event: any) => <EventCard className="flex justify-center" event={event} />)}
      </div>
      
      {/* <div className="grid grid-cols-1 md:grid-cols-3 ml-2 gap-4">
        {events.map((event, index) => (
          <div key={index} className="p-6 border border-gray-200 rounded-lg shadow-md bg-white flex flex-col h-full w-full md:w-[40rem] md:h-[40rem]">
            <img src={event.imageUrl} alt="Event" className="w-full h-[17rem] object-cover rounded-md" />
            <div className="mt-6 flex-grow">
              <h5 className="text-3xl font-semibold">{event.name}</h5>
              <p className="text-2xl text-gray-600 flex items-center mt-4">
                <CiCalendar className="w-10 h-10 mr-3 text-[#5171B4] mb-1" />
                {event.dateTime}
              </p>
              <p className="text-2xl text-gray-600 flex items-center mt-4">
                <CiLocationOn className="w-10 h-10 mr-3 text-[#5171B4]" />
                {event.location}
              </p>
              <p className="text-2xl text-gray-600 flex items-center mt-4">
                <IoPeopleOutline className="w-10 h-10 mr-3 text-[#5171B4]" />
                {event.participants} out of {event.capacity} have joined
              </p>
            </div>
            <button className="mt-6 w-full text-xl text-white bg-[#5A71B4] hover:bg-[#4a5c94] font-medium py-4 rounded-md">
              Read More
            </button>
          </div>
        ))}
      </div> */}
    </div>
  );
};
