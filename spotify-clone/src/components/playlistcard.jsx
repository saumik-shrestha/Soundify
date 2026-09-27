import { Play } from "lucide-react";

function PlaylistCard({ playlist }) {
  return (
    <div className="playlist-card">
      <div className="playlist-image-container">
        <img src={playlist.image} alt={playlist.title} />

        <button className="card-play-button">
          <Play size={20} fill="black" />
        </button>
      </div>

      <h3>{playlist.title}</h3>
      <p>{playlist.description}</p>
    </div>
  );
}

export default PlaylistCard;