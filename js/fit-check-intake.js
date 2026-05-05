(() => {
  const app = document.querySelector("[data-fit-check-app]");
  if (!app) return;

  const form = document.getElementById("fit-check-intake");
  if (!form) return;

  const CATEGORIES = [
    "Quick Fix",
    "Website Cleanup",
    "Website Build / Rebuild",
    "Tool / Software Decision",
    "Business System Build",
    "Local Search / Visibility",
    "Not Sure Yet",
  ];

  const entryCategoryMap = {
    broken: "Quick Fix",
    website: "Website Cleanup",
    software: "Tool / Software Decision",
    workflow: "Business System Build",
    customers: "Local Search / Visibility",
    unsure: "Not Sure Yet",
  };

  const publicCategoryLabels = {
    "Quick Fix": "Broken thing",
    "Website Cleanup": "Website cleanup",
    "Website Build / Rebuild": "Website rebuild",
    "Tool / Software Decision": "Software savings review",
    "Business System Build": "Lead and follow-up cleanup",
    "Local Search / Visibility": "Google and local visibility",
    "Not Sure Yet": "Not sure yet",
  };

  const publicBallparkLabels = {
    "Level 1: On-demand support": "Active support",
    "Level 2: First Look": "First look",
    "Level 3: Focused cleanup": "Focused cleanup",
    "Level 4: Project build": "Project build",
    "Level 5: Larger custom help": "Larger custom help",
  };

  const categoryCopy = {
    "Quick Fix": {
      short: "Active support first. Bigger cleanup second.",
      early:
        "This sounds like something Little Fight should treat as active support first. If it touches more than one tool, David can separate the immediate fix from the bigger cleanup.",
      firstCheck: [
        "what is broken right now",
        "which platform, account, domain, form, email, booking, or payment tool is involved",
        "whether customers or staff are blocked",
      ],
      ballpark: "Level 1: On-demand support",
    },
    "Website Cleanup": {
      short: "A usable site may need clearer structure.",
      early:
        "This sounds like a website cleanup unless the foundation is working against the business. I’ll ask a few questions so we do not jump straight to a rebuild.",
      firstCheck: [
        "current site structure",
        "mobile experience",
        "calls-to-action",
        "forms or booking path",
        "basic SEO and service-page clarity",
      ],
      ballpark: "Level 3: Focused cleanup",
    },
    "Website Build / Rebuild": {
      short: "The site may need a new foundation.",
      early:
        "This may be a larger website project, especially if the business changed, the platform is wrong, or the site no longer explains the offer clearly.",
      firstCheck: [
        "current platform",
        "business positioning",
        "service structure",
        "conversion path",
        "Google and search foundation",
      ],
      ballpark: "Level 4: Project build",
    },
    "Tool / Software Decision": {
      short: "The monthly bill needs a fit check.",
      early:
        "This sounds like a software cost question. The useful question is not whether the software is good in general. It is whether it helps enough to justify the bill.",
      firstCheck: [
        "current tools and monthly costs",
        "what the team actually uses",
        "what sits disconnected",
        "what should stay, go, or be built around",
      ],
      ballpark: "Level 4: Project build",
    },
    "Business System Build": {
      short: "Leads and follow-up may be the issue.",
      early:
        "This sounds bigger than one broken tool. The messy part is usually hiding between leads, follow-up, handoffs, and the places staff still work by memory.",
      firstCheck: [
        "where leads or requests land",
        "who follows up",
        "what gets entered twice",
        "what falls through the cracks",
        "whether one simple place to see the work would help",
      ],
      ballpark: "Level 4: Project build",
    },
    "Local Search / Visibility": {
      short: "Local discovery needs a clearer path.",
      early:
        "This sounds like a local visibility issue. The search side matters, but the website and follow-up path still need to be ready for the leads it creates.",
      firstCheck: [
        "Google Business Profile",
        "service pages",
        "reviews",
        "neighborhood relevance",
        "analytics and search terms",
      ],
      ballpark: "Level 3: Focused cleanup",
    },
    "Not Sure Yet": {
      short: "No perfect tech term needed.",
      early:
        "That is fine. You do not need the right label yet. I’ll ask broad but pointed questions and place the issue before David reviews it.",
      firstCheck: [
        "website",
        "tools",
        "local visibility",
        "leads and follow-up",
      ],
      ballpark: "Level 2: First Look",
    },
  };

  const keywords = {
    "Quick Fix": [
      "broken",
      "down",
      "dns",
      "domain",
      "email stopped",
      "fix",
      "freezing",
      "login",
      "not working",
      "payment",
      "pos",
      "urgent",
    ],
    "Website Cleanup": [
      "cleanup",
      "copy",
      "cta",
      "form",
      "mobile",
      "polish",
      "seo basics",
      "site is okay",
      "slow",
      "website feels weak",
    ],
    "Website Build / Rebuild": [
      "business changed",
      "changed services",
      "conversion",
      "embarrassing",
      "new site",
      "no longer",
      "nothing converts",
      "old",
      "old developer",
      "platform is wrong",
      "rebuild",
      "site feels wrong",
      "starting over",
      "website is old",
    ],
    "Tool / Software Decision": [
      "alternatives",
      "crm",
      "expensive",
      "platform",
      "saas",
      "software",
      "subscription",
      "too much",
      "tool",
      "vs",
    ],
    "Business System Build": [
      "dashboard",
      "follow up",
      "follow-up",
      "handoff",
      "intake",
      "manual",
      "nobody knows",
      "spreadsheet",
      "tracking",
      "daily work",
      "workaround",
    ],
    "Local Search / Visibility": [
      "competitor",
      "customers find",
      "google",
      "google maps",
      "local",
      "maps",
      "near me",
      "reviews",
      "search",
      "seo",
      "visibility",
    ],
    "Not Sure Yet": ["mess", "messy", "not sure", "something feels off", "unclear"],
  };

  const questionBank = {
    "Quick Fix": [
      {
        id: "what_broken",
        label: "What is broken right now?",
        helper: "Name the visible issue. No passwords or private access details.",
        type: "textarea",
        placeholder: "Example: The booking form is live but nobody receives the submissions.",
      },
      {
        id: "business_impact",
        label: "Is it blocking customers, payments, bookings, email, or staff access?",
        type: "choice",
        options: ["Yes, customers are affected", "Yes, staff are blocked", "Not sure", "No, but it is annoying"],
      },
      {
        id: "platform_involved",
        label: "Which platform, account, domain, email, form, POS, or booking tool is involved?",
        type: "textarea",
        placeholder: "Squarespace, Google Workspace, Square, Toast, Shopify, domain registrar...",
      },
      {
        id: "when_started",
        label: "When did this start, and has anyone already tried to fix it?",
        type: "textarea",
      },
    ],
    "Website Cleanup": [
      {
        id: "current_site",
        label: "What feels weak about the current website?",
        type: "textarea",
        placeholder: "Mobile, copy, service pages, form flow, speed, SEO basics, old design...",
      },
      {
        id: "site_platform",
        label: "What platform is the site on?",
        type: "text",
        placeholder: "Squarespace, Webflow, WordPress, Wix, Shopify, not sure...",
      },
      {
        id: "visitor_action",
        label: "What should visitors do next?",
        type: "choice",
        options: ["Book", "Call", "Buy", "Fill out a form", "Request a quote", "Not sure"],
      },
      {
        id: "cleanup_or_rebuild",
        label: "Does this feel like a cleanup, or are you worried the foundation is wrong?",
        type: "choice",
        options: ["Probably cleanup", "Probably rebuild", "Not sure yet"],
      },
    ],
    "Website Build / Rebuild": [
      {
        id: "why_rebuild",
        label: "Why does the site feel like it needs a new foundation?",
        type: "textarea",
        placeholder: "The business changed, the old site is embarrassing, the platform is wrong...",
      },
      {
        id: "new_site_action",
        label: "What should the new site make easier for customers?",
        type: "choice",
        options: ["Book", "Call", "Buy", "Request a quote", "Understand services", "Find us locally"],
      },
      {
        id: "current_platform_rebuild",
        label: "What platform is the current site on, if you know?",
        type: "text",
      },
      {
        id: "do_not_lose",
        label: "What is working now that you do not want to lose?",
        type: "textarea",
      },
    ],
    "Tool / Software Decision": [
      {
        id: "software_cost",
        label: "What software or platform are you worried about?",
        type: "textarea",
        placeholder: "Example: We pay for a customer list, but the team still uses spreadsheets.",
      },
      {
        id: "monthly_cost",
        label: "Roughly what does it cost per month or year?",
        type: "text",
        placeholder: "$200/month, $3,000/month, not sure...",
      },
      {
        id: "actual_usage",
        label: "What does the team actually use it for?",
        type: "textarea",
      },
      {
        id: "workarounds",
        label: "Where does the team work around it with spreadsheets, email, notes, or memory?",
        type: "textarea",
      },
    ],
    "Business System Build": [
      {
        id: "after_contact",
        label: "What happens after someone contacts you?",
        type: "textarea",
        placeholder: "Where does the inquiry go, who sees it, and what happens next?",
      },
      {
        id: "where_lost",
        label: "What gets lost, copied twice, followed up late, or tracked manually?",
        type: "textarea",
      },
      {
        id: "tools_in_daily_work",
        label: "Which tools are part of that daily work now?",
        type: "textarea",
        placeholder: "Forms, email, Square, Shopify, spreadsheets, Airtable, Notion, customer list...",
      },
      {
        id: "thirty_day_fix",
        label: "If one operational headache got better in the next 30 days, what should it be?",
        type: "textarea",
      },
    ],
    "Local Search / Visibility": [
      {
        id: "customer_search",
        label: "What would someone search to find a business like yours?",
        type: "textarea",
        placeholder: "Example: Chelsea salon, Lower East Side bar, interior designer NYC...",
      },
      {
        id: "service_area",
        label: "Which neighborhoods, boroughs, or service areas matter most?",
        type: "text",
      },
      {
        id: "google_profile",
        label: "Do you have a Google Business Profile, and is it accurate?",
        type: "choice",
        options: ["Yes, accurate", "Yes, but weak", "Not sure", "No"],
      },
      {
        id: "competitors",
        label: "Are competitors showing up before you?",
        type: "choice",
        options: ["Yes", "Sometimes", "Not sure", "No"],
      },
    ],
    "Not Sure Yet": [
      {
        id: "biggest_drag",
        label: "Where does the business feel harder than it should?",
        type: "textarea",
        placeholder: "Website, booking, payments, follow-up, software, search, staff handoffs...",
      },
      {
        id: "tools_now",
        label: "What tools are involved, even if you are not sure which one is the problem?",
        type: "textarea",
      },
      {
        id: "what_happens",
        label: "What happens when a new customer, lead, booking, or request comes in?",
        type: "textarea",
      },
      {
        id: "meaningfully_better",
        label: "What would make this feel meaningfully better in the next 30 days?",
        type: "textarea",
      },
    ],
  };

  const state = {
    selectedEntry: "",
    initialProblem: "",
    urgencyLevel: "",
    primaryCategory: "Not Sure Yet",
    secondaryCategories: [],
    questionQueue: [],
    questionIndex: 0,
    answers: {},
    events: [],
    result: null,
  };

  const screenEls = Array.from(app.querySelectorAll("[data-fit-screen]"));
  const progressLabel = app.querySelector("[data-fit-progress-label]");
  const progressBar = app.querySelector("[data-fit-progress-bar]");
  const liveRead = app.querySelector("[data-fit-live-read]");
  const liveCategory = app.querySelector("[data-fit-live-category]");
  const liveUrgency = app.querySelector("[data-fit-live-urgency]");
  const liveBallpark = app.querySelector("[data-fit-live-ballpark]");
  const liveNext = app.querySelector("[data-fit-live-next]");
  const liveKcrb = app.querySelector("[data-fit-live-kcrb]");
  const entryTextarea = app.querySelector("#fit-initial-problem");
  const entryError = app.querySelector("[data-fit-entry-error]");
  const questionMount = app.querySelector("[data-fit-question]");
  const questionHelper = app.querySelector("[data-fit-question-helper]");
  const questionError = app.querySelector("[data-fit-question-error]");
  const readbackSummary = app.querySelector("[data-fit-readback-summary]");
  const resultMount = app.querySelector("[data-fit-result]");
  const submitButton = app.querySelector("[data-fit-submit]");
  const contactError = app.querySelector("[data-fit-contact-error]");
  const sensitiveWarning = app.querySelector("[data-fit-sensitive-warning]");
  const optionButtons = Array.from(app.querySelectorAll("[data-fit-entry]"));
  const urgencyButtons = Array.from(app.querySelectorAll("[data-fit-urgency]"));

  const progress = {
    entry: ["What's going on?", 14],
    urgency: ["How urgent is it?", 30],
    questions: ["What tools are involved?", 52],
    readback: ["Your likely category", 72],
    contact: ["Send the brief", 88],
    result: ["Your likely next step", 100],
  };

  const sensitivePattern =
    /\b(password|passcode|recovery code|api key|secret key|private key|token|credit card|bank account|ssn|social security)\b/i;

  function clean(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function hide(el) {
    if (el) el.hidden = true;
  }

  function show(el) {
    if (el) el.hidden = false;
  }

  function track(eventName, payload) {
    const eventPayload = payload || {};
    state.events.push({
      event_type: eventName,
      event_payload: eventPayload,
      created_at: new Date().toISOString(),
    });

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      ...eventPayload,
    });

    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, eventPayload);
    }
  }

  function setScreen(name) {
    screenEls.forEach((screen) => {
      screen.hidden = screen.dataset.fitScreen !== name;
    });

    const nextProgress = progress[name] || progress.entry;
    if (progressLabel) progressLabel.textContent = nextProgress[0];
    if (progressBar) progressBar.style.width = `${nextProgress[1]}%`;

    const active = screenEls.find((screen) => screen.dataset.fitScreen === name);
    const focusable = active?.querySelector(
      "button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])",
    );
    if (focusable && name !== "entry") {
      window.setTimeout(() => focusable.focus({ preventScroll: true }), 80);
    }

    track(`fit_check_${name}_shown`, {
      primary_category: state.primaryCategory,
      urgency_level: state.urgencyLevel,
    });
  }

  function classify() {
    const text = [
      state.selectedEntry,
      state.initialProblem,
      state.urgencyLevel,
      ...Object.values(state.answers),
    ]
      .join(" ")
      .toLowerCase();

    const scores = Object.fromEntries(CATEGORIES.map((category) => [category, 0]));
    const mapped = entryCategoryMap[state.selectedEntry];
    if (mapped) scores[mapped] += 5;

    CATEGORIES.forEach((category) => {
      (keywords[category] || []).forEach((keyword) => {
        if (text.includes(keyword)) scores[category] += 1;
      });
    });

    if (
      scores["Website Cleanup"] > 0 &&
      scores["Website Build / Rebuild"] > 0 &&
      /business changed|changed services|starting over|platform is wrong|embarrassing|no longer|site feels wrong|old developer/i.test(text)
    ) {
      scores["Website Build / Rebuild"] += 6;
    }

    const ranked = CATEGORIES
      .map((category) => ({ category, score: scores[category] || 0 }))
      .sort((a, b) => b.score - a.score);

    state.primaryCategory = ranked[0].score > 0 ? ranked[0].category : "Not Sure Yet";
    state.secondaryCategories = ranked
      .filter((item) => item.category !== state.primaryCategory && item.category !== "Not Sure Yet")
      .filter((item) => item.score >= 3)
      .slice(0, 3)
      .map((item) => item.category);

    let ballpark = categoryCopy[state.primaryCategory].ballpark;
    if (
      state.primaryCategory === "Business System Build" &&
      /3000|\$3|expensive|dashboard|custom|platform/i.test(text)
    ) {
      ballpark = "Level 5: Larger custom help";
    }

    return {
      primary_category: state.primaryCategory,
      secondary_categories: state.secondaryCategories,
      urgency_level: state.urgencyLevel || "planned_improvement",
      ballpark_type: ballpark,
      recommended_next_step: recommendNextStep(state.primaryCategory, state.urgencyLevel),
      client_facing_summary: makeClientSummary(),
      keep: inferKcrb("keep"),
      connect: inferKcrb("connect"),
      replace: inferKcrb("replace"),
      build: inferKcrb("build"),
      disclaimer:
        "This is not a quote. It is a fast first read based on what you shared. David needs to review the setup before scope, timeline, or pricing can be confirmed.",
    };
  }

  function recommendNextStep(category, urgency) {
    if (urgency === "emergency") return "Emergency support";
    if (category === "Quick Fix") return "Human follow-up";
    if (category === "Website Cleanup" || category === "Website Build / Rebuild") {
      return "Website review";
    }
    if (category === "Tool / Software Decision") return "Software savings review";
    if (category === "Business System Build") return "Fit Check call";
    if (category === "Local Search / Visibility") return "Google visibility review";
    return "Fit Check call";
  }

  function inferKcrb(type) {
    const category = state.primaryCategory;
    const text = [state.initialProblem, ...Object.values(state.answers)].join(" ").toLowerCase();

    const defaults = {
      keep: ["Preserve any tools, pages, or habits already helping customers or staff."],
      connect: ["Check whether working pieces are isolated from the rest of the business."],
      replace: ["Do not replace anything until David reviews fit, cost, usage, and risk."],
      build: ["Build the missing piece only if a smaller fix will not solve it."],
    };

    if (type === "keep" && /square|toast|shopify|google|webflow|squarespace/i.test(text)) {
      return ["Review which existing tools are working well enough to keep."];
    }

    if (type === "connect" && /spreadsheet|manual|instagram|form|follow|do not talk|don't talk/i.test(text)) {
      return ["Connect forms, inboxes, booking, payments, and lead tracking so work lands in one cleaner path."];
    }

    if (type === "replace" && /too expensive|barely use|underused|subscription|platform/i.test(text)) {
      return ["Review expensive or underused software before buying another platform."];
    }

    if (type === "build") {
      if (category === "Business System Build") {
        return ["Build or tailor the lead capture, follow-up, owner view, or simple helper around the way the day actually works."];
      }
      if (category.includes("Website")) {
        return ["Build clearer service pages, CTAs, form paths, and conversion structure around the actual offer."];
      }
      if (category === "Local Search / Visibility") {
        return ["Build the Google profile, service page, review, and tracking foundation."];
      }
    }

    return defaults[type];
  }

  function makeClientSummary() {
    const category = state.primaryCategory;
    const copy = categoryCopy[category] || categoryCopy["Not Sure Yet"];
    const checks = copy.firstCheck.slice(0, 3).join(", ");
    return `Here's what I'm hearing: ${clean(state.initialProblem) || "you have a messy setup that needs review"}. The issue seems to be ${displayCategory(category)}. The first thing Little Fight should probably check is ${checks}.`;
  }

  function displayCategory(category) {
    return publicCategoryLabels[category] || category || "Not sure yet";
  }

  function displayBallpark(ballpark) {
    return publicBallparkLabels[ballpark] || ballpark || "First look";
  }

  function hasSensitiveText(value) {
    return sensitivePattern.test(value || "");
  }

  function updateSensitiveWarning() {
    const text = [state.initialProblem, ...Object.values(state.answers)].join(" ");
    if (hasSensitiveText(text)) {
      show(sensitiveWarning);
    } else {
      hide(sensitiveWarning);
    }
  }

  function updateLiveBrief(result) {
    const current = result || classify();
    const copy = categoryCopy[current.primary_category] || categoryCopy["Not Sure Yet"];
    if (liveRead) liveRead.textContent = copy.early;
    if (liveCategory) liveCategory.textContent = displayCategory(current.primary_category);
    if (liveUrgency) {
      liveUrgency.textContent =
        current.urgency_level === "emergency"
          ? "Emergency"
          : current.urgency_level === "urgent_but_not_emergency"
            ? "Urgent"
            : current.urgency_level === "exploratory"
              ? "Exploratory"
              : "Planned improvement";
    }
    if (liveBallpark) liveBallpark.textContent = displayBallpark(current.ballpark_type || copy.ballpark);
    if (liveNext) liveNext.textContent = current.recommended_next_step;
    if (liveKcrb) {
      liveKcrb.innerHTML = ["keep", "connect", "replace", "build"]
        .map((key) => {
          const label = key.charAt(0).toUpperCase() + key.slice(1);
          const item = (current[key] && current[key][0]) || inferKcrb(key)[0];
          return `<li><strong>${label}</strong><span>${escapeHtml(item)}</span></li>`;
        })
        .join("");
    }
  }

  function escapeHtml(value) {
    return clean(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function advanceFromEntry() {
    state.initialProblem = clean(entryTextarea?.value);
    if (!state.selectedEntry && !state.initialProblem) {
      if (entryError) entryError.textContent = "Pick the closest option or describe what is going on.";
      return;
    }
    if (!state.selectedEntry) state.selectedEntry = "unsure";
    if (entryError) entryError.textContent = "";
    classify();
    updateSensitiveWarning();
    updateLiveBrief();
    track("fit_check_started", {
      selected_entry: state.selectedEntry,
      primary_category: state.primaryCategory,
      plain_text_entered: Boolean(state.initialProblem),
    });
    setScreen("urgency");
  }

  function setUrgency(value) {
    state.urgencyLevel = value;
    classify();
    updateLiveBrief();
    buildQuestionQueue();
    track("fit_check_urgency_selected", {
      urgency_level: value,
      primary_category: state.primaryCategory,
    });
    renderQuestion();
    setScreen("questions");
  }

  function buildQuestionQueue() {
    classify();
    const queue = questionBank[state.primaryCategory] || questionBank["Not Sure Yet"];
    const maxQuestions = state.urgencyLevel === "emergency" ? 3 : 4;
    state.questionQueue = queue.slice(0, maxQuestions);
    state.questionIndex = 0;
  }

  function renderQuestion() {
    const question = state.questionQueue[state.questionIndex];
    if (!question) {
      renderReadback();
      return;
    }

    if (questionHelper) {
      questionHelper.textContent = `${state.questionIndex + 1} of ${state.questionQueue.length}. ${question.helper || "Answer in plain English. Skip if it is not useful."}`;
    }

    const savedValue = state.answers[question.id] || "";
    let control = "";
    if (question.type === "choice") {
      control = `
        <div class="fit-choice-stack" role="group" aria-label="${escapeHtml(question.label)}">
          ${question.options
            .map(
              (option) => `
                <button class="fit-choice ${savedValue === option ? "is-selected" : ""}" type="button" data-fit-answer="${escapeHtml(option)}">
                  ${escapeHtml(option)}
                </button>
              `,
            )
            .join("")}
        </div>
      `;
    } else if (question.type === "text") {
      control = `<input class="fit-input" id="fit-question-input" data-fit-answer-input value="${escapeHtml(savedValue)}" placeholder="${escapeHtml(question.placeholder || "")}">`;
    } else {
      control = `<textarea class="fit-input" id="fit-question-input" data-fit-answer-input rows="5" placeholder="${escapeHtml(question.placeholder || "")}">${escapeHtml(savedValue)}</textarea>`;
    }

    questionMount.innerHTML = `
      <label class="fit-question-label" for="fit-question-input">${escapeHtml(question.label)}</label>
      ${control}
    `;

    questionMount.querySelectorAll("[data-fit-answer]").forEach((button) => {
      button.addEventListener("click", () => {
        state.answers[question.id] = button.dataset.fitAnswer;
        renderQuestion();
      });
    });

    const input = questionMount.querySelector("[data-fit-answer-input]");
    if (input) {
      input.addEventListener("input", () => {
        state.answers[question.id] = input.value;
        updateSensitiveWarning();
      });
    }

    if (questionError) questionError.textContent = "";
  }

  function saveCurrentQuestion({ allowBlank }) {
    const question = state.questionQueue[state.questionIndex];
    if (!question) return true;
    const input = questionMount.querySelector("[data-fit-answer-input]");
    const value = input ? clean(input.value) : clean(state.answers[question.id]);

    if (!value && !allowBlank) {
      if (questionError) questionError.textContent = "Answer this one or use Skip.";
      return false;
    }

    if (value) state.answers[question.id] = value;
    track("fit_check_question_answered", {
      question_id: question.id,
      skipped: !value,
      primary_category: state.primaryCategory,
    });
    return true;
  }

  function nextQuestion() {
    if (!saveCurrentQuestion({ allowBlank: false })) return;
    state.questionIndex += 1;
    classify();
    updateSensitiveWarning();
    updateLiveBrief();
    if (state.questionIndex >= state.questionQueue.length) {
      renderReadback();
    } else {
      renderQuestion();
    }
  }

  function skipQuestion() {
    saveCurrentQuestion({ allowBlank: true });
    state.questionIndex += 1;
    if (state.questionIndex >= state.questionQueue.length) {
      renderReadback();
    } else {
      renderQuestion();
    }
  }

  function previousQuestion() {
    if (state.questionIndex <= 0) {
      setScreen("urgency");
      return;
    }
    state.questionIndex -= 1;
    renderQuestion();
  }

  function renderReadback() {
    const result = classify();
    updateLiveBrief(result);
    updateSensitiveWarning();
    if (readbackSummary) {
      readbackSummary.innerHTML = `
        <p>${escapeHtml(result.client_facing_summary)}</p>
        <div class="fit-readback-grid">
          <span><strong>Likely next move</strong>${escapeHtml(displayCategory(result.primary_category))}</span>
          <span><strong>Ballpark type</strong>${escapeHtml(displayBallpark(result.ballpark_type))}</span>
          <span><strong>Next step</strong>${escapeHtml(result.recommended_next_step)}</span>
        </div>
      `;
    }
    track("fit_check_result_generated", {
      primary_category: result.primary_category,
      urgency_level: result.urgency_level,
      ballpark_type: result.ballpark_type,
    });
    setScreen("readback");
  }

  function contactValue(name) {
    const field = form.querySelector(`[name="${name}"]`);
    return field ? clean(field.value) : "";
  }

  function validateContact() {
    const name = contactValue("name");
    const business = contactValue("business_name");
    const email = contactValue("email");
    const phone = contactValue("phone");
    const consent = form.querySelector('[name="consent_ai_summary"]')?.checked;

    if (!name || !business || (!email && !phone)) {
      if (contactError) {
        contactError.textContent = "Add your name, business, and either email or phone so David can follow up.";
      }
      return false;
    }

    if (!consent) {
      if (contactError) {
        contactError.textContent = "Confirm the AI summary disclosure before sending the brief.";
      }
      return false;
    }

    if (contactError) contactError.textContent = "";
    return true;
  }

  function readCampaign() {
    try {
      const raw = window.sessionStorage.getItem("lifi_campaign_v1");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function buildPayload() {
    return {
      intake_mode: "website",
      source: "fit-check-page",
      page_url: window.location.href,
      selected_entry: state.selectedEntry,
      initial_problem: state.initialProblem,
      urgency_level: state.urgencyLevel,
      answers: {
        ...state.answers,
        selected_entry: state.selectedEntry,
        initial_problem: state.initialProblem,
        urgency_level: state.urgencyLevel,
        preferred_follow_up: contactValue("preferred_follow_up"),
      },
      contact: {
        name: contactValue("name"),
        business: contactValue("business_name"),
        email: contactValue("email"),
        phone: contactValue("phone"),
        preferred_follow_up: contactValue("preferred_follow_up"),
        website: contactValue("website"),
        industry: contactValue("business_type"),
        team_size: contactValue("team_size"),
        location: contactValue("neighborhood"),
      },
      consent_ai_summary: Boolean(form.querySelector('[name="consent_ai_summary"]')?.checked),
      consent_recording: false,
      campaign: readCampaign(),
      events: state.events,
      "bot-field": contactValue("bot-field"),
    };
  }

  function setHidden(name, value) {
    const field = form.querySelector(`[name="${name}"]`);
    if (!field) return;
    field.value = typeof value === "string" ? value : JSON.stringify(value || "");
  }

  function syncHiddenFields(payload, result) {
    const contact = payload.contact || {};
    setHidden("selected_entry", payload.selected_entry);
    setHidden("initial_problem", payload.initial_problem);
    setHidden("urgency_level", payload.urgency_level);
    setHidden("primary_category", result.primary_category);
    setHidden("secondary_categories", (result.secondary_categories || []).join(", "));
    setHidden("recommended_next_step", result.recommended_next_step);
    setHidden("ballpark_type", result.ballpark_type);
    setHidden("ai_client_summary", result.client_facing_summary);
    setHidden("ai_internal_brief", result.internal_summary || "");
    setHidden("follow_up_email_draft", result.follow_up_email?.body || "");
    setHidden("raw_answers_json", payload.answers);
    setHidden("lead_score_json", result.lead_score || {});
    setHidden("tools_mentioned", (result.tools_mentioned || []).join(", "));
    setHidden("messy_now", payload.initial_problem);
    setHidden("current_tools", (result.tools_mentioned || []).join(", "));
    setHidden("business_type", contact.industry || contact.business_type || "");
    setHidden("neighborhood", contact.location || "");
    setHidden("website", contact.website || "");
  }

  async function postJson(url, body) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 18000);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Request failed");
      return await response.json();
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function submitNetlifyBackup(payload, result) {
    syncHiddenFields(payload, result);
    const formData = new FormData(form);
    formData.set("form-name", form.getAttribute("name") || "fit-check");
    formData.set("ai_result_json", JSON.stringify(result));
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString(),
      });
    } catch {
      return false;
    }
    return true;
  }

  function fallbackResult() {
    const result = classify();
    return {
      ...result,
      client_facing_summary: `${result.client_facing_summary} This is not a quote. It is a fast first read based on what you shared. David needs to review the setup before scope, timeline, or pricing can be confirmed.`,
      internal_summary: `Initial problem: ${state.initialProblem}\n\nAnswers:\n${Object.entries(state.answers)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n")}`,
      tools_mentioned: [],
      lead_score: {
        fit: 3,
        urgency: state.urgencyLevel === "emergency" ? 5 : 3,
        budget_clarity: 3,
        system_opportunity: state.primaryCategory === "Business System Build" ? 5 : 2,
        website_opportunity: state.primaryCategory.includes("Website") ? 5 : 2,
        search_opportunity: state.primaryCategory === "Local Search / Visibility" ? 5 : 2,
        tool_opportunity: state.primaryCategory === "Tool / Software Decision" ? 5 : 2,
      },
      follow_up_email: {
        subject: "Re: Little Fight Fit Check",
        body: "Thanks for walking through the setup. David should review the site, tools, and daily work before confirming scope.",
      },
      human_review_flags: ["Fallback local result used"],
      missing_info: [],
    };
  }

  async function submitFitCheck() {
    if (!validateContact()) return;

    const payload = buildPayload();
    let result = fallbackResult();

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Building the brief...";
    }

    track("fit_check_contact_submitted", {
      primary_category: state.primaryCategory,
      urgency_level: state.urgencyLevel,
    });

    try {
      const response = await postJson("/api/fit-check/submit", payload);
      if (response?.ok && response.result) {
        result = response.result;
      }
    } catch {
      result.human_review_flags = [
        ...(result.human_review_flags || []),
        "API unavailable; client-side fallback shown",
      ];
    }

    state.result = result;
    await submitNetlifyBackup(payload, result);
    renderFinalResult(result);
    track("fit_check_lead_saved", {
      primary_category: result.primary_category,
      urgency_level: result.urgency_level,
      ballpark_type: result.ballpark_type,
    });

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Send this to David";
    }
  }

  function renderFinalResult(result) {
    updateLiveBrief(result);
    if (!resultMount) return;

    const checks =
      categoryCopy[result.primary_category]?.firstCheck || categoryCopy["Not Sure Yet"].firstCheck;
    const urgent = result.urgency_level === "emergency";

    resultMount.innerHTML = `
      <div class="fit-result-header">
        <p class="overhaul-kicker">Your likely next move</p>
        <h2>${escapeHtml(displayCategory(result.primary_category))}</h2>
        <p>${escapeHtml(result.client_facing_summary)}</p>
      </div>
      <div class="fit-result-grid">
        <article>
          <h3>What Little Fight would check first</h3>
          <ul>${checks.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </article>
        <article>
          <h3>General next-step type</h3>
          <p>${escapeHtml(displayBallpark(result.ballpark_type))}</p>
          <p>${escapeHtml(result.recommended_next_step)}</p>
        </article>
        <article>
          <h3>What happens next</h3>
          <p>David will review this Fit Check brief before recommending the next move.</p>
          <p class="fit-disclaimer">${escapeHtml(result.disclaimer || "This is not a quote.")}</p>
        </article>
      </div>
      <div class="overhaul-actions">
        <a class="btn-fit" href="${urgent ? "tel:+16463600318" : "/contact/"}">${urgent ? "Call Little Fight" : "Schedule follow-up"}</a>
        <a class="btn-ghost" href="/software-cost-calculator/">Estimate monthly waste</a>
        <button class="btn-ghost" type="button" data-fit-add-detail>Add more detail</button>
      </div>
    `;

    resultMount.querySelector("[data-fit-add-detail]")?.addEventListener("click", () => {
      setScreen("questions");
    });

    setScreen("result");
  }

  optionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedEntry = button.dataset.fitEntry || "";
      optionButtons.forEach((item) => item.classList.toggle("is-selected", item === button));
      advanceFromEntry();
    });
  });

  urgencyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      urgencyButtons.forEach((item) => item.classList.toggle("is-selected", item === button));
      setUrgency(button.dataset.fitUrgency || "planned_improvement");
    });
  });

  entryTextarea?.addEventListener("input", () => {
    state.initialProblem = clean(entryTextarea.value);
    if (state.initialProblem && !state.selectedEntry) state.primaryCategory = "Not Sure Yet";
    updateSensitiveWarning();
  });

  app.querySelector("[data-fit-entry-next]")?.addEventListener("click", advanceFromEntry);
  app.querySelector("[data-fit-question-next]")?.addEventListener("click", nextQuestion);
  app.querySelector("[data-fit-question-skip]")?.addEventListener("click", skipQuestion);
  app.querySelector("[data-fit-question-back]")?.addEventListener("click", previousQuestion);
  app.querySelector("[data-fit-readback-back]")?.addEventListener("click", () => {
    state.questionIndex = Math.max(0, state.questionQueue.length - 1);
    renderQuestion();
    setScreen("questions");
  });
  app.querySelector("[data-fit-readback-next]")?.addEventListener("click", () => {
    setScreen("contact");
  });
  submitButton?.addEventListener("click", submitFitCheck);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitFitCheck();
  });

  updateLiveBrief(fallbackResult());
  setScreen("entry");
})();
