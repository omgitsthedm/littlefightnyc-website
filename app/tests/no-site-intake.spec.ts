import { expect, test } from "@playwright/test";

test(
  "owners without a website reach a person-first free intake without a URL @chromium-desktop @chromium-mobile @webkit-mobile",
  async ({ page }) => {
    await page.goto("/website-check/");

    const firstLook = page.getByRole("link", { name: "Start a free first look" });
    await expect(firstLook).toHaveAttribute(
      "href",
      "/tech-audit/?intent=website&source=no_website_check",
    );
    await firstLook.click();

    await expect(page).toHaveURL(/\/tech-audit\/\?intent=website&source=no_website_check$/);
    await expect(page.getByRole("heading", { name: "Let’s build your next website." })).toBeVisible();
    await expect(page.getByText("A first website, a rebuild or a better path from followers to customers. Tell David what your business needs; we’ll talk through the scope, timing and cost before you commit.")).toBeVisible();
    const firstLookExample = page.locator('[data-lf-first-look-example="hair-by-rachel-charles"]');
    await expect(firstLookExample).toBeVisible();
    await expect(firstLookExample).toHaveJSProperty("open", false);
    await firstLookExample.getByText("See a first-look example", { exact: true }).click();
    await expect(firstLookExample).toHaveJSProperty("open", true);
    await expect(firstLookExample.getByText("Public work example")).toBeVisible();
    await expect(firstLookExample.getByRole("heading", { name: "Keep the booking system. Make the path clearer." })).toBeVisible();
    await expect(firstLookExample.getByText("Square continued to manage availability.")).toBeVisible();
    await expect(firstLookExample.getByRole("link", { name: "Read Rachel’s public case study" })).toHaveAttribute(
      "href",
      "/case-studies/hair-by-rachel-charles/",
    );
    await expect(page.getByLabel("What are you looking to build or improve?")).toBeVisible();
    await expect(page.getByText("A short brief is enough. If known, add your city, website or social link, budget and launch date. No passwords or private customer data.")).toBeVisible();
    await expect(page.locator('textarea[name="message"]')).toHaveValue("");
    await expect(page.getByRole("button", { name: "Send my website brief" })).toBeVisible();
  },
);

test("support intake keeps the reply path short and validates without a live submission @chromium-desktop", async ({ page }) => {
  await page.goto("/tech-audit/?intent=support&source=accessibility_check");
  const form = page.locator('form[name="tech-audit-scratch"].lf-audit__form');
  await form.waitFor();
  const nameBox = await form.locator('[name="name"]').boundingBox();
  expect(nameBox).not.toBeNull();
  expect(nameBox!.y).toBeLessThan(852);
  const contact = form.locator('[name="contact"]');
  const followUp = form.locator('[name="follow_up"]');
  await expect(form.locator('[name="business"]')).not.toHaveAttribute("required", "");
  await expect(form.getByLabel("Business name (optional)", { exact: true })).toBeVisible();
  await expect(form.locator('select[name="discovery_source"]')).toHaveCount(0);
  await expect(form.locator('input[type="hidden"][name="discovery_source"]')).toHaveValue("");
  await expect(form.locator('[name="website_url"]')).toHaveAttribute("type", "text");
  await expect(form.locator('[name="website_url"]')).toHaveAttribute("inputmode", "url");
  await expect(form.locator(".lf-audit__contact-details")).toContainText("(646) 360-0318");
  await expect(form.locator(".lf-audit__contact-details")).toContainText("hello@littlefightnyc.com");
  await form.locator('button[type="submit"]').click();
  await expect(form.locator("#fit-error-summary")).toContainText("Check these before sending");
  await expect(form.locator("#fit-error-summary")).not.toContainText("Business or idea");
  await expect(form.locator("#fit-name-error, #fit-contact-error, #fit-message-error")).toHaveCount(3);
  await followUp.selectOption("email");
  await expect(contact).toHaveAttribute("type", "email");
  await expect(contact).toHaveAttribute("autocomplete", "email");
  await followUp.selectOption("fastest");
  await expect(contact).toHaveAttribute("type", "text");
  await expect(contact).toHaveAttribute("autocomplete", "off");
  await followUp.selectOption("text");
  await expect(contact).toHaveAttribute("type", "tel");
  await expect(contact).toHaveAttribute("autocomplete", "tel");
  await expect(contact).toHaveAttribute("inputmode", "tel");
  await form.locator('[name="name"]').fill("Local support check");
  await contact.fill("(646) 555-0118");
  await form.locator('[name="message"]').fill("Our printer stopped working.");
  await page.context().setOffline(true);
  await form.locator('button[type="submit"]').click();
  await expect(form.locator(".lf-audit__submit-status")).toContainText(/not sent because you’re offline/i);
  await expect(form.locator(".lf-audit__submit-recovery")).toContainText(/reconnect and try again/i);
  await expect(contact).toHaveValue("(646) 555-0118");
  await expect(form.locator('[name="message"]')).toHaveValue("Our printer stopped working.");
  await page.context().setOffline(false);
});

