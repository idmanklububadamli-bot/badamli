import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("XƏTƏ: SUPABASE_URL və ya SUPABASE_SERVICE_ROLE_KEY .env faylında tapılmadı!");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

// Helper functions to map DB snake_case to JS camelCase
function mapEventFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    location: row.location,
    locationUrl: row.location_url,
    description: row.description,
    status: row.status,
    registrationStatus: row.registration_status
  };
}

function mapCategoryFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    eventId: row.event_id,
    name: row.name,
    gender: row.gender,
    age: row.age,
    weight: row.weight,
    type: row.type
  };
}

function mapAthleteFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    club: row.club,
    country: row.country,
    categoryId: row.category_id,
    coachId: row.coach_id
  };
}

function mapMatchFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    eventId: row.event_id,
    categoryId: row.category_id,
    roundName: row.round_name,
    roundIndex: row.round_index,
    matchIndex: row.match_index,
    athleteAkaId: row.athlete_aka_id,
    athleteAoId: row.athlete_ao_id,
    scoreAka: Number(row.score_aka || 0),
    scoreAo: Number(row.score_ao || 0),
    kataScoresAka: row.kata_scores_aka || [7.5, 7.5, 7.5, 7.5, 7.5],
    kataScoresAo: row.kata_scores_ao || [7.5, 7.5, 7.5, 7.5, 7.5],
    warningsAka: row.warnings_aka || [],
    warningsAo: row.warnings_ao || [],
    senshu: row.senshu,
    winnerId: row.winner_id,
    status: row.status,
    nextMatchId: row.next_match_id,
    nextMatchPosition: row.next_match_position
  };
}

