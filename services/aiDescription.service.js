const { CohereClient } = require("cohere-ai");

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

const generateBookDescription = async (title, author) => {
  const prompt = `Write an engaging and compelling book description for a book titled "${title}" written by ${author}.`;

  const response = await cohere.generate({
    model: "command",
    prompt,
    maxTokens: 120,
  });

  return response.generations[0].text.trim();
};

module.exports = generateBookDescription;
