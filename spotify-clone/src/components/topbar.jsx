import "./topbar.css";

import {
  ChevronLeft,
  ChevronRight,
  Bell,
  User,
} from "lucide-react";


function Topbar({
  user,
  onProfile,
}) {

  const userName =
    user?.displayName ||
    user?.username ||
    "User";


  return (

    <header className="topbar">

      <div className="navigation-buttons">

        <button
          type="button"
        >
          <ChevronLeft
            size={20}
          />
        </button>

        <button
          type="button"
        >
          <ChevronRight
            size={20}
          />
        </button>

      </div>


      <div className="topbar-right">

        <button
          type="button"
          className="bell-button"
        >
          <Bell
            size={20}
          />
        </button>


        <button
          type="button"
          className="profile"
          onClick={onProfile}
          aria-label="Open profile"
        >

          <div className="profile-icon">

            <User
              size={17}
            />

          </div>

          <span>
            {userName}
          </span>

        </button>

      </div>

    </header>

  );

}


export default Topbar;