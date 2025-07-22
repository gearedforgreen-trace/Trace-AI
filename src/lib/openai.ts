import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type AnalyseMaterialAndCountResponse = {
  itemName: string;
  itemCount: number;
  confidence: number;
  claim_count: number;
  status: 'accept' | 'reject';
  status_reason:
    | 'count_discrepancy' // Item count differs too much from user claim
    | 'low_confidence' // Confidence score below threshold
    | 'material_mismatch' // Detected material is different from expected/plastic bottles
    | 'image_not_clear' // Image quality too poor for reliable detection
    | 'no_items_detected' // No relevant items found in the image
    | null;
  failure_message: string | null;
  reverify_required: boolean;
};

export async function analyseMaterialAndCount({
  claim_count,
  min_confidence,
  image_url,
  material,
}: {
  claim_count: number;
  min_confidence: number;
  image_url: string;
  material: string;
}): Promise<AnalyseMaterialAndCountResponse | null> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `
Analyze the image and count the number of plastic bottles.
The user claims the item count is: ${claim_count}
The minimum confidence required is: ${min_confidence}

Respond only in strict JSON format like this:

{
  "itemName": "${material}",
  "itemCount": <number>,
  "confidence": <number>,
  "claim_count": <number>,
  "status": "accept" | "reject",
  "status_reason": 
  | "count_discrepancy"       // Item count differs too much from what you provided
  | "low_confidence"          // Confidence score below threshold
  | "material_mismatch"       // Detected material is different from expected/plastic bottles
  | "image_not_clear"         // Image quality too poor for reliable detection
  | "no_items_detected"       // No relevant items found in the image
  | null                      // No issues, status = accept
  "failure_message": "<string or null>"
  "reverify_required": <boolean>
}

Replace "${material}" if a different material is detected.

"status" is "accept" only if:

abs(itemCount - claim_count) <= 2

confidence >= <min_confidence>

If "status" is "reject", explain why in failure_message.

Example: "Detected count is too different from what you provided"

Or: "Confidence is too low to verify material"

If "status" is "accept", set "status_reason" and "failure_message" to null.

Do not include extra text, markdown, or code blocks. eg \`\`\`json \`\`\``,
          },
          {
            type: 'image_url',
            image_url: { url: image_url },
          },
        ],
      },
    ],
    max_tokens: 300,
  });

  const text = response.choices[0].message.content;
  try {
    if (!text) return null;
    const json = JSON.parse(text);
    return json as AnalyseMaterialAndCountResponse;
  } catch {
    return null;
  }
}
