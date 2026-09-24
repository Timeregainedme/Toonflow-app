import axios from "axios";
import { toValue, type MaybeRefOrGetter } from "vue";
import useWorkspaceFiles from "@/lib/workspaceFiles";

export type CharacterReferencePurpose = "front" | "side" | "back" | "expression" | "other";

export interface CharacterReferenceImage {
  id: string;
  path: string;
  mimeType: string;
  purpose: CharacterReferencePurpose;
  note?: string;
  addedAt: string;
}

export interface CharacterProfile {
  id: string;
  name: string;
  description?: string;
  coverImageId?: string;
  references: CharacterReferenceImage[];
  createdAt: string;
  updatedAt: string;
}

const listClient = axios.create({ baseURL: "/api/workspaces/characters", headers: { "x-toonflow-workspace": "1" } });

function isExclusiveConflict(error: unknown) {
  return axios.isAxiosError<{ data?: { code?: string } }>(error) && error.response?.data?.data?.code === "EEXIST";
}

function characterPath(id: string) {
  return `.toonflow/characters/${id}.json`;
}

function referenceDirectory(id: string) {
  return `assets/characters/${id}`;
}

function extensionOf(file: File) {
  const match = /\.[^./\\]+$/.exec(file.name);
  return match ? match[0] : "";
}

export function useCharacters(directory?: MaybeRefOrGetter<string | undefined>) {
  const files = useWorkspaceFiles(directory);

  async function ensureDirectories(id?: string) {
    for (const path of [".toonflow", ".toonflow/characters", "assets", "assets/characters", ...(id ? [referenceDirectory(id)] : [])]) {
      await files.mkdir(path).catch(error => { if (!isExclusiveConflict(error)) throw error; });
    }
  }

  async function list(): Promise<CharacterProfile[]> {
    const { data } = await listClient.get<{ data: { characters: CharacterProfile[] } }>("/list", { params: { directory: toValue(directory) } });
    return data.data.characters;
  }

  async function create(input: { name: string; description?: string }): Promise<CharacterProfile> {
    await ensureDirectories();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const profile: CharacterProfile = { id, name: input.name, description: input.description, references: [], createdAt: now, updatedAt: now };
    await files.writeJson(characterPath(id), profile, true);
    return profile;
  }

  async function read(id: string): Promise<CharacterProfile> {
    return files.readJson<CharacterProfile>(characterPath(id));
  }

  async function update(id: string, patch: Partial<Pick<CharacterProfile, "name" | "description" | "coverImageId">>): Promise<CharacterProfile> {
    const current = await read(id);
    const next: CharacterProfile = { ...current, ...patch, updatedAt: new Date().toISOString() };
    await files.writeJson(characterPath(id), next);
    return next;
  }

  async function addReference(id: string, file: File, purpose: CharacterReferencePurpose): Promise<CharacterReferenceImage> {
    await ensureDirectories(id);
    const current = await read(id);
    const referenceId = crypto.randomUUID();
    const path = `${referenceDirectory(id)}/${purpose}-${referenceId}${extensionOf(file)}`;
    await files.write(path, file, true);
    const reference: CharacterReferenceImage = { id: referenceId, path, mimeType: file.type, purpose, addedAt: new Date().toISOString() };
    const next: CharacterProfile = { ...current, references: [...current.references, reference], updatedAt: new Date().toISOString() };
    await files.writeJson(characterPath(id), next);
    return reference;
  }

  async function removeReference(id: string, referenceId: string): Promise<CharacterProfile> {
    const current = await read(id);
    const reference = current.references.find(item => item.id === referenceId);
    if (reference) await files.remove(reference.path).catch(error => { if (!axios.isAxiosError(error) || error.response?.status !== 404) throw error; });
    const next: CharacterProfile = {
      ...current, references: current.references.filter(item => item.id !== referenceId),
      coverImageId: current.coverImageId === referenceId ? undefined : current.coverImageId,
      updatedAt: new Date().toISOString(),
    };
    await files.writeJson(characterPath(id), next);
    return next;
  }

  async function reorderReferences(id: string, orderedIds: string[]): Promise<CharacterProfile> {
    const current = await read(id);
    const byId = new Map(current.references.map(reference => [reference.id, reference]));
    const references = orderedIds.map(referenceId => byId.get(referenceId)).filter((item): item is CharacterReferenceImage => !!item);
    const next: CharacterProfile = { ...current, references, updatedAt: new Date().toISOString() };
    await files.writeJson(characterPath(id), next);
    return next;
  }

  async function remove(id: string) {
    await files.remove(characterPath(id)).catch(error => { if (!axios.isAxiosError(error) || error.response?.status !== 404) throw error; });
    await files.remove(referenceDirectory(id), true).catch(error => { if (!axios.isAxiosError(error) || error.response?.status !== 404) throw error; });
  }

  return { list, create, read, update, addReference, removeReference, reorderReferences, remove };
}
