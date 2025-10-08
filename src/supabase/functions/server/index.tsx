import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use("*", cors({
  origin: "*",
  allowHeaders: ["*"],
  allowMethods: ["*"],
  credentials: true,
  maxAge: 86400, // 24 hours
}));
app.use("*", logger(console.log));

// Additional CORS preflight handling
app.options("*", (c) => {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
});

// Supabase client with service role key for admin operations
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Health check
app.get("/make-server-c192d0ee/health", (c) => {
  console.log("🏥 Health check endpoint called");
  return c.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    endpoints: ["explain", "translate", "signup", "profile", "favorites", "text-to-speech", "user-preference"]
  });
});

// Test endpoint for debugging
app.post("/make-server-c192d0ee/test", async (c) => {
  console.log("🧪 Test endpoint called");
  try {
    const body = await c.req.json();
    console.log("📥 Test request body:", JSON.stringify(body, null, 2));
    return c.json({ 
      success: true, 
      received: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Test endpoint error:", error);
    return c.json({ 
      error: "Test endpoint failed",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Sign up route
app.post("/make-server-c192d0ee/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }

    console.log(`Creating user account for: ${email}`);

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // DO NOT auto-confirm email - users must verify via email link
      // Note: You must configure email templates in Supabase Dashboard:
      // Authentication → Email Templates → Set sender to support@rubatar.com
      email_confirm: false
    });

    if (error) {
      console.error("Signup error:", error);
      
      // Handle specific Supabase auth errors
      if (error.code === 'email_exists' || error.message.includes('already been registered')) {
        return c.json({ error: 'email_exists' }, 422);
      } else if (error.code === 'weak_password') {
        return c.json({ error: 'weak_password' }, 400);
      } else if (error.code === 'invalid_email') {
        return c.json({ error: 'invalid_email' }, 400);
      } else {
        return c.json({ error: error.message }, 400);
      }
    }

    console.log(`User created successfully: ${data.user.id}`);

    return c.json({ 
      success: true, 
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata.name
      }
    });

  } catch (error) {
    console.error("Signup error:", error);
    return c.json({ error: "Failed to create user account" }, 500);
  }
});

// Profile routes
app.get("/make-server-c192d0ee/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Create a Supabase client instance with the user's access token
    const userSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      }
    );

    const { data: { user }, error } = await userSupabase.auth.getUser();
    
    if (error || !user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get profile data from KV store
    const profileKey = `profile:${user.id}`;
    const profileData = await kv.get(profileKey);

    return c.json({ 
      profile: profileData || {
        name: user.user_metadata?.name || '',
        profileImage: '',
        userId: user.id
      }
    });

  } catch (error) {
    console.error("Get profile error:", error);
    return c.json({ error: "Failed to get profile" }, 500);
  }
});

app.put("/make-server-c192d0ee/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Create a Supabase client instance with the user's access token
    const userSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      }
    );

    const { data: { user }, error } = await userSupabase.auth.getUser();
    
    if (error || !user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { name, profileImage, avatarUrl } = await c.req.json();

    // Store profile data in KV store
    const profileKey = `profile:${user.id}`;
    const profileData = {
      name: name || user.user_metadata?.name || user.user_metadata?.full_name || '',
      profileImage: avatarUrl || profileImage || '', // Prefer avatarUrl (from Google) over profileImage
      userId: user.id,
      updatedAt: new Date().toISOString()
    };

    await kv.set(profileKey, profileData);

    console.log(`Profile updated for user ${user.id}`);

    return c.json({ success: true, profile: profileData });

  } catch (error) {
    console.error("Update profile error:", error);
    return c.json({ error: "Failed to update profile" }, 500);
  }
});

// Favorites routes
app.get("/make-server-c192d0ee/favorites", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      console.error("No access token provided");
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Create a Supabase client instance with the user's access token
    const userSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!, // Use anon key for user operations
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      }
    );

    // Get user info using the user's token
    const { data: { user }, error } = await userSupabase.auth.getUser();
    
    if (error || !user?.id) {
      console.error("Auth error:", error);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log(`Loading favorites for user ${user.id}`);

    // Get user's favorites from KV store
    const favoritesKey = `favorites:${user.id}`;
    const favorites = await kv.get(favoritesKey);

    console.log(`Found ${favorites?.length || 0} favorites for user ${user.id}`);

    return c.json({ favorites: favorites || [] });

  } catch (error) {
    console.error("Get favorites error:", error);
    return c.json({ error: "Failed to get favorites" }, 500);
  }
});

app.post("/make-server-c192d0ee/favorites", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Create a Supabase client instance with the user's access token
    const userSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      }
    );

    const { data: { user }, error } = await userSupabase.auth.getUser();
    
    if (error || !user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { poem } = await c.req.json();

    if (!poem || !poem.id) {
      return c.json({ error: "Complete poem data is required" }, 400);
    }

    // Get existing favorites
    const favoritesKey = `favorites:${user.id}`;
    const existingFavorites = await kv.get(favoritesKey) || [];

    // Check if already favorited
    const isAlreadyFavorited = existingFavorites.some((fav: any) => fav.id === poem.id);
    if (isAlreadyFavorited) {
      return c.json({ error: "Poem already favorited" }, 409);
    }

    // Add poem to favorites with metadata
    const favoritePoem = {
      ...poem,
      favoritedAt: new Date().toISOString(),
      userId: user.id
    };

    const updatedFavorites = [...existingFavorites, favoritePoem];
    await kv.set(favoritesKey, updatedFavorites);

    console.log(`Added poem ${poem.id} to favorites for user ${user.id}`);

    return c.json({ success: true, favorites: updatedFavorites });

  } catch (error) {
    console.error("Add favorite error:", error);
    return c.json({ error: "Failed to add favorite" }, 500);
  }
});

