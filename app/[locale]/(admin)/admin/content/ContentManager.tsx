"use client";

import { useState, useTransition } from "react";
import {
  FileText, Newspaper, Briefcase, Megaphone, Plus, Trash2, Eye, EyeOff,
  CheckCircle, AlertCircle, Save, ExternalLink, Loader2, Pencil, X,
} from "lucide-react";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { Button } from "@/components/primitives/Button";
import type { AboutContent, BlogPost, JobOpening, PressItem } from "@/lib/company-content";
import {
  updateAboutContent,
  createBlogPost, updateBlogPost, toggleBlogPost, deleteBlogPost,
  createJob, updateJob, toggleJob, deleteJob,
  createPressItem, deletePressItem,
} from "@/actions/content";

type Tab = "about" | "blog" | "careers" | "press";

interface Props {
  about: AboutContent;
  blog: BlogPost[];
  jobs: JobOpening[];
  press: PressItem[];
}

const TABS: { id: Tab; label: string; icon: typeof FileText }[] = [
  { id: "about", label: "เกี่ยวกับเรา", icon: FileText },
  { id: "blog", label: "บล็อก", icon: Newspaper },
  { id: "careers", label: "ร่วมงานกับเรา", icon: Briefcase },
  { id: "press", label: "สื่อ", icon: Megaphone },
];

const inputCls = "w-full border border-line rounded-r2 px-3.5 h-[40px] text-[14px] font-thai bg-paper focus:outline-none focus:border-viridian transition-colors";
const areaCls = "w-full border border-line rounded-r2 px-3.5 py-2.5 text-[14px] font-thai bg-paper focus:outline-none focus:border-viridian resize-none transition-colors";

