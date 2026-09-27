import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Volume2,
  Heart,
  Music2,
} from "lucide-react";

import "./musicplayer.css";

function MusicPlayer({
  currentSong,
  isPlaying,
  setIsPlaying,
  onNext,
  onPrevious,
  onShuffle,
  shuffle,
  repeat,
  onRepeat,
}) {
  const audioRef = useRef(null);

  const [currentTime, setCurrentTime] =
    useState(0);

  const [duration, setDuration] =
    useState(0);

  const [volume, setVolume] =
    useState(1);

  // ============================================================
  // DEBUG
  // ============================================================

  useEffect(() => {
    console.log("MUSIC PLAYER STATE:", {
      song: currentSong?.title,
      songId: currentSong?.id,
      audio: currentSong?.audio,
      isPlaying,
    });
  }, [
    currentSong,
    isPlaying,
  ]);

  // ============================================================
  // LOAD SONG
  // ============================================================

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !currentSong) {
      return;
    }

    const audioUrl =
      currentSong.audio;

    if (!audioUrl) {
      console.error(
        "CURRENT SONG HAS NO AUDIO URL:",
        currentSong
      );

      setIsPlaying(false);
      return;
    }

    console.log(
      "LOADING SONG:",
      currentSong.title
    );

    console.log(
      "AUDIO URL:",
      audioUrl
    );

    audio.pause();

    audio.currentTime = 0;

    audio.src = audioUrl;

    setCurrentTime(0);

    setDuration(0);

    audio.load();

    // If selecting a song while the player
    // should be playing, start it.
    if (isPlaying) {
      const startPlayback =
        async () => {
          try {
            await audio.play();

            console.log(
              "PLAY SUCCESS:",
              audioUrl
            );
          } catch (error) {
            console.error(
              "PLAY ERROR:",
              error
            );

            console.error(
              "PLAY ERROR NAME:",
              error?.name
            );

            console.error(
              "PLAY ERROR MESSAGE:",
              error?.message
            );

            setIsPlaying(false);
          }
        };

      startPlayback();
    }

    return () => {
      audio.pause();
    };
  }, [
    currentSong,
  ]);

  // ============================================================
  // PLAY / PAUSE
  // ============================================================

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !currentSong) {
      return;
    }

    if (isPlaying) {
      console.log(
        "PLAY STATE: true"
      );

      const playAudio =
        async () => {
          try {
            await audio.play();

            console.log(
              "AUDIO PLAYING:",
              audio.src
            );
          } catch (error) {
            console.error(
              "AUDIO PLAY ERROR:",
              error
            );

            console.error(
              "ERROR NAME:",
              error?.name
            );

            console.error(
              "ERROR MESSAGE:",
              error?.message
            );

            setIsPlaying(false);
          }
        };

      playAudio();
    } else {
      console.log(
        "PLAY STATE: false"
      );

      audio.pause();
    }
  }, [
    isPlaying,
    currentSong,
  ]);

  // ============================================================
  // AUDIO EVENTS
  // ============================================================

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const handleTimeUpdate = () => {
      setCurrentTime(
        audio.currentTime
      );
    };

    const handleLoadedMetadata = () => {
      console.log(
        "AUDIO METADATA LOADED:",
        audio.duration
      );

      setDuration(
        audio.duration
      );
    };

    const handleCanPlay = () => {
      console.log(
        "AUDIO CAN PLAY:",
        audio.src
      );
    };

    const handlePlaying = () => {
      console.log(
        "AUDIO PLAYING EVENT:",
        audio.src
      );
    };

    const handlePause = () => {
      console.log(
        "AUDIO PAUSE EVENT"
      );
    };

    const handleEnded = () => {
      console.log(
        "AUDIO ENDED"
      );

      if (repeat) {
        audio.currentTime = 0;

        audio.play().catch(
          (error) => {
            console.error(
              "REPEAT PLAY ERROR:",
              error
            );
          }
        );

        return;
      }

      onNext();
    };

    const handleError = () => {
      console.error(
        "========== AUDIO ERROR =========="
      );

      console.error(
        "SRC:",
        audio.src
      );

      console.error(
        "NETWORK STATE:",
        audio.networkState
      );

      console.error(
        "READY STATE:",
        audio.readyState
      );

      console.error(
        "AUDIO ERROR:",
        audio.error
      );

      console.error(
        "================================="
      );
    };

    audio.addEventListener(
      "timeupdate",
      handleTimeUpdate
    );

    audio.addEventListener(
      "loadedmetadata",
      handleLoadedMetadata
    );

    audio.addEventListener(
      "canplay",
      handleCanPlay
    );

    audio.addEventListener(
      "playing",
      handlePlaying
    );

    audio.addEventListener(
      "pause",
      handlePause
    );

    audio.addEventListener(
      "ended",
      handleEnded
    );

    audio.addEventListener(
      "error",
      handleError
    );

    return () => {
      audio.removeEventListener(
        "timeupdate",
        handleTimeUpdate
      );

      audio.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata
      );

      audio.removeEventListener(
        "canplay",
        handleCanPlay
      );

      audio.removeEventListener(
        "playing",
        handlePlaying
      );

      audio.removeEventListener(
        "pause",
        handlePause
      );

      audio.removeEventListener(
        "ended",
        handleEnded
      );

      audio.removeEventListener(
        "error",
        handleError
      );
    };
  }, [
    repeat,
    onNext,
  ]);

  // ============================================================
  // VOLUME
  // ============================================================

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.volume =
      volume;
  }, [volume]);

  // ============================================================
  // PROGRESS
  // ============================================================

  const handleProgressChange =
    (event) => {
      const value = Number(
        event.target.value
      );

      if (!audioRef.current) {
        return;
      }

      audioRef.current.currentTime =
        value;

      setCurrentTime(value);
    };

  // ============================================================
  // PLAY / PAUSE BUTTON
  // ============================================================

  const togglePlay = () => {
    if (!currentSong) {
      return;
    }

    setIsPlaying(
      (previous) => !previous
    );
  };

  // ============================================================
  // TIME FORMAT
  // ============================================================

  const formatTime = (time) => {
    if (
      !time ||
      isNaN(time)
    ) {
      return "0:00";
    }

    const minutes =
      Math.floor(time / 60);

    const seconds =
      Math.floor(time % 60);

    return `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      <audio
        ref={audioRef}
        preload="metadata"
      />

      <div className="music-player">

        {/* NOW PLAYING */}

        <div className="now-playing">
          {currentSong ? (
            <>
              {currentSong.image ? (
                <img
                  className="player-album"
                  src={
                    currentSong.image
                  }
                  alt={
                    currentSong.title
                  }
                  onError={(
                    event
                  ) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />
              ) : (
                <div className="player-album">
                  <Music2
                    size={25}
                  />
                </div>
              )}

              <div className="song-info">
                <h4>
                  {currentSong.title}
                </h4>

                <p>
                  {currentSong.artist}
                </p>
              </div>

              <button
                type="button"
                className="player-icon"
                title="Like"
              >
                <Heart
                  size={18}
                />
              </button>
            </>
          ) : (
            <>
              <div className="player-album">
                <Music2
                  size={25}
                />
              </div>

              <div className="song-info">
                <h4>
                  Nothing playing
                </h4>

                <p>
                  Choose a song
                </p>
              </div>
            </>
          )}
        </div>

        {/* CONTROLS */}

        <div className="player-center">

          <div className="player-controls">

            <button
              type="button"
              className={`player-icon ${
                shuffle
                  ? "active"
                  : ""
              }`}
              onClick={onShuffle}
              title="Shuffle"
            >
              <Shuffle
                size={18}
              />
            </button>

            <button
              type="button"
              className="player-icon"
              onClick={
                onPrevious
              }
              title="Previous"
            >
              <SkipBack
                size={20}
                fill="currentColor"
              />
            </button>

            <button
              type="button"
              className="player-play"
              onClick={
                togglePlay
              }
              disabled={
                !currentSong
              }
              title={
                isPlaying
                  ? "Pause"
                  : "Play"
              }
            >
              {isPlaying ? (
                <Pause
                  size={20}
                  fill="black"
                />
              ) : (
                <Play
                  size={20}
                  fill="black"
                />
              )}
            </button>

            <button
              type="button"
              className="player-icon"
              onClick={onNext}
              title="Next"
            >
              <SkipForward
                size={20}
                fill="currentColor"
              />
            </button>

            <button
              type="button"
              className={`player-icon ${
                repeat
                  ? "active"
                  : ""
              }`}
              onClick={onRepeat}
              title="Repeat"
            >
              <Repeat
                size={18}
              />
            </button>

          </div>

          {/* PROGRESS */}

          <div className="progress-container">

            <span>
              {formatTime(
                currentTime
              )}
            </span>

            <input
              type="range"
              min="0"
              max={
                duration || 0
              }
              step="0.1"
              value={
                Math.min(
                  currentTime,
                  duration || 0
                )
              }
              onChange={
                handleProgressChange
              }
              disabled={
                !currentSong
              }
            />

            <span>
              {formatTime(
                duration
              )}
            </span>

          </div>
        </div>

        {/* VOLUME */}

        <div className="player-right">

          <Volume2
            size={19}
          />

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(event) =>
              setVolume(
                Number(
                  event.target.value
                )
              )
            }
          />

        </div>
      </div>
    </>
  );
}

export default MusicPlayer;