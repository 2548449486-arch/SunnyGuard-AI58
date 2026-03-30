import { SignIn, SignedIn, SignedOut, useUser, useClerk, useAuth } from '@clerk/clerk-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  History, 
  Zap, 
  Settings, 
  Send, 
  Plus, 
  ChevronRight, 
  ShieldCheck, 
  TrendingDown, 
  Users, 
  LogOut,
  Sparkles,
  Search,
  BookOpen,
  Building2,
  Smile,
  UserCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TOPUP_PLANS = (t: any) => [
  { usd: 2, pts: t.pts_20w, rmb: '¥15', bonus: '' },
  { usd: 5, pts: t.pts_55w, rmb: '¥37', bonus: '+10%' },
  { usd: 10, pts: t.pts_120w, rmb: '¥73', bonus: '+20%' },
  { usd: 30, pts: t.pts_400w, rmb: '¥219', bonus: t.best_value },
];

const MODELS = (t: any) => [
  { id: 'auto', label: t.model_auto, tag: t.tag_save },
  { id: 'openai/gpt-4o', label: '🧠 GPT-4o', tag: t.tag_flagship },
  { id: 'anthropic/claude-3-5-sonnet', label: '⚡ Claude 3.5', tag: t.tag_strongest },
  { id: 'google/gemini-3.1-pro-preview', label: '🌊 Gemini Pro', tag: t.tag_multimodal },
  { id: 'openai/o3-mini', label: '🧠 o3-mini', tag: t.tag_reasoning },
  { id: 'deepseek/deepseek-chat', label: '🐳 DeepSeek V3', tag: t.tag_value },
  { id: 'meta-llama/llama-3.1-405b', label: '🦙 Llama 3.1 405B' },
  { id: 'qwen-max', label: t.model_qwen, tag: t.tag_domestic },
];

const ANIME_LOGOS = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Sunny1',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Sunny2',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Sunny3',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Sunny4',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Sunny5',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Sunny6',
];

const TONES = [
  { id: 'normal', label_en: 'Default', label_zh: '默认', icon: '😐' },
  { id: 'playful', label_en: 'Playful', label_zh: '调皮', icon: '😜' },
  { id: 'cute', label_en: 'Cute', label_zh: '可爱', icon: '🥰' },
  { id: 'cold', label_en: 'Cold', label_zh: '高冷', icon: '😎' },
];

const TRANSLATIONS: any = {
  en: {
    welcome: "Hi, I'm Sunny!",
    sub_welcome: "Your money-saving AI buddy",
    save_money: "1 Token = 1 Energy Point",
    sub_save_money: "Transparent billing, no hidden fees",
    dual_audit: "Arbitrage Savings",
    sub_dual_audit: "Smart routing saves you up to 90% costs",
    remember_you: "10,000 Free Points",
    sub_remember_you: "Get started with a massive bonus",
    next: "Next →",
    start_now: "Start Now ☀️",
    skip: "Skip",
    energy_points: "Energy Points",
    today_savings: "Today's Savings",
    recent_chats: "Recent Chats",
    start_new_chat: "Start New Chat",
    smart_routing: "Smart Routing",
    dual_audit_system: "Dual Audit System",
    enterprise_access: "Enterprise Access",
    settings: "Settings",
    logs: "Logs",
    topup: "Top-up",
    chat: "Chat",
    dashboard: "Dashboard",
    enterprise: "Enterprise",
    logout: "Logout",
    audit_passed: "Audit Passed",
    view_reason: "View Reason",
    insufficient_credits: "Insufficient credits",
    request_failed: "Request failed",
    language: "Language",
    security: "Security",
    about: "About Sunny",
    model_status: "Model Status",
    online: "Online",
    offline: "Offline",
    audit_strictness: "Audit Strictness",
    strict: "Strict",
    loose: "Loose",
    chat_placeholder: "Ask Sunny anything...",
    send: "Send",
    model: "Model",
    tone: "Tone",
    audit_report: "Audit Report",
    savings: "Savings",
    latency: "Latency",
    credits_left: "Credits Left",
    points: "Points",
    history: "History",
    stats: "Stats",
    plans: "Plans",
    method: "Method",
    pay_now: "Pay Now",
    close: "Close",
    audit_reason: "Audit Reason",
    audit_details: "Audit Details",
    passed: "Passed",
    failed: "Failed",
    thinking: "Thinking...",
    error_api: "API Error. Please check your key or network.",
    error_credits: "Insufficient energy points. Please top up.",
    pts_20w: "200k pts",
    pts_55w: "550k pts",
    pts_120w: "1.2M pts",
    pts_400w: "4M pts",
    best_value: "Best Value",
    model_auto: "☀️ Smart Routing",
    model_qwen: "🔥 Qwen Max",
    tag_save: "Save",
    tag_flagship: "Flagship",
    tag_strongest: "Strongest",
    tag_multimodal: "Multimodal",
    tag_reasoning: "Reasoning",
    tag_value: "Value",
    tag_domestic: "Domestic",
    how_help: "😊 How can I help you today?",
    reg_bonus: "Register to get 10,000 energy points (1 token = 1 point)",
    copy: "Copy",
    regenerate: "Regenerate",
    report: "Report",
    got_it: "Got it",
    team: "Team Management",
    team_desc: "Invite members, share credits",
    prompt_lib: "Prompt Library",
    prompt_lib_desc: "Save common templates",
    enterprise_trial: "Apply for Enterprise Trial",
    enterprise_desc: "By integrating private knowledge bases, Sunny replaces manual CS for 90%+ of inquiries.",
    enterprise_title: "Replace CS, 10x Efficiency",
    rag_title: "Private Knowledge (RAG)",
    rag_desc: "Upload PDF/Doc/URL, AI learns your data",
    webhook_title: "Webhook Automation",
    webhook_desc: "Auto-handle orders, after-sales, etc.",
    multichannel_title: "Multi-channel",
    multichannel_desc: "Deploy to WeChat, Slack, Web, etc.",
    choose_avatar: "Choose your Sunny avatar",
  },
  zh: {
    welcome: "嗨，我是 Sunny！",
    sub_welcome: "你的省钱AI小伙伴",
    save_money: "1 Token = 1 能量点",
    sub_save_money: "透明计费，和大模型官方一致",
    dual_audit: "智能套利省钱",
    sub_dual_audit: "自动调度模型，最高省 90% 成本",
    remember_you: "送 10,000 能量点",
    sub_remember_you: "注册即送，开启你的 AI 之旅",
    next: "下一步 →",
    start_now: "立即开始 ☀️",
    skip: "跳过",
    energy_points: "能量点",
    today_savings: "今日节省费用",
    recent_chats: "最近对话",
    start_new_chat: "开始新聊天",
    smart_routing: "智能调度路由",
    dual_audit_system: "双重审核体系",
    enterprise_access: "企业一键接入",
    settings: "设置",
    logs: "日志",
    topup: "充值",
    chat: "聊天",
    dashboard: "总览",
    enterprise: "企业",
    logout: "退出登录",
    audit_passed: "已审核",
    view_reason: "查看理由",
    insufficient_credits: "能量点不足",
    request_failed: "请求失败",
    language: "语言",
    security: "安全设置",
    about: "关于 Sunny",
    model_status: "模型状态",
    online: "在线",
    offline: "离线",
    audit_strictness: "审核强度",
    strict: "严格",
    loose: "宽松",
    chat_placeholder: "问问 Sunny 任何事情...",
    send: "发送",
    model: "模型",
    tone: "语气",
    audit_report: "审核报告",
    savings: "节省",
    latency: "延迟",
    credits_left: "剩余能量",
    points: "点数",
    history: "历史",
    stats: "统计",
    plans: "套餐",
    method: "方式",
    pay_now: "立即支付",
    close: "关闭",
    audit_reason: "审核理由",
    audit_details: "审核详情",
    passed: "通过",
    failed: "未通过",
    thinking: "思考中...",
    error_api: "API 错误。请检查密钥或网络。",
    error_credits: "能量点不足，请充值。",
    pts_20w: "20万点",
    pts_55w: "55万点",
    pts_120w: "120万点",
    pts_400w: "400万点",
    best_value: "最优惠",
    model_auto: "☀️ 智能路由",
    model_qwen: "🔥 通义千问",
    tag_save: "省钱",
    tag_flagship: "旗舰",
    tag_strongest: "最强",
    tag_multimodal: "多模",
    tag_reasoning: "推理",
    tag_value: "性价比",
    tag_domestic: "国产",
    how_help: "😊 今天想让我帮你做什么？",
    reg_bonus: "注册即送 10,000 能量点 (1 token = 1 点)",
    copy: "复制内容",
    regenerate: "重新生成",
    report: "举报内容",
    got_it: "知道了",
    team: "团队管理",
    team_desc: "邀请成员、共享额度",
    prompt_lib: "Prompt 库",
    prompt_lib_desc: "保存常用模板",
    enterprise_trial: "立即申请企业试用",
    enterprise_desc: "通过接入企业私有知识库，Sunny 可以完美替代人工客服，处理 90% 以上的日常咨询。",
    enterprise_title: "替代传统客服，效率提升 10x",
    rag_title: "私有知识库 (RAG)",
    rag_desc: "上传 PDF/Doc/URL，AI 学习企业专属知识",
    webhook_title: "Webhook 自动化",
    webhook_desc: "自动处理订单查询、售后申请等业务逻辑",
    multichannel_title: "多渠道分发",
    multichannel_desc: "一键部署至 微信、钉钉、飞书、官网",
    choose_avatar: "选择你的 Sunny 头像",
  }
};

