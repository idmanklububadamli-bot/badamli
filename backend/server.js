import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-123';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

// Root route
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; text-align: center; padding: 50px;">
      <h1 style="color: #2563eb;">ArenaSmart Backend API</h1>
      <p>Backend uğurla işləyir!</p>
      <p>İstifadəçi interfeysinə keçmək üçün bura klikləyin: <a href="http://localhost:5173" style="color: #3b82f6; font-weight: bold; text-decoration: underline;">http://localhost:5173</a></p>
    </div>
  `);
});

// API Routes

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, role, clubName } = req.body;
    
    // Simple validation
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }
    
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    
    const user = await db.createUser({
      username,
      password_hash,
      role: role || 'coach',
      club_name: clubName
    });
    
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await db.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, clubName: user.club_name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, clubName: user.club_name } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all events
app.get('/api/events', async (req, res) => {
  try {
    const events = await db.getEvents();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get event by ID
app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await db.getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    const categories = await db.getCategories(event.id);
    res.json({ ...event, categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update event details
app.post('/api/events/:id', async (req, res) => {
  try {
    const { title, date, location, locationUrl, description, registrationStatus } = req.body;
    const updatedEvent = await db.updateEvent(req.params.id, {
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
app.get('/api/events/:id/categories', async (req, res) => {
  try {
    const categories = await db.getCategories(req.params.id);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get athletes of a category
app.get('/api/categories/:categoryId/athletes', async (req, res) => {
  try {
    const athletes = await db.getAthletesByCategory(req.params.categoryId);
    res.json(athletes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get draws (matches) of a category
app.get('/api/categories/:categoryId/draws', async (req, res) => {
  try {
    const matches = await db.getMatches(req.params.categoryId);
    const athletes = await db.getAthletesByCategory(req.params.categoryId);
    
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
app.post('/api/categories/:categoryId/generate-draws', async (req, res) => {
  try {
    const { eventId } = req.body;
    if (!eventId) {
      return res.status(400).json({ error: "eventId is required" });
    }
    const matches = await db.generateBrackets(eventId, req.params.categoryId);
    res.json({ message: "Draws generated successfully", matches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new athlete to a category
app.post('/api/categories/:categoryId/athletes', authenticateToken, async (req, res) => {
  try {
    const { name, club, country, rosterAthleteId } = req.body;
    const newAthlete = await db.addAthlete({
      name,
      club: req.user.clubName || club, // Force club from token if available
      country,
      categoryId: req.params.categoryId,
      coachId: req.user.id,
      rosterAthleteId
    });
    res.status(201).json(newAthlete);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get statistics for an event
app.get('/api/events/:id/statistics', async (req, res) => {
  try {
    const athletes = await db.getAthletes(req.params.id);
    
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
app.get('/api/matches/:matchId', async (req, res) => {
  try {
    const match = await db.getMatchById(req.params.matchId);
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }
    const category = await db.getCategoryById(match.categoryId);
    const athletes = await db.getAthletesByCategory(match.categoryId);
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
app.post('/api/matches/:matchId/score', async (req, res) => {
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

    const updatedMatch = await db.updateMatch(req.params.matchId, updatePayload);

    if (!updatedMatch) {
      return res.status(404).json({ error: "Match not found" });
    }

    res.json(updatedMatch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Roster API Routes
app.get('/api/roster', authenticateToken, async (req, res) => {
  try {
    const roster = await db.getRosterAthletes(req.user.id);
    res.json(roster);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/roster', authenticateToken, async (req, res) => {
  try {
    const { name, birthDate, gender, country } = req.body;
    const newRosterAthlete = await db.addRosterAthlete({
      name,
      birthDate,
      gender,
      club: req.user.clubName || "Unknown Club", // ensure club is from token
      country: country || 'AZE',
      coachId: req.user.id
    });
    res.status(201).json(newRosterAthlete);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/roster/:id', authenticateToken, async (req, res) => {
  try {
    const { name, birthDate, gender, country } = req.body;
    const updated = await db.updateRosterAthlete(req.params.id, req.user.id, {
      name, birthDate, gender, country
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/roster/:id', authenticateToken, async (req, res) => {
  try {
    await db.deleteRosterAthlete(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Athlete Check-in Route
app.post('/api/athletes/:id/checkin', authenticateToken, async (req, res) => {
  try {
    const { checkedIn } = req.body;
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Only admins can check-in athletes" });
    }
    const updated = await db.checkInAthlete(req.params.id, checkedIn);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Badamlı Online Backend Server running on http://localhost:${PORT}`);
});

export default app;