app.delete("/make-server-c192d0ee/favorites/:poemId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Create a Supabase client instance with the user's access token
    const userSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      }
    );

    const { data: { user }, error } = await userSupabase.auth.getUser();
    
    if (error || !user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const poemId = parseInt(c.req.param('poemId'));

    // Get existing favorites
    const favoritesKey = `favorites:${user.id}`;
    const existingFavorites = await kv.get(favoritesKey) || [];

    // Remove poem from favorites
    const updatedFavorites = existingFavorites.filter((fav: any) => fav.id !== poemId);
    await kv.set(favoritesKey, updatedFavorites);

    console.log(`Removed poem ${poemId} from favorites for user ${user.id}`);

    return c.json({ success: true, favorites: updatedFavorites });

  } catch (error) {
    console.error("Remove favorite error:", error);
    return c.json({ error: "Failed to remove favorite" }, 500);
  }
});

// Check if poem is favorited
app.get("/make-server-c192d0ee/favorites/:poemId/status", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Create a Supabase client instance with the user's access token
    const userSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      }
    );

    const { data: { user }, error } = await userSupabase.auth.getUser();
    
    if (error || !user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const poemId = parseInt(c.req.param('poemId'));

    // Get user's favorites
    const favoritesKey = `favorites:${user.id}`;
    const favorites = await kv.get(favoritesKey) || [];

    const isFavorited = favorites.some((fav: any) => fav.id === poemId);

    return c.json({ isFavorited });

  } catch (error) {
    console.error("Check favorite status error:", error);
    return c.json({ error: "Failed to check favorite status" }, 500);
  }
});

// User preference endpoint - save user preferences like language
app.post("/make-server-c192d0ee/user-preference", async (c) => {
  try {
    const { userId, preference, value } = await c.req.json();
    
    if (!userId || !preference || value === undefined) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    console.log(`Saving ${preference} preference for user ${userId}: ${value}`);

    // Save to KV store
    const preferenceKey = `user:${userId}:${preference}`;
    await kv.set(preferenceKey, value);

    console.log(`✓ Saved ${preference} preference for user ${userId}`);

    return c.json({ success: true });

  } catch (error) {
    console.error("Save preference error:", error);
    return c.json({ error: "Failed to save preference" }, 500);
  }
});

// Get user preference
app.get("/make-server-c192d0ee/user-preference/:userId/:preference", async (c) => {
  try {
    const userId = c.req.param('userId');
    const preference = c.req.param('preference');

    const preferenceKey = `user:${userId}:${preference}`;
    const value = await kv.get(preferenceKey);

    return c.json({ value });

  } catch (error) {
    console.error("Get preference error:", error);
    return c.json({ error: "Failed to get preference" }, 500);
  }
});

