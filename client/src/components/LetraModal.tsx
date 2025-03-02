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

const handleBase64ToUrl = (base64: string) => {
  return `data:audio/wav;base64,${base64}`;
}
// dont allow download

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>✖</button>
        <h2>{letra.artist}</h2>

        {/* Correctly rendering each line */}
        <div className="letra-text">
          {letra.content.split("\n").map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>

        {letra.recording && (
          <audio className="audio-player"  src={handleBase64ToUrl(letra.recording)} controlsList="nodownload"  controls />
        )}
      </div>
    </div>
  );
};

export default LetraModal;
