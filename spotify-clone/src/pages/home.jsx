import "./home.css";
import { useState } from "react";
import {
  Play,
  Heart,
} from "lucide-react";

function Home({
  songs = [],
  onSongSelect,
  onToggleLike,
  likedSongs = [],
  recentlyPlayed = [],
  user,
}) {
  const [showAllRecent, setShowAllRecent] =
    useState(false);

  const [showAllMadeForYou, setShowAllMadeForYou] =
    useState(false);

  const userName =
    user?.displayName ||
    user?.username ||
    "there";


  const isSongLiked = (songId) => {
    return likedSongs.some(
      (song) =>
        song.id?.toString() ===
        songId?.toString()
    );
  };


  const handleLikeClick = (
    event,
    song
  ) => {
    event.stopPropagation();

    if (onToggleLike) {
      onToggleLike(song);
    }
  };


  return (
    <main className="home">

      <h1>
        Good morning, {userName}
      </h1>


      {/* =====================================================
          QUICK PLAYLISTS
      ===================================================== */}

      <div className="quick-grid">

        {songs.slice(0, 4).map(
          (song) => (

            <div
              className="quick-card"
              key={song.id}
            >

              <img
                src={song.image}
                alt={song.title}
                className="quick-image"
                onError={(event) => {
                  event.currentTarget.style.display =
                    "none";
                }}
              />

              <span>
                {song.title}
              </span>


              <button
                type="button"
                className="quick-play"
                onClick={() =>
                  onSongSelect(song)
                }
              >
                <Play
                  size={18}
                  fill="black"
                />
              </button>

            </div>

          )
        )}

      </div>


      {/* =====================================================
          RECENTLY PLAYED
      ===================================================== */}

      <section className="music-section">

        <div className="section-title">

          <h2>
            Recently played
          </h2>


          {recentlyPlayed.length > 4 && (

            <button
              type="button"
              className="show-all-btn"
              onClick={() =>
                setShowAllRecent(
                  (previous) =>
                    !previous
                )
              }
            >
              {showAllRecent
                ? "Show less"
                : "Show all"}
            </button>

          )}

        </div>


        {recentlyPlayed.length === 0 ? (

          <p className="empty-message">
            You haven't played any songs yet.
          </p>

        ) : (

          <div className="music-grid">

            {(showAllRecent
              ? recentlyPlayed
              : recentlyPlayed.slice(0, 4)
            ).map(
              (song) => (

                <div
                  className="music-card"
                  key={song.id}
                  onClick={() =>
                    onSongSelect(song)
                  }
                >

                  <div className="home-album-wrapper">

                    <img
                      src={song.image}
                      alt={song.title}
                      className="album-image"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />


                    {/* LIKE BUTTON */}

                    <button
                      type="button"
                      className={`home-like-button ${
                        isSongLiked(song.id)
                          ? "liked"
                          : ""
                      }`}
                      onClick={(event) =>
                        handleLikeClick(
                          event,
                          song
                        )
                      }
                      aria-label={
                        isSongLiked(song.id)
                          ? `Unlike ${song.title}`
                          : `Like ${song.title}`
                      }
                    >

                      <Heart
                        size={20}
                        fill={
                          isSongLiked(song.id)
                            ? "currentColor"
                            : "none"
                        }
                      />

                    </button>

                  </div>


                  <h3>
                    {song.title}
                  </h3>

                  <p>
                    {song.artist}
                  </p>

                </div>

              )
            )}

          </div>

        )}

      </section>


      {/* =====================================================
          MADE FOR YOU
      ===================================================== */}

      <section className="music-section">

        <div className="section-title">

          <h2>
            Made for you
          </h2>


          {songs.length > 4 && (

            <button
              type="button"
              className="show-all-btn"
              onClick={() =>
                setShowAllMadeForYou(
                  (previous) =>
                    !previous
                )
              }
            >
              {showAllMadeForYou
                ? "Show less"
                : "Show all"}
            </button>

          )}

        </div>


        <div className="music-grid">

          {(showAllMadeForYou
            ? songs
            : songs.slice(0, 4)
          ).map(
            (song) => (

              <div
                className="music-card"
                key={song.id}
                onClick={() =>
                  onSongSelect(song)
                }
              >

                <div className="home-album-wrapper">

                  <img
                    src={song.image}
                    alt={song.title}
                    className="album-image"
                    onError={(event) => {
                      event.currentTarget.style.display =
                        "none";
                    }}
                  />


                  {/* LIKE BUTTON */}

                  <button
                    type="button"
                    className={`home-like-button ${
                      isSongLiked(song.id)
                        ? "liked"
                        : ""
                    }`}
                    onClick={(event) =>
                      handleLikeClick(
                        event,
                        song
                      )
                    }
                    aria-label={
                      isSongLiked(song.id)
                        ? `Unlike ${song.title}`
                        : `Like ${song.title}`
                    }
                  >

                    <Heart
                      size={20}
                      fill={
                        isSongLiked(song.id)
                          ? "currentColor"
                          : "none"
                      }
                    />

                  </button>

                </div>


                <h3>
                  {song.title}
                </h3>

                <p>
                  {song.artist}
                </p>

              </div>

            )
          )}

        </div>

      </section>

    </main>
  );
}

export default Home;