// Helper function to generate fallback explanations
const generateFallbackExplanation = (poem: any, language: string): any => {
  const isPersia = language === 'fa';
  
  if (isPersia) {
    const themes = [];
    const text = poem.text.toLowerCase();
    
    // Detect common themes in Persian poetry
    if (text.includes('عشق') || text.includes('محبت') || text.includes('دل')) {
      themes.push('عشق و محبت');
    }
    if (text.includes('گل') || text.includes('بهار') || text.includes('باغ')) {
      themes.push('طبیعت و زیبایی');
    }
    if (text.includes('دنیا') || text.includes('فانی') || text.includes('زندگی')) {
      themes.push('فلسفه زندگی');
    }
    if (text.includes('خدا') || text.includes('الله') || text.includes('رب')) {
      themes.push('معنویت و عرفان');
    }
    if (text.includes('جام') || text.includes('می') || text.includes('شراب')) {
      themes.push('نماد و استعاره');
    }
    if (text.includes('یار') || text.includes('معشوق') || text.includes('دوست')) {
      themes.push('عشق عرفانی');
    }
    if (text.includes('صبح') || text.includes('شب') || text.includes('ستاره')) {
      themes.push('زمان و طبیعت');
    }

    const themeText = themes.length > 0 ? themes.join('، ') : 'زیبایی و هنر';
    
    // Generate more detailed line by line analysis
    const lines = poem.text.split(/\r?\n/).filter((line: string) => line.trim() !== '').slice(0, 8);
    const lineByLine = lines.map((line: string, index: number) => {
      let meaning = `این بیت درباره ${themeText} سخن می‌گوید`;
      
      // Add more specific analysis based on content
      if (line.includes('عشق') || line.includes('دل')) {
        meaning = 'این بیت درباره عمق احساسات و عشق صحبت می‌کند';
      } else if (line.includes('گل') || line.includes('باغ')) {
        meaning = 'این بیت از طبیعت برای بیان زیبایی و ناپایداری استفاده می‌کند';
      } else if (line.includes('می') || line.includes('جام')) {
        meaning = 'در این بیت شراب نمادی از معرفت و حال عرفانی است';
      } else if (line.includes('دنیا') || line.includes('فانی')) {
        meaning = 'این بیت درباره گذرا بودن زندگی دنیوی تأمل می‌کند';
      }
      
      return {
        original: line.trim(),
        meaning: meaning
      };
    });
    
    return {
      generalMeaning: `این شعر زیبا دربردارنده موضوعات ${themeText} است و با استفاده از تصاویر و استعاره‌های ظریف، پیام عمیق و معنادار خود را به مخاطب منتقل می‌کند. شاعر با بهره‌گیری از زبان شیوا و صناعات ادبی، احساسات و اندیشه‌های خود را بیان کرده است.`,
      mainThemes: `موضوعات اصلی این شعر عبارتند از: ${themeText}. این مضامین در قالب تصاویر شاعرانه و با استفاده از سنت کهن شعر فارسی بیان شده‌اند.`,
      imagerySymbols: `شاعر در این اثر از تصاویر و نمادهای کلاسیک شعر فارسی استفاده کرده است. این استعاره‌ها و تشبیهات نه تنها زیبایی بصری شعر را افزایش می‌دهند، بلکه لایه‌های معنایی عمیق‌تری نیز به آن می‌بخشند.`,
      lineByLine
    };
  } else {
    const themes = [];
    const text = poem.text.toLowerCase();
    
    // Enhanced theme detection for English speakers
    if (text.includes('love') || text.includes('heart') || text.includes('beloved')) {
      themes.push('love and devotion');
    }
    if (text.includes('flower') || text.includes('garden') || text.includes('spring')) {
      themes.push('nature and beauty');
    }
    if (text.includes('life') || text.includes('world') || text.includes('time')) {
      themes.push('philosophy of life');
    }
    if (text.includes('god') || text.includes('divine') || text.includes('spiritual')) {
      themes.push('spirituality and mysticism');
    }
    if (text.includes('wine') || text.includes('cup') || text.includes('tavern')) {
      themes.push('symbolism and metaphor');
    }
    if (text.includes('soul') || text.includes('spirit') || text.includes('truth')) {
      themes.push('spiritual quest');
    }
    if (text.includes('night') || text.includes('dawn') || text.includes('star')) {
      themes.push('time and nature');
    }

    const themeText = themes.length > 0 ? themes.join(', ') : 'beauty and artistry';
    
    // Enhanced line by line analysis
    const lines = poem.text.split(/\r?\n/).filter((line: string) => line.trim() !== '').slice(0, 8);
    const lineByLine = lines.map((line: string, index: number) => {
      let meaning = `This line explores themes of ${themeText}`;
      
      // Add more specific analysis
      if (line.toLowerCase().includes('love') || line.toLowerCase().includes('heart')) {
        meaning = 'This line expresses deep emotions and the nature of love';
      } else if (line.toLowerCase().includes('flower') || line.toLowerCase().includes('garden')) {
        meaning = 'This line uses nature imagery to convey beauty and transience';
      } else if (line.toLowerCase().includes('wine') || line.toLowerCase().includes('cup')) {
        meaning = 'Here wine serves as a metaphor for spiritual intoxication and mystical experience';
      } else if (line.toLowerCase().includes('world') || line.toLowerCase().includes('life')) {
        meaning = 'This line reflects on the transitory nature of worldly existence';
      }
      
      return {
        original: line.trim(),
        meaning: meaning
      };
    });
    
    return {
      generalMeaning: `This beautiful poem encompasses themes of ${themeText}, using delicate imagery and metaphors to convey its profound message to the reader. The poet employs eloquent language and literary devices to express deep emotions and thoughts, following the rich tradition of Persian poetry.`,
      mainThemes: `The main themes of this poem include: ${themeText}. These motifs are expressed through poetic imagery and draw upon the ancient tradition of Persian verse.`,
      imagerySymbols: `The poet uses classical Persian metaphors and symbols in this work. These allegories and similes not only enhance the visual beauty of the poem but also add deeper layers of meaning, creating a rich tapestry of literary significance.`,
      lineByLine
    };
  }
};

