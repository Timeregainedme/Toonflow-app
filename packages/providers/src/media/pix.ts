const rules = [
  {
    type: "input",
    field: "apiKey" as const,
    title: "API Key",
    value: "",
    props: { type: "password", showPassword: true, autocomplete: "off" },
  },
] as const;

const apiUrl = "https://pix.token6688.com";
const version = "2.0.0";

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("PIX 响应格式错误");
  return value as Record<string, unknown>;
}

function wait(signal: AbortSignal, ms: number) {
  signal.throwIfAborted();
  return new Promise<void>((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, ms);
    signal.addEventListener("abort", abort, { once: true });
  });
}

/** 上传参考素材换取 PIX 可访问的公网 URL；已是 URL 的输入直接透传。 */
async function uploadMedia(context: ProviderContext, apiKey: string, input: MediaInput, signal: AbortSignal): Promise<string> {
  if (input.type === "url") return input.url;
  const bytes = input.type === "binary" ? input.data : Buffer.from(input.data, "base64");
  const ext = input.mimeType.split("/")[1] || "bin";
  const boundary = `----toonflow${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
  const body = new Blob([
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="upload.${ext}"\r\nContent-Type: ${input.mimeType}\r\n\r\n`,
    bytes as unknown as BlobPart,
    `\r\n--${boundary}--\r\n`,
  ]);
  const response = await context.tool.fetch(`${apiUrl}/v1/files`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": `multipart/form-data; boundary=${boundary}` },
    body,
    signal,
  });
  if (!response.ok) throw new Error(`素材上传失败：HTTP ${response.status}`);
  const result = object(await response.json());
  if (typeof result.url !== "string" || !result.url) throw new Error("素材上传未返回地址");
  return result.url;
}