test("support intake posts only to a local mock after validation @chromium-desktop", async ({ page }) => {
  let postedBody = "";
  await page.route("**/thanks/**", async route => {
    if (route.request().method() === "POST") postedBody = route.request().postData() ?? "";
    await route.fulfill({ status: 200, contentType: "text/html", body: "<main>Local confirmation</main>" });
  });
  await page.goto("/tech-audit/?intent=support&source=local_mock");
  const form = page.locator('form[name="tech-audit-scratch"].lf-audit__form');
  await form.waitFor();
  await form.locator('[name="follow_up"]').selectOption("phone");
  await form.locator('[name="name"]').fill("Local support check");
  await form.locator('[name="contact"]').fill("(646) 555-0118");
  await form.locator('[name="message"]').fill("Our printer stopped working.");
  await Promise.all([
    page.waitForResponse(response => response.request().method() === "POST" && response.url().includes("/thanks/")),
    form.locator('button[type="submit"]').click(),
  ]);
  const body = new URLSearchParams(postedBody);
  expect(body.get("intent")).toBe("support");
  expect(body.get("business")).toBe("");
  expect(body.get("contact")).toBe("(646) 555-0118");
  expect(body.get("follow_up")).toBe("phone");
  expect(body.get("discovery_source")).toBe("");
  await expect(page.getByText("Local confirmation")).toBeVisible();
});

test("support intake keeps the draft through local failures, then retries @chromium-desktop", async ({ page }) => {
  let postAttempts = 0;
  await page.route("**/thanks/**", async route => {
    if (route.request().method() !== "POST") return route.fulfill({ status: 200, contentType: "text/html", body: "<main>Local confirmation</main>" });
    postAttempts += 1;
    if (postAttempts === 1) return route.fulfill({ status: 500, body: "Local failure" });
    if (postAttempts === 2) return route.abort("failed");
    return route.fulfill({ status: 200, body: "accepted locally" });
  });
  await page.goto("/tech-audit/?intent=support&source=local_mock_failure");
  const form = page.locator('form[name="tech-audit-scratch"].lf-audit__form');
  await form.waitFor();
  await form.locator('[name="follow_up"]').selectOption("phone");
  await form.locator('[name="name"]').fill("Local support check");
  await form.locator('[name="contact"]').fill("(646) 555-0118");
  await form.locator('[name="message"]').fill("Our printer stopped working.");
  for (const expectedAttempt of [1, 2]) {
    await form.locator('button[type="submit"]').click();
    await expect.poll(() => postAttempts).toBe(expectedAttempt);
    await expect(form.locator(".lf-audit__submit-status")).toContainText(/not confirmed sent/i);
    await expect(form.locator(".lf-audit__submit-recovery")).toContainText(/reconnect and try again/i);
    await expect(form.locator('[name="contact"]')).toHaveValue("(646) 555-0118");
    await expect(form.locator('[name="message"]')).toHaveValue("Our printer stopped working.");
    expect(await page.evaluate(() => sessionStorage.getItem("lf_tech_audit_submitted"))).toBeNull();
  }
  await form.locator('button[type="submit"]').click();
  await expect.poll(() => postAttempts).toBe(3);
  await expect(page.getByText("Local confirmation")).toBeVisible();
});

test("a BFCache-restored support form retires a stalled request and permits one safe retry @chromium-desktop", async ({ page }) => {
  await page.addInitScript(() => {
    const nativeFetch = window.fetch.bind(window);
    let firstRequest = true;
    window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      const requestUrl = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      const requestMethod = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
      if (firstRequest && requestMethod === "POST" && new URL(requestUrl, window.location.href).pathname === "/thanks/") {
        firstRequest = false;
        return new Promise<Response>(() => {});
      }
      return nativeFetch(input, init);
    }) as typeof fetch;
  });
  await page.route("**/thanks/**", async route => route.fulfill({ status: 200, contentType: "text/html", body: "<main>Local confirmation</main>" }));
  await page.goto("/tech-audit/?intent=support&source=local_bfcache");
  const form = page.locator('form[name="tech-audit-scratch"].lf-audit__form');
  await form.waitFor();
  await form.locator('[name="follow_up"]').selectOption("phone");
  await form.locator('[name="name"]').fill("Local support check");
  await form.locator('[name="contact"]').fill("(646) 555-0118");
  await form.locator('[name="message"]').fill("Our printer stopped working.");
  const submit = form.locator('button[type="submit"]');
  await submit.click();
  await expect(submit).toBeDisabled();
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true })));
  await expect(submit).toBeEnabled();
  expect(await page.evaluate(() => sessionStorage.getItem("lf_tech_audit_submitted"))).toBeNull();
  await expect(form.locator('[name="contact"]')).toHaveValue("(646) 555-0118");
  await submit.click();
  await expect(page.getByText("Local confirmation")).toBeVisible();
});