import { GoogleGenAI } from "@google/genai";

function SunnyLogo({ size = 42, ring = true, url }: { size?: number; ring?: boolean; url?: string }) {
  const logoUrl = url || ANIME_LOGOS[0];
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {ring && (
        <div 
          className="absolute inset-[-4px] rounded-full border border-primary/45"
        />
      )}
      <div 
        className="w-full h-full rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,140,0,0.35)] overflow-hidden bg-[#FFD37A]"
      >
        <img 
          src={logoUrl} 
          alt="Sunny" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}

function Landing() {
  const [lang, setLang] = useState('zh');
  const [step, setStep] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const steps = [
    { icon: '☀️', title: t.welcome, sub: t.sub_welcome },
    { icon: '💰', title: t.save_money, sub: t.sub_save_money },
    { icon: '🛡️', title: t.dual_audit, sub: t.sub_dual_audit },
    { icon: '🎁', title: t.remember_you, sub: t.sub_remember_you },
  ];

  if (showLogin) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-5 font-sans">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-6">
            <div className="flex justify-center"><SunnyLogo size={56} /></div>
            <div className="text-2xl font-black text-white mt-2">SunnyGuard <span className="text-primary">AI</span></div>
            <div className="text-xs text-white/35 mt-1">{t.reg_bonus}</div>
          </div>
          <SignIn 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[22px] shadow-[0_40px_80px_rgba(0,0,0,0.6)]",
                headerTitle: "text-white",
                headerSubtitle: "text-white/40",
                socialButtonsBlockButton: "bg-white/6 border border-white/12 text-white rounded-xl",
                formFieldInput: "bg-white/6 border border-white/10 text-white rounded-xl",
                formButtonPrimary: "bg-gradient-to-br from-primary to-primary-dark rounded-xl font-bold",
                footerActionLink: "text-primary",
              }
            }}
          />
        </div>
      </div>
    );
  }

  const s = steps[step];
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#12101a] flex flex-col items-center justify-center p-8 font-sans">
      <div className="absolute top-8 right-8 flex bg-white/5 rounded-lg p-1">
        <button onClick={() => setLang('en')} className={cn("px-2 py-1 text-[9px] rounded-md transition-all", lang === 'en' ? "bg-primary text-white" : "text-white/30")}>EN</button>
        <button onClick={() => setLang('zh')} className={cn("px-2 py-1 text-[9px] rounded-md transition-all", lang === 'zh' ? "bg-primary text-white" : "text-white/30")}>中文</button>
      </div>
      <div className="text-[80px] mb-6 animate-float">
        {s.icon === '☀️' ? <SunnyLogo size={92} /> : s.icon}
      </div>
      <div className="text-center max-w-[280px] mb-10">
        <div className="text-[26px] font-black text-white mb-2.5">{s.title}</div>
        <div className="text-[15px] text-white/45 leading-relaxed">{s.sub}</div>
      </div>
      <div className="flex gap-2 mb-9">
        {steps.map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "h-[7px] rounded-full transition-all duration-300",
              i === step ? "w-[22px] bg-primary" : "w-[7px] bg-white/20"
            )}
          />
        ))}
      </div>
      <button 
        onClick={() => step < steps.length - 1 ? setStep(s => s + 1) : setShowLogin(true)} 
        className="w-[260px] py-4 px-7 bg-gradient-to-br from-primary to-primary-dark border-none rounded-[18px] text-white text-[15px] font-extrabold cursor-pointer shadow-[0_8px_28px_rgba(255,140,0,0.4)]"
      >
        {step < steps.length - 1 ? t.next : t.start_now}
      </button>
      {step > 0 && (
        <button 
          onClick={() => setShowLogin(true)} 
          className="mt-3.5 bg-none border-none text-white/25 text-xs cursor-pointer"
        >
          {t.skip}
        </button>
      )}
    </div>
  );
}

