import { Play } from "lucide-react";

function MusicCard({ song, onPlay }) {
  return (
    <div className="music-card">
      <div className="card-image-container">
        <img src={song.image} alt={song.title} />

        <button
          className="card-play-button"
          onClick={() => onPlay(song)}
        >
          <Play size={20} fill="black" />
        </button>
      </div>

      <h3>{song.title}</h3>
      <p>{song.artist}</p>
    </div>
  );
}

export default MusicCard;