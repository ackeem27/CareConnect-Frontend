const SYMPTOM_DICTS = {
  high: [
    "chest pain", "difficulty breathing", "unconscious", "severe bleeding",
    "stroke", "seizure", "choking", "heart attack", "loss of vision",
    "suicidal", "severe head injury", "coughing up blood", "gunshot",
    "stab wound", "burning", "unresponsive", "paralysis"
  ],
  medium: [
    "fever", "vomiting", "dizziness", "severe pain", "broken bone",
    "abdominal pain", "migraine", "asthma", "dehydration",
    "fainting", "confusion", "allergic reaction", "diarrhea",
    "deep cut", "fracture", "high blood pressure"
  ],
  low: [
    "headache", "cough", "runny nose", "sore throat", "mild rash",
    "minor cut", "nausea", "fatigue", "muscle ache", "mild allergy",
    "earache", "cold", "flu", "sprain", "bruise", "toothache"
  ]
};

const FIRST_AID_ADVICE = {
  "chest pain": "Sit upright and stay calm. Loosen tight clothing. Do NOT exert yourself. Help is on the way.",
  "difficulty breathing": "Sit upright in a comfortable position. Loosen any tight clothing. Try slow, deep breaths.",
  "unconscious": "Place the person in the recovery position (on their side). Check for breathing. Do NOT give food or water.",
  "severe bleeding": "Apply firm, direct pressure with a clean cloth. Elevate the injured area above the heart if possible.",
  "stroke": "Note the time symptoms started. Keep the person still and comfortable. Do NOT give food, drink, or medication.",
  "seizure": "Clear the area of hard objects. Do NOT restrain the person or put anything in their mouth. Time the seizure.",
  "choking": "Encourage forceful coughing. If the person cannot breathe, perform back blows and abdominal thrusts (Heimlich manoeuvre).",
  "heart attack": "Have the person sit or lie down. If they are not allergic, give them an aspirin to chew slowly. Stay calm.",
  "loss of vision": "Do NOT rub the eyes. Keep the person calm and seated. Cover both eyes gently with a clean cloth.",
  "suicidal": "Stay with the person. Listen without judgement. Remove access to harmful objects. Call a crisis helpline immediately.",
  "severe head injury": "Keep the person still. Do NOT move them. Apply gentle pressure to any bleeding with a clean cloth.",
  "coughing up blood": "Sit upright and lean slightly forward. Spit blood out, do not swallow. Stay calm and rest.",
  "gunshot": "Apply direct pressure to the wound with a clean cloth. Do NOT remove any embedded objects. Keep the person still.",
  "stab wound": "Do NOT remove the object if still present. Apply pressure around (not on) the wound. Keep the person warm and still.",
  "burning": "Cool the burn under cool running water for at least 20 minutes. Do NOT apply ice, butter, or creams.",
  "unresponsive": "Check airway and breathing. Place in recovery position. If not breathing, begin CPR if trained.",
  "paralysis": "Do NOT move the person. Keep them warm and comfortable. Reassure them while waiting for help.",
  "fever": "Rest and stay hydrated with water or clear fluids. Take paracetamol as directed. Use a cool compress on the forehead.",
  "vomiting": "Sip small amounts of clear fluids slowly. Avoid solid food until vomiting stops. Rest in a propped-up position.",
  "dizziness": "Sit or lie down immediately. Drink water slowly. Avoid sudden movements or standing quickly.",
  "severe pain": "Rest the affected area. Apply a cold pack wrapped in a cloth for 15 minutes. Take over-the-counter pain relief as directed.",
  "broken bone": "Immobilise the injured area. Do NOT try to straighten the bone. Apply ice wrapped in a cloth to reduce swelling.",
  "abdominal pain": "Lie down and rest. Sip clear fluids. Avoid eating until the pain eases. Apply a warm compress to the area.",
  "migraine": "Rest in a quiet, dark room. Place a cool cloth on your forehead. Stay hydrated and avoid screens.",
  "asthma": "Sit upright and take slow, steady breaths. Use your inhaler if available (2 puffs, wait 4 minutes, repeat if needed).",
  "dehydration": "Sip water or an oral rehydration solution frequently. Avoid caffeine and alcohol. Rest in a cool area.",
  "fainting": "Lie down and elevate the legs. Loosen tight clothing. Once conscious, sip water slowly.",
  "confusion": "Guide the person to a safe, quiet space. Speak calmly. Check for medical ID bracelets or medication.",
  "allergic reaction": "If mild, take an antihistamine. If severe (swelling, difficulty breathing), use an EpiPen if available and seek emergency help.",
  "diarrhea": "Stay hydrated with water and electrolyte drinks. Eat bland foods (bananas, rice, toast). Avoid dairy and spicy foods.",
  "deep cut": "Clean the wound gently with water. Apply firm pressure with a clean cloth. Cover with a sterile bandage.",
  "fracture": "Do NOT move the injured limb. Support it in the position found. Apply ice wrapped in a cloth to reduce swelling.",
  "high blood pressure": "Sit down and relax. Take slow, deep breaths. Avoid caffeine and salty foods. Take prescribed medication if available.",
  "headache": "Rest in a quiet, dark room. Stay hydrated. Take paracetamol or ibuprofen as directed on the packaging.",
  "cough": "Stay hydrated with warm fluids like honey and lemon tea. Use cough drops. Rest your voice.",
  "runny nose": "Blow your nose gently. Stay hydrated. Use saline nasal drops for relief.",
  "sore throat": "Gargle with warm salt water. Drink warm fluids. Suck on ice chips or throat lozenges.",
  "mild rash": "Avoid scratching. Apply calamine lotion or a gentle moisturiser. Wear loose, breathable clothing.",
  "minor cut": "Clean with clean water. Apply antiseptic cream. Cover with a plaster or sterile bandage.",
  "nausea": "Sip ginger tea or clear fluids. Eat small, bland meals. Avoid strong smells and greasy food.",
  "fatigue": "Rest and ensure adequate sleep. Stay hydrated. Eat balanced meals with iron-rich foods.",
  "muscle ache": "Rest the affected muscle. Apply a warm compress. Gently stretch if comfortable.",
  "mild allergy": "Take an over-the-counter antihistamine. Avoid the known allergen. Apply cool compresses to itchy areas.",
  "earache": "Apply a warm cloth to the affected ear. Take pain relief as directed. Avoid inserting objects into the ear.",
  "cold": "Rest and drink plenty of fluids. Use saline nasal spray. Take paracetamol for aches and fever.",
  "flu": "Rest in bed and stay hydrated. Take paracetamol for fever and aches. Avoid contact with others to prevent spread.",
  "sprain": "Follow RICE: Rest, Ice (20 mins on/off), Compression (bandage), Elevation (above heart level).",
  "bruise": "Apply a cold pack wrapped in a cloth for 10-20 minutes. Elevate the area. Avoid pressing on it.",
  "toothache": "Rinse with warm salt water. Use over-the-counter pain relief. Avoid very hot, cold, or sweet foods."
};

