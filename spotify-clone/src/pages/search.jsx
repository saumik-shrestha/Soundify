import "./search.css";

import {
  Search as SearchIcon,
  Play,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";


function Search({
  songs = [],
  onSongSelect,
}) {

  const [query, setQuery] =
    useState("");


  // ============================================================
  // SEARCH SONGS
  // ============================================================

  const filteredSongs =
    useMemo(() => {

      const searchText =
        query
          .trim()
          .toLowerCase();

      if (!searchText) {
        return [];
      }


      return songs.filter(
        (song) => {

          const title =
            song.title
              ?.toLowerCase() ||
            "";

          const artist =
            song.artist
              ?.toLowerCase() ||
            "";

          const album =
            song.album
              ?.toLowerCase() ||
            "";


          return (
            title.includes(searchText) ||
            artist.includes(searchText) ||
            album.includes(searchText)
          );

        }
      );

    }, [songs, query]);


  return (

    <main className="search-page">

      {/* =====================================================
          SEARCH HEADER
      ===================================================== */}

      <div className="search-header">

        <h1>
          Search
        </h1>


        <div className="search-input-wrapper">

          <SearchIcon
            size={21}
            className="search-input-icon"
          />


          <input
            type="text"
            placeholder="What do you want to listen to?"
            value={query}
            onChange={(event) =>
              setQuery(
                event.target.value
              )
            }
            autoFocus
          />

        </div>

      </div>


      {/* =====================================================
          NO SEARCH YET
      ===================================================== */}

      {!query.trim() && (

        <div className="search-empty">

          <SearchIcon
            size={52}
          />

          <h2>
            Search for music
          </h2>

          <p>
            Find songs, artists, and albums.
          </p>

        </div>

      )}


      {/* =====================================================
          NO RESULTS
      ===================================================== */}

      {query.trim() &&
        filteredSongs.length === 0 && (

          <div className="search-empty">

            <SearchIcon
              size={52}
            />

            <h2>
              No results found
            </h2>

            <p>
              We couldn't find anything
              matching "{query}".
            </p>

          </div>

        )}


      {/* =====================================================
          RESULTS
      ===================================================== */}

      {filteredSongs.length > 0 && (

        <section className="search-results">

          <h2>
            Songs
          </h2>


          <div className="search-grid">

            {filteredSongs.map(
              (song) => (

                <div
                  className="search-card"
                  key={song.id}
                  onClick={() =>
                    onSongSelect(song)
                  }
                >

                  <div className="search-image-wrapper">

                    <img
                      src={song.image}
                      alt={song.title}
                      className="search-image"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />


                    <button
                      type="button"
                      className="search-play"
                      onClick={(event) => {

                        event.stopPropagation();

                        onSongSelect(song);

                      }}
                      aria-label={
                        `Play ${song.title}`
                      }
                    >

                      <Play
                        size={20}
                        fill="black"
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

      )}

    </main>

  );

}


export default Search;