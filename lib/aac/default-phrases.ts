/**
 * AAC Default Phrases
 *
 * Pre-baked set of common phrases organized by category.
 * These are always displayed in the Quick Phrases page regardless of speaker selection.
 * Used as a fallback when no custom phrases exist.
 * Per TRD §7.7, each phrase has: text, category, and optional icon.
 *
 * `category` values are lowercase slugs matching `AAC_CATEGORIES` in
 * `./symbol-provider.ts`, so phrase categories and symbol categories share
 * one taxonomy.
 */

export type DefaultPhrase = {
  text: string
  category: string
  icon?: string
}

export const DEFAULT_PHRASES: DefaultPhrase[] = [
  // Social
  { text: 'Hello!', category: 'social', icon: '👋' },
  { text: 'Goodbye', category: 'social', icon: '👋' },
  { text: 'Thank you', category: 'social', icon: '🙏' },
  { text: 'Please', category: 'social', icon: '🙏' },
  { text: 'Yes', category: 'social', icon: '✅' },
  { text: 'No', category: 'social', icon: '❌' },
  { text: "I don't know", category: 'social', icon: '🤷' },
  { text: 'Sorry', category: 'social', icon: '🙇' },
  { text: 'Excuse me', category: 'social', icon: '🙋' },
  { text: "You're welcome", category: 'social', icon: '🤝' },
  { text: 'Nice to see you', category: 'social', icon: '😊' },
  { text: 'How are you?', category: 'social', icon: '❓' },
  { text: "I'm fine", category: 'social', icon: '🙂' },

  // Needs / Requesting
  { text: 'I need help', category: 'needs', icon: '🆘' },
  { text: 'I need a break', category: 'needs', icon: '⏸️' },
  { text: 'I am hungry', category: 'needs', icon: '🍽️' },
  { text: 'I am thirsty', category: 'needs', icon: '🥤' },
  { text: 'I need the bathroom', category: 'needs', icon: '🚻' },
  { text: 'I want more', category: 'needs', icon: '➕' },
  { text: 'I want that', category: 'needs', icon: '👉' },
  { text: 'Can I have it?', category: 'needs', icon: '🤲' },
  { text: 'I need a drink', category: 'needs', icon: '🥤' },
  { text: 'I need my medicine', category: 'needs', icon: '💊' },
  { text: 'I am done', category: 'needs', icon: '✅' },
  { text: 'Again, please', category: 'needs', icon: '🔁' },
  { text: 'I need to rest', category: 'needs', icon: '🛏️' },

  // Rejecting / Protesting
  { text: 'No thank you', category: 'rejecting', icon: '🙅' },
  { text: 'Stop', category: 'rejecting', icon: '🛑' },
  { text: "I don't want that", category: 'rejecting', icon: '🙅' },
  { text: 'All done', category: 'rejecting', icon: '✅' },
  { text: 'Not now', category: 'rejecting', icon: '⏳' },
  { text: "I don't like that", category: 'rejecting', icon: '👎' },
  { text: 'Leave me alone', category: 'rejecting', icon: '🚶' },
  { text: 'Too loud', category: 'rejecting', icon: '🔊' },
  { text: 'I need space', category: 'rejecting', icon: '↔️' },
  { text: 'Wait', category: 'rejecting', icon: '✋' },

  // Feelings
  { text: 'I am happy', category: 'feelings', icon: '😀' },
  { text: 'I am sad', category: 'feelings', icon: '😢' },
  { text: 'I am upset', category: 'feelings', icon: '😟' },
  { text: 'I am tired', category: 'feelings', icon: '😴' },
  { text: 'I am angry', category: 'feelings', icon: '😠' },
  { text: 'I am scared', category: 'feelings', icon: '😨' },
  { text: 'I am excited', category: 'feelings', icon: '🤩' },
  { text: 'I am bored', category: 'feelings', icon: '😐' },
  { text: 'I am confused', category: 'feelings', icon: '😕' },
  { text: 'I am worried', category: 'feelings', icon: '😰' },
  { text: 'I am proud', category: 'feelings', icon: '🏅' },
  { text: 'I am calm', category: 'feelings', icon: '😌' },
  { text: 'I am overwhelmed', category: 'feelings', icon: '😵' },

  // Questions
  { text: 'What is this?', category: 'questions', icon: '❓' },
  { text: 'Who is that?', category: 'questions', icon: '👤' },
  { text: 'Where is it?', category: 'questions', icon: '📍' },
  { text: 'When?', category: 'questions', icon: '🕒' },
  { text: 'Why?', category: 'questions', icon: '❓' },
  { text: 'How?', category: 'questions', icon: '🛠️' },
  { text: 'Can you help me?', category: 'questions', icon: '🆘' },
  { text: 'What happened?', category: 'questions', icon: '❓' },
  { text: 'Is it time to go?', category: 'questions', icon: '🚪' },
  { text: 'What are we doing next?', category: 'questions', icon: '➡️' },

  // Describing
  { text: 'Big', category: 'describing', icon: '🐘' },
  { text: 'Small', category: 'describing', icon: '🐭' },
  { text: 'Hot', category: 'describing', icon: '🔥' },
  { text: 'Cold', category: 'describing', icon: '🧊' },
  { text: 'Fast', category: 'describing', icon: '🐇' },
  { text: 'Slow', category: 'describing', icon: '🐢' },
  { text: 'Loud', category: 'describing', icon: '📣' },
  { text: 'Quiet', category: 'describing', icon: '🤫' },
  { text: 'Good', category: 'describing', icon: '👍' },
  { text: 'Bad', category: 'describing', icon: '👎' },
  { text: 'Funny', category: 'describing', icon: '😂' },
  { text: 'I like it', category: 'describing', icon: '👍' },
  { text: 'Cool!', category: 'describing', icon: '😎' },
  { text: 'Yuck', category: 'describing', icon: '🤢' },

  // Directing others
  { text: 'Come here', category: 'directing', icon: '👋' },
  { text: 'Look', category: 'directing', icon: '👀' },
  { text: 'Listen', category: 'directing', icon: '👂' },
  { text: 'Your turn', category: 'directing', icon: '👉' },
  { text: 'My turn', category: 'directing', icon: '🙋' },
  { text: 'Follow me', category: 'directing', icon: '🚶' },
  { text: 'Sit down', category: 'directing', icon: '🪑' },
  { text: 'Come with me', category: 'directing', icon: '👫' },

  // Mealtime
  { text: "I'm still hungry", category: 'mealtime', icon: '🍽️' },
  { text: 'I want water', category: 'mealtime', icon: '💧' },
  { text: 'I want juice', category: 'mealtime', icon: '🧃' },
  { text: 'I want a snack', category: 'mealtime', icon: '🍎' },
  { text: 'This tastes good', category: 'mealtime', icon: '😋' },
  { text: "I don't like this food", category: 'mealtime', icon: '🙅' },
  { text: 'I am full', category: 'mealtime', icon: '🍽️' },
  { text: 'Can I have more food?', category: 'mealtime', icon: '➕' },
  { text: 'I want to order', category: 'mealtime', icon: '🛎️' },
  { text: 'Where is the menu?', category: 'mealtime', icon: '📋' },

  // School
  { text: 'I need a pencil', category: 'school', icon: '✏️' },
  { text: 'I need paper', category: 'school', icon: '📄' },
  { text: 'I finished my work', category: 'school', icon: '✅' },
  { text: "I don't understand", category: 'school', icon: '😕' },
  { text: 'Can you repeat that?', category: 'school', icon: '🔁' },
  { text: 'I want to answer', category: 'school', icon: '🙋' },
  { text: 'Is it recess?', category: 'school', icon: '🛝' },
  { text: 'I need my teacher', category: 'school', icon: '🧑‍🏫' },
  { text: 'Where do I sit?', category: 'school', icon: '🪑' },
  { text: 'I want to read', category: 'school', icon: '📖' },

  // Community outings
  { text: 'I want to go to the store', category: 'community', icon: '🏪' },
  { text: 'Where is the bathroom?', category: 'community', icon: '🚻' },
  { text: 'I need to see the doctor', category: 'community', icon: '🩺' },
  { text: 'When is the bus coming?', category: 'community', icon: '🚌' },
  { text: 'Can we go to the park?', category: 'community', icon: '🌳' },
  { text: 'I want to go home', category: 'community', icon: '🏠' },
  { text: 'How much does it cost?', category: 'community', icon: '💰' },
  { text: 'I am lost', category: 'community', icon: '🧭' },
  {
    text: 'Can you help me find my family?',
    category: 'community',
    icon: '👪',
  },

  // Medical / Emergency
  { text: 'I feel sick', category: 'emergency', icon: '🤒' },
  { text: 'I am in pain', category: 'emergency', icon: '🩹' },
  { text: 'Call my caregiver', category: 'emergency', icon: '📞' },
  { text: 'Help', category: 'emergency', icon: '🆘' },
  { text: 'It hurts here', category: 'emergency', icon: '👉' },
  { text: 'I need a doctor', category: 'emergency', icon: '🩺' },
  { text: 'Call 911', category: 'emergency', icon: '🚑' },
  { text: 'I feel dizzy', category: 'emergency', icon: '😵' },
  { text: 'I need my medicine now', category: 'emergency', icon: '💊' },
  { text: 'This is an emergency', category: 'emergency', icon: '🚨' },
  { text: 'I feel better now', category: 'emergency', icon: '🙂' },

  // Play & recreation
  { text: 'I want to play', category: 'play', icon: '🧸' },
  { text: 'Can we play together?', category: 'play', icon: '👫' },
  { text: 'I want to watch TV', category: 'play', icon: '📺' },
  { text: 'I want to listen to music', category: 'play', icon: '🎵' },
  { text: "Let's play outside", category: 'play', icon: '🌳' },
  { text: 'I want to draw', category: 'play', icon: '🎨' },
  { text: 'That was fun', category: 'play', icon: '😄' },
  { text: 'Can we do that again?', category: 'play', icon: '🔁' },
  { text: 'I want a different game', category: 'play', icon: '🎲' },

  // Home & family routines
  { text: 'I want to go to bed', category: 'home', icon: '🛏️' },
  { text: 'I want to wake up', category: 'home', icon: '🌅' },
  { text: 'I need to brush my teeth', category: 'home', icon: '🪥' },
  { text: 'I need to get dressed', category: 'home', icon: '👕' },
  { text: 'I want to take a bath', category: 'home', icon: '🛁' },
  { text: 'Where is Mom?', category: 'home', icon: '👩' },
  { text: 'Where is Dad?', category: 'home', icon: '👨' },
  { text: 'I want to see my family', category: 'home', icon: '👪' },
  { text: 'Is it bedtime?', category: 'home', icon: '🌙' },
  { text: 'I am ready', category: 'home', icon: '✅' },

  // Choice-making
  { text: 'This one', category: 'choices', icon: '👇' },
  { text: 'That one', category: 'choices', icon: '👉' },
  { text: 'Either is fine', category: 'choices', icon: '🤷' },
  { text: 'I choose this', category: 'choices', icon: '✅' },
  { text: 'Something else', category: 'choices', icon: '🔄' },

  // Conversation / commenting
  { text: "That's funny", category: 'conversation', icon: '😂' },
  { text: 'I agree', category: 'conversation', icon: '👍' },
  { text: 'I disagree', category: 'conversation', icon: '👎' },
  { text: 'Tell me more', category: 'conversation', icon: '💬' },
  { text: 'I have an idea', category: 'conversation', icon: '💡' },
  { text: 'Guess what?', category: 'conversation', icon: '🎁' },
  {
    text: 'That reminds me of something',
    category: 'conversation',
    icon: '💭',
  },
]
