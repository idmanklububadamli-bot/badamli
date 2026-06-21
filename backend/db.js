import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, 'data.json');

// Initial seed data
const initialData = {
  events: [
    {
      id: "9042",
      title: "Fudokan karate üzrə turnir (2-ci liqa)",
      date: "2026-06-25",
      location: "İsmayıllı Olimpiya İdman Kompleksi",
      locationUrl: "https://www.google.com/maps/search/?api=1&query=İsmayıllı+Olimpiya+İdman+Kompleksi",
      description: "Fudokan karate növləri üzrə klublararası turnir. Rəsmi WKF/Şito-ryu qaydaları tətbiq olunur. Cədvəl, püşkatma və canlı xal sistemi bu portaldadır.",
      status: "active",
      registrationStatus: "closed"
    }
  ],
  categories: [
    { id: "cat-1", eventId: "9042", name: "U8, -25kg, Oğlanlar (Şito-ryu)", gender: "Oğlan", age: "U8", weight: "-25kg", type: "kumite" },
    { id: "cat-2", eventId: "9042", name: "U10, -30kg, Oğlanlar (Şito-ryu)", gender: "Oğlan", age: "U10", weight: "-30kg", type: "kumite" },
    { id: "cat-3", eventId: "9042", name: "U12, -35kg, Qızlar (Şito-ryu)", gender: "Qız", age: "U12", weight: "-35kg", type: "kumite" },
    { id: "cat-4", eventId: "9042", name: "U14, -45kg, Oğlanlar (Şito-ryu)", gender: "Oğlan", age: "U14", weight: "-45kg", type: "kumite" },
    { id: "cat-5", eventId: "9042", name: "U12, Kata, Qızlar (Şito-ryu)", gender: "Qız", age: "U12", weight: "Kata", type: "kata" }
  ],
  athletes: [
    // Seeding athletes from the original page
    { id: "ath-1", name: "EMİL CAHANGİROV", club: "Baku Karate Club", country: "AZE", categoryId: "cat-1" },
    { id: "ath-2", name: "MÜBARİZ HÜSEYNZADƏ", club: "Zirvə Karate Klub", country: "AZE", categoryId: "cat-1" },
    { id: "ath-3", name: "UCAL İSMAYILOV", club: "Gənclik İK", country: "AZE", categoryId: "cat-1" },
    { id: "ath-4", name: "MEHDİ ƏLİYEV", club: "Arpaçay İK", country: "AZE", categoryId: "cat-1" },
    { id: "ath-5", name: "ÖMƏR AĞALAROV", club: "Baku Karate Club", country: "AZE", categoryId: "cat-1" },
    { id: "ath-6", name: "İBRAHİM AĞAZADƏ", club: "Qəbələ İK", country: "AZE", categoryId: "cat-1" },
    { id: "ath-7", name: "ARSLAN DADAŞOV", club: "Arpaçay İK", country: "AZE", categoryId: "cat-1" },
    { id: "ath-8", name: "SƏİD MƏŞƏDİYEV", club: "Zirvə Karate Klub", country: "AZE", categoryId: "cat-1" },

    // Category 2 athletes
    { id: "ath-9", name: "ARZU BABAYEV", club: "Şəki İK", country: "AZE", categoryId: "cat-2" },
    { id: "ath-10", name: "RAMAL BABAYEV", club: "Baku Karate Club", country: "AZE", categoryId: "cat-2" },
    { id: "ath-11", name: "RAUL BABAZADƏ", club: "Qəbələ İK", country: "AZE", categoryId: "cat-2" },
    { id: "ath-12", name: "TUNCAY İBRAHİMOV", club: "Gənclik İK", country: "AZE", categoryId: "cat-2" },
    { id: "ath-13", name: "OMAR BABAYEV", club: "Baku Karate Club", country: "AZE", categoryId: "cat-2" },
    { id: "ath-14", name: "YUSİF KƏNİŞLİ", club: "Zirvə Karate Klub", country: "AZE", categoryId: "cat-2" },

    // Category 3 (girls)
    { id: "ath-15", name: "NURAY HUMBƏTOVA", club: "Baku Karate Club", country: "AZE", categoryId: "cat-3" },
    { id: "ath-16", name: "XƏDİCƏ ORUCOVA", club: "Arpaçay İK", country: "AZE", categoryId: "cat-3" },
    { id: "ath-17", name: "SEVDA ƏLƏKBƏRLİ", club: "Qəbələ İK", country: "AZE", categoryId: "cat-3" },
    { id: "ath-18", name: "NİHAD MURADZADƏ", club: "Zirvə Karate Klub", country: "AZE", categoryId: "cat-3" },

    // Category 5 (Kata) - Teammates from Baku Karate and Arpaçay
    { id: "ath-19", name: "AYLA ƏLİYEVA", club: "Baku Karate Club", country: "AZE", categoryId: "cat-5" },
    { id: "ath-20", name: "DƏRYA MƏMMƏDOVA", club: "Arpaçay İK", country: "AZE", categoryId: "cat-5" },
    { id: "ath-21", name: "ZƏHRƏ HƏSƏNOVA", club: "Baku Karate Club", country: "AZE", categoryId: "cat-5" },
    { id: "ath-22", name: "LEYLA İSMAYILOVA", club: "Arpaçay İK", country: "AZE", categoryId: "cat-5" }
  ],
  matches: []
};

