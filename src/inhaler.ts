import { z } from "zod";

// const id = z.custom<string>((val) => typeof val === "string");
const ReponseSchema = z.object({
  condition: z.any(),
  text: z.string(),
  topic: z.string(),
  effect: z.any(),
});

const TalkTopicSchema = z.object({
  type: z.literal("talk_topic"),
  id: z.string(),
  dynamic_line: z.preprocess((val) => JSON.stringify(val), z.string()),
  responses: z.array(ReponseSchema),
});

export const inhaler = async () => {
  const jsons = import.meta.glob("/public/data/**");
  const talkTopics: z.infer<typeof TalkTopicSchema>[] = new Array();
  for (const path in jsons) {
    const stuff = await jsons[path]();
    const jsonObjects = (stuff as any).default as unknown[];
    jsonObjects.forEach((obj) => {
      try {
        talkTopics.push(TalkTopicSchema.parse(obj));
      } catch (e) {
        return false;
      }
    });
  }
  return talkTopics;
};
