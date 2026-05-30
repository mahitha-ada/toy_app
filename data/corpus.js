// A tiny labelled corpus. The sentences fall into a few obvious topics so that
// when you project them to 2-D you can literally SEE them cluster, and semantic
// search has something interesting to rank. Labels are only used for colouring
// the plots — the model never sees them.

export const corpus = [
  // --- animals / pets ---
  { text: "The cat slept on the warm windowsill all afternoon.", topic: "animals" },
  { text: "My dog loves chasing tennis balls in the park.", topic: "animals" },
  { text: "A kitten is just a baby cat with very sharp claws.", topic: "animals" },
  { text: "Puppies need a lot of training and patience.", topic: "animals" },

  // --- cooking / food ---
  { text: "Whisk the eggs and sugar until the mixture turns pale.", topic: "cooking" },
  { text: "Add a pinch of salt to bring out the flavour of the soup.", topic: "cooking" },
  { text: "Let the bread dough rise for about an hour before baking.", topic: "cooking" },
  { text: "Fresh basil makes a simple tomato pasta taste amazing.", topic: "cooking" },

  // --- space / astronomy ---
  { text: "The telescope captured a stunning image of a distant galaxy.", topic: "space" },
  { text: "Astronauts aboard the station orbit the Earth every 90 minutes.", topic: "space" },
  { text: "A black hole bends light so strongly that nothing escapes it.", topic: "space" },
  { text: "Mars is often called the red planet because of its iron-rich dust.", topic: "space" },

  // --- programming / software ---
  { text: "I refactored the function to remove a nasty null-pointer bug.", topic: "programming" },
  { text: "Git lets several developers work on the same codebase at once.", topic: "programming" },
  { text: "The API returns JSON that the front end parses and renders.", topic: "programming" },
  { text: "Unit tests caught the regression before it reached production.", topic: "programming" },

  // --- finance / money ---
  { text: "Diversifying your portfolio reduces overall investment risk.", topic: "finance" },
  { text: "The central bank raised interest rates to curb inflation.", topic: "finance" },
  { text: "She paid off her credit card to avoid the high interest charges.", topic: "finance" },
  { text: "Stock prices fell sharply after the disappointing earnings report.", topic: "finance" },
];

export const texts = corpus.map((c) => c.text);
export const topics = corpus.map((c) => c.topic);

// A stable colour per topic for the visualisations (front end + terminal).
export const topicColors = {
  animals: "#e6550d",
  cooking: "#31a354",
  space: "#3182bd",
  programming: "#756bb1",
  finance: "#e7298a",
};
