import "./App.css";

import {
  useEffect,
  useState,
} from "react";

import Sidebar from "./components/sidebar";
import Topbar from "./components/topbar";
import Home from "./pages/home";
import Search from "./pages/search";
import LikedSongs from "./pages/likedSongs";
import Profile from "./pages/profile";
import MusicPlayer from "./components/musicplayer";
import Playlist from "./pages/playlist";

import Login from "./pages/login";
import Register from "./pages/register";
import Admin from "./pages/admin";

import api from "./services/api";

import { getSongs } from "./services/songService";

import {
  getHistory,
  addToHistory,
} from "./services/historyService";

import {
  getPlaylists,
  createPlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  deletePlaylist,
} from "./services/playlistService";

import {
  getLikedSongs,
  likeSong,
  unlikeSong,
} from "./services/likeService";

import { songs as localSongs } from "./data/songs";


// ============================================================
// BACKEND URL
// ============================================================

const BACKEND_URL =
  "http://localhost:5114";


// ============================================================
// APP
// ============================================================

function App() {

  // ============================================================
  // NORMALIZE SONG DATA
  // ============================================================

  const normalizeSong = (song) => {

    if (!song) {
      return null;
    }

    // ----------------------------------------------------------
    // ID
    // ----------------------------------------------------------

    const songId =
      song.id ??
      song.Id;

    // ----------------------------------------------------------
    // BASIC INFORMATION
    // ----------------------------------------------------------

    const songTitle =
      song.title ??
      song.Title ??
      "";

    const songArtist =
      song.artist ??
      song.Artist ??
      "";

    const songAlbum =
      song.album ??
      song.Album ??
      "";

    const songDuration =
      song.durationSeconds ??
      song.DurationSeconds ??
      song.duration ??
      song.Duration ??
      0;

    // ----------------------------------------------------------
    // IMAGE
    // ----------------------------------------------------------

    const rawImage =
      song.image ??
      song.Image ??
      song.imageUrl ??
      song.ImageUrl ??
      "";

    // ----------------------------------------------------------
    // AUDIO
    // ----------------------------------------------------------

    const rawAudio =
      song.audio ??
      song.Audio ??
      song.audioUrl ??
      song.AudioUrl ??
      "";

    // ----------------------------------------------------------
    // FIND LOCAL OLD SONG
    // ----------------------------------------------------------

    const normalizedTitle =
      songTitle
        .trim()
        .toLowerCase();

    const normalizedArtist =
      songArtist
        .trim()
        .toLowerCase();

    const matchingLocalSong =
      localSongs.find(
        (localSong) => {

          const localTitle =
            localSong.title
              ?.trim()
              .toLowerCase() ||
            "";

          const localArtist =
            localSong.artist
              ?.trim()
              .toLowerCase() ||
            "";

          return (
            localTitle ===
              normalizedTitle &&
            localArtist ===
              normalizedArtist
          );
        }
      );

    // ----------------------------------------------------------
    // START WITH LOCAL SONG ASSETS
    // ----------------------------------------------------------

    let image =
      matchingLocalSong?.image ||
      "";

    let audio =
      matchingLocalSong?.audio ||
      "";

    // ----------------------------------------------------------
    // RESOLVE MEDIA URL
    // ----------------------------------------------------------

    const resolveMediaUrl = (
      value
    ) => {

      if (
        !value ||
        typeof value !== "string"
      ) {
        return "";
      }

      const trimmedValue =
        value.trim();

      if (!trimmedValue) {
        return "";
      }

      // Complete URL
      if (
        trimmedValue.startsWith(
          "http://"
        ) ||
        trimmedValue.startsWith(
          "https://"
        )
      ) {
        return trimmedValue;
      }

      // Backend uploaded files
      if (
        trimmedValue.startsWith(
          "/uploads/"
        )
      ) {
        return `${BACKEND_URL}${trimmedValue}`;
      }

      // Frontend public music files
      if (
        trimmedValue.startsWith(
          "/music/"
        )
      ) {
        return trimmedValue;
      }

      // Other backend paths
      if (
        trimmedValue.startsWith("/")
      ) {
        return `${BACKEND_URL}${trimmedValue}`;
      }

      // Relative backend path
      return `${BACKEND_URL}/${trimmedValue}`;
    };

    // ----------------------------------------------------------
    // BACKEND IMAGE
    // ----------------------------------------------------------

    const resolvedImage =
      resolveMediaUrl(
        rawImage
      );

    if (resolvedImage) {
      image =
        resolvedImage;
    }

    // ----------------------------------------------------------
    // BACKEND AUDIO
    // ----------------------------------------------------------

    const resolvedAudio =
      resolveMediaUrl(
        rawAudio
      );

    if (resolvedAudio) {
      audio =
        resolvedAudio;
    }

    // ----------------------------------------------------------
    // FINAL SONG
    // ----------------------------------------------------------

    const normalizedSong = {
      id: songId,
      title: songTitle,
      artist: songArtist,
      album: songAlbum,
      duration: songDuration,
      image,
      audio,
    };

    console.log(
      "NORMALIZED SONG:",
      normalizedSong
    );

    return normalizedSong;
  };


  // ============================================================
  // AUTHENTICATION
  // ============================================================

  const [authPage, setAuthPage] =
    useState("login");

  const [user, setUser] =
    useState(null);

  const [authLoading, setAuthLoading] =
    useState(true);


  // ============================================================
  // CHECK CURRENT USER
  // ============================================================

  useEffect(() => {

    const loadCurrentUser =
      async () => {

        const token =
          localStorage.getItem(
            "soundifyToken"
          );

        if (!token) {

          setUser(null);
          setAuthLoading(false);

          return;
        }

        try {

          const response =
            await api.get(
              "/auth/me"
            );

          console.log(
            "CURRENT USER:",
            response.data
          );

          setUser(
            response.data
          );

        } catch (error) {

          console.error(
            "Failed to load current user:",
            error
          );

          localStorage.removeItem(
            "soundifyToken"
          );

          localStorage.removeItem(
            "soundifyUser"
          );

          setUser(null);

        } finally {

          setAuthLoading(false);

        }
      };

    loadCurrentUser();

  }, []);


  // ============================================================
  // MUSIC
  // ============================================================

  const [songs, setSongs] =
    useState([]);

  const [songsLoading, setSongsLoading] =
    useState(true);

  const [songsError, setSongsError] =
    useState("");

  const [currentSong, setCurrentSong] =
    useState(null);

  const [playing, setPlaying] =
    useState(false);

  const [repeat, setRepeat] =
    useState(false);

  const [shuffle, setShuffle] =
    useState(false);


  // ============================================================
  // PLAYBACK QUEUE
  //
  // This determines what Next / Previous / Shuffle use.
  //
  // Home/Search:
  //     all songs
  //
  // Liked Songs:
  //     liked songs only
  //
  // Playlist:
  //     playlist songs only
  // ============================================================

  const [playbackQueue, setPlaybackQueue] =
    useState([]);


  // ============================================================
  // NAVIGATION
  // ============================================================

  const [currentPage, setCurrentPage] =
    useState("home");

  const [selectedPlaylist, setSelectedPlaylist] =
    useState(null);


  // ============================================================
  // RECENTLY PLAYED
  // ============================================================

  const [recentlyPlayed, setRecentlyPlayed] =
    useState([]);


  // ============================================================
  // PLAYLISTS
  // ============================================================

  const [playlists, setPlaylists] =
    useState([]);

  const [playlistsLoading, setPlaylistsLoading] =
    useState(false);

  const [playlistsError, setPlaylistsError] =
    useState("");


  // ============================================================
  // LIKED SONGS
  // ============================================================

  const [likedSongs, setLikedSongs] =
    useState([]);

  const [likedSongsLoading, setLikedSongsLoading] =
    useState(false);


  // ============================================================
  // LOAD SONGS
  // ============================================================

  useEffect(() => {

    const loadSongs =
      async () => {

        try {

          setSongsLoading(true);
          setSongsError("");

          const data =
            await getSongs();

          console.log(
            "RAW SONGS FROM API:",
            data
          );

          const normalizedSongs =
            data
              .map(normalizeSong)
              .filter(Boolean);

          console.log(
            "NORMALIZED SONGS:",
            normalizedSongs
          );

          setSongs(
            normalizedSongs
          );

          // Default playback queue is all songs.
          setPlaybackQueue(
            normalizedSongs
          );

        } catch (error) {

          console.error(
            "Failed to load songs:",
            error
          );

          setSongsError(
            "Unable to load songs from the server."
          );

        } finally {

          setSongsLoading(false);

        }
      };

    loadSongs();

  }, []);


  // ============================================================
  // LOAD RECENTLY PLAYED
  // ============================================================

  useEffect(() => {

    if (!user) {

      setRecentlyPlayed([]);

      return;
    }

    const loadRecentlyPlayed =
      async () => {

        try {

          const history =
            await getHistory();

          const normalizedHistory =
            history
              .map(normalizeSong)
              .filter(Boolean);

          setRecentlyPlayed(
            normalizedHistory
          );

        } catch (error) {

          console.error(
            "Failed to load recently played:",
            error
          );

          setRecentlyPlayed([]);

        }
      };

    loadRecentlyPlayed();

  }, [user]);


  // ============================================================
  // LOAD PLAYLISTS
  // ============================================================

  useEffect(() => {

    if (!user) {

      setPlaylists([]);
      setSelectedPlaylist(null);
      setPlaylistsError("");

      return;
    }

    const loadPlaylists =
      async () => {

        try {

          setPlaylistsLoading(true);
          setPlaylistsError("");

          const data =
            await getPlaylists();

          setPlaylists(
            data
          );

        } catch (error) {

          console.error(
            "Failed to load playlists:",
            error
          );

          setPlaylistsError(
            error.response?.data?.message ||
            "Unable to load playlists."
          );

          setPlaylists([]);

        } finally {

          setPlaylistsLoading(false);

        }
      };

    loadPlaylists();

  }, [user]);


  // ============================================================
  // LOAD LIKED SONGS
  // ============================================================

  useEffect(() => {

    if (!user) {

      setLikedSongs([]);

      return;
    }

    const loadLikedSongs =
      async () => {

        try {

          setLikedSongsLoading(true);

          const data =
            await getLikedSongs();

          const normalizedLikedSongs =
            data
              .map(normalizeSong)
              .filter(Boolean);

          setLikedSongs(
            normalizedLikedSongs
          );

        } catch (error) {

          console.error(
            "Failed to load liked songs:",
            error
          );

          setLikedSongs([]);

        } finally {

          setLikedSongsLoading(false);

        }
      };

    loadLikedSongs();

  }, [user]);


  // ============================================================
  // LOGIN
  // ============================================================

  const handleLogin =
    (loggedInUser) => {

      setUser(
        loggedInUser
      );

      setCurrentPage(
        "home"
      );

      setSelectedPlaylist(
        null
      );

    };


  // ============================================================
  // REGISTER
  // ============================================================

  const handleRegister =
    (registeredUser) => {

      setUser(
        registeredUser
      );

      setCurrentPage(
        "home"
      );

      setSelectedPlaylist(
        null
      );

    };


  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {

    localStorage.removeItem(
      "soundifyToken"
    );

    localStorage.removeItem(
      "soundifyUser"
    );

    localStorage.removeItem(
      "playlists"
    );

    localStorage.removeItem(
      "recentlyPlayed"
    );

    setUser(null);

    setAuthPage(
      "login"
    );

    setCurrentSong(null);

    setPlaying(false);

    setPlaybackQueue([]);

    setRecentlyPlayed([]);

    setLikedSongs([]);

    setPlaylists([]);

    setSelectedPlaylist(null);

    setCurrentPage(
      "home"
    );
  };


  // ============================================================
  // ADD TO RECENTLY PLAYED
  // ============================================================

  const addToRecentlyPlayed =
    async (song) => {

      if (
        !user ||
        !song?.id
      ) {
        return;
      }

      try {

        await addToHistory(
          song.id
        );

        const history =
          await getHistory();

        const normalizedHistory =
          history
            .map(normalizeSong)
            .filter(Boolean);

        setRecentlyPlayed(
          normalizedHistory
        );

      } catch (error) {

        console.error(
          "Failed to save recently played:",
          error
        );

      }
    };


  // ============================================================
  // PLAY SONG
  //
  // queue is optional.
  //
  // If no queue is supplied:
  //     use all songs.
  //
  // Liked Songs passes:
  //     likedSongs
  //
  // Playlist passes:
  //     playlist.songs
  // ============================================================

  const handleSongSelect =
    (
      song,
      queue = songs
    ) => {

      console.log(
        "SELECTED SONG:",
        song
      );

      if (!song) {
        return;
      }

      // Normalize the selected song.
      const normalizedSelectedSong =
        normalizeSong(song) ||
        song;

      // Normalize the queue.
      const normalizedQueue =
        queue
          .map(normalizeSong)
          .filter(Boolean);

      // If somehow the selected song isn't
      // inside the supplied queue, add it.
      const selectedExists =
        normalizedQueue.some(
          (queueSong) =>
            queueSong.id?.toString() ===
            normalizedSelectedSong.id?.toString()
        );

      const finalQueue =
        selectedExists
          ? normalizedQueue
          : [
              ...normalizedQueue,
              normalizedSelectedSong,
            ];

      console.log(
        "PLAYBACK QUEUE:",
        finalQueue
      );

      console.log(
        "SONG AUDIO:",
        normalizedSelectedSong.audio
      );

      console.log(
        "SONG IMAGE:",
        normalizedSelectedSong.image
      );

      if (
        !normalizedSelectedSong.audio
      ) {

        console.error(
          "This song has no audio URL:",
          normalizedSelectedSong
        );

      }

      // Save the queue FIRST.
      setPlaybackQueue(
        finalQueue
      );

      // Then select the song.
      setCurrentSong(
        normalizedSelectedSong
      );

      setPlaying(
        true
      );

      addToRecentlyPlayed(
        normalizedSelectedSong
      );
    };


  // ============================================================
  // LIKE SONG
  // ============================================================

  const handleLikeSong =
    async (song) => {

      if (
        !user ||
        !song?.id
      ) {
        return;
      }

      try {

        await likeSong(
          song.id
        );

        setLikedSongs(
          (previousSongs) => {

            const alreadyLiked =
              previousSongs.some(
                (likedSong) =>
                  likedSong.id?.toString() ===
                  song.id?.toString()
              );

            if (alreadyLiked) {
              return previousSongs;
            }

            return [
              ...previousSongs,
              song,
            ];
          }
        );

      } catch (error) {

        console.error(
          "Failed to like song:",
          error
        );

      }
    };


  // ============================================================
  // UNLIKE SONG
  // ============================================================

  const handleUnlikeSong =
    async (song) => {

      if (
        !user ||
        !song?.id
      ) {
        return;
      }

      try {

        await unlikeSong(
          song.id
        );

        setLikedSongs(
          (previousSongs) =>
            previousSongs.filter(
              (likedSong) =>
                likedSong.id?.toString() !==
                song.id?.toString()
            )
        );

      } catch (error) {

        console.error(
          "Failed to unlike song:",
          error
        );

      }
    };


  // ============================================================
  // TOGGLE LIKE
  // ============================================================

  const handleToggleLike =
    async (song) => {

      if (
        !song?.id ||
        !user
      ) {
        return;
      }

      const isCurrentlyLiked =
        likedSongs.some(
          (likedSong) =>
            likedSong.id?.toString() ===
            song.id?.toString()
        );

      if (isCurrentlyLiked) {

        await handleUnlikeSong(
          song
        );

      } else {

        await handleLikeSong(
          song
        );

      }
    };


  // ============================================================
  // NEXT SONG
  //
  // IMPORTANT:
  // Uses playbackQueue, NOT songs.
  //
  // Therefore:
  //
  // Home     -> all songs
  // Liked    -> liked songs
  // Playlist -> playlist songs
  // ============================================================

  const handleNext = () => {

    if (
      !currentSong ||
      playbackQueue.length === 0
    ) {
      return;
    }

    // ----------------------------------------------------------
    // SHUFFLE
    // ----------------------------------------------------------

    if (shuffle) {

      const otherSongs =
        playbackQueue.filter(
          (song) =>
            song.id?.toString() !==
            currentSong.id?.toString()
        );

      if (
        otherSongs.length === 0
      ) {
        return;
      }

      const randomIndex =
        Math.floor(
          Math.random() *
          otherSongs.length
        );

      const nextSong =
        otherSongs[randomIndex];

      setCurrentSong(
        nextSong
      );

      setPlaying(
        true
      );

      addToRecentlyPlayed(
        nextSong
      );

      return;
    }

    // ----------------------------------------------------------
    // NORMAL NEXT
    // ----------------------------------------------------------

    const currentIndex =
      playbackQueue.findIndex(
        (song) =>
          song.id?.toString() ===
          currentSong.id?.toString()
      );

    if (
      currentIndex === -1
    ) {
      return;
    }

    const nextIndex =
      (
        currentIndex + 1
      ) %
      playbackQueue.length;

    const nextSong =
      playbackQueue[nextIndex];

    setCurrentSong(
      nextSong
    );

    setPlaying(
      true
    );

    addToRecentlyPlayed(
      nextSong
    );
  };


  // ============================================================
  // PREVIOUS SONG
  //
  // Uses playbackQueue.
  // ============================================================

  const handlePrevious = () => {

    if (
      !currentSong ||
      playbackQueue.length === 0
    ) {
      return;
    }

    const currentIndex =
      playbackQueue.findIndex(
        (song) =>
          song.id?.toString() ===
          currentSong.id?.toString()
      );

    if (
      currentIndex === -1
    ) {
      return;
    }

    const previousIndex =
      (
        currentIndex -
        1 +
        playbackQueue.length
      ) %
      playbackQueue.length;

    const previousSong =
      playbackQueue[
        previousIndex
      ];

    setCurrentSong(
      previousSong
    );

    setPlaying(
      true
    );

    addToRecentlyPlayed(
      previousSong
    );
  };


  // ============================================================
  // SHUFFLE
  //
  // Shuffle stays inside the current queue.
  // ============================================================

  const handleShuffle = () => {

    if (
      playbackQueue.length === 0
    ) {
      setShuffle(
        (previous) =>
          !previous
      );

      return;
    }

    setShuffle(true);

    if (!currentSong) {
      return;
    }

    const otherSongs =
      playbackQueue.filter(
        (song) =>
          song.id?.toString() !==
          currentSong.id?.toString()
      );

    if (
      otherSongs.length === 0
    ) {
      return;
    }

    const randomIndex =
      Math.floor(
        Math.random() *
        otherSongs.length
      );

    const randomSong =
      otherSongs[randomIndex];

    setCurrentSong(
      randomSong
    );

    setPlaying(
      true
    );

    addToRecentlyPlayed(
      randomSong
    );
  };


  // ============================================================
  // REPEAT
  // ============================================================

  const handleRepeat = () => {

    setRepeat(
      (previous) =>
        !previous
    );
  };


  // ============================================================
  // HOME
  // ============================================================

  const handleHome = () => {

    setCurrentPage(
      "home"
    );

    setSelectedPlaylist(
      null
    );
  };


  // ============================================================
  // SEARCH
  // ============================================================

  const handleSearch = () => {

    setCurrentPage(
      "search"
    );

    setSelectedPlaylist(
      null
    );
  };


  // ============================================================
  // LIKED SONGS
  // ============================================================

  const handleLikedSongs = () => {

    setCurrentPage(
      "liked-songs"
    );

    setSelectedPlaylist(
      null
    );
  };


  // ============================================================
  // PROFILE
  // ============================================================

  const handleProfile = () => {

    setCurrentPage(
      "profile"
    );

    setSelectedPlaylist(
      null
    );
  };


  // ============================================================
  // USER UPDATED
  // ============================================================

  const handleUserUpdated =
    (updatedUser) => {

      setUser(
        updatedUser
      );
    };


  // ============================================================
  // CREATE PLAYLIST PAGE
  // ============================================================

  const handleCreatePlaylist = () => {

    setCurrentPage(
      "create-playlist"
    );

    setSelectedPlaylist(
      null
    );
  };


  // ============================================================
  // ADMIN
  // ============================================================

  const handleAdmin = () => {

    setCurrentPage(
      "admin"
    );

    setSelectedPlaylist(
      null
    );
  };


  // ============================================================
  // SAVE PLAYLIST
  // ============================================================

  const handleSavePlaylist =
    async (playlistName) => {

      if (
        !playlistName ||
        !playlistName.trim()
      ) {
        return;
      }

      try {

        setPlaylistsError("");

        const result =
          await createPlaylist({

            name:
              playlistName.trim(),

            description:
              "",

            imageUrl:
              "",

            isPublic:
              true,
          });

        const updatedPlaylists =
          await getPlaylists();

        setPlaylists(
          updatedPlaylists
        );

        const newPlaylist =
          updatedPlaylists.find(
            (playlist) =>
              playlist.id ===
              result.id
          );

        if (newPlaylist) {

          setSelectedPlaylist(
            newPlaylist
          );

        } else {

          setSelectedPlaylist(
            result
          );
        }

        setCurrentPage(
          "playlist"
        );

      } catch (error) {

        console.error(
          "Failed to create playlist:",
          error
        );

        const message =
          error.response?.data?.message ||
          "Unable to create playlist.";

        setPlaylistsError(
          message
        );

        alert(
          message
        );
      }
    };


  // ============================================================
  // OPEN PLAYLIST
  // ============================================================

  const handleOpenPlaylist =
    async (playlist) => {

      try {

        setPlaylistsError("");

        const updatedPlaylists =
          await getPlaylists();

        setPlaylists(
          updatedPlaylists
        );

        const freshPlaylist =
          updatedPlaylists.find(
            (item) =>
              item.id ===
              playlist.id
          );

        if (freshPlaylist) {

          setSelectedPlaylist(
            freshPlaylist
          );

        } else {

          setSelectedPlaylist(
            playlist
          );
        }

        setCurrentPage(
          "playlist"
        );

      } catch (error) {

        console.error(
          "Failed to open playlist:",
          error
        );

        setSelectedPlaylist(
          playlist
        );

        setCurrentPage(
          "playlist"
        );
      }
    };


  // ============================================================
  // ADD SONG TO PLAYLIST
  // ============================================================

  const handleAddSongToPlaylist =
    async (
      playlistId,
      song
    ) => {

      if (!song?.id) {
        return;
      }

      try {

        setPlaylistsError("");

        await addSongToPlaylist(
          playlistId,
          song.id
        );

        const updatedPlaylists =
          await getPlaylists();

        setPlaylists(
          updatedPlaylists
        );

        const updatedSelectedPlaylist =
          updatedPlaylists.find(
            (playlist) =>
              playlist.id ===
              playlistId
          );

        if (
          updatedSelectedPlaylist
        ) {

          setSelectedPlaylist(
            updatedSelectedPlaylist
          );
        }

      } catch (error) {

        console.error(
          "Failed to add song to playlist:",
          error
        );

        const message =
          error.response?.data?.message ||
          "Unable to add song to playlist.";

        setPlaylistsError(
          message
        );

        alert(
          message
        );
      }
    };


  // ============================================================
  // REMOVE SONG FROM PLAYLIST
  // ============================================================

  const handleRemoveSongFromPlaylist =
    async (
      playlistId,
      songId
    ) => {

      try {

        setPlaylistsError("");

        await removeSongFromPlaylist(
          playlistId,
          songId
        );

        const updatedPlaylists =
          await getPlaylists();

        setPlaylists(
          updatedPlaylists
        );

        const updatedSelectedPlaylist =
          updatedPlaylists.find(
            (playlist) =>
              playlist.id ===
              playlistId
          );

        if (
          updatedSelectedPlaylist
        ) {

          setSelectedPlaylist(
            updatedSelectedPlaylist
          );
        }

      } catch (error) {

        console.error(
          "Failed to remove song from playlist:",
          error
        );

        const message =
          error.response?.data?.message ||
          "Unable to remove song from playlist.";

        setPlaylistsError(
          message
        );

        alert(
          message
        );
      }
    };


  // ============================================================
  // DELETE PLAYLIST
  // ============================================================

  const handleDeletePlaylist =
    async (playlistId) => {

      const playlist =
        playlists.find(
          (item) =>
            item.id ===
            playlistId
        );

      const playlistName =
        playlist?.name ||
        "this playlist";

      const confirmed =
        window.confirm(
          `Are you sure you want to delete "${playlistName}"?`
        );

      if (!confirmed) {
        return;
      }

      try {

        setPlaylistsError("");

        await deletePlaylist(
          playlistId
        );

        setPlaylists(
          (previousPlaylists) =>
            previousPlaylists.filter(
              (item) =>
                item.id !==
                playlistId
            )
        );

        setSelectedPlaylist(
          null
        );

        setCurrentPage(
          "home"
        );

      } catch (error) {

        console.error(
          "Failed to delete playlist:",
          error
        );

        const message =
          error.response?.data?.message ||
          "Unable to delete playlist.";

        setPlaylistsError(
          message
        );

        alert(
          message
        );
      }
    };


  // ============================================================
  // AUTH LOADING
  // ============================================================

  if (authLoading) {

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          color: "#fff",
        }}
      >
        Checking login...
      </div>
    );
  }


  // ============================================================
  // AUTH SCREEN
  // ============================================================

  if (!user) {

    if (
      authPage ===
      "register"
    ) {

      return (
        <Register
          onShowLogin={() =>
            setAuthPage(
              "login"
            )
          }
          onRegister={
            handleRegister
          }
        />
      );
    }

    return (
      <Login
        onLogin={
          handleLogin
        }
        onShowRegister={() =>
          setAuthPage(
            "register"
          )
        }
      />
    );
  }


  // ============================================================
  // PAGE RENDERING
  // ============================================================

  const renderPage = () => {

    // ----------------------------------------------------------
    // HOME
    // ----------------------------------------------------------

    if (
      currentPage ===
      "home"
    ) {

      return (
        <>
          {songsLoading && (
            <div
              style={{
                padding: "30px",
                textAlign: "center",
              }}
            >
              Loading songs...
            </div>
          )}

          {songsError && (
            <div
              style={{
                padding: "30px",
                color: "#ff6b6b",
                textAlign: "center",
              }}
            >
              {songsError}
            </div>
          )}

          {!songsLoading &&
            !songsError && (
              <Home
                songs={
                  songs
                }
                onSongSelect={
                  (song) =>
                    handleSongSelect(
                      song,
                      songs
                    )
                }
                onToggleLike={
                  handleToggleLike
                }
                likedSongs={
                  likedSongs
                }
                recentlyPlayed={
                  recentlyPlayed
                }
                user={
                  user
                }
              />
            )}
        </>
      );
    }


    // ----------------------------------------------------------
    // SEARCH
    // ----------------------------------------------------------

    if (
      currentPage ===
      "search"
    ) {

      return (
        <Search
          songs={
            songs
          }
          onSongSelect={
            (song) =>
              handleSongSelect(
                song,
                songs
              )
          }
        />
      );
    }


    // ----------------------------------------------------------
    // LIKED SONGS
    //
    // IMPORTANT:
    // Queue = likedSongs
    // ----------------------------------------------------------

    if (
      currentPage ===
      "liked-songs"
    ) {

      return (
        <LikedSongs
  songs={likedSongs}

  onSongSelect={(song) =>
    handleSongSelect(
      song,
      likedSongs
    )
  }

  onUnlikeSong={
    handleUnlikeSong
  }
/>
      );
    }


    // ----------------------------------------------------------
    // PROFILE
    // ----------------------------------------------------------

    if (
      currentPage ===
      "profile"
    ) {

      return (
        <Profile
          user={
            user
          }
          onUserUpdated={
            handleUserUpdated
          }
        />
      );
    }


    // ----------------------------------------------------------
    // ADMIN
    // ----------------------------------------------------------

    if (
      currentPage ===
      "admin"
    ) {

      return (
        <Admin
          user={
            user
          }
        />
      );
    }


    // ----------------------------------------------------------
    // CREATE PLAYLIST
    // ----------------------------------------------------------

    if (
      currentPage ===
      "create-playlist"
    ) {

      return (
        <div className="create-playlist-page">

          <div className="create-playlist-box">

            <h1>
              Create Playlist
            </h1>

            <p>
              Give your new playlist
              a name.
            </p>

            <input
              type="text"
              placeholder="My Playlist"
              id="playlist-name"
              onKeyDown={(event) => {

                if (
                  event.key ===
                  "Enter"
                ) {

                  handleSavePlaylist(
                    event.target.value
                  );
                }
              }}
            />

            <div className="playlist-form-buttons">

              <button
                className="cancel-playlist"
                onClick={
                  handleHome
                }
              >
                Cancel
              </button>

              <button
                className="save-playlist"
                onClick={() => {

                  const input =
                    document.getElementById(
                      "playlist-name"
                    );

                  if (input) {

                    handleSavePlaylist(
                      input.value
                    );
                  }
                }}
              >
                Create
              </button>

            </div>

          </div>

        </div>
      );
    }


    // ----------------------------------------------------------
    // PLAYLIST
    //
    // IMPORTANT:
    // Playlist component receives a callback that sends
    // playlist.songs as the playback queue.
    // ----------------------------------------------------------

    if (
      currentPage ===
        "playlist" &&
      selectedPlaylist
    ) {

      return (
        <Playlist
          playlist={
            selectedPlaylist
          }

          songs={
            songs
          }

          onSongSelect={
            (song) =>
              handleSongSelect(
                song,
                selectedPlaylist.songs
              )
          }

          onAddSong={
            handleAddSongToPlaylist
          }

          onRemoveSong={
            handleRemoveSongFromPlaylist
          }

          onDeletePlaylist={
            handleDeletePlaylist
          }
        />
      );
    }

    return null;
  };


  // ============================================================
  // MAIN APPLICATION
  // ============================================================

  return (
    <div className="app">

      <div className="main-layout">

        <Sidebar
          onHome={
            handleHome
          }

          onSearch={
            handleSearch
          }

          onLikedSongs={
            handleLikedSongs
          }

          onCreatePlaylist={
            handleCreatePlaylist
          }

          onAdmin={
            handleAdmin
          }

          isAdmin={
            user?.isAdmin === true
          }

          playlists={
            playlists
          }

          onOpenPlaylist={
            handleOpenPlaylist
          }

          currentPage={
            currentPage
          }
        />

        <div className="content">

          <Topbar
            user={
              user
            }

            onProfile={
              handleProfile
            }
          />

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: "10px 20px",
            }}
          >
            <button
              onClick={
                handleLogout
              }
              style={{
                padding:
                  "8px 16px",
                borderRadius:
                  "20px",
                border:
                  "none",
                cursor:
                  "pointer",
              }}
            >
              Log out
            </button>
          </div>

          {playlistsError && (
            <div
              style={{
                margin:
                  "0 20px 10px",
                padding:
                  "10px 14px",
                borderRadius:
                  "8px",
                background:
                  "rgba(255, 80, 80, 0.12)",
                color:
                  "#ff6b6b",
              }}
            >
              {playlistsError}
            </div>
          )}

          {playlistsLoading && (
            <div
              style={{
                padding:
                  "10px 20px",
                opacity:
                  0.7,
              }}
            >
              Loading playlists...
            </div>
          )}

          {renderPage()}

        </div>
      </div>

      <MusicPlayer
        currentSong={
          currentSong
        }

        isPlaying={
          playing
        }

        setIsPlaying={
          setPlaying
        }

        onNext={
          handleNext
        }

        onPrevious={
          handlePrevious
        }

        onShuffle={
          handleShuffle
        }

        shuffle={
          shuffle
        }

        repeat={
          repeat
        }

        onRepeat={
          handleRepeat
        }
      />

    </div>
  );
}

export default App;