class Database {
  constructor() {
    this.data = initialData;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(fileContent);
      } else {
        this.save();
      }
    } catch (error) {
      console.error("Failed to load JSON DB, using in-memory state:", error);
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (error) {
      console.error("Failed to save JSON DB:", error);
    }
  }

  getEvents() {
    return this.data.events;
  }

  getEventById(id) {
    return this.data.events.find(e => e.id === id);
  }

  updateEvent(id, updates) {
    const eventIndex = this.data.events.findIndex(e => e.id === id);
    if (eventIndex === -1) return null;
    this.data.events[eventIndex] = { ...this.data.events[eventIndex], ...updates };
    this.save();
    return this.data.events[eventIndex];
  }

  getCategories(eventId) {
    return this.data.categories.filter(c => c.eventId === eventId);
  }

  getCategoryById(id) {
    return this.data.categories.find(c => c.id === id);
  }

  getAthletes(eventId) {
    const categories = this.getCategories(eventId);
    const catIds = new Set(categories.map(c => c.id));
    return this.data.athletes.filter(a => catIds.has(a.categoryId));
  }

  getAthletesByCategory(categoryId) {
    return this.data.athletes.filter(a => a.categoryId === categoryId);
  }

  addAthlete(athlete) {
    const newAthlete = {
      id: `ath-${Date.now()}`,
      ...athlete
    };
    this.data.athletes.push(newAthlete);
    this.save();
    return newAthlete;
  }

  getMatches(categoryId) {
    return this.data.matches.filter(m => m.categoryId === categoryId);
  }

  getMatchById(id) {
    return this.data.matches.find(m => m.id === id);
  }

  updateMatch(matchId, updates) {
    const matchIndex = this.data.matches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return null;

    const match = { ...this.data.matches[matchIndex], ...updates };
    this.data.matches[matchIndex] = match;

    // If match is completed, check if we need to advance the winner
    if (updates.status === 'completed' && match.winnerId) {
      this.advanceWinner(match);
    }

    this.save();
    return match;
  }

  advanceWinner(completedMatch) {
    if (!completedMatch.nextMatchId) return;

    const nextMatchIndex = this.data.matches.findIndex(m => m.id === completedMatch.nextMatchId);
    if (nextMatchIndex === -1) return;

    const nextMatch = { ...this.data.matches[nextMatchIndex] };
    const winnerId = completedMatch.winnerId;

    if (completedMatch.nextMatchPosition === 'Aka') {
      nextMatch.athleteAkaId = winnerId;
    } else {
      nextMatch.athleteAoId = winnerId;
    }

    // If the next match has a bye in the other slot, complete it automatically!
    if (nextMatch.athleteAkaId === 'BYE' || nextMatch.athleteAoId === 'BYE') {
      nextMatch.winnerId = nextMatch.athleteAkaId === 'BYE' ? nextMatch.athleteAoId : nextMatch.athleteAkaId;
      nextMatch.status = 'completed';
      nextMatch.scoreAka = 0;
      nextMatch.scoreAo = 0;
    }

    this.data.matches[nextMatchIndex] = nextMatch;

    // Recurse in case the next match gets completed instantly (byes)
    if (nextMatch.status === 'completed') {
      this.advanceWinner(nextMatch);
    }
  }

  generateBrackets(eventId, categoryId) {
    // Clear existing matches for this category
    this.data.matches = this.data.matches.filter(m => m.categoryId !== categoryId);

    const athletes = this.getAthletesByCategory(categoryId);
    if (athletes.length < 2) {
      this.save();
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
      const roundSize = bracketSize / Math.pow(2, r + 1); // e.g. N=8: r=0 -> 4, r=1 -> 2, r=2 -> 1
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
          eventId,
          categoryId,
          roundName,
          roundIndex: r,
          matchIndex: i,
          athleteAkaId: null,
          athleteAoId: null,
          scoreAka: 0,
          scoreAo: 0,
          kataScoresAka: [7.5, 7.5, 7.5, 7.5, 7.5], // Default starting score for Kata
          kataScoresAo: [7.5, 7.5, 7.5, 7.5, 7.5],
          warningsAka: [],
          warningsAo: [],
          senshu: null,
          winnerId: null,
          status: "scheduled",
          nextMatchId,
          nextMatchPosition
        });
      }
    }

    // Smart Seeding: Separate club members (teammate separation)
    // Group athletes by club
    const clubGroups = {};
    athletes.forEach(a => {
      if (!clubGroups[a.club]) clubGroups[a.club] = [];
      clubGroups[a.club].push(a);
    });

    // Sort clubs by size descending
    const sortedClubs = Object.keys(clubGroups).sort((a, b) => clubGroups[b].length - clubGroups[a].length);

    // Interweave club athletes sequentially to split teammates
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

    // Seed athletes into the first round (which is roundIndex === 0)
    // To handle byes, we pair athletes. If bracketSize > count, some positions get a 'BYE'
    const pairedAthletes = [];
    for (let i = 0; i < bracketSize; i += 2) {
      const aka = seedList[i] ? seedList[i].id : 'BYE';
      const ao = seedList[i + 1] ? seedList[i + 1].id : 'BYE';
      pairedAthletes.push({ aka, ao });
    }

    const firstRoundMatches = allMatches.filter(m => m.roundIndex === 0);
    const firstRoundSize = firstRoundMatches.length;

    for (let i = 0; i < firstRoundSize; i++) {
      const pair = pairedAthletes[i] || { aka: 'BYE', ao: 'BYE' };
      firstRoundMatches[i].athleteAkaId = pair.aka;
      firstRoundMatches[i].athleteAoId = pair.ao;

      // Handle byes immediately
      if (pair.aka === 'BYE' || pair.ao === 'BYE') {
        if (pair.aka === 'BYE' && pair.ao === 'BYE') {
          firstRoundMatches[i].winnerId = 'BYE';
          firstRoundMatches[i].status = 'completed';
        } else {
          firstRoundMatches[i].winnerId = pair.aka === 'BYE' ? pair.ao : pair.aka;
          firstRoundMatches[i].status = 'completed';
        }
      }
    }

    this.data.matches.push(...allMatches);

    // Propagate byes forward
    const completedMatches = allMatches.filter(m => m.status === 'completed');
    for (const m of completedMatches) {
      this.advanceWinner(m);
    }

    this.save();
    return this.getMatches(categoryId);
  }

  // Pre-generate brackets for seeded data on load if empty
  initializeDefaultBrackets() {
    for (const cat of this.data.categories) {
      const matches = this.getMatches(cat.id);
      if (matches.length === 0) {
        this.generateBrackets("9042", cat.id);
      }
    }
  }
}

const db = new Database();
db.initializeDefaultBrackets();

export default db;
