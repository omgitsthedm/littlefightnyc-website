import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, ShieldCheck, ArrowUpRight, MessageSquare } from "lucide-react";
import TugMark from "@/components/editorial/TugMark";
import { openConsentPreferences } from "@/lib/consent";
import { installLocalizedMeta } from "@/lib/localizedMeta";
import "./Espanol.css";
import { PHONE_DISPLAY, PHONE_HREF, SMS_HREF } from "@/data/contact";
import { CABINETRY_PROCESS_FILM } from "@/data/cinematic-media";
import CinematicMedia from "@/components/editorial/CinematicMedia";
import ConnectedPathDiagram from "@/components/dataviz/ConnectedPathDiagram";
import type { ConnectedPath } from "@/components/dataviz/connectedPath";

/**
 * /zh/ is the complete pitch in Simplified Chinese, on the proven /es/ model:
 * ONE fully-translated standalone page (own chrome) rather than a half-
 * translated site switcher. ~600k Chinese speakers in NYC and thousands of
 * Chinese-owned small businesses are exactly our customer, almost never spoken
 * to by web shops. Every promise here is the same real promise the English
 * site makes. No claim of Chinese-speaking staff: the contact line says write
 * in whichever language is comfortable (same honest pattern as /es/).
 * Reuses Espanol.css wholesale: same visual language, zero new CSS.
 */

const SERVICES = [
  {
    title: "定制网站",
    line: "按您的顾客、服务和做事方式来做。生意不用迁就模板。",
  },
  {
    title: "修好出故障的技术",
    line: "收款、网络、邮箱、收银机或预约出了问题，纽约可上门；能否远程处理要看具体工作。",
  },
  {
    title: "先免费帮您看一遍",
    line: "告诉您什么该留、先修什么、哪些钱不用花。就算不需要我们，我们也会直说。",
  },
  {
    title: "您自己拥有的软件",
    line: "用一套更简单的专用工具，替换不合适的表格和月费软件。文件、数据和控制权归您。",
  },
];

const PROMISES = [
  "先帮您看一遍，永远免费。",
  "网站书面方案会写明时间、双方要做的事，以及我们误期时怎么办。",
  "早9点到晚9点，我们争取在2小时内回电。",
  "文件、数据和使用说明都交到您手里。",
];

const STAYS = [
  "您的店名、电话号码、域名和品牌。",
  "现在真正好用的工具。",
  "您招呼顾客、完成工作的方式。",
];

const EASIER = [
  "让新顾客找到您，也看懂您做什么。",
  "预约、收款和联系。",
  "出问题时，知道该找谁。",
];

const CUSTOMER_PATH: ConnectedPath = {
  label: "顾客路径",
  summary: "顾客先看到清楚的信息，知道下一步该做什么，能联系到真人或完成预约，生意自己保留账号、记录和控制权。",
  caption: "让顾客走得明白，控制权仍在生意自己手里。",
  nodes: [
    { id: "one", label: "顾客看到清楚的信息", sub: "服务 · 时间 · 地点", col: 0 },
    { id: "two", label: "知道下一步怎么做", sub: "打电话 · 预约 · 提问", col: 1 },
    { id: "three", label: "联系到真人或完成预约", sub: "有人负责回复", tone: "hub", col: 2 },
    { id: "four", label: "生意自己保留控制权", sub: "账号 · 记录 · 权限", tone: "signal", col: 3 },
  ],
  edges: [
    { from: "one", to: "two", tone: "muted", chip: "信息清楚" },
    { from: "two", to: "three", tone: "signal", chip: "下一步明确", pulse: true },
    { from: "three", to: "four", tone: "signal", chip: "有人负责", pulse: true },
  ],
};

