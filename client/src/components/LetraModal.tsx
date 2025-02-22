import "../style/LetraModal.scss";

interface Letra {
  id: number;
  content: string;
  artist: string;
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
      </div>
    </div>
  );
};

export default LetraModal;
