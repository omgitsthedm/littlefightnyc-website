export type ProjectMomentum = {
  slug: "venuecircuit" | "public-house-creative";
  name: string;
  image: string;
  imageAlt: string;
  kind: string;
  status: string;
  summary: string;
  startDate: string | null;
  currentState: string;
  latestCompletedMilestone: string;
  lastVerifiedDate: string;
  nextMilestone: string;
  privacyStatus: "public-product" | "approved-private-summary";
  clientApproval: "owner-approved" | "approved-existing-case-scope";
  forecastStatus: "none-published";
  historyMode: "reconstructed";
  historyNote: string;
  milestones: Array<{
    time: string;
    label: string;
    detail: string;
  }>;
};

/**
 * These elapsed times were supplied and approved for publication by Little
 * Fight NYC on 2026-07-24. They are older build histories, not live project
 * trackers. Exact calendar start dates were not supplied, so every record is
 * explicitly marked as reconstructed and cannot be presented as a dated
 * current-work timeline.
 */
export const projectMomentum: ProjectMomentum[] = [
  {
    slug: "venuecircuit",
    name: "VenueCircuit",
    image: "/assets/case-venuecircuit.webp",
    imageAlt: "VenueCircuit's dark venue finance dashboard showing a nightly close",
    kind: "Venue financial software",
    status: "Open beta",
    summary: "A complete venue operating product moved from idea to a working proof.",
    startDate: null,
    currentState: "Supporting",
    latestCompletedMilestone: "Working proof",
    lastVerifiedDate: "2026-07-24",
    nextMilestone: "Continue open-beta support",
    privacyStatus: "public-product",
    clientApproval: "owner-approved",
    forecastStatus: "none-published",
    historyMode: "reconstructed",
    historyNote: "Exact calendar dates are not published.",
    milestones: [
      {
        time: "Start",
        label: "Idea",
        detail: "Name the nightly money problem and the people who need the answer.",
      },
      {
        time: "90 days",
        label: "Working proof",
        detail: "A usable product for closing a night and tracing the numbers.",
      },
    ],
  },
  {
    slug: "public-house-creative",
    name: "Public House Creative",
    image: "/assets/case-public-house-cockpit.webp",
    imageAlt: "Public House Creative's private estimating cockpit with bid data and checks",
    kind: "Private estimating software",
    status: "In production",
    summary: "A real estimating workflow became one owned system, then kept growing.",
    startDate: null,
    currentState: "Supporting",
    latestCompletedMilestone: "Trained model and Version 4",
    lastVerifiedDate: "2026-07-24",
    nextMilestone: "Ongoing production support",
    privacyStatus: "approved-private-summary",
    clientApproval: "approved-existing-case-scope",
    forecastStatus: "none-published",
    historyMode: "reconstructed",
    historyNote: "Exact calendar dates and private system details are not published.",
    milestones: [
      {
        time: "Start",
        label: "Idea",
        detail: "Map the estimating work that lived across documents and spreadsheets.",
      },
      {
        time: "45 days",
        label: "Working proof",
        detail: "The first usable Cockpit put the core estimating path in one place.",
      },
      {
        time: "+45 days",
        label: "Trained model + Version 4",
        detail: "The next build added the trained model and the fourth product version.",
      },
    ],
  },
];

export function canPublishProjectMomentum(project: ProjectMomentum) {
  const hasRequiredRecord =
    project.currentState &&
    project.latestCompletedMilestone &&
    project.lastVerifiedDate &&
    project.nextMilestone &&
    project.privacyStatus &&
    project.clientApproval &&
    project.forecastStatus;
  const hasHonestStart =
    Boolean(project.startDate) ||
    (project.historyMode === "reconstructed" && Boolean(project.historyNote));

  return Boolean(hasRequiredRecord && hasHonestStart);
}

export function getProjectMomentum(slug: string) {
  return projectMomentum.find(
    (project) => project.slug === slug && canPublishProjectMomentum(project),
  );
}
