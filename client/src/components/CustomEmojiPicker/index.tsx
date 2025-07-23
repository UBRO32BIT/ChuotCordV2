import { EmojiPicker } from "frimousse";

export function CustomEmojiPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
    return (
      <EmojiPicker.Root onEmojiSelect={(emoji) => onSelect(emoji.emoji)}>
        <EmojiPicker.Search />
        <EmojiPicker.Viewport>
          <EmojiPicker.Loading>Loading…</EmojiPicker.Loading>
          <EmojiPicker.Empty>No emoji found.</EmojiPicker.Empty>
          <EmojiPicker.List />
        </EmojiPicker.Viewport>
      </EmojiPicker.Root>
    );
  }