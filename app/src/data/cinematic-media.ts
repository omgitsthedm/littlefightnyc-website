export type CinematicMediaAsset = {
  poster: string;
  mobileSrc: string;
  desktopSrc: string;
  width: number;
  height: number;
};

/**
 * One logo-free, cache-stable film package for every public reference to the
 * cabinetry estimating work. The two encodes share the same 3:4 frame and
 * exact 30-second timeline, so responsive source selection never changes the
 * story or causes layout shift.
 */
export const CABINETRY_PROCESS_FILM: CinematicMediaAsset = {
  poster: "/media/cabinetry-process-poster-c6d59dbc.webp",
  mobileSrc: "/media/cabinetry-process-film-540-1a0bac73.mp4",
  desktopSrc: "/media/cabinetry-process-film-720-3d0d35f6.mp4",
  width: 720,
  height: 960,
};
