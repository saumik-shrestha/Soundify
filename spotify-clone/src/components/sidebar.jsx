import "./sidebar.css";

import {
  Home,
  Search,
  Library,
  Plus,
  Heart,
  Music2,
  Settings,
} from "lucide-react";


function Sidebar({
  onHome,
  onSearch,
  onLikedSongs,
  onCreatePlaylist,
  onAdmin,
  isAdmin,
  playlists,
  onOpenPlaylist,
  currentPage,
}) {

  return (

    <aside className="sidebar">

      {/* =====================================================
          LOGO
      ===================================================== */}

      <div className="logo">

        <Music2
          size={30}
        />

        <span>
          Soundify
        </span>

      </div>


      {/* =====================================================
          HOME
      ===================================================== */}

      <button
        className={`nav-item ${
          currentPage === "home"
            ? "active"
            : ""
        }`}
        onClick={
          onHome
        }
      >

        <Home
          size={22}
        />

        <span>
          Home
        </span>

      </button>


      {/* =====================================================
          SEARCH
      ===================================================== */}

      <button
        className={`nav-item ${
          currentPage === "search"
            ? "active"
            : ""
        }`}
        onClick={
          onSearch
        }
      >

        <Search
          size={22}
        />

        <span>
          Search
        </span>

      </button>


      {/* =====================================================
          LIBRARY
      ===================================================== */}

      <button
        className="nav-item"
        onClick={
          onHome
        }
      >

        <Library
          size={22}
        />

        <span>
          Your Library
        </span>

      </button>


      <div className="divider"></div>


      {/* =====================================================
          CREATE PLAYLIST
      ===================================================== */}

      <button
        className={`nav-item ${
          currentPage ===
          "create-playlist"
            ? "active"
            : ""
        }`}
        onClick={
          onCreatePlaylist
        }
      >

        <div className="small-icon">

          <Plus
            size={18}
          />

        </div>

        <span>
          Create Playlist
        </span>

      </button>


      {/* =====================================================
          LIKED SONGS
      ===================================================== */}

      <button
        className={`nav-item ${
          currentPage ===
          "liked-songs"
            ? "active"
            : ""
        }`}
        onClick={
          onLikedSongs
        }
      >

        <div className="small-icon liked">

          <Heart
            size={17}
            fill="white"
          />

        </div>

        <span>
          Liked Songs
        </span>

      </button>


      {/* =====================================================
          ADMIN DASHBOARD
      ===================================================== */}

      {isAdmin && (

        <>

          <button
            className={`nav-item ${
              currentPage === "admin"
                ? "active"
                : ""
            }`}
            onClick={
              onAdmin
            }
          >

            <Settings
              size={22}
            />

            <span>
              Admin Dashboard
            </span>

          </button>

        </>

      )}


      <div className="divider"></div>


      {/* =====================================================
          PLAYLISTS
      ===================================================== */}

      <div className="playlists">

        <p>
          My Playlists
        </p>


        {/* =================================================
            USER CREATED PLAYLISTS
        ================================================= */}

        {playlists.length === 0 ? (

          <span className="empty-playlists">

            No playlists yet

          </span>

        ) : (

          playlists.map(
            (playlist) => (

              <button
                key={
                  playlist.id
                }
                className="playlist-link"
                onClick={() =>
                  onOpenPlaylist(
                    playlist
                  )
                }
              >

                {
                  playlist.name
                }

              </button>

            )
          )

        )}

      </div>

    </aside>

  );

}


export default Sidebar;