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
        <a className="text-blue-500 hover:text-blue-700 text-lg font-medium cursor-pointer" onClick={() => { navigate('/events') }}>View All Events &gt;</a>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {events.length > 0 ? events.map((event: any) => <EventCard className="flex justify-center" event={event} />) : <p className="text-lg text-gray-500">Looks like there aren't any upcoming events</p>}
      </div>
    </div>
  );
};