/** 轮询 PIX 异步任务；completed 后读 output_url 与可选的 cost_rmb/balance_rmb，failed 时抛出错误原因。 */
async function pollTask(context: ProviderContext, apiKey: string, taskId: string, signal: AbortSignal): Promise<{ url: string; usage?: MediaUsage }> {
  while (true) {
    const response = await context.tool.fetch(`${apiUrl}/v1/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal,
    });
    if (!response.ok) throw new Error(`查询任务失败：HTTP ${response.status}`);
    const data = object(await response.json());
    if (data.status === "failed") throw new Error(typeof data.error === "string" ? data.error : "生成失败");
    if (data.is_final === true) {
      if (typeof data.output_url !== "string" || !data.output_url) throw new Error("未返回生成结果");
      const cost = typeof data.cost_rmb === "number" ? { amount: data.cost_rmb, currency: "CNY" } : undefined;
      const balanceAfter = typeof data.balance_rmb === "number" ? { amount: data.balance_rmb, currency: "CNY" } : undefined;
      return { url: data.output_url, ...(cost || balanceAfter ? { usage: { cost, balanceAfter } } : {}) };
    }
    await wait(signal, 6000);
  }
}

export default {
  id: "pix",
  label: "PIX",
  version,
  readme: "## PIX 中转平台\n\nPIX 提供多模型中转服务，兼容 OpenAI 协议。\n\n[前往平台](https://pix.token6688.com)",
  rules,
  models: [
    {
      id: "minimax-h3",
      label: "MiniMax H3",
      type: "video",
      mode: ["text", "startFrameOptional", ["imageReference:9", "videoReference:3", "audioReference:3"]],
      audio: "optional",
      durationResolutionMap: [{ duration: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], resolution: ["768P", "2K"] }],
    },
    {
      id: "gpt-image-2.5-flare",
      label: "GT Image 2.5 Flare",
      type: "image",
      mode: ["text", "singleImage", "multiReference"],
      imageSizes: ["1K", "2K", "4K"],
      imageRatios: ["1:1", "auto", "3:2", "2:3", "4:3", "3:4", "5:4", "4:5", "16:9", "9:16", "21:9", "9:21"],
    },
    {
      id: "gpt-image-2.5-sunburst",
      label: "GT Image 2.5 Sunburst",
      type: "image",
      mode: ["text", "singleImage", "multiReference"],
      imageSizes: ["1K", "2K", "4K"],
      imageRatios: ["1:1", "auto", "3:2", "2:3", "4:3", "3:4", "5:4", "4:5", "16:9", "9:16", "21:9", "9:21"],
    },
  ] satisfies ProviderModel[],
  async generateImage(request: ImageRequest): Promise<MediaAsset[]> {
    const apiKey = this.config.apiKey?.trim();
    if (!apiKey) throw new Error("请填写 API Key");
    // ACT: 单次生成最多等待 10 分钟。
    const signal = AbortSignal.any([AbortSignal.timeout(10 * 60_000), ...(this.signal ? [this.signal] : [])]);

    const images: string[] = [];
    for (const image of request.images ?? []) images.push(await uploadMedia(this, apiKey, image, signal));
    const size = (request.size ?? "2K").toUpperCase();

    const response = await this.tool.fetch(`${apiUrl}/api/v1/model-runtime/invoke`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model_id: request.model,
        modality: "image",
        params: {
          prompt: request.prompt,
          aspect_ratio: request.ratio ?? "1:1",
          resolution: ["1K", "2K", "4K"].includes(size) ? size : "2K",
          ...(images.length ? { images, mode: images.length > 1 ? "multi-reference" : "image-edit" } : {}),
        },
      }),
      signal,
    });
    if (!response.ok) throw new Error(`请求失败：HTTP ${response.status}`);
    const data = object(await response.json());
    const taskId = data.task_id;
    if (typeof taskId !== "string" || !taskId) throw new Error("未返回任务ID");

    const { url, usage } = await pollTask(this, apiKey, taskId, signal);
    return [{ mediaType: "image", type: "url", url, ...(usage ? { usage } : {}) }];
  },
  async generateVideo(request: VideoRequest): Promise<MediaAsset[]> {
    const apiKey = this.config.apiKey?.trim();
    if (!apiKey) throw new Error("请填写 API Key");
    // ACT: 单次生成最多等待 30 分钟。
    const signal = AbortSignal.any([AbortSignal.timeout(30 * 60_000), ...(this.signal ? [this.signal] : [])]);

    const imageUrls: string[] = [];
    for (const image of request.images ?? []) imageUrls.push(await uploadMedia(this, apiKey, image, signal));
    const videoUrls: string[] = [];
    for (const video of request.videos ?? []) videoUrls.push(await uploadMedia(this, apiKey, video, signal));
    const audioUrls: string[] = [];
    for (const audio of request.audios ?? []) audioUrls.push(await uploadMedia(this, apiKey, audio, signal));
    const frames: string[] = [];
    if (request.firstFrame) frames.push(await uploadMedia(this, apiKey, request.firstFrame, signal));
    if (request.lastFrame) frames.push(await uploadMedia(this, apiKey, request.lastFrame, signal));

    const mode = request.mode ?? (frames.length ? "startFrameOptional" : videoUrls.length || audioUrls.length ? [] : imageUrls.length ? "singleImage" : "text");

    let pixMode: string;
    let images: string[] = [];
    let videos: string[] = [];
    let audios: string[] = [];
    if (Array.isArray(mode)) {
      pixMode = "reference";
      images = imageUrls;
      videos = videoUrls;
      audios = audioUrls;
    } else if (mode === "singleImage") {
      pixMode = "first-frame";
      images = imageUrls;
    } else if (frames.length) {
      // ACT: PIX 的 images 数组按顺序表示首帧、尾帧，文档未提供独立角色字段；后续如平台开放角色标注需升级此处映射。
      pixMode = frames.length > 1 ? "first-last" : "first-frame";
      images = frames;
    } else {
      pixMode = "text-to-video";
    }

    const response = await this.tool.fetch(`${apiUrl}/v1/media/generate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: request.model,
        prompt: request.prompt,
        params: {
          mode: pixMode,
          duration: String(request.duration ?? 5),
          resolution: (request.resolution ?? "768P").toLowerCase(),
          aspect_ratio: request.ratio ?? "16:9",
          ...(images.length ? { images } : {}),
          ...(videos.length ? { videos } : {}),
          ...(audios.length ? { audios } : {}),
        },
      }),
      signal,
    });
    if (!response.ok) throw new Error(`请求失败：HTTP ${response.status}`);
    const data = object(await response.json());
    const taskData = object(data.data ?? {});
    const taskId = taskData.task_id;
    if (typeof taskId !== "string" || !taskId) throw new Error("未返回任务ID");

    const { url, usage } = await pollTask(this, apiKey, taskId, signal);
    return [{ mediaType: "video", type: "url", url, ...(usage ? { usage } : {}) }];
  },
} satisfies ProviderDefinition<typeof rules>;
