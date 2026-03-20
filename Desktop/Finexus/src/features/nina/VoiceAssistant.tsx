
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality, Type, FunctionDeclaration } from '@google/genai';
import { FinancialState, TransactionType, FinanceCategory, Transaction, ShoppingList, PaymentStatus } from '../../types/types';

interface VoiceAssistantProps {
  state: FinancialState;
  onSaveTransaction: (t: Transaction) => Promise<any>;
  onSaveShoppingList: (l: Partial<ShoppingList>) => Promise<any>;
  language?: string;
  voiceName?: string;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  state,
  onSaveTransaction,
  onSaveShoppingList,
  language = 'pt-BR',
  voiceName = 'Kore'
}) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isListeningForWakeWord, setIsListeningForWakeWord] = useState(true);
  const [isPrimed, setIsPrimed] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const recognitionRef = useRef<any>(null);
  const isStoppingRef = useRef(false);
  const audioBufferRef = useRef<Int16Array[]>([]);
  const lastActiveTimeRef = useRef<number>(0);
  const isUserSpeakingRef = useRef(false);
  const SILENCE_THRESHOLD = 0.03;
  const SILENCE_DURATION = 1000; // Aumentado para permitir pausas naturais na fala
  const MIN_PHRASE_LENGTH = 4800; // Mínimo de 0.3 segundos de áudio (16000 * 0.3)
  const playbackLockRef = useRef(false);

  const WAKE_WORDS = ["nina", "menina", "mina", "linda", "lina", "nena", "nana"];

  const tools: FunctionDeclaration[] = [
    {
      name: 'add_transaction',
      parameters: {
        type: Type.OBJECT,
        description: 'Registra transação no FiNexus.',
        properties: {
          description: { type: Type.STRING },
          amount: { type: Type.NUMBER },
          type: { type: Type.STRING, description: 'INCOME ou EXPENSE' },
          category: { type: Type.STRING, description: 'Pessoal ou Profissional' },
        },
        required: ['description', 'amount', 'type', 'category'],
      },
    },
    {
      name: 'create_shopping_list',
      parameters: {
        type: Type.OBJECT,
        description: 'Cria uma nova lista de compras.',
        properties: {
          title: { type: Type.STRING },
          budget: { type: Type.NUMBER },
        },
        required: ['title'],
      },
    },
    {
      name: 'analyze_market_needs',
      parameters: {
        type: Type.OBJECT,
        description: 'Analisa o histórico de compras para sugerir uma nova lista de mercado baseada nos itens mais frequentes.',
        properties: {},
      },
    }
  ];

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  };

  const stopAssistant = useCallback(() => {
    isStoppingRef.current = true;

    // Fechar sessão do Gemini primeiro
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch (e) { }
      sessionRef.current = null;
    }

    // Desconectar e limpar processamento de entrada
    if (scriptProcessorRef.current) {
      try { scriptProcessorRef.current.disconnect(); } catch (e) { }
      scriptProcessorRef.current.onaudioprocess = null;
      scriptProcessorRef.current = null;
    }

    if (inputContextRef.current) {
      try { inputContextRef.current.close(); } catch (e) { }
      inputContextRef.current = null;
    }

    if (streamRef.current) {
      try { streamRef.current.getTracks().forEach(track => track.stop()); } catch (e) { }
      streamRef.current = null;
    }

    // Limpar saída de áudio
    sourcesRef.current.forEach(s => { try { s.stop(); } catch (e) { } });
    sourcesRef.current.clear();

    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (e) { }
      audioContextRef.current = null;
    }

    setIsActive(false);
    setIsConnecting(false);
    setTranscript('');

    setTimeout(() => {
      isStoppingRef.current = false;
      playbackLockRef.current = false;
      // Cooldown de 5 segundos para garantir silêncio entre tentativas
      setTimeout(() => {
        if (isListeningForWakeWord && isPrimed && !isActive && !isConnecting && !sessionRef.current) {
          try { recognitionRef.current?.start(); } catch (e) { }
        }
      }, 5000);
    }, 200);
  }, [isListeningForWakeWord, isPrimed, isActive, isConnecting]);

  const startAssistant = async () => {
    if (isActive || isConnecting) return;
    setIsConnecting(true);
    try { recognitionRef.current?.stop(); } catch (e) { }

    const ai = new GoogleGenAI({ apiKey: (process.env.API_KEY || '').trim() });

    console.log("Nina: Iniciando com estado:", { balance: state.investment.balance, txCount: state.transactions.length });

    const recentTransactions = state.transactions
      .slice(-10)
      .map(t => `${t.description}: R$ ${t.amount} (${t.category})`)
      .join(', ');

    const shoppingSummary = state.shoppingLists
      .map(l => `${l.title} (R$ ${l.budget})`)
      .join(', ');

    const systemInstruction = `IDENTIDADE CRÍTICA: Você é a Nina, assistente oficial do FiNexus, nascida e criada no Brasil. 
    Sua personalidade é humana, empática e direta.
    
    SOTAQUE E PRONÚNCIA: Use EXCLUSIVAMENTE sotaque brasileiro natural. 
    REGRAS OBRIGATÓRIAS DE LINGUAGEM:
    - Fale "você" em vez de "tu". Nunca use "tu" ou "vós".
    - Diga "tá" em vez de "está". Use contrações como "pra", "pro", "tô".
    - Diga "né" no final das frases ocasionalmente.
    - Use marcadores de discurso naturais como "Olha,", "Entendi,", "Bom...".
    - Diga "celular" (e não telemóvel), "tela" (e não ecrã), "legal" (e não fixe/porreiro).
    - Evite a conjugação "estás a fazer", use "está fazendo".
    
    INTEGRAÇÃO COM O SISTEMA:
    Seus dados atuais do FiNexus:
    - Saldo: R$ ${state.investment.balance}.
    - Gastos Recentes: ${recentTransactions}.
    - Compras: ${shoppingSummary}.
    
    COMPORTAMENTO E HUMANIZAÇÃO:
    - Não soe como um robô; seja um parceiro de negócios próximo.
    - Se o usuário estiver confuso, mude o tom para encorajador.
    - Seja EXTREMAMENTE BREVE. Prefira frases curtas e "respire" entre as ideias.
    - Evite listas longas e numeradas ao falar.
    - Ao citar valores, diga "R$ 500" em vez de "quinhentos reais vírgula zero zero".
    - Responda em Português do Brasil de forma natural.
    - Se falar como em Portugal, você falhou em sua missão.`;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });
      const inputCtx = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          tools: [{ functionDeclarations: tools }],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceName
              }
            }
          },
          systemInstruction: { parts: [{ text: systemInstruction }] },
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            console.log("Nina: Conexão estabelecida com sucesso.");
            setIsActive(true);
            setIsConnecting(false);
            setTranscript("Ouvindo...");

            streamRef.current = stream;
            inputContextRef.current = inputCtx;

            const source = inputCtx.createMediaStreamSource(stream);
            // Ajustado para 2048: equilíbrio entre latência e cota
            const scriptProcessor = inputCtx.createScriptProcessor(2048, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            let lastLog = 0;
            scriptProcessor.onaudioprocess = (e) => {
              if (isStoppingRef.current || playbackLockRef.current) return;

              if (sourcesRef.current.size > 0) {
                playbackLockRef.current = true;
                return;
              }

              const inputData = e.inputBuffer.getChannelData(0);
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
              const rms = Math.sqrt(sum / inputData.length);

              const now = Date.now();
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;

              if (rms > SILENCE_THRESHOLD) {
                if (!isUserSpeakingRef.current) {
                  isUserSpeakingRef.current = true;
                  console.log("Nina: Início de fala detectado.");
                }
                lastActiveTimeRef.current = now;
                audioBufferRef.current.push(int16);
              } else if (isUserSpeakingRef.current) {
                audioBufferRef.current.push(int16);
                if (now - lastActiveTimeRef.current > SILENCE_DURATION) {
                  console.log("Nina: Fim de frase detectado. Enviando buffer...");
                  isUserSpeakingRef.current = false;

                  sessionPromise.then(session => {
                    if (!session || isStoppingRef.current) return;

                    const totalLength = audioBufferRef.current.reduce((acc, curr) => acc + curr.length, 0);
                    const mergedBuffer = new Int16Array(totalLength);
                    let offset = 0;
                    for (const buf of audioBufferRef.current) {
                      mergedBuffer.set(buf, offset);
                      offset += buf.length;
                    }

                    if (mergedBuffer.length < MIN_PHRASE_LENGTH) {
                      console.log(`Nina: Áudio muito curto (${mergedBuffer.length} amostras) ignorado.`);
                      audioBufferRef.current = [];
                      return;
                    }

                    const pcmBlob = { data: encode(new Uint8Array(mergedBuffer.buffer)), mimeType: 'audio/pcm;rate=16000' };
                    try {
                      session.sendRealtimeInput({ media: pcmBlob });
                    } catch (err: any) {
                      console.warn("Nina: Erro ao enviar buffer de frase:", err);
                    }
                    audioBufferRef.current = [];
                  });
                }
              }
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg: any) => {
            console.log("Nina: Mensagem recebida:", msg);
            if (msg.toolCall) {
              for (const fc of msg.toolCall.functionCalls) {
                if (fc.name === 'add_transaction') {
                  const args = fc.args as any;
                  await onSaveTransaction({
                    id: Date.now().toString(),
                    description: args.description,
                    amount: args.amount,
                    date: new Date().toISOString().split('T')[0],
                    type: args.type as TransactionType,
                    category: args.category?.toLowerCase().includes('prof') ? FinanceCategory.PROFESSIONAL : FinanceCategory.PERSONAL,
                    isRecurring: false,
                    dueDateDay: new Date().getDate(),
                    status: { [new Date().getMonth()]: PaymentStatus.PAID }
                  });
                  sessionRef.current?.sendToolResponse({ functionResponses: [{ id: fc.id, name: fc.name, response: { result: "Registrado no sistema." } }] });
                } else if (fc.name === 'create_shopping_list') {
                  const args = fc.args as any;
                  await onSaveShoppingList({ title: args.title, budget: args.budget || 0, items: args.items || [], createdAt: new Date().toISOString() });
                  sessionRef.current?.sendToolResponse({ functionResponses: [{ id: fc.id, name: fc.name, response: { result: "Lista " + args.title + " criada com sucesso!" } }] });
                } else if (fc.name === 'analyze_market_needs') {
                  // Lógica para contar itens mais frequentes
                  const allItems = state.shoppingLists.flatMap(l => l.items.map(i => i.name.toLowerCase().trim()));
                  const frequency: Record<string, number> = {};
                  allItems.forEach(name => { frequency[name] = (frequency[name] || 0) + 1; });

                  const topItems = Object.entries(frequency)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([name]) => name);

                  sessionRef.current?.sendToolResponse({
                    functionResponses: [{
                      id: fc.id,
                      name: fc.name,
                      response: {
                        frequent_items: topItems,
                        message: topItems.length > 0
                          ? "Identifiquei que você costuma comprar: " + topItems.join(", ") + ". Deseja que eu crie uma nova lista de mercado com esses itens?"
                          : "Ainda não tenho histórico suficiente de compras para sugerir itens frequentes."
                      }
                    }]
                  });
                }
              }
            }
            if (msg.serverContent?.outputTranscription) {
              setTranscript(msg.serverContent.outputTranscription.text);
              setIsProcessing(false);
            }
            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && !isStoppingRef.current) {
              setIsProcessing(false);
              const buffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              const now = outputCtx.currentTime;
              const startTime = Math.max(now, nextStartTimeRef.current);
              source.start(startTime);
              nextStartTimeRef.current = startTime + buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) {
                  // Cooldown após terminar de falar para não captar o próprio eco residual
                  setTimeout(() => { playbackLockRef.current = false; }, 500);
                }
              };
            }
          },
          onclose: (e: any) => {
            console.warn("Nina: Conexão fechada.", e);
            stopAssistant();
          },
          onerror: (e: any) => {
            console.error("Nina: Erro crítico na conexão.", e);
            stopAssistant();
          }
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Nina: Erro fatal ao iniciar:", err);
      setIsConnecting(false);
      stopAssistant();
    }
  };

  const primeAssistant = useCallback(() => {
    if (isPrimed) return;
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    ctx.resume().then(() => { setIsPrimed(true); if (isListeningForWakeWord) try { recognitionRef.current?.start(); } catch (e) { } });
  }, [isPrimed, isListeningForWakeWord]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript.toLowerCase();
          if (WAKE_WORDS.some(word => text.includes(word))) { if (!isActive && !isConnecting) { startAssistant(); break; } }
        }
      };
      recognition.onend = () => { if (isListeningForWakeWord && !isActive && !isConnecting && !isStoppingRef.current && isPrimed) try { recognition.start(); } catch (e) { } };
      recognitionRef.current = recognition;
    }
  }, [isActive, isConnecting, isListeningForWakeWord, isPrimed]);

  return (
    <div className="fixed bottom-6 right-6 z-[250] flex flex-col items-end gap-3 no-print pointer-events-none">

      {/* Botão de Ativação Inicial Compacto */}
      {!isPrimed && (
        <button
          onClick={primeAssistant}
          className="pointer-events-auto w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl animate-bounce flex items-center justify-center border-2 border-white hover:scale-110 transition-transform group"
        >
          <span className="text-2xl">🎙️</span>
          <span className="absolute right-full mr-3 bg-blue-600 text-white text-[9px] font-black py-1.5 px-3 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest shadow-xl">Ativar Nina</span>
        </button>
      )}

      {/* Rótulo de Pronta Discreto */}
      {isPrimed && !isActive && isListeningForWakeWord && (
        <div className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-blue-100 shadow-sm flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">NINA ONLINE</p>
        </div>
      )}

      {/* Interface de Diálogo da Nina (Tamanho Reduzido) */}
      {isActive && (
        <div className="pointer-events-auto bg-[#0f172a] text-white p-4 rounded-[1.5rem] shadow-2xl max-w-[220px] animate-in slide-in-from-bottom-6 border border-white/10 overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-xs animate-pulse">✨</div>
            <div className="flex-1">
              <p className="text-[7px] font-black text-blue-400 uppercase tracking-widest leading-none">Nina Ativa</p>
            </div>
            <button onClick={stopAssistant} className="text-white/30 hover:text-white transition-colors text-xs">✕</button>
          </div>
          <div className="max-h-[60px] overflow-y-auto pr-1 custom-scrollbar">
            {isProcessing ? (
              <div className="flex items-center gap-2 py-1">
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <p className="text-[9px] text-blue-300 italic">Nina está pensando...</p>
              </div>
            ) : (
              <p className="text-[10px] font-bold text-blue-50 italic leading-tight">"{transcript || 'Ouvindo...'}"</p>
            )}
          </div>
        </div>
      )}

      {/* Controles de Ícone Flutuante Compactos no Canto Extremo */}
      <div className="flex gap-2 pointer-events-auto">
        {isPrimed && (
          <button
            onClick={() => {
              const newMode = !isListeningForWakeWord;
              setIsListeningForWakeWord(newMode);
              if (newMode) try { recognitionRef.current?.start(); } catch (e) { }
              else try { recognitionRef.current?.stop(); } catch (e) { }
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all border ${isListeningForWakeWord ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-white border-slate-100 text-slate-300'}`}
            title={isListeningForWakeWord ? "Desativar Microfone Automático" : "Ativar Microfone Automático"}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
        )}

        <button
          onClick={isActive ? stopAssistant : startAssistant}
          disabled={isConnecting}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all relative ${isActive ? 'bg-rose-500 scale-90' : 'bg-blue-600 hover:scale-105 active:scale-95'}`}
        >
          {isConnecting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <span className="text-xl">{isActive ? '✕' : '🤖'}</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default VoiceAssistant;
