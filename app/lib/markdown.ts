import { Marked } from "marked";

export const markdown = new Marked({
  breaks: true,
});

export function convertUrlsToImageMarkdown(text: string): string {
  const imageUrlRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/gi;
  return text.replace(imageUrlRegex, "![$1]($1)");
}
