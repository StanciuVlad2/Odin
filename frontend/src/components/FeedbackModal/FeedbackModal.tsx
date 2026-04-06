import { useState } from "react";
import type {
  CreateFeedbackRequest,
  FoodQualityRating,
  ServiceSpeedRating,
} from "../../services/api";
import { apiService } from "../../services/api";
import "./FeedbackModal.css";

interface FeedbackModalProps {
  orderId: number;
  onClose: () => void;
  onSubmitted: () => void;
}

const FOOD_QUALITY_OPTIONS: { value: FoodQualityRating; label: string }[] = [
  { value: "POOR", label: "Poor" },
  { value: "BELOW_AVERAGE", label: "Below Average" },
  { value: "AVERAGE", label: "Average" },
  { value: "GOOD", label: "Good" },
  { value: "EXCELLENT", label: "Excellent" },
];

const SERVICE_SPEED_OPTIONS: { value: ServiceSpeedRating; label: string }[] = [
  { value: "SLOW", label: "Slow" },
  { value: "ADEQUATE", label: "Adequate" },
  { value: "FAST", label: "Fast" },
];

function FeedbackModal({ orderId, onClose, onSubmitted }: FeedbackModalProps) {
  const [foodQuality, setFoodQuality] = useState<FoodQualityRating | "">("");
  const [serviceSpeed, setServiceSpeed] = useState<ServiceSpeedRating | "">("");
  const [wouldRecommend, setWouldRecommend] = useState(false);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!foodQuality) {
      setError("Please select a food quality rating");
      return;
    }
    if (!serviceSpeed) {
      setError("Please select a service speed rating");
      return;
    }

    setSubmitting(true);
    try {
      const data: CreateFeedbackRequest = {
        foodQualityRating: foodQuality,
        serviceSpeedRating: serviceSpeed,
        wouldRecommend,
        comment: comment.trim() || undefined,
      };
      await apiService.createFeedback(orderId, data);
      onSubmitted();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit feedback",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="feedback-modal-overlay" onClick={onClose}>
      <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Leave Feedback</h2>
        <p className="feedback-subtitle">Order #{orderId}</p>

        {error && <div className="feedback-error">{error}</div>}

        <form onSubmit={handleSubmit} className="feedback-form">
          {/* SELECT - Food Quality */}
          <div className="feedback-field">
            <label htmlFor="foodQuality">Food Quality</label>
            <select
              id="foodQuality"
              value={foodQuality}
              onChange={(e) =>
                setFoodQuality(e.target.value as FoodQualityRating)
              }
              required
            >
              <option value="">-- Select rating --</option>
              {FOOD_QUALITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* RADIO - Service Speed */}
          <div className="feedback-field">
            <label>Service Speed</label>
            <div className="radio-group">
              {SERVICE_SPEED_OPTIONS.map((opt) => (
                <label key={opt.value} className="radio-label">
                  <input
                    type="radio"
                    name="serviceSpeed"
                    value={opt.value}
                    checked={serviceSpeed === opt.value}
                    onChange={(e) =>
                      setServiceSpeed(e.target.value as ServiceSpeedRating)
                    }
                  />
                  <span className="radio-custom" />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* CHECKBOX - Would Recommend */}
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={wouldRecommend}
              onChange={(e) => setWouldRecommend(e.target.checked)}
            />
            I would recommend this restaurant to others
          </label>

          {/* TEXTAREA - Comment */}
          <div className="feedback-field">
            <label htmlFor="comment">Additional Comments</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us more about your experience..."
              rows={4}
            />
          </div>

          <div className="feedback-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FeedbackModal;