test("WebMCP stages a first-look request for review without sending or replacing a draft @chromium-desktop", async ({ page }) => {
  const posts: string[] = [];
  await page.addInitScript(() => {
    type Tool = { execute: (input: unknown) => Promise<unknown> };
    Object.defineProperty(document, "modelContext", {
      configurable: true,
      value: {
        registerTool(tool: Tool) {
          (window as Window & { firstLookTool?: Tool }).firstLookTool = tool;
        },
      },
    });
  });
  page.on("request", (request) => {
    if (request.method() === "POST") posts.push(request.url());
  });

  await page.goto("/tech-audit/?intent=website&source=no_website_check");
  await expect.poll(() => page.evaluate(() => Boolean((window as Window & { firstLookTool?: unknown }).firstLookTool))).toBe(true);

  const staged = await page.evaluate(async () => {
    const tool = (window as Window & { firstLookTool: { execute: (input: unknown) => Promise<unknown> } }).firstLookTool;
    return tool.execute({ message: "Please check how customers choose a service and book." });
  });
  expect(staged).toEqual({ status: "ready_for_review" });
  const message = page.locator('textarea[name="message"]');
  await expect(message).toHaveValue("Please check how customers choose a service and book.");
  expect(posts).toEqual([]);

  await message.fill("This is my own draft.");
  const conflict = await page.evaluate(async () => {
    const tool = (window as Window & { firstLookTool: { execute: (input: unknown) => Promise<unknown> } }).firstLookTool;
    return tool.execute({ message: "Replace my draft." });
  });
  expect(conflict).toEqual({ status: "draft_conflict" });
  await expect(message).toHaveValue("This is my own draft.");

  const identical = await page.evaluate(async () => {
    const tool = (window as Window & { firstLookTool: { execute: (input: unknown) => Promise<unknown> } }).firstLookTool;
    return tool.execute({ message: "This is my own draft." });
  });
  expect(identical).toEqual({ status: "ready_for_review" });
  expect(posts).toEqual([]);
});

test(
  "the existing website URL entry remains available at its stable hash @chromium-desktop @chromium-mobile @webkit-mobile",
  async ({ page }) => {
    await page.goto("/website-check/#website-check-url");

    await expect(page.locator("form.lf-website-check__form").getByLabel("Website URL")).toBeVisible();
    await expect(page.getByRole("button", { name: "Check my website" })).toBeVisible();
  },
);

test(
  "the no-site route clears an untouched website template but keeps contact details @chromium-desktop @chromium-mobile @webkit-mobile",
  async ({ page }) => {
    await page.goto("/tech-audit/?intent=website&source=website_check&url=https%3A%2F%2Fexample.com%2F");
    const message = page.locator('textarea[name="message"]');
    await expect(message).not.toHaveValue("");
    await page.getByLabel("Your name").fill("Alex Owner");
    await expect.poll(() => page.evaluate(() => {
      const raw = window.sessionStorage.getItem("lf_tech_audit_draft");
      return raw ? JSON.parse(raw).fields?.name : "";
    })).toBe("Alex Owner");
    await page.goto("/tech-audit/?intent=website&source=no_website_check");

    await expect(page.locator('textarea[name="message"]')).toHaveValue("");
    await expect(page.locator('input[name="symptom"]')).toHaveCount(0);
    await expect(page.locator('input[name="urgency"]')).toHaveCount(0);
    await expect(page.getByLabel("Your name")).toHaveValue("Alex Owner");
  },
);

test(
  "a typed no-site note remains when an owner returns to the first look @chromium-desktop @chromium-mobile @webkit-mobile",
  async ({ page }) => {
    const noSitePath = "/tech-audit/?intent=website&source=no_website_check";
    const note = "Customers find us through referrals and Instagram; we need appointment requests.";

    await page.goto(noSitePath);
    const form = page.locator('form[name="tech-audit-scratch"].lf-audit__form');
    await expect(form).toBeVisible();
    await form.locator('textarea[name="message"]').fill(note);
    await expect.poll(() => page.evaluate(() => {
      const raw = window.sessionStorage.getItem("lf_tech_audit_draft");
      return raw ? JSON.parse(raw).messageDirty : false;
    })).toBe(true);
    await page.goto("/website-check/");
    await page.goto(noSitePath);

    await expect(page.locator('textarea[name="message"]')).toHaveValue(note);
  },
);

