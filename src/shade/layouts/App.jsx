import React, { useEffect } from "react";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import Footer from "../Footer/Footer";
import Switcher from "../Switcher/Switcher";
import RightSidebar from "../RightSidebar/RightSidebar";
import { Outlet } from "react-router-dom";
import TabToTop from "../TabToTop/TabToTop";
import { fetchPermission } from "../../helpers/fetchPermission";
import { getStorage } from "../../helpers/utility";


export default function App() {
  const DESKTOP_BREAKPOINT = 992;

  useEffect(() => {
    document.body.classList.add("ltr", "main-body", "app", "sidebar-mini");
    document.body.classList.remove("error-page1", "bg-primary");
  }, []);

  useEffect(() => {
    const loginInfo = getStorage("login_info");
    if (!loginInfo) return;

    fetchPermission().catch(() => {});
  }, []);

  useEffect(() => {
    const applyLayoutForViewport = (isMobile, resetSidebarState = false) => {
      if (isMobile) {
        document.body.classList.add("sidebar-gone");
        document.body.classList.remove("sidenav-toggled");
        document.body.classList.remove("sidenav-toggled-open");
        return;
      }

      document.body.classList.remove("sidebar-gone");
      document.body.classList.remove("sidenav-toggled-open");

      // Keep desktop open by default.
      if (resetSidebarState) {
        document.body.classList.remove("sidenav-toggled");
      }
    };

    let wasMobile = window.innerWidth < DESKTOP_BREAKPOINT;
    applyLayoutForViewport(wasMobile, true);

    const handleResize = () => {
      const isMobile = window.innerWidth < DESKTOP_BREAKPOINT;
      if (isMobile !== wasMobile) {
        applyLayoutForViewport(isMobile, true);
        wasMobile = isMobile;
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const responsiveSidebarclose = () => {
    //leftsidemenu
    if (window.innerWidth < DESKTOP_BREAKPOINT) {
      document.body.classList.remove("sidenav-toggled");
      document.body.classList.remove("sidenav-toggled-open");
    }
    //rightsidebar
    document.querySelector(".sidebar-right")?.classList.remove("sidebar-open");
    //swichermainright
    const switcher = document.querySelector(".demo_changer");
    switcher?.classList.remove("active");
    if (switcher) {
      switcher.style.right = "-270px";
    }
  };

  return (
    <React.Fragment>
          <div className="horizontalMenucontainer">
            {/* <TabToTop /> */}
            <div className="page">
              <div className="open">
                <Header />
                <Sidebar />
              </div>
              <div className="main-content app-content pt-0"  onClick={() => {
                      responsiveSidebarclose();
                    }}>
                <div className="side-app">
                  <div
                    className="main-container container-fluid"
                   
                  >
                    <Outlet />
                  </div>
                </div>
              </div>
              <RightSidebar/>
              <Switcher />
              <Footer />
            </div>
          </div>
    </React.Fragment>
  );
}

