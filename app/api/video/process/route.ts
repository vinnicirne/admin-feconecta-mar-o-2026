import { NextRequest, NextResponse } from "next/server";
import { processVideo } from "@/lib/video/ffmpeg-service";
import fs from "fs";
import path from "path";
import os from "os";

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file = data.get("file") as File;
    const start = Number(data.get("start") || 0);
    const end = Number(data.get("end") || 15);
    const text = data.get("text") as string;
    const textX = Number(data.get("textX") || 50);
    const textY = Number(data.get("textY") || 50);

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo de vídeo enviado" }, { status: 400 });
    }

    // 📁 Preparar nomes de arquivo temporários
    const tempDir = os.tmpdir();
    const inputPath = path.join(tempDir, `reels-in-${Date.now()}.webm`);
    const outputPath = path.join(tempDir, `reels-out-${Date.now()}.mp4`);

    // 💾 Salvar o vídeo bruto do browser
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(inputPath, buffer);

    console.log(`🎬 Processando Reels Pro: ${inputPath} -> ${outputPath}`);

    // 🔥 Executar FFmpeg Pipeline
    await processVideo({
      inputPath,
      outputPath,
      start,
      end,
      text,
      textPos: { x: textX, y: textY }
    });

    // 📤 Ler o MP4 processado e enviar de volta
    const processedVideo = fs.readFileSync(outputPath);

    // 🧹 Limpeza garantida (Cleanup)
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

    return new NextResponse(processedVideo, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="reels-${Date.now()}.mp4"`,
      },
    });

  } catch (err: any) {
    console.error("ERRO NO BACKEND DE VÍDEO:", err);
    return NextResponse.json({ 
      error: "Falha ao processar vídeo", 
      details: err.message 
    }, { status: 500 });
  }
}
