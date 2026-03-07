import { useState } from 'react';
import './CreateCocktail.css';

interface CocktailResponse {
  name: string;
  story: string;
  ingredients: string[];
  instructions: string;
}

export default function CreateCocktail() {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [cocktail, setCocktail] = useState<CocktailResponse | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCocktail(null);

    try {
      const response = await fetch('http://localhost:8080/api/cocktails/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userDescription: description }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate cocktail');
      }

      const data = await response.json();
      setCocktail(data);
    } catch (err) {
      setError('Failed to generate cocktail. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDescription('');
    setCocktail(null);
    setError('');
  };

  return (
    <div className="create-cocktail">
      <div className="cocktail-hero">
        <h1>Create Your Own Cocktail</h1>
        <p>Tell us about yourself and we'll craft a unique cocktail just for you</p>
      </div>

      <div className="cocktail-container">
        {!cocktail ? (
          <div className="input-section">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="description">Tell us about yourself</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What are your favorite flavors? Do you prefer sweet or sour? Tell us about your personality, hobbies, or anything that makes you unique..."
                  rows={8}
                  minLength={10}
                  maxLength={1000}
                  required
                />
                <div className="char-count">
                  {description.length} / 1000 characters
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button 
                type="submit" 
                className="generate-btn"
                disabled={loading || description.length < 10}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Generating your cocktail...
                  </>
                ) : (
                  'Generate My Cocktail'
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="result-section">
            <div className="cocktail-card">
              <h2 className="cocktail-name">{cocktail.name}</h2>
              
              <div className="cocktail-story">
                <h3>The Story</h3>
                <p>{cocktail.story}</p>
              </div>

              <div className="cocktail-ingredients">
                <h3>Ingredients</h3>
                <ul>
                  {cocktail.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </div>

              <div className="cocktail-instructions">
                <h3>Instructions</h3>
                <p>{cocktail.instructions}</p>
              </div>

              <button onClick={handleReset} className="reset-btn">
                Create Another Cocktail
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
