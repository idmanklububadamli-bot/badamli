import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes

// Get all events
app.get('/api/events', (req, res) => {
  try {
    const events = db.getEvents();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get event by ID
app.get('/api/events/:id', (req, res) => {
  try {
    const event = db.getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    const categories = db.getCategories(event.id);
    res.json({ ...event, categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update event details
app.post('/api/events/:id', (req, res) => {
  try {
    const { title, date, location, locationUrl, description, registrationStatus } = req.body;
    const updatedEvent = db.updateEvent(req.params.id, {
      title,
      date,
      location,
      locationUrl,
      description,
      registrationStatus
    });
    if (!updatedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get categories of an event
app.get('/api/events/:id/categories', (req, res) => {
  try {
    const categories = db.getCategories(req.params.id);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get athletes of a category
app.get('/api/categories/:categoryId/athletes', (req, res) => {
  try {
    const athletes = db.getAthletesByCategory(req.params.categoryId);
    res.json(athletes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get draws (matches) of a category
app.get('/api/categories/:categoryId/draws', (req, res) => {
  try {
    const matches = db.getMatches(req.params.categoryId);
    const athletes = db.getAthletesByCategory(req.params.categoryId);
    
    // Attach athlete details to each match
    const detailedMatches = matches.map(match => {
      const athleteAka = athletes.find(a => a.id === match.athleteAkaId) || (match.athleteAkaId === 'BYE' ? { name: 'BYE', club: '-' } : null);
      const athleteAo = athletes.find(a => a.id === match.athleteAoId) || (match.athleteAoId === 'BYE' ? { name: 'BYE', club: '-' } : null);
      return {
        ...match,
        athleteAka,
        athleteAo
      };
    });
    
    res.json(detailedMatches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate draws for a category
app.post('/api/categories/:categoryId/generate-draws', (req, res) => {
  try {
    const { eventId } = req.body;
    if (!eventId) {
      return res.status(400).json({ error: "eventId is required" });
    }
    const matches = db.generateBrackets(eventId, req.params.categoryId);
    res.json({ message: "Draws generated successfully", matches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new athlete to a category
app.post('/api/categories/:categoryId/athletes', (req, res) => {
  try {
    const { name, club, country } = req.body;
    if (!name || !club) {
      return res.status(400).json({ error: "Name and Club are required" });
    }
    const athlete = db.addAthlete({
      name,
      club,
      country: country || 'AZE',
      categoryId: req.params.categoryId
    });
    res.status(201).json(athlete);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get statistics for an event
app.get('/api/events/:id/statistics', (req, res) => {
  try {
    const athletes = db.getAthletes(req.params.id);
    
    // Group by club
    const clubStats = {};
    const countryStats = {};
    
    athletes.forEach(a => {
      clubStats[a.club] = (clubStats[a.club] || 0) + 1;
      countryStats[a.country] = (countryStats[a.country] || 0) + 1;
    });

    const clubs = Object.entries(clubStats).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count);
    const countries = Object.entries(countryStats).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count);

    res.json({
      totalAthletes: athletes.length,
      clubs,
      countries
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single match details
app.get('/api/matches/:matchId', (req, res) => {
  try {
    const match = db.getMatchById(req.params.matchId);
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }
    const category = db.getCategoryById(match.categoryId);
    const athletes = db.getAthletesByCategory(match.categoryId);
    const athleteAka = athletes.find(a => a.id === match.athleteAkaId) || (match.athleteAkaId === 'BYE' ? { name: 'BYE', club: '-' } : null);
    const athleteAo = athletes.find(a => a.id === match.athleteAoId) || (match.athleteAoId === 'BYE' ? { name: 'BYE', club: '-' } : null);
    
    res.json({
      ...match,
      categoryType: category ? category.type : 'kumite',
      athleteAka,
      athleteAo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update match score/status
app.post('/api/matches/:matchId/score', (req, res) => {
  try {
    const { scoreAka, scoreAo, warningsAka, warningsAo, senshu, winnerId, status, kataScoresAka, kataScoresAo } = req.body;
    
    const updatePayload = {
      scoreAka: scoreAka !== undefined ? scoreAka : 0,
      scoreAo: scoreAo !== undefined ? scoreAo : 0,
      warningsAka: warningsAka || [],
      warningsAo: warningsAo || [],
      senshu: senshu || null,
      winnerId: winnerId || null,
      status: status || 'scheduled'
    };

    if (kataScoresAka !== undefined) updatePayload.kataScoresAka = kataScoresAka;
    if (kataScoresAo !== undefined) updatePayload.kataScoresAo = kataScoresAo;

    const updatedMatch = db.updateMatch(req.params.matchId, updatePayload);

    if (!updatedMatch) {
      return res.status(404).json({ error: "Match not found" });
    }

    res.json(updatedMatch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Badamlı Online Backend Server running on http://localhost:${PORT}`);
});
