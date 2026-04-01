interface SenderInfo {
  username: string;
}

interface PopulatedMessage {
  content: string;
  sender: SenderInfo | string;
}

export const aiService = {
  async generateVibeSummary(messages: PopulatedMessage[]): Promise<string> {
    const conversationText = messages
      .map((m) => {
        const senderName =
          typeof m.sender === 'string' ? 'Unknown' : (m.sender as SenderInfo).username || 'Unknown';
        return `${senderName}: ${m.content}`;
      })
      .join('\n');

    const prompt = `You are a witty, playful chat analyst giving a "vibe check" on a conversation. 
Keep it short, fun, and helpful. Mention the key topics discussed and the overall mood of the chat.
Use casual language and maybe throw in some emojis. Max 2-3 sentences.

Chat messages:
${conversationText}

Vibe check summary:`;

    console.log('--- AI PROMPT START ---');
    console.log(prompt);
    console.log('--- AI PROMPT END ---');

    try {
      const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
        headers: {
          Authorization: 'Bearer ' + process.env.HUGGINGFACE_API_KEY,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          model: 'meta-llama/Llama-3.2-1B-Instruct',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 150,
        }),
      });

      const data = (await response.json()) as {
        choices?: Array<{ message: { content: string } }>;
      };
      console.log('AI RAW DATA:', data);

      if (data.choices && data.choices.length > 0) {
        console.log('AI FINAL SUMMARY:', data.choices[0].message.content);
        return data.choices[0].message.content.trim();
      }
      return 'No response generated.';
    } catch (error) {
      console.error('Hugging Face API Error:', JSON.stringify(error, null, 2));
      throw error;
    }
  },
};
