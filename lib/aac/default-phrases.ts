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
  { text: 'Hello!', category: 'social' },
  { text: 'Goodbye', category: 'social' },
  { text: 'Thank you', category: 'social' },
  { text: 'Please', category: 'social' },
  { text: 'Yes', category: 'social' },
  { text: 'No', category: 'social' },
  { text: "I don't know", category: 'social' },
  { text: 'Sorry', category: 'social' },
  { text: 'Excuse me', category: 'social' },
  { text: "You're welcome", category: 'social' },
  { text: 'Nice to see you', category: 'social' },
  { text: 'How are you?', category: 'social' },
  { text: "I'm fine", category: 'social' },

  // Needs / Requesting
  { text: 'I need help', category: 'needs' },
  { text: 'I need a break', category: 'needs' },
  { text: 'I am hungry', category: 'needs' },
  { text: 'I am thirsty', category: 'needs' },
  { text: 'I need the bathroom', category: 'needs' },
  { text: 'I want more', category: 'needs' },
  { text: 'I want that', category: 'needs' },
  { text: 'Can I have it?', category: 'needs' },
  { text: 'I need a drink', category: 'needs' },
  { text: 'I need my medicine', category: 'needs' },
  { text: 'I am done', category: 'needs' },
  { text: 'Again, please', category: 'needs' },
  { text: 'I need to rest', category: 'needs' },

  // Rejecting / Protesting
  { text: 'No thank you', category: 'rejecting' },
  { text: 'Stop', category: 'rejecting' },
  { text: "I don't want that", category: 'rejecting' },
  { text: 'All done', category: 'rejecting' },
  { text: 'Not now', category: 'rejecting' },
  { text: "I don't like that", category: 'rejecting' },
  { text: 'Leave me alone', category: 'rejecting' },
  { text: 'Too loud', category: 'rejecting' },
  { text: 'I need space', category: 'rejecting' },
  { text: 'Wait', category: 'rejecting' },

  // Feelings
  { text: 'I am happy', category: 'feelings' },
  { text: 'I am sad', category: 'feelings' },
  { text: 'I am upset', category: 'feelings' },
  { text: 'I am tired', category: 'feelings' },
  { text: 'I am angry', category: 'feelings' },
  { text: 'I am scared', category: 'feelings' },
  { text: 'I am excited', category: 'feelings' },
  { text: 'I am bored', category: 'feelings' },
  { text: 'I am confused', category: 'feelings' },
  { text: 'I am worried', category: 'feelings' },
  { text: 'I am proud', category: 'feelings' },
  { text: 'I am calm', category: 'feelings' },
  { text: 'I am overwhelmed', category: 'feelings' },

  // Questions
  { text: 'What is this?', category: 'questions' },
  { text: 'Who is that?', category: 'questions' },
  { text: 'Where is it?', category: 'questions' },
  { text: 'When?', category: 'questions' },
  { text: 'Why?', category: 'questions' },
  { text: 'How?', category: 'questions' },
  { text: 'Can you help me?', category: 'questions' },
  { text: 'What happened?', category: 'questions' },
  { text: 'Is it time to go?', category: 'questions' },
  { text: 'What are we doing next?', category: 'questions' },

  // Describing
  { text: 'Big', category: 'describing' },
  { text: 'Small', category: 'describing' },
  { text: 'Hot', category: 'describing' },
  { text: 'Cold', category: 'describing' },
  { text: 'Fast', category: 'describing' },
  { text: 'Slow', category: 'describing' },
  { text: 'Loud', category: 'describing' },
  { text: 'Quiet', category: 'describing' },
  { text: 'Good', category: 'describing' },
  { text: 'Bad', category: 'describing' },
  { text: 'Funny', category: 'describing' },
  { text: 'I like it', category: 'describing' },
  { text: 'Cool!', category: 'describing' },
  { text: 'Yuck', category: 'describing' },

  // Directing others
  { text: 'Come here', category: 'directing' },
  { text: 'Look', category: 'directing' },
  { text: 'Listen', category: 'directing' },
  { text: 'Your turn', category: 'directing' },
  { text: 'My turn', category: 'directing' },
  { text: 'Follow me', category: 'directing' },
  { text: 'Sit down', category: 'directing' },
  { text: 'Come with me', category: 'directing' },

  // Mealtime
  { text: "I'm still hungry", category: 'mealtime' },
  { text: 'I want water', category: 'mealtime' },
  { text: 'I want juice', category: 'mealtime' },
  { text: 'I want a snack', category: 'mealtime' },
  { text: 'This tastes good', category: 'mealtime' },
  { text: "I don't like this food", category: 'mealtime' },
  { text: 'I am full', category: 'mealtime' },
  { text: 'Can I have more food?', category: 'mealtime' },
  { text: 'I want to order', category: 'mealtime' },
  { text: 'Where is the menu?', category: 'mealtime' },

  // School
  { text: 'I need a pencil', category: 'school' },
  { text: 'I need paper', category: 'school' },
  { text: 'I finished my work', category: 'school' },
  { text: "I don't understand", category: 'school' },
  { text: 'Can you repeat that?', category: 'school' },
  { text: 'I want to answer', category: 'school' },
  { text: 'Is it recess?', category: 'school' },
  { text: 'I need my teacher', category: 'school' },
  { text: 'Where do I sit?', category: 'school' },
  { text: 'I want to read', category: 'school' },

  // Community outings
  { text: 'I want to go to the store', category: 'community' },
  { text: 'Where is the bathroom?', category: 'community' },
  { text: 'I need to see the doctor', category: 'community' },
  { text: 'When is the bus coming?', category: 'community' },
  { text: 'Can we go to the park?', category: 'community' },
  { text: 'I want to go home', category: 'community' },
  { text: 'How much does it cost?', category: 'community' },
  { text: 'I am lost', category: 'community' },
  { text: 'Can you help me find my family?', category: 'community' },

  // Medical / Emergency
  { text: 'I feel sick', category: 'emergency' },
  { text: 'I am in pain', category: 'emergency' },
  { text: 'Call my caregiver', category: 'emergency' },
  { text: 'Help', category: 'emergency' },
  { text: 'It hurts here', category: 'emergency' },
  { text: 'I need a doctor', category: 'emergency' },
  { text: 'Call 911', category: 'emergency' },
  { text: 'I feel dizzy', category: 'emergency' },
  { text: 'I need my medicine now', category: 'emergency' },
  { text: 'This is an emergency', category: 'emergency' },
  { text: 'I feel better now', category: 'emergency' },

  // Play & recreation
  { text: 'I want to play', category: 'play' },
  { text: 'Can we play together?', category: 'play' },
  { text: 'I want to watch TV', category: 'play' },
  { text: 'I want to listen to music', category: 'play' },
  { text: "Let's play outside", category: 'play' },
  { text: 'I want to draw', category: 'play' },
  { text: 'That was fun', category: 'play' },
  { text: 'Can we do that again?', category: 'play' },
  { text: 'I want a different game', category: 'play' },

  // Home & family routines
  { text: 'I want to go to bed', category: 'home' },
  { text: 'I want to wake up', category: 'home' },
  { text: 'I need to brush my teeth', category: 'home' },
  { text: 'I need to get dressed', category: 'home' },
  { text: 'I want to take a bath', category: 'home' },
  { text: 'Where is Mom?', category: 'home' },
  { text: 'Where is Dad?', category: 'home' },
  { text: 'I want to see my family', category: 'home' },
  { text: 'Is it bedtime?', category: 'home' },
  { text: 'I am ready', category: 'home' },

  // Choice-making
  { text: 'This one', category: 'choices' },
  { text: 'That one', category: 'choices' },
  { text: 'Either is fine', category: 'choices' },
  { text: 'I choose this', category: 'choices' },
  { text: 'Something else', category: 'choices' },

  // Conversation / commenting
  { text: "That's funny", category: 'conversation' },
  { text: 'I agree', category: 'conversation' },
  { text: 'I disagree', category: 'conversation' },
  { text: 'Tell me more', category: 'conversation' },
  { text: 'I have an idea', category: 'conversation' },
  { text: 'Guess what?', category: 'conversation' },
  { text: 'That reminds me of something', category: 'conversation' },
]
