import "../style/LetraModal.scss";

interface Letra {
  id: number;
  content: string;
  artist: string;
  recording: string;
}

interface Props {
  letra: Letra;
  onClose: () => void;
}

const LetraModal = ({ letra, onClose }: Props) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>✖</button>
        <h2>{letra.artist}</h2>
        <p className="letra-text">"{letra.content}"</p>
        {!letra.recording && (
          <audio className="audio-player" src={letra.recording} controls />
        )}
      </div>
    </div>
  );
};

export default LetraModal;
