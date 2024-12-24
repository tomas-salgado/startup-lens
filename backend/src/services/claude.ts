import Anthropic from "@anthropic-ai/sdk";

interface VideoSource {
  videoName: string;
  chapterName: string;
  text: string;
  timestampUrl: string;
}

export class ClaudeService {
  private client: Anthropic;

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }

    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }

  async answerQuestion(question: string, sources: VideoSource[]) {
    const formattedSources = sources.map((source, index) => `
      [Source ${index + 1}]
      Video: ${source.videoName}
      Chapter: ${source.chapterName}
      URL: ${source.timestampUrl}
      Content: ${source.text}
    `).join('\n\n');

    const systemPrompt = `You are an AI assistant that helps answer questions about startups using Y Combinator's video content.

When answering questions:
1. ALWAYS start your response with "Source Videos:" followed by a list of the timestampUrls from the provided sources
2. Format each source as: "- [Video Name - Chapter Name](timestampUrl)"
3. Then provide a clear, concise answer based on the content
4. Use bullet points and clear formatting when appropriate
5. Only use information from the provided source materials

Here are the relevant video segments:
${formattedSources}

Remember to use the exact timestampUrl provided in the sources for each video link.`;

    const msg = await this.client.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1500,
      temperature: 0,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Please answer this question about startups: ${question}`
        }
      ]
    });

    const content = msg.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    return content.text;
  }
}