test(
  "a typed no-site note survives a reload of the current standalone form @chromium-desktop @chromium-mobile @webkit-mobile",
  async ({ page }) => {
    const noSitePath = "/tech-audit/?intent=website&source=no_website_check";
    const note = "Customers find us through referrals and Instagram; we need appointment requests.";
    await page.goto(noSitePath);
    const form = page.locator('form[name="tech-audit-scratch"].lf-audit__form');
    await expect(form).toBeVisible();
    await form.locator('input[name="name"]').fill("Alex Owner");
    await form.locator('input[name="contact"]').fill("alex@example.com");
    await form.locator('textarea[name="message"]').fill(note);
    await expect.poll(() => page.evaluate(() => {
      const raw = window.sessionStorage.getItem("lf_tech_audit_draft");
      return raw ? JSON.parse(raw).messageDirty : false;
    })).toBe(true);
    await page.reload();
    await expect(form.locator('input[name="name"]')).toHaveValue("Alex Owner");
    await expect(form.locator('input[name="contact"]')).toHaveValue("alex@example.com");
    await expect(form.locator('textarea[name="message"]')).toHaveValue(note);
  },
);


test("human first-look promises reach the intake once with truthful context @all-projects", async ({ page }) => {
  const writes: string[] = [];
  await page.route("**/*", async route => {
    const request = route.request();
    if (!["GET", "HEAD"].includes(request.method())) {
      writes.push(request.url());
      await route.abort();
    } else await route.continue();
  });
  for (const entry of [
    { path: "/", selector: 'a[href="/tech-audit/?intent=website&source=%2F"]', intent: "website", source: "/" },
    { path: "/services/custom-local-websites/", selector: 'a[href="/tech-audit/?intent=website&source=%2Fservices%2Fcustom-local-websites%2F"]', intent: "website", source: "/services/custom-local-websites/" },
    { path: "/services/", selector: 'a[href="/tech-audit/?intent=general&source=%2Fservices%2F"]', intent: "general", source: "/services/" },
  ]) {
    await page.goto(entry.path);
    await page.locator(entry.selector).filter({ visible: true }).first().click();
    await expect(page).toHaveURL(/\/tech-audit\//);
    const form = page.locator('form[name="tech-audit-scratch"].lf-audit__form');
    await expect(form.locator('[name="intent"]')).toHaveValue(entry.intent);
    await expect(form.locator('[name="lead_origin"]')).toHaveValue(entry.source);
    await expect(form.locator('[name="message"]')).toHaveValue("");
    await expect(form.locator('[name="website_url"]')).toHaveValue("");
    await expect(form.locator('[name="symptom"]')).toHaveCount(0);
    const business = form.getByLabel("Business or idea", { exact: true });
    const businessHintId = await business.getAttribute("aria-describedby");
    expect(businessHintId).toMatch(/(?:^|\s)(?:reader-)?fit-business-hint$/);
    await expect(page.locator(`#${businessHintId}`)).toHaveText("No name yet? Tell us what you are starting.");
    await business.fill("A neighborhood repair shop, name undecided");
    await business.blur();
    await expect(business).not.toHaveAttribute("aria-invalid", "true");
    await page.goBack();
    await expect(page).toHaveURL(new RegExp(`${entry.path.replaceAll("/", "\\/")}$`));
  }
  expect(writes).toEqual([]);
});

test("the four service choices fit one comparison on desktop and phone @all-projects", async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/services/", { waitUntil: "networkidle" });
    const chooser = page.locator('nav[aria-label="Service categories"]').filter({ visible: true }).first();
    const links = chooser.getByRole("link");
    await expect(links).toHaveCount(4);
    const box = await chooser.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeLessThanOrEqual(650);
    expect(box!.y).toBeLessThanOrEqual(844);
    for (const [index, slug] of ["custom-local-websites", "it-support", "tech-consulting", "business-systems"].entries()) {
      await expect(links.nth(index)).toHaveAttribute("href", `/services/${slug}/`);
      const target = await links.nth(index).boundingBox();
      expect(target!.height).toBeGreaterThanOrEqual(44);
    }
    await links.first().focus();
    for (let index = 1; index < 4; index += 1) {
      // Safari reserves ordinary Tab for form controls unless full keyboard access is enabled.
      await page.keyboard.press(test.info().project.name.startsWith("webkit") ? "Alt+Tab" : "Tab");
      await expect(links.nth(index)).toBeFocused();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
