import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, Users, MessageCircle, Star, Shield } from 'lucide-react';
import './Landing.css';

const Landing = () => {
  const features = [
    {
      icon: <Heart className="feature-icon" />,
      title: 'Smart Matching',
      description: 'Advanced compatibility algorithm based on interests, lifestyle, and goals'
    },
    {
      icon: <Sparkles className="feature-icon" />,
      title: 'AI Conversation Starters',
      description: 'Personalized icebreakers tailored to your match\'s profile'
    },
    {
      icon: <Users className="feature-icon" />,
      title: 'Virtual Date Rooms',
      description: 'Built-in video chat with fun activities and games'
    },
    {
      icon: <MessageCircle className="feature-icon" />,
      title: 'Real-time Messaging',
      description: 'Instant messaging with rich media and emoji reactions'
    },
    {
      icon: <Star className="feature-icon" />,
      title: 'Compatibility Scoring',
      description: 'See how well you match with detailed compatibility insights'
    },
    {
      icon: <Shield className="feature-icon" />,
      title: 'Enhanced Safety',
      description: 'Profile verification, reporting system, and advanced privacy controls'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      text: 'Found my perfect match within a week! The compatibility scores are surprisingly accurate.',
      rating: 5
    },
    {
      name: 'Mike R.',
      text: 'Love the conversation starters feature. No more awkward first messages!',
      rating: 5
    },
    {
      name: 'Jessica L.',
      text: 'The virtual date rooms made getting to know each other so much fun and safe.',
      rating: 5
    }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="floating-hearts">
            <Heart className="floating-heart heart-1" />
            <Heart className="floating-heart heart-2" />
            <Heart className="floating-heart heart-3" />
            <Heart className="floating-heart heart-4" />
          </div>
        </div>
        
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Find Your Perfect
                <span className="gradient-text"> Match</span>
                <Heart className="heart-icon inline-heart" />
              </h1>
              <p className="hero-description">
                Connect with like-minded people through our unique compatibility algorithm.
                Experience meaningful conversations, virtual dates, and find genuine connections.
              </p>
              <div className="hero-cta">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Start Your Journey
                  <Sparkles size={20} />
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg">
                  Sign In
                </Link>
              </div>
              <div className="hero-stats">
                <div className="stat">
                  <div className="stat-number">50K+</div>
                  <div className="stat-label">Active Users</div>
                </div>
                <div className="stat">
                  <div className="stat-number">12K+</div>
                  <div className="stat-label">Successful Matches</div>
                </div>
                <div className="stat">
                  <div className="stat-number">95%</div>
                  <div className="stat-label">Satisfaction Rate</div>
                </div>
              </div>
            </div>
            
            <div className="hero-image">
              <div className="phone-mockup">
                <div className="phone-screen">
                  <div className="app-preview">
                    <div className="preview-header">
                      <div className="preview-avatar"></div>
                      <div className="preview-info">
                        <div className="preview-name"></div>
                        <div className="preview-age"></div>
                      </div>
                      <div className="compatibility-badge">92%</div>
                    </div>
                    <div className="preview-photos">
                      <div className="preview-photo"></div>
                    </div>
                    <div className="preview-bio">
                      <div className="bio-line"></div>
                      <div className="bio-line short"></div>
                    </div>
                    <div className="preview-actions">
                      <div className="action-btn pass"></div>
                      <div className="action-btn like"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose HeartConnect?</h2>
            <p className="section-description">
              Experience dating like never before with our innovative features designed for meaningful connections.
            </p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card card-hover">
                <div className="feature-icon-wrapper">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-description">
              Get started in minutes and find your perfect match today.
            </p>
          </div>
          
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3 className="step-title">Create Your Profile</h3>
                <p className="step-description">
                  Upload photos, share your interests, and tell us about yourself.
                </p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3 className="step-title">Discover Matches</h3>
                <p className="step-description">
                  Our AI algorithm finds compatible people based on your preferences.
                </p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3 className="step-title">Start Connecting</h3>
                <p className="step-description">
                  Chat, video call, and plan virtual dates with your matches.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Success Stories</h2>
            <p className="section-description">
              Real people, real connections, real love stories.
            </p>
          </div>
          
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card card">
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="star filled" size={16} />
                  ))}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-author">— {testimonial.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Find Love?</h2>
            <p className="cta-description">
              Join thousands of singles who have found meaningful connections on HeartConnect.
            </p>
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started Free
              <Heart size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="brand-logo">
                <Heart className="heart-icon" />
                <span className="brand-name">HeartConnect</span>
              </div>
              <p className="brand-tagline">Where meaningful connections begin</p>
            </div>
            
            <div className="footer-links">
              <div className="footer-section">
                <h4 className="footer-title">Product</h4>
                <ul className="footer-list">
                  <li><a href="#features">Features</a></li>
                  <li><a href="#pricing">Pricing</a></li>
                  <li><a href="#safety">Safety</a></li>
                </ul>
              </div>
              
              <div className="footer-section">
                <h4 className="footer-title">Support</h4>
                <ul className="footer-list">
                  <li><a href="#help">Help Center</a></li>
                  <li><a href="#contact">Contact Us</a></li>
                  <li><a href="#faq">FAQ</a></li>
                </ul>
              </div>
              
              <div className="footer-section">
                <h4 className="footer-title">Legal</h4>
                <ul className="footer-list">
                  <li><a href="#privacy">Privacy Policy</a></li>
                  <li><a href="#terms">Terms of Service</a></li>
                  <li><a href="#cookies">Cookie Policy</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 HeartConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;