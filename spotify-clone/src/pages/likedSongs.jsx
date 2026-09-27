import "./likedSongs.css";

import {
  Heart,
  Play,
} from "lucide-react";


function LikedSongs({
  songs = [],
  onSongSelect,
  onUnlikeSong,
}) {

  return (
    <main className="liked-songs-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="liked-songs-header">

        <div className="liked-songs-icon">
          <Heart
            size={42}
            fill="white"
          />
        </div>

        <div>

          <p className="liked-songs-label">
            PLAYLIST
          </p>

          <h1>
            Liked Songs
          </h1>

          <p className="liked-songs-count">
            {songs.length}{" "}
            {songs.length === 1
              ? "song"
              : "songs"}
          </p>

        </div>

      </div>


      {/* ======================================================
          EMPTY STATE
      ====================================================== */}

      {songs.length === 0 ? (

        <div className="liked-songs-empty">

          <Heart size={50} />

          <h2>
            Songs you like will appear here
          </h2>

          <p>
            Click the heart button on a song
            to add it to your liked songs.
          </p>

        </div>

      ) : (

        <section className="liked-songs-list">

          {songs.map(
            (song, index) => (

              <div
                className="liked-song-row"
                key={song.id}
                onClick={() =>
                  onSongSelect(song)
                }
              >

                {/* ==================================================
                    NUMBER
                ================================================== */}

                <span className="liked-song-number">
                  {index + 1}
                </span>


                {/* ==================================================
                    IMAGE
                ================================================== */}

                <img
                  src={song.image}
                  alt={song.title}
                  className="liked-song-image"
                  onError={(
                    event
                  ) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />


                {/* ==================================================
                    SONG INFO
                ================================================== */}

                <div className="liked-song-info">

                  <h3>
                    {song.title}
                  </h3>

                  <p>
                    {song.artist}
                  </p>

                </div>


                {/* ==================================================
                    UNLIKE BUTTON
                ================================================== */}

                <button
                  type="button"
                  className="liked-song-unlike"
                  title="Remove from Liked Songs"
                  aria-label={`Remove ${song.title} from liked songs`}
                  onClick={(event) => {

                    event.stopPropagation();

                    onUnlikeSong(
                      song
                    );

                  }}
                >

                  <Heart
                    size={20}
                    fill="currentColor"
                  />

                </button>


                {/* ==================================================
                    PLAY BUTTON
                ================================================== */}

                <button
                  type="button"
                  className="liked-song-play"
                  onClick={(event) => {

                    event.stopPropagation();

                    onSongSelect(
                      song
                    );

                  }}
                  aria-label={`Play ${song.title}`}
                >

                  <Play
                    size={19}
                    fill="black"
                  />

                </button>

              </div>

            )
          )}

        </section>

      )}

    </main>
  );
}


export default LikedSongs;