import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import path from "path";
import fs from "fs";

// Configuração robusta do caminho do FFmpeg Binário no Windows/Next.js
const getFFmpegPath = () => {
  // Tentar o caminho direto do node_modules se o static falhar/mudar
  const nodeModulesPath = path.resolve(process.cwd(), "node_modules", "ffmpeg-static", "ffmpeg.exe");
  if (fs.existsSync(nodeModulesPath)) return nodeModulesPath;
  return ffmpegPath; // Fallback para o padrão
};

const finalPath = getFFmpegPath();
console.log("🛠️ FFmpeg Path:", finalPath);
if (finalPath) {
  ffmpeg.setFfmpegPath(finalPath);
}

export interface ProcessVideoParams {
  inputPath: string;
  outputPath: string;
  start: number;
  end: number;
  text?: string;
  textPos?: { x: number; y: number };
}

export function processVideo({
  inputPath,
  outputPath,
  start,
  end,
  text,
  textPos = { x: 50, y: 50 }
}: ProcessVideoParams): Promise<string> {
  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath);

    // 1. Aplicar Corte (Trim)
    const duration = end - start;
    command = command.setStartTime(start).setDuration(duration);

    // 2. Aplicar Overlay de Texto (Reels Style)
    if (text) {
      // Converter porcentagem do front para coordenadas de vídeo aproximadas
      // x e y no FFmpeg são em pixels. Como não sabemos a resolução, usamos frações (W, H)
      const xPos = `(w*${textPos.x/100})`;
      const yPos = `(h*${textPos.y/100})`;
      
      command = command.videoFilters(
        `drawtext=text='${text}':fontcolor=white:fontsize=42:x=${xPos}:y=${yPos}:box=1:boxcolor=black@0.4:boxborderw=10`
      );
    }

    // 3. Compressão e Formato MP4 (H.264 para máxima compatibilidade)
    command
      .outputOptions([
        "-c:v libx264",
        "-preset ultrafast", // Rápido para API Next
        "-crf 28",           // Qualidade vs Peso
        "-c:a aac",          // Áudio compatível
        "-pix_fmt yuv420p"   // Essencial para iPhones
      ])
      .save(outputPath)
      .on("end", () => resolve(outputPath))
      .on("error", (err: Error) => {
        console.error("FFmpeg Processing Error:", err.message);
        reject(err);
      });
  });
}
