export type NodeCharacterReference = { id: string; path: string; mimeType: string; purpose: string };
export type NodeCharacter = { id: string; name: string; coverImageId?: string; references: NodeCharacterReference[] };

async function readResult<T>(response: Response): Promise<T> {
  const result = await response.json();
  if (!response.ok || result.code !== 200) throw new Error(result.message || `请求失败（HTTP ${response.status}）`);
  return result.data;
}

export function useNodeCharacters() {
  async function list(directory: string, signal?: AbortSignal): Promise<NodeCharacter[]> {
    const { characters } = await readResult<{ characters: NodeCharacter[] }>(await fetch(`/api/workspaces/characters/list?directory=${encodeURIComponent(directory)}`, {
      headers: { "x-toonflow-workspace": "1" },
      signal,
    }));
    return characters;
  }
  return { list };
}

/**
 * 按角色选择顺序轮询取参考图：每轮给每个角色补一张，保证名额不够时每个角色也能分到至少一张。
 * extraCount 为连线临时参考图预留的名额；cap 为本次请求允许的参考图总上限。
 * usedCharacterIds 只包含实际分到至少一张参考图的角色，供生成结果的追溯记录使用。
 */
export function selectCharacterReferences(characters: NodeCharacter[], characterIds: string[], extraCount: number, cap: number): { references: NodeCharacterReference[]; usedCharacterIds: string[] } {
  const available = Math.max(0, cap - extraCount);
  const selected = characterIds.map(id => characters.find(item => item.id === id)).filter((item): item is NodeCharacter => !!item);
  if (!selected.length || available <= 0) return { references: [], usedCharacterIds: [] };
  const references: NodeCharacterReference[] = [];
  const usedCharacterIds = new Set<string>();
  const cursors = selected.map(() => 0);
  for (let added = true; added && references.length < available;) {
    added = false;
    for (let i = 0; i < selected.length && references.length < available; i++) {
      const character = selected[i]!;
      const cursor = cursors[i]!;
      if (cursor >= character.references.length) continue;
      references.push(character.references[cursor]!);
      usedCharacterIds.add(character.id);
      cursors[i] = cursor + 1;
      added = true;
    }
  }
  return { references, usedCharacterIds: [...usedCharacterIds] };
}
