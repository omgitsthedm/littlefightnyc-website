import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, ShieldCheck, ArrowUpRight, MessageSquare } from "lucide-react";
import TugMark from "@/components/editorial/TugMark";
import TugAvatar from "@/components/editorial/TugAvatar";
import { openConsentPreferences } from "@/lib/consent";
import { installLocalizedMeta } from "@/lib/localizedMeta";
import "./Espanol.css";

/**
 * /zh/ — the complete pitch in Simplified Chinese, on the proven /es/ model:
 * ONE fully-translated standalone page (own chrome) rather than a half-
 * translated site switcher. ~600k Chinese speakers in NYC and thousands of
 * Chinese-owned small businesses — exactly our customer, almost never spoken
 * to by web shops. Every promise here is the same real promise the English
 * site makes. No claim of Chinese-speaking staff: the contact line says write
 * in whichever language is comfortable (same honest pattern as /es/).
 * Reuses Espanol.css wholesale — same visual language, zero new CSS.
 */

const SERVICES = [
  {
    title: "网站建设",
    line: "一个能让电话响起来的网站。电话、预约、收款、谷歌——全都好用，连在一起。",
  },
  {
    title: "技术支持",
    line: "网络、收银机、邮箱、收款出了问题？接电话的是真人，帮您修好。",
  },
  {
    title: "免费咨询",
    line: "我们告诉您哪些有用、哪些多余、先修哪个。如果您不需要我们，我们也会直说。",
  },
  {
    title: "自有软件",
    line: "别再按月租软件了。我们为您做一次工具——永远属于您。",
  },
];

const PROMISES = [
  "咨询永远免费。",
  "14天上线您的网站——否则分文不收。",
  "早9点到晚9点，2小时内回电。",
  "代码、数据、一切：都归您。",
];

const PROOF = [
  {
    client: "Hair By Rachel Charles",
    line: "从只靠私信预约，到真正好用的在线预约网站。",
    fact: "Lighthouse 四项满分 · 两周上线",
  },
  {
    client: "定制橱柜估价软件",
    line: "团队每天用在真实项目上的内部工作系统。",
    fact: "3个工具 → 1个可靠数据源",
  },
  {
    client: "CC Films",
    line: "为独立电影打造更清楚、更可信的官方网站。",
    fact: "搜索结构、安全标头和发布流程全面加固",
  },
];

export default function Zhongwen() {
  useEffect(() => {
    return installLocalizedMeta({
      lang: "zh",
      path: "/zh/",
      title: "Little Fight NYC 中文 | 纽约小生意的网站与技术支持",
      description:
        "Little Fight NYC 中文：为纽约小生意提供网站建设、技术支持、免费咨询和自有软件。14天上线，代码和数据归您；电话、短信或邮件都由真人回复。服务纽约五大区。",
    });
  }, []);

  return (
    <div className="lf-editorial lf-es" lang="zh">
      <header className="lf-es__top">
        <span className="lf-es__brand">
          <TugMark className="lf-es__mark" />
          Little Fight NYC
        </span>
        <a className="lf-es__top-phone" href="tel:+16463600318">
          (646) 360-0318
        </a>
      </header>

      <main className="lf-es__main">
        <section className="lf-es__hero">
          <h1>
            您的网站带来顾客。
            <br />
            <span className="lf-es__em">我们让它一直好用。</span>
          </h1>
          <p className="lf-es__sub">
            我们为您做网站，在技术出故障时马上响应，并帮您砍掉每月吃掉利润的软件费。我们做的一切，都归您所有。
          </p>

          <div className="lf-es__actions">
            <a className="lf-es__cta lf-es__cta--primary" href="tel:+16463600318">
              <Phone size={20} strokeWidth={1.75} aria-hidden="true" />
              打电话：(646) 360-0318
            </a>
            <Link
              className="lf-es__cta"
              to="/tech-audit/?intent=website&source=zh"
              data-lf-event="website_plan_intent"
              data-lf-label="zh_hero"
            >
              规划我的网站
              <ArrowUpRight size={18} strokeWidth={1.9} aria-hidden="true" />
            </Link>
          </div>
          <p className="lf-es__action-note">咨询免费。先给您一份清楚的方案，再由您决定。</p>

          <ul className="lf-es__trust">
            <li>
              <MapPin size={16} strokeWidth={1.75} aria-hidden="true" />
              纽约。我们上门服务。
            </li>
            <li>
              <Clock size={16} strokeWidth={1.75} aria-hidden="true" />
              2小时内回电
            </li>
            <li>
              <ShieldCheck size={16} strokeWidth={1.75} aria-hidden="true" />
              我们做的，归您所有
            </li>
          </ul>
        </section>

        <section className="lf-es__proof" aria-label="真实案例">
          <div className="lf-es__section-head">
            <p>看成果，不听空话</p>
            <h2>已经上线、正在发挥作用的真实项目。</h2>
          </div>
          <ul>
            {PROOF.map((item) => (
              <li key={item.client}>
                <strong>{item.client}</strong>
                <span>{item.line}</span>
                <small>{item.fact}</small>
              </li>
            ))}
          </ul>
          <Link className="lf-es__proof-link" to="/examples/">
            查看全部案例 <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </section>

        <section className="lf-es__services" aria-label="我们做什么">
          <h2>我们做什么</h2>
          <ul>
            {SERVICES.map((s) => (
              <li key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.line}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="lf-es__fight">
          <p>
            连锁大店来的时候带着技术团队。街角小店从来没有过。所以有了我们：让小生意用上同样的工具——没有大公司的账单。
          </p>
        </section>

        <section className="lf-es__promises" aria-label="我们的承诺">
          <h2>您可以放心的事</h2>
          <ul>
            {PROMISES.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>

        {/* The tug — text-free brand moment, no translation compromise. */}
        <TugAvatar />

        <section className="lf-es__contact">
          <h2>聊聊吧</h2>
          <p>
            打电话、发短信、发邮件都行——用您最习惯的语言写。回复您的是真人。没有机器人，没有工单号。
          </p>
          <a className="lf-es__cta lf-es__cta--primary lf-es__cta--big" href="tel:+16463600318">
            <Phone size={22} strokeWidth={1.75} aria-hidden="true" />
            (646) 360-0318
          </a>
          <div className="lf-es__contact-links">
            <a href="sms:+16463600318"><MessageSquare size={16} aria-hidden="true" /> 发短信</a>
            <a href="mailto:hello@littlefightnyc.com"><Mail size={16} aria-hidden="true" /> 发邮件</a>
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
          分析偏好设置
        </button>
      </footer>
    </div>
  );
}