const PROOF = [
  {
    client: "Hair By Rachel Charles",
    status: "公开网站",
    line: "从只靠私信预约，到一个新顾客能找到、看懂并直接预约的网站。",
    fact: "公开案例里有可点击的验证信息和上线网站。",
    image: "/assets/case-hair-by-rachel-charles-900.webp",
    alt: "Hair By Rachel Charles 的在线预约网站",
  },
  {
    client: "私人报价系统",
    status: "私人客户项目",
    line: "把真实报价流程集中到团队每天使用的一套系统里。",
    fact: "私人项目：展示做法，不公开客户资料。",
    image: CABINETRY_PROCESS_FILM.poster,
    video: CABINETRY_PROCESS_FILM,
    alt: "用于准备木工报价的私人工作面板",
  },
  {
    client: "CC Films",
    status: "公开网站",
    line: "为独立电影打造更清楚、更可信的官方网站。",
    fact: "公开案例里有可点击的验证信息和上线网站。",
    image: "/assets/case-cc-films-900.webp",
    alt: "电影 If That Mockingbird Don't Sing 的官方网站",
  },
];

export default function Zhongwen() {
  useEffect(() => {
    return installLocalizedMeta({
      lang: "zh",
      path: "/zh/",
      title: "Little Fight NYC 中文 | 纽约小生意的网站与技术支持",
      description:
        "Little Fight NYC 中文：为纽约小生意提供网站、技术支持和免费咨询。计划写清时间，网站和资料归您；真人回复。",
    });
  }, []);

  return (
    <div className="lf-editorial lf-es" lang="zh">
      <header className="lf-es__top">
        <span className="lf-es__brand">
          <TugMark className="lf-es__mark" />
          Little Fight NYC
        </span>
        <a className="lf-es__top-phone" href={PHONE_HREF} data-lf-label="zh_header_phone">
          {PHONE_DISPLAY}
        </a>
      </header>

      <main className="lf-es__main">
        <section className="lf-es__hero" data-lf-owner-intro="true">
          <div className="lf-es__hero-copy">
            <p className="lf-es__eyebrow">为纽约小生意做清楚、好用的技术</p>
            <h1>
              网站按您的生意来做。
              <span className="lf-es__em">
                技术出问题时，有真人帮您。
              </span>
            </h1>
            <p className="lf-es__sub">
              我们不拿套版硬塞给您。我们做定制网站，修好已经出故障的设备和系统，也能把昂贵、难用的月费软件换成您自己拥有的工具。
            </p>

            <div className="lf-es__actions" data-lf-contact-rail="true">
              <a className="lf-es__cta lf-es__cta--primary" href={PHONE_HREF} data-lf-label="zh_hero_phone">
                <Phone size={20} strokeWidth={1.75} aria-hidden="true" />
                打电话：{PHONE_DISPLAY}
              </a>
              <Link
                className="lf-es__cta"
                to="/tech-audit/?intent=website&source=zh"
                data-lf-event="website_plan_intent"
                data-lf-label="zh_hero"
              >
                给我一份清楚的方案
                <ArrowUpRight size={18} strokeWidth={1.9} aria-hidden="true" />
              </Link>
            </div>
            <div className="lf-es__hero-channels" aria-label="其他联系方式">
              <a href={SMS_HREF}>
                <MessageSquare size={16} strokeWidth={1.9} aria-hidden="true" />
                短信
              </a>
              <a href="mailto:hello@littlefightnyc.com">
                <Mail size={16} strokeWidth={1.9} aria-hidden="true" />
                邮件
              </a>
              <Link to="/tech-audit/?source=zh_hero_form">
                表格
              </Link>
            </div>
            <p className="lf-es__action-note">
              先免费帮您看一遍。纽约可上门；网站项目也可远程做。给您清楚的方案，再由您决定。
            </p>

            <ul className="lf-es__trust">
              <li>
                <MapPin size={18} strokeWidth={1.75} aria-hidden="true" />
                纽约五大区。我们可以上门。
              </li>
              <li>
                <Clock size={18} strokeWidth={1.75} aria-hidden="true" />
                美东时间早9点到晚9点，我们争取在2小时内回电。
              </li>
              <li>
                <ShieldCheck size={18} strokeWidth={1.75} aria-hidden="true" />
                做好的东西和控制权都归您。
              </li>
            </ul>
          </div>

          <figure className="lf-es__hero-scene">
            <img
              src="/assets/pos.webp"
              alt="纽约小店柜台上的收银设备和刷卡终端"
              width="960"
              height="640"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
            <figcaption>
              柜台是生意每天运转的地方。技术应该跟得上。
            </figcaption>
          </figure>
        </section>

        <section className="lf-es__services" aria-labelledby="lf-zh-services-title">
          <div className="lf-es__section-head">
            <p>先从今天最麻烦的事开始</p>
            <h2 id="lf-zh-services-title">我们能帮您做这四件事。</h2>
            <span>不用一次把所有东西都换掉。</span>
          </div>
          <ul>
            {SERVICES.map((service, index) => (
              <li
                className={index === 0 ? "lf-es__service lf-es__service--lead" : "lf-es__service"}
                key={service.title}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.line}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="lf-es__fit" aria-labelledby="lf-zh-fit-title">
          <div className="lf-es__section-head">
            <p>升级，不是全部推倒重来</p>
            <h2 id="lf-zh-fit-title">不推翻您的生意，只把麻烦拿掉。</h2>
            <span>我们先听您怎么工作，再一起决定什么值得改。</span>
          </div>
          <div className="lf-es__fit-grid">
            <article>
              <h3>继续保留</h3>
              <ul>
                {STAYS.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
            <article>
              <h3>变得更轻松</h3>
              <ul>
                {EASIER.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          </div>
        </section>

        <section className="lf-es__path" aria-labelledby="lf-zh-path-title">
          <div className="lf-es__section-head">
            <p>顾客走得明白</p>
            <h2 id="lf-zh-path-title">一次咨询应该这样往下走。</h2>
            <span>不用猜下一步，也不用猜消息会落到哪里。</span>
          </div>
          <ConnectedPathDiagram path={CUSTOMER_PATH} proof="language" />
        </section>

        <section className="lf-es__fight">
          <p>
            生意怎么做，您最清楚。我们先听您怎么工作，留下好用的，修掉添乱的。您不需要先变成技术专家。
          </p>
        </section>

        <section className="lf-es__proof" aria-label="真实项目">
          <div className="lf-es__section-head">
            <p>真实项目</p>
            <h2>这些已经在为客户做事。</h2>
            <span>公开网站和私人系统都会清楚标明。</span>
          </div>
          <ul>
            {PROOF.map((item) => (
              <li key={item.client}>
                {item.video ? (
                  <CinematicMedia media={item.video} alt={item.alt} />
                ) : (
                  <img
                    src={item.image}
                    alt={item.alt}
                    width="900"
                    height="675"
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <div>
                  <small>{item.status}</small>
                  <strong>{item.client}</strong>
                  <span>{item.line}</span>
                  <em>{item.fact}</em>
                </div>
              </li>
            ))}
          </ul>
          <Link className="lf-es__proof-link" to="/examples/">
            查看所有真实案例 <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </section>

        <section className="lf-es__promises" aria-label="我们的承诺">
          <div className="lf-es__section-head">
            <p>没有意外</p>
            <h2>从第一通电话，到上线以后。</h2>
          </div>
          <ul>
            {PROMISES.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>

        <section className="lf-es__contact">
          <div className="lf-es__contact-copy">
            <p className="lf-es__eyebrow">回复您的是真人</p>
            <h2>告诉我们哪里不顺。</h2>
            <p>
              打电话、发短信或发邮件都行。写您最习惯的语言。没有机器人，也没有工单号。
            </p>
          </div>
          <div className="lf-es__contact-actions">
            <a className="lf-es__cta lf-es__cta--primary lf-es__cta--big" href={PHONE_HREF} data-lf-label="zh_contact_phone">
              <Phone size={22} strokeWidth={1.75} aria-hidden="true" />
              {PHONE_DISPLAY}
            </a>
            <div className="lf-es__contact-links">
              <a href={SMS_HREF}><MessageSquare size={18} aria-hidden="true" /> 发短信</a>
              <a href="mailto:hello@littlefightnyc.com"><Mail size={18} aria-hidden="true" /> 发邮件</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="lf-es__foot">
        <p>Little Fight NYC · 纽约 · 始于2021 · 依然有人接电话</p>
        <Link to="/" className="lf-es__foot-link">
          查看完整英文网站
          <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
        </Link>
        <button type="button" className="lf-es__foot-link" onClick={openConsentPreferences}>
          隐私选项
        </button>
      </footer>
    </div>
  );
}
