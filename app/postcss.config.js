import autoprefixer from "autoprefixer";

// Autoprefixer owns vendor prefixing (added 2026-07-14). Before this, prefixes
// were hand-applied and coverage was partial — e.g. ~half the backdrop-filter
// uses lacked -webkit-, so frosted panels didn't blur on Safari. Browserslist
// (in package.json) targets Safari/iOS explicitly so WebKit prefixes emit.
export default {
  plugins: [autoprefixer()],
};
