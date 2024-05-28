import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";
import { GrView } from "react-icons/gr";
import { AiOutlineStop } from "react-icons/ai";

interface Event {
  id: number;
  name: string;
  formattedDateTime: string;
  status: string;
  location: string;
  eventId: number;
}

interface EventStatusProps {
  events: Event[];
  openCancelModal: (registrationId: number) => void;
}

export default function EventStatus({ events, openCancelModal }: EventStatusProps) {
  const statusStyles: { [key: string]: string } = {
    "Upcoming": "bg-[#FFB656] text-white",
    "No Show": "bg-gray-400 text-white",
    "Cancelled": "bg-[#F26A6A] text-white",
    "Completed": "bg-[#7BCF72] text-white",
    "Cancelled By Organiser": "bg-gray-200 text-[#F26A6A]",
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const eventsPerPage = 5;

  useEffect(() => {
    const handleScroll = () => {
      setOpenMenuIndex(null);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [openMenuIndex]);

  // Calculate the total number of pages
  const totalPages = Math.ceil(events.length / eventsPerPage);

  // Get the events to display on the current page
  const currentEvents = events.slice(
    (currentPage - 1) * eventsPerPage,
    currentPage * eventsPerPage
  );

  // Handler for the previous button
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handler for the next button
  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Toggle menu visibility
  const toggleMenu = (index: number) => {
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  const navigate = useNavigate();

  return (
    <div className="mt-5 rounded-lg">
      <h2 className="text-3xl font-semibold text-black mt-5 mb-5">Volunteering Event Status</h2>
      <div className="border-white rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-white">
            <tr>
              <th className="px-6 py-5 text-left text-xl font-semibold text-black w-3/12">Event Name</th>
              <th className="px-6 py-5 text-left text-xl font-semibold text-black w-3/12">Date & Time</th>
              <th className="px-6 py-5 text-left text-xl font-semibold text-black w-2/12">Status</th>
              <th className="px-6 py-5 text-left text-xl font-semibold text-black w-3/12">Location</th>
              <th className="px-6 py-5 text-left text-xl font-semibold text-black w-1/12">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentEvents.map((event, index) => (
              <tr key={index} className={`${event.status === "Cancelled By Organiser" ? 'bg-gray-200' : ''}`}>
                <td className={`px-3 text-lg py-4 whitespace-nowrap pl-6 ${event.status === "Cancelled By Organiser" ? 'text-gray-400' : ''}`}>{event.name}</td>
                <td className={`px-3 text-lg py-4 whitespace-nowrap pl-6 ${event.status === "Cancelled By Organiser" ? 'text-gray-400' : ''}`}>{event.formattedDateTime}</td>
                <td className={`px-3 text-lg py-4 whitespace-nowrap pl-6 ${event.status === "Cancelled By Organiser" ? 'font-black' : ''}`}>
                  <span className={`flex items-center justify-center px-4 text-lg leading-8 font-semibold rounded-md w-[120px] ${statusStyles[event.status]}`}>
                    {event.status}
                  </span>
                </td>
                <td className={`px-3 text-lg py-4 whitespace-nowrap pl-6 ${event.status === "Cancelled By Organiser" ? 'text-gray-400' : ''}`}>{event.location}</td>
                <td className="px-3 text-lg py-4 whitespace-nowrap relative">
                  <button
                    className={`text-gray-500 hover:text-gray-900 transition-transform transform ${openMenuIndex === index ? 'rotate-[-45deg] translate-y-3' : ''}`}
                    style={{ transformOrigin: 'center' }}
                    onClick={() => toggleMenu(index)}
                  >
                    <BsThreeDotsVertical className="h-8 w-8 ml-8 mt-2" />
                  </button>
                  {openMenuIndex === index && (
                    <div
                      className={`absolute right-0 w-40 bg-white shadow-lg rounded-md z-50 ${index >= currentEvents.length - 2 ? 'bottom-full mb-2' : 'top-full mt-2'
                        }`}
                    >
                      <ul>
                        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center" onClick={() => navigate(`/events/${event.eventId}`)}>
                          <GrView className="mr-2" /> View
                        </li>
                        <li
                          className={`px-4 py-2 flex items-center ${event.status === "Completed" || event.status === "Cancelled" || event.status === "Cancelled By Organiser"
                            ? "text-gray-400 cursor-not-allowed"
                            : "hover:bg-gray-100 cursor-pointer"
                            }`}
                          onClick={() => {
                            if (event.status !== "Completed" && event.status !== "Cancelled" && event.status !== "Cancelled By Organiser") {
                              openCancelModal(event.id);
                            }
                          }}
                        >
                          <AiOutlineStop className="mr-2 text-black" /> Cancel
                        </li>
                      </ul>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-lg text-gray-500">
          Showing {((currentPage - 1) * eventsPerPage) + 1} to {Math.min(currentPage * eventsPerPage, events.length)} of {events.length} entries
        </span>
        <div className="flex items-center space-x-2">
          <button
            className={`px-2 py-4 text-3xl font-medium rounded ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:text-black'}`}
            onClick={handlePrevious}
            disabled={currentPage === 1}
          >
            &laquo;
          </button>
          <span className="text-lg font-medium mt-1 text-gray-700">{currentPage}</span>
          <button
            className={`px-2 py-4 text-3xl font-medium rounded ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:text-black'}`}
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            &raquo;
          </button>
        </div>
      </div>
    </div>
  );
}
