import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "../styles.css";
import { Admin, CmsRuntime } from "../admin/Admin.jsx";
import {
  About,
  Contacts,
  Home,
  Products,
  Production,
  Quality,
} from "../pages/SitePages.jsx";

function App() {
  const getRoute = () => window.location.hash.slice(1) || "/";
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const updateRoute = () => setRoute(getRoute());
    window.addEventListener("hashchange", updateRoute);
    window.addEventListener("popstate", updateRoute);
    return () => {
      window.removeEventListener("hashchange", updateRoute);
      window.removeEventListener("popstate", updateRoute);
    };
  }, []);
  if (route === "/admin") return <Admin />;

  const page =
    route === "/about" ? (
      <About />
    ) : route === "/production" ? (
      <Production />
    ) : route === "/quality" ? (
      <Quality />
    ) : route === "/products" ? (
      <Products />
    ) : route === "/contacts" ? (
      <Contacts />
    ) : (
      <Home />
    );

  return (
    <>
      <React.Fragment key={route}>{page}</React.Fragment>
      <CmsRuntime route={route} />
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);