// Translate poem to English
app.post("/make-server-c192d0ee/translate-poem", async (c) => {
  try {
    const { poem } = await c.req.json();
    
    if (!poem || !poem.text) {
      return c.json({ error: "Poem text is required" }, 400);
    }

    // Check if we already have a translation cached
    const translationKey = `translation:en:${poem.id}`;
    const cachedTranslation = await kv.get(translationKey);
    
    if (cachedTranslation) {
      console.log(`Returning cached translation for poem ${poem.id}`);
      return c.json({ translation: cachedTranslation });
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    
    // Try OpenAI first if API key is available
    if (openaiApiKey) {
      try {
        const prompt = `Translate this Persian poem to English while preserving its poetic beauty, meter, and meaning. Keep the same line structure:

${poem.text}

Title: ${poem.title}
Poet: ${poem.poet.name}

Please provide:
1. A translation that maintains the artistic and literary quality of the original Persian poetry
2. The English translation of the poem title "${poem.title}"
3. The English name/transliteration of the poet "${poem.poet.name}"

Format your response as:
POEM:
[translated poem text]

TITLE:
[English title]

POET:
[English name of poet]`;

        console.log(`Attempting to translate poem ${poem.id} to English`);

        // Create AbortController for timeout
        const controller = new AbortController();
        let timeoutId: ReturnType<typeof setTimeout> | undefined;
        
        try {
          timeoutId = setTimeout(() => {
            console.log(`Translation timeout after 8 seconds for poem ${poem.id}`);
            controller.abort();
          }, 8000); // Reduced to 8 seconds for faster fallback
          
          const response = await Promise.race([
            fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${openaiApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                  {
                    role: "system",
                    content: "You are an expert translator of Persian poetry to English. Preserve the poetic beauty, rhythm, and meaning while making it accessible to English readers. Maintain the line structure of the original. Also provide English translations for poem titles and English names/transliterations for Persian poets (e.g., حافظ = Hafez, مولانا = Rumi, سعدی = Saadi, فردوسی = Ferdowsi, نظامی = Nezami, عمر خیام = Omar Khayyam). For titles, translate them appropriately (e.g., غزل = Ghazal, رباعی = Quatrain, مثنوی = Masnavi)."
                  },
                  {
                    role: "user",
                    content: prompt
                  }
                ],
                max_tokens: 800,
                temperature: 0.7,
              }),
              signal: controller.signal
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('OpenAI request timeout')), 7000)
            )
          ]);
          
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = undefined;
          }

          if (response.ok) {
            const data = await response.json();
            const translation = data.choices[0]?.message?.content?.trim();

          if (translation) {
            // Parse the response to extract poem, title, and poet name
            let translatedText = translation;
            let translatedTitle = poem.title; // Default to original
            let poetName = poem.poet.name; // Default to original
            
            // Try to extract poem, title, and poet from structured response
            const poemMatch = translation.match(/POEM:\s*([\s\S]*?)(?=TITLE:|POET:|$)/);
            const titleMatch = translation.match(/TITLE:\s*(.*?)(?:\n|$)/);
            const poetMatch = translation.match(/POET:\s*(.*?)(?:\n|$)/);
            
            if (poemMatch && poemMatch[1]) {
              translatedText = poemMatch[1].trim();
            }
            
            if (titleMatch && titleMatch[1]) {
              translatedTitle = titleMatch[1].trim();
            }
            
            if (poetMatch && poetMatch[1]) {
              poetName = poetMatch[1].trim();
            } else {
              // Fallback: try to detect and translate common Persian poet names
              const persianToEnglish = {
                'حافظ': 'Hafez',
                'مولانا': 'Rumi', 
                'سعدی': 'Saadi',
                'فردوسی': 'Ferdowsi',
                'نظامی': 'Nezami',
                'عمر خیام': 'Omar Khayyam',
                'خیام': 'Khayyam',
                'عطار': 'Attar',
                'جامی': 'Jami',
                'رودکی': 'Rudaki'
              };
              
              for (const [persian, english] of Object.entries(persianToEnglish)) {
                if (poem.poet.name.includes(persian)) {
                  poetName = english;
                  break;
                }
              }
            }
            
            // Create translated poem object
            const translatedPoem = {
              ...poem,
              text: translatedText,
              htmlText: translatedText.replace(/\n/g, '<br/>'),
              title: translatedTitle,
              poet: {
                ...poem.poet,
                name: poetName
              }
            };
            
            // Cache the translation
            await kv.set(translationKey, translatedPoem);
            console.log(`Cached translation for poem ${poem.id} with title: ${translatedTitle}, poet name: ${poetName}`);
            return c.json({ translation: translatedPoem });
            }
          } else {
            const errorData = await response.json();
            console.warn("OpenAI API error:", errorData);
          }
        } catch (error) {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          throw error; // Re-throw to outer catch
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn(`OpenAI API timeout for translation of poem ${poem.id}:`, error);
        } else {
          console.warn(`Error calling OpenAI API for translation of poem ${poem.id}:`, error);
        }
      }
    }

    // Fallback: return the original poem (no translation available)
    console.log(`No translation available for poem ${poem.id}, returning original`);
    return c.json({ translation: poem });

  } catch (error) {
    console.error("Translate poem error:", error);
    return c.json({ error: "Failed to translate poem" }, 500);
  }
});

// Text-to-speech endpoint
app.post("/make-server-c192d0ee/text-to-speech", async (c) => {
  try {
    const { text, voice = 'alloy' } = await c.req.json();
    
    if (!text) {
      return c.json({ error: "Text is required" }, 400);
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!openaiApiKey) {
      return c.json({ error: "OpenAI API key not configured" }, 500);
    }

    console.log(`Generating speech for text length: ${text.length} characters with voice: ${voice}`);

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1", // High quality model
        input: text,
        voice: voice, // alloy, echo, fable, onyx, nova, shimmer
        response_format: "mp3"
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI TTS API error:", errorData);
      return c.json({ error: errorData.error?.message || "Failed to generate speech" }, response.status);
    }

    // Get the audio data as array buffer
    const audioBuffer = await response.arrayBuffer();
    
    console.log(`Generated speech audio, size: ${audioBuffer.byteLength} bytes`);

    // Return the audio data directly
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      }
    });

  } catch (error) {
    console.error("Text-to-speech error:", error);
    return c.json({ error: "Failed to generate speech" }, 500);
  }
});

