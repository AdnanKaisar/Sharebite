import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Fallback categorization heuristics
const fallbackCategorize = (title = '', description = '') => {
  const text = `${title} ${description}`.toLowerCase();
  if (text.match(/biryani|rice|curry|cooked|pasta|meal|roti|soup|chicken|meat|pizza|burger/)) {
    return 'Cooked food';
  }
  if (text.match(/chips|packaged|biscuit|can|box|snack|chocolate|juice|milk|bottle/)) {
    return 'Packaged food';
  }
  if (text.match(/apple|banana|mango|orange|grape|fruit|berry|strawberry/)) {
    return 'Fruits';
  }
  if (text.match(/vegetable|onion|potato|tomato|cabbage|carrot|spinach|salad/)) {
    return 'Vegetables';
  }
  if (text.match(/bread|cake|cookie|donut|bakery|croissant|pastry|bun/)) {
    return 'Bakery items';
  }
  if (text.match(/leftover|party|event|wedding|buffet|cater/)) {
    return 'Event leftovers';
  }
  return 'Cooked food';
};

// Fallback shelf-life estimation heuristics
const fallbackEstimateShelfLife = (title = '', category = '', description = '') => {
  const text = `${title} ${description}`.toLowerCase();
  let estimatedHours = 12;
  let storageTips = 'Keep in a cool, dry place. Reheat thoroughly before eating.';
  let rationale = 'Food should be consumed quickly to prevent bacterial growth.';

  const cat = category || fallbackCategorize(title, description);

  if (cat === 'Cooked food') {
    estimatedHours = text.includes('dairy') || text.includes('cream') || text.includes('gravy') ? 8 : 18;
    storageTips = 'Keep refrigerated at or below 4°C. Reheat to at least 75°C before serving.';
    rationale = 'Prepared cooked meals contain moisture and proteins, which spoil rapidly at room temperature.';
  } else if (cat === 'Packaged food') {
    estimatedHours = 240; // 10 days
    storageTips = 'Store in a cool, dry pantry away from direct sunlight.';
    rationale = 'Packaged food contains preservatives and is sealed, which significantly extends shelf life.';
  } else if (cat === 'Fruits') {
    estimatedHours = 72; // 3 days
    storageTips = 'Keep in a well-ventilated fruit bowl or refrigerate to extend freshness.';
    rationale = 'Fresh fruits spoil due to natural ripening and moisture loss over a few days.';
  } else if (cat === 'Vegetables') {
    estimatedHours = 96; // 4 days
    storageTips = 'Keep in the crisper drawer of the refrigerator in breathable wrapping.';
    rationale = 'Leafy green vegetables wilt, and root vegetables degrade slowly over a few days.';
  } else if (cat === 'Bakery items') {
    estimatedHours = 48; // 2 days
    storageTips = 'Store in an airtight container or bread box. Can be frozen for longer storage.';
    rationale = 'Bakery items dry out or grow mold quickly due to yeast and starch retrogradation.';
  } else if (cat === 'Event leftovers') {
    estimatedHours = 8;
    storageTips = 'Consume immediately or freeze. Do not keep at room temperature for more than 2 hours.';
    rationale = 'Buffet items are exposed to ambient temperature for longer periods, increasing spoiling risk.';
  }

  return { estimatedHours, storageTips, rationale };
};

// POST /api/ai/estimate-shelf-life
router.post('/estimate-shelf-life', protect, async (req, res) => {
  const { title, category, description } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required for estimation' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const prompt = `You are a professional food safety AI. Analyze this surplus food listing:
Title: "${title}"
Category: "${category || 'Uncategorized'}"
Description: "${description || ''}"

Return a JSON object containing:
{
  "estimatedHours": number (integer estimate of shelf life before food becomes unsafe or stale),
  "confidence": number (float between 0 and 1),
  "storageTips": "string (specific safety tips on how to store or transport this item safely)",
  "rationale": "string (brief food safety justification for this estimate)"
}`;

      const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (apiRes.ok) {
        const responseData = await apiRes.json();
        const responseText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
        const result = JSON.parse(responseText);
        return res.status(200).json(result);
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local heuristics:', err.message);
    }
  }

  // Fallback heuristic response
  const estimation = fallbackEstimateShelfLife(title, category, description);
  return res.status(200).json({
    ...estimation,
    confidence: 0.85,
    isFallback: true
  });
});

// POST /api/ai/categorize
router.post('/categorize', protect, async (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required for categorization' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const categoriesList = ['Cooked food', 'Packaged food', 'Fruits', 'Vegetables', 'Bakery items', 'Event leftovers'];

  if (apiKey) {
    try {
      const prompt = `You are an automated food distribution routing AI. Categorize this food donation based on the title and description:
Title: "${title}"
Description: "${description || ''}"

Allowed Categories: ${JSON.stringify(categoriesList)}

Return a JSON object containing:
{
  "category": "string (exactly one of the allowed categories)",
  "confidence": number (float between 0 and 1),
  "rationale": "string (brief justification)"
}`;

      const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (apiRes.ok) {
        const responseData = await apiRes.json();
        const responseText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
        const result = JSON.parse(responseText);
        if (categoriesList.includes(result.category)) {
          return res.status(200).json(result);
        }
      }
    } catch (err) {
      console.warn('Gemini API categorization call failed, falling back to local heuristics:', err.message);
    }
  }

  // Fallback heuristic categorization
  const category = fallbackCategorize(title, description);
  return res.status(200).json({
    category,
    confidence: 0.9,
    rationale: 'Classified automatically based on keywords in title and description.',
    isFallback: true
  });
});

export default router;
