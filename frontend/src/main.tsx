import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";

import "./main.css";
import Events from "./pages/Events";
import Event from "./pages/Event";

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<HashRouter>
			<Routes>
				<Route index path="/" element={<Home />} />
				<Route path="/profile" element={<Profile />} />
				<Route path="/events" element={<Events />} />
				<Route path="/events/:id" element={<Event />} />
			</Routes>
		</HashRouter>
	</React.StrictMode>
)