export function ContentManager({ about, blog, jobs, press }: Props) {
  const [tab, setTab] = useState<Tab>("about");
  const [alert, setAlert] = useState<{ ok: boolean; msg: string } | null>(null);

  function notify(ok: boolean, msg: string) {
    setAlert({ ok, msg });
    if (ok) setTimeout(() => setAlert(null), 3500);
  }

  return (
    <div className="max-w-[920px] mx-auto px-8 py-8">
      <div className="mb-8">
        <EyebrowLabel className="mb-1">— CONTENT (COMPANY)</EyebrowLabel>
        <h1 className="font-display text-[32px] text-ink tracking-[-0.015em]">จัดการเนื้อหาบริษัท</h1>
        <p className="text-[14px] text-ink-3 mt-1 font-thai">เกี่ยวกับเรา · บล็อก · ร่วมงานกับเรา · สื่อ</p>
      </div>

      {alert && (
        <div className={`flex items-center gap-2 text-[13px] rounded-r2 px-4 py-2.5 mb-5 ${alert.ok ? "bg-ok/10 border border-ok/20 text-ok" : "bg-danger/5 border border-danger/20 text-danger"}`}>
          {alert.ok ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {alert.msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => { setTab(id); setAlert(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-r2 text-[13px] font-medium transition-colors ${tab === id ? "bg-viridian text-white" : "bg-paper-3 border border-line text-ink-2 hover:border-viridian/40"}`}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {tab === "about" && <AboutTab about={about} notify={notify} />}
      {tab === "blog" && <BlogTab posts={blog} notify={notify} />}
      {tab === "careers" && <CareersTab jobs={jobs} notify={notify} />}
      {tab === "press" && <PressTab items={press} notify={notify} />}
    </div>
  );
}

// ── About Tab ───────────────────────────────────────────────────────────────────

function AboutTab({ about, notify }: { about: AboutContent; notify: (ok: boolean, m: string) => void }) {
  const [pending, start] = useTransition();
  const [heroTitle, setHeroTitle] = useState(about.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(about.heroSubtitle);
  const [mission, setMission] = useState(about.mission);
  const [story, setStory] = useState(about.story);

  function save(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await updateAboutContent({ heroTitle, heroSubtitle, mission, story });
      notify(r.success, r.success ? "บันทึกหน้าเกี่ยวกับเราแล้ว" : r.error ?? "เกิดข้อผิดพลาด");
    });
  }

  return (
    <form onSubmit={save} className="bg-paper-3 border border-line rounded-r3 p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-[15px] text-ink">หน้าเกี่ยวกับเรา</h2>
        <a href="/th/about" target="_blank" rel="noopener noreferrer" className="text-[12px] text-viridian hover:underline flex items-center gap-1">
          <ExternalLink size={12} /> ดูหน้าจริง
        </a>
      </div>
      <div>
        <label className="block text-[12px] font-medium text-ink mb-1.5">หัวข้อหลัก (Hero)</label>
        <input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className="block text-[12px] font-medium text-ink mb-1.5">คำโปรย (Subtitle)</label>
        <textarea value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} rows={2} className={areaCls} />
      </div>
      <div>
        <label className="block text-[12px] font-medium text-ink mb-1.5">พันธกิจ (Mission)</label>
        <textarea value={mission} onChange={(e) => setMission(e.target.value)} rows={3} className={areaCls} />
      </div>
      <div>
        <label className="block text-[12px] font-medium text-ink mb-1.5">เรื่องราว (Story)</label>
        <textarea value={story} onChange={(e) => setStory(e.target.value)} rows={4} className={areaCls} />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" className="gap-2 w-fit" disabled={pending}>
          {pending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          บันทึก
        </Button>
        <p className="text-[11px] text-ink-4">ค่านิยมและสถิติแก้ไขได้ใน config (lib/company-content.ts)</p>
      </div>
    </form>
  );
}

// ── Blog Tab ────────────────────────────────────────────────────────────────────

function BlogTab({ posts: initial, notify }: { posts: BlogPost[]; notify: (ok: boolean, m: string) => void }) {
  const [posts, setPosts] = useState(initial);
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<string | null>(null); // id or "new"
  const [form, setForm] = useState({ title: "", excerpt: "", body: "", author: "", category: "" });

  function openNew() {
    setForm({ title: "", excerpt: "", body: "", author: "", category: "" });
    setEditing("new");
  }
  function openEdit(p: BlogPost) {
    setForm({ title: p.title, excerpt: p.excerpt, body: p.body, author: p.author, category: p.category });
    setEditing(p.id);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      if (editing === "new") {
        const r = await createBlogPost(form);
        if (r.success && r.id) {
          setPosts((prev) => [{ id: r.id!, slug: "", ...form, coverGradient: "linear-gradient(135deg,#0F5D4A,#1A7A60)", published: false, publishedAt: new Date().toISOString() } as BlogPost, ...prev]);
        }
        notify(r.success, r.success ? "สร้างบทความแล้ว (ยังไม่เผยแพร่)" : r.error ?? "ผิดพลาด");
      } else if (editing) {
        const r = await updateBlogPost(editing, form);
        if (r.success) setPosts((prev) => prev.map((p) => p.id === editing ? { ...p, ...form } : p));
        notify(r.success, r.success ? "บันทึกบทความแล้ว" : r.error ?? "ผิดพลาด");
      }
      setEditing(null);
    });
  }

  function handleToggle(id: string) {
    start(async () => {
      const r = await toggleBlogPost(id);
      if (r.success) setPosts((prev) => prev.map((p) => p.id === id ? { ...p, published: !p.published } : p));
    });
  }
  function handleDelete(id: string) {
    if (!confirm("ลบบทความนี้แน่ใจหรือไม่?")) return;
    start(async () => {
      const r = await deleteBlogPost(id);
      if (r.success) { setPosts((prev) => prev.filter((p) => p.id !== id)); notify(true, "ลบบทความแล้ว"); }
    });
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button variant="primary" className="gap-2" onClick={openNew}><Plus size={15} />เขียนบทความ</Button>
      </div>

      {editing && (
        <form onSubmit={save} className="bg-paper-3 border border-viridian/30 rounded-r3 p-6 mb-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[15px] text-ink">{editing === "new" ? "บทความใหม่" : "แก้ไขบทความ"}</h3>
            <button type="button" onClick={() => setEditing(null)} className="text-ink-4 hover:text-ink"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[12px] font-medium text-ink mb-1.5">หัวข้อ *</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-ink mb-1.5">ผู้เขียน</label>
              <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="ทีมงาน VERDA" className={inputCls} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-ink mb-1.5">หมวดหมู่</label>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Career, Learning..." className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-ink mb-1.5">คำโปรย (Excerpt)</label>
            <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} className={areaCls} />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-ink mb-1.5">เนื้อหา</label>
            <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={6} className={areaCls} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>ยกเลิก</Button>
            <Button type="submit" variant="primary" disabled={pending || !form.title.trim()}>
              {pending ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {posts.length === 0 && <EmptyState icon={Newspaper} text="ยังไม่มีบทความ" />}
        {posts.map((p) => (
          <div key={p.id} className={`border rounded-r3 p-4 ${p.published ? "bg-paper-3 border-line" : "bg-paper-2 border-line opacity-75"}`}>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-r2 shrink-0" style={{ background: p.coverGradient }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-[14px] text-ink">{p.title}</p>
                  <span className="font-mono text-[9px] px-2 py-0.5 rounded-pill bg-viridian/10 text-viridian uppercase">{p.category}</span>
                  {!p.published && <span className="font-mono text-[9px] px-2 py-0.5 rounded-pill bg-line text-ink-3 uppercase">ฉบับร่าง</span>}
                </div>
                <p className="text-[12px] text-ink-3 font-thai line-clamp-1">{p.excerpt}</p>
                <p className="font-mono text-[10px] text-ink-4 mt-1">{p.author} · {new Date(p.publishedAt).toLocaleDateString("th-TH")}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <IconBtn title={p.published ? "ซ่อน" : "เผยแพร่"} onClick={() => handleToggle(p.id)}>
                  {p.published ? <EyeOff size={14} /> : <Eye size={14} />}
                </IconBtn>
                <IconBtn title="แก้ไข" onClick={() => openEdit(p)}><Pencil size={14} /></IconBtn>
                <IconBtn title="ลบ" danger onClick={() => handleDelete(p.id)}><Trash2 size={14} /></IconBtn>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Careers Tab ─────────────────────────────────────────────────────────────────

function CareersTab({ jobs: initial, notify }: { jobs: JobOpening[]; notify: (ok: boolean, m: string) => void }) {
  const [jobs, setJobs] = useState(initial);
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", department: "", location: "", type: "Full-time", description: "", requirements: "" });

  function openNew() {
    setForm({ title: "", department: "", location: "", type: "Full-time", description: "", requirements: "" });
    setEditing("new");
  }
  function openEdit(j: JobOpening) {
    setForm({ title: j.title, department: j.department, location: j.location, type: j.type, description: j.description, requirements: j.requirements.join("\n") });
    setEditing(j.id);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      if (editing === "new") {
        const r = await createJob(form);
        if (r.success) setJobs((prev) => [{ id: `tmp_${Date.now()}`, ...form, requirements: form.requirements.split("\n").filter(Boolean), active: true, postedAt: new Date().toISOString() }, ...prev]);
        notify(r.success, r.success ? "เพิ่มตำแหน่งงานแล้ว" : r.error ?? "ผิดพลาด");
      } else if (editing) {
        const r = await updateJob(editing, form);
        if (r.success) setJobs((prev) => prev.map((j) => j.id === editing ? { ...j, ...form, requirements: form.requirements.split("\n").filter(Boolean) } : j));
        notify(r.success, r.success ? "บันทึกตำแหน่งงานแล้ว" : r.error ?? "ผิดพลาด");
      }
      setEditing(null);
    });
  }

  function handleToggle(id: string) {
    start(async () => {
      const r = await toggleJob(id);
      if (r.success) setJobs((prev) => prev.map((j) => j.id === id ? { ...j, active: !j.active } : j));
    });
  }
  function handleDelete(id: string) {
    if (!confirm("ลบตำแหน่งงานนี้แน่ใจหรือไม่?")) return;
    start(async () => {
      const r = await deleteJob(id);
      if (r.success) { setJobs((prev) => prev.filter((j) => j.id !== id)); notify(true, "ลบตำแหน่งงานแล้ว"); }
    });
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button variant="primary" className="gap-2" onClick={openNew}><Plus size={15} />เพิ่มตำแหน่งงาน</Button>
      </div>

      {editing && (
        <form onSubmit={save} className="bg-paper-3 border border-viridian/30 rounded-r3 p-6 mb-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[15px] text-ink">{editing === "new" ? "ตำแหน่งงานใหม่" : "แก้ไขตำแหน่งงาน"}</h3>
            <button type="button" onClick={() => setEditing(null)} className="text-ink-4 hover:text-ink"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[12px] font-medium text-ink mb-1.5">ตำแหน่ง *</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-ink mb-1.5">แผนก</label>
              <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Engineering, Content..." className={inputCls} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-ink mb-1.5">สถานที่</label>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="กรุงเทพฯ / Remote" className={inputCls} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-ink mb-1.5">ประเภท</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputCls}>
                <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Remote</option><option>Internship</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-ink mb-1.5">รายละเอียดงาน</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={areaCls} />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-ink mb-1.5">คุณสมบัติ (บรรทัดละข้อ)</label>
            <textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} rows={4} placeholder={"ประสบการณ์ 2+ ปี\nใช้ TypeScript ได้"} className={areaCls} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>ยกเลิก</Button>
            <Button type="submit" variant="primary" disabled={pending || !form.title.trim()}>{pending ? "กำลังบันทึก..." : "บันทึก"}</Button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {jobs.length === 0 && <EmptyState icon={Briefcase} text="ยังไม่มีตำแหน่งงาน" />}
        {jobs.map((j) => (
          <div key={j.id} className={`border rounded-r3 p-4 ${j.active ? "bg-paper-3 border-line" : "bg-paper-2 border-line opacity-75"}`}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-r2 bg-viridian/10 flex items-center justify-center shrink-0">
                <Briefcase size={15} className="text-viridian" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <p className="font-semibold text-[14px] text-ink">{j.title}</p>
                  <span className="font-mono text-[9px] px-2 py-0.5 rounded-pill bg-viridian/10 text-viridian uppercase">{j.type}</span>
                  {!j.active && <span className="font-mono text-[9px] px-2 py-0.5 rounded-pill bg-line text-ink-3 uppercase">ปิดรับ</span>}
                </div>
                <p className="text-[12px] text-ink-3">{j.department} · {j.location}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <IconBtn title={j.active ? "ปิดรับ" : "เปิดรับ"} onClick={() => handleToggle(j.id)}>
                  {j.active ? <EyeOff size={14} /> : <Eye size={14} />}
                </IconBtn>
                <IconBtn title="แก้ไข" onClick={() => openEdit(j)}><Pencil size={14} /></IconBtn>
                <IconBtn title="ลบ" danger onClick={() => handleDelete(j.id)}><Trash2 size={14} /></IconBtn>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Press Tab ───────────────────────────────────────────────────────────────────

function PressTab({ items: initial, notify }: { items: PressItem[]; notify: (ok: boolean, m: string) => void }) {
  const [items, setItems] = useState(initial);
  const [pending, start] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", outlet: "", date: "", url: "", excerpt: "", type: "News" });

  function save(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await createPressItem(form);
      if (r.success) {
        setItems((prev) => [{ id: `tmp_${Date.now()}`, ...form, date: form.date ? new Date(form.date).toISOString() : new Date().toISOString() }, ...prev]);
        setForm({ title: "", outlet: "", date: "", url: "", excerpt: "", type: "News" });
        setShowForm(false);
      }
      notify(r.success, r.success ? "เพิ่มข่าวแล้ว" : r.error ?? "ผิดพลาด");
    });
  }
  function handleDelete(id: string) {
    if (!confirm("ลบข่าวนี้แน่ใจหรือไม่?")) return;
    start(async () => {
      const r = await deletePressItem(id);
      if (r.success) { setItems((prev) => prev.filter((p) => p.id !== id)); notify(true, "ลบข่าวแล้ว"); }
    });
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button variant="primary" className="gap-2" onClick={() => setShowForm(!showForm)}><Plus size={15} />เพิ่มข่าว/สื่อ</Button>
      </div>

      {showForm && (
        <form onSubmit={save} className="bg-paper-3 border border-viridian/30 rounded-r3 p-6 mb-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[12px] font-medium text-ink mb-1.5">หัวข้อข่าว *</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-ink mb-1.5">สำนักข่าว / แหล่งที่มา</label>
              <input value={form.outlet} onChange={(e) => setForm({ ...form, outlet: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-ink mb-1.5">ประเภท</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputCls}>
                <option>News</option><option>Interview</option><option>Award</option><option>Partnership</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-ink mb-1.5">วันที่</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-ink mb-1.5">ลิงก์ (URL)</label>
              <input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-ink mb-1.5">คำโปรย</label>
            <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} className={areaCls} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>ยกเลิก</Button>
            <Button type="submit" variant="primary" disabled={pending || !form.title.trim()}>{pending ? "กำลังบันทึก..." : "บันทึก"}</Button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {items.length === 0 && <EmptyState icon={Megaphone} text="ยังไม่มีข่าว/สื่อ" />}
        {items.map((p) => (
          <div key={p.id} className="bg-paper-3 border border-line rounded-r3 p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-r2 bg-amber-100 flex items-center justify-center shrink-0">
                <Megaphone size={15} className="text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <p className="font-semibold text-[14px] text-ink">{p.title}</p>
                  <span className="font-mono text-[9px] px-2 py-0.5 rounded-pill bg-amber-100 text-amber-700 uppercase">{p.type}</span>
                </div>
                <p className="text-[12px] text-ink-3 font-thai line-clamp-1">{p.excerpt}</p>
                <p className="font-mono text-[10px] text-ink-4 mt-1">{p.outlet} · {new Date(p.date).toLocaleDateString("th-TH")}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {p.url && (
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-r2 flex items-center justify-center text-ink-3 hover:bg-paper-2" title="เปิดลิงก์">
                    <ExternalLink size={14} />
                  </a>
                )}
                <IconBtn title="ลบ" danger onClick={() => handleDelete(p.id)}><Trash2 size={14} /></IconBtn>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Shared sub-components ────────────────────────────────────────────────────────

function IconBtn({ children, title, danger, onClick }: { children: React.ReactNode; title: string; danger?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} title={title}
      className={`w-8 h-8 rounded-r2 flex items-center justify-center transition-colors ${danger ? "text-ink-3 hover:text-danger hover:bg-danger/5" : "text-ink-3 hover:bg-paper-2"}`}>
      {children}
    </button>
  );
}

function EmptyState({ icon: Icon, text }: { icon: typeof FileText; text: string }) {
  return (
    <div className="text-center py-12 text-ink-3">
      <Icon size={32} className="mx-auto mb-3 opacity-30" />
      <p className="text-[14px]">{text}</p>
    </div>
  );
}
