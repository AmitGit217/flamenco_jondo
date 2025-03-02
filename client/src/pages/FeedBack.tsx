import { useState } from "react";
import apiClient from "../api/Api";
import "../style/FeedBack.scss";

const FeedbackForm = () => {
  const [comment, setComment] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await apiClient.post("/feedback", { comment, email });
      setMessage(response.message || "Feedback submitted successfully!");
      setComment("");
      setEmail("");
    } catch {
      setError("Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-page">
      <div className="feedback-container">
        <div className="feedback-header">
          <h1 className="feedback-title">Submit Feedback</h1>
          <p className="feedback-subtitle">
            We value your input to improve our flamenco experience
          </p>
        </div>

        {message && (
          <div className="feedback-alert feedback-alert--success">
            <div className="feedback-alert__icon">✓</div>
            <div className="feedback-alert__content">{message}</div>
          </div>
        )}
        
        {error && (
          <div className="feedback-alert feedback-alert--error">
            <div className="feedback-alert__icon">!</div>
            <div className="feedback-alert__content">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="feedback-form__group">
            <label className="feedback-form__label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="feedback-form__input"
              placeholder="your@email.com"
            />
          </div>
          
          <div className="feedback-form__group">
            <label className="feedback-form__label">Your Feedback</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              className="feedback-form__textarea"
              placeholder="Share your thoughts, questions, or suggestions..."
              rows={5}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`feedback-form__submit ${loading ? 'feedback-form__submit--loading' : ''}`}
          >
            {loading ? (
              <span className="feedback-form__loading-text">
                <span className="feedback-form__spinner"></span>
                Submitting...
              </span>
            ) : (
              "Submit Feedback"
            )}
          </button>
        </form>
        
        <div className="feedback-footer">
          <p>Your feedback helps us improve the flamenco learning experience.</p>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;