// Explanation endpoint with comprehensive Persian poetry tafsir
app.post("/make-server-c192d0ee/explain", async (c) => {
  console.log(`🔍 Explanation request received for language: ${c.req.header('language') || 'unknown'}`);
  
  try {
    const requestBody = await c.req.text();
    console.log(`📝 Request body length: ${requestBody.length} characters`);
    
    let parsedBody;
    try {
      parsedBody = JSON.parse(requestBody);
    } catch (parseError) {
      console.error('❌ Failed to parse JSON body:', parseError);
      return c.json({ error: "Invalid JSON in request body" }, 400);
    }
    
    const { poem, language } = parsedBody;
    
    if (!poem || !poem.text) {
      console.error('❌ Missing poem or poem text in request');
      return c.json({ error: "Poem text is required" }, 400);
    }
    
    console.log(`📖 Processing explanation for poem ID: ${poem.id || 'unknown'}, language: ${language}`);
    console.log(`📄 Poem text length: ${poem.text ? poem.text.length : 0} characters`);

    // Check if we already have an explanation cached
    const explanationKey = `explanation:${language}:${poem.id}`;
    const cachedExplanation = await kv.get(explanationKey);
    
    if (cachedExplanation) {
      console.log(`Returning cached explanation for poem ${poem.id}`);
      // Handle both old and new cached formats
      if (typeof cachedExplanation === 'string') {
        return c.json({ explanation: { generalMeaning: cachedExplanation } });
      } else {
        return c.json({ explanation: cachedExplanation });
      }
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    
    // Try OpenAI first if API key is available
    if (openaiApiKey) {
      try {
        const isPersia = language === 'fa';
        
        // Use comprehensive tafsir system for Persian poems
        if (isPersia) {
          const systemPrompt = `You are a distinguished professor of Persian literature with PhD-level expertise in classical and modern Persian poetry, trained in the scholarly traditions of tafsir, balāghat (rhetoric), and ʿarūż (prosody).

Your task is to produce deep, nuanced, and evidence-based interpretations (tafsir) of Persian poetry suitable for advanced literary study.

**CRITICAL: You MUST write ALL your analysis, explanations, and interpretations in Persian/Farsi (فارسی). All text fields in the JSON output must be in Persian script except for the "en" translation field.**

Guidelines

Interpret each poem at three levels:
1. Literal meaning — what the text says directly, with attention to syntax and word choice.
2. Symbolic or mystical meaning — metaphors, Sufi concepts, philosophical layers, and hidden meanings.
3. Cultural or historical meaning — contextual significance, literary traditions, and intertextual connections.

For EACH BEYT (couplet), provide scholarly-level analysis IN PERSIAN:
- NEVER use generic phrases like "این بیت درباره...است" or "this line discusses..."
- Instead, provide SPECIFIC literary interpretation that reveals the nuances, wordplay, and deeper meanings
- Explain HOW the poet achieves their effect through diction, imagery, syntax, and literary devices
- Connect to broader themes in Persian literature when relevant
- Identify ambiguities, double meanings, and layers of interpretation
- Your analysis should help readers truly understand what makes this particular couplet meaningful
- REMEMBER: Write ALL analysis in Persian/Farsi

Identify literary devices with specific examples from the text (e.g. metaphor, ambiguity, allusion, antithesis, simile, pun, irony, tajnis, tazād, talmi).

If the poet, form, or meter is unknown, return "unknown" and explain briefly IN PERSIAN.

Every claim or theme must cite at least one beyt index (couplet number).

If meaning is uncertain or multiple interpretations are equally valid, include explanation under "uncertainty" IN PERSIAN.

Always return valid JSON only — no extra text or commentary. All text content MUST be in Persian except the "en" field in translation.

Output Format (JSON schema)
{
  "meta": {
    "poet": "string|null",
    "era": "string|null",
    "form": "ghazal|rubai|masnavi|nimaei|free|unknown",
    "meter": "string|null",
    "rhyme_radif": "string|null",
    "source": "string|null"
  },
  "overall_meaning": {
    "one_sentence": "string",
    "paragraph": "string",
    "key_claims": [
      {"claim": "string", "evidence_beyts": [1,2]}
    ]
  },
  "themes": [
    {"theme": "string", "explanation": "string", "evidence_beyts": [1,3]}
  ],
  "symbols": [
    {
      "symbol": "string",
      "meanings": ["string"],
      "evidence_terms": ["string"],
      "example_beyts": [2]
    }
  ],
  "devices": [
    {
      "device": "metaphor|allusion|ambiguity|antithesis|pun|simile|symbolism|irony",
      "quote": "string (exact from poem)",
      "beyt": 1,
      "explanation": "string"
    }
  ],
  "per_beyt": [
    {
      "beyt_index": 1,
      "literal": "string (the couplet text itself)",
      "readings": [
        {
          "type": "symbolic|mystical|ethical|social|romantic|philosophical",
          "text": "DETAILED scholarly analysis - must be specific, thorough, and avoid generic phrases. Explain the nuances, wordplay, imagery, and deeper meanings. Discuss HOW the poet achieves their literary effect.",
          "confidence": 0.9
        }
      ],
      "notes": "lexical, grammatical, prosodic, or rhetorical notes that illuminate the couplet"
    }
  ],
  "glossary": [
    {"term": "string", "lemma": "string", "note": "string"}
  ],
  "uncertainty": "string|null",
  "translation": {"en": "string", "register": "faithful|poetic|literal"}
}

User Prompt Template
TASK: Produce a detailed, PhD-level tafsir (interpretation) of Persian poetry in structured JSON.

INPUT:
- poem_original: <<<exact Persian text from Ganjoor>>>
- poet: <<<optional poet name>>>
- form|meter|rhyme: <<<optional from Ganjoor>>>
- needs: {depth: "scholarly", show_meter: true, show_rhyme: true, max_symbols: 8}

CRITICAL REQUIREMENTS FOR PER_BEYT ANALYSIS:
- Each reading must be thorough, specific, and scholarly
- AVOID generic openings like "این بیت درباره...است" or "this beit is about..."
- Instead, directly explain the literary meaning, nuances, wordplay, and significance
- Discuss specific word choices, imagery, metaphors, and how they create meaning
- Connect to larger themes and literary traditions when relevant
- Your analysis should genuinely help readers understand and appreciate the poetry

CONSTRAINTS:
- Return valid JSON only, matching the schema above.
- Beyt indices start at 1.
- Provide at least 3 themes and 3 symbols when the poem allows.
- Each per_beyt reading should be substantial and insightful (3-5 sentences minimum).`;

          const userPrompt = `TASK: Produce a detailed, PhD-level tafsir (interpretation) of Persian poetry in structured JSON.

**CRITICAL: Write ALL analysis in Persian/Farsi (فارسی). Do NOT write in English except for the "en" translation field.**

INPUT:
- poem_original: ${poem.text}
- poet: ${poem.poet?.name || 'unknown'}
- form|meter|rhyme: unknown
- needs: {depth: "scholarly", show_meter: true, show_rhyme: true, max_symbols: 8}

CRITICAL REQUIREMENTS FOR PER_BEYT ANALYSIS (همه به فارسی):
- Each reading must be thorough, specific, and scholarly - WRITTEN IN PERSIAN
- AVOID generic openings like "این بیت درباره...است" or "this beit is about..."
- Instead, directly explain the literary meaning, nuances, wordplay, and significance IN PERSIAN
- Discuss specific word choices, imagery, metaphors, and how they create meaning IN PERSIAN
- Connect to larger themes and literary traditions when relevant IN PERSIAN
- Your analysis should genuinely help readers understand and appreciate the poetry
- REMEMBER: ALL text must be in Persian/Farsi except the "en" translation field

CONSTRAINTS:
- Return valid JSON only, matching the schema above.
- Beyt indices start at 1.
- Provide at least 3 themes and 3 symbols when the poem allows.
- Each per_beyt reading should be substantial and insightful (3-5 sentences minimum).
- ALL ANALYSIS TEXT MUST BE IN PERSIAN (فارسی) - this is non-negotiable.`;

          console.log(`🤖 Attempting comprehensive tafsir for poem ${poem.id} in Persian`);

          // Create AbortController for timeout
          const controller = new AbortController();
          let timeoutId: ReturnType<typeof setTimeout> | undefined;
          
          try {
            timeoutId = setTimeout(() => {
              console.log(`Tafsir timeout after 60 seconds for poem ${poem.id}`);
              controller.abort();
            }, 60000); // 60 seconds timeout for PhD-level comprehensive analysis
            
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${openaiApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "gpt-4o", // Using advanced model for scholarly analysis
                messages: [
                  {
                    role: "system",
                    content: systemPrompt
                  },
                  {
                    role: "user",
                    content: userPrompt
                  }
                ],
                max_tokens: 3000, // Increased for more detailed per-beyt analysis
                temperature: 0.3, // Lower temperature for more consistent scholarly output
                response_format: { type: "json_object" },
              }),
              signal: controller.signal
            });
            
            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = undefined;
            }

            if (response.ok) {
              const data = await response.json();
              const tafsir = data.choices[0]?.message?.content;

              if (tafsir) {
                try {
                  // Parse the comprehensive tafsir
                  const tafsirData = JSON.parse(tafsir);
                  
                  // Transform to app format
                  const transformedExplanation = {
                    generalMeaning: tafsirData.overall_meaning?.paragraph || tafsirData.overall_meaning?.one_sentence || 'تفسیر در دسترس نیست',
                    mainThemes: tafsirData.themes?.map(t => t.theme).join('، ') || 'موضوعات مشخص نشده',
                    imagerySymbols: tafsirData.symbols?.map(s => `${s.symbol}: ${s.meanings.join('، ')}`).join(' | ') || 'نمادها و تصاویر مشخص نشده',
                    lineByLine: tafsirData.per_beyt?.map(beyt => {
                      // Use the most detailed reading (longest text) or combine multiple readings
                      let meaningText = 'معنا مشخص نشده';
                      
                      if (beyt.readings && beyt.readings.length > 0) {
                        // Sort readings by length to get the most detailed one
                        const sortedReadings = [...beyt.readings].sort((a, b) => 
                          (b.text?.length || 0) - (a.text?.length || 0)
                        );
                        
                        // Use the most detailed reading
                        meaningText = sortedReadings[0].text || 'معنا مشخص نشده';
                        
                        // If there are additional readings with different types, append them
                        if (sortedReadings.length > 1) {
                          const additionalReadings = sortedReadings.slice(1)
                            .filter(r => r.type !== sortedReadings[0].type && r.text && r.text.length > 50)
                            .map(r => r.text);
                          
                          if (additionalReadings.length > 0) {
                            meaningText += ' ' + additionalReadings.join(' ');
                          }
                        }
                      }
                      
                      return {
                        original: beyt.literal || '',
                        meaning: meaningText
                      };
                    }) || [],
                    // Additional detailed data for advanced features
                    fullTafsir: tafsirData
                  };
                  
                  // Cache the comprehensive explanation
                  await kv.set(explanationKey, transformedExplanation);
                  console.log(`✓ Cached comprehensive tafsir for poem ${poem.id} in Persian`);
                  return c.json({ explanation: transformedExplanation });
                } catch (parseError) {
                  console.warn('Failed to parse tafsir JSON, falling back to simple explanation:', parseError);
                  throw parseError; // Will trigger fallback
                }
              }
            } else {
              const errorData = await response.json();
              console.warn("OpenAI API error for tafsir:", errorData);
            }
          } catch (error) {
            if (timeoutId) {
              clearTimeout(timeoutId);
            }
            throw error; // Re-throw to outer catch
          }
        } else {
          // English analysis - simpler format
          const prompt = `Brief poem analysis in JSON:

${poem.text}

Format:
{
  "generalMeaning": "Brief overall meaning",
  "mainThemes": "Main themes",
  "imagerySymbols": "Imagery and symbols",
  "lineByLine": [
    {"original": "Line1", "meaning": "Meaning"},
    {"original": "Line2", "meaning": "Meaning"}
  ]
}`;

          console.log(`🤖 Attempting OpenAI explanation for poem ${poem.id} in English`);

          // Create AbortController for timeout
          const controller = new AbortController();
          let timeoutId: ReturnType<typeof setTimeout> | undefined;
          
          try {
            timeoutId = setTimeout(() => {
              console.log(`Explanation timeout after 15 seconds for poem ${poem.id}`);
              controller.abort();
            }, 15000); // 15 seconds timeout
            
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${openaiApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                  {
                    role: "system",
                    content: "You are a Persian poetry expert. Give concise, helpful responses. Return only JSON."
                  },
                  {
                    role: "user",
                    content: prompt
                  }
                ],
                max_tokens: 800,
                temperature: 0.3,
                response_format: { type: "json_object" },
              }),
              signal: controller.signal
            });
            
            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = undefined;
            }

            if (response.ok) {
              const data = await response.json();
              const explanation = data.choices[0]?.message?.content;

              if (explanation) {
                try {
                  // Try to parse as JSON
                  const cleanedExplanation = explanation.replace(/```json\n?|```\n?/g, '').trim();
                  const explanationData = JSON.parse(cleanedExplanation);
                  
                  // Cache the structured explanation
                  await kv.set(explanationKey, explanationData);
                  console.log(`✓ Cached AI explanation for poem ${poem.id} in English`);
                  return c.json({ explanation: explanationData });
                } catch (parseError) {
                  console.warn('Failed to parse JSON explanation, using fallback:', parseError);
                  // Fallback to old format if JSON parsing fails
                  await kv.set(explanationKey, explanation);
                  console.log(`Cached fallback explanation for poem ${poem.id} in English`);
                  return c.json({ 
                    explanation: { 
                      generalMeaning: explanation 
                    } 
                  });
                }
              }
            } else {
              const errorData = await response.json();
              console.warn("OpenAI API error:", errorData);
            }
          } catch (error) {
            if (timeoutId) {
              clearTimeout(timeoutId);
            }
            throw error; // Re-throw to outer catch
          }
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn(`OpenAI API timeout for explanation of poem ${poem.id}:`, error);
        } else {
          console.warn(`Error calling OpenAI API for explanation of poem ${poem.id}:`, error);
        }
      }
    }

    // Fallback to local explanation
    console.log(`Generating fallback explanation for poem ${poem.id} in ${language}`);
    const fallbackExplanation = generateFallbackExplanation(poem, language);
    
    // Cache the fallback explanation
    await kv.set(explanationKey, fallbackExplanation);
    console.log(`Cached fallback explanation for poem ${poem.id} in ${language}`);

    return c.json({ explanation: fallbackExplanation });

  } catch (error) {
    console.error(`💥 Critical error in explanation endpoint for poem ${poem?.id || 'unknown'}:`, error);
    
    // Return a more specific error message
    let errorMessage = "Failed to generate poem explanation";
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error(`📊 Error details: ${error.name} - ${error.message}`);
      if (error.stack) {
        console.error(`📍 Stack trace:`, error.stack);
      }
    }
    
    return c.json({ 
      error: errorMessage,
      explanation: {
        generalMeaning: language === 'fa' 
          ? 'متأسفانه تفسیر این شعر در حال حاضر در دسترس نیست.'
          : 'Unfortunately, the explanation for this poem is not available at the moment.'
      }
    }, 500);
  }
});