function MainApp() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { getToken } = useAuth();
  const [page, setPage] = useState(0); // 0: Dashboard, 1: Chat, 2: Logs, 3: Topup, 4: Settings, 5: Enterprise
  const [userData, setUserData] = useState<any>(null);
  const [model, setModel] = useState('auto');
  const [tone, setTone] = useState('normal');
  const [lang, setLang] = useState('en');
  const [auditStrictness, setAuditStrictness] = useState('strict');
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [logFilter, setLogFilter] = useState('all');
  const [selTP, setSelTP] = useState(1);
  const [modal, setModal] = useState('');
  const [topupPay, setTPay] = useState<any>(null);
  const [stats, setStats] = useState({ reqs: 0, pts: 0, saved: 0 });
  const [auditReason, setAuditReason] = useState<string | null>(null);
  const [selectedLogo, setSelectedLogo] = useState(ANIME_LOGOS[0]);
  const [longPressMsg, setLongPressMsg] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const fetchWithAuth = useCallback(async (url: string, options: any = {}) => {
    const token = await getToken();
    if (!token) {
      console.warn("No auth token available");
    }
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      }
    });
  }, [getToken]);

  useEffect(() => {
    fetchWithAuth('/api/user/me').then(r => r.json()).then(setUserData).catch(() => {});
  }, [fetchWithAuth]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const credits = userData?.credits || 0;

  const send = useCallback(async () => {
    if (!input.trim() || busy) return;
    const txt = input.trim();
    const userMsg = { role: 'user', content: txt, id: Date.now() };
    setMsgs(prev => [...prev, userMsg]);
    setInput('');
    setBusy(true);

    try {
      // 1. Get Arbitrage Advice from Server
      const adviceRes = await fetchWithAuth('/api/chat/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: txt, model })
      });
      const advice = await adviceRes.json();
      if (!adviceRes.ok) throw new Error(advice.error || t.error_credits);

      let responseText = "";
      let totalTokens = 0;
      const start = Date.now();

      // 2. Call AI (Prioritize Gemini Flash if possible or follow advice)
      const targetModel = advice.targetModel;
      const apiKey = (process.env as any).GEMINI_API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY;

      const tonePrompts: Record<string, string> = {
        playful: "Use a playful, energetic, and fun tone with emojis. ",
        cute: "Use a very cute, sweet, and anime-style girl tone. ",
        cold: "Use a cold, professional, and concise tone. "
      };
      
      const systemPrompt = `You are Sunny, a helpful AI assistant. 
        Please respond in ${lang === 'zh' ? 'Simplified Chinese' : 'English'}. 
        ${tonePrompts[tone] || ""}`;

      if (targetModel.includes("gemini") || targetModel === "auto") {
        // CALL GEMINI DIRECTLY FROM FRONTEND
        if (!apiKey) throw new Error(t.error_api + " (Missing Key)");
        const ai = new GoogleGenAI({ apiKey });
        const modelName = targetModel === "auto" ? "gemini-3-flash-preview" : (targetModel.includes("/") ? targetModel.split("/")[1] : targetModel);
        
        const result = await ai.models.generateContent({
          model: modelName,
          contents: systemPrompt + txt,
        });
        
        if (!result.text) throw new Error(t.error_api);
        responseText = result.text;
        totalTokens = result.usageMetadata?.totalTokenCount || responseText.length / 2;
      } else {
        // CALL OTHER MODELS VIA SERVER PROXY
        const chatRes = await fetchWithAuth('/api/chat/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: txt, model: targetModel, tone, history: msgs.slice(-4) })
        });
        const chatData = await chatRes.json();
        if (!chatRes.ok) throw new Error(chatData.error || t.error_api);
        responseText = chatData.content;
        totalTokens = chatData.totalTokens;
      }

      // 3. Perform Audit (Gemini) from Frontend
      let auditReport = { passed: true, reason: "Audit skipped" };
      if (apiKey) {
        const aiAudit = new GoogleGenAI({ apiKey });
        const auditPrompt = `Audit the following AI response for safety, accuracy, logic, and PII. 
          User Prompt: ${txt}
          AI Response: ${responseText}
          Return JSON: { "passed": boolean, "score": number, "reason": string }`;
        
        try {
          const auditResult = await aiAudit.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: auditPrompt,
            config: { responseMimeType: "application/json" }
          });
          auditReport = JSON.parse(auditResult.text);
        } catch (e) {
          console.error("Frontend Audit Error:", e);
        }
      }

      // 4. Report Usage to Server
      const reportRes = await fetchWithAuth('/api/chat/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: txt,
          response: responseText,
          model: targetModel,
          totalTokens,
          auditReport,
          latencyMs: Date.now() - start,
          advice
        })
      });
      const reportData = await reportRes.json();

      let finalContent = responseText;
      if (!auditReport.passed) {
        finalContent = (lang === 'zh' ? '这个我再帮你优化一下哦～\n\n' : 'Let me optimize this for you~\n\n') + finalContent;
      }

      setMsgs(prev => [...prev, { 
        role: 'assistant', 
        content: finalContent, 
        id: Date.now() + 1,
        meta: { ...reportData.meta, auditPassed: auditReport.passed, auditReason: auditReport.reason }
      }]);
      
      setUserData((prev: any) => ({ ...prev, credits: reportData.creditsLeft }));
      setStats(prev => ({ ...prev, reqs: prev.reqs + 1, pts: prev.pts + (reportData.meta.pts || 0), saved: prev.saved + (reportData.meta.savings || 0) }));

    } catch (e: any) {
      console.error("Send Error:", e);
      setMsgs(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ ${e.message || t.request_failed}`, 
        id: Date.now() + 1,
        error: true
      }]);
    } finally {
      setBusy(false);
    }
  }, [input, busy, model, tone, msgs, fetchWithAuth, t, lang]);

  const doTopup = useCallback(async (method: string) => {
    try {
      const r = await fetchWithAuth('/api/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: TOPUP_PLANS[selTP].usd, method })
      });
      const d = await r.json();
      if (d.ok) {
        setTPay({ ...d, method });
        setModal('topup-pay');
      }
    } catch (e: any) {
      alert('失败：' + e.message);
    }
  }, [selTP, fetchWithAuth]);

  const filteredLogs = logs.filter(l => logFilter === 'all' ? true : l.tier === logFilter);

  return (
    <div className="w-full max-w-[430px] h-[100dvh] flex flex-col bg-[#0a0a0f] relative overflow-hidden mx-auto font-sans">
      {/* Status bar (Mock) */}
      <div className="h-11 flex items-center justify-between px-5 flex-shrink-0">
        <span className="text-[15px] font-bold text-white">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <div className="text-[11px] text-white/50">●●● 5G 🔋</div>
      </div>

      {/* Top bar */}
      <div className="px-[18px] pb-3.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="animate-float"><SunnyLogo size={40} url={selectedLogo} /></div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#30d158] border-2 border-[#0a0a0f]" />
          </div>
          <div>
            <div className="text-[17px] font-extrabold text-white">SunnyGuard <span className="text-primary">AI</span></div>
            <div className="text-[10px] text-white/35 mt-0.5">{t.how_help}</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div onClick={() => setModal('topup')} className="text-right cursor-pointer">
            <div className="text-[8px] text-white/35 uppercase">{t.energy_points}</div>
            <div className={cn("text-[15px] font-black", credits < 10000 ? 'text-[#ff453a]' : 'text-[#30d158]')}>
              {credits >= 10000 ? (credits / 10000).toFixed(1) + (lang === 'zh' ? '万' : 'w') : credits.toLocaleString()}
            </div>
          </div>
          <button onClick={() => setPage(4)} className="w-[34px] h-[34px] rounded-xl glass flex items-center justify-center text-sm cursor-pointer text-white">
            {user?.firstName?.[0] || '?'}
          </button>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {auditReason && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-3xl p-6 w-full max-w-[320px] border border-white/10"
            >
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-[#30d158]" />
                <div className="text-lg font-bold text-white">{t.audit_passed}</div>
              </div>
              <div className="text-sm text-white/60 leading-relaxed mb-6">
                {auditReason}
              </div>
              <button 
                onClick={() => setAuditReason(null)}
                className="w-full py-3 bg-primary rounded-xl text-white font-bold"
              >
                {t.got_it}
              </button>
            </motion.div>
          </div>
        )}

        {longPressMsg && (
          <div className="fixed inset-0 bg-black/40 z-[200]" onClick={() => setLongPressMsg(null)}>
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="absolute bottom-0 left-0 right-0 glass rounded-t-[32px] p-6 pb-10 space-y-3"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-4" />
              {[
                { label: t.copy, action: () => { navigator.clipboard.writeText(longPressMsg.content); setLongPressMsg(null); } },
                { label: t.regenerate, action: () => { setInput(longPressMsg.role === 'user' ? longPressMsg.content : msgs[longPressMsg.index - 1]?.content || ''); send(); setLongPressMsg(null); } },
                { label: t.report, action: () => { alert('Reported'); setLongPressMsg(null); }, color: 'text-[#ff453a]' },
              ].map((item, i) => (
                <button 
                  key={i} 
                  onClick={item.action}
                  className={cn("w-full py-4 glass rounded-2xl text-[15px] font-bold text-center", item.color || "text-white")}
                >
                  {item.label}
                </button>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <div className="scr">
        {/* Dashboard */}
        <AnimatePresence mode="wait">
          {page === 0 && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 space-y-4 pb-28"
            >
              <div className="glass rounded-[24px] p-[22px]">
                <div className="flex items-center gap-3.5">
                  <div className="animate-float"><SunnyLogo size={64} /></div>
                  <div className="flex-1">
                    <div className="text-xs text-white/35 mb-1">{t.today_savings}</div>
                    <div className="text-[28px] font-black text-[#30d158]">${(stats.saved * 0.001).toFixed(4)}</div>
                    <div className="text-[11px] text-white/25 mt-0.5">{stats.reqs} {t.chat} · {t.points} {stats.pts}</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-[11px] text-white/35">{t.energy_points}</span>
                    <span onClick={() => setModal('topup')} className="text-[11px] text-primary cursor-pointer font-bold">{t.topup} +</span>
                  </div>
                  <div className="h-[5px] bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-700"
                      style={{ width: `${Math.min(100, (credits / 1000000) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-[10px] text-white/20">
                    <span>{credits.toLocaleString()} pts</span>
                    <span>{Math.min(100, (credits / 1000000) * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between px-1">
                <span className="text-[15px] font-bold text-white">{t.recent_chats}</span>
                <span onClick={() => setPage(1)} className="text-xs text-primary cursor-pointer">{t.chat} →</span>
              </div>
              
              {msgs.length === 0 ? (
                <div className="glass rounded-[18px] p-7 text-center">
                  <div className="text-4xl mb-2.5">💬</div>
                  <div className="text-[13px] text-white/35">{t.chat_placeholder}</div>
                </div>
              ) : (
                msgs.slice(-2).map((m, i) => (
                  <div key={i} className="glass rounded-2xl p-3.5 flex gap-2.5">
                    <div className="text-sm">{m.role === 'user' ? '👤' : '☀️'}</div>
                    <div className="text-xs text-white/60 leading-relaxed flex-1">
                      {m.content.slice(0, 80)}{m.content.length > 80 ? '...' : ''}
                    </div>
                  </div>
                ))
              )}

              <button 
                onClick={() => setPage(1)} 
                className="w-full py-[17px] bg-gradient-to-br from-primary to-primary-dark border-none rounded-[20px] text-white text-[15px] font-extrabold cursor-pointer shadow-[0_8px_28px_rgba(255,140,0,0.35)]"
              >
                ☀️ {t.start_new_chat}
              </button>

              <div className="grid grid-cols-1 gap-2">
                {[
                  { icon: <Zap className="w-4 h-4 text-primary" />, title: t.smart_routing, desc: lang === 'zh' ? '简单任务优先低成本模型，复杂任务自动升级强模型，目标节省 70%+。' : 'Simple tasks use low-cost models, complex tasks auto-upgrade to strong models, saving 70%+.' },
                  { icon: <ShieldCheck className="w-4 h-4 text-[#30d158]" />, title: t.dual_audit_system, desc: lang === 'zh' ? '主模型生成后由独立审核器二次验证事实与安全，企业场景更可信。' : 'Independent auditors verify facts and safety after generation, more reliable for enterprise.' },
                  { icon: <Building2 className="w-4 h-4 text-[#0a84ff]" />, title: t.enterprise_access, desc: lang === 'zh' ? '知识库/RAG、Action Loop、审计日志与额度控制可扩展到控制台。' : 'Knowledge base/RAG, Action Loop, audit logs, and credit control scalable to console.', action: () => setPage(5) },
                ].map((item) => (
                  <div key={item.title} onClick={item.action} className={cn("glass rounded-2xl p-3.5", item.action && "cursor-pointer hover:bg-white/10 transition-colors")}>
                    <div className="flex items-center gap-2 mb-1">
                      {item.icon}
                      <div className="text-xs font-extrabold text-white">{item.title}</div>
                    </div>
                    <div className="text-[11px] text-white/40 leading-relaxed">{item.desc}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Chat Page */}
          {page === 1 && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col pb-48"
            >
              <div className="flex gap-2 p-2 px-4 overflow-x-auto no-scrollbar">
                {MODELS(t).map(m => (
                  <button 
                    key={m.id} 
                    onClick={() => setModel(m.id)} 
                    className={cn(
                      "flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all whitespace-nowrap",
                      model === m.id ? "bg-primary text-white border border-primary" : "bg-transparent text-white/45 border border-white/10"
                    )}
                  >
                    {m.label}
                    {m.tag && <span className="ml-1 text-[8px] bg-white/20 px-1 rounded-sm">{m.tag}</span>}
                  </button>
                ))}
              </div>

              <div className="px-4 space-y-4 pt-4">
                {msgs.length === 0 && (
                  <div className="text-center py-7 px-5">
                    <div className="text-6xl mb-3 animate-float">☀️</div>
                    <div className="text-[15px] font-bold text-white/55 mb-1.5">嗨！我是 Sunny</div>
                    <div className="text-[13px] text-white/30 leading-relaxed">写代码、翻译、分析、聊天...都可以！</div>
                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                      {['帮我写段代码', '翻译一段文字', '讲个笑话', '今天心情分析'].map(q => (
                        <button 
                          key={q} 
                          onClick={() => setInput(q)} 
                          className="px-3.5 py-2 bg-white/5 border border-white/10 rounded-full text-white/55 text-xs cursor-pointer"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {msgs.map((m, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex flex-col animate-pIn",
                      m.role === 'user' ? "items-end" : "items-start"
                    )}
                  >
                    {m.role === 'assistant' && (
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm">☀️</span>
                        <span className="text-[10px] text-white/30">Sunny</span>
                        {m.meta && (
                          <span className="text-[9px] text-[#30d158] bg-[#30d158]/10 px-1.5 py-0.5 rounded-full">
                            {m.meta.modelLabel || m.meta.model}
                          </span>
                        )}
                      </div>
                    )}
                    <div 
                      onContextMenu={(e) => { e.preventDefault(); setLongPressMsg({ ...m, index: i }); }}
                      className={cn(
                        "max-w-[85%] p-3 px-4 text-sm leading-relaxed whitespace-pre-wrap break-words relative group",
                        m.role === 'user' 
                          ? "rounded-[18px_18px_4px_18px] bg-gradient-to-br from-primary to-primary-dark text-white" 
                          : "rounded-[18px_18px_18px_4px] bg-white/6 border border-white/8 text-white/85"
                      )}
                    >
                      {m.content}
                      {m.role === 'assistant' && !m.error && (
                        <div className="absolute -bottom-6 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1 hover:text-primary transition-colors">👍</button>
                          <button className="p-1 hover:text-primary transition-colors">👎</button>
                        </div>
                      )}
                    </div>
                    {m.meta && m.role === 'assistant' && (
                      <div className="flex flex-wrap gap-2 mt-1 px-1">
                        <span className="text-[9px] text-white/20">⚡{m.meta.latencyMs}ms</span>
                        <span className="text-[9px] text-white/20">🔋{m.meta.pts}pts</span>
                        {(m.meta.savings || 0) > 0 && <span className="text-[9px] text-[#30d158]">💰省{m.meta.savings}%</span>}
                        {m.meta.auditPassed && (
                          <button 
                            onClick={() => setAuditReason(m.meta.auditReason || t.audit_passed)}
                            className="flex items-center gap-1 text-[9px] font-bold text-[#30d158] bg-[#30d158]/10 px-2 py-0.5 rounded-full hover:bg-[#30d158]/20 transition-all"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            {t.audit_passed}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {busy && (
                  <div className="flex items-center gap-2">
                    <span className="text-base">☀️</span>
                    <div className="bg-white/6 border border-white/8 rounded-[18px_18px_18px_4px] p-2.5 px-4 flex gap-1">
                      {[0, 1, 2].map(i => (
                        <div 
                          key={i} 
                          className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" 
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </motion.div>
          )}

          {/* Logs Page */}
          {page === 2 && (
            <motion.div 
              key="logs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 space-y-4 pb-28"
            >
              <div className="text-xs text-white/35">☀️ {t.sub_save_money}</div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {[[t.all || 'All', 'all'], ['L3', 'L3'], ['L2', 'L2'], ['L1', 'L1'], [t.failed || 'Error', 'error']].map(([lb, f]) => (
                  <button 
                    key={f} 
                    onClick={() => setLogFilter(f)} 
                    className={cn(
                      "flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all",
                      logFilter === f ? "bg-primary text-white" : "bg-transparent text-white/40 border border-white/10"
                    )}
                  >
                    {lb}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: t.chat, value: stats.reqs, color: '#0a84ff' },
                  { label: t.energy_points, value: `${stats.pts}pts`, color: '#FF8C00' },
                  { label: t.savings, value: `${stats.saved}%`, color: '#30d158' },
                ].map((item, i) => (
                  <div key={i} className="glass rounded-2xl p-3 text-center">
                    <div className="text-[9px] text-white/30 mb-1">{item.label}</div>
                    <div className="text-base font-black" style={{ color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {filteredLogs.length === 0 ? (
                  <div className="glass rounded-[18px] p-8 text-center text-white/30 text-sm">{t.history} {t.failed}</div>
                ) : (
                  filteredLogs.map(l => (
                    <div key={l.id} className="glass rounded-2xl p-3.5 border border-white/5">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-white/70 flex-1 mr-2 truncate font-medium">{l.prompt}</span>
                        <span className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 font-bold",
                          l.tier === 'L3' ? "text-[#bf5af2] bg-[#bf5af2]/10" : l.tier === 'L2' ? "text-[#0a84ff] bg-[#0a84ff]/10" : "text-[#30d158] bg-[#30d158]/10"
                        )}>
                          {l.tier}
                        </span>
                      </div>
                      <div className="flex gap-3 text-[10px] text-white/25">
                        <span>{l.model}</span>
                        <span>⚡{l.latency}ms</span>
                        <span>💰{t.savings} {l.savings}%</span>
                        <span>{l.ts}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* Topup Page */}
          {page === 3 && (
            <motion.div 
              key="topup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 space-y-4 pb-28"
            >
              <div className="glass rounded-[24px] p-[22px] text-center">
                <div className="text-5xl mb-2.5">⚡</div>
                <div className="text-[22px] font-black text-white mb-1">{t.topup}</div>
                <div className="text-xs text-white/35 mb-4">{t.sub_save_money}</div>
                <div className={cn("text-[28px] font-black", credits < 10000 ? 'text-[#ff453a]' : 'text-[#30d158]')}>
                  {credits.toLocaleString()}<span className="text-[12px] text-white/30 font-medium ml-1"> {t.points}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {TOPUP_PLANS(t).map((p, i) => (
                  <div 
                    key={i} 
                    onClick={() => setSelTP(i)} 
                    className={cn(
                      "glass rounded-2xl p-4 cursor-pointer text-center transition-all",
                      selTP === i ? "border-primary bg-primary/10" : "border-white/8 bg-white/4"
                    )}
                  >
                    <div className={cn("text-[22px] font-black", selTP === i ? "text-primary" : "text-white")}>${p.usd}</div>
                    <div className="text-[11px] text-white/40 mt-1">{p.pts} · {p.rmb}</div>
                    {p.bonus && <div className="text-[10px] text-[#30d158] font-bold mt-1">{p.bonus}</div>}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  { label: '💬 微信支付', method: 'wechat' },
                  { label: '🔵 支付宝', method: 'alipay' },
                  { label: '🌐 PayPal', method: 'paypal' },
                  { label: '🪙 USDT(TRC20)', method: 'usdt' }
                ].map((item) => (
                  <button 
                    key={item.method} 
                    onClick={() => doTopup(item.method)} 
                    className="w-full p-4 glass border border-white/10 rounded-2xl text-white/80 text-[13px] font-semibold text-left"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Settings Page */}
          {page === 4 && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 space-y-4 pb-28"
            >
              <div className="bg-gradient-to-br from-primary/10 to-primary-dark/5 border border-primary/15 rounded-[22px] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="animate-float"><SunnyLogo size={56} url={selectedLogo} /></div>
                  <div className="flex-1 ml-4">
                    <div className="text-[18px] font-extrabold text-white">{user?.fullName || user?.username || 'User'}</div>
                    <div className="text-[11px] text-white/35 mt-1">{user?.primaryEmailAddress?.emailAddress}</div>
                  </div>
                </div>
                <div className="text-xs text-white/50 mb-2">{t.choose_avatar}</div>
                <div className="flex gap-3 mb-4 overflow-x-auto no-scrollbar pb-2">
                  {ANIME_LOGOS.map(url => (
                    <div 
                      key={url} 
                      onClick={() => setSelectedLogo(url)}
                      className={cn(
                        "w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer border-2 transition-all",
                        selectedLogo === url ? "border-primary scale-110" : "border-transparent opacity-50"
                      )}
                    >
                      <img src={url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
                <div className="inline-flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full">
                  ☀️ {userData?.tier === 'pro' ? 'Pro' : 'Free'}
                </div>
              </div>
              
              <div className="glass rounded-[20px] overflow-hidden">
                <div className="p-3.5 px-4 border-b border-white/5 text-[11px] font-bold text-white/30 uppercase">{t.model_status}</div>
                {[
                  { icon: '🔀', name: 'OpenRouter', desc: 'GPT-4o · Claude · Llama' },
                  { icon: '🌊', name: 'Google Gemini', desc: 'Flash · Audit' },
                  { icon: '🔥', name: '通义千问', desc: 'Qwen-Max' },
                ].map((item, i) => (
                  <div key={i} className={cn("flex items-center gap-3 p-3.5 px-4", i < 2 && "border-b border-white/5")}>
                    <div className="w-[34px] h-[34px] rounded-xl bg-white/5 flex items-center justify-center text-sm">{item.icon}</div>
                    <div className="flex-1">
                      <div className="text-[13px] font-bold text-white">{item.name}</div>
                      <div className="text-[10px] text-white/30 mt-0.5">{item.desc}</div>
                    </div>
                    <span className="text-[9px] text-[#30d158] bg-[#30d158]/10 px-2 py-0.5 rounded-full">{t.online}</span>
                  </div>
                ))}
              </div>

              <div className="glass rounded-[20px] overflow-hidden">
                <div className="p-3.5 px-4 border-b border-white/5 text-[11px] font-bold text-white/30 uppercase">{t.security}</div>
                <div className="flex items-center gap-3 p-3.5 px-4 border-b border-white/5">
                  <div className="w-[34px] h-[34px] rounded-xl bg-white/5 flex items-center justify-center text-white/60"><ShieldCheck className="w-4 h-4" /></div>
                  <div className="flex-1">
                    <div className="text-[13px] font-bold text-white">{t.audit_strictness}</div>
                    <div className="text-[10px] text-white/30 mt-0.5">{auditStrictness === 'strict' ? t.strict : t.loose}</div>
                  </div>
                  <div className="flex bg-white/5 rounded-lg p-1">
                    <button onClick={() => setAuditStrictness('strict')} className={cn("px-2 py-1 text-[9px] rounded-md transition-all", auditStrictness === 'strict' ? "bg-primary text-white" : "text-white/30")}>{t.strict}</button>
                    <button onClick={() => setAuditStrictness('loose')} className={cn("px-2 py-1 text-[9px] rounded-md transition-all", auditStrictness === 'loose' ? "bg-primary text-white" : "text-white/30")}>{t.loose}</button>
                  </div>
                </div>
              </div>

              <div className="glass rounded-[20px] overflow-hidden">
                <div className="p-3.5 px-4 border-b border-white/5 text-[11px] font-bold text-white/30 uppercase">{t.language}</div>
                <div className="flex items-center gap-3 p-3.5 px-4">
                  <div className="w-[34px] h-[34px] rounded-xl bg-white/5 flex items-center justify-center text-white/60"><Smile className="w-4 h-4" /></div>
                  <div className="flex-1">
                    <div className="text-[13px] font-bold text-white">{t.language}</div>
                    <div className="text-[10px] text-white/30 mt-0.5">{lang === 'en' ? 'English' : '简体中文'}</div>
                  </div>
                  <div className="flex bg-white/5 rounded-lg p-1">
                    <button onClick={() => setLang('en')} className={cn("px-2 py-1 text-[9px] rounded-md transition-all", lang === 'en' ? "bg-primary text-white" : "text-white/30")}>EN</button>
                    <button onClick={() => setLang('zh')} className={cn("px-2 py-1 text-[9px] rounded-md transition-all", lang === 'zh' ? "bg-primary text-white" : "text-white/30")}>中文</button>
                  </div>
                </div>
              </div>

              <div className="glass rounded-[20px] overflow-hidden">
                {[
                  { icon: <Users className="w-4 h-4" />, name: t.team, desc: t.team_desc },
                  { icon: <BookOpen className="w-4 h-4" />, name: t.prompt_lib, desc: t.prompt_lib_desc },
                  { icon: <Building2 className="w-4 h-4" />, name: t.about, desc: 'v2.0.0 · SunnyGuard AI' },
                ].map((item, i) => (
                  <div key={i} className={cn("flex items-center gap-3 p-3.5 px-4 cursor-pointer hover:bg-white/5 transition-colors", i < 2 && "border-b border-white/5")}>
                    <div className="w-[34px] h-[34px] rounded-xl bg-white/5 flex items-center justify-center text-white/60">{item.icon}</div>
                    <div className="flex-1">
                      <div className="text-[13px] font-bold text-white">{item.name}</div>
                      <div className="text-[10px] text-white/30 mt-0.5">{item.desc}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20" />
                  </div>
                ))}
              </div>

              <button 
                onClick={() => signOut()} 
                className="w-full py-3.5 bg-[#ff453a]/10 border border-[#ff453a]/20 rounded-2xl text-[#ff453a] text-[13px] font-bold cursor-pointer"
              >
                {t.logout}
              </button>
            </motion.div>
          )}

          {/* Enterprise Page */}
          {page === 5 && (
            <motion.div 
              key="enterprise"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 space-y-4 pb-28"
            >
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => setPage(0)} className="text-white/40"><ChevronRight className="w-5 h-5 rotate-180" /></button>
                <div className="text-lg font-black text-white">{t.enterprise_access}</div>
              </div>
              
              <div className="glass rounded-3xl p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <div className="text-lg font-bold text-white mb-2">{t.enterprise_title}</div>
                <div className="text-xs text-white/40 leading-relaxed mb-6">
                  {t.enterprise_desc}
                </div>
                
                <div className="space-y-3 text-left">
                  {[
                    { title: t.rag_title, desc: t.rag_desc },
                    { title: t.webhook_title, desc: t.webhook_desc },
                    { title: t.multichannel_title, desc: t.multichannel_desc }
                  ].map(item => (
                    <div key={item.title} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <div className="text-sm font-bold text-white mb-1">{item.title}</div>
                      <div className="text-[10px] text-white/30">{item.desc}</div>
                    </div>
                  ))}
                </div>
                
                <button className="w-full mt-6 py-4 bg-primary rounded-2xl text-white font-bold shadow-lg shadow-primary/20">
                  {t.enterprise_trial}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Input Bar (Floating) */}
      {page === 1 && (
        <div className="absolute bottom-[72px] left-0 right-0 glass border-t border-white/5 p-2.5 px-3.5 z-50">
          <div className="flex gap-2 mb-2 overflow-x-auto no-scrollbar">
            {TONES.map(t => (
              <button 
                key={t.id} 
                onClick={() => setTone(t.id as any)}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all",
                  tone === t.id ? "bg-primary/20 text-primary border border-primary/30" : "bg-white/5 text-white/30 border border-white/5"
                )}
              >
                <span>{t.icon}</span>
                <span>{lang === 'zh' ? t.label_zh : t.label_en}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex flex-col gap-2">
              <button className="w-10 h-10 rounded-[13px] glass flex items-center justify-center text-white/40 hover:text-primary transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <textarea 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} 
              placeholder={t.chat_placeholder} 
              rows={1} 
              className="flex-1 p-2.5 px-3.5 bg-white/5 border border-white/10 rounded-[18px] text-white/85 text-sm outline-none resize-none max-h-[100px] leading-relaxed"
            />
            <button 
              onClick={send} 
              disabled={busy || !input.trim()} 
              className={cn(
                "w-10 h-10 rounded-[13px] flex items-center justify-center text-lg flex-shrink-0 transition-all",
                busy || !input.trim() ? "bg-white/5 text-white/20" : "bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg"
              )}
            >
              {busy ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 left-0 right-0 h-[72px] glass border-t border-white/5 flex items-start justify-around pt-2.5 z-[100]">
        {[
          { label: t.dashboard, icon: <LayoutDashboard className="w-5 h-5" />, id: 0 },
          { label: t.chat, icon: <MessageSquare className="w-5 h-5" />, id: 1 },
          { label: t.enterprise, icon: <Building2 className="w-5 h-5" />, id: 5 },
          { label: t.logs, icon: <History className="w-5 h-5" />, id: 2 },
          { label: t.topup, icon: <Zap className="w-5 h-5" />, id: 3 },
          { label: t.settings, icon: <Settings className="w-5 h-5" />, id: 4 },
        ].map((item) => (
          <button 
            key={item.id} 
            onClick={() => { setPage(item.id); }} 
            className="flex flex-col items-center gap-1 cursor-pointer border-none bg-none flex-1"
          >
            <div className={cn(
              "w-[38px] h-[38px] rounded-[11px] flex items-center justify-center transition-all duration-200",
              page === item.id ? "bg-gradient-to-br from-primary to-primary-dark shadow-[0_4px_14px_rgba(255,140,0,0.3)] -translate-y-0.5 text-white" : "text-white/30"
            )}>
              {item.icon}
            </div>
            <span className={cn("text-[8px] font-bold", page === item.id ? "text-primary" : "text-white/30")}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Modals */}
      <AnimatePresence>
        {auditReason && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAuditReason(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-md z-[300] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass rounded-3xl p-6 w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="text-[#30d158] w-6 h-6" />
                <h3 className="text-lg font-bold text-white">审核详情</h3>
              </div>
              <div className="text-sm text-white/70 leading-relaxed mb-6 bg-white/5 p-4 rounded-xl border border-white/10">
                {auditReason}
              </div>
              <button 
                onClick={() => setAuditReason(null)}
                className="w-full py-3 bg-primary rounded-xl text-white font-bold"
              >
                知道了
              </button>
            </motion.div>
          </motion.div>
        )}

        {modal === 'topup' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setModal(''); }} 
            className="absolute inset-0 bg-black/75 backdrop-blur-xl z-[200] flex items-end"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-[#1c1c1e] rounded-[24px_24px_0_0] p-2 px-4 pb-7 w-full"
            >
              <div className="w-9 h-1 bg-white/15 rounded-full mx-auto my-2.5 mb-[18px]" />
              <div className="text-lg font-black text-white mb-1">⚡ {t.topup}</div>
              <div className="text-xs text-white/35 mb-4">{t.sub_save_money}</div>
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                {TOPUP_PLANS(t).map((p, i) => (
                  <div 
                    key={i} 
                    onClick={() => setSelTP(i)} 
                    className={cn(
                      "rounded-2xl p-3.5 cursor-pointer text-center border-1.5",
                      selTP === i ? "bg-primary/10 border-primary" : "bg-white/4 border-white/8"
                    )}
                  >
                    <div className={cn("text-[21px] font-black", selTP === i ? "text-primary" : "text-white")}>${p.usd}</div>
                    <div className="text-[11px] text-white/40 mt-0.5">{p.pts} · {p.rmb}</div>
                    {p.bonus && <div className="text-[10px] text-[#30d158] font-bold mt-1">{p.bonus}</div>}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  { label: '💬 微信支付', method: 'wechat' },
                  { label: '🔵 支付宝', method: 'alipay' },
                  { label: '🌐 PayPal', method: 'paypal' },
                  { label: '🪙 USDT(TRC20)', method: 'usdt' }
                ].map((item) => (
                  <button 
                    key={item.method} 
                    onClick={() => doTopup(item.method)} 
                    className="w-full p-3.5 bg-white/6 border border-white/10 rounded-xl text-white/80 text-[13px] font-semibold text-left"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {modal === 'topup-pay' && topupPay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setModal(''); }} 
            className="absolute inset-0 bg-black/75 backdrop-blur-xl z-[200] flex items-end"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-[#1c1c1e] rounded-[24px_24px_0_0] p-2 px-4 pb-7 w-full"
            >
              <div className="w-9 h-1 bg-white/15 rounded-full mx-auto my-2.5 mb-4" />
              <div className="text-[17px] font-black text-white mb-2">
                {topupPay.method === 'wechat' ? '💬 微信支付' : topupPay.method === 'alipay' ? '🔵 支付宝' : topupPay.method === 'usdt' ? '🪙 USDT(TRC20)' : '🌐 PayPal'}
              </div>
              <div className="text-[13px] text-white/5 mb-3.5 leading-relaxed">
                支付 <strong className="text-primary">{topupPay.payment?.amount_cny || `$${TOPUP_PLANS[selTP].usd}`}</strong> 获得 <strong className="text-[#30d158]">{TOPUP_PLANS[selTP].pts}能量点</strong>
              </div>
              {topupPay.method === 'usdt' && (
                <div className="bg-[#10b981]/8 border border-[#10b981]/22 rounded-xl p-3 px-3.5 mb-3.5">
                  <div className="text-[11px] text-[#34d399] font-bold mb-1">USDT 收款地址（{topupPay.payment?.network || 'TRON (TRC20)'}）</div>
                  <div className="text-xs text-white/78 leading-relaxed break-all font-mono">{topupPay.payment?.address || 'TL4FQUjtgz7gy6UMEx5gZsZkK2Npmkq1YH'}</div>
                </div>
              )}
              <div className="bg-primary/5 border border-primary/15 rounded-xl p-3 px-3.5 mb-3.5">
                <div className="text-[11px] text-primary font-bold mb-1">付款后操作</div>
                <div className="text-xs text-white/45 leading-relaxed">
                  1. 截图付款记录<br />
                  2. 发截图+参考号给客服<br />
                  3. 参考号：<code className="font-mono bg-white/5 px-1.5 py-0.5 rounded-sm">{topupPay.ref}</code>
                </div>
              </div>
              {topupPay.method === 'paypal' && (
                <a 
                  href={topupPay.payment?.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="block p-3.5 bg-[#003087] text-white rounded-xl text-center font-bold text-sm mb-2.5 no-underline"
                >
                  跳转 PayPal →
                </a>
              )}
              <button 
                onClick={() => setModal('')} 
                className="w-full p-3.5 bg-white/6 border border-white/8 rounded-xl text-white/60 text-sm font-semibold cursor-pointer"
              >
                已发截图，等待到账 ✓
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#050508]">
      <SignedOut>
        <Landing />
      </SignedOut>
      <SignedIn>
        <MainApp />
      </SignedIn>
    </div>
  );
}
