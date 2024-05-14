import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";

import "./css/profile.css";
import "./main.css";


ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<HashRouter>
			<Routes>
				<Route index path="/" element={<Home />} />
				<Route path="/profile" element={<Profile />} />
			</Routes>
		</HashRouter>
	</React.StrictMode>
)