const limitScore = (score, tier) => {
  if (tier === "HIGH") return Math.min(score, 100);
  if (tier === "MEDIUM") return Math.min(score, 79);
  return Math.min(score, 49);
};

export const analyzeSymptoms = (inputText, severity = 'low') => {
  const text = inputText.toLowerCase();
  const detected = [];

  Object.entries(SYMPTOM_DICTS).forEach(([tier, keywords]) => {
    keywords.forEach(keyword => {
      // Basic word boundaries check
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(text)) {
        // Simple negation check
        const index = text.indexOf(keyword);
        const prefix = text.substring(0, index);
        const isNegated = /\b(no|not|without|none)\s+$/.test(prefix);
        if (!isNegated) {
          detected.push({ keyword, tier });
        }
      }
    });
  });

  if (detected.length === 0) {
    return {
      priority_level: "LOW",
      priority_score: 10,
      detected_symptoms: [inputText],
      severity_input: severity,
      first_aid_advice: []
    };
  }

  let highestTier = "LOW";
  let baseScore = 20;

  if (detected.some(d => d.tier === "high")) {
    highestTier = "HIGH";
    baseScore = 80;
  } else if (detected.some(d => d.tier === "medium")) {
    highestTier = "MEDIUM";
    baseScore = 50;
  }

  const severityBump = severity === 'severe' ? 10 : (severity === 'moderate' ? 5 : 0);
  const additionalSymptomsCount = Math.max(detected.length - 1, 0);
  const finalScore = limitScore(baseScore + (additionalSymptomsCount * 5) + severityBump, highestTier);

  return {
    priority_level: highestTier,
    priority_score: finalScore,
    detected_symptoms: [...new Set(detected.map(d => d.keyword))],
    severity_input: severity,
    first_aid_advice: [...new Set(detected.map(d => d.keyword))].map(s => ({
      symptom: s,
      advice: FIRST_AID_ADVICE[s]
    })).filter(a => a.advice)
  };
};