// Add translation endpoint (alias for translate-poem)
app.post("/make-server-c192d0ee/translate", async (c) => {
  try {
    const { poem } = await c.req.json();
    
    if (!poem || !poem.text) {
      return c.json({ error: "Poem text is required" }, 400);
    }

    // Check if we already have a translation cached
    const translationKey = `translation:en:${poem.id}`;
    const cachedTranslation = await kv.get(translationKey);
    
    if (cachedTranslation) {
      console.log(`Returning cached translation for poem ${poem.id}`);
      return c.json({ translatedPoem: cachedTranslation });
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    
    // Try OpenAI first if API key is available
    if (openaiApiKey) {
      try {
        const prompt = `Translate this Persian poem to English while preserving its poetic beauty, meter, and meaning. Keep the same line structure:

${poem.text}

Title: ${poem.title}
Poet: ${poem.poet.name}

Please provide:
1. A translation that maintains the artistic and literary quality of the original Persian poetry
2. The English translation of the poem title "${poem.title}"
3. The English name/transliteration of the poet "${poem.poet.name}"

Format your response as:
POEM:
[translated poem text]

TITLE:
[English title]

POET:
[English name of poet]`;

        console.log(`Attempting to translate poem ${poem.id} to English`);

        // Create AbortController for timeout
        const controller = new AbortController();
        let timeoutId: ReturnType<typeof setTimeout> | undefined;
        
        try {
          timeoutId = setTimeout(() => {
            console.log(`Translation timeout after 10 seconds for poem ${poem.id}`);
            controller.abort();
          }, 10000); // 10 seconds timeout
          
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${openaiApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content: "You are an expert translator of Persian poetry to English. Preserve the poetic beauty, rhythm, and meaning while making it accessible to English readers. Maintain the line structure of the original. Also provide English translations for poem titles and English names/transliterations for Persian poets (e.g., حافظ = Hafez, مولانا = Rumi, سعدی = Saadi, فردوسی = Ferdowsi, نظامی = Nezami, عمر خیام = Omar Khayyam). For titles, translate them appropriately (e.g., غزل = Ghazal, رباعی = Quatrain, مثنوی = Masnavi)."
                },
                {
                  role: "user",
                  content: prompt
                }
              ],
              max_tokens: 800,
              temperature: 0.7,
            }),
            signal: controller.signal
          });
          
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = undefined;
          }

          if (response.ok) {
            const data = await response.json();
            const translation = data.choices[0]?.message?.content?.trim();

            if (translation) {
              // Parse the response to extract poem, title, and poet name
              let translatedText = translation;
              let translatedTitle = poem.title; // Default to original
              let poetName = poem.poet.name; // Default to original
              
              // Try to extract poem, title, and poet from structured response
              const poemMatch = translation.match(/POEM:\s*([\s\S]*?)(?=TITLE:|POET:|$)/);
              const titleMatch = translation.match(/TITLE:\s*(.*?)(?:\n|$)/);
              const poetMatch = translation.match(/POET:\s*(.*?)(?:\n|$)/);
              
              if (poemMatch && poemMatch[1]) {
                translatedText = poemMatch[1].trim();
              }
              
              if (titleMatch && titleMatch[1]) {
                translatedTitle = titleMatch[1].trim();
              }
              
              if (poetMatch && poetMatch[1]) {
                poetName = poetMatch[1].trim();
              } else {
                // Fallback: try to detect and translate common Persian poet names
                const persianToEnglish = {
                  'حافظ': 'Hafez',
                  'مولانا': 'Rumi', 
                  'سعدی': 'Saadi',
                  'فردوسی': 'Ferdowsi',
                  'نظامی': 'Nezami',
                  'عمر خیام': 'Omar Khayyam',
                  'خیام': 'Khayyam',
                  'عطار': 'Attar',
                  'جامی': 'Jami',
                  'رودکی': 'Rudaki'
                };
                
                for (const [persian, english] of Object.entries(persianToEnglish)) {
                  if (poem.poet.name.includes(persian)) {
                    poetName = english;
                    break;
                  }
                }
              }
              
              // Create translated poem object
              const translatedPoem = {
                ...poem,
                text: translatedText,
                htmlText: translatedText.replace(/\n/g, '<br/>'),
                title: translatedTitle,
                poet: {
                  ...poem.poet,
                  name: poetName
                }
              };
              
              // Cache the translation
              await kv.set(translationKey, translatedPoem);
              console.log(`✓ Cached translation for poem ${poem.id} with title: ${translatedTitle}, poet name: ${poetName}`);
              return c.json({ translatedPoem });
            }
          } else {
            const errorData = await response.json();
            console.warn("OpenAI API error:", errorData);
          }
        } catch (error) {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          throw error; // Re-throw to outer catch
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn(`OpenAI API timeout for translation of poem ${poem.id}:`, error);
        } else {
          console.warn(`Error calling OpenAI API for translation of poem ${poem.id}:`, error);
        }
      }
    }

    // Fallback: return null (no translation available)
    console.log(`No translation available for poem ${poem.id}, returning null`);
    return c.json({ translatedPoem: null });

  } catch (error) {
    console.error("Translate poem error:", error);
    return c.json({ error: "Failed to translate poem" }, 500);
  }
});

Deno.serve(app.fetch);