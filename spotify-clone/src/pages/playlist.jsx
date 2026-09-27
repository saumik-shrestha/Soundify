import "./createplaylist.css";

import {
  useState,
} from "react";

import {
  Play,
  Plus,
  Trash2,
  X,
} from "lucide-react";


function Playlist({
  playlist,
  songs,
  onSongSelect,
  onAddSong,
  onRemoveSong,
  onDeletePlaylist,
}) {

  const [showSongs, setShowSongs] =
    useState(false);


  // ============================================================
  // PLAY ENTIRE PLAYLIST
  // ============================================================

  const handlePlayPlaylist = () => {

    if (
      !playlist?.songs ||
      playlist.songs.length === 0
    ) {
      return;
    }

    // App.jsx receives this song and knows
    // that this component is the playlist.
    //
    // App.jsx then uses playlist.songs
    // as the playback queue.

    onSongSelect(
      playlist.songs[0]
    );
  };


  return (
    <main className="playlist-page">


      {/* ======================================================
          PLAYLIST HEADER
      ====================================================== */}

      <section className="playlist-header">

        <div className="playlist-cover">
          <MusicIcon />
        </div>

        <div className="playlist-details">

          <span>
            PLAYLIST
          </span>

          <h1>
            {playlist.name}
          </h1>

          <p>
            {playlist.songs.length}{" "}
            {playlist.songs.length === 1
              ? "song"
              : "songs"}
          </p>

        </div>

      </section>


      {/* ======================================================
          PLAYLIST CONTROLS
      ====================================================== */}

      <div className="playlist-controls">

        <button
          type="button"
          className="playlist-play-button"
          onClick={
            handlePlayPlaylist
          }
          disabled={
            playlist.songs.length === 0
          }
          title="Play playlist"
        >
          <Play
            size={22}
            fill="black"
          />
        </button>


        <button
          type="button"
          className="delete-playlist-button"
          onClick={() =>
            onDeletePlaylist(
              playlist.id
            )
          }
          title="Delete playlist"
        >
          <Trash2
            size={20}
          />
        </button>

      </div>


      {/* ======================================================
          PLAYLIST SONGS
      ====================================================== */}

      <section className="playlist-songs">

        <h2>
          Songs in this playlist
        </h2>


        {playlist.songs.length === 0 ? (

          <div className="empty-playlist">

            <h3>
              This playlist is empty
            </h3>

            <p>
              Add songs from the list below.
            </p>

          </div>

        ) : (

          playlist.songs.map(
            (song, index) => (

              <div
                className="playlist-song"
                key={song.id}
                onClick={() =>
                  onSongSelect(
                    song
                  )
                }
              >

                {/* SONG NUMBER */}

                <span className="song-number">
                  {index + 1}
                </span>


                {/* COVER */}

                <img
                  src={song.image}
                  alt={song.title}
                  onError={(
                    event
                  ) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />


                {/* SONG INFO */}

                <div className="playlist-song-info">

                  <h3>
                    {song.title}
                  </h3>

                  <p>
                    {song.artist}
                  </p>

                </div>


                {/* PLAY BUTTON */}

                <button
                  type="button"
                  className="playlist-song-play"
                  onClick={(
                    event
                  ) => {

                    event.stopPropagation();

                    onSongSelect(
                      song
                    );
                  }}
                  title={`Play ${song.title}`}
                >

                  <Play
                    size={18}
                    fill="white"
                  />

                </button>


                {/* REMOVE BUTTON */}

                <button
                  type="button"
                  className="playlist-song-remove"
                  title="Remove from playlist"
                  onClick={(
                    event
                  ) => {

                    event.stopPropagation();

                    onRemoveSong(
                      playlist.id,
                      song.id
                    );
                  }}
                >

                  <X
                    size={18}
                  />

                </button>

              </div>

            )
          )

        )}

      </section>


      {/* ======================================================
          ADD SONGS
      ====================================================== */}

      <section className="add-songs-section">

        <div className="add-songs-title">

          <div>

            <h2>
              Add songs
            </h2>

            <p>
              Choose songs to add to your playlist.
            </p>

          </div>


          <button
            type="button"
            className="show-songs-button"
            onClick={() =>
              setShowSongs(
                (previous) =>
                  !previous
              )
            }
          >

            {showSongs
              ? "Hide"
              : "Show songs"}

          </button>

        </div>


        {showSongs && (

          <div className="available-songs">

            {songs.map(
              (song) => {

                const alreadyAdded =
                  playlist.songs.some(
                    (item) =>
                      item.id?.toString() ===
                      song.id?.toString()
                  );

                return (

                  <div
                    className="available-song"
                    key={song.id}
                  >

                    <img
                      src={song.image}
                      alt={song.title}
                      onError={(
                        event
                      ) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />


                    <div>

                      <h3>
                        {song.title}
                      </h3>

                      <p>
                        {song.artist}
                      </p>

                    </div>


                    <button
                      type="button"
                      className="add-song-button"
                      disabled={
                        alreadyAdded
                      }
                      onClick={() =>
                        onAddSong(
                          playlist.id,
                          song
                        )
                      }
                    >

                      {alreadyAdded ? (

                        "Added"

                      ) : (

                        <>
                          <Plus
                            size={17}
                          />

                          Add
                        </>

                      )}

                    </button>

                  </div>

                );
              }
            )}

          </div>

        )}

      </section>

    </main>
  );
}


// ============================================================
// PLAYLIST ICON
// ============================================================

function MusicIcon() {

  return (
    <div className="playlist-music-icon">
      ♪
    </div>
  );
}


export default Playlist;