class Database {
  async getEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });
    if (error) throw error;
    return data.map(mapEventFromDb);
  }

  async getEventById(id) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapEventFromDb(data) : null;
  }

  async updateEvent(id, updates) {
    const dbUpdates = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.locationUrl !== undefined) dbUpdates.location_url = updates.locationUrl;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.registrationStatus !== undefined) dbUpdates.registration_status = updates.registrationStatus;

    const { data, error } = await supabase
      .from('events')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapEventFromDb(data);
  }

  async getCategories(eventId) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('event_id', eventId);
    if (error) throw error;
    return data.map(mapCategoryFromDb);
  }

  async getCategoryById(id) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapCategoryFromDb(data) : null;
  }

  async getAthletes(eventId) {
    const categories = await this.getCategories(eventId);
    const catIds = categories.map(c => c.id);
    if (catIds.length === 0) return [];
    
    const { data, error } = await supabase
      .from('athletes')
      .select('*')
      .in('category_id', catIds);
    if (error) throw error;
    return data.map(mapAthleteFromDb);
  }

  async getAthletesByCategory(categoryId) {
    const { data, error } = await supabase
      .from('athletes')
      .select('*')
      .eq('category_id', categoryId);
    if (error) throw error;
    return data.map(mapAthleteFromDb);
  }

  async addAthlete(athlete) {
    const id = `ath-${Date.now()}`;
    
    // If coachId is provided, get the coach's club name
    let clubName = athlete.club;
    if (athlete.coachId) {
      const coach = await this.getUserById(athlete.coachId);
      if (coach && coach.club_name) {
        clubName = coach.club_name;
      }
    }

    const { data, error } = await supabase
      .from('athletes')
      .insert({
        id,
        name: athlete.name,
        club: clubName,
        country: athlete.country || 'AZE',
        category_id: athlete.categoryId,
        coach_id: athlete.coachId || null
      })
      .select()
      .single();
    if (error) throw error;
    return mapAthleteFromDb(data);
  }

  async getMatches(categoryId) {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('category_id', categoryId)
      .order('round_index', { ascending: true })
      .order('match_index', { ascending: true });
    if (error) throw error;
    return data.map(mapMatchFromDb);
  }

  async getMatchById(id) {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapMatchFromDb(data) : null;
  }

  async updateMatch(matchId, updates) {
    const dbUpdates = {};
    if (updates.scoreAka !== undefined) dbUpdates.score_aka = updates.scoreAka;
    if (updates.scoreAo !== undefined) dbUpdates.score_ao = updates.scoreAo;
    if (updates.warningsAka !== undefined) dbUpdates.warnings_aka = updates.warningsAka;
    if (updates.warningsAo !== undefined) dbUpdates.warnings_ao = updates.warningsAo;
    if (updates.senshu !== undefined) dbUpdates.senshu = updates.senshu;
    if (updates.winnerId !== undefined) dbUpdates.winner_id = updates.winnerId;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.kataScoresAka !== undefined) dbUpdates.kata_scores_aka = updates.kataScoresAka;
    if (updates.kataScoresAo !== undefined) dbUpdates.kata_scores_ao = updates.kataScoresAo;

    const { data, error } = await supabase
      .from('matches')
      .update(dbUpdates)
      .eq('id', matchId)
      .select()
      .single();
    if (error) throw error;

    const updatedMatch = mapMatchFromDb(data);

    if (updates.status === 'completed' && updatedMatch.winnerId) {
      await this.advanceWinner(updatedMatch);
    }

    return await this.getMatchById(matchId);
  }

  async advanceWinner(completedMatch) {
    if (!completedMatch.nextMatchId) return;

    const nextMatch = await this.getMatchById(completedMatch.nextMatchId);
    if (!nextMatch) return;

    const winnerId = completedMatch.winnerId;
    const dbUpdates = {};

    if (completedMatch.nextMatchPosition === 'Aka') {
      dbUpdates.athlete_aka_id = winnerId;
      nextMatch.athleteAkaId = winnerId;
    } else {
      dbUpdates.athlete_ao_id = winnerId;
      nextMatch.athleteAoId = winnerId;
    }

    // If the next match has a bye in the other slot, complete it automatically!
    const partnerId = completedMatch.nextMatchPosition === 'Aka' ? nextMatch.athleteAoId : nextMatch.athleteAkaId;
    if (winnerId === 'BYE' || partnerId === 'BYE') {
      dbUpdates.winner_id = winnerId === 'BYE' ? partnerId : winnerId;
      dbUpdates.status = 'completed';
      dbUpdates.score_aka = 0;
      dbUpdates.score_ao = 0;

      nextMatch.winnerId = dbUpdates.winner_id;
      nextMatch.status = 'completed';
    }

    const { data, error } = await supabase
      .from('matches')
      .update(dbUpdates)
      .eq('id', nextMatch.id)
      .select()
      .single();

    if (error) {
      console.error("Failed to advance winner:", error);
      return;
    }

    const updatedNextMatch = mapMatchFromDb(data);

    if (updatedNextMatch.status === 'completed') {
      await this.advanceWinner(updatedNextMatch);
    }
  }

  async generateBrackets(eventId, categoryId) {
    // Clear existing matches for this category
    const { error: deleteError } = await supabase
      .from('matches')
      .delete()
      .eq('category_id', categoryId);
    if (deleteError) throw deleteError;

    const athletes = await this.getAthletesByCategory(categoryId);
    if (athletes.length < 2) {
      return [];
    }

    // Determine tournament size (power of 2)
    const count = athletes.length;
    let bracketSize = 2;
    while (bracketSize < count) {
      bracketSize *= 2;
    }

    const numRounds = Math.log2(bracketSize);
    const allMatches = [];

    // Initialize matches for all rounds
    for (let r = 0; r < numRounds; r++) {
      const roundSize = bracketSize / Math.pow(2, r + 1);
      const roundName = roundSize === 1 ? "Final" : roundSize === 2 ? "Yarımfinal" : `1/${roundSize}`;
      
      for (let i = 0; i < roundSize; i++) {
        const matchId = `match-${categoryId}-${r}-${i}`;
        
        let nextMatchId = null;
        let nextMatchPosition = null;
        if (r < numRounds - 1) {
          const parentMatchIndex = Math.floor(i / 2);
          nextMatchId = `match-${categoryId}-${r + 1}-${parentMatchIndex}`;
          nextMatchPosition = i % 2 === 0 ? "Aka" : "Ao";
        }

        allMatches.push({
          id: matchId,
          event_id: eventId,
          category_id: categoryId,
          round_name: roundName,
          round_index: r,
          match_index: i,
          athlete_aka_id: null,
          athlete_ao_id: null,
          score_aka: 0,
          score_ao: 0,
          kata_scores_aka: [7.5, 7.5, 7.5, 7.5, 7.5],
          kata_scores_ao: [7.5, 7.5, 7.5, 7.5, 7.5],
          warnings_aka: [],
          warnings_ao: [],
          senshu: null,
          winner_id: null,
          status: "scheduled",
          next_match_id: nextMatchId,
          next_match_position: nextMatchPosition
        });
      }
    }

    // Smart Seeding: Separate club members (teammate separation)
    const clubGroups = {};
    athletes.forEach(a => {
      if (!clubGroups[a.club]) clubGroups[a.club] = [];
      clubGroups[a.club].push(a);
    });

    const sortedClubs = Object.keys(clubGroups).sort((a, b) => clubGroups[b].length - clubGroups[a].length);

    const seedList = [];
    let added = true;
    const clubIndices = {};
    sortedClubs.forEach(c => { clubIndices[c] = 0; });

    while (added) {
      added = false;
      for (const club of sortedClubs) {
        const idx = clubIndices[club];
        if (idx < clubGroups[club].length) {
          seedList.push(clubGroups[club][idx]);
          clubIndices[club]++;
          added = true;
        }
      }
    }

    const pairedAthletes = [];
    for (let i = 0; i < bracketSize; i += 2) {
      const aka = seedList[i] ? seedList[i].id : 'BYE';
      const ao = seedList[i + 1] ? seedList[i + 1].id : 'BYE';
      pairedAthletes.push({ aka, ao });
    }

    const firstRoundMatches = allMatches.filter(m => m.round_index === 0);
    const firstRoundSize = firstRoundMatches.length;

    for (let i = 0; i < firstRoundSize; i++) {
      const pair = pairedAthletes[i] || { aka: 'BYE', ao: 'BYE' };
      firstRoundMatches[i].athlete_aka_id = pair.aka;
      firstRoundMatches[i].athlete_ao_id = pair.ao;

      if (pair.aka === 'BYE' || pair.ao === 'BYE') {
        if (pair.aka === 'BYE' && pair.ao === 'BYE') {
          firstRoundMatches[i].winner_id = 'BYE';
          firstRoundMatches[i].status = 'completed';
        } else {
          firstRoundMatches[i].winner_id = pair.aka === 'BYE' ? pair.ao : pair.aka;
          firstRoundMatches[i].status = 'completed';
        }
      }
    }

    const { error: insertError } = await supabase
      .from('matches')
      .insert(allMatches);
    if (insertError) throw insertError;

    // Propagate byes forward
    const completedMatches = allMatches.filter(m => m.status === 'completed').map(mapMatchFromDb);
    for (const m of completedMatches) {
      await this.advanceWinner(m);
    }
    
    return await this.getMatches(categoryId);
  }

  // Auth & User Management Methods
  async createUser(user) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: crypto.randomUUID(),
        username: user.username,
        password_hash: user.password_hash,
        role: user.role || 'coach',
        club_name: user.club_name || null
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getUserByUsername(username) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async getUserById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  }
};

const db = new Database();